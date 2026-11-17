import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiQuery } from '@mindustry-tool/api';
import { createCommentSchema, Session } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { chances } from '@/utils/math.utils';
import { ITXClientDenyList } from '@prisma/client/runtime/client';
import { NotificationService } from '../notification/notification.service';
import { z } from 'zod/v4-mini';

export function extractTextSnippet(content: string, maxLength = 120): string {
  const plain = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) {
    return plain;
  }
  return plain.slice(0, maxLength).trim() + '...';
}

type DataWithComment = {
  id: string;
  comments: number;
};

type DataRepository<D extends DataWithComment> = {
  update: (props: {
    where: {
      itemId: string;
    };
    data: {
      comments:
        | {
            increment: 1 | -1;
          }
        | number;
    };
  }) => Promise<any>;
  findFirstOrThrow: (props: {
    where: {
      itemId: string;
    };
  }) => Promise<D>;
};

type TransactionContext = Omit<PrismaClient, ITXClientDenyList>;

@Injectable()
export class CommentService {
  private contentMap: Record<string, (ctx: TransactionContext) => DataRepository<DataWithComment>>;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {
    this.contentMap = {
      posts: (ctx) => ctx.post,
      schematics: (ctx) => ctx.schematic,
      maps: (ctx) => ctx.map,
      'content-patches': (ctx) => ctx.contentPatch,
    } as const;
  }

  async create(
    params: { itemType: string; itemId: string },
    body: z.infer<typeof createCommentSchema>,
    user: Session,
  ) {
    const { itemType, itemId } = params;

    const repository = this.contentMap[itemType];

    if (!repository) {
      throw new BadRequestException(`Invalid itemType: ${itemType}`);
    }

    const { findFirstOrThrow } = repository(this.prisma);

    const [parentComment, data] = await Promise.all([
      body.replyId
        ? // Check existence and retrieve parent comment author
          this.prisma.comment.findUniqueOrThrow({
            where: {
              id: body.replyId,
            },
            select: {
              id: true,
              userId: true,
            },
          })
        : Promise.resolve(null),
      // Check existence
      findFirstOrThrow({
        where: {
          itemId,
        },
      }),
    ]);

    const { id } = data;

    const [result] = await this.prisma.$transaction(async (ctx) => {
      const { update } = repository(ctx);

      const result = await ctx.comment.create({
        data: {
          itemId,
          userId: user.id,
          content: body.content,
          replyId: body.replyId,
        },
      });

      await update({
        where: {
          itemId,
        },
        data: {
          comments: {
            increment: 1,
          },
        },
      });

      if (chances(0.5)) {
        const value = await ctx.comment.count({
          where: {
            itemId,
          },
        });

        await update({
          where: {
            itemId,
          },
          data: {
            comments: value,
          },
        });
      }

      return [result];
    });

    const namedData = data as { name?: string; title?: string };
    const itemName = namedData.name ?? namedData.title ?? '';
    const contentSnippet = extractTextSnippet(body.content);

    if (body.replyId && parentComment) {
      if (parentComment.userId !== user.id) {
        await this.notificationService.notify({
          userId: parentComment.userId,
          code: 'comment.reply',
          params: {
            itemType,
            itemId: id,
            itemName,
            actorName: user.name,
            commentId: result.id,
            replyId: body.replyId,
            contentSnippet,
          },
          groupKey: `${itemType}:${id}`,
          link: `/${itemType}/${id}?commentId=${result.id}`,
        });
      }
    } else {
      const itemRecord = await this.prisma.item.findUnique({
        where: { id: itemId },
        select: { createdBy: true },
      });

      if (itemRecord && itemRecord.createdBy !== user.id) {
        await this.notificationService.notify({
          userId: itemRecord.createdBy,
          code: 'comment.post',
          params: {
            itemType,
            itemId: id,
            itemName,
            actorName: user.name,
            commentId: result.id,
            contentSnippet,
          },
          groupKey: `${itemType}:${id}`,
          link: `/${itemType}/${id}?commentId=${result.id}`,
        });
      }
    }

    return result;
  }

  async findAll(itemId: string, query: ApiQuery<typeof api.v4.comments.findAll>) {
    const { page, size } = query;

    const result = await this.prisma.comment.findMany({
      where: {
        itemId,
      },
      skip: page * size,
      take: size,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return result;
  }

  async findAllAdmin(query: ApiQuery<typeof api.v4.comments.findAllAdmin>) {
    const { page, size } = query;

    const result = await this.prisma.comment.findMany({
      skip: page * size,
      take: size,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        item: {
          select: {
            itemType: true,
          },
        },
      },
    });

    return result.map((comment) => {
      const { item, ...rest } = comment;
      return { ...rest, itemType: item.itemType };
    });
  }

  async countAdmin() {
    const result = await this.prisma.comment.count();

    return result;
  }

  async delete(id: string, user: Session) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, userId: true, itemId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== user.id && !hasAccess(user, 'god')) {
      throw new ForbiddenException('You are not the author of this comment');
    }

    await this.prisma.$transaction(async (ctx) => {
      await ctx.comment.delete({ where: { id } });

      const item = await ctx.item.findUnique({
        where: { id: comment.itemId },
        select: { itemType: true },
      });

      if (item) {
        const itemTypeKey = item.itemType.toLowerCase().replace('_', '-') + 's';
        const repo = this.contentMap[itemTypeKey];
        if (repo) {
          const { update } = repo(ctx);

          await update({
            where: { itemId: comment.itemId },
            data: { comments: { increment: -1 } },
          });
        }
      }
    });
  }
}
