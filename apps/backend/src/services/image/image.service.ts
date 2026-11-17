import { PrismaService } from '@/prisma/prisma.service';
import { CreateImageDto } from '@/services/image/dto/create-image.dto';
import { MinioService } from '@/services/storage/minio.service';
import { parseMediaUrl } from '@/services/storage/image-upload.utils';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import { ImageDto, Session } from '@mindustry-tool/api';
import { Injectable } from '@nestjs/common';
import imageSize from 'image-size';

@Injectable()
export class ImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async get(query: ApiQuery<typeof api.v4.images.get>): Promise<ImageDto[]> {
    const { page, size, parentId, q } = query;
    const skip = page * size;
    const take = size;

    return this.prisma.image.findMany({
      where: {
        parentId: parentId || null,
        name: q
          ? {
              contains: q,
            }
          : undefined,
      },
      skip,
      take,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createFolder(body: ApiBody<typeof api.v4.images.folders.create>, session: Session) {
    return this.prisma.image.create({
      data: {
        name: body.name,
        parentId: body.parentId || undefined,
        createdAt: new Date(),
        createdBy: session.id,
      },
    });
  }

  async updateFolder(id: string, body: ApiBody<typeof api.v4.images.folders.update>) {
    return this.prisma.image.update({
      where: { id },
      data: {
        name: body.name,
      },
    });
  }

  async getCount(query: ApiQuery<typeof api.v4.images.count>): Promise<number> {
    const { parentId } = query;
    return this.prisma.image.count({
      where: { parentId },
    });
  }

  async delete(id: string): Promise<void> {
    const image = await this.prisma.image.findUniqueOrThrow({
      where: { id },
    });

    await this.prisma.image.delete({
      where: { id },
    });

    if (image.url) {
      const parsed = parseMediaUrl(image.url, 'media');
      if (parsed) {
        await this.minio.deleteImage('media', parsed.id, parsed.format);
      }
    }
  }

  async createImage(session: Session, body: CreateImageDto): Promise<void> {
    const { parentId } = body;

    if (parentId) {
      await this.prisma.image.findUniqueOrThrow({
        where: { id: parentId },
      });
    }

    for (const file of body.data) {
      const name = file.originalName;
      const { width, height } = imageSize(file.buffer);

      const url = await this.minio.createImage(file.buffer, 'media', name);

      try {
        await this.prisma.image.create({
          data: {
            parentId,
            url,
            name,
            width,
            height,
            createdAt: new Date(),
            createdBy: session.id,
          },
        });
      } catch (e) {
        const parsed = parseMediaUrl(url, 'media');
        if (parsed) {
          await this.minio.deleteImage('media', parsed.id, parsed.format);
        }
        throw e;
      }
    }
  }
}
