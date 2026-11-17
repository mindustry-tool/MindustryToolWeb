import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createTagCategorySchema,
  createTagGroupDtoSchema,
  createTagSchema,
  findAllTagQuerySchema,
  tagCategoryDtoSchema,
  tagCategoryWithTagsSchema,
  tagDetailQuerySchema,
  tagDtoSchema,
  tagGroupDtoSchema,
  updateTagCategorySchema,
  updateTagSchema
} from '../../schema/index.js';

export const tagRoutes = {
  create: defineApiRoute({
    body: createTagSchema,
    response: tagDtoSchema,
    path: `/tags`,
    method: 'POST',
    action: 'tag.create',
  }),
  findAll: defineApiRoute({
    query: findAllTagQuerySchema,
    response: z.array(tagCategoryWithTagsSchema),
    path: `/tags`,
    method: 'GET',
  }),
  getById: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: tagDtoSchema,
    path: `/tags/:id`,
    method: 'GET',
  }),
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: updateTagSchema,
    response: tagDtoSchema,
    path: `/tags/:id`,
    method: 'PUT',
    action: 'tag.update',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/tags/:id`,
    method: 'DELETE',
    action: 'tag.delete',
  }),
  getTagsDetail: defineApiRoute({
    query: tagDetailQuerySchema,
    response: z.array(tagCategoryWithTagsSchema),
    path: `/tags/detail`,
    method: 'GET',
  }),
  categories: {
    findAll: defineApiRoute({
      response: z.array(tagCategoryDtoSchema),
      path: `/tag-categories`,
      method: 'GET',
    }),
    getById: defineApiRoute({
      params: z.object({
        id: z.string(),
      }),
      response: tagCategoryDtoSchema,
      path: `/tag-categories/:id`,
      method: 'GET',
    }),
    create: defineApiRoute({
      body: createTagCategorySchema,
      response: tagCategoryDtoSchema,
      path: `/tag-categories`,
      method: 'POST',
      action: 'tag.category.create',
    }),
    update: defineApiRoute({
      params: z.object({
        id: z.string(),
      }),
      body: updateTagCategorySchema,
      response: tagCategoryDtoSchema,
      path: `/tag-categories/:id`,
      method: 'PUT',
      action: 'tag.category.update',
    }),
    delete: defineApiRoute({
      params: z.object({
        id: z.string(),
      }),
      path: `/tag-categories/:id`,
      method: 'DELETE',
      action: 'tag.category.delete',
    }),
  },
  groups: {
    findAll: defineApiRoute({
      response: z.array(tagGroupDtoSchema),
      path: `/tag-groups`,
      method: 'GET',
    }),
    delete: defineApiRoute({
      params: z.object({
        id: z.string(),
        categoryId: z.string(),
      }),
      path: `/tag-groups/:id/categories/:categoryId`,
      method: 'DELETE',
      action: 'tag.group.delete',
    }),
    create: defineApiRoute({
      body: createTagGroupDtoSchema,
      path: `/tag-groups`,
      method: 'POST',
      action: 'tag.group.create',
    }),
  },
} as const;
