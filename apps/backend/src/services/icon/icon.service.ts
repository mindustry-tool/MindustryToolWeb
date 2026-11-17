import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';

@Injectable()
export class IconService {
  constructor(private prisma: PrismaService) {}

  async create(session: Session, body: ApiBody<typeof api.v4.icon.create>) {
    await this.prisma.icon.create({
      data: {
        id: body.name,
        url: body.url,
        groupId: body.groupId,
        createdBy: session.id,
        createdAt: new Date(),
      },
    });

    return body.url;
  }

  async update(id: string, body: ApiBody<typeof api.v4.icon.update>) {
    return this.prisma.icon.update({
      where: {
        id,
      },
      data: {
        url: body.url,
        groupId: body.groupId,
      },
    });
  }

  findAllGroup() {
    return this.prisma.iconGroup.findMany();
  }

  findAll(query: ApiQuery<typeof api.v4.icon.get>) {
    return this.prisma.icon.findMany({
      where: {
        id: query.q
          ? {
              contains: query.q,
            }
          : undefined,
      },
      include: {
        group: true,
      },
      skip: query.size * query.page,
      take: query.size,
      orderBy: [
        {
          groupId: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  count(query: ApiQuery<typeof api.v4.icon.count>) {
    return this.prisma.icon.count({
      where: {
        id: query.q
          ? {
              contains: query.q,
            }
          : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.icon.delete({
      where: {
        id,
      },
    });
  }
}
