import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  adminCreateNotificationSchema,
  broadcastNotificationDtoSchema,
  paginationQuerySchema
} from '../../schema/index.js';

export const managementNotificationRoutes = {
  broadcast: defineApiRoute({
    body: adminCreateNotificationSchema,
    response: z.object({
      success: z.boolean(),
      sentCount: z.number(),
    }),
    path: `/management/notifications`,
    method: 'POST',
    action: 'notification.manage',
  }),
  getHistory: defineApiRoute({
    query: paginationQuerySchema,
    response: z.object({
      data: z.array(broadcastNotificationDtoSchema),
      total: z.number(),
    }),
    path: `/management/notifications`,
    method: 'GET',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.string(),
    }),
    response: z.object({
      success: z.boolean(),
    }),
    path: `/management/notifications/:id`,
    method: 'DELETE',
    action: 'notification.manage',
  }),
} as const;
