import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createIconSchema,
  iconDtoSchema,
  iconGroupDtoSchema,
  iconQuerySchema,
  updateIconSchema
} from '../../schema/index.js';

export const iconRoutes = {
  create: defineApiRoute({
    body: createIconSchema,
    response: z.string(),
    path: `/icons`,
    method: 'POST',
    action: 'icon.create',
  }),
  update: defineApiRoute({
    body: updateIconSchema,
    params: z.object({
      id: z.uuid(),
    }),
    path: `/icons/:id`,
    method: 'PUT',
    action: 'icon.update',
  }),
  get: defineApiRoute({
    query: iconQuerySchema,
    response: z.array(iconDtoSchema),
    path: '/icons',
    method: 'GET',
  }),
  count: defineApiRoute({
    query: iconQuerySchema,
    response: z.number(),
    path: '/icons/count',
    method: 'GET',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/icons/:id`,
    method: 'DELETE',
    action: 'icon.delete',
  }),
  getGroups: defineApiRoute({
    response: z.array(iconGroupDtoSchema),
    path: '/icons/groups',
    method: 'GET',
  }),
} as const;
