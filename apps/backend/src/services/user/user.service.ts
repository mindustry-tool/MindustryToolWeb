import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/services/redis/redis.service';
import { StatsService } from '@/services/stats/stats.service';
import { CreateUserDto } from '@/services/user/dto/create-user.dto';
import { GetAllUserQueryDto } from '@/services/user/dto/get-all-user-query.dto';
import { UpdateMyUsernameDto } from '@/services/user/dto/update-my-username.dto';
import { UpdateUserDto } from '@/services/user/dto/update-user.dto';
import { AuthProvider, UserWithRoleAndAuthority } from '@/types/types';
import { getSessionPrefix } from '@/utils/auth.utils';
import { api } from '@mindustry-tool/api';
import { ApiQuery } from '@mindustry-tool/api';
import { AuthorityEnum } from '@mindustry-tool/api';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

const AD_REWARD_CREDITS = 60;
const AD_REWARD_NONCE_TTL_SECONDS = 10 * 60;
const AD_REWARD_COOLDOWN_SECONDS = 60;
const AD_REWARD_DAILY_LIMIT = 10;
const AD_REWARD_DAILY_TTL_SECONDS = 24 * 60 * 60;

import { Role, User, UserStats } from '@/generated/prisma/client';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  private bot: User | undefined = undefined;

  private USER_CACHE_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
    private cache: Cache,
    private statsService: StatsService,
  ) {}

  async getBot() {
    if (this.bot === undefined) {
      this.bot = await this.prismaService.user.findFirstOrThrow({
        where: {
          id: '019a26a1-a5b1-7cd3-bfbb-f98327ad5196',
        },
      });
    }

    return this.bot;
  }

  async findDiscordUser(id: string) {
    const user = await this.findUserByProviderId(id, 'discord');

    if (user === null) {
      throw new NotFoundException();
    }

    return user;
  }

  async find(id: string) {
    const cacheKey = `user:${id}`;
    const cacheData = await this.cache.get<UserWithRoleAndAuthority>(cacheKey);

    if (cacheData) {
      return cacheData;
    }

    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
      })
      .then((user) => this.mapToDto(user));

    await this.cache.set(cacheKey, user, this.USER_CACHE_MS);

    return user;
  }

  async findUserByProviderId(providerId: string, provider: AuthProvider): Promise<UserWithRoleAndAuthority | null> {
    return this.prismaService.account
      .findFirst({
        where: {
          providerId,
          provider,
        },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
              stats: true,
            },
          },
        },
      })
      .then((res) => res?.user)
      .then((user) => (user ? this.mapToDto(user) : null));
  }

  async updateUserByProviderId(
    providerId: string,
    provider: AuthProvider,
    data: Pick<User, 'name' | 'imageUrl'>,
  ): Promise<UserWithRoleAndAuthority> {
    return this.prismaService.account
      .update({
        where: {
          providerId_provider: {
            providerId,
            provider,
          },
        },
        data: {
          user: {
            update: {
              ...data,
            },
          },
        },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
              stats: true,
            },
          },
        },
      })
      .then((res) => this.mapToDto(res.user));
  }

  async createUser(
    providerId: string,
    provider: AuthProvider,
    {
      imageUrl,
      name,
    }: {
      imageUrl: string;
      name: string;
    },
  ): Promise<UserWithRoleAndAuthority> {
    return this.prismaService.user
      .create({
        data: {
          name,
          imageUrl,
          createdAt: new Date(),
          account: {
            create: {
              providerId,
              provider,
              createdAt: new Date(),
            },
          },
          stats: {
            create: {
              name: 'credit',
              value: 60,
            },
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
      })
      .then((res) => this.mapToDto(res));
  }

  async getUserBatch(ids: string[]) {
    return this.prismaService.user
      .findMany({
        where: {
          id: {
            in: ids,
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
      })
      .then((items) => items.map((item) => this.mapToDto(item)));
  }

  async search(q: string | undefined) {
    return this.prismaService.user
      .findMany({
        where: {
          name: {
            contains: q,
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
        take: 10,
      })
      .then((items) => items.map((item) => this.mapToDto(item)));
  }

  async findAll(query: GetAllUserQueryDto) {
    const { page, size, role, name } = query;

    return this.prismaService.user
      .findMany({
        where: {
          roles: role
            ? {
                some: {
                  role: {
                    id: role,
                  },
                },
              }
            : undefined,
          name: name
            ? {
                contains: name,
              }
            : undefined,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
        orderBy: {
          id: 'desc',
        },
        skip: page * size,
        take: size,
      })
      .then((items) => items.map((item) => this.mapToDto(item)));
  }

  async count(query: ApiQuery<typeof api.v4.users.count>) {
    return this.prismaService.user.count({
      where: {
        roles: query.role
          ? {
              some: {
                role: {
                  id: query.role,
                },
              },
            }
          : undefined,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithRoleAndAuthority> {
    return this.prismaService.user
      .create({
        data: {
          ...createUserDto,
          createdAt: new Date(),
          stats: {
            create: {
              name: 'credit',
              value: 60,
            },
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
      })
      .then((res) => this.mapToDto(res));
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.prismaService.user
      .update({
        where: {
          id,
        },
        data: {
          authorities: updateUserDto.authorities,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
      })
      .then((res) => this.mapToDto(res));

    const keys = await this.redisService.scanPrefix(getSessionPrefix(id));
    const cacheKey = `user:${id}`;

    await this.cache.set(cacheKey, result, this.USER_CACHE_MS);

    await Promise.all(keys.map((key) => this.redisService.setSession(key, result)));

    return result;
  }

  async updateMyUsername(id: string, updateMyUsernameDto: UpdateMyUsernameDto) {
    const result = await this.prismaService.user
      .update({
        where: {
          id,
        },
        data: {
          name: updateMyUsernameDto.name,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
      })
      .then((res) => this.mapToDto(res));

    await this.redisService.updateSession(id, (session) => ({
      ...session,
      name: result.name,
    }));
  }

  async updateUserRoles(id: string, roles: string[]) {
    const result = await this.prismaService.user
      .update({
        where: {
          id,
        },
        data: {
          roles: {
            deleteMany: {},
            create: roles.map((roleId) => ({
              role: {
                connect: {
                  id: roleId,
                },
              },
            })),
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          stats: true,
        },
      })
      .then((res) => this.mapToDto(res));

    const keys = await this.redisService.scanPrefix(getSessionPrefix(id));
    const cacheKey = `user:${id}`;

    await this.cache.set(cacheKey, result, this.USER_CACHE_MS);

    await Promise.all(keys.map((key) => this.redisService.setSession(key, result)));

    return result;
  }

  private mapToDto(
    user: User & {
      roles: { role: Role }[];
      stats: UserStats[];
    },
  ): UserWithRoleAndAuthority {
    const roles = user.roles.map((r) => r.role);
    const authorities = [
      ...new Set(user.authorities.concat(roles.flatMap((role) => role.authorities))),
    ] as AuthorityEnum[];

    const stats = user.stats.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.value }), {});

    return {
      ...user,
      roles,
      authorities,
      stats,
    };
  }

  async ban(id: string, bannedUntil?: Date | null) {
    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        bannedUntil,
      },
    });

    await this.redisService.clearUserLogin(id);
  }

  private getAdRewardKeys(userId: string) {
    const utcDate = new Date().toISOString().slice(0, 10);
    return {
      cooldownKey: `ad_cooldown:${userId}`,
      dailyKey: `ad_daily:${userId}:${utcDate}`,
    };
  }

  private async assertAdRewardEligible(userId: string) {
    const { cooldownKey, dailyKey } = this.getAdRewardKeys(userId);
    const [cooldownActive, dailyRaw] = await Promise.all([
      this.redisService.get(cooldownKey),
      this.redisService.get(dailyKey),
    ]);

    if (cooldownActive) {
      throw new HttpException('Please wait before claiming another ad reward', HttpStatus.TOO_MANY_REQUESTS);
    }

    if (Number(dailyRaw || 0) >= AD_REWARD_DAILY_LIMIT) {
      throw new HttpException('Daily ad reward limit reached', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async createAdRewardSession(userId: string) {
    await this.assertAdRewardEligible(userId);

    const nonce = randomUUID();
    const expiresAt = new Date(Date.now() + AD_REWARD_NONCE_TTL_SECONDS * 1000);

    await this.redisService.set(`ad_nonce:${userId}:${nonce}`, '1', 'EX', AD_REWARD_NONCE_TTL_SECONDS);

    return {
      nonce,
      expiresAt,
    };
  }

  async claimAdReward(userId: string, nonce: string) {
    await this.assertAdRewardEligible(userId);

    const deleted = await this.redisService.del(`ad_nonce:${userId}:${nonce}`);
    if (deleted !== 1) {
      throw new BadRequestException('Invalid or expired ad reward session');
    }

    const { cooldownKey, dailyKey } = this.getAdRewardKeys(userId);
    const cooldownAcquired = await this.redisService.set(
      cooldownKey,
      '1',
      'EX',
      AD_REWARD_COOLDOWN_SECONDS,
      'NX',
    );
    if (cooldownAcquired !== 'OK') {
      throw new HttpException('Please wait before claiming another ad reward', HttpStatus.TOO_MANY_REQUESTS);
    }

    const dailyCount = await this.redisService.incr(dailyKey);
    if (dailyCount === 1) {
      await this.redisService.expire(dailyKey, AD_REWARD_DAILY_TTL_SECONDS);
    }

    if (dailyCount > AD_REWARD_DAILY_LIMIT) {
      await this.redisService.decr(dailyKey);
      throw new HttpException('Daily ad reward limit reached', HttpStatus.TOO_MANY_REQUESTS);
    }

    try {
      await this.statsService.addStats({
        userId,
        name: 'credit',
        amount: AD_REWARD_CREDITS,
        tx: this.prismaService,
      });
    } catch (error) {
      await this.redisService.decr(dailyKey);
      throw error;
    }

    await this.cache.del(`user:${userId}`);

    return {
      granted: AD_REWARD_CREDITS,
      remainingDaily: Math.max(0, AD_REWARD_DAILY_LIMIT - dailyCount),
    };
  }
}
