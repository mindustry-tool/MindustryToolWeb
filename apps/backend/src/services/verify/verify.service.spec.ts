import { Test, TestingModule } from '@nestjs/testing';
import { VerifyService } from './verify.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { StatsService } from '@/services/stats/stats.service';
import { NotificationService } from '@/services/notification/notification.service';
import { VerificationStatus } from '@/generated/prisma/client';

describe('VerifyService', () => {
  let service: VerifyService;
  let prismaService: any;
  let statsService: any;
  let prometheusService: any;
  let notificationService: any;

  beforeEach(async () => {
    prismaService = {
      schematic: {
        findFirstOrThrow: jest.fn(),
        update: jest.fn(),
      },
      map: {
        findFirstOrThrow: jest.fn(),
        update: jest.fn(),
      },
    };

    statsService = {
      addStats: jest.fn().mockResolvedValue(undefined),
    };

    prometheusService = {
      verifyGauge: {
        inc: jest.fn(),
      },
    };

    notificationService = {
      notify: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: PrismaService, useValue: prismaService },
        { provide: PrometheusService, useValue: prometheusService },
        { provide: StatsService, useValue: statsService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<VerifyService>(VerifyService);
    // Mock private sendNotification so webhook call doesn't throw
    (service as any).sendNotification = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should dispatch verification.approved notification when an item is verified', async () => {
    const session = {
      id: 'admin-1',
      name: 'Admin',
      authorities: ['schematic:manage'],
    } as any;

    prismaService.schematic.findFirstOrThrow.mockResolvedValue({
      id: 'schematic-1',
      name: 'Logic Controller',
      verifierId: null,
      verificationStatus: VerificationStatus.PENDING,
      item: {
        createdBy: 'user-creator',
      },
    });

    prismaService.schematic.update.mockResolvedValue({
      id: 'schematic-1',
      verificationStatus: VerificationStatus.VERIFIED,
      verifierId: 'admin-1',
    });

    await service.update('schematics', 'schematic-1', session, 'verify');

    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-creator',
        code: 'verification.approved',
        params: expect.objectContaining({
          itemType: 'schematics',
          itemId: 'schematic-1',
          itemName: 'Logic Controller',
          credits: 30,
        }),
        groupKey: 'schematics:schematic-1',
      }),
    );
  });

  it('should dispatch verification.rejected notification when an item is rejected without reason', async () => {
    const session = {
      id: 'admin-1',
      name: 'Admin',
      authorities: ['schematic:manage'],
    } as any;

    prismaService.schematic.findFirstOrThrow.mockResolvedValue({
      id: 'schematic-1',
      name: 'Bad Drill',
      verifierId: null,
      verificationStatus: VerificationStatus.PENDING,
      item: {
        createdBy: 'user-creator',
      },
    });

    prismaService.schematic.update.mockResolvedValue({
      id: 'schematic-1',
      verificationStatus: VerificationStatus.REJECTED,
      verifierId: 'admin-1',
    });

    await service.update('schematics', 'schematic-1', session, 'reject');

    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-creator',
        code: 'verification.rejected',
        params: expect.objectContaining({
          itemType: 'schematics',
          itemId: 'schematic-1',
          itemName: 'Bad Drill',
          reason: undefined,
        }),
        groupKey: 'schematics:schematic-1',
      }),
    );
  });

  it('should dispatch verification.rejected notification when an item is rejected with reason', async () => {
    const session = {
      id: 'admin-1',
      name: 'Admin',
      authorities: ['schematic:manage'],
    } as any;

    prismaService.schematic.findFirstOrThrow.mockResolvedValue({
      id: 'schematic-1',
      name: 'Bad Drill',
      verifierId: null,
      verificationStatus: VerificationStatus.PENDING,
      item: {
        createdBy: 'user-creator',
      },
    });

    prismaService.schematic.update.mockResolvedValue({
      id: 'schematic-1',
      verificationStatus: VerificationStatus.REJECTED,
      verifierId: 'admin-1',
    });

    await service.update('schematics', 'schematic-1', session, 'reject', 'Duplicated');

    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-creator',
        code: 'verification.rejected',
        params: expect.objectContaining({
          itemType: 'schematics',
          itemId: 'schematic-1',
          itemName: 'Bad Drill',
          reason: 'Duplicated',
        }),
        groupKey: 'schematics:schematic-1',
      }),
    );
  });
});
