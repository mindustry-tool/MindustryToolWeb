import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  cursorPaginationQuerySchema,
  messageDtoSchema
} from '../../schema/index.js';

export const messageRoutes = {
  findAll: defineApiRoute({
    response: z.array(messageDtoSchema),
    query: cursorPaginationQuerySchema,
    path: `/messages/:room`,
    method: 'GET',
  }),
} as const;
