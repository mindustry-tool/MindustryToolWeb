export type RateLimitUnit = 'second' | 'minute' | 'hour' | 'day';

export type LimitOptions = {
  limit?: [number, RateLimitUnit];
};

export type RequestBucket = {
  expireAfterMs: number;
  requests: number[];
};

export type RequestLimitMap = Map<string, RequestBucket>;

export type BlockRecord = {
  blockedUntil: number;
  reason: string;
};

export type StrikeRecord = {
  strikeTime: number;
};
