import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '@/prisma/prisma.service';
import { TransactionContext } from '@/types/types';
import { VisitCountsDto } from '@mindustry-tool/api';

@Injectable()
export class StatsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  getClientFromMetricId(metricId: string): string {
    if (metricId.startsWith('mod:')) {
      return 'mod';
    }
    if (metricId.startsWith('web:')) {
      return 'web';
    }
    return 'unknown';
  }

  async recordVisit(metricId: string) {
    const key = `metric-visit:${metricId}`;
    const cached = await this.cacheManager.get<string>(key);

    if (cached) {
      return;
    }

    const client = this.getClientFromMetricId(metricId);

    await this.cacheManager.set(key, '1', 3_600_000);
    await this.prisma.ipVisit.upsert({
      where: { ip: metricId },
      update: { lastAccess: new Date(), client },
      create: { ip: metricId, client, lastAccess: new Date() },
    });
  }

  async getVisitCounts(start: Date, end: Date): Promise<VisitCountsDto> {
    const oneDay = 24 * 60 * 60 * 1000;
    const dailySince = new Date(end.getTime() - oneDay);
    const weeklySince = new Date(end.getTime() - 7 * oneDay);
    const monthlySince = start;

    const countFor = async (client?: string) => {
      const clientFilter = client ? { client } : {};
      const [daily, weekly, monthly] = await Promise.all([
        this.prisma.ipVisit.count({
          where: { ...clientFilter, lastAccess: { gte: dailySince, lte: end } },
        }),
        this.prisma.ipVisit.count({
          where: { ...clientFilter, lastAccess: { gte: weeklySince, lte: end } },
        }),
        this.prisma.ipVisit.count({
          where: { ...clientFilter, lastAccess: { gte: monthlySince, lte: end } },
        }),
      ]);
      return { daily, weekly, monthly };
    };

    const [total, web, mod, unknown] = await Promise.all([
      countFor(),
      countFor('web'),
      countFor('mod'),
      countFor('unknown'),
    ]);

    return {
      daily: {
        total: total.daily,
        web: web.daily,
        mod: mod.daily,
        unknown: unknown.daily,
      },
      weekly: {
        total: total.weekly,
        web: web.weekly,
        mod: mod.weekly,
        unknown: unknown.weekly,
      },
      monthly: {
        total: total.monthly,
        web: web.monthly,
        mod: mod.monthly,
        unknown: unknown.monthly,
      },
    };
  }

  async addStats({
    tx,
    userId,
    amount,
    name,
  }: {
    userId: string;
    name: string;
    amount: number;
    tx: TransactionContext;
  }) {
    await tx.userStats.upsert({
      where: {
        userId_name: {
          userId,
          name: name,
        },
      },
      update: {
        value: {
          increment: amount,
        },
      },
      create: {
        userId,
        name: name,
        value: amount,
      },
    });
  }
}
