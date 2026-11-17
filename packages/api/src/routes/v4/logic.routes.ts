import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createLogicSchema,
  logicDtoSchema,
  paginationQuerySchema
} from '../../schema/index.js';

export const logicRoutes = {
  findMy: defineApiRoute({
    response: z.array(logicDtoSchema),
    query: paginationQuerySchema,
    path: `/logics/@me`,
    method: 'GET',
  }),
  data: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.any(),
    path: `/logics/:id/data`,
    method: 'GET',
  }),
  create: defineApiRoute({
    body: createLogicSchema,
    response: logicDtoSchema,
    path: `/logics`,
    method: 'POST',
    action: 'logic.create',
  }),
} as const;
