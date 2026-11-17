import { Controller } from '@nestjs/common';
import { WikiService } from './wiki.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Route(api.v4.wiki.create)
  async create() {
    return routeHandler(api.v4.wiki.create, ({ body, user }) => this.wikiService.create(body, user), {
      filter: 'wiki:manage',
    });
  }

  @Route(api.v4.wiki.linkPost)
  async link() {
    return routeHandler(api.v4.wiki.linkPost, ({ params, body }) => this.wikiService.link(params.id, body), {
      filter: 'wiki:manage',
    });
  }

  @Route(api.v4.wiki.findAll)
  async findAll() {
    return routeHandler(api.v4.wiki.findAll, ({ query }) => this.wikiService.findAll(query));
  }

  @Route(api.v4.wiki.view)
  async view() {
    return routeHandler(api.v4.wiki.view, ({ query }) => this.wikiService.view(query));
  }

  @Route(api.v4.wiki.update)
  update() {
    return routeHandler(
      api.v4.wiki.update,
      ({ params, body, user }) => this.wikiService.update(params.id, body, user),
      { filter: 'wiki:manage' },
    );
  }

  @Route(api.v4.wiki.delete)
  delete() {
    return routeHandler(api.v4.wiki.delete, ({ params }) => this.wikiService.remove(params.id), {
      filter: 'wiki:manage',
    });
  }

  @Route(api.v4.wiki.removeLink)
  removeLink() {
    return routeHandler(
      api.v4.wiki.removeLink,
      ({ params }) => this.wikiService.removeLink(params.wikiId, params.postId),
      { filter: 'wiki:manage' },
    );
  }
}
