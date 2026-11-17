import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/services/redis/redis.service';
import { StatsService } from '@/services/stats/stats.service';

describe('UserService - ad rewards', () => {
  let service: UserService;
  let store: Map<string, string>;
  let redisService: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    incr: jest.Mock;
    expire: jest.Mock;
    decr: jest.Mock;
  };
  let cache: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };
  let statsService: {
    addStats: jest.Mock;
  };

  beforeEach(async () => {
    store = new Map();

    redisService = {
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      set: jest.fn(async (key: string, value: string, ...args: unknown[]) => {
        if (args.includes('NX') && store.has(key)) {
          return null;
        }
        store.set(key, value);
        return 'OK';
      }),
      del: jest.fn(async (key: string) => (store.delete(key) ? 1 : 0)),
      incr: jest.fn(async (key: string) => {
        const next = Number(store.get(key) ?? '0') + 1;
        store.set(key, String(next));
        return next;
      }),
      expire: jest.fn(async () => 1),
      decr: jest.fn(async (key: string) => {
        const next = Number(store.get(key) ?? '0') - 1;
        store.set(key, String(next));
        return next;
      }),
    };

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };

    statsService = {
      addStats: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: {} },
        { provide: RedisService, useValue: redisService },
        { provide: Cache, useValue: cache },
        { provide: StatsService, useValue: statsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('issues a single-use nonce and grants 60 credits on valid claim', async () => {
    const session = await service.createAdRewardSession('user-1');

    expect(session.nonce).toBeTruthy();
    expect(session.expiresAt).toBeInstanceOf(Date);

    const result = await service.claimAdReward('user-1', session.nonce);

    expect(result).toEqual({ granted: 60, remainingDaily: 9 });
    expect(statsService.addStats).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'credit',
      amount: 60,
      tx: {},
    });
    expect(cache.del).toHaveBeenCalledWith('user:user-1');
  });

  it('rejects replayed nonce claims', async () => {
    const session = await service.createAdRewardSession('user-1');
    await service.claimAdReward('user-1', session.nonce);

    // Clear cooldown to isolate replay protection
    store.delete('ad_cooldown:user-1');

    await expect(service.claimAdReward('user-1', session.nonce)).rejects.toThrow(BadRequestException);
    expect(statsService.addStats).toHaveBeenCalledTimes(1);
  });

  it('rejects foreign or unknown nonce claims', async () => {
    const session = await service.createAdRewardSession('user-1');

    await expect(service.claimAdReward('user-2', session.nonce)).rejects.toThrow(BadRequestException);
    await expect(service.claimAdReward('user-1', 'non-existent')).rejects.toThrow(BadRequestException);
    expect(statsService.addStats).not.toHaveBeenCalled();
  });

  it('enforces the 1-minute cooldown between claims', async () => {
    const first = await service.createAdRewardSession('user-1');
    await service.claimAdReward('user-1', first.nonce);

    await expect(service.createAdRewardSession('user-1')).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    // Even with a pre-issued nonce, claim during cooldown is rejected
    store.set('ad_nonce:user-1:pre-issued', '1');
    await expect(service.claimAdReward('user-1', 'pre-issued')).rejects.toThrow(HttpException);
    expect(statsService.addStats).toHaveBeenCalledTimes(1);
  });

  it('enforces the 10-claims-per-day cap', async () => {
    const utcDate = new Date().toISOString().slice(0, 10);
    store.set(`ad_daily:user-1:${utcDate}`, '10');

    await expect(service.createAdRewardSession('user-1')).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    store.set('ad_nonce:user-1:cap-nonce', '1');
    await expect(service.claimAdReward('user-1', 'cap-nonce')).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(statsService.addStats).not.toHaveBeenCalled();
  });
});
