import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  timeout: NodeJS.Timeout;
}

@Injectable()
export class MemoryCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(MemoryCacheService.name);

  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, value: T, ttl: number) {
    if (ttl <= 0) {
      throw new Error('TTL must be greater than 0');
    }

    this.delete(key);
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.logger.debug(`Cache entry for key ${key} expired`);
    }, ttl);

    this.cache.set(key, { value, timeout });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    return entry?.value;
  }

  delete(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      clearTimeout(entry.timeout);
      this.cache.delete(key);
    }
  }

  onModuleDestroy() {
    this.cache.forEach((entry) => clearTimeout(entry.timeout));
    this.cache.clear();
  }
}
