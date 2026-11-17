import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  likeBatchDtoSchema,
  likeBatchesResultSchema,
  likeResultSchema
} from '../../schema/index.js';

export const likeRoutes = {
  create: defineApiRoute({
    params: z.object({
      itemType: z.string(),
      itemId: z.uuid(),
    }),
    response: likeResultSchema,
    method: 'POST',
    path: `/likes/:itemType/:itemId`,
    action: 'like.create',
  }),
  find: defineApiRoute({
    params: z.object({
      itemType: z.string(),
    }),
    body: likeBatchDtoSchema,
    response: likeBatchesResultSchema,
    path: `/likes/:itemType/batches`,
    method: 'POST',
  }),
} as const;
