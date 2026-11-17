import { Injectable } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import leoProfanity from 'leo-profanity';
import { createHash } from 'node:crypto';

type SanitizedTextResult = {
  value: string;
  filtered: boolean;
};

const PLAYER_CONNECT_EXTRA_PROFANITY = ['asshole', 'motherfucker', 'hitler'] as const;
const CACHE_TTL = 300_000;
const CACHE_KEY_PREFIX = 'profanity:sanitize:';

@Injectable()
export class ProfanityService {
  constructor(
    private readonly cache: Cache,
  ) {
    leoProfanity.add([...PLAYER_CONNECT_EXTRA_PROFANITY]);
  }

  async sanitizeText(value: string): Promise<SanitizedTextResult> {
    const cacheKey = this.getCacheKey(value);
    const cached = await this.cache.get<SanitizedTextResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const sanitizedValue = leoProfanity.clean(value);
    const result: SanitizedTextResult = {
      value: sanitizedValue,
      filtered: value !== sanitizedValue,
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  private getCacheKey(value: string): string {
    const hash = createHash('sha1').update(value).digest('hex');
    return `${CACHE_KEY_PREFIX}${hash}`;
  }
}
