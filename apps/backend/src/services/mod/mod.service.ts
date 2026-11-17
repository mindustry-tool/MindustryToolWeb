import { OctokitService } from '@/services/octokit/octokit.service';
import { RedisService } from '@/services/redis/redis.service';
import { api } from '@mindustry-tool/api';
import { ApiParams, ApiQuery } from '@mindustry-tool/api';
import { ModDto, modDtoSchema } from '@mindustry-tool/api';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod/v4-mini';

@Injectable()
export class ModService {
  CACHE_TIME = 60 * 60;

  private readonly logger = new Logger(ModService.name);

  constructor(
    private readonly octokitService: OctokitService,
    private readonly redisService: RedisService,
  ) {}

  async findAll(query: ApiQuery<typeof api.v4.mods.findAll>): Promise<ModDto[]> {
    const { page, size, tag } = query;
    const cacheKey = `mods?page=${page}&size=${size}&tag=${tag}`;

    let cached: ModDto[] | undefined = undefined;

    try {
      const cachedString = await this.redisService.get(cacheKey);
      if (cachedString) {
        cached = z.array(modDtoSchema).parse(JSON.parse(cachedString));
      }
    } catch (error) {
      this.logger.log(error);
    }

    if (cached) {
      return cached;
    }

    const { data } = await this.octokitService.rest.search.repos({
      q: `topic:${tag}`,
      page: page + 1,
      per_page: size,
    });

    await this.redisService.set(cacheKey, JSON.stringify(data.items), 'EX', this.CACHE_TIME);

    return data.items;
  }

  async count(query: ApiQuery<typeof api.v4.mods.count>) {
    const { tag } = query;
    const cacheKey = `mods:count:${tag}`;

    let cached: number | undefined = undefined;
    try {
      const cachedString = await this.redisService.get(cacheKey);

      if (cachedString) {
        cached = Number(cachedString);
      }
    } catch (error) {
      this.logger.log(error);
    }

    if (cached) {
      return cached;
    }

    const { data } = await this.octokitService.rest.search.repos({
      q: `topic:${tag}`,
    });

    await this.redisService.set(cacheKey, data.total_count, 'EX', this.CACHE_TIME);

    return data.total_count;
  }

  async findAllRelease(params: ApiParams<typeof api.v4.mods.releases.findAll>, query: ApiQuery<typeof api.v4.mods.releases.findAll>) {
    const { page, size } = query;
    const { owner, repo } = params;

    const response = await this.octokitService.rest.repos.listReleases({
      owner,
      repo,
      page: page + 1,
      per_page: size,
    });

    return response.data;
  }
}
