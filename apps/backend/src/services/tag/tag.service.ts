import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { Session, TagCategoryWithTagsDto, TagDto, tagGroupDtoSchema } from '@mindustry-tool/api';
import { ItemType } from '@mindustry-tool/api';
import { Cache } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ItemType as PrismaItemType } from '@/generated/prisma/client';
import { z } from 'zod/v4-mini';

@Injectable()
export class TagService {
  constructor(
    private readonly prisma: PrismaService,
    private cacheManager: Cache,
  ) {}

  async create({ planetIds, ...createTagDto }: ApiBody<typeof api.v4.tags.create>, session: Session): Promise<TagDto> {
    const category = await this.prisma.tagCategory.findUniqueOrThrow({
      where: {
        id: createTagDto.categoryId,
      },
    });

    const result = await this.prisma.tag
      .create({
        include: {
          planets: {
            select: {
              planetId: true,
            },
          },
        },
        data: {
          ...createTagDto,
          createdAt: new Date(),
          createdBy: session.id,
          fullTag: category.name + '_' + createTagDto.name,
          planets: {
            createMany: {
              data: planetIds.map((planetId) => ({
                planetId,
              })),
            },
          },
        },
      })
      .then((item) => ({
        ...item,
        planetIds: item.planets.map((planet) => planet.planetId),
      }));

    await this.cacheManager.clear();

    return result;
  }

  async findAll(group: string): Promise<TagCategoryWithTagsDto[]> {
    const cacheKey = `tags-${group}`;
    const cached = (await this.cacheManager.get(cacheKey)) as TagCategoryWithTagsDto[] | null;

    if (cached) {
      return cached;
    }

    const map: Record<ItemType, PrismaItemType> = {
      schematics: PrismaItemType.SCHEMATIC,
      maps: PrismaItemType.MAP,
      posts: PrismaItemType.POST,
      'content-patches': PrismaItemType.CONTENT_PATCH,
    } as const;

    const itemType: PrismaItemType | undefined = map[group];

    if (itemType === undefined) {
      console.error('Invalid item tag group: ' + group);
    }

    const result = await this.prisma.tagGroup
      .findMany({
        where: {
          group,
        },
        select: {
          category: {
            include: {
              tags: {
                include: {
                  _count: {
                    select: {
                      itemTags: itemType
                        ? {
                            where: {
                              item: {
                                itemType: itemType,
                                ...(itemType === PrismaItemType.SCHEMATIC
                                  ? {
                                      schematic: {
                                        verificationStatus: 'VERIFIED',
                                      },
                                    }
                                  : {}),
                                ...(itemType === PrismaItemType.MAP
                                  ? {
                                      map: {
                                        verificationStatus: 'VERIFIED',
                                      },
                                    }
                                  : {}),
                                ...(itemType === PrismaItemType.POST
                                  ? {
                                      post: {
                                        verificationStatus: 'VERIFIED',
                                      },
                                    }
                                  : {}),
                              },
                            },
                          }
                        : undefined,
                    },
                  },
                  planets: {
                    select: {
                      planetId: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .then((items) => items.map((item) => item.category))
      .then((items) =>
        items
          .sort((a, b) => a.position - b.position)
          .map((item) => ({
            ...item,
            tags: item.tags
              .map((tag) => ({
                ...tag,
                planetIds: tag.planets.map((planet) => planet.planetId),
                count: tag._count.itemTags,
                color: item.color,
              }))
              .sort((a, b) => a.position - b.position),
          })),
      );

    await this.cacheManager.set(cacheKey, result, 60 * 60 * 1000);

    return result;
  }

  async getTagsDetail(planetId?: string | null): Promise<TagCategoryWithTagsDto[]> {
    return this.prisma.tagCategory
      .findMany({
        include: {
          tags: {
            where: {
              planets: planetId
                ? {
                    some: {
                      planetId,
                    },
                  }
                : undefined,
            },
            include: {
              _count: {
                select: {
                  itemTags: true,
                },
              },
              planets: {
                select: {
                  planetId: true,
                },
              },
            },
          },
        },
      })
      .then((items) =>
        items
          .map((item) => ({
            ...item,
            tags: item.tags
              .map((tag) => ({
                ...tag,
                planetIds: tag.planets.map((planet) => planet.planetId),
                count: tag._count.itemTags,
              }))
              .sort((a, b) => a.position - b.position),
          }))
          .sort((a, b) => a.position - b.position),
      );
  }

  async getGroups(): Promise<Array<z.infer<typeof tagGroupDtoSchema>>> {
    return this.prisma.tagGroup
      .findMany({
        include: {
          category: true,
        },
      })
      .then((res) => {
        const group: Record<string, z.infer<typeof tagGroupDtoSchema>> = {};

        res.forEach((item) => {
          if (!group[item.group]) {
            group[item.group] = {
              group: item.group,
              categories: [],
            };
          }
          group[item.group].categories.push(item.category);
          group[item.group].categories.sort((a, b) => a.position - b.position);
        });
        return Object.values(group);
      });
  }

  async createGroup(createTagGroupDto: ApiBody<typeof api.v4.tags.groups.create>, session: Session) {
    const result = await this.prisma.tagGroup.create({
      data: {
        ...createTagGroupDto,
        createdAt: new Date(),
        createdBy: session.id,
      },
    });

    await this.cacheManager.clear();

    return result;
  }

  async deleteGroup(id: string, categoryId: string) {
    const result = await this.prisma.tagGroup.delete({
      where: { group_categoryId: { group: id, categoryId } },
    });

    await this.cacheManager.clear();

    return result;
  }

  getCategories() {
    return this.prisma.tagCategory.findMany().then((items) => items.sort((a, b) => a.position - b.position));
  }

  async createTagCategory(data: ApiBody<typeof api.v4.tags.categories.create>, session: Session) {
    const result = await this.prisma.tagCategory.create({
      data: {
        ...data,
        color: data.color ?? '',
        createdAt: new Date(),
        createdBy: session.id,
      },
    });
    await this.cacheManager.clear();

    return result;
  }

  async updateTagCategory(id: string, data: ApiBody<typeof api.v4.tags.categories.update>, session: Session) {
    const result = await this.prisma.tagCategory.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
        updatedBy: session.id,
      },
    });

    await this.cacheManager.clear();

    return result;
  }

  async deleteTagCategory(id: string) {
    const result = await this.prisma.tagCategory.delete({
      where: { id },
    });

    await this.cacheManager.clear();

    return result;
  }

  getTagsCategory(id: string) {
    return this.prisma.tagCategory.findUniqueOrThrow({
      where: { id },
    });
  }

  findOne(id: string) {
    return this.prisma.tag.findUnique({
      where: { id },
    });
  }

  async update(id: string, { planetIds, ...data }: ApiBody<typeof api.v4.tags.update>, session: Session) {
    const category = await this.prisma.tagCategory.findUniqueOrThrow({
      where: {
        id: data.categoryId,
      },
    });

    if (planetIds) {
      await this.prisma.planetTag.deleteMany({
        where: {
          tagId: id,
        },
      });
    }

    const result = await this.prisma.tag
      .update({
        where: { id },
        include: {
          planets: {
            select: {
              planetId: true,
            },
          },
        },
        data: {
          ...data,
          updatedAt: new Date(),
          updatedBy: session.id,
          fullTag: category.name + '_' + data.name,
          planets: planetIds
            ? {
                createMany: {
                  data: planetIds.map((planetId) => ({
                    planetId,
                  })),
                },
              }
            : undefined,
        },
      })
      .then((item) => ({
        ...item,
        color: category.color,
        planetIds: item.planets.map((planet) => planet.planetId),
      }));

    await this.cacheManager.clear();

    return result;
  }

  async remove(id: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.planetTag.deleteMany({
        where: {
          tagId: id,
        },
      });

      await tx.tag.delete({
        where: { id },
      });
    });
    await this.cacheManager.clear();

    return result;
  }
}
