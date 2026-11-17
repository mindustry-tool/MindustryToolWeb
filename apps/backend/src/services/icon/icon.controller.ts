import { Controller } from '@nestjs/common';
import { IconService } from './icon.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class IconController {
  constructor(private readonly iconService: IconService) {}

  @Route(api.v4.icon.create)
  create() {
    return routeHandler(
      api.v4.icon.create,
      ({ user, body }) => this.iconService.create(user, body),
      {
        filter: 'icon:manage',
      },
    );
  }

  @Route(api.v4.icon.update)
  update() {
    return routeHandler(
      api.v4.icon.update,
      ({ params, body }) => this.iconService.update(params.id, body),
      {
        filter: 'icon:manage',
      },
    );
  }

  @Route(api.v4.icon.get)
  findAll() {
    return routeHandler(
      api.v4.icon.get,
      ({ query }) => this.iconService.findAll(query),
      {
        filter: 'icon:manage',
      },
    );
  }

  @Route(api.v4.icon.getGroups)
  findAllGroup() {
    return routeHandler(
      api.v4.icon.getGroups,
      () => this.iconService.findAllGroup(),
      {
        filter: 'icon:manage',
      },
    );
  }

  @Route(api.v4.icon.count)
  count() {
    return routeHandler(
      api.v4.icon.count,
      ({ query }) => this.iconService.count(query),
      {
        filter: 'icon:manage',
      },
    );
  }

  @Route(api.v4.icon.delete)
  delete() {
    return routeHandler(
      api.v4.icon.delete,
      ({ params }) => this.iconService.remove(params.id),
      {
        filter: 'icon:manage',
      },
    );
  }
}
