import { Controller } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Route(api.v4.users.me.friends.getAll)
  async getFriends() {
    return routeHandler(
      api.v4.users.me.friends.getAll,
      ({ user, query }) => this.friendshipService.getFriends(user.id, query),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.users.me.friends.update)
  async updateFriend() {
    return routeHandler(
      api.v4.users.me.friends.update,
      ({ user, params, body }) => this.friendshipService.updateFriend(user.id, params.friendId, body),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }

  @Route(api.v4.users.me.friends.create)
  async createFriend() {
    return routeHandler(
      api.v4.users.me.friends.create,
      ({ user, body }) => this.friendshipService.createFriend(user.id, body),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }
}
