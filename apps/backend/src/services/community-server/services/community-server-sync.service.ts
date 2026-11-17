import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { lookupCountryCode, resolveHostToIp } from '../utils/geoip.util';

interface GitHubServerGroup {
  name: string;
  address: string[];
}

const GITHUB_SERVERS_V8 =
  'https://raw.githubusercontent.com/Anuken/MindustryServerList/main/servers_v8.json';
const GITHUB_SERVERS_BE =
  'https://raw.githubusercontent.com/Anuken/MindustryServerList/main/servers_be.json';

@Injectable()
export class CommunityServerSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CommunityServerSyncService.name);
  private isSyncing = false;

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    // Run an initial sync on startup if table is empty
    try {
      const count = await this.prisma.communityServer.count();
      if (count === 0) {
        this.logger.log('No community servers found in database, triggering initial GitHub sync...');
        await this.syncFromGitHub();
      }
    } catch (err) {
      this.logger.error('Failed to run initial community server check:', err);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlySync() {
    await this.syncFromGitHub();
  }

  async syncFromGitHub(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('GitHub sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting hourly community server synchronization from GitHub...');

    try {
      const [v8Groups, beGroups] = await Promise.all([
        this.fetchJson<GitHubServerGroup[]>(GITHUB_SERVERS_V8).catch((err) => {
          this.logger.error('Failed to fetch servers_v8.json:', err);
          return [] as GitHubServerGroup[];
        }),
        this.fetchJson<GitHubServerGroup[]>(GITHUB_SERVERS_BE).catch((err) => {
          this.logger.error('Failed to fetch servers_be.json:', err);
          return [] as GitHubServerGroup[];
        }),
      ]);

      const now = new Date();
      const allActiveAddresses = new Set<string>();

      // Map: normalized group name -> { name, channels, addresses: Map<address, channels> }
      const groupMap = new Map<
        string,
        {
          name: string;
          channels: Set<string>;
          addresses: Map<string, Set<string>>;
        }
      >();

      const processList = (groups: GitHubServerGroup[], channel: string) => {
        for (const item of groups) {
          if (!item.name || !Array.isArray(item.address)) continue;
          const trimmedGroupName = item.name.trim();
          if (!trimmedGroupName) continue;

          let entry = groupMap.get(trimmedGroupName);
          if (!entry) {
            entry = {
              name: trimmedGroupName,
              channels: new Set<string>(),
              addresses: new Map<string, Set<string>>(),
            };
            groupMap.set(trimmedGroupName, entry);
          }
          entry.channels.add(channel);

          for (const rawAddr of item.address) {
            const trimmedAddr = rawAddr.trim();
            if (!trimmedAddr) continue;
            allActiveAddresses.add(trimmedAddr);

            let addrChannels = entry.addresses.get(trimmedAddr);
            if (!addrChannels) {
              addrChannels = new Set<string>();
              entry.addresses.set(trimmedAddr, addrChannels);
            }
            addrChannels.add(channel);
          }
        }
      };

      processList(v8Groups, 'v8');
      processList(beGroups, 'be');

      // Reconcile into PostgreSQL
      for (const [, groupData] of groupMap) {
        const groupRecord = await this.prisma.communityServerGroup.upsert({
          where: { name: groupData.name },
          update: {
            channels: Array.from(groupData.channels),
            serverCount: groupData.addresses.size,
            lastSeenAt: now,
            deletedAt: null,
          },
          create: {
            name: groupData.name,
            channels: Array.from(groupData.channels),
            serverCount: groupData.addresses.size,
            lastSeenAt: now,
          },
        });

        for (const [address, addrChannels] of groupData.addresses) {
          const { host, port } = this.parseAddress(address);
          const resolvedIp = await resolveHostToIp(host);
          const countryCode = lookupCountryCode(resolvedIp);

          await this.prisma.communityServer.upsert({
            where: { address },
            update: {
              groupId: groupRecord.id,
              host,
              port,
              channels: Array.from(addrChannels),
              resolvedIp: resolvedIp ?? undefined,
              countryCode: countryCode ?? undefined,
              lastSeenAt: now,
              deletedAt: null, // Un-delete if reappeared
            },
            create: {
              groupId: groupRecord.id,
              address,
              host,
              port,
              channels: Array.from(addrChannels),
              resolvedIp: resolvedIp ?? null,
              countryCode: countryCode ?? null,
              lastSeenAt: now,
            },
          });
        }
      }

      // 1. Soft-delete servers removed from GitHub list
      if (allActiveAddresses.size > 0) {
        const softDeleteResult = await this.prisma.communityServer.updateMany({
          where: {
            address: { notIn: Array.from(allActiveAddresses) },
            deletedAt: null,
          },
          data: {
            deletedAt: now,
            isOnline: false,
          },
        });
        if (softDeleteResult.count > 0) {
          this.logger.log(`Soft-deleted ${softDeleteResult.count} community servers removed from GitHub.`);
        }
      }

      // 2. Hard-delete servers soft-deleted for more than 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const hardDeleteResult = await this.prisma.communityServer.deleteMany({
        where: {
          deletedAt: {
            lt: sevenDaysAgo,
          },
        },
      });
      if (hardDeleteResult.count > 0) {
        this.logger.log(`Hard-deleted ${hardDeleteResult.count} community servers older than 7 days.`);
      }

      // Also clean up groups with no servers that have been soft-deleted for > 7 days
      await this.prisma.communityServerGroup.deleteMany({
        where: {
          deletedAt: {
            lt: sevenDaysAgo,
          },
          servers: {
            none: {},
          },
        },
      });

      // 3. Prune historical snapshots older than 7 days
      const serverSnapshotsPruned = await this.prisma.communityServerSnapshot.deleteMany({
        where: {
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });
      const groupSnapshotsPruned = await this.prisma.communityGroupSnapshot.deleteMany({
        where: {
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });
      if (serverSnapshotsPruned.count > 0 || groupSnapshotsPruned.count > 0) {
        this.logger.log(
          `Pruned old snapshots older than 7 days: ${serverSnapshotsPruned.count} server, ${groupSnapshotsPruned.count} group.`,
        );
      }

      this.logger.log('Hourly community server synchronization complete.');
    } catch (err) {
      this.logger.error('Error during community server sync:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  private parseAddress(address: string): { host: string; port: number } {
    const parts = address.split(':');
    if (parts.length === 2) {
      const portNum = parseInt(parts[1], 10);
      return {
        host: parts[0],
        port: Number.isNaN(portNum) ? 6567 : portNum,
      };
    }
    return {
      host: address,
      port: 6567,
    };
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MindustryToolWeb-ServerSync/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }
}
