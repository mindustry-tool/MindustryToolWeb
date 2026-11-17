import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  BlockRecord,
  RateLimitUnit,
  RequestBucket,
  RequestLimitMap,
  StrikeRecord,
} from './rate-limiter.types';

export const MAX_REQUEST_PER_WINDOW = 10000;
export const MAX_ACTION_REQUEST_PER_WINDOW = 60;
export const REQUEST_EXPIRE_AFTER_MS = 30 * 1000;
export const STRIKE_WINDOW_MS = 3 * 60 * 1000;
export const BLOCK_DURATION_MS = 5 * 60 * 1000;

const UNIT_MS: Record<RateLimitUnit, number> = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

export class RateLimiter {
  private readonly logger = new Logger(RateLimiter.name);

  private readonly blockMap = new Map<string, BlockRecord>();
  private readonly markMap = new Map<string, StrikeRecord>();
  private readonly globalRequests: RequestLimitMap = new Map();
  private readonly actionRequests: RequestLimitMap = new Map();
  private readonly routeRequests: RequestLimitMap = new Map();

  buildRouteKey(method: string, template: string, ip: string): string {
    return `${method}:${template}:${ip}`;
  }

  isBlocked(ip: string, now: number = Date.now()): boolean {
    const block = this.blockMap.get(ip);
    if (!block) {
      return false;
    }
    if (block.blockedUntil <= now) {
      this.blockMap.delete(ip);
      return false;
    }
    return true;
  }

  checkPerRouteLimit(
    method: string,
    template: string,
    ip: string,
    limit: number,
    unit: RateLimitUnit,
    now: number = Date.now(),
  ): void {
    const key = this.buildRouteKey(method, template, ip);
    const time = UNIT_MS[unit];
    this.checkRateLimited(
      key,
      ip,
      this.routeRequests,
      time,
      limit,
      `Per route limit: ${limit} ${unit}`,
      false,
      now,
    );
  }

  checkTierLimit(ip: string, isAction: boolean, now: number = Date.now()): void {
    if (isAction) {
      this.checkRateLimited(
        ip,
        ip,
        this.actionRequests,
        REQUEST_EXPIRE_AFTER_MS,
        MAX_ACTION_REQUEST_PER_WINDOW,
        `Per action limit: ${MAX_ACTION_REQUEST_PER_WINDOW} requests per window`,
        true,
        now,
      );
    } else {
      this.checkRateLimited(
        ip,
        ip,
        this.globalRequests,
        REQUEST_EXPIRE_AFTER_MS,
        MAX_REQUEST_PER_WINDOW,
        `Per global limit: ${MAX_REQUEST_PER_WINDOW} requests per window`,
        true,
        now,
      );
    }
  }

  private checkRateLimited(
    key: string,
    ip: string,
    requestMap: RequestLimitMap,
    expireAfterMs: number,
    limit: number,
    limitName: string,
    escalate: boolean,
    now: number,
  ): void {
    let entry = requestMap.get(key);
    if (entry === undefined) {
      entry = { expireAfterMs, requests: [] };
      requestMap.set(key, entry);
    }

    let expiredCount = 0;
    const requests = entry.requests;
    while (expiredCount < requests.length && requests[expiredCount] + expireAfterMs <= now) {
      expiredCount++;
    }
    if (expiredCount > 0) {
      requests.splice(0, expiredCount);
    }

    requests.push(now);

    if (requests.length > limit) {
      if (escalate) {
        const strike = this.markMap.get(ip);
        if (strike === undefined || now > strike.strikeTime + STRIKE_WINDOW_MS) {
          this.markMap.set(ip, { strikeTime: now });
        } else if (!this.blockMap.has(ip)) {
          this.blockMap.set(ip, { blockedUntil: now + BLOCK_DURATION_MS, reason: limitName });
          this.markMap.delete(ip);
          this.logger.log(`Block ${ip} ${limitName}`);
        }
      }

      throw new HttpException('Too many request', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  sweep(now: number = Date.now()): void {
    this.clearRequestLimitMap(this.globalRequests, now);
    this.clearRequestLimitMap(this.actionRequests, now);
    this.clearRequestLimitMap(this.routeRequests, now);

    for (const [key, value] of this.blockMap) {
      if (value.blockedUntil <= now) {
        this.blockMap.delete(key);
      }
    }

    for (const [key, strike] of this.markMap) {
      if (now > strike.strikeTime + STRIKE_WINDOW_MS) {
        this.markMap.delete(key);
      }
    }
  }

  private clearRequestLimitMap(requestMap: RequestLimitMap, now: number): void {
    for (const [key, entry] of requestMap) {
      if (entry.requests.length === 0) {
        requestMap.delete(key);
        continue;
      }

      if (entry.requests[0] + entry.expireAfterMs > now) {
        continue;
      }

      let i = 0;
      while (i < entry.requests.length && entry.requests[i] + entry.expireAfterMs <= now) {
        i++;
      }

      if (i >= entry.requests.length) {
        requestMap.delete(key);
      } else if (i > 0) {
        entry.requests.splice(0, i);
      }
    }
  }

  getStrike(ip: string): StrikeRecord | undefined {
    return this.markMap.get(ip);
  }

  getBlock(ip: string): BlockRecord | undefined {
    return this.blockMap.get(ip);
  }

  getBucket(type: 'global' | 'action' | 'route', key: string): RequestBucket | undefined {
    if (type === 'global') return this.globalRequests.get(key);
    if (type === 'action') return this.actionRequests.get(key);
    return this.routeRequests.get(key);
  }

  reset(): void {
    this.blockMap.clear();
    this.markMap.clear();
    this.globalRequests.clear();
    this.actionRequests.clear();
    this.routeRequests.clear();
  }
}

export const rateLimiter = new RateLimiter();

export function clearRequestCron(now: number = Date.now()): void {
  rateLimiter.sweep(now);
}
