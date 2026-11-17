import { Controller } from '@nestjs/common';
import { ShareService } from './share.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { getRealIp } from '@/utils/query.utils';

@Controller()
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Route(api.v4.share.create)
  async createShareLink() {
    return routeHandler(api.v4.share.create, ({ body, user }) => this.shareService.createShareLink(body.url, user.id), {
      filter: true,
    });
  }

  @Route(api.v4.share.visit)
  async visitShareLink() {
    return routeHandler(api.v4.share.visit, ({ params, req }) => this.shareService.visitShareLink(params.id, getRealIp(req)));
  }

  @Route(api.v4.share.findMy)
  async findMyShareLinks() {
    return routeHandler(api.v4.share.findMy, ({ query, user }) => this.shareService.findMyShareLinks(query, user.id), { filter: true });
  }

  @Route(api.v4.share.countMy)
  async countMyShareLinks() {
    return routeHandler(api.v4.share.countMy, ({ user }) => this.shareService.countMyShareLinks(user.id), { filter: true });
  }
}
