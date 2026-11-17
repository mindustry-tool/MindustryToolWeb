import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Route(api.v4.roles.findAll)
  findAll() {
    return routeHandler(api.v4.roles.findAll, () => this.roleService.findAllWithCache());
  }

  @Route(api.v4.roles.create)
  create() {
    return routeHandler(api.v4.roles.create, ({ body }) => this.roleService.create(body), {
      filter: 'god',
    });
  }

  @Route(api.v4.roles.update)
  update() {
    return routeHandler(api.v4.roles.update, ({ params, body }) => this.roleService.update(params.id, body), {
      filter: 'god',
    });
  }

  @Route(api.v4.roles.delete)
  remove() {
    return routeHandler(api.v4.roles.delete, ({ params: { id } }) => this.roleService.remove(id), {
      filter: 'god',
    });
  }
}
