import { PrismaService } from '@/prisma/prisma.service';
import { ItemService } from '@/services/item/item.service';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { isDownloadRecently } from '@/utils/cache.utils';
import { tagToDto } from '@/utils/dto.utils';
import { mapSort } from '@/utils/query.utils';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import { ContentPatchDto, Session } from '@mindustry-tool/api';
import { Cache } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ItemType, VerificationStatus } from '@/generated/prisma/client';
import { VerifyService } from '@/services/verify/verify.service';

@Injectable()
export class ContentPatchesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly itemService: ItemService,
    private readonly prometheusService: PrometheusService,
    private readonly verifyService: VerifyService,
    private cacheManager: Cache,
  ) {}

  async getAll(query: ApiQuery<typeof api.v4.contentPatches.getAll>) {
    const { name, tags, author, sort, page, size, verification } = query;

    const orderBy = mapSort(sort);

    if (tags) {
      for (const tag of tags) {
        this.prometheusService.tagCounter.inc({
          type: 'content-pacth',
          tag,
        });
      }
    }

    const tagFilters = tags
      ? tags.map((tagValue) => ({
          item: {
            tags: {
              some: {
                tag: {
                  fullTag: tagValue,
                },
              },
            },
          },
        }))
      : [];

    const result = await this.prismaService.contentPatch.findMany({
      where: {
        name: name
          ? {
              contains: name,
            }
          : undefined,
        verificationStatus: verification === 'ALL' ? undefined : verification,
        item: {
          createdBy: author ? author : undefined,
        },
        AND: tagFilters,
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        likes: true,
        downloads: true,
        comments: true,
        itemId: true,
      },
      skip: page * size,
      take: size,
      orderBy,
    });

    return result;
  }

  async getCount(query: ApiQuery<typeof api.v4.contentPatches.count>) {
    const { name, tags, author, verification } = query;

    const tagFilters = tags
      ? tags.map((tagValue) => ({
          item: {
            tags: {
              some: {
                tag: {
                  fullTag: tagValue,
                },
              },
            },
          },
        }))
      : [];

    const result = await this.prismaService.contentPatch.count({
      where: {
        name: name
          ? {
              contains: name,
            }
          : undefined,
        verificationStatus: verification === 'ALL' ? undefined : verification,
        item: {
          createdBy: author ? author : undefined,
        },
        AND: tagFilters,
      },
    });

    return result;
  }

  async get(id: string) {
    const result = await this.prismaService.contentPatch.findUniqueOrThrow({
      where: { itemId: id },
      include: {
        item: {
          include: {
            tags: {
              include: {
                tag: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const { item, ...contentPatch } = result;
    const tags = item.tags
      .map((t) => tagToDto(t.tag))
      .sort((a, b) => a.position - b.position);

    let children: ContentPatchDto[] = [];

    if (contentPatch.type === 'DATAPACK') {
      const json = JSON.parse(contentPatch.data) as string[];

      children = await this.prismaService.contentPatch.findMany({
        where: {
          id: {
            in: json,
          },
        },
      });
    }

    return { ...item, ...contentPatch, tags, children };
  }

  async create(body: ApiBody<typeof api.v4.contentPatches.create>, user: Session) {
    const { name, description, data, type } = body;

    return this.prismaService.$transaction(async (tx) => {
      const item = await this.itemService.create(user.id, tx, {
        tags: [],
        type: ItemType.CONTENT_PATCH,
      });

      const contentPatch = await tx.contentPatch.create({
        data: {
          name,
          description,
          type,
          data,
          itemId: item.id,
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      this.verifyService.sendNotification('content-patches', item.id, 'create');

      return contentPatch;
    }) as Promise<ContentPatchDto>;
  }

  async data(id: string, ip: string) {
    const hasDownload = await isDownloadRecently(this.cacheManager, ip, id);

    if (!hasDownload) {
      await this.prismaService.contentPatch.update({
        where: {
          itemId: id,
        },
        data: {
          downloads: {
            increment: 1,
          },
        },
      });

      this.prometheusService.downloadCounter.inc({ type: 'content-patch' });
    }

    const contentPatch = await this.prismaService.contentPatch.findUniqueOrThrow({
      where: {
        itemId: id,
      },
    });

    return contentPatch.data;
  }
}
