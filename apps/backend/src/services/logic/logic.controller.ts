import { Controller } from '@nestjs/common';
import { LogicService } from './logic.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class LogicController {
  constructor(private readonly logicService: LogicService) {}

  @Route(api.v4.logics.findMy)
  async findMy() {
    return routeHandler(api.v4.logics.findMy, ({ user }) => this.logicService.findMy(user.id), { filter: true });
  }

  @Route(api.v4.logics.data)
  async data() {
    return routeHandler(api.v4.logics.data, ({ params, user }) => this.logicService.data(params.id, user.id), {
      filter: true,
      limit: [10, 'minute'],
    });
  }

  @Route(api.v4.logics.create)
  async create() {
    return routeHandler(api.v4.logics.create, ({ body, user }) => this.logicService.create(body, user.id), {
      filter: true,
    });
  }
}
