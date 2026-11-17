import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  contentPacthDtoSchema,
  contentPatchDetailSchema,
  countContentPatchSchema,
  createContentPatchSchema,
  queryContentPatchSchema
} from '../../schema/index.js';

export const contentPatchesRoutes = {
  getAll: defineApiRoute({
    response: z.array(contentPacthDtoSchema),
    query: queryContentPatchSchema,
    path: `/content-patches`,
    method: 'GET',
  }),
  count: defineApiRoute({
    query: countContentPatchSchema,
    response: z.number(),
    path: `/content-patches/count`,
    method: 'GET',
  }),
  /**
   * Get content-patch detail by itemId
   */
  get: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: contentPatchDetailSchema,
    path: `/content-patches/:id`,
    method: 'GET',
  }),
  /**
   * Download content-patch data by itemId
   */
  data: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.string(),
    path: `/content-patches/:id/data`,
    method: 'GET',
  }),
  create: defineApiRoute({
    body: createContentPatchSchema,
    response: contentPacthDtoSchema,
    path: `/content-patches`,
    method: 'POST',
    action: 'server.content-patch.create',
  }),
} as const;
