import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Cache } from '@nestjs/cache-manager';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback) => {
        if (typeof callback === 'function') {
          return callback(prisma);
        }
        return Promise.all(callback);
      }),
      notification: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      broadcastNotification: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        deleteMany: jest.fn(),
      },
      broadcastNotificationRead: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      notificationPreference: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ createdAt: new Date('2024-01-01T00:00:00Z') }),
      },
      userRole: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: Cache,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notify & aggregation', () => {
    it('should create new notification when no aggregation key matches', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      prisma.notification.findFirst.mockResolvedValue(null);
      prisma.notification.create.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        type: 'LIKE',
        code: 'like.single',
        params: { actorName: 'Alice', itemType: 'schematic', itemName: 'Reactor', itemId: '1' },
        groupKey: 'schematic:1',
        aggregationKey: 'like:user-1:schematic:1',
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.notify({
        userId: 'user-1',
        code: 'like.single',
        params: { actorName: 'Alice', itemType: 'schematic', itemName: 'Reactor', itemId: '1' },
        groupKey: 'schematic:1',
        aggregationKey: 'like:user-1:schematic:1',
      });

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result?.code).toBe('like.single');
    });

    it('should aggregate like.single into like.multiple transactionally when aggregationKey matches unread', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      prisma.notification.findFirst.mockResolvedValue({
        id: 'existing-notif',
        userId: 'user-1',
        type: 'LIKE',
        code: 'like.single',
        params: { actorName: 'Alice', itemType: 'schematic', itemName: 'Reactor', itemId: '1' },
        groupKey: 'schematic:1',
        aggregationKey: 'like:user-1:schematic:1',
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prisma.notification.update.mockResolvedValue({
        id: 'existing-notif',
        userId: 'user-1',
        type: 'LIKE',
        code: 'like.multiple',
        params: { actorName: 'Bob', count: 2, itemType: 'schematic', itemName: 'Reactor', itemId: '1' },
        groupKey: 'schematic:1',
        aggregationKey: 'like:user-1:schematic:1',
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.notify({
        userId: 'user-1',
        code: 'like.single',
        params: { actorName: 'Bob', itemType: 'schematic', itemName: 'Reactor', itemId: '1' },
        groupKey: 'schematic:1',
        aggregationKey: 'like:user-1:schematic:1',
      });

      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'existing-notif' },
          data: expect.objectContaining({
            code: 'like.multiple',
          }),
        }),
      );
      expect(result?.code).toBe('like.multiple');
    });

    it('should not notify if user disabled category in preferences', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue({
        userId: 'user-1',
        inAppEnabled: true,
        verificationEnabled: true,
        likesEnabled: false, // likes disabled
        shareRewardEnabled: true,
        systemEnabled: true,
      });

      const result = await service.notify({
        userId: 'user-1',
        code: 'like.single',
        params: { actorName: 'Bob', itemType: 'schematic', itemName: 'Reactor', itemId: '1' },
      });

      expect(result).toBeNull();
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('unread counting', () => {
    it('should return combined unread count of personal notifications and unread broadcasts', async () => {
      prisma.notification.count.mockResolvedValue(3);
      prisma.broadcastNotification.count.mockResolvedValue(1);

      const res = await service.getUnreadCount('user-1');
      // 3 personal unread + 1 broadcast unread = 4
      expect(res.count).toBe(4);
    });
  });

  describe('broadcast management & read receipts', () => {
    it('should store 1 row in BroadcastNotification on broadcast to all', async () => {
      prisma.broadcastNotification.create.mockResolvedValue({
        id: 'b-1',
        code: 'system.announcement',
        params: { title: 'Notice', message: 'Hello world', severity: 'info' },
        link: null,
        authorId: 'admin-1',
        createdAt: new Date(),
      });

      const res = await service.broadcast('admin-1', {
        target: 'all',
        code: 'system.announcement',
        params: { title: 'Notice', message: 'Hello world', severity: 'info' },
      });

      expect(prisma.broadcastNotification.create).toHaveBeenCalledTimes(1);
      expect(res.success).toBe(true);
    });

    it('should create read receipt in BroadcastNotificationRead when marking broadcast as read', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);
      prisma.broadcastNotification.findUnique.mockResolvedValue({
        id: 'b-1',
        code: 'system.announcement',
        params: {},
        link: null,
        createdAt: new Date(),
      });
      prisma.broadcastNotificationRead.upsert.mockResolvedValue({
        userId: 'user-1',
        broadcastId: 'b-1',
        readAt: new Date(),
      });

      const res = await service.markAsRead('user-1', 'b-1');
      expect(prisma.broadcastNotificationRead.upsert).toHaveBeenCalled();
      expect(res.readAt).toBeDefined();
    });

    it('should delete broadcast notification when requested by admin', async () => {
      prisma.broadcastNotification.findUnique.mockResolvedValue({ id: 'b-1' });
      prisma.broadcastNotification.delete = jest.fn().mockResolvedValue({ id: 'b-1' });

      const res = await service.deleteSystemNotification('b-1');
      expect(prisma.broadcastNotification.delete).toHaveBeenCalledWith({ where: { id: 'b-1' } });
      expect(res.success).toBe(true);
    });
  });

  describe('retention cleanup cron', () => {
    it('should purge notifications and broadcasts older than 90 days', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 12 });
      prisma.broadcastNotification.deleteMany.mockResolvedValue({ count: 2 });

      await service.pruneOldNotifications();

      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });

      expect(prisma.broadcastNotification.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });
});
