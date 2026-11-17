import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  modCountSchema,
  modDtoSchema,
  modQuerySchema,
  paginationQuerySchema,
  releaseDtoSchema
} from '../../schema/index.js';

export const modRoutes = {
  findAll: defineApiRoute({
    response: z.array(modDtoSchema),
    query: modQuerySchema,
    path: `/mods`,
    method: 'GET',
  }),
  count: defineApiRoute({
    response: z.number(),
    path: `/mods/count`,
    query: modCountSchema,
    method: 'GET',
  }),
  releases: {
    findAll: defineApiRoute({
      response: z.array(releaseDtoSchema),
      query: paginationQuerySchema,
      path: `/mods/:owner/:repo/releases`,
      method: 'GET',
      params: z.object({
        owner: z.string(),
        repo: z.string(),
      }),
    }),
  },
} as const;
