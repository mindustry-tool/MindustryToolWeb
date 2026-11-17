import { Test, TestingModule } from '@nestjs/testing';
import { ShareService } from './share.service';
import { PrismaService } from '@/prisma/prisma.service';
import { StatsService } from '@/services/stats/stats.service';
import { NotificationService } from '@/services/notification/notification.service';

describe('ShareService', () => {
  let service: ShareService;
  let prismaService: any;
  let statsService: any;
  let notificationService: any;

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn(async (cb) => cb(prismaService)),
      shareLink: {
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userInvited: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    statsService = {
      addStats: jest.fn().mockResolvedValue(undefined),
    };

    notificationService = {
      notify: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareService,
        { provide: PrismaService, useValue: prismaService },
        { provide: StatsService, useValue: statsService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<ShareService>(ShareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should dispatch share_reward notification with aggregationKey when valid visit occurs', async () => {
    prismaService.shareLink.findUniqueOrThrow.mockResolvedValue({
      id: 'link-123',
      url: 'https://mindustry-tool.com/schematics/abc',
      createdBy: 'creator-user',
    });

    prismaService.userInvited.findFirst.mockResolvedValue(null); // not visited yet
    prismaService.userInvited.create.mockResolvedValue({ id: 'invite-1' });
    prismaService.shareLink.update.mockResolvedValue({ id: 'link-123', count: 1 });

    await service.visitShareLink('link-123', '1.2.3.4');

    expect(statsService.addStats).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'creator-user',
        name: 'credit',
        amount: 30,
      }),
    );
    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'creator-user',
        code: 'share_reward',
        params: expect.objectContaining({
          url: 'https://mindustry-tool.com/schematics/abc',
          credits: 30,
          visitCount: 1,
        }),
        aggregationKey: 'share_reward:creator-user:link-123',
      }),
    );
  });
});
