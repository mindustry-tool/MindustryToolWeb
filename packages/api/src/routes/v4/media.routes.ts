import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  mediaDtoSchema,
  paginationQuerySchema
} from '../../schema/index.js';

export const mediaRoutes = {
  create: defineApiRoute({
    method: 'POST',
    body: z.instanceof(FormData),
    response: z.string(),
    path: `/media`,
  }),
  getMy: defineApiRoute({
    method: 'GET',
    query: paginationQuerySchema,
    response: z.array(mediaDtoSchema),
    path: '/@me/media',
  }),
  get: defineApiRoute({
    method: 'GET',
    query: paginationQuerySchema,
    response: z.array(mediaDtoSchema),
    path: '/media',
  }),
  count: defineApiRoute({
    method: 'GET',
    response: z.number(),
    path: '/media/count',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/media/:id`,
    method: 'DELETE',
    action: 'media.delete',
  }),
} as const;
