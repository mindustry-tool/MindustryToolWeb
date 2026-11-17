import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  rejectItemSchema
} from '../../schema/index.js';

export const verificationRoutes = {
  verify: defineApiRoute({
    params: z.object({
      itemType: z.string(),
      id: z.string(),
    }),
    path: `/:itemType/:id/verify`,
    method: 'PUT',
    action: 'verify.verify',
  }),
  reject: defineApiRoute({
    params: z.object({
      itemType: z.string(),
      id: z.string(),
    }),
    body: z.optional(rejectItemSchema),
    path: `/:itemType/:id/reject`,
    method: 'PUT',
    action: 'verify.reject',
  }),
  reset: defineApiRoute({
    params: z.object({
      itemType: z.string(),
      id: z.string(),
    }),
    path: `/:itemType/:id/reset`,
    method: 'PUT',
    action: 'verify.reset',
  }),
} as const;
