import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from '@nestjs/cache-manager';
import { PrismaService } from '@/prisma/prisma.service';
import { Sse } from '@/types/sse';
import { AdminNotificationParams, NotificationCode, NotificationDto, NotificationParamsByCode, NotificationQuery, AdminCreateNotification, UpdateNotificationPreferences, NotificationPreferences, Session } from '@mindustry-tool/api';
import { Prisma } from '@/generated/prisma/client';

interface SseClient {
  sse: Sse;
  next: (data: { notification: NotificationDto }) => void;
}

interface RawNotification {
  id: string;
  userId?: string | null;
  code: string;
  params: unknown;
  groupKey?: string | null;
  aggregationKey?: string | null;
  link?: string | null;
  readAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  // In-memory active client streams keyed by userId
  private readonly clients = new Map<string, Set<SseClient>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: Cache,
  ) {}

  handleSse(
    sse: Sse,
    next: (data: { notification: NotificationDto }) => void,
    user: Session | null | undefined,
  ) {
    if (!user) {
      sse.complete();
      return;
    }

    let userSessions = this.clients.get(user.id);
    if (!userSessions) {
      userSessions = new Set<SseClient>();
      this.clients.set(user.id, userSessions);
    }

    const client: SseClient = { sse, next };
    userSessions.add(client);

    // Keepalive comment ping every 30 seconds
    const interval = setInterval(() => {
      try {
        sse.next({ type: 'ping', data: 'ping' });
      } catch {
        clearInterval(interval);
      }
    }, 30000);

    sse.onClose(() => {
      clearInterval(interval);
      const sessions = this.clients.get(user.id);
      if (sessions) {
        sessions.delete(client);
        if (sessions.size === 0) {
          this.clients.delete(user.id);
        }
      }
    });
  }

  private pushToUser(userId: string, notification: NotificationDto) {
    const sessions = this.clients.get(userId);
    if (sessions && sessions.size > 0) {
      for (const client of sessions) {
        try {
          client.next({ notification });
        } catch (e) {
          this.logger.error(`Error sending notification to user ${userId}:`, e);
        }
      }
    }
  }

  private pushToAll(notification: NotificationDto) {
    for (const [_, sessions] of this.clients) {
      for (const client of sessions) {
        try {
          client.next({ notification });
        } catch (e) {
          this.logger.error('Error broadcasting notification:', e);
        }
      }
    }
  }

  private formatNotification(raw: RawNotification, readAt?: Date | null): NotificationDto {
    const isSystem = raw.code?.startsWith('system.');
    const category = isSystem ? 'system' : 'personal';

    const resolvedReadAt = readAt ?? raw.readAt;
    const updatedAtVal = raw.updatedAt ?? raw.createdAt;
    return {
      id: raw.id,
      userId: raw.userId,
      category,
      code: raw.code,
      params: (raw.params ?? {}) as Record<string, unknown>,
      groupKey: raw.groupKey ?? null,
      aggregationKey: raw.aggregationKey ?? null,
      link: raw.link ?? null,
      readAt: resolvedReadAt ? (resolvedReadAt instanceof Date ? resolvedReadAt.toISOString() : resolvedReadAt) : null,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
      updatedAt: updatedAtVal instanceof Date ? updatedAtVal.toISOString() : updatedAtVal,
    } as NotificationDto;
  }

  private async getUserCreatedAt(userId: string): Promise<Date> {
    const cacheKey = `user:${userId}:created_at`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) return new Date(cached);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    const createdAt = user?.createdAt ?? new Date(0);
    await this.cache.set(cacheKey, createdAt.toISOString(), 3600000);
    return createdAt;
  }

  async notify<C extends NotificationCode>(input: {
    userId: string;
    code: C;
    params: NotificationParamsByCode<C>;
    groupKey?: string | null;
    aggregationKey?: string | null;
    link?: string | null;
  }) {
    const prefs = await this.getPreferences(input.userId);
    if (!prefs.inAppEnabled) return null;
    if (input.code.startsWith('verification.') && !prefs.verificationEnabled) return null;
    if (input.code.startsWith('like.') && !prefs.likesEnabled) return null;
    if (input.code === 'share_reward' && !prefs.shareRewardEnabled) return null;
    if (input.code.startsWith('comment.') && !prefs.commentsEnabled) return null;
    if (input.code.startsWith('system.') && !prefs.systemEnabled) return null;

    const { userId, code, params, groupKey, aggregationKey, link } = input;

    if (aggregationKey) {
      const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.notification.findFirst({
          where: {
            userId,
            aggregationKey,
            readAt: null,
            createdAt: { gte: windowStart },
          },
        });

        if (existing) {
          const prevParams = (existing.params as Record<string, unknown>) || {};
          const count = (typeof prevParams.count === 'number' ? prevParams.count : 1) + 1;
          const currentParams = params as Record<string, unknown>;
          const newActor = typeof currentParams.actorName === 'string' ? currentParams.actorName : undefined;
          const actors = Array.isArray(prevParams.actors)
            ? [...(prevParams.actors as string[])]
            : [typeof prevParams.actorName === 'string' ? prevParams.actorName : ''].filter(Boolean);
          if (newActor && !actors.includes(newActor)) {
            actors.push(newActor);
          }

          const mergedParams: Prisma.InputJsonObject = {
            ...prevParams,
            ...currentParams,
            count,
            actors,
            actorName: newActor ?? (typeof prevParams.actorName === 'string' ? prevParams.actorName : ''),
          };

          const aggregatedCode = code.startsWith('like.') ? 'like.multiple' : code;

          const updated = await tx.notification.update({
            where: { id: existing.id },
            data: {
              code: aggregatedCode,
              params: mergedParams,
              updatedAt: new Date(),
            },
          });

          const formatted = this.formatNotification(updated);
          this.pushToUser(userId, formatted);
          return formatted;
        }

        const created = await tx.notification.create({
          data: {
            userId,
            code,
            params,
            groupKey: groupKey ?? null,
            aggregationKey,
            link: link ?? null,
            readAt: null,
          },
        });

        const formatted = this.formatNotification(created);
        this.pushToUser(userId, formatted);
        return formatted;
      });
    }

    const created = await this.prisma.notification.create({
      data: {
        userId,
        code,
        params,
        groupKey: groupKey ?? null,
        aggregationKey: null,
        link: link ?? null,
        readAt: null,
      },
    });

    const formatted = this.formatNotification(created);
    this.pushToUser(userId, formatted);
    return formatted;
  }

  async broadcast(_createdById: string, data: AdminCreateNotification) {
    if (data.target === 'all') {
      const broadcast = await this.prisma.broadcastNotification.create({
        data: {
          code: data.code,
          params: data.params,
          link: data.link ?? null,
        },
      });

      const formatted = this.formatNotification({
        id: broadcast.id,
        userId: undefined,
        code: broadcast.code,
        params: broadcast.params,
        groupKey: 'system:broadcast',
        aggregationKey: null,
        link: broadcast.link,
        readAt: null,
        createdAt: broadcast.createdAt,
        updatedAt: broadcast.createdAt,
      });

      this.pushToAll(formatted);
      return { success: true, sentCount: this.clients.size };
    }

    if (data.target === 'user') {
      if (!data.targetId) {
        throw new BadRequestException('targetId is required when target is user');
      }
      await this.notify({
        userId: data.targetId,
        code: data.code ,
        params: data.params,
        link: data.link,
        groupKey: 'system:admin',
      });
      return { success: true, sentCount: 1 };
    }

    if (data.target === 'role') {
      if (!data.targetId) {
        throw new BadRequestException('targetId is required when target is role');
      }
      const userRoles = await this.prisma.userRole.findMany({
        where: { roleId: data.targetId },
        select: { userId: true },
      });
      await Promise.all(
        userRoles.map((ur) =>
          this.notify({
            userId: ur.userId,
            code: data.code,
            params: data.params,
            link: data.link,
            groupKey: 'system:admin',
          }),
        ),
      );
      return { success: true, sentCount: userRoles.length };
    }

    return { success: false, sentCount: 0 };
  }

  async getBroadcastHistory(page: number, size: number) {
    const [data, total] = await Promise.all([
      this.prisma.broadcastNotification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: page * size,
        take: size,
      }),
      this.prisma.broadcastNotification.count(),
    ]);

    return {
      data: data.map((b) => ({
        id: b.id,
        code: b.code,
        category: 'system' as const,
        params: b.params as AdminNotificationParams,
        link: b.link,
        createdAt: b.createdAt.toISOString(),
        readAt: null,
      })),
      total,
    };
  }

  async deleteSystemNotification(id: string) {
    const broadcast = await this.prisma.broadcastNotification.findUnique({
      where: { id },
    });

    if (broadcast) {
      await this.prisma.broadcastNotification.delete({
        where: { id },
      });
      this.logger.log(`Broadcast notification ${id} deleted by admin`);
      return { success: true };
    }

    const systemNotif = await this.prisma.notification.findFirst({
      where: { id, code: { startsWith: 'system.' } },
    });

    if (systemNotif) {
      await this.prisma.notification.delete({
        where: { id },
      });
      this.logger.log(`System notification ${id} deleted by admin`);
      return { success: true };
    }

    throw new NotFoundException(`System notification with ID ${id} not found`);
  }

  async findAll(userId: string, query: NotificationQuery) {
    const userCreatedAt = await this.getUserCreatedAt(userId);
    const size = query.size ?? 20;
    const wherePersonal: Prisma.NotificationWhereInput = { userId };

    if (query.category === 'personal') {
      // Personal = all codes that don't start with 'system.'
      wherePersonal.NOT = { code: { startsWith: 'system.' } };
    } else if (query.category === 'system') {
      // System personal = codes that start with 'system.' (user-targeted, not broadcast)
      wherePersonal.code = { startsWith: 'system.' };
    }

    if (query.groupKey) wherePersonal.groupKey = query.groupKey;
    if (query.unreadOnly) wherePersonal.readAt = null;

    // Broadcasts always have groupKey 'system:broadcast', so when filtering by any
    // other groupKey the broadcast query can be skipped entirely.
    const skipBroadcasts = Boolean(query.groupKey && query.groupKey !== 'system:broadcast');

    const broadcastWhere: Prisma.BroadcastNotificationWhereInput = {
      createdAt: { gte: userCreatedAt },
    };
    if (query.unreadOnly) {
      broadcastWhere.reads = { none: { userId } };
    }

    const [personalNotifications, broadcasts] = await Promise.all([
      this.prisma.notification.findMany({
        where: wherePersonal,
        orderBy: { createdAt: 'desc' },
        take: size + 1,
      }),
      query.category !== 'personal' && !skipBroadcasts
        ? this.prisma.broadcastNotification.findMany({
            where: broadcastWhere,
            include: {
              reads: {
                where: { userId },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: size + 1,
          })
        : Promise.resolve([] as Prisma.BroadcastNotificationGetPayload<{
            include: { reads: { where: { userId: string } } };
          }>[]),
    ]);

    const mappedBroadcasts = broadcasts.map((b) => {
      const readRecord = b.reads?.[0];
      return {
        id: b.id,
        userId,
        code: b.code,
        params: b.params,
        groupKey: 'system:broadcast',
        aggregationKey: null,
        link: b.link,
        readAt: readRecord ? readRecord.readAt : null,
        createdAt: b.createdAt,
        updatedAt: b.createdAt,
      };
    });

    const combined = [...personalNotifications, ...mappedBroadcasts];
    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    let startIndex = 0;
    if (query.cursor) {
      const cursorIndex = combined.findIndex((n) => n.id === query.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const sliced = combined.slice(startIndex, startIndex + size);
    const hasMore = combined.length > startIndex + size;
    const nextCursor = hasMore && sliced.length > 0 ? sliced[sliced.length - 1].id : null;

    return {
      data: sliced.map((n) => this.formatNotification(n)),
      nextCursor,
    };
  }

  async getUnreadCount(userId: string) {
    const userCreatedAt = await this.getUserCreatedAt(userId);
    const [personalCount, broadcastCount] = await Promise.all([
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
      this.prisma.broadcastNotification.count({
        where: {
          createdAt: { gte: userCreatedAt },
          reads: { none: { userId } },
        },
      }),
    ]);

    return { count: personalCount + broadcastCount };
  }

  async markAsRead(userId: string, id: string) {
    const personal = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (personal) {
      const updated = await this.prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
      return this.formatNotification(updated);
    }

    const broadcast = await this.prisma.broadcastNotification.findUnique({
      where: { id },
    });

    if (broadcast) {
      const read = await this.prisma.broadcastNotificationRead.upsert({
        where: {
          broadcastId_userId: { broadcastId: id, userId },
        },
        create: {
          broadcastId: id,
          userId,
          readAt: new Date(),
        },
        update: {
          readAt: new Date(),
        },
      });

      return this.formatNotification(
        {
          id: broadcast.id,
          userId,
          code: broadcast.code,
          params: broadcast.params,
          groupKey: 'system:broadcast',
          aggregationKey: null,
          link: broadcast.link,
          createdAt: broadcast.createdAt,
          updatedAt: broadcast.createdAt,
        },
        read.readAt,
      );
    }

    throw new NotFoundException('Notification not found');
  }

  async markAllAsRead(userId: string) {
    const userCreatedAt = await this.getUserCreatedAt(userId);
    const now = new Date();

    const personalUpdate = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: now },
    });

    const unreadBroadcasts = await this.prisma.broadcastNotification.findMany({
      where: {
        createdAt: { gte: userCreatedAt },
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unreadBroadcasts.length > 0) {
      await this.prisma.broadcastNotificationRead.createMany({
        data: unreadBroadcasts.map((b) => ({
          broadcastId: b.id,
          userId,
          readAt: now,
        })),
        skipDuplicates: true,
      });
    }

    return { count: personalUpdate.count + unreadBroadcasts.length };
  }

  async delete(userId: string, id: string) {
    const deleted = await this.prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      const broadcast = await this.prisma.broadcastNotification.findUnique({
        where: { id },
      });
      if (broadcast) {
        await this.prisma.broadcastNotificationRead.upsert({
          where: { broadcastId_userId: { broadcastId: id, userId } },
          create: { broadcastId: id, userId, readAt: new Date() },
          update: { readAt: new Date() },
        });
      }
    }

    return { success: true };
  }

  async clearRead(userId: string) {
    const deleted = await this.prisma.notification.deleteMany({
      where: { userId, readAt: { not: null } },
    });
    return { count: deleted.count };
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const cacheKey = `user:${userId}:notif_prefs`;
    const cached = await this.cache.get<NotificationPreferences>(cacheKey);
    if (cached) return cached;

    const record = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    const prefs: NotificationPreferences = {
      inAppEnabled: record?.inAppEnabled ?? true,
      verificationEnabled: record?.verificationEnabled ?? true,
      likesEnabled: record?.likesEnabled ?? true,
      shareRewardEnabled: record?.shareRewardEnabled ?? true,
      commentsEnabled: record?.commentsEnabled ?? true,
      systemEnabled: record?.systemEnabled ?? true,
    };

    await this.cache.set(cacheKey, prefs, 300000);
    return prefs;
  }

  async updatePreferences(userId: string, data: UpdateNotificationPreferences) {
    const updated = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        inAppEnabled: data.inAppEnabled ?? true,
        verificationEnabled: data.verificationEnabled ?? true,
        likesEnabled: data.likesEnabled ?? true,
        shareRewardEnabled: data.shareRewardEnabled ?? true,
        commentsEnabled: data.commentsEnabled ?? true,
        systemEnabled: data.systemEnabled ?? true,
      },
      update: {
        ...(data.inAppEnabled !== undefined && { inAppEnabled: data.inAppEnabled }),
        ...(data.verificationEnabled !== undefined && { verificationEnabled: data.verificationEnabled }),
        ...(data.likesEnabled !== undefined && { likesEnabled: data.likesEnabled }),
        ...(data.shareRewardEnabled !== undefined && { shareRewardEnabled: data.shareRewardEnabled }),
        ...(data.commentsEnabled !== undefined && { commentsEnabled: data.commentsEnabled }),
        ...(data.systemEnabled !== undefined && { systemEnabled: data.systemEnabled }),
      },
    });

    const prefs: NotificationPreferences = {
      inAppEnabled: updated.inAppEnabled,
      verificationEnabled: updated.verificationEnabled,
      likesEnabled: updated.likesEnabled,
      shareRewardEnabled: updated.shareRewardEnabled,
      commentsEnabled: updated.commentsEnabled,
      systemEnabled: updated.systemEnabled,
    };

    const cacheKey = `user:${userId}:notif_prefs`;
    await this.cache.set(cacheKey, prefs, 300000);
    return prefs;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneOldNotifications() {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    this.logger.log(`Pruning notifications created before ${cutoff.toISOString()}`);

    const [personalDeleted, broadcastDeleted] = await Promise.all([
      this.prisma.notification.deleteMany({
        where: { createdAt: { lt: cutoff } },
      }),
      this.prisma.broadcastNotification.deleteMany({
        where: { createdAt: { lt: cutoff } },
      }),
    ]);

    this.logger.log(
      `Pruned ${personalDeleted.count} personal notifications and ${broadcastDeleted.count} broadcasts older than 90 days.`,
    );
  }
}
