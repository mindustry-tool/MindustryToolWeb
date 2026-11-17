import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';

@Injectable()
export class PlanetService {
  constructor(private prisma: PrismaService) {}

  create(
    createPlanetDto: ApiBody<typeof api.v4.planets.create>,
    session: Session,
  ) {
    return this.prisma.planet.create({
      data: {
        ...createPlanetDto,
        createdBy: session.id,
        createdAt: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.planet.findMany({
      orderBy: {
        position: 'asc',
      },
    });
  }

  update(
    id: string,
    updatePlanetDto: ApiBody<typeof api.v4.planets.update>,
    session: Session,
  ) {
    return this.prisma.planet.update({
      where: {
        id,
      },
      data: {
        ...updatePlanetDto,
        updatedBy: session.id,
        updatedAt: new Date(),
      },
    });
  }

  remove(id: string) {
    return this.prisma.planet.delete({
      where: {
        id,
      },
    });
  }
}
