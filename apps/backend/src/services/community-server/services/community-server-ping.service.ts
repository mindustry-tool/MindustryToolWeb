import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import PQueue from 'p-queue';
import { PrismaService } from '@/prisma/prisma.service';
import { pingMindustryServer } from '../utils/mindustry-ping';

@Injectable()
export class CommunityServerPingService {
  private readonly logger = new Logger(CommunityServerPingService.name);
  private isPinging = false;

  constructor(private readonly prisma: PrismaService) {}

  // Cron every 2 minutes
  @Cron('*/2 * * * *')
  async handlePeriodicPing() {
    await this.pingAllActiveServers();
  }

  async pingAllActiveServers(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
        
    if (this.isPinging) {
      this.logger.warn('Previous ping cycle still in progress, skipping...');
      return;
    }

    this.isPinging = true;
    try {
      const activeServers = await this.prisma.communityServer.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          groupId: true,
          host: true,
          port: true,
          address: true,
        },
      });

      if (activeServers.length === 0) {
        return;
      }

      const queue = new PQueue({ concurrency: 4 });
      const now = new Date();

      // Group totals accumulator: groupId -> sum of players of non-hub servers
      const groupPlayerCounts = new Map<string, number>();

      await queue.addAll(
        activeServers.map((server) => async () => {
          try {
            const res = await pingMindustryServer(server.host, server.port, 2500);

            await this.prisma.communityServer.update({
              where: { id: server.id },
              data: {
                isOnline: res.isOnline,
                ping: res.ping,
                serverName: res.serverName,
                cleanName: res.cleanName,
                mapName: res.mapName,
                gamemode: res.gamemode,
                wave: res.wave,
                players: res.players,
                playerLimit: res.playerLimit,
                version: res.version,
                description: res.description,
                isHub: res.isHub,
                lastPingAt: now,
              },
            });

            // If server is online and NOT a hub, contribute to group player sum
            if (res.isOnline && !res.isHub) {
              const currentSum = groupPlayerCounts.get(server.groupId) || 0;
              groupPlayerCounts.set(server.groupId, currentSum + res.players);
            }
          } catch (err) {
            this.logger.error(`Failed to ping community server ${server.address}:`, err);
          }
        }),
      );

      // Reconcile group total players
      // Ensure all groups that had servers pinged get their total updated
      const groupIds = Array.from(new Set(activeServers.map((s) => s.groupId)));
      for (const groupId of groupIds) {
        const totalPlayers = groupPlayerCounts.get(groupId) || 0;
        await this.prisma.communityServerGroup.update({
          where: { id: groupId },
          data: { totalPlayers },
        });
      }
    } catch (err) {
      this.logger.error('Error during community server ping cycle:', err);
    } finally {
      this.isPinging = false;
    }
  }
}
