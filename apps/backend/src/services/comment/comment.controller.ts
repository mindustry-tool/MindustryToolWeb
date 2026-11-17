import { Controller } from '@nestjs/common';
import { CommentService } from './comment.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Route(api.v4.comments.create)
  create() {
    return routeHandler(
      api.v4.comments.create,
      ({ params, body, user }) => this.commentService.create(params, body, user),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }

  @Route(api.v4.comments.findAll)
  findAll() {
    return routeHandler(api.v4.comments.findAll, ({ params, query }) =>
      this.commentService.findAll(params.itemId, query),
    );
  }

  @Route(api.v4.comments.findAllAdmin)
  findAllAdmin() {
    return routeHandler(api.v4.comments.findAllAdmin, ({ query }) => this.commentService.findAllAdmin(query), {
      filter: 'god',
    });
  }

  @Route(api.v4.comments.countAdmin)
  countAdmin() {
    return routeHandler(api.v4.comments.countAdmin, () => this.commentService.countAdmin(), {
      filter: 'god',
    });
  }

  @Route(api.v4.comments.delete)
  delete() {
    return routeHandler(api.v4.comments.delete, ({ params, user }) => this.commentService.delete(params.id, user), {
      filter: true,
      limit: [20, 'minute'],
    });
  }
}
