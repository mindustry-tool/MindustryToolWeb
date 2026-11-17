import { PrismaService } from '@/prisma/prisma.service';
import { chances } from '@/utils/math.utils';
import { ItemType } from '@mindustry-tool/api';
import { LikeResult, Session } from '@mindustry-tool/api';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, VerificationStatus } from '@/generated/prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/client';
import { NotificationService } from '@/services/notification/notification.service';

type DataWithLike = {
  id: string;
  likes: number;
  verificationStatus: VerificationStatus;
};

type DataRepository<D extends DataWithLike> = {
  update: (props: {
    where: {
      id: string;
    };
    data: {
      likes:
        | {
            increment: 1 | -1;
          }
        | number;
    };
  }) => Promise<D>;
  findFirstOrThrow: (props: {
    where: {
      itemId: string;
    };
  }) => Promise<D>;
};

type TransactionContext = Omit<PrismaClient, ITXClientDenyList>;

@Injectable()
export class LikeService {
  private contentMap: Record<string, (ctx: TransactionContext) => DataRepository<DataWithLike>>;

  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    this.contentMap = {
      posts: (ctx) => ctx.post,
      schematics: (ctx) => ctx.schematic,
      maps: (ctx) => ctx.map,
      'content-patches': (ctx) => ctx.contentPatch,
    };
  }

  async create(itemType: ItemType, itemId: string, session: Session): Promise<LikeResult> {
    const result = await this.createOrDelete(itemType, itemId, session);

    return result;
  }
  async createOrDelete(itemType: string, itemId: string, session: Session) {
    const repository = this.contentMap[itemType];

    if (!repository) {
      throw new BadRequestException(`Invalid itemType: ${itemType}`);
    }

    const { findFirstOrThrow } = repository(this.prisma);

    const [exist, data] = await Promise.all([
      this.prisma.like.findFirst({
        where: {
          itemId,
          userId: session.id,
        },
      }),
      findFirstOrThrow({
        where: {
          itemId,
        },
      }),
    ]);

    const { id, verificationStatus } = data;

    if (verificationStatus !== VerificationStatus.VERIFIED) {
      throw new BadRequestException(`Item ${itemId} is not verified`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const { update } = repository(tx);

      let result: LikeResult;

      if (exist) {
        await tx.like.delete({
          where: {
            itemId_userId: {
              itemId,
              userId: session.id,
            },
          },
        });

        const { likes } = await update({
          where: {
            id,
          },
          data: {
            likes: {
              increment: -1,
            },
          },
        });

        result = {
          userId: session.id,
          itemId,
          state: -1,
          likeCount: likes,
        };
      } else {
        await tx.like.create({
          data: {
            itemId,
            userId: session.id,
          },
        });

        const { likes } = await update({
          where: {
            id,
          },
          data: {
            likes: {
              increment: 1,
            },
          },
        });

        result = {
          userId: session.id,
          itemId,
          state: 1,
          likeCount: likes,
        };
      }

      if (chances(10)) {
        const value = await tx.like.count({
          where: {
            itemId,
          },
        });

        await update({
          where: {
            id,
          },
          data: {
            likes: value,
          },
        });
      }
      return result;
    });

    if (result.state === 1) {
      const itemRecord = await this.prisma.item.findUnique({
        where: { id: itemId },
        select: { createdBy: true },
      });

      const namedData = data as { name?: string; title?: string };
      const itemName = namedData.name ?? namedData.title ?? '';

      if (itemRecord && itemRecord.createdBy !== session.id) {
        await this.notificationService.notify({
          userId: itemRecord.createdBy,
          code: 'like.single',
          params: {
            itemType,
            itemId: id,
            itemName,
            actorName: session.name,
          },
          groupKey: `${itemType}:${id}`,
          aggregationKey: `like:${itemRecord.createdBy}:${itemType}:${id}`,
          link: `/${itemType}/${id}`,
        });
      }
    }

    return result;
  }

  async findAll(itemType: string, itemIds: string[], session: Session) {
    const repository = this.contentMap[itemType];

    if (!repository) {
      throw new BadRequestException(`Invalid itemType: ${itemType}`);
    }

    const results = await this.prisma.like.findMany({
      where: {
        itemId: {
          in: itemIds,
        },
        userId: session.id,
      },
      select: {
        itemId: true,
      },
    });

    return results;
  }
}
