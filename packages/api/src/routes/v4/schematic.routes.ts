import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  countSchematicSchema,
  previewImageQuerySchema,
  schematicDetailDtoSchema,
  schematicDtoSchema,
  schematicPreviewSchema,
  schematicQuerySchema,
  updateSchematicSchema
} from '../../schema/index.js';

export const schematicRoutes = {
  preview: defineApiRoute({
    body: z.instanceof(FormData),
    response: schematicPreviewSchema,
    path: `/schematics/preview`,
    method: 'POST',
    action: 'schematic.preview',
  }),
  image: defineApiRoute({
    body: z.instanceof(FormData),
    response: z.instanceof(ArrayBuffer),
    path: `/schematics/image`,
    method: 'POST',
    action: 'schematic.image',
  }),
  upload: defineApiRoute({
    body: z.instanceof(FormData),
    path: `/schematics`,
    method: 'POST',
    response: schematicDtoSchema,
    action: 'schematic.create',
  }),
  findAll: defineApiRoute({
    query: schematicQuerySchema,
    response: z.array(schematicDtoSchema),
    path: `/schematics`,
    method: 'GET',
  }),
  count: defineApiRoute({
    query: countSchematicSchema,
    response: z.number(),
    path: `/schematics/count`,
    method: 'GET',
  }),
  /**
   * Get schematic detail by itemId
   */
  get: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: schematicDetailDtoSchema,
    path: `/schematics/:id`,
    method: 'GET',
  }),

  /**
   * Get schematic preview image by itemId
   */
  getImage: defineApiRoute({
    params: z.object({
      id: z.uuidv7(),
    }),
    query: previewImageQuerySchema,
    response: z.any(),
    path: `/schematics/:id/image.png`,
    method: 'GET',
  }),

  /**
   * Download schematic binary data by itemId
   */
  data: defineApiRoute({
    params: z.object({
      id: z.uuidv7(),
    }),
    response: z.any(),
    path: `/schematics/:id/data`,
    method: 'GET',
  }),

  /**
   * Update schematic by itemId
   */
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: updateSchematicSchema,
    response: schematicDetailDtoSchema,
    path: `/schematics/:id`,
    method: 'PUT',
    action: 'schematic.update',
  }),
} as const;
