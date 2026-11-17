import { Controller } from '@nestjs/common';
import { PlayerConnectService } from './player-connect.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler, sseRouteHandler } from '@/decorators/route.decorator';

@Controller()
export class PlayerConnectController {
  constructor(private readonly playerConnectService: PlayerConnectService) {}

  @Route(api.v4.playerConnects.getProviders)
  getProviders() {
    return routeHandler(api.v4.playerConnects.getProviders, () =>
      this.playerConnectService.getProviders(),
    );
  }

  @Route(api.v4.playerConnects.getRooms)
  getRooms() {
    return routeHandler(api.v4.playerConnects.getRooms, async ({ query }) =>
      this.playerConnectService.getRooms(query.q),
    );
  }

  @Route(api.v4.playerConnects.sse)
  sse() {
    return sseRouteHandler(api.v4.playerConnects.sse, ({ sse, next }) =>
      this.playerConnectService.handleSse(sse, next),
    );
  }
}
