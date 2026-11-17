import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CommunityServerDto, CommunityServerGroupDto, CommunityServerQuery, CommunityServerSnapshotDto } from '@mindustry-tool/api';

@Injectable()
export class CommunityServerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CommunityServerQuery): Promise<CommunityServerDto[]> {
    const page = query.page ?? 0;
    const size = query.size ?? 30;
    const skip = page * size;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (query.channel) {
      where.channels = {
        has: query.channel,
      };
    }

    if (query.gamemode) {
      where.gamemode = {
        equals: query.gamemode,
        mode: 'insensitive',
      };
    }

    if (query.countryCode) {
      where.countryCode = {
        equals: query.countryCode.toUpperCase(),
      };
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { cleanName: { contains: q, mode: 'insensitive' } },
        { serverName: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { group: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    let orderBy: Record<string, unknown>[];

    if (query.sort === 'name') {
      orderBy = [
        { group: { name: query.order ?? 'asc' } },
        { isOnline: 'desc' },
        { players: 'desc' },
        { cleanName: 'asc' },
      ];
    } else {
      // Default: sort by server group totalPlayers
      orderBy = [
        { group: { totalPlayers: query.order ?? 'desc' } },
        { group: { name: 'asc' } },
        { isOnline: 'desc' },
        { players: 'desc' },
        { cleanName: 'asc' },
      ];
    }

    // Include the last 24 snapshots for immediate sparkline display
    const servers = await this.prisma.communityServer.findMany({
      where,
      orderBy,
      skip,
      take: size,
      include: {
        group: {
          select: {
            name: true,
            totalPlayers: true,
            serverCount: true,
          },
        },
        snapshots: {
          take: 24,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            serverId: true,
            players: true,
            ping: true,
            isOnline: true,
            createdAt: true,
          },
        },
      },
    });

    return servers.map((server) => ({
      id: server.id,
      groupId: server.groupId,
      groupName: server.group.name,
      groupTotalPlayers: server.group.totalPlayers,
      groupServerCount: server.group.serverCount,
      address: server.address,
      host: server.host,
      port: server.port,
      channels: server.channels,
      countryCode: server.countryCode,
      isOnline: server.isOnline,
      ping: server.ping,
      serverName: server.serverName,
      cleanName: server.cleanName,
      mapName: server.mapName,
      gamemode: server.gamemode,
      wave: server.wave,
      players: server.players,
      playerLimit: server.playerLimit,
      version: server.version,
      description: server.description,
      isHub: server.isHub,
      lastPingAt: server.lastPingAt ? server.lastPingAt.toISOString() : null,
      snapshots: server.snapshots
        .map((s) => ({
          id: s.id,
          serverId: s.serverId,
          players: s.players,
          ping: s.ping,
          isOnline: s.isOnline,
          createdAt: s.createdAt.toISOString(),
        }))
        .reverse(), // chronological order
    }));
  }

  async getHistory(serverId: string): Promise<CommunityServerSnapshotDto[]> {
    const server = await this.prisma.communityServer.findUnique({
      where: { id: serverId },
      select: { id: true },
    });

    if (!server) {
      throw new NotFoundException(`Community server ${serverId} not found`);
    }

    const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const snapshots = await this.prisma.communityServerSnapshot.findMany({
      where: {
        serverId,
        createdAt: {
          gte: past24Hours,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        serverId: true,
        players: true,
        ping: true,
        isOnline: true,
        createdAt: true,
      },
    });

    return snapshots.map((s) => ({
      id: s.id,
      serverId: s.serverId,
      players: s.players,
      ping: s.ping,
      isOnline: s.isOnline,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async findGroups(): Promise<CommunityServerGroupDto[]> {
    const groups = await this.prisma.communityServerGroup.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        totalPlayers: 'desc',
      },
      take: 100,
    });

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      channels: g.channels,
      totalPlayers: g.totalPlayers,
      serverCount: g.serverCount,
      lastSeenAt: g.lastSeenAt.toISOString(),
    }));
  }
}
