import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/services/user/user.service';
import { Sse } from '@/types/sse';
import { api } from '@mindustry-tool/api';
import { ApiQuery, ApiResult } from '@mindustry-tool/api';
import { ServerEvent, Session } from '@mindustry-tool/api';
import { ForbiddenException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@/generated/prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { SERVER_CONSTANTS } from '../server.constants';
import { ServerAuthorityService } from './server-authority.service';

@Injectable()
export class ServerLogService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ServerLogService.name);

  private readonly buffers = new Map<string, Prisma.ServerLogCreateManyInput[]>();
  private readonly dirtyServers = new Set<string>();
  private readonly serverLogListeners: Map<string, (event: ServerEvent<'log'>) => void> = new Map();
  private readonly clientMap: Map<string, Sse[]> = new Map();

  private botId?: string;
  private lastLogQueueFull = new Date();
  private droppedLogCount = 0;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly serverAuthorityService: ServerAuthorityService,
  ) {}

  async onModuleInit() {
    try {
      const bot = await this.userService.getBot();
      this.botId = bot.id;
    } catch (error) {
      this.logger.error('Failed to get bot user for server logs', error);
    }
  }

  onModuleDestroy() {
    this.flush();
  }

  setServerLogListener(serverId: string, listener: (event: ServerEvent<'log'>) => void) {
    this.serverLogListeners.set(serverId, listener);
  }

  removeServerLogListener(serverId: string) {
    this.serverLogListeners.delete(serverId);
  }

  async assertLogAccess(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:console', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }
  }

  async getServerLogs(id: string, query: ApiQuery<typeof api.v4.servers.getLogs>, user: Session) {
    const { cursor, size } = query;

    await this.assertLogAccess(id, user);

    const result = await this.prismaService.serverLog.findMany({
      where: {
        serverId: id,
        id: cursor ? { lt: cursor } : undefined,
      },
      orderBy: {
        id: 'desc',
      },
      take: size,
    });

    return result as ApiResult<typeof api.v4.servers.getLogs>;
  }

  async getServerLogStream(id: string, sse: Sse, user: Session) {
    await this.assertLogAccess(id, user);

    let clients = this.clientMap.get(id);

    if (!clients) {
      clients = [];
      this.clientMap.set(id, clients);
    }

    clients.push(sse);

    sse.onClose(() => {
      const currentClients = this.clientMap.get(id);

      if (currentClients) {
        this.clientMap.set(
          id,
          currentClients.filter((client) => client !== sse),
        );
      }
    });

    return sse;
  }

  sendLog(event: ServerEvent<'log'>) {
    if (!this.botId) {
      this.logger.warn('Bot ID is not set, cannot send logs');
      return;
    }

    const serverId = event.serverId;
    let queue = this.buffers.get(serverId);

    if (!queue) {
      queue = [];
      this.buffers.set(serverId, queue);
    }

    if (queue.length >= SERVER_CONSTANTS.LOG_QUEUE_MAX_SIZE) {
      if (Date.now() - this.lastLogQueueFull.getTime() > 1000) {
        this.lastLogQueueFull = new Date();
        this.logger.warn(`Logs queue is full for server: ${serverId}, dropping logs, count: ${++this.droppedLogCount}`);
      }
      return;
    }

    const createdAt = new Date(event.createdAt);

    const lines = event.data
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      const message: Prisma.ServerLogCreateManyInput = {
        id: uuidv7(),
        serverId,
        data: line,
        level: event.level,
        createdAt,
        createdBy: this.botId,
      };

      queue.push(message);

      const clients = this.clientMap.get(serverId);

      if (clients) {
        for (const client of clients) {
          client.next({
            data: message,
          });
        }
      }
    }

    this.serverLogListeners.get(event.serverId)?.(event);
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: 'flushLogBuffer',
  })
  flush() {
    if (this.buffers.size === 0) {
      return;
    }

    for (const [serverId, queue] of this.buffers) {
      if (queue.length === 0) {
        this.buffers.delete(serverId);
        continue;
      }

      const batch = queue;
      this.buffers.set(serverId, []);

      this.prismaService.serverLog
        .createMany({ data: batch })
        .then(() => this.dirtyServers.add(serverId))
        .catch((error) => this.logger.error(`Error flushing log buffer for server ${serverId}`, error));
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'pruneServerLogs',
  })
  async pruneServerLogs() {
    const serverIds = [...this.dirtyServers];

    if (serverIds.length === 0) {
      return;
    }

    for (const serverId of serverIds) {
      try {
        const boundary = await this.prismaService.serverLog.findFirst({
          where: {
            serverId,
          },
          orderBy: {
            id: 'desc',
          },
          skip: SERVER_CONSTANTS.MAX_SERVER_LOGS - 1,
          select: {
            id: true,
          },
        });

        if (!boundary) {
          this.dirtyServers.delete(serverId);
          continue;
        }

        await this.prismaService.serverLog.deleteMany({
          where: {
            serverId,
            id: {
              lt: boundary.id,
            },
          },
        });

        this.dirtyServers.delete(serverId);
      } catch (error) {
        this.logger.error(`Failed to prune server logs for server ${serverId}`, error);
      }
    }
  }

  getLogBufferMetrics() {
    const queues: Record<string, number> = {};
    let total = 0;

    for (const [serverId, queue] of this.buffers) {
      const len = queue.length;
      if (len > 0) {
        queues[serverId] = len;
        total += len;
      }
    }

    return {
      queues,
      total,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanUpServerLogs',
  })
  async cleanUpServerLogs() {
    try {
      const result = await this.prismaService.serverLog.deleteMany({
        where: {
          createdAt: {
            lte: new Date(Date.now() - SERVER_CONSTANTS.SERVER_LOG_EXPIRE_AFTER_MS),
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Clean up ${result.count} server logs`);
      }
    } catch (error) {
      this.logger.error(`Failed to clean up server logs`, error);
    }
  }
}
