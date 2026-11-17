import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  generateMapFloorSchema,
  generateSorterImageSchema
} from '../../schema/index.js';

export const imageGeneratorsRoutes = {
  sorter: defineApiRoute({
    body: generateSorterImageSchema,
    response: z.instanceof(ArrayBuffer),
    path: `/v1/image-generator/sorter`,
    method: 'POST',
  }),
  floorMap: defineApiRoute({
    body: generateMapFloorSchema,
    response: z.instanceof(ArrayBuffer),
    path: `/v1/image-generator/map`,
    method: 'POST',
  }),
} as const;
