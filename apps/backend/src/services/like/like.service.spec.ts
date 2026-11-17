import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from './like.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationService } from '@/services/notification/notification.service';
import { VerificationStatus } from '@/generated/prisma/client';

describe('LikeService', () => {
  let service: LikeService;
  let prisma: any;
  let notificationService: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (cb) => cb(prisma)),
      like: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
      },
      schematic: {
        findFirstOrThrow: jest.fn(),
        update: jest.fn(),
      },
      item: {
        findUnique: jest.fn(),
      },
    };

    notificationService = {
      notify: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should dispatch notification when a user likes an item created by someone else', async () => {
    const session = { id: 'user-2', name: 'Alice', role: 'user' } as any;

    prisma.like.findFirst.mockResolvedValue(null); // not liked yet
    prisma.schematic.findFirstOrThrow.mockResolvedValue({
      id: 'schematic-1',
      name: 'Super Drill',
      verificationStatus: VerificationStatus.VERIFIED,
      likes: 0,
    });
    prisma.schematic.update.mockResolvedValue({
      id: 'schematic-1',
      likes: 1,
    });
    prisma.item.findUnique.mockResolvedValue({
      id: 'item-1',
      createdBy: 'user-1', // created by user-1 (different from Alice)
    });

    const result = await service.createOrDelete('schematics', 'item-1', session);

    expect(result.state).toBe(1);
    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        code: 'like.single',
        groupKey: 'schematics:schematic-1',
        aggregationKey: 'like:user-1:schematics:schematic-1',
        params: expect.objectContaining({
          actorName: 'Alice',
          itemName: 'Super Drill',
        }),
      }),
    );
  });

  it('should not dispatch notification when user likes their own item', async () => {
    const session = { id: 'user-1', name: 'Author', role: 'user' } as any;

    prisma.like.findFirst.mockResolvedValue(null);
    prisma.schematic.findFirstOrThrow.mockResolvedValue({
      id: 'schematic-1',
      name: 'Super Drill',
      verificationStatus: VerificationStatus.VERIFIED,
      likes: 0,
    });
    prisma.schematic.update.mockResolvedValue({
      id: 'schematic-1',
      likes: 1,
    });
    prisma.item.findUnique.mockResolvedValue({
      id: 'item-1',
      createdBy: 'user-1', // same author
    });

    const result = await service.createOrDelete('schematics', 'item-1', session);

    expect(result.state).toBe(1);
    expect(notificationService.notify).not.toHaveBeenCalled();
  });
});
