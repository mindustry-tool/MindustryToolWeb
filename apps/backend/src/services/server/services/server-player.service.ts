import { PrismaService } from '@/prisma/prisma.service';
import { generateSessionToken } from '@/utils/auth.utils';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery, ApiResult } from '@mindustry-tool/api';
import { LoginDto, Session } from '@mindustry-tool/api';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SERVER_CONSTANTS } from '../server.constants';
import { ServerAuthorityService } from './server-authority.service';
import { ServerManagerService } from './server-manager.service';
import { ManagerRpcClient } from '../manager-gateway/server-manager-rpc.service';
import { playerDescriptors } from '../manager-gateway/descriptors/players.descriptors';

@Injectable()
export class ServerPlayerService {
  private readonly logger = new Logger(ServerPlayerService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly serverAuthorityService: ServerAuthorityService,
    private readonly serverManagerService: ServerManagerService,
    private readonly configService: ConfigService,
    private readonly managerRpcClient: ManagerRpcClient,
  ) {}

  async getPlayers(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:dashboard', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(server.managerId, playerDescriptors.getPlayers, { serverId: id });
  }

  async getPlayerInfos(id: string, query: ApiQuery<typeof api.v4.servers.players.getPlayerInfos>, user: Session) {
    const { page, size, banned, filter } = query;

    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:dashboard', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(server.managerId, playerDescriptors.getPlayerInfos, {
      serverId: id,
      page,
      size,
      banned,
      filter,
    });
  }

  async getRecentPlayers(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(server.managerId, playerDescriptors.getRecentPlayers, { serverId: id });
  }

  async getKickedIps(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(server.managerId, playerDescriptors.getKickedIps, { serverId: id });
  }

  async removeKickedIp(id: string, ip: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(server.managerId, playerDescriptors.deleteKickedIp, {
      serverId: id,
      ip,
    });
  }

  async login(id: string, body: ApiBody<typeof api.v4.servers.login>): Promise<ApiResult<typeof api.v4.servers.login>> {
    const { uuid, ip, name } = body;

    const server = await this.serverAuthorityService.getServerCached(id);

    const player = await this.prismaService.serverPlayer.findFirst({
      where: {
        uuid,
        ip,
      },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (player) {
      const session = { ...player.user, roles: player.user.roles.map((role) => role.role), stats: {} };

      const isAdmin = await this.serverAuthorityService.hasServerAccess(session, id, {
        any: ['server:ingame-admin', { authorId: server.createdBy }],
      });

      if (isAdmin) {
        this.logger.log(`${JSON.stringify(session)} logged in as admin in server ${server.name}`);
      }

      return {
        userId: player.user.id,
        uuid,
        name: session.name,
        isAdmin,
        loginLink: undefined,
      };
    }

    const token = generateSessionToken();

    await this.prismaService.serverLoginToken.create({
      data: {
        id: token,
        serverId: server.id,
        token,
        ip,
        name,
        uuid,
        createdAt: new Date(),
      },
    });

    return {
      uuid,
      name,
      isAdmin: false,
      loginLink: `${this.configService.getOrThrow<string>('url.frontend')}/login/${token}`,
    };
  }

  async verifyLogin(token: string, user: Session): Promise<ApiResult<typeof api.v4.servers.verifyLogin>> {
    const serverLoginToken = await this.prismaService.serverLoginToken.findFirst({
      where: {
        id: token,
      },
    });

    if (!serverLoginToken) {
      throw new NotFoundException('Token not found');
    }

    if (serverLoginToken.createdAt.getTime() + SERVER_CONSTANTS.LOGIN_TOKEN_EXPIRE_AFTER_MS < Date.now()) {
      throw new BadRequestException('Token expired');
    }

    const server = await this.serverAuthorityService.getServerCached(serverLoginToken.serverId);

    const { uuid, ip, name } = serverLoginToken;

    const player = await this.prismaService.serverPlayer.findFirst({
      where: {
        uuid,
        ip,
      },
    });

    const isAdmin = await this.serverAuthorityService.hasServerAccess(user, server.id, {
      any: ['server:ingame-admin', { authorId: server.createdBy }],
    });

    if (isAdmin) {
      this.logger.log(`${JSON.stringify(user)} logged in as admin in server ${server.name}`);
    }

    let body: LoginDto;

    if (player) {
      body = {
        ...player,
        name: user.name,
        isAdmin,
        userId: user.id,
      };
    } else {
      const result = await this.prismaService.serverPlayer.create({
        data: {
          userId: user.id,
          name,
          uuid: uuid,
          ip: ip,
          createdAt: new Date(),
        },
      });

      body = {
        ...result,
        name: user.name,
        isAdmin,
      };
    }

    await this.managerRpcClient.sendRequest(server.managerId, playerDescriptors.updatePlayer, {
      serverId: server.id,
      uuid,
      player: body,
    });

    await this.prismaService.serverLoginToken.delete({
      where: {
        id: token,
      },
    });

    return 'Success';
  }

  async loginToken(token: string) {
    return await this.prismaService.serverLoginToken.findFirstOrThrow({
      where: {
        id: token,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanUpLoginTokens',
  })
  async cleanUpLoginTokens() {
    try {
      const result = await this.prismaService.serverLoginToken.deleteMany({
        where: {
          createdAt: {
            lte: new Date(Date.now() - SERVER_CONSTANTS.LOGIN_TOKEN_EXPIRE_AFTER_MS),
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Clean up ${result.count} login tokens`);
      }
    } catch (error) {
      this.logger.error(`Failed to clean up login tokens`, error);
    }
  }
}
