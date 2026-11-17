import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CommunityServerSnapshotService {
  private readonly logger = new Logger(CommunityServerSnapshotService.name);
  private isRecording = false;

  constructor(private readonly prisma: PrismaService) {}

  // Cron every 5 minutes
  @Cron('*/5 * * * *')
  async handlePeriodicSnapshot() {
    await this.recordSnapshots();
  }

  async recordSnapshots(): Promise<void> {
    if (this.isRecording) {
      return;
    }

    this.isRecording = true;
    try {
      const now = new Date();

      // 1. Record server-level snapshots
      const activeServers = await this.prisma.communityServer.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          players: true,
          ping: true,
          isOnline: true,
        },
      });

      if (activeServers.length > 0) {
        await this.prisma.communityServerSnapshot.createMany({
          data: activeServers.map((server) => ({
            serverId: server.id,
            players: server.players,
            ping: server.ping,
            isOnline: server.isOnline,
            createdAt: now,
          })),
        });
      }

      // 2. Record group-level snapshots
      const activeGroups = await this.prisma.communityServerGroup.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          totalPlayers: true,
          servers: {
            where: {
              deletedAt: null,
              isOnline: true,
            },
            select: { id: true },
          },
        },
      });

      if (activeGroups.length > 0) {
        await this.prisma.communityGroupSnapshot.createMany({
          data: activeGroups.map((group) => ({
            groupId: group.id,
            totalPlayers: group.totalPlayers,
            activeServers: group.servers.length,
            createdAt: now,
          })),
        });
      }
    } catch (err) {
      this.logger.error('Failed to record community server snapshots:', err);
    } finally {
      this.isRecording = false;
    }
  }
}
