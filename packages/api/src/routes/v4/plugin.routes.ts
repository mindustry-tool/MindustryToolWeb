import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';

export const pluginRoutes = {
  version: defineApiRoute({
    path: `/plugins/version`,
    method: 'GET',
    query: z.object({
      owner: z.string(),
      repo: z.string(),
      tag: z.string(),
    }),
    response: z.object({
      updatedAt: z.string(),
    }),
  }),
  download: defineApiRoute({
    path: `/plugins/download`,
    method: 'GET',
    query: z.object({
      owner: z.string(),
      repo: z.string(),
      tag: z.string(),
    }),
    response: z.any(),
    action: 'download',
  }),
} as const;
