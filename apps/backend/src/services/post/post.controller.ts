import { Controller } from '@nestjs/common';
import { PostService } from './post.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { getRealIp } from '@/utils/query.utils';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Route(api.v4.posts.findAll)
  get() {
    return routeHandler(api.v4.posts.findAll, ({ query }) => this.postService.get(query));
  }

  @Route(api.v4.posts.count)
  count() {
    return routeHandler(api.v4.posts.count, ({ query }) => this.postService.count(query));
  }

  @Route(api.v4.posts.getById)
  getById() {
    return routeHandler(api.v4.posts.getById, ({ params }) => this.postService.getById(params.id));
  }

  @Route(api.v4.posts.create)
  create() {
    return routeHandler(api.v4.posts.create, ({ body, user }) => this.postService.create(body, user), {
      filter: true,
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.posts.view)
  view() {
    return routeHandler(
      api.v4.posts.view,
      ({ params, req }) => {
        const ip = getRealIp(req);
        return this.postService.view(params.id, ip);
      },
      { limit: [20, 'minute'] },
    );
  }

  @Route(api.v4.posts.update)
  update() {
    return routeHandler(
      api.v4.posts.update,
      ({ params, body, user }) => this.postService.update(params.id, body, user),
      { filter: true, limit: [20, 'minute'] },
    );
  }

  @Route(api.v4.posts.delete)
  delete() {
    return routeHandler(api.v4.posts.delete, ({ params, user }) => this.postService.delete(params.id, user), {
      filter: true,
      limit: [20, 'minute'],
    });
  }
}
