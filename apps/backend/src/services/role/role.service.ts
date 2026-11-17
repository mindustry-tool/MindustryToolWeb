import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { RoleDto } from '@mindustry-tool/api';

@Injectable()
export class RoleService {
  cache: RoleDto[] | null = null;

  constructor(private prisma: PrismaService) {}

  async findAllWithCache() {
    if (this.cache) {
      return this.cache;
    }

    const result = await this.prisma.role
      .findMany({
        include: {
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
      })
      .then((roles) =>
        roles.map((role) => ({
          ...role,
          members: role._count.userRoles,
        })),
      );

    this.cache = result;

    return result;
  }

  async create(body: ApiBody<typeof api.v4.roles.create>) {
    const role = await this.prisma.role.create({
      data: { ...body, createdAt: new Date() },
      include: {
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    this.cache = null;

    return {
      ...role,
      members: role._count.userRoles,
    };
  }

  async update(id: string, body: ApiBody<typeof api.v4.roles.update>) {
    const role = await this.prisma.role.update({
      where: {
        id,
      },
      data: { ...body, updatedAt: new Date() },
      include: {
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    this.cache = null;

    return {
      ...role,
      members: role._count.userRoles,
    };
  }

  async remove(id: string) {
    await this.prisma.role.delete({
      where: {
        id,
      },
    });

    this.cache = null;
  }
}
