import * as z from 'zod/v4-mini';

// Individual Payload Schemas
export const verificationApprovedPayloadSchema = z.object({
  code: z.literal('verification.approved'),
  params: z.object({
    itemType: z.string(),
    itemId: z.string(),
    itemName: z.string(),
    credits: z.number(),
  }),
});

export const verificationRejectedPayloadSchema = z.object({
  code: z.literal('verification.rejected'),
  params: z.object({
    itemType: z.string(),
    itemId: z.string(),
    itemName: z.string(),
    reason: z.optional(z.string()),
  }),
});

export const likeSinglePayloadSchema = z.object({
  code: z.literal('like.single'),
  params: z.object({
    itemType: z.string(),
    itemId: z.string(),
    itemName: z.string(),
    actorName: z.string(),
  }),
});

export const likeMultiplePayloadSchema = z.object({
  code: z.literal('like.multiple'),
  params: z.object({
    itemType: z.string(),
    itemId: z.string(),
    itemName: z.string(),
    actorName: z.string(),
    count: z.number(),
  }),
});

export const shareRewardPayloadSchema = z.object({
  code: z.literal('share_reward'),
  params: z.object({
    url: z.string(),
    credits: z.number(),
    visitCount: z.optional(z.number()),
  }),
});

export const systemAnnouncementPayloadSchema = z.object({
  code: z.literal('system.announcement'),
  params: z.object({
    title: z.string(),
    message: z.string(),
    severity: z.optional(z.literal(['info', 'warning', 'alert'])),
    link: z.optional(z.string()),
  }),
});

export const systemMaintenancePayloadSchema = z.object({
  code: z.literal('system.maintenance'),
  params: z.object({
    title: z.string(),
    message: z.string(),
    estimatedTime: z.optional(z.string()),
  }),
});

export const commentPostPayloadSchema = z.object({
  code: z.literal('comment.post'),
  params: z.object({
    itemType: z.string(),
    itemId: z.string(),
    itemName: z.string(),
    actorName: z.string(),
    commentId: z.string(),
    contentSnippet: z.optional(z.string()),
  }),
});

export const commentReplyPayloadSchema = z.object({
  code: z.literal('comment.reply'),
  params: z.object({
    itemType: z.string(),
    itemId: z.string(),
    itemName: z.string(),
    actorName: z.string(),
    commentId: z.string(),
    replyId: z.string(),
    contentSnippet: z.optional(z.string()),
  }),
});

export const notificationPayloadSchema = z.discriminatedUnion('code', [
  verificationApprovedPayloadSchema,
  verificationRejectedPayloadSchema,
  likeSinglePayloadSchema,
  likeMultiplePayloadSchema,
  shareRewardPayloadSchema,
  commentPostPayloadSchema,
  commentReplyPayloadSchema,
  systemAnnouncementPayloadSchema,
  systemMaintenancePayloadSchema,
]);

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
export type NotificationCode = NotificationPayload['code'];
export type NotificationParamsByCode<C extends NotificationCode> = Extract<NotificationPayload, { code: C }>['params'];
export type NotificationParams = NotificationPayload['params'];

export const notificationCategorySchema = z.literal(['personal', 'system']);
export type NotificationCategory = z.infer<typeof notificationCategorySchema>;

const baseNotificationDtoSchema = z.object({
  id: z.string(),
  userId: z.optional(z.string()),
  category: notificationCategorySchema,
  groupKey: z.nullable(z.string()),
  aggregationKey: z.nullable(z.string()),
  link: z.nullable(z.string()),
  readAt: z.nullable(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const notificationDtoSchema = z.discriminatedUnion('code', [
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('verification.approved'),
    params: verificationApprovedPayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('verification.rejected'),
    params: verificationRejectedPayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('like.single'),
    params: likeSinglePayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('like.multiple'),
    params: likeMultiplePayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('share_reward'),
    params: shareRewardPayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('comment.post'),
    params: commentPostPayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('comment.reply'),
    params: commentReplyPayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('system.announcement'),
    params: systemAnnouncementPayloadSchema.shape.params,
  }),
  z.extend(baseNotificationDtoSchema, {
    code: z.literal('system.maintenance'),
    params: systemMaintenancePayloadSchema.shape.params,
  }),
]);

export type NotificationDto = z.infer<typeof notificationDtoSchema>;

export const notificationQuerySchema = z.object({
  size: z.catch(z.coerce.number().check(z.minimum(1), z.maximum(100)), 20),
  cursor: z.optional(z.string()),
  category: z.optional(notificationCategorySchema),
  unreadOnly: z.optional(z.boolean()),
  groupKey: z.optional(z.string()),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

export const unreadCountResultSchema = z.object({
  count: z.number(),
});

export type UnreadCountResult = z.infer<typeof unreadCountResultSchema>;

export const notificationPreferencesSchema = z.object({
  inAppEnabled: z.boolean(),
  verificationEnabled: z.boolean(),
  likesEnabled: z.boolean(),
  shareRewardEnabled: z.boolean(),
  systemEnabled: z.boolean(),
  commentsEnabled: z.boolean(),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

export const updateNotificationPreferencesSchema = z.partial(notificationPreferencesSchema);
export type UpdateNotificationPreferences = z.infer<typeof updateNotificationPreferencesSchema>;

export const adminTargetSchema = z.literal(['all', 'user', 'role']);
export type AdminTarget = z.infer<typeof adminTargetSchema>;

export const adminNotificationParamsSchema = z.union([
  systemAnnouncementPayloadSchema.shape.params,
  systemMaintenancePayloadSchema.shape.params,
]);
export type AdminNotificationParams = z.infer<typeof adminNotificationParamsSchema>;

export const adminCreateNotificationSchema = z.object({
  target: adminTargetSchema,
  targetId: z.optional(z.string()),
  code: z.literal(['system.announcement', 'system.maintenance']),
  params: adminNotificationParamsSchema,
  link: z.optional(z.string()),
});

export type AdminCreateNotification = z.infer<typeof adminCreateNotificationSchema>;

export const broadcastNotificationDtoSchema = z.object({
  id: z.string(),
  code: z.string(),
  category: notificationCategorySchema,
  params: adminNotificationParamsSchema,
  link: z.nullable(z.string()),
  createdAt: z.string(),
  readAt: z.nullable(z.string()),
});

export type BroadcastNotificationDto = z.infer<typeof broadcastNotificationDtoSchema>;

export const notificationSseEventSchema = z.object({
  notification: notificationDtoSchema,
});

export type NotificationSseEvent = z.infer<typeof notificationSseEventSchema>;
