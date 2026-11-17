import { Controller } from '@nestjs/common';
import { LikeService } from './like.service';
import { api } from '@mindustry-tool/api';
import { ItemType } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Route(api.v4.likes.find)
  findAll() {
    return routeHandler(
      api.v4.likes.find,
      ({ params, body, user }) => this.likeService.findAll(params.itemType as ItemType, body.itemIds, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.likes.create)
  create() {
    return routeHandler(
      api.v4.likes.create,
      ({ params, user }) => this.likeService.create(params.itemType as ItemType, params.itemId, user),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }
}
