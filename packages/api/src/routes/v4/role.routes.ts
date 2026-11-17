import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createRoleSchema,
  roleDtoSchema,
  updateRoleSchema
} from '../../schema/index.js';

export const roleRoutes = {
  findAll: defineApiRoute({
    response: z.array(roleDtoSchema),
    path: `/roles`,
    method: 'GET',
  }),
  create: defineApiRoute({
    body: createRoleSchema,
    response: roleDtoSchema,
    path: `/roles`,
    method: 'POST',
    action: 'role.create',
  }),
  update: defineApiRoute({
    params: z.object({
      id: z.string(),
    }),
    body: updateRoleSchema,
    response: roleDtoSchema,
    path: `/roles/:id`,
    method: 'PUT',
    action: 'role.update',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.string(),
    }),
    path: `/roles/:id`,
    method: 'DELETE',
    action: 'role.delete',
  }),
} as const;
