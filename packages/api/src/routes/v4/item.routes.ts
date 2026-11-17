import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  itemUpdateTagSchema
} from '../../schema/index.js';

export const itemRoutes = {
  updateTags: defineApiRoute({
    body: itemUpdateTagSchema,
    params: z.object({
      itemType: z.string(),
      id: z.string(),
    }),
    method: 'PUT',
    path: `/items/:itemType/:id/tags`,
  }),
} as const;
