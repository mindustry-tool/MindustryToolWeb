import { Controller } from '@nestjs/common';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';
import { CommunityServerService } from './community-server.service';

@Controller()
export class CommunityServerController {
  constructor(private readonly communityServerService: CommunityServerService) {}

  @Route(api.v4.communityServers.findAll)
  async findAll() {
    return routeHandler(api.v4.communityServers.findAll, ({ query }) =>
      this.communityServerService.findAll(query),
    );
  }

  @Route(api.v4.communityServers.getHistory)
  async getHistory() {
    return routeHandler(api.v4.communityServers.getHistory, ({ params }) =>
      this.communityServerService.getHistory(params.id),
    );
  }

  @Route(api.v4.communityServers.findGroups)
  async findGroups() {
    return routeHandler(api.v4.communityServers.findGroups, () =>
      this.communityServerService.findGroups(),
    );
  }
}
