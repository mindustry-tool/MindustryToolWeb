import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createShareLinkSchema,
  paginationQuerySchema,
  shareLinkDtoSchema
} from '../../schema/index.js';

export const shareRoutes = {
  create: defineApiRoute({
    body: createShareLinkSchema,
    response: shareLinkDtoSchema,
    path: `/shares`,
    method: 'POST',
    action: 'share-link.create',
  }),
  visit: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/shares/:id/visit`,
    method: 'PUT',
    action: 'share-link.visit',
  }),
  findMy: defineApiRoute({
    response: z.array(shareLinkDtoSchema),
    query: paginationQuerySchema,
    path: `/shares/@me`,
    method: 'GET',
  }),
  countMy: defineApiRoute({
    response: z.number(),
    path: `/shares/@me/count`,
    method: 'GET',
  }),
} as const;
