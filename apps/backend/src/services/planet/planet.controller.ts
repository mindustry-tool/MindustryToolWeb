import { Controller } from '@nestjs/common';
import { PlanetService } from './planet.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class PlanetController {
  constructor(private readonly planetService: PlanetService) {}

  @Route(api.v4.planets.create)
  create() {
    return routeHandler(api.v4.planets.create, ({ body, user }) => this.planetService.create(body, user), {
      filter: 'planet:manage',
    });
  }

  @Route(api.v4.planets.findAll)
  findAll() {
    return routeHandler(api.v4.planets.findAll, () => this.planetService.findAll());
  }

  @Route(api.v4.planets.update)
  update() {
    return routeHandler(
      api.v4.planets.update,
      ({ params, body, user }) => this.planetService.update(params.id, body, user),
      {
        filter: 'planet:manage',
      },
    );
  }

  @Route(api.v4.planets.delete)
  remove() {
    return routeHandler(api.v4.planets.delete, ({ params }) => this.planetService.remove(params.id), {
      filter: 'planet:manage',
    });
  }
}
