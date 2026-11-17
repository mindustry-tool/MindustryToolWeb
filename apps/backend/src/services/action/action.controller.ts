import { Controller } from '@nestjs/common';
import { ActionService } from './action.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class ActionController {
  constructor(private readonly actionService: ActionService) {}
  @Route(api.v4.actions.get)
  get() {
    return routeHandler(api.v4.actions.get, ({ query }) =>
      this.actionService.get(query),
    );
  }

  @Route(api.v4.actions.count)
  count() {
    return routeHandler(api.v4.actions.count, ({ query }) =>
      this.actionService.count(query),
    );
  }

  @Route(api.v4.actions.getTypes)
  getTypes() {
    return routeHandler(api.v4.actions.getTypes, () =>
      this.actionService.getActionTypes(),
    );
  }
}
