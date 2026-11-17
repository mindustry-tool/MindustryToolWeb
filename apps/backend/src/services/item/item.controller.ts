import { Controller } from '@nestjs/common';
import { ItemService } from './item.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Route(api.v4.items.updateTags)
  async updateTags() {
    return routeHandler(
      api.v4.items.updateTags,
      async ({ params, body, user }) => this.itemService.updateTags(params.itemType, params.id, user, body),
      { filter: true, limit: [20, 'minute'] },
    );
  }
}
