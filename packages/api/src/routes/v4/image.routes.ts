import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createImageFolderSchema,
  imageCountSchema,
  imageDtoSchema,
  imageQuerySchema,
  updateImageFolderSchema
} from '../../schema/index.js';

export const imageRoutes = {
  serve: defineApiRoute({
    method: 'GET',
    response: z.instanceof(ArrayBuffer),
    path: '/:path',
    params: z.object({
      path: z.string(),
    }),
  }),
  get: defineApiRoute({
    method: 'GET',
    query: imageQuerySchema,
    response: z.array(imageDtoSchema),
    path: '/images',
  }),
  create: defineApiRoute({
    method: 'POST',
    body: z.object({
      parentId: z.optional(z.uuid()),
      data: z.any(),
    }),
    path: '/images',
  }),
  count: defineApiRoute({
    method: 'GET',
    query: imageCountSchema,
    response: z.number(),
    path: '/images/count',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/images/:id`,
    method: 'DELETE',
  }),
  folders: {
    create: defineApiRoute({
      body: createImageFolderSchema,
      response: imageDtoSchema,
      path: `/images/folders`,
      method: 'POST',
    }),
    update: defineApiRoute({
      body: updateImageFolderSchema,
      params: z.object({
        id: z.string(),
      }),
      response: imageDtoSchema,
      path: `/images/folders/:id`,
      method: 'PUT',
    }),
  },
} as const;
