import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Route(api.v4.users.me.update)
  updateMyUsername() {
    return routeHandler(api.v4.users.me.update, ({ user, body }) => this.userService.updateMyUsername(user.id, body), {
      filter: true,
    });
  }

  @Route(api.v4.users.me.ads.session)
  createAdRewardSession() {
    return routeHandler(
      api.v4.users.me.ads.session,
      ({ user }) => this.userService.createAdRewardSession(user.id),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }

  @Route(api.v4.users.me.ads.claim)
  claimAdReward() {
    return routeHandler(
      api.v4.users.me.ads.claim,
      ({ user, body }) => this.userService.claimAdReward(user.id, body.nonce),
      {
        filter: true,
        limit: [10, 'minute'],
      },
    );
  }

  @Route(api.v4.users.getBatches)
  getBatch() {
    return routeHandler(api.v4.users.getBatches, ({ body }) => this.userService.getUserBatch(body.ids), {
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.users.search)
  search() {
    return routeHandler(api.v4.users.search, ({ query }) => this.userService.search(query.q));
  }

  @Route(api.v4.users.findAll)
  listUsers() {
    return routeHandler(api.v4.users.findAll, ({ query }) => this.userService.findAll(query), {
      filter: 'user:manage',
    });
  }

  @Route(api.v4.users.count)
  countUsers() {
    return routeHandler(api.v4.users.count, ({ query }) => this.userService.count(query), {
      filter: 'user:manage',
    });
  }

  @Route(api.v4.users.create)
  createUser() {
    return routeHandler(api.v4.users.create, ({ body }) => this.userService.create(body), { filter: 'user:manage' });
  }

  @Route(api.v4.users.getByDiscordId)
  getDiscordUser() {
    return routeHandler(api.v4.users.getByDiscordId, ({ params }) => this.userService.findDiscordUser(params.id));
  }

  @Route(api.v4.users.getById)
  getUser() {
    return routeHandler(api.v4.users.getById, ({ params }) => this.userService.find(params.id));
  }

  @Route(api.v4.users.update)
  updateUser() {
    return routeHandler(api.v4.users.update, ({ params, body }) => this.userService.update(params.id, body), {
      filter: 'user:manage',
    });
  }

  @Route(api.v4.users.updateUserRoles)
  updateUserRoles() {
    return routeHandler(
      api.v4.users.updateUserRoles,
      ({ params, body }) => this.userService.updateUserRoles(params.id, body),
      { filter: 'user:manage' },
    );
  }

  @Route(api.v4.users.ban)
  banUser() {
    return routeHandler(api.v4.users.ban, ({ params, body }) => this.userService.ban(params.id, body.bannedUntil), {
      filter: 'user:manage',
    });
  }
}
