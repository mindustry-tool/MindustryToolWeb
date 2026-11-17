import { OctokitService } from '@/services/octokit/octokit.service';
import { api } from '@mindustry-tool/api';
import { ApiQuery, ApiResult } from '@mindustry-tool/api';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from '@nestjs/cache-manager';
import { Response } from 'express';

@Injectable()
export class PluginService {
  constructor(
    private readonly octokitService: OctokitService,
    private readonly configService: ConfigService,
    private readonly cache: Cache,
  ) {}

  async downloadBuffer(owner: string, repo: string, tag: string) {
    const release = await this.octokitService.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag,
    });

    const assets = release.data.assets;

    if (assets.length === 0) {
      throw new BadRequestException('No assets found in the release');
    }

    const firstAsset = assets[0];

    const downloadUrl = firstAsset.url;
    const filename = firstAsset.name;

    const githubPat = this.configService.getOrThrow<string>('github.pat');

    const response = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/octet-stream',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Failed to download plugin: ${response.statusText} ${await response.text()}`);
    }

    return { filename, buffer: Buffer.from(await response.arrayBuffer()) };
  }

  async download(res: Response, query: ApiQuery<typeof api.v4.plugins.download>) {
    const { owner, repo, tag } = query;

    const { buffer } = await this.downloadBuffer(owner, repo, tag);

    const filename = `${owner}-${repo}-${tag}`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.msch"`);

    res.send(buffer);
  }

  async getReleaseVersion(owner: string, repo: string, tag: string) {
    const cacheKey = `plugin:${owner}:${repo}:${tag}`;

    const cached = await this.cache.get<{
      id: number;
      filename: string;
      updatedAt: string;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const release = await this.octokitService.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag,
    });

    if (release.data.assets.length === 0) {
      throw new BadRequestException('No assets found in the release');
    }

    const result = {
      id: release.data.id,
      filename: release.data.assets[0].name,
      updatedAt: release.data.updated_at || release.data.created_at,
    };

    await this.cache.set(cacheKey, result, 5 * 1000);

    return result;
  }

  async version(
    query: ApiQuery<typeof api.v4.plugins.version>,
  ): Promise<ApiResult<typeof api.v4.plugins.version>> {
    const { owner, repo, tag } = query;

    return this.getReleaseVersion(owner, repo, tag);
  }
}
