import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  countPostQuerySchema,
  createPostSchema,
  postDetailDtoSchema,
  postDtoSchema,
  postQuerySchema
} from '../../schema/index.js';

export const postRoutes = {
  findAll: defineApiRoute({
    method: 'GET',
    query: postQuerySchema,
    response: z.array(postDtoSchema),
    path: `/posts`,
  }),
  count: defineApiRoute({
    method: 'GET',
    query: countPostQuerySchema,
    response: z.number(),
    path: `/posts/count`,
  }),
  /**
   * Get post detail by itemId
   */
  getById: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: postDetailDtoSchema,
    path: `/posts/:id`,
    method: 'GET',
  }),
  create: defineApiRoute({
    method: 'POST',
    body: createPostSchema,
    response: postDtoSchema,
    path: `/posts`,
  }),
  /**
   * Update post by itemId
   */
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: createPostSchema,
    response: postDtoSchema,
    path: `/posts/:id`,
    method: 'PUT',
  }),
  /**
   * Record post view by itemId
   */
  view: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    method: 'POST',
    path: `/posts/:id/view`,
  }),
  /**
   * Delete post by itemId
   */
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    method: 'DELETE',
    path: `/posts/:id`,
  }),
} as const;
