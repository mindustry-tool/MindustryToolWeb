import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class LogicService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMy(userId: string) {
    return this.prismaService.logic.findMany({
      where: {
        createdBy: userId,
      },
    });
  }

  async data(id: string, userId: string) {
    const result = await this.prismaService.logic.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (result.createdBy !== userId) {
      throw new ForbiddenException('You do not have permission to access this logic');
    }

    return result.content;
  }

  async create(body: ApiBody<typeof api.v4.logics.create>, userId: string) {
    return this.prismaService.logic.create({
      data: {
        name: body.name,
        content: body.content,
        createdBy: userId,
        createdAt: new Date(),
      },
    });
  }
}
