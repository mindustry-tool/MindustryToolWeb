import { PrismaService } from '@/prisma/prisma.service';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { Sse } from '@/types/sse';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiResult } from '@mindustry-tool/api';
import { parseServerEvent, serverStateSchema, serverUsageDtoSchema, ServerConfig, ServerState, Session } from '@mindustry-tool/api';
import { SERVER_STATUS_MAP, SERVER_STATUSES } from '@mindustry-tool/api';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Server, ServerManager } from '@/generated/prisma/client';
import { SERVER_CACHE_KEYS, SERVER_CONSTANTS } from '../server.constants';
import { ServerAuthorityService } from './server-authority.service';
import { ServerLogService } from './server-log.service';
import { ServerManagerService } from './server-manager.service';
import { ServerWebhookService } from './server-webhook.service';
import { ManagerRpcClient } from '../manager-gateway/server-manager-rpc.service';
import { TIMEOUT_SHORT_MS, SubscriptionHandle } from '../manager-gateway/channel/rpc-channel';
import { controlDescriptors } from '../manager-gateway/descriptors/control.descriptors';

@Injectable()
export class ServerRuntimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ServerRuntimeService.name);

  private readonly serverStateListeners = new Map<string, Array<(event: ServerState) => void>>();
  private readonly lastServerStateDbWrite = new Map<string, number>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly prometheusService: PrometheusService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly serverManagerService: ServerManagerService,
    private readonly serverAuthorityService: ServerAuthorityService,
    private readonly serverLogService: ServerLogService,
    private readonly serverWebhookService: ServerWebhookService,
    private readonly managerRpcClient: ManagerRpcClient,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Set all servers to OFFLINE');

      await this.prismaService.server
        .updateMany({
          data: {
            status: SERVER_STATUS_MAP['OFFLINE'],
            players: 0,
          },
        })
        .catch((error) => this.logger.error('Failed to set all servers to OFFLINE', error));
    }

    this.managerRpcClient.onEvent((_managerId, payload) => {
      this.handleEvent(payload).catch((error) => this.logger.error(`Failed to handle event: ${String(error)}`, error));
    });
  }

  onModuleDestroy() {
    // Nothing to tear down — gateway lifetime is managed by the WS server
  }

  private async clearServerCache(id: string) {
    await this.cache.del(SERVER_CACHE_KEYS.server(id));
    for (const k of SERVER_CACHE_KEYS.serverList) {
      await this.cache.del(k).catch(() => {});
    }
  }

  validateHostCommand(command?: string | null) {
    if (!command) {
      return;
    }

    const hacky = [
      'ProcessBuilder',
      'exec',
      'eval',
      'ScriptEngineManager',
      'Class.forName',
      'child_process',
      'sh',
      'forName',
      'require',
      'evaluate',
      'Runtime',
    ].map((item) => item.toLowerCase());

    const keywords = command.split(' ').map((item) => item.toLowerCase());

    if (keywords.length > 0 && keywords.some((item) => hacky.includes(item))) {
      throw new ForbiddenException('No hacky');
    }
  }

  async handleSyncState(payload: unknown) {
    if (!Array.isArray(payload)) {
      return;
    }

    let states: ServerState[];
    try {
      states = payload.map((item) => serverStateSchema.parse(item));
    } catch (error) {
      this.logger.warn(`Failed to parse server-state payload: ${String(error)}`);
      return;
    }

    for (const state of states) {
      const statusCode = SERVER_STATUS_MAP[state.status];
      const cacheKey = SERVER_CACHE_KEYS.server(state.serverId);

      let server = (await this.cache.get<Server & { manager: ServerManager }>(cacheKey)) ?? undefined;
      if (!server) {
        try {
          const fetched = await this.prismaService.server.findFirst({
            where: { id: state.serverId, deletedAt: null },
            include: { manager: true },
          });
          if (fetched) {
            server = fetched;
          }
        } catch (e) {
          this.logger.error(`Failed to fetch server ${state.serverId}`, e);
        }
      }

      const newMods = state.mods.map((mod) => mod.name + ':' + mod.meta.version);
      const now = Date.now();
      const lastWrite = this.lastServerStateDbWrite.get(state.serverId) || 0;
      const statusChanged = !server || server.status !== statusCode;
      const shouldWriteDb = statusChanged || now - lastWrite > 15_000;

      let result: Server & { manager: ServerManager };

      if (shouldWriteDb && server) {
        result = await this.prismaService.server.update({
          where: {
            id: state.serverId,
          },
          data: {
            status: statusCode,
            players: state.players.length,
            mapName: state.mapName,
            mods: newMods,
            updatedAt: new Date(),
          },
          include: {
            manager: true,
          },
        });
        this.lastServerStateDbWrite.set(state.serverId, now);
      } else if (server) {
        result = {
          ...server,
          status: statusCode,
          players: state.players.length,
          mapName: state.mapName,
          mods: newMods,
          updatedAt: new Date(),
        };
      } else {
        continue;
      }

      await this.cache.set(cacheKey, result, SERVER_CONSTANTS.SERVER_CACHE_EXPIRE_AFTER_MS);

      this.prometheusService.serverPlayerGauge.set(
        {
          server: result.name,
        },
        state.players.length,
      );

      const listeners = this.serverStateListeners.get(state.serverId) || [];

      for (const listener of listeners) {
        listener(state);
      }
    }
  }

  async handleEvent(data: unknown) {
    try {
      if (typeof data !== 'object' || data === null) {
        this.logger.warn('Received non-object event payload; dropping');
        return;
      }

      const event = parseServerEvent(data as Record<string, unknown>);

      if (event.name !== 'server-state' && event.serverId) {
        this.serverWebhookService
          .handleWebhookEvent(event)
          .catch((error) => this.logger.error(`Failed to handle webhook event for server ${event.serverId}`, error));
      }

      switch (event.name) {
        case 'log': {
          this.serverLogService.sendLog(event);
          break;
        }

        case 'server-state': {
          await this.handleSyncState(event.state);
          break;
        }

        case 'disconnect': {
          const server = await this.prismaService.server.update({
            where: {
              id: event.serverId,
            },
            data: {
              players: 0,
              status: SERVER_STATUS_MAP['DISCONNECT'],
              updatedAt: new Date(),
            },
          });

          await this.clearServerCache(event.serverId);

          this.serverLogService.sendLog({
            ...event,
            name: 'log',
            level: 'info',
            data: `[red]Server disconnect`,
          });

          await this.serverWebhookService.sendDefaultDiscordEmbeds(server, event, 0xf59e0b, [
            { name: 'Status', value: SERVER_STATUSES[server.status], inline: false },
            { name: 'Created At', value: new Date(event.createdAt).toISOString(), inline: false },
          ]);

          break;
        }

        case 'stop': {
          const result = await this.prismaService.server.updateMany({
            where: {
              id: event.serverId,
              status: { not: SERVER_STATUS_MAP['OFFLINE'] },
            },
            data: {
              players: 0,
              status: SERVER_STATUS_MAP['OFFLINE'],
              updatedAt: new Date(),
            },
          });

          await this.clearServerCache(event.serverId);

          if (result.count > 0) {
            this.serverLogService.sendLog({
              ...event,
              name: 'log',
              level: 'info',
              data: `[red]Server stoped, reason: ${event.reason}`,
            });
          }

          const server = await this.serverAuthorityService.getServerCached(event.serverId);

          this.prometheusService.serverPlayerGauge.set(
            {
              server: server.name,
            },
            0,
          );

          if (result.count > 0) {
            await this.serverWebhookService.sendDefaultDiscordEmbeds(server, event, 0xef4444, [
              { name: 'Status', value: SERVER_STATUSES[server.status], inline: false },
              { name: 'Reason', value: event.reason, inline: false },
              { name: 'Created At', value: new Date(event.createdAt).toISOString(), inline: false },
            ]);
          }

          break;
        }

        case 'start': {
          const server = await this.prismaService.server.update({
            where: {
              id: event.serverId,
            },
            data: {
              status: SERVER_STATUS_MAP['ONLINE'],
              updatedAt: new Date(),
            },
          });

          await this.clearServerCache(event.serverId);

          await this.serverWebhookService.sendDefaultDiscordEmbeds(server, event, 0x22c55e, [
            { name: 'Status', value: SERVER_STATUSES[server.status], inline: false },
            { name: 'Created At', value: new Date(event.createdAt).toISOString(), inline: false },
          ]);

          break;
        }

        case 'player-join': {
          const server = await this.serverAuthorityService.getServerCached(event.serverId);

          this.prometheusService.playerGauge.inc({
            server: server.name,
          });
          break;
        }

        default:
          break;
      }
    } catch (e) {
      this.logger.error('Failed to handle server event', e);
    }
  }

  async sendCommand(id: string, command: ApiBody<typeof api.v4.servers.commands.send>, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:console', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    await this.managerRpcClient.sendRequest(
      server.managerId,
      controlDescriptors.sendCommand,
      { serverId: id, command: [command.command] },
      TIMEOUT_SHORT_MS,
    );
  }

  async pause(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:console', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(server.managerId, controlDescriptors.pause, { serverId: id }, 10_000);
  }

  async sendChat(id: string, content: string) {
    const server = await this.serverAuthorityService.getServerCached(id);

    await this.managerRpcClient.sendRequest(
      server.managerId,
      controlDescriptors.sendChat,
      { serverId: id, message: content },
      TIMEOUT_SHORT_MS,
    );
  }

  async getAllCommands(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:console', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(
      server.managerId,
      controlDescriptors.getCommands,
      { serverId: id },
      TIMEOUT_SHORT_MS,
    );
  }

  async assertServerStateAccess(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }, 'server:dashboard'],
      }))
    ) {
      throw new ForbiddenException();
    }
  }

  async getServerState(
    id: string,
    next: (data: ApiResult<typeof api.v4.servers.state>) => void,
    sse: Sse,
    user: Session,
  ) {
    await this.assertServerStateAccess(id, user);

    const listeners = this.serverStateListeners.get(id) || [];
    listeners.push(next);
    this.serverStateListeners.set(id, listeners);

    sse.onClose(() => {
      const currentListeners = this.serverStateListeners.get(id) || [];
      const newListeners = currentListeners.filter((listener) => listener !== next);
      if (newListeners.length === 0) {
        this.serverStateListeners.delete(id);
      } else {
        this.serverStateListeners.set(id, newListeners);
      }
    });
  }

  async getServerUsage(
    id: string,
    next: (data: ApiResult<typeof api.v4.servers.usage>) => void,
    sse: Sse,
    user: Session,
  ) {
    try {
      await this.assertServerStateAccess(id, user);

      let closed = false;
      const usage: { handle?: SubscriptionHandle } = {};
      sse.onClose(() => {
        closed = true;
        usage.handle?.unsubscribe('client disconnected');
      });

      usage.handle = await this.managerRpcClient.subscribeForServer(
        id,
        controlDescriptors.serverUsage,
        { serverId: id },
        (event) => {
          const parsed = serverUsageDtoSchema.safeParse(event);
          if (!parsed.success) {
            this.logger.warn(`Dropping invalid usage event for server ${id}: ${parsed.error.message}`);
            return;
          }
          next(parsed.data);
        },
      );

      // The SSE client disconnected while the listen ack was in flight.
      if (closed) {
        usage.handle.unsubscribe('client disconnected');
      }
    } catch (error) {
      sse.error(error);
      this.logger.error('Failed to subscribe to server usage', error);
    }
  }

  async findMismatch(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:dashboard', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.managerRpcClient.sendRequest(server.managerId, controlDescriptors.getMismatch, {
      serverId: id,
      config: await this.buildServerConfig(server),
    });
  }

  async buildServerConfig(server: Server & { manager: ServerManager }): Promise<ServerConfig> {
    return {
      ...server,
      id: server.id,
      userId: server.createdBy,
      gamemode: server.gamemode || server.mode,
      env: await this.serverAuthorityService.resolveGroupEnvs(server.groupId, server.id),
    };
  }

  async pushServerConfigIfRunning(id: string) {
    try {
      const server = await this.serverAuthorityService.getServerCached(id);

      if (
        server.status !== SERVER_STATUS_MAP['ONLINE'] &&
        server.status !== SERVER_STATUS_MAP['PAUSED'] &&
        server.status !== SERVER_STATUS_MAP['STOP']
      ) {
        return;
      }

      await this.managerRpcClient.sendRequest(
        server.managerId,
        controlDescriptors.updateConfig,
        {
          serverId: id,
          config: await this.buildServerConfig(server),
        },
        SERVER_CONSTANTS.UPDATE_CONFIG_TIMEOUT_MS,
      );
    } catch {
      // Intentionally silent: the database edit already succeeded and the
      // mismatch display remains the fallback signal.
    }
  }

  async hostServer(id: string, token: string, serverIdHeader: string, ip: string): Promise<string> {
    if (!token) {
      throw new BadRequestException('Invalid token');
    }

    try {
      await this.jwtService.verifyAsync<{ id: string }>(token);
    } catch (error) {
      this.logger.error('Failed to verify token', error);
      throw new UnauthorizedException('Fail to verify token');
    }

    this.logger.log(`Received host server request from ${serverIdHeader} ${ip}`);

    this.serverLogService.sendLog({
      serverId: id,
      level: 'info',
      name: 'log',
      data: `[purple]Received host server request from ${serverIdHeader}`,
      createdAt: new Date(),
    });

    const server = await this.prismaService.server.findUniqueOrThrow({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        manager: true,
      },
    });

    this.validateHostCommand(server.hostCommand);

    this.logger.log(`Host server ${server.name} on port ${server.port}`);

    await this.managerRpcClient.sendRequest(
      server.managerId,
      controlDescriptors.hostServer,
      await this.buildServerConfig(server),
      120_000,
    );

    return this.serverManagerService.extractServerAddress(server.manager.address) + ':' + server.port;
  }

  async assertServerHostAccess(id: string, user: Session) {
    const server = await this.prismaService.server.findUniqueOrThrow({
      where: {
        id,
        deletedAt: null,
      },
    });

    const hasPermission = await this.serverAuthorityService.hasServerAccess(user, id, {
      any: ['server:manage', { authorId: server.createdBy }],
    });

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to host this server');
    }

    return server;
  }

  async host(id: string, next: (data: ApiResult<typeof api.v4.servers.host>) => void, sse: Sse, user: Session) {
    await this.assertServerHostAccess(id, user);
    this.serverLogService.sendLog({
      serverId: id,
      level: 'info',
      name: 'log',
      data: `[purple]${user.name} host server`,
      createdAt: new Date(),
    });

    next({
      createdAt: new Date(),
      data: `Fetching server data`,
      level: 'info',
      name: 'log',
      serverId: id,
    });

    const server = await this.prismaService.server.findUniqueOrThrow({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        manager: true,
      },
    });

    try {
      const hasPermission = await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      });

      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to host this server');
      }

      if (server.credit <= 0) {
        throw new ForbiddenException('You do not have enough credit to host this server');
      }

      this.serverLogService.setServerLogListener(id, (event) => {
        next({
          createdAt: new Date(),
          data: event.data,
          level: event.level,
          name: 'log',
          serverId: id,
        });
      });

      await this.managerRpcClient.sendRequest(
        server.managerId,
        controlDescriptors.hostServer,
        await this.buildServerConfig(server),
        120_000,
      );

      next({
        createdAt: new Date(),
        data: `[green]Server created[]`,
        level: 'info',
        name: 'log',
        serverId: id,
      });
    } catch (error) {
      next({
        createdAt: new Date(),
        data: `Host server error: ${String(error)}`,
        level: 'error',
        name: 'log',
        serverId: id,
      });
    } finally {
      this.serverLogService.removeServerLogListener(id);
      sse.complete();
    }
  }
}
