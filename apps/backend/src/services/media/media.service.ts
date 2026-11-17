import { CreateMediaDto } from '@/services/media/dto/create-media.dto';
import { MediaDto, Session } from '@mindustry-tool/api';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MinioService } from '@/services/storage/minio.service';
import { parseMediaUrl } from '@/services/storage/image-upload.utils';
import { PaginationQuery } from '@/types/query.types';
import { MediaType } from '@/generated/prisma/client';
import { imageSize } from 'image-size';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  folders = ['media', 'schematics', 'maps'];

  async createMedia(userId: string, body: CreateMediaDto, mediaType: MediaType): Promise<string> {
    const name = body.image.originalName;

    const { width, height } = imageSize(body.image.buffer);

    const url = await this.minio.createImage(body.image.buffer, 'media', name);

    try {
      await this.prisma.media.create({
        data: {
          mediaType,
          url,
          name,
          width,
          height,
          createdAt: new Date(),
          createdBy: userId,
        },
      });

      return url;
    } catch (e) {
      const parsed = parseMediaUrl(url, 'media');
      if (parsed) {
        await this.minio.deleteImage('media', parsed.id, parsed.format);
      }
      throw e;
    }
  }

  async getMy(query: PaginationQuery, session: Session): Promise<MediaDto[]> {
    const { page, size } = query;
    const skip = page * size;
    const take = size;

    return this.prisma.media.findMany({
      where: {
        createdBy: session.id,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async get(query: PaginationQuery): Promise<MediaDto[]> {
    const { page, size } = query;
    const skip = page * size;
    const take = size;

    return this.prisma.media.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCount(session: Session): Promise<number> {
    return this.prisma.media.count({
      where: {
        createdBy: session.id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const parsed = parseMediaUrl(media.url, 'media');
    if (parsed) {
      await this.minio.deleteImage('media', parsed.id, parsed.format);
    }

    await this.prisma.media.delete({
      where: { id },
    });
  }
}
