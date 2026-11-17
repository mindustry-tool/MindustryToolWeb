import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  actionDtoSchema,
  countActionQuerySchema,
  getActionQuerySchema
} from '../../schema/index.js';

export const actionRoutes = {
  get: defineApiRoute({
    query: getActionQuerySchema,
    response: z.array(actionDtoSchema),
    path: `/actions`,
    method: 'GET',
  }),
  count: defineApiRoute({
    query: countActionQuerySchema,
    response: z.number(),
    path: `/actions/count`,
    method: 'GET',
  }),
  getTypes: defineApiRoute({
    response: z.array(z.string()),
    path: `/actions/types`,
    method: 'GET',
  }),
} as const;
