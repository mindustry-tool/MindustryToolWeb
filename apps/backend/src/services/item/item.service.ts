import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { AuthFilter, hasAccess } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ItemType, PrismaClient } from '@/generated/prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

type Transation = Omit<PrismaClient, ITXClientDenyList>;

@Injectable()
export class ItemService {
  private contentMap: Record<string, { auth: AuthFilter }>;

  constructor(private readonly prismaService: PrismaService) {
    this.contentMap = {
      schematics: {
        auth: 'schematic:manage',
      },
      maps: {
        auth: 'map:manage',
      },
      'content-patches': {
        auth: 'content-patch:manage',
      },
    };
  }

  async create(userId: string, tx: Transation, props: { tags?: string[]; type: ItemType }) {
    const { tags, type } = props;

    return await tx.item.create({
      data: {
        itemType: type,
        createdBy: userId,
        createdAt: new Date(),
        tags: tags
          ? {
              createMany: {
                data: tags?.map((tag) => ({
                  tagId: tag,
                  createdAt: new Date(),
                  createdBy: userId,
                })),
              },
            }
          : undefined,
      },
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
    });
  }

  async updateTags(itemType: string, itemId: string, session: Session, body: ApiBody<typeof api.v4.items.updateTags>) {
    const content = this.contentMap[itemType];

    if (!content) {
      throw new BadRequestException('Item type not found');
    }

    const { auth } = content;

    if (!hasAccess(session, auth)) {
      throw new ForbiddenException('Not this time buddy');
    }

    const { tags } = body;

    return this.prismaService.$transaction(async (tx) => {
      return await this.update(session, tx, itemId, { tags });
    });
  }

  async update(session: Session, tx: Transation, id: string, props: { tags?: string[] }) {
    const { tags } = props;

    if (tags) {
      await tx.itemTag.deleteMany({
        where: {
          itemId: id,
        },
      });

      await tx.itemTag.createMany({
        data: tags.map((tagId) => ({
          itemId: id,
          tagId,
          createdAt: new Date(),
          createdBy: session.id,
        })),
      });
    }

    return await tx.item.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        updatedBy: session.id,
      },
    });
  }

  async getTagsById(id: string) {
    return this.prismaService.tag.findMany({
      where: { itemTags: { some: { itemId: id } } },
      include: {
        category: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }
}
