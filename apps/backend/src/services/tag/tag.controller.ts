import { Controller } from '@nestjs/common';
import { TagService } from './tag.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Route(api.v4.tags.create)
  create() {
    return routeHandler(api.v4.tags.create, ({ body, user }) => this.tagService.create(body, user), {
      filter: 'tag:manage',
    });
  }

  @Route(api.v4.tags.groups.findAll)
  getGroups() {
    return routeHandler(api.v4.tags.groups.findAll, () => this.tagService.getGroups());
  }

  @Route(api.v4.tags.groups.create)
  crateGroups() {
    return routeHandler(api.v4.tags.groups.create, ({ body, user }) => this.tagService.createGroup(body, user), {
      filter: 'tag:manage',
    });
  }

  @Route(api.v4.tags.groups.delete)
  deleteGroup() {
    return routeHandler(
      api.v4.tags.groups.delete,
      ({ params }) => this.tagService.deleteGroup(params.id, params.categoryId),
      { filter: 'tag:manage' },
    );
  }

  @Route(api.v4.tags.findAll)
  findAll() {
    return routeHandler(api.v4.tags.findAll, ({ query: { group } }) => this.tagService.findAll(group));
  }

  @Route(api.v4.tags.getTagsDetail)
  getTagsDetail() {
    return routeHandler(api.v4.tags.getTagsDetail, ({ query }) => this.tagService.getTagsDetail(query.planetId));
  }

  @Route(api.v4.tags.categories.findAll)
  getCategories() {
    return routeHandler(api.v4.tags.categories.findAll, () => this.tagService.getCategories());
  }

  @Route(api.v4.tags.categories.create)
  createTagCategory() {
    return routeHandler(
      api.v4.tags.categories.create,
      ({ body, user }) => this.tagService.createTagCategory(body, user),
      { filter: 'tag:manage' },
    );
  }

  @Route(api.v4.tags.categories.update)
  updateTagCategory() {
    return routeHandler(
      api.v4.tags.categories.update,
      ({ params, body, user }) => this.tagService.updateTagCategory(params.id, body, user),
      { filter: 'tag:manage' },
    );
  }

  @Route(api.v4.tags.categories.delete)
  deleteTagCategory() {
    return routeHandler(api.v4.tags.categories.delete, ({ params }) => this.tagService.deleteTagCategory(params.id), {
      filter: 'tag:manage',
    });
  }

  @Route(api.v4.tags.categories.getById)
  getCategory() {
    return routeHandler(api.v4.tags.categories.getById, ({ params }) => this.tagService.getTagsCategory(params.id));
  }

  @Route(api.v4.tags.update)
  update() {
    return routeHandler(api.v4.tags.update, ({ user, params, body }) => this.tagService.update(params.id, body, user), {
      filter: 'tag:manage',
    });
  }

  @Route(api.v4.tags.delete)
  remove() {
    return routeHandler(api.v4.tags.delete, ({ params }) => this.tagService.remove(params.id), {
      filter: 'tag:manage',
    });
  }
}
