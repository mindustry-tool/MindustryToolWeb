import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';

export const discordUploadRoutes = {
  upload: defineApiRoute({
    path: `/discord-uploads`,
    method: 'POST',
    body: z.object({
      userId: z.string(),
      file: z.string(), // base64
      fileType: z.string(),
    }),
    response: z.any(),
  }),
} as const;
