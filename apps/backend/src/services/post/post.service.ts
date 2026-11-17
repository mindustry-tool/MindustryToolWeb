import { PrismaService } from '@/prisma/prisma.service';
import { ItemService } from '@/services/item/item.service';
import { chances } from '@/utils/math.utils';
import { postToDto } from '@/utils/dto.utils';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { Cache } from '@nestjs/cache-manager';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { PrometheusService } from '@/services/prometheus/prometheus.service';

const postDtoArgs: Prisma.PostDefaultArgs = {
  include: {
    item: {
      include: {
        tags: {
          select: {
            tag: {
              include: {
                category: {
                  select: {
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class PostService {
  constructor(
    private prismaService: PrismaService,
    private itemService: ItemService,
    private cacheManager: Cache,
    private prometheusService: PrometheusService,
  ) {}

  async count(query: ApiQuery<typeof api.v4.posts.count>) {
    const { name, author, tags } = query;

    return await this.prismaService.post.count({
      where: {
        title: name
          ? {
              contains: name,
              mode: 'insensitive',
            }
          : undefined,
        item: {
          createdBy: author ? author : undefined,
          tags: tags
            ? {
                some: {
                  tag: {
                    fullTag: {
                      in: tags,
                    },
                  },
                },
              }
            : undefined,
        },
      },
    });
  }

  async get(query: ApiQuery<typeof api.v4.posts.findAll>) {
    const { page, size, name, tags, author } = query;

    if (tags) {
      for (const tag of tags) {
        this.prometheusService.tagCounter.inc({
          type: 'post',
          tag,
        });
      }
    }

    return this.prismaService.post
      .findMany({
        where: {
          title: name
            ? {
                contains: name,
                mode: 'insensitive',
              }
            : undefined,
          status: 'PUBLISHED',
          item: {
            createdBy: author ? author : undefined,
            tags: tags
              ? {
                  some: {
                    tag: {
                      fullTag: {
                        in: tags,
                      },
                    },
                  },
                }
              : undefined,
          },
        },
        skip: page * size,
        take: size,
        omit: {
          content: true,
        },
        ...postDtoArgs,
        orderBy: {
          id: 'desc',
        },
      })
      .then((items) => items.map(postToDto));
  }

  async getById(id: string) {
    return this.prismaService.post
      .findFirstOrThrow({
        where: {
          itemId: id,
        },
        ...postDtoArgs,
      })
      .then(postToDto);
  }

  async create({ tags, ...rest }: ApiBody<typeof api.v4.posts.create>, user: Session) {
    const imageUrls = this.findImageUrls(rest.content);
    const cover = rest.cover ?? imageUrls[0];

    return this.prismaService.$transaction(async (ctx) => {
      const item = await this.itemService.create(user.id, ctx, {
        type: 'POST',
        tags,
      });

      return ctx.post
        .create({
          data: {
            ...rest,
            cover,
            itemId: item.id,
            createdAt: new Date(),
            createdBy: user.id,
          },
          ...postDtoArgs,
        })
        .then(postToDto);
    });
  }

  async view(id: string, ip: string) {
    const cacheKey = `post:view:${id}:${ip}`;
    const cache = await this.cacheManager.get(cacheKey);

    if (cache) {
      return;
    }

    const post = await this.prismaService.post.findUniqueOrThrow({
      where: { itemId: id },
      select: { id: true },
    });

    const tenMinutes = 1000 * 60 * 10;

    await this.cacheManager.set(cacheKey, true, tenMinutes);

    const exist = await this.prismaService.postView.findFirst({
      where: {
        postId: post.id,
        ip,
      },
    });

    if (exist) {
      return;
    }

    await this.prismaService.postView.upsert({
      where: {
        postId_ip: {
          postId: post.id,
          ip,
        },
      },
      create: {
        postId: post.id,
        ip,
      },
      update: {
        createdAt: new Date(),
      },
    });

    if (chances(10)) {
      // Update views using count
      const count = await this.prismaService.postView.count({
        where: {
          postId: post.id,
        },
      });

      await this.prismaService.post.update({
        where: {
          itemId: id,
        },
        data: {
          views: count,
        },
      });
    } else {
      await this.prismaService.post.update({
        where: {
          itemId: id,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    }
  }

  async update(id: string, { tags, ...rest }: ApiBody<typeof api.v4.posts.update>, user: Session) {
    const post = await this.getById(id);

    if (post.createdBy !== user.id && !hasAccess(user, 'post:manage')) {
      throw new ForbiddenException('You are not the author of this post');
    }

    const imageUrls = this.findImageUrls(rest.content);
    const cover = rest.cover ?? imageUrls[0];

    const result = await this.prismaService.$transaction(async (ctx) => {
      await this.itemService.update(user, ctx, post.itemId, { tags });

      await ctx.item.update({
        where: {
          id: post.itemId,
        },
        data: {
          updatedAt: new Date(),
          updatedBy: user.id,
        },
      });

      return ctx.post
        .update({
          where: {
            itemId: id,
          },
          data: {
            ...rest,
            cover,
          },
          ...postDtoArgs,
        })
        .then(postToDto);
    });

    return result;
  }

  private findImageUrls(json: string): string[] {
    const obj: unknown = JSON.parse(json);
    const urls: string[] = [];

    function traverse(node: unknown) {
      if (
        node &&
        typeof node === 'object' &&
        'type' in node &&
        'attrs' in node &&
        node.attrs &&
        typeof node.attrs === 'object' &&
        'src' in node.attrs &&
        node.type === 'image' &&
        node.attrs?.src
      ) {
        urls.push(node.attrs.src as string);
      }

      if (node && typeof node === 'object' && 'content' in node && Array.isArray(node.content) && node.content) {
        node.content.forEach(traverse);
      }
    }

    traverse(obj);
    return urls;
  }

  async delete(id: string, user: Session) {
    const post = await this.getById(id);

    if (post.createdBy !== user.id && !hasAccess(user, 'post:manage')) {
      throw new ForbiddenException('You are not the author of this post');
    }

    await this.prismaService.post.delete({
      where: {
        itemId: id,
      },
    });
  }
}
