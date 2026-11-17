import { z } from 'zod/v4-mini';
import { mapPreviewCombinedSchema, mapPreviewSchema, schematicPreviewSchema } from '../schema/content-parser.schema.js';
import { defineApiRoute } from '../types/api.js';

export const contentParser = {
  v2: {
    schematics: {
      preview: defineApiRoute({
        body: z.instanceof(FormData),
        response: schematicPreviewSchema,
        path: `/v2/schematics`,
        method: 'POST',
      }),
      image: defineApiRoute({
        body: z.instanceof(FormData),
        response: z.instanceof(ArrayBuffer),
        path: `/v2/schematics/image`,
        method: 'POST',
      }),
    },
    maps: {
      preview: defineApiRoute({
        body: z.instanceof(FormData),
        response: mapPreviewSchema,
        path: `/v2/maps`,
        method: 'POST',
      }),
      image: defineApiRoute({
        body: z.instanceof(FormData),
        response: z.instanceof(ArrayBuffer),
        path: `/v2/maps/image`,
        method: 'POST',
      }),
      combined: defineApiRoute({
        body: z.instanceof(FormData),
        response: mapPreviewCombinedSchema,
        path: `/v2/maps/combined`,
        method: 'POST',
      }),
    },
    images: {
      sorter: defineApiRoute({
        body: z.instanceof(FormData),
        response: z.instanceof(ArrayBuffer),
        path: `/v1/image-generator/sorter`,
        method: 'POST',
      }),
      floorMap: defineApiRoute({
        body: z.instanceof(FormData),
        response: z.instanceof(ArrayBuffer),
        path: `/v1/image-generator/map`,
        method: 'POST',
      }),
    },
  },
};
