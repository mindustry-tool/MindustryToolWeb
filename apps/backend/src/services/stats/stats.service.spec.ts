import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { StatsService } from './stats.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;
  let cacheManager: any;
  let prisma: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    prisma = {
      ipVisit: {
        upsert: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(10),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  describe('getClientFromMetricId', () => {
    it('returns "mod" when metricId starts with "mod:"', () => {
      expect(service.getClientFromMetricId('mod:test-uuid-123')).toBe('mod');
    });

    it('returns "web" when metricId starts with "web:"', () => {
      expect(service.getClientFromMetricId('web:test-uuid-123')).toBe('web');
    });

    it('returns "unknown" when metricId has no known prefix', () => {
      expect(service.getClientFromMetricId('raw-uuid-123')).toBe('unknown');
    });
  });

  describe('recordVisit', () => {
    it('upserts with client "web" for web metric ID when not cached', async () => {
      cacheManager.get.mockResolvedValue(null);

      await service.recordVisit('web:visitor-1');

      expect(cacheManager.set).toHaveBeenCalledWith('metric-visit:web:visitor-1', '1', 3_600_000);
      expect(prisma.ipVisit.upsert).toHaveBeenCalledWith({
        where: { ip: 'web:visitor-1' },
        update: expect.objectContaining({ client: 'web' }),
        create: expect.objectContaining({ ip: 'web:visitor-1', client: 'web' }),
      });
    });

    it('upserts with client "mod" for mod metric ID when not cached', async () => {
      cacheManager.get.mockResolvedValue(null);

      await service.recordVisit('mod:visitor-2');

      expect(prisma.ipVisit.upsert).toHaveBeenCalledWith({
        where: { ip: 'mod:visitor-2' },
        update: expect.objectContaining({ client: 'mod' }),
        create: expect.objectContaining({ ip: 'mod:visitor-2', client: 'mod' }),
      });
    });

    it('upserts with client "unknown" for unprefixed metric ID when not cached', async () => {
      cacheManager.get.mockResolvedValue(null);

      await service.recordVisit('raw-visitor-3');

      expect(prisma.ipVisit.upsert).toHaveBeenCalledWith({
        where: { ip: 'raw-visitor-3' },
        update: expect.objectContaining({ client: 'unknown' }),
        create: expect.objectContaining({ ip: 'raw-visitor-3', client: 'unknown' }),
      });
    });

    it('skips database write when metric ID is cached', async () => {
      cacheManager.get.mockResolvedValue('1');

      await service.recordVisit('web:visitor-1');

      expect(prisma.ipVisit.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getVisitCounts', () => {
    it('returns total, web, mod, and unknown counts for daily, weekly, monthly', async () => {
      prisma.ipVisit.count.mockImplementation(({ where }: any) => {
        if (where?.client === 'mod') return Promise.resolve(3);
        if (where?.client === 'web') return Promise.resolve(5);
        if (where?.client === 'unknown') return Promise.resolve(2);
        return Promise.resolve(10);
      });

      const end = new Date();
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      const result = await service.getVisitCounts(start, end);

      expect(result).toEqual({
        daily: { total: 10, web: 5, mod: 3, unknown: 2 },
        weekly: { total: 10, web: 5, mod: 3, unknown: 2 },
        monthly: { total: 10, web: 5, mod: 3, unknown: 2 },
      });
    });
  });
});
