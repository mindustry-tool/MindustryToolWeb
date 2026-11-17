import { PrismaService } from '@/prisma/prisma.service';
import { ContentParserService } from '@/services/content-parser/content-parser.service';
import { ItemService } from '@/services/item/item.service';
import { SchematicPreviewDto } from '@/services/schematic/dto/schematic-preview.dto';
import { SchematicQueryDto } from '@/services/schematic/dto/schematic-query.dto';
import { SchematicUploadDto } from '@/services/schematic/dto/schematic-upload.dto';
import { isDownloadRecently } from '@/utils/cache.utils';
import { tagToDto } from '@/utils/dto.utils';
import { mapSort } from '@/utils/query.utils';
import { ApiError } from '@mindustry-tool/api';
import { contentParser } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { schematicPreviewSchema, Session, UpdateSchematicDto } from '@mindustry-tool/api';
import { getFallbackPreviewImage } from '@/utils/fallback-image.utils';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ItemType, VerificationStatus } from '@/generated/prisma/client';
import { z } from 'zod/v4-mini';
import { Cache } from '@nestjs/cache-manager';
import { CountSchematicQueryDto } from '@/services/schematic/dto/count-schematic-query';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { ImageProxyService } from '@/services/image-proxy/image-proxy.service';
import { PreviewImageQuery } from '@/types/query.types';
import { VerifyService } from '@/services/verify/verify.service';

@Injectable()
export class SchematicService {
  private readonly logger = new Logger(SchematicService.name);

  constructor(
    private contentParserService: ContentParserService,
    private prismaService: PrismaService,
    private itemService: ItemService,
    private cacheManager: Cache,
    private prometheusService: PrometheusService,
    private imageProxyService: ImageProxyService,
    private verifyService: VerifyService,
  ) {}

  createForm(body: SchematicPreviewDto) {
    const formData = new FormData();

    if (!body.data && !body.file) {
      throw new BadRequestException('Content is required');
    }

    if (body.file) {
      formData.append('data', new Blob([body.file.buffer as BlobPart]));
    }

    if (body.data) {
      const decodedData = Buffer.from(body.data, 'base64');
      formData.append('data', new Blob([decodedData]));
    }

    return formData;
  }

  async preview(body: SchematicPreviewDto): Promise<z.infer<typeof schematicPreviewSchema>> {
    const formData = this.createForm(body);

    return await this.contentParserService.apiInstance.request(contentParser.v2.schematics.preview, {
      body: formData,
      timeout: 180000,
      headers: {
        'x-source': 'backend proxy',
      },
    });
  }

  async image(body: SchematicPreviewDto) {
    const formData = this.createForm(body);

    const result = await this.contentParserService.apiInstance.request(contentParser.v2.schematics.image, {
      body: formData,
      responseType: 'buffer',
      timeout: 180000,
      headers: {
        'x-source': 'backend proxy',
      },
    });

    return Buffer.from(result);
  }

  async getData(id: string, ip: string) {
    const hasDownload = await isDownloadRecently(this.cacheManager, ip, id);

    if (!hasDownload) {
      this.prometheusService.downloadCounter.inc({ type: 'schematic' });
      return await this.prismaService.schematic.update({
        where: {
          itemId: id,
        },
        data: {
          downloads: {
            increment: 1,
          },
        },
        select: {
          data: true,
          name: true,
        },
      });
    }

    return await this.prismaService.schematic.findUniqueOrThrow({
      where: {
        itemId: id,
      },
      select: {
        data: true,
        name: true,
      },
    });
  }

  async getImage(id: string, query: PreviewImageQuery) {
    return await this.imageProxyService.getImage(
      'schematics',
      id,
      query.toTransform(),
      async () => await this.generateImage(id),
    );
  }

  async generateImage(id: string) {
    const { data } = await this.prismaService.schematic.findUniqueOrThrow({
      where: {
        itemId: id,
      },
      select: {
        data: true,
      },
    });

    const formData = new FormData();

    formData.append('data', new Blob([Buffer.from(data)]));

    try {
      const imageBuffer = await this.contentParserService.apiInstance.request(contentParser.v2.schematics.image, {
        body: formData,
        responseType: 'buffer',
        timeout: 180000,
        headers: {
          'x-source': 'backend generate image',
        },
      });

      const image = Buffer.from(imageBuffer);

      return image;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.response.status === 400) {
        this.logger.warn(`Failed to generate schematic preview image for ${id} (status 400). Using fallback image.`);
        return await getFallbackPreviewImage();
      }

      throw error;
    }
  }

  async uploadByUser(buffer: Buffer, userId: string) {
    const formData = new FormData();
    formData.append('data', new Blob([buffer as BlobPart]));

    const [existingSchematic, preview] = await Promise.all([
      this.prismaService.schematic.findFirst({
        where: {
          data: new Uint8Array(buffer),
        },
      }),
      this.contentParserService.apiInstance.request(contentParser.v2.schematics.preview, {
        body: formData,
        timeout: 180000,
        headers: {
          'x-source': 'upload preview',
        },
      }),
    ]);

    if (existingSchematic) {
      throw new ConflictException('Schematic already exist');
    }

    return this.prismaService.$transaction(async (tx) => {
      const item = await this.itemService.create(userId, tx, {
        tags: [],
        type: ItemType.SCHEMATIC,
      });

      const schematic = await tx.schematic.create({
        data: {
          data: new Uint8Array(buffer),
          name: preview.name,
          description: preview.description,
          height: preview.height,
          width: preview.width,
          meta: preview.meta,
          itemId: item.id,
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      this.verifyService.sendNotification('schematics', item.id, 'create');

      return schematic;
    });
  }

  async upload(body: SchematicUploadDto, userId: string) {
    const formData = this.createForm(body);

    // Get schematic data as byte to search in database
    const schematicData = body.data ? Buffer.from(body.data, 'base64') : body.file?.buffer;

    if (!schematicData) {
      throw new BadRequestException('Content is required');
    }

    const [existingSchematic, preview] = await Promise.all([
      this.prismaService.schematic.findFirst({
        where: {
          data: new Uint8Array(schematicData),
        },
      }),
      this.contentParserService.apiInstance.request(contentParser.v2.schematics.preview, {
        body: formData,
        timeout: 180000,
        headers: {
          'x-source': 'upload preview',
        },
      }),
    ]);

    if (existingSchematic) {
      throw new ConflictException('Schematic already exist');
    }

    return this.prismaService.$transaction(async (tx) => {
      const item = await this.itemService.create(userId, tx, {
        tags: body.tags,
        type: ItemType.SCHEMATIC,
      });

      const schematic = await tx.schematic.create({
        data: {
          data: new Uint8Array(schematicData),
          name: preview.name,
          description: preview.description,
          height: preview.height,
          width: preview.width,
          meta: preview.meta,
          itemId: item.id,
          verificationStatus: VerificationStatus.PENDING,
        },
        omit: {
          data: true,
        },
      });

      this.verifyService.sendNotification('schematics', item.id, 'create');

      return { ...item, ...schematic, tags: item.tags.map((tag) => tagToDto(tag.tag)) };
    });
  }

  async findAll(query: SchematicQueryDto) {
    const { name, tags, author, sort, page, size, verification, blocks } = query;

    const orderBy = mapSort(sort);

    if (tags) {
      for (const tag of tags) {
        this.prometheusService.tagCounter.inc({
          type: 'schematic',
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

    const result = await this.prismaService.schematic.findMany({
      where: {
        name: name
          ? {
              contains: name,
              mode: 'insensitive',
            }
          : undefined,
        verificationStatus: verification === 'ALL' ? undefined : verification,
        item: {
          createdBy: author ? author : undefined,
        },
        AND: tagFilters,
        blocks: blocks ? { hasEvery: blocks } : undefined,
      },
      select: {
        id: true,
        name: true,
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

  async get(id: string) {
    const result = await this.prismaService.schematic.findUniqueOrThrow({
      where: { itemId: id },
      omit: { data: true },
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
            createdByUser: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const { item, ...schematic } = result;
    const tags = item.tags.map((t) => tagToDto(t.tag)).sort((a, b) => a.position - b.position);
    return { ...item, ...schematic, tags };
  }

  async update(id: string, body: UpdateSchematicDto, session: Session) {
    if (!hasAccess(session, 'schematic:manage')) {
      throw new ForbiddenException('Not this time buddy');
    }

    const { name, description } = body;

    await this.prismaService.$transaction(async (tx) => {
      await tx.schematic.update({
        where: { itemId: id },
        data: {
          name: name ? name.trim() : undefined,
          description,
        },
      });

      await tx.item.update({
        where: { id },
        data: {
          updatedAt: new Date(),
          updatedBy: session.id,
        },
      });
    });

    return await this.get(id);
  }

  async count(query: CountSchematicQueryDto) {
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

    return await this.prismaService.schematic.count({
      where: {
        name: name
          ? {
              contains: name,
              mode: 'insensitive',
            }
          : undefined,
        verificationStatus: verification === 'ALL' ? undefined : verification,
        item: {
          createdBy: author ? author : undefined,
        },
        AND: tagFilters,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'requeueUntaggedVerifiedSchematics',
  })
  async requeueUntaggedVerifiedSchematics(maxBatchSize = 500, maxPendingThreshold = 500): Promise<number> {
    const pendingCount = await this.prismaService.schematic.count({
      where: {
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    if (pendingCount >= maxPendingThreshold) {
      this.logger.log(`Pending schematics count is ${pendingCount} (>= ${maxPendingThreshold}), skipping requeue.`);
      return 0;
    }

    const limit = Math.min(maxBatchSize, maxPendingThreshold - pendingCount);

    const untagged = await this.prismaService.schematic.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        item: {
          tags: {
            none: {},
          },
        },
      },
      select: {
        id: true,
      },
      take: limit,
    });

    if (untagged.length === 0) {
      this.logger.log('No untagged verified schematics found to requeue.');
      return 0;
    }

    const { count } = await this.prismaService.schematic.updateMany({
      where: {
        id: {
          in: untagged.map((s) => s.id),
        },
      },
      data: {
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    this.logger.log(`Successfully requeued ${count} untagged verified schematics to PENDING.`);
    return count;
  }
}
