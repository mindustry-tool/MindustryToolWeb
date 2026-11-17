import { Controller } from '@nestjs/common';
import { ContentPatchesService } from './content-patches.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';
import { getRealIp } from '@/utils/query.utils';

@Controller()
export class ContentPatchesController {
  constructor(private readonly contentPatchesService: ContentPatchesService) {}

  @Route(api.v4.contentPatches.getAll)
  async getAll() {
    return routeHandler(api.v4.contentPatches.getAll, async ({ query }) => this.contentPatchesService.getAll(query));
  }

  @Route(api.v4.contentPatches.count)
  async count() {
    return routeHandler(api.v4.contentPatches.count, async ({ query }) => this.contentPatchesService.getCount(query));
  }

  @Route(api.v4.contentPatches.get)
  async get() {
    return routeHandler(api.v4.contentPatches.get, async ({ params }) => this.contentPatchesService.get(params.id));
  }

  @Route(api.v4.contentPatches.create)
  async create() {
    return routeHandler(
      api.v4.contentPatches.create,
      async ({ body, user }) => this.contentPatchesService.create(body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.contentPatches.data)
  async data() {
    return routeHandler(
      api.v4.contentPatches.data,
      async ({ req, res, params }) => {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="patches.hjson"`);
        return this.contentPatchesService.data(params.id, getRealIp(req));
      },
      { limit: [10, 'minute'] },
    );
  }
}
