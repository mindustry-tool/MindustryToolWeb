import { HttpException, HttpStatus } from '@nestjs/common';
import {
  BLOCK_DURATION_MS,
  MAX_ACTION_REQUEST_PER_WINDOW,
  MAX_REQUEST_PER_WINDOW,
  RateLimiter,
  STRIKE_WINDOW_MS,
} from './rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  describe('Delimited route key (Task 3.2)', () => {
    it('isolates route and IP pairs that would collide under naive concatenation', () => {
      // Under naive concatenation "GET /items/1" + "2.3.4" and "GET /items/" + "12.3.4" both become "GET /items/12.3.4"
      const ipA = '2.3.4';
      const templateA = '/items/1';

      const ipB = '12.3.4';
      const templateB = '/items/';

      // 1 request allowed per minute
      limiter.checkPerRouteLimit('GET', templateA, ipA, 1, 'minute', 1000);
      limiter.checkPerRouteLimit('GET', templateB, ipB, 1, 'minute', 1000);

      // Second request on templateA/ipA exceeds limit
      expect(() => {
        limiter.checkPerRouteLimit('GET', templateA, ipA, 1, 'minute', 1000);
      }).toThrow(HttpException);

      const keyA = limiter.buildRouteKey('GET', templateA, ipA);
      const keyB = limiter.buildRouteKey('GET', templateB, ipB);

      expect(keyA).not.toEqual(keyB);
      expect(limiter.getBucket('route', keyA)?.requests.length).toBe(2);
      expect(limiter.getBucket('route', keyB)?.requests.length).toBe(1);
    });
  });

  describe('Cursor trimming and timestamp order (Task 3.3)', () => {
    it('trims expired requests in place and preserves accurate counts across window boundaries', () => {
      const ip = '192.168.1.1';
      const method = 'POST';
      const template = '/test';
      const limit = 2; // 2 requests per second (1000ms)

      // Request 1 at t=100
      limiter.checkPerRouteLimit(method, template, ip, limit, 'second', 100);
      // Request 2 at t=200
      limiter.checkPerRouteLimit(method, template, ip, limit, 'second', 200);

      // Request 3 at t=300 (exceeds limit 2)
      expect(() => {
        limiter.checkPerRouteLimit(method, template, ip, limit, 'second', 300);
      }).toThrow(HttpException);

      const key = limiter.buildRouteKey(method, template, ip);
      let bucket = limiter.getBucket('route', key);
      expect(bucket?.requests).toEqual([100, 200, 300]);

      // Request at t=1150 (t=100 has expired since 100 + 1000 <= 1150; t=200 and t=300 are retained)
      expect(() => {
        limiter.checkPerRouteLimit(method, template, ip, limit, 'second', 1150);
      }).toThrow(HttpException);

      bucket = limiter.getBucket('route', key);
      expect(bucket?.requests).toEqual([200, 300, 1150]);

      // Request at t=2500 (all previous requests have expired)
      limiter.checkPerRouteLimit(method, template, ip, limit, 'second', 2500);

      bucket = limiter.getBucket('route', key);
      expect(bucket?.requests).toEqual([2500]);
    });
  });

  describe('Strike retention across sweeping (Task 3.4)', () => {
    it('retains strike across repeated sweeps until strike interval elapses', () => {
      const ip = '10.0.0.1';
      const t0 = 10_000;

      // Exhaust global limit and trip
      for (let i = 0; i < MAX_REQUEST_PER_WINDOW; i++) {
        limiter.checkTierLimit(ip, false, t0);
      }
      expect(() => limiter.checkTierLimit(ip, false, t0)).toThrow(HttpException);

      expect(limiter.getStrike(ip)).toEqual({ strikeTime: t0 });

      // Run multiple sweeps before the strike interval (3 minutes = 180_000ms)
      limiter.sweep(t0 + 5_000);
      expect(limiter.getStrike(ip)).toBeDefined();

      limiter.sweep(t0 + 60_000);
      expect(limiter.getStrike(ip)).toBeDefined();

      limiter.sweep(t0 + STRIKE_WINDOW_MS - 1000);
      expect(limiter.getStrike(ip)).toBeDefined();

      // Sweeping after the strike interval has elapsed removes the strike
      limiter.sweep(t0 + STRIKE_WINDOW_MS + 1000);
      expect(limiter.getStrike(ip)).toBeUndefined();
    });
  });

  describe('Escalation to block (Task 3.5)', () => {
    it('escalates to temporary block on second limit trip within strike window', () => {
      const ip = '10.0.0.2';
      const t0 = 50_000;

      // Trip 1 on action tier
      for (let i = 0; i < MAX_ACTION_REQUEST_PER_WINDOW; i++) {
        limiter.checkTierLimit(ip, true, t0);
      }
      expect(() => limiter.checkTierLimit(ip, true, t0)).toThrow(HttpException);
      expect(limiter.getStrike(ip)).toEqual({ strikeTime: t0 });
      expect(limiter.isBlocked(ip, t0)).toBe(false);

      // Trip 2 within strike window (at t1 = t0 + 60s)
      const t1 = t0 + 60_000;
      for (let i = 0; i < MAX_ACTION_REQUEST_PER_WINDOW; i++) {
        limiter.checkTierLimit(ip, true, t1);
      }
      expect(() => limiter.checkTierLimit(ip, true, t1)).toThrow(HttpException);

      // IP is now escalated to blockMap and strike is cleared
      expect(limiter.getStrike(ip)).toBeUndefined();
      expect(limiter.isBlocked(ip, t1)).toBe(true);

      const block = limiter.getBlock(ip);
      expect(block).toBeDefined();
      expect(block?.blockedUntil).toBe(t1 + BLOCK_DURATION_MS);

      // Still blocked after 9 minutes
      expect(limiter.isBlocked(ip, t1 + 9 * 60 * 1000)).toBe(true);

      // Unblocked once block duration passes
      expect(limiter.isBlocked(ip, t1 + BLOCK_DURATION_MS + 1000)).toBe(false);
    });
  });

  describe('Per-route tier exemption from escalation (Task 3.6)', () => {
    it('returns 429 on repeated per-route limit trips without arming escalation strike or blocking IP', () => {
      const ip = '10.0.0.3';
      const now = 100_000;

      // Make 1 allowed request
      limiter.checkPerRouteLimit('GET', '/expensive', ip, 1, 'minute', now);

      // Trip the per-route limit multiple times
      for (let i = 0; i < 5; i++) {
        try {
          limiter.checkPerRouteLimit('GET', '/expensive', ip, 1, 'minute', now + i * 1000);
          fail('Expected 429');
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }
      }

      // No strike armed and IP not blocked
      expect(limiter.getStrike(ip)).toBeUndefined();
      expect(limiter.isBlocked(ip, now + 10_000)).toBe(false);
      expect(limiter.getBlock(ip)).toBeUndefined();
    });
  });
});
