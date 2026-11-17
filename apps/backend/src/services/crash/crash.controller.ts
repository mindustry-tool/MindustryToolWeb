import { Controller, Req } from '@nestjs/common';
import { CrashService } from './crash.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { UserId } from '@/decorators/session.decorator';
import { Request } from 'express';
import { getRealIp } from '@/utils/query.utils';

@Controller()
export class CrashController {
  constructor(private readonly crashService: CrashService) {}

  @Route(api.v4.crashes.create)
  create(@Req() req: Request) {
    const ip = getRealIp(req);
    return routeHandler(api.v4.crashes.create, ({ body }) => this.crashService.create(body, ip), {
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.crashes.findAll)
  findAll() {
    return routeHandler(api.v4.crashes.findAll, ({ query }) => this.crashService.findAll(query));
  }

  @Route(api.v4.crashes.count)
  count() {
    return routeHandler(api.v4.crashes.count, ({ query }) => this.crashService.count(query));
  }

  @Route(api.v4.crashes.findMods)
  findMods() {
    return routeHandler(api.v4.crashes.findMods, ({ query }) => this.crashService.findMods(query));
  }

  @Route(api.v4.crashes.getModInfo)
  getModInfo() {
    return routeHandler(api.v4.crashes.getModInfo, ({ params }) => this.crashService.getModInfo(params.mod));
  }

  @Route(api.v4.crashes.countMods)
  countMods() {
    return routeHandler(api.v4.crashes.countMods, () => this.crashService.countMods());
  }

  @Route(api.v4.crashes.get)
  get() {
    return routeHandler(api.v4.crashes.get, ({ params }) => this.crashService.get(params.id));
  }

  @Route(api.v4.crashes.update)
  update(@UserId() userId: string) {
    return routeHandler(
      api.v4.crashes.update,
      ({ params, body }) => this.crashService.update(params.id, body, userId),
      {
        limit: [20, 'minute'],
      },
    );
  }
}
