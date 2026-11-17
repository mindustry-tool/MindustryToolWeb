import { defineApiRoute } from '../../types/index.js';
import {
  visitCountsDtoSchema,
  visitCountsQuerySchema
} from '../../schema/index.js';

export const statsRoutes = {
  visits: defineApiRoute({
    query: visitCountsQuerySchema,
    response: visitCountsDtoSchema,
    path: `/stats/visits`,
    method: 'GET',
  }),
} as const;
