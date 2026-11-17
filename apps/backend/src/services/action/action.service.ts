import { PrismaService } from '@/prisma/prisma.service';
import { countActionQuerySchema, getActionQuerySchema } from '@mindustry-tool/api';
import { Injectable } from '@nestjs/common';
import { z } from 'zod/v4-mini';

@Injectable()
export class ActionService {
  constructor(private readonly prismaService: PrismaService) {}

  get(query: z.infer<typeof getActionQuerySchema>) {
    const { page, size, action, triggeredBy } = query;

    return this.prismaService.action.findMany({
      where: {
        name: action,
        triggeredBy,
      },
      skip: page * size,
      take: size,
      orderBy: {
        id: 'desc',
      },
    });
  }

  count(query: z.infer<typeof countActionQuerySchema>) {
    const { action, triggeredBy } = query;

    return this.prismaService.action.count({
      where: {
        name: action,
        triggeredBy,
      },
    });
  }

  async getActionTypes() {
    const items = await this.prismaService.action.findMany({
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    });

    return items.map((item) => item.name);
  }
}
