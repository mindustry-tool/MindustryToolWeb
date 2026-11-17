import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  countMapSchema,
  mapDetailDtoSchema,
  mapDtoSchema,
  mapPreviewSchema,
  mapQuerySchema,
  previewImageQuerySchema,
  updateMapSchema
} from '../../schema/index.js';

export const mapRoutes = {
  preview: defineApiRoute({
    body: z.instanceof(FormData),
    response: mapPreviewSchema,
    path: `/maps/preview`,
    method: 'POST',
    action: 'map.preview',
  }),
  image: defineApiRoute({
    body: z.instanceof(FormData),
    response: z.instanceof(ArrayBuffer),
    path: `/maps/image`,
    method: 'POST',
    action: 'map.image',
  }),
  upload: defineApiRoute({
    body: z.instanceof(FormData),
    path: `/maps`,
    method: 'POST',
    response: mapDtoSchema,
    action: 'map.create',
  }),
  findAll: defineApiRoute({
    query: mapQuerySchema,
    response: z.array(mapDtoSchema),
    path: `/maps`,
    method: 'GET',
  }),
  count: defineApiRoute({
    query: countMapSchema,
    response: z.number(),
    path: `/maps/count`,
    method: 'GET',
  }),
  /**
   * Get map detail by itemId
   */
  get: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: mapDetailDtoSchema,
    path: `/maps/:id`,
    method: 'GET',
  }),
  /**
   * Get map preview image by itemId
   */
  getImage: defineApiRoute({
    params: z.object({
      id: z.uuidv7(),
    }),
    query: previewImageQuerySchema,
    response: z.any(),
    path: `/maps/:id/image.png`,
    method: 'GET',
  }),
  /**
   * Download map binary data by itemId
   */
  data: defineApiRoute({
    params: z.object({
      id: z.uuidv7(),
    }),
    response: z.any(),
    path: `/maps/:id/data`,
    method: 'GET',
  }),

  /**
   * Update map by itemId
   */
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: updateMapSchema,
    response: mapDetailDtoSchema,
    path: `/maps/:id`,
    method: 'PUT',
    action: 'map.update',
  }),
} as const;
