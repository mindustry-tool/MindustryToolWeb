import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  communityServerDtoSchema,
  communityServerGroupDtoSchema,
  communityServerQuerySchema,
  communityServerSnapshotDtoSchema
} from '../../schema/index.js';

export const communityServerRoutes = {
  findAll: defineApiRoute({
    query: communityServerQuerySchema,
    response: z.array(communityServerDtoSchema),
    path: `/community-servers`,
    method: 'GET',
  }),
  getHistory: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.array(communityServerSnapshotDtoSchema),
    path: `/community-servers/:id/history`,
    method: 'GET',
  }),
  findGroups: defineApiRoute({
    response: z.array(communityServerGroupDtoSchema),
    path: `/community-servers/groups`,
    method: 'GET',
  }),
} as const;
