import { Controller } from '@nestjs/common';
import { ModService } from './mod.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class ModController {
  constructor(private readonly modService: ModService) {}

  @Route(api.v4.mods.findAll)
  async findAll() {
    return routeHandler(api.v4.mods.findAll, ({ query }) =>
      this.modService.findAll(query),
    );
  }

  @Route(api.v4.mods.count)
  async count() {
    return routeHandler(api.v4.mods.count, ({ query }) => this.modService.count(query));
  }

  @Route(api.v4.mods.releases.findAll)
  async findReleases() {
    return routeHandler(
      api.v4.mods.releases.findAll,
      ({ params, query }) => this.modService.findAllRelease(params, query),
      {
        filter: true,
      },
    );
  }
}
