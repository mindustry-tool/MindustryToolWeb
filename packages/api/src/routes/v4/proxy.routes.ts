import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  imageTransformQuerySchema
} from '../../schema/index.js';

export const proxyRoutes = {
  get: defineApiRoute({
    params: z.object({ bucket: z.string(), path: z.array(z.string()) }),
    response: z.any(),
    query: imageTransformQuerySchema,
    path: `/static/:bucket/*path`,
    method: 'GET',
  }),
} as const;
