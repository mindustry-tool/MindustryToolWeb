import { Response } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { SERVER_IMAGES, SERVER_STATUS_MAP } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { BadRequestException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Server, ServerManager } from '@/generated/prisma/client';
import { SERVER_CACHE_KEYS, SERVER_CONSTANTS } from './server.constants';
import { ServerAuthorityService } from './services/server-authority.service';
import { ServerManagerService } from './services/server-manager.service';
import { ServerRuntimeService } from './services/server-runtime.service';
import { ManagerRpcClient } from './manager-gateway/server-manager-rpc.service';
import { controlDescriptors } from './manager-gateway/descriptors/control.descriptors';
import { fileDescriptors } from './manager-gateway/descriptors/files.descriptors';

@Injectable()
export class ServerService {
  private readonly logger = new Logger(ServerService.name);

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly serverManagerService: ServerManagerService,
    private readonly serverAuthorityService: ServerAuthorityService,
    private readonly serverRuntimeService: ServerRuntimeService,
    private readonly managerRpcClient: ManagerRpcClient,
  ) {}

  // Caching utilities
  async clearServerListCache() {
    for (const k of SERVER_CACHE_KEYS.serverList) {
      await this.cache.del(k).catch(() => {});
    }
  }

  async clearServerCache(id: string) {
    const cacheKey = SERVER_CACHE_KEYS.server(id);
    await this.cache.del(cacheKey);
    await this.clearServerListCache();
  }

  async getServerCached(id: string): Promise<Server & { manager: ServerManager }> {
    return await this.serverAuthorityService.getServerCached(id);
  }

  // Core Server CRUD
  async createServer(body: ApiBody<typeof api.v4.servers.create>, user: Session) {
    const { managerId } = body;

    if (!managerId) {
      throw new BadRequestException('Manager ID is required');
    }

    if (!SERVER_IMAGES.some((item) => item.image === body.image)) {
      throw new BadRequestException('Invalid server image');
    }

    const [manager, ownedServers] = await Promise.all([
      this.prismaService.serverManager.findFirstOrThrow({
        where: {
          id: managerId,
        },
      }),
      this.prismaService.server.count({
        where: {
          createdBy: user.id,
          deletedAt: null,
        },
      }),
    ]);

    const isManagerFreeToUse = manager.isFreeToUse;
    const isManageOwner = manager.createdBy === user.id;
    const isSystemAdmin = hasAccess(user, 'server:manage');

    const port = isManageOwner || isSystemAdmin ? body.port : await this.serverManagerService.freePort(managerId);

    if (!isSystemAdmin) {
      if (isManagerFreeToUse && ownedServers >= 2) {
        throw new BadRequestException('Free to use manager can only create 2 servers');
      }

      if (!isManagerFreeToUse && !isManageOwner) {
        throw new BadRequestException('You are not the owner of the manager');
      }
    }

    this.serverRuntimeService.validateHostCommand(body.hostCommand);

    const result = await this.prismaService.server
      .create({
        data: {
          status: SERVER_STATUS_MAP['OFFLINE'],
          managerId,
          ...body,
          port,
          memory: SERVER_CONSTANTS.DEFAULT_MEMORY_MB,
          cpu: SERVER_CONSTANTS.DEFAULT_CPU,
          isAutoTurnOff: true,
          createdBy: user.id,
          createdAt: new Date(),
          updatedBy: user.id,
          updatedAt: new Date(),
          credit: SERVER_CONSTANTS.DEFAULT_CREDIT,
        },
        include: {
          manager: true,
        },
      })
      .then((server) => ({
        ...server,
        address: this.serverManagerService.extractServerAddress(server.manager.address),
      }));

    await this.clearServerListCache();
    return result;
  }

  async updateServer(id: string, body: ApiBody<typeof api.v4.servers.update>, user: Session) {
    if (!SERVER_IMAGES.some((item) => item.image === body.image)) {
      throw new BadRequestException('Invalid server image');
    }

    const server = await this.prismaService.server.findUniqueOrThrow({
      where: { id, deletedAt: null },
      include: {
        manager: true,
      },
    });

    const managerId = server.managerId;

    if (!managerId) {
      throw new BadRequestException('Manager ID is required');
    }

    const isSystemAdmin = await this.serverAuthorityService.hasServerAccess(user, id, 'server:manage');
    const isServerOwner = server.createdBy === user.id;
    const isManageOwner = server.manager.createdBy === user.id;

    if (!isServerOwner && !isManageOwner && !isSystemAdmin) {
      throw new BadRequestException('You are not the owner of the manager nor server');
    }

    if (!isSystemAdmin && !isManageOwner && body.port && server.port !== body.port) {
      throw new BadRequestException('You are not allowed to change the port');
    }

    if (!!body.port && body.port !== server.port) {
      const serverWithNewPort = await this.prismaService.server.findFirst({
        where: {
          port: body.port,
        },
      });

      if (!!serverWithNewPort && serverWithNewPort.id !== id) {
        throw new BadRequestException(`There already server with port ${body.port} is ${serverWithNewPort.id}`);
      }
    }

    this.serverRuntimeService.validateHostCommand(body.hostCommand);

    const result = await this.prismaService.server
      .update({
        where: {
          id,
        },
        data: {
          ...body,
          updatedBy: user.id,
          updatedAt: new Date(),
        },
        include: {
          manager: true,
        },
      })
      .then((server) => ({
        ...server,
        address: this.serverManagerService.extractServerAddress(server.manager.address),
      }));

    await this.clearServerCache(id);

    void this.serverRuntimeService.pushServerConfigIfRunning(id);

    return result;
  }

  async adminUpdateServer(id: string, body: ApiBody<typeof api.v4.servers.adminUpdate>, user: Session) {
    const result = await this.prismaService.server
      .update({
        where: {
          id,
        },
        data: {
          ...body,
          updatedBy: user.id,
          updatedAt: new Date(),
        },
        include: {
          manager: true,
        },
      })
      .then((server) => ({
        ...server,
        address: this.serverManagerService.extractServerAddress(server.manager.address),
      }));

    await this.clearServerCache(id);

    void this.serverRuntimeService.pushServerConfigIfRunning(id);

    return result;
  }

  async deleteServer(id: string, user: Session) {
    const server = await this.prismaService.server.findFirstOrThrow({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        manager: true,
      },
    });

    await this.clearServerCache(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: [{ authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    if (server.status !== SERVER_STATUS_MAP['OFFLINE']) {
      await this.removeServer(id, user);
    }

    return await this.prismaService.server.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async listServers(query: ApiQuery<typeof api.v4.servers.findAll>) {
    const { page, size } = query;
    const cacheKey = `server-list:${page}:${size}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.prismaService.server
      .findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          managerId: true,
          groupId: true,
          description: true,
          mode: true,
          gamemode: true,
          port: true,
          hostCommand: true,
          avatar: true,
          image: true,
          gameVersion: true,
          players: true,
          status: true,
          mapName: true,
          mods: true,
          isDefault: true,
          isAutoTurnOff: true,
          isOfficial: true,
          isHub: true,
          cpu: true,
          memory: true,
          credit: true,
          manager: {
            select: {
              address: true,
            },
          },
        },
        orderBy: [
          {
            status: 'asc',
          },
          {
            players: 'desc',
          },
          {
            isOfficial: 'desc',
          },
          {
            updatedAt: 'desc',
          },
        ],
        skip: page * size,
        take: size,
      })
      .then((servers) =>
        servers.map(({ manager, ...server }) => ({
          ...server,
          address: this.serverManagerService.extractServerAddress(manager.address),
        })),
      );

    await this.cache.set(cacheKey, result, 5000).catch(() => {});
    return result;
  }

  async findMyServer(query: ApiQuery<typeof api.v4.servers.findMyServer>, user: Session) {
    const { page, size } = query;

    return await this.prismaService.server
      .findMany({
        where: {
          createdBy: user.id,
          deletedAt: null,
        },
        include: {
          manager: true,
        },
        orderBy: {
          status: 'asc',
        },
        skip: page * size,
        take: size,
      })
      .then((servers) =>
        servers.map((server) => ({
          ...server,
          address: this.serverManagerService.extractServerAddress(server.manager.address),
        })),
      );
  }

  async countServers() {
    return await this.prismaService.server.count({
      where: {
        deletedAt: null,
      },
    });
  }

  async getServer(id: string) {
    return await this.prismaService.server
      .findFirstOrThrow({
        where: {
          id,
        },
        include: {
          manager: true,
        },
      })
      .then((server) => ({
        ...server,
        address: this.serverManagerService.extractServerAddress(server.manager.address),
      }));
  }

  async getServerImage(id: string, res: Response) {
    const server = await this.getServerCached(id);

    const stream = await this.managerRpcClient.sendRequest(
      server.managerId,
      fileDescriptors.getImage,
      { serverId: id },
      60_000,
    );

    res.setHeader('Content-Type', 'image/png');
    res.send(this.assertStreamBuffer(stream, 'Manager did not answer get-image with a stream'));
  }

  private assertStreamBuffer(res: unknown, message: string): Buffer {
    if (!Buffer.isBuffer(res)) {
      throw new Error(message);
    }
    return res;
  }

  async removeServer(id: string, user: Session) {
    const server = await this.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    await this.managerRpcClient.sendRequest(server.managerId, controlDescriptors.removeServer, { serverId: id });

    await this.prismaService.server.update({
      where: {
        id: id,
      },
      data: {
        players: 0,
        status: SERVER_STATUS_MAP['OFFLINE'],
        updatedAt: new Date(),
      },
    });
  }

  async transferCredit(id: string, body: ApiBody<typeof api.v4.servers.credit.transfer>, user: Session) {
    const { amount } = body;

    const server = await this.prismaService.server.findUniqueOrThrow({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:setting', { authorId: server?.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    await this.prismaService.$transaction(async (tx) => {
      const creditStat = await tx.userStats.findUnique({
        where: {
          userId_name: {
            userId: user.id,
            name: 'credit',
          },
        },
      });

      const credit = creditStat?.value || 0;

      if (credit < amount) {
        throw new BadRequestException('Insufficient credit');
      }

      await tx.userStats.update({
        where: {
          userId_name: {
            userId: user.id,
            name: 'credit',
          },
        },
        data: {
          value: credit - amount,
        },
      });
      await tx.server.update({
        where: {
          id,
        },
        data: {
          credit: server.credit + amount,
        },
      });
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanUpDeletedServers',
  })
  async cleanUpDeletedServers() {
    try {
      const result = await this.prismaService.server.deleteMany({
        where: {
          deletedAt: {
            lte: new Date(Date.now() - SERVER_CONSTANTS.SERVER_DELETED_AFTER_MS),
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Clean up ${result.count} deleted servers`);
      }
    } catch (error) {
      this.logger.error('Failed to clean up deleted servers', error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'processCredit',
  })
  async processCredit() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    try {
      await this.prismaService.server
        .updateMany({
          where: {
            status: {
              in: [SERVER_STATUS_MAP['ONLINE'], SERVER_STATUS_MAP['PAUSED'], SERVER_STATUS_MAP['STOP']],
            },
            deletedAt: null,
            isOfficial: false,
            credit: {
              gt: 0,
            },
          },
          data: {
            credit: {
              decrement: 1,
            },
          },
        })
        .catch((error) => this.logger.error('Failed to process credit', error));

      const servers = await this.prismaService.server.findMany({
        where: {
          status: {
            in: [SERVER_STATUS_MAP['ONLINE'], SERVER_STATUS_MAP['PAUSED'], SERVER_STATUS_MAP['STOP']],
          },
          deletedAt: null,
          isOfficial: false,
          credit: {
            lte: 0,
          },
        },
        include: {
          manager: true,
        },
      });

      for (const server of servers) {
        if (!server.managerId) continue;
        this.managerRpcClient
          .sendRequest(server.managerId, controlDescriptors.removeServer, { serverId: server.id })
          .then(() => this.logger.log(`Remove server ${server.id}, out of credit`))
          .catch((error) => this.logger.error(`Failed to remove server ${server.id}`, error));
      }
    } catch (error) {
      this.logger.error('Failed to process credit', error);
    }
  }
}
