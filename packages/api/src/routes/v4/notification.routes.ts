import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  notificationDtoSchema,
  notificationPreferencesSchema,
  notificationQuerySchema,
  notificationSseEventSchema,
  unreadCountResultSchema,
  updateNotificationPreferencesSchema
} from '../../schema/index.js';

export const notificationRoutes = {
  findAll: defineApiRoute({
    query: notificationQuerySchema,
    response: z.object({
      data: z.array(notificationDtoSchema),
      nextCursor: z.nullable(z.string()),
    }),
    path: `/notifications`,
    method: 'GET',
  }),
  getUnreadCount: defineApiRoute({
    response: unreadCountResultSchema,
    path: `/notifications/unread-count`,
    method: 'GET',
  }),
  sse: defineApiRoute({
    response: notificationSseEventSchema,
    path: `/notifications/sse`,
    method: 'GET',
  }),
  markAsRead: defineApiRoute({
    params: z.object({
      id: z.string(),
    }),
    response: notificationDtoSchema,
    path: `/notifications/:id/read`,
    method: 'PATCH',
  }),
  markAllAsRead: defineApiRoute({
    response: z.object({
      count: z.number(),
    }),
    path: `/notifications/read-all`,
    method: 'POST',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.string(),
    }),
    response: z.object({
      success: z.boolean(),
    }),
    path: `/notifications/:id`,
    method: 'DELETE',
  }),
  clearRead: defineApiRoute({
    response: z.object({
      count: z.number(),
    }),
    path: `/notifications`,
    method: 'DELETE',
  }),
  getPreferences: defineApiRoute({
    response: notificationPreferencesSchema,
    path: `/notifications/preferences`,
    method: 'GET',
  }),
  updatePreferences: defineApiRoute({
    body: updateNotificationPreferencesSchema,
    response: notificationPreferencesSchema,
    path: `/notifications/preferences`,
    method: 'PATCH',
  }),
} as const;
