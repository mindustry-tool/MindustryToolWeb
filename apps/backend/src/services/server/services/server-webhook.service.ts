import { PrismaService } from '@/prisma/prisma.service';
import { Server, ServerGroupWebhook, ServerWebhook } from '@/generated/prisma/client';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { eventMap, ServerEvent, Session } from '@mindustry-tool/api';
import { formatWithParameter, stripColors } from '@mindustry-tool/api';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { SERVER_CACHE_KEYS, SERVER_CONSTANTS } from '../server.constants';
import { ServerAuthorityService } from './server-authority.service';

type WebhookExample<T extends keyof typeof eventMap> = {
  name: T;
  description: string;
  example: Omit<ServerEvent<T>, 'createdAt' | 'serverId' | 'name'>;
};

@Injectable()
export class ServerWebhookService {
  private readonly logger = new Logger(ServerWebhookService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly serverAuthorityService: ServerAuthorityService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getServerWebhookCached(id: string): Promise<ServerWebhook[]> {
    const cacheKey = SERVER_CACHE_KEYS.serverWebhooks(id);
    const cached = await this.cache.get<ServerWebhook[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const webhooks = await this.prismaService.serverWebhook.findMany({
      where: {
        serverId: id,
      },
    });

    await this.cache.set(cacheKey, webhooks, SERVER_CONSTANTS.SERVER_CACHE_EXPIRE_AFTER_MS);

    return webhooks;
  }

  async clearServerWebhookCache(id: string) {
    const cacheKey = SERVER_CACHE_KEYS.serverWebhooks(id);
    await this.cache.del(cacheKey);
  }

  async getGroupWebhookCached(groupId: string): Promise<ServerGroupWebhook[]> {
    const cacheKey = SERVER_CACHE_KEYS.groupWebhooks(groupId);
    const cached = await this.cache.get<ServerGroupWebhook[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const webhooks = await this.prismaService.serverGroupWebhook.findMany({
      where: {
        groupId,
      },
    });

    await this.cache.set(cacheKey, webhooks, SERVER_CONSTANTS.SERVER_CACHE_EXPIRE_AFTER_MS);

    return webhooks;
  }

  async handleWebhookEvent(event: ServerEvent<keyof typeof eventMap>) {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    if (!event.serverId) {
      return;
    }

    const webhooks = await this.getServerWebhookCached(event.serverId);
    const matchedWebhooks = webhooks.filter((webhook) => webhook.active && webhook.event === event.name);
    const server = await this.serverAuthorityService.getServerCached(event.serverId);

    for (const webhook of matchedWebhooks) {
      this.sendWebhook(server, webhook.url, webhook.data, event).catch((error) =>
        this.logger.error(`Failed to send server webhook to ${webhook.url}`, error),
      );
    }

    if (server?.groupId) {
      const groupWebhooks = await this.getGroupWebhookCached(server.groupId);
      const matchedGroupWebhooks = groupWebhooks.filter((webhook) => webhook.active && webhook.event === event.name);

      for (const webhook of matchedGroupWebhooks) {
        this.sendWebhook(server, webhook.url, webhook.data, event).catch((error) =>
          this.logger.error(`Failed to send group webhook to ${webhook.url}`, error),
        );
      }
    }
  }

  async sendWebhook(
    server: Server,
    url: string,
    data: string,
    event: ServerEvent<keyof typeof eventMap>,
    isRetry = false,
  ) {
    const obj = { ...event, serverName: stripColors(server.name) };
    const formatted = formatWithParameter(data, 'data', obj);

    const sanitizeText = (text: string) => {
      const sanitized = text
        .replace(/@everyone/gi, '@\u200beveryone')
        .replace(/@here/gi, '@\u200bhere')
        .replace(/<@&/g, '<\u200b@&')
        .replace(/<@!/g, '<\u200b@!')
        .replace(/<@/g, '<\u200b@');

      const safeContent = sanitized.replace(/`/g, "'");

      return `\`${safeContent}\``;
    };

    let body: string;

    try {
      const parsed = JSON.parse(formatted);

      if (Array.isArray(parsed)) {
        body = JSON.stringify({ embeds: parsed, allowed_mentions: { parse: [] } });
      } else if (typeof parsed === 'object' && parsed !== null) {
        if ('embeds' in parsed || 'content' in parsed) {
          body = JSON.stringify({ allowed_mentions: { parse: [] }, ...parsed });
        } else {
          body = JSON.stringify({ embeds: [parsed], allowed_mentions: { parse: [] } });
        }
      } else {
        body = JSON.stringify({ content: sanitizeText(String(parsed)), allowed_mentions: { parse: [] } });
      }
    } catch {
      body = JSON.stringify({ content: sanitizeText(formatted), allowed_mentions: { parse: [] } });
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.status === 400 && !isRetry) {
        const errMessage = await res.text();

        this.logger.error(`Webhook returned HTTP 400 for server ${server.name}: ${errMessage} ${JSON.stringify(obj)}`);

        const fallbackBody = JSON.stringify({
          content: `⚠️ **Webhook Error**: \`${errMessage.replace(/`/g, "'")}\``,
          allowed_mentions: { parse: [] },
        });

        await fetch(url, {
          method: 'POST',
          body: fallbackBody,
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        }).catch((error) => this.logger.error(`Failed to send webhook error fallback to ${url}`, error));
      }
    } catch (error) {
      this.logger.error(`Failed to send webhook to ${url}`, error);
    }
  }

  async sendDefaultDiscordEmbeds(
    server: Server,
    event: { name: string; createdAt: Date | number | string },
    color: number,
    fields: { name: string; value: string; inline?: boolean }[],
  ) {
    const dateIso = new Date(event.createdAt).toISOString();
    const payload = JSON.stringify({
      embeds: [
        {
          title: event.name,
          color,
          fields: [
            { name: 'Server ID', value: server.id, inline: false },
            { name: 'Server Name', value: stripColors(server.name), inline: false },
            ...fields,
          ],
          timestamp: dateIso,
        },
      ],
    });

    for (const webhook of SERVER_CONSTANTS.DISCORD_WEBHOOKS) {
      fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        signal: AbortSignal.timeout(5000),
      }).catch((error) => this.logger.error('Failed to send default discord webhook', error));
    }
  }

  async createWebhook(
    id: string,
    body: ApiBody<typeof api.v4.servers.webhooks.create>,
    user: Session,
  ) {
    const { data, url, event, active } = body;

    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:setting', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const count = await this.prismaService.serverWebhook.count({
      where: {
        serverId: id,
      },
    });

    if (count >= SERVER_CONSTANTS.MAX_WEBHOOK_EVENTS) {
      throw new BadRequestException('Server webhook count exceeds the limit');
    }

    const result = await this.prismaService.serverWebhook.create({
      data: {
        serverId: id,
        data,
        url,
        event,
        active: active ?? true,
        createdAt: new Date(),
        createdBy: user.id,
      },
    });

    await this.clearServerWebhookCache(id);

    return result;
  }

  async updateWebhook(
    id: string,
    webhookId: string,
    body: ApiBody<typeof api.v4.servers.webhooks.update>,
    user: Session,
  ) {
    const { data, url, event, active } = body;

    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:setting', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const result = await this.prismaService.serverWebhook.update({
      where: {
        id: webhookId,
        serverId: id,
      },
      data: {
        data,
        url,
        event,
        active,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    await this.clearServerWebhookCache(id);

    return result;
  }

  async deleteWebhook(id: string, webhookId: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:setting', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const result = await this.prismaService.serverWebhook.delete({
      where: {
        id: webhookId,
        serverId: id,
      },
    });

    await this.clearServerWebhookCache(id);

    return result;
  }

  async getAllWebhooks(id: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:setting', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.prismaService.serverWebhook.findMany({
      where: {
        serverId: id,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async getAllWebhookEvents() {
    const result = [
      {
        name: 'player-join',
        description: 'Emit when a player join server',
        example: {
          player: {
            name: 'Player 1',
            uuid: 'Player UUID',
            locale: 'Player Locale',
            ip: 'Player IP',
            team: {
              name: 'Green',
              color: '#00ff00',
            },
            isAdmin: false,
            joinedAt: 1694560000000,
          },
        },
      } satisfies WebhookExample<'player-join'>,
      {
        name: 'player-leave',
        description: 'Emit when a player leave server',
        example: {
          player: {
            name: 'Player 1',
            uuid: 'Player UUID',
            locale: 'Player Locale',
            ip: 'Player IP',
            team: {
              name: 'Green',
              color: '#00ff00',
            },
            isAdmin: false,
            joinedAt: 1694560000000,
          },
        },
      } satisfies WebhookExample<'player-leave'>,
      {
        name: 'chat',
        description: 'Emit when a player chat in server',
        example: { data: 'Player1: This is a chat message from a player' },
      } satisfies WebhookExample<'chat'>,
      {
        name: 'player-kick',
        description: 'Emit when a player is kicked from server',
        example: {
          uuid: 'Player UUID',
          playerName: 'Player 1',
          ip: 'Player IP',
          reason: 'Kick Reason',
        },
      } satisfies WebhookExample<'player-kick'>,
      {
        name: 'player-vote-kick',
        description: 'Emit when a player is voted kicked from server',
        example: {
          uuid: 'Player UUID',
          playerName: 'Player 1',
          ip: 'Player IP',
          reason: 'Kick Reason',
          participants: ['Player 2', 'Player 3'],
        },
      } satisfies WebhookExample<'player-vote-kick'>,
      {
        name: 'player-ban',
        description: 'Emit when a player is banned from server',
        example: {
          uuid: 'Player UUID',
          playerName: 'Player 1',
          ip: 'Player IP',
        },
      } satisfies WebhookExample<'player-ban'>,
    ];

    return result;
  }
}
