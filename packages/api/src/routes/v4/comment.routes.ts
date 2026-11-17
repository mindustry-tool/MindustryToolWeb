import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  adminCommentDtoSchema,
  commentDtoSchema,
  commentQuerySchema,
  createCommentSchema
} from '../../schema/index.js';

export const commentRoutes = {
  create: defineApiRoute({
    params: z.object({
      itemType: z.string(),
      itemId: z.string(),
    }),
    body: createCommentSchema,
    response: commentDtoSchema,
    path: `/comments/:itemType/:itemId`,
    method: 'POST',
  }),
  findAll: defineApiRoute({
    params: z.object({
      itemType: z.string(),
      itemId: z.string(),
    }),
    query: commentQuerySchema,
    response: z.array(commentDtoSchema),
    path: `/comments/:itemType/:itemId`,
    method: 'GET',
  }),
  findAllAdmin: defineApiRoute({
    query: commentQuerySchema,
    response: z.array(adminCommentDtoSchema),
    path: `/comments`,
    method: 'GET',
  }),
  countAdmin: defineApiRoute({
    response: z.number(),
    path: `/comments/count`,
    method: 'GET',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    method: 'DELETE',
    path: `/comments/:id`,
  }),
} as const;
