import { RoleService } from '@/services/role/role.service';
import { MemoryCacheService } from '@/services/memory-cache/memory-cache.service';
import { Session, sessionSchema } from '@mindustry-tool/api';
import { USER_AUTHORITIES } from '@mindustry-tool/api';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

type SessionWithMeta = {
  createdAt: number;
  expireAt: number;
  data: Session;
};

@Injectable()
export class RedisService extends Redis {
  _30DaysInSeconds = 30 * 24 * 60 * 60;
  _5MinuteInMs = 5 * 60 * 1000;

  private readonly logger = new Logger(RedisService.name);

  constructor(
    private configService: ConfigService,
    private memoryCacheService: MemoryCacheService,
    private roleService: RoleService,
  ) {
    const url: string = configService.getOrThrow('redis.url');
    super(url);
  }

  async scanPrefix(prefix: string): Promise<string[]> {
    const stream = this.scanStream({
      match: prefix,
    });

    const promise = new Promise<string[]>((resolve, reject) => {
      const result: string[] = [];
      stream.on('end', () => resolve(result));
      stream.on('error', reject);

      stream.on('data', (keys) => {
        result.push(...keys);
      });
    });

    return await promise;
  }

  async getRefreshToken(token: string, session: Session): Promise<Session | null> {
    const data = await this.get(`refresh:${session.id}:${token}`);

    if (data === null) {
      return null;
    }

    return JSON.parse(data);
  }

  async setRefreshToken(token: string, session: Session) {
    const data = JSON.stringify(session);
    await this.set(`refresh:${session.id}:${token}`, data, 'EX', this._30DaysInSeconds);
  }

  async invalidateRefreshToken(token: string, session: Session) {
    await this.del(`refresh:${session.id}:${token}`);
  }

  async clearUserLogin(id: string) {
    const refreshKeys = await this.keys(`refresh:${id}:*`);

    for (const key of refreshKeys) {
      await this.del(key);
      this.logger.log(`Deleted refresh key ${key}`);
    }

    const sessionKeys = await this.keys(`session:${id}:*`);

    for (const key of sessionKeys) {
      this.memoryCacheService.delete(key);
      await this.del(key);
      this.logger.log(`Deleted session key ${key}`);
    }
  }

  async getSession(key: string): Promise<{ data: Session; isExpired: boolean } | undefined> {
    let stored: string | undefined = this.memoryCacheService.get<string>(key);

    if (!stored) {
      stored = (await this.get(key)) || undefined;

      if (stored) {
        this.memoryCacheService.set(key, stored, this._5MinuteInMs);
      }
    }

    if (!stored) {
      return undefined;
    }

    const { expireAt, data } = JSON.parse(stored) as SessionWithMeta;

    if (!data) {
      return undefined;
    }

    try {
      return { data: await this.createSessionObject(data), isExpired: expireAt < Date.now() };
    } catch (error) {
      this.logger.warn('Fail to create session object', error);
    }

    return undefined;
  }

  async setSession(key: string, session: Session) {
    const data = JSON.stringify({
      data: session,
      createdAt: Date.now(),
      expireAt: Date.now() + this._30DaysInSeconds * 1000,
    } satisfies SessionWithMeta);

    await this.set(key, data, 'EX', this._30DaysInSeconds);
    this.memoryCacheService.set(key, data, this._5MinuteInMs);
  }

  async updateSession(id: string, updater: (session: Session) => Session) {
    const sessionKeys = await this.keys(`session:${id}:*`);

    for (const key of sessionKeys) {
      this.memoryCacheService.delete(key);
      const session = await this.getSession(key);

      if (!session) {
        continue;
      }

      const updatedSession = updater(session.data);
      await this.setSession(key, updatedSession);
    }
  }

  private async createSessionObject(session: Session) {
    const allRoles = await this.roleService.findAllWithCache();
    const roles = allRoles.filter((role) => session.roles.some((r) => r.id === role.id));

    const authorities = new Set<string>();

    session.authorities.forEach((auth) => authorities.add(auth));

    roles.forEach((role) => role.authorities.forEach((auth) => authorities.add(auth)));

    return sessionSchema.parse({
      ...session,
      authorities: [...authorities, ...USER_AUTHORITIES],
    });
  }
}
