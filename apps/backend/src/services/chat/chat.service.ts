import { PrismaService } from '@/prisma/prisma.service';
import { ProfanityService } from '@/services/profanity/profanity.service';
import { Sse } from '@/types/sse';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import { ChatDeleteEvent, ChatMessageDto, ChatUserDto, Session } from '@mindustry-tool/api';
import { BadRequestException, HttpException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v7 } from 'uuid';
import { ChatChannel, User } from '@/generated/prisma/client';

type ChatUser = { session: Session | null; clients: Set<Sse>; channels: Set<string>; state?: string };

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);
  private readonly MAX_RATE = 300;
  private readonly RATE_INTERVAL = 1000 * 60 * 5;
  private readonly DISCORD_WEB_HOOKS = [
    'https://discord.com/api/webhooks/1460863810892992555/vsAkX_BXH3meuhu1pomhkv8waQrwCxJdOhIvR2tbMdEeO23paPovebT_cR2etZ24IPO9',
  ];

  private users: Map<string, ChatUser> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private ratelimit = new Map<
    string,
    {
      consume: number;
      requests: {
        createdAt: number;
        consume: number;
      }[];
    }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly profanityService: ProfanityService,
  ) {}

  async onModuleInit() {
    const defaultChannel = [
      'Global',
      'English',
      'Tiếng Việt',
      'Русский', // Russian
      '中文', // Chinese
      'Français', // French
      'Deutsch', // German
      '日本語', // Japanese
      '한국어', // Korean
      'Español', // Spanish
      'Português', // Portuguese
      'Italiano', // Italian
      'Polski', // Polish,
      'Türkçe', // Turkish,
      'Tagalog', // Filipino
      'Magyar', // Hungarian
    ];

    try {
      await Promise.all(
        defaultChannel.map((name) =>
          this.prisma.chatChannel.upsert({
            where: {
              name,
            },
            update: {},
            create: {
              name,
            },
          }),
        ),
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'cleanRatelimit',
  })
  private async cleanRatelimit() {
    const now = Date.now();

    for (const [key, records] of this.ratelimit) {
      const { requests } = records;

      if (requests.length === 0) {
        this.ratelimit.delete(key);
        continue;
      }

      if (now - requests[0].createdAt < this.RATE_INTERVAL) {
        continue;
      }

      let spliceIndex = -1;

      for (let i = 0; i < requests.length; i++) {
        if (now - requests[i].createdAt < this.RATE_INTERVAL) {
          spliceIndex = i;
          break;
        }
      }

      if (spliceIndex > 0) {
        requests.splice(0, spliceIndex);
      } else if (spliceIndex === -1) {
        requests.length = 0;
      }

      if (requests.length === 0) {
        this.ratelimit.delete(key);
        continue;
      }

      let consume = 0;

      for (let i = 0; i < requests.length; i++) {
        consume += requests[i].consume;
      }

      this.ratelimit.set(key, { consume, requests });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'cleanOldMessage',
  })
  private async cleanOldMessage() {
    const now = Date.now();
    const threeMonthAgo = now - 1000 * 60 * 60 * 24 * 90;

    try {
      const deleted = await this.prisma.chatMessage.deleteMany({
        where: {
          createdAt: {
            lt: new Date(threeMonthAgo),
          },
        },
      });
      if (deleted.count > 0) {
        this.logger.log(`Deleted ${deleted.count} messages`);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: 'sendHeartbeat',
  })
  private async sendHeartbeat() {
    for (const [_, data] of this.users) {
      for (const sse of data.clients) {
        sse.next({
          type: 'heartbeat',
          data: 'heartbeat',
        });
      }
    }
  }

  private addUser(id: string, user: Session | null | undefined, sse: Sse) {
    let data = this.users.get(id);

    if (!data) {
      data = { session: user || null, clients: new Set(), channels: new Set() };
      this.users.set(id, data);
    }

    data.clients.add(sse);
  }

  private removeUser(id: string, sse: Sse) {
    const data = this.users.get(id);

    if (!data) {
      return;
    }

    data.clients.delete(sse);

    if (data.clients.size === 0) {
      this.users.delete(id);

      for (const channelId of data.channels) {
        const channelUsers = this.channels.get(channelId);
        if (channelUsers) {
          channelUsers.delete(id);
          if (channelUsers.size === 0) {
            this.channels.delete(channelId);
          }
        }
      }
    }
  }

  async handleStream(sse: Sse, user: Session | null, chatId?: string) {
    const id = user?.id || (chatId ? `guest:${chatId}` : undefined);

    if (!id) {
      throw new BadRequestException('Invalid connection');
    }

    sse.onClose(() => {
      this.removeUser(id, sse);
    });

    this.addUser(id, user, sse);

    let data = this.users.get(id);

    if (!data) {
      data = { session: user || null, clients: new Set(), channels: new Set() };
      this.users.set(id, data);
    }

    const channels = await this.prisma.chatChannel.findMany();

    for (const channel of channels.map((c) => c.id)) {
      data.channels.add(channel);
      const channelUsers = this.channels.get(channel) || new Set();
      channelUsers.add(id);
      this.channels.set(channel, channelUsers);
    }
  }

  async handleFetch(query: ApiQuery<typeof api.v4.chats.fetch>) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        channelId: query.channelId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
    });

    return messages;
  }

  async handleGetUsers() {
    return Array.from(this.users.values())
      .filter((data) => data.session !== null)
      .map((data) => ({ ...data.session!, state: data.state }) satisfies ChatUserDto);
  }

  async handleGetUserCount() {
    return this.users.size;
  }

  async handleGetChannels() {
    return await this.prisma.chatChannel.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async handleSendText(body: ApiBody<typeof api.v4.chats.send>, user: Session) {
    let rate = this.ratelimit.get(user.id);

    if (!rate) {
      rate = {
        consume: 0,
        requests: [],
      };
      this.ratelimit.set(user.id, rate);
    }

    const consume = body.content.length / 1024 + 1;

    rate.consume += consume;
    rate.requests.push({
      createdAt: Date.now(),
      consume,
    });

    if (rate.consume > this.MAX_RATE) {
      throw new HttpException('Rate limit exceeded', 429);
    }

    // Persist moderated text once so DB, SSE, and Discord all reuse same content.
    const { value: sanitizedContent } = await this.profanityService.sanitizeText(body.content);

    const message = await this.prisma.chatMessage.create({
      data: {
        id: v7(),
        content: sanitizedContent,
        createdBy: user.id,
        replyTo: body.replyTo,
        channelId: body.channelId,
      },
      include: {
        user: true,
        channel: true,
      },
    });

    await this.prisma.chatChannel.update({
      where: {
        id: message.channelId,
      },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date(),
      },
    });

    const targetUserIds = new Set<string>();

    const channelUsers = this.channels.get(message.channelId);

    if (channelUsers) {
      for (const uid of channelUsers) {
        targetUserIds.add(uid);
      }
    }

    for (const uid of targetUserIds) {
      const data = this.users.get(uid);
      if (data) {
        for (const client of data.clients) {
          client.next({
            data: {
              type: 'message',
              data: message,
            },
          });
        }
      }
    }

    this.sendMessageToDiscord(message).catch((error) => this.logger.error(error));

    return message;
  }

  private async sendMessageToDiscord(message: ChatMessageDto & { user: User } & { channel: ChatChannel }) {
    const content =
      '`' + `[${message.channel.name}] <${message.user.name}>: ${message.content}`.replaceAll('`', '') + '`';

    for (const webhook of this.DISCORD_WEB_HOOKS) {
      fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch((error) => this.logger.error(error));
    }
  }

  async handleUpdateState(body: ApiBody<typeof api.v4.chats.updateState>, user: Session) {
    const { state } = body;

    const data = this.users.get(user.id);

    if (data) {
      data.state = state;
    }
  }

  async handleDeleteChat(id: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await this.prisma.chatMessage.delete({
      where: { id },
    });

    let lastMessageId = message.channel.lastMessageId;

    if (lastMessageId === id) {
      const latestMessage = await this.prisma.chatMessage.findFirst({
        where: { channelId: message.channelId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      lastMessageId = latestMessage?.id ?? null;

      await this.prisma.chatChannel.update({
        where: { id: message.channelId },
        data: { lastMessageId },
      });
    }

    const deleteEvent: ChatDeleteEvent = {
      id: message.id,
      channelId: message.channelId,
      lastMessageId,
    };

    const channelUsers = this.channels.get(message.channelId);

    if (channelUsers) {
      for (const uid of channelUsers) {
        const data = this.users.get(uid);
        if (data) {
          for (const client of data.clients) {
            client.next({
              data: {
                type: 'delete',
                data: deleteEvent,
              },
            });
          }
        }
      }
    }
  }
}
