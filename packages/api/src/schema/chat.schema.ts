import { z } from 'zod/v4-mini';
import { simpleUserDtoSchema } from './user.schema.js';

export const chatMessageDtoSchema = z.object({
  id: z.uuidv7(),
  createdBy: z.uuidv7(),
  createdAt: z.coerce.date(),
  content: z.string().check(z.minLength(1), z.maxLength(1028 * 24)),
  replyTo: z.nullish(z.uuidv7()),
  channelId: z.uuidv7(),
});

export type ChatMessageDto = z.infer<typeof chatMessageDtoSchema>;

export const chatDeleteEventSchema = z.object({
  id: z.uuidv7(),
  channelId: z.uuidv7(),
  lastMessageId: z.nullish(z.uuidv7()),
});

export type ChatDeleteEvent = z.infer<typeof chatDeleteEventSchema>;

export const chatStreamEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('message'),
    data: chatMessageDtoSchema,
  }),
  z.object({
    type: z.literal('delete'),
    data: chatDeleteEventSchema,
  }),
]);

export type ChatStreamEvent = z.infer<typeof chatStreamEventSchema>;

export const createChatMessageSchema = z.object({
  content: z.string().check(z.minLength(1), z.maxLength(1028 * 24)),
  replyTo: z.nullish(z.uuidv7()),
  channelId: z.uuidv7(),
});

export const channelSchema = z.object({
  id: z.uuidv7(),
  name: z.string().check(z.minLength(1), z.maxLength(100)),
  lastMessageId: z.nullish(z.uuidv7()),
});

export const chatUserSchema = z.extend(simpleUserDtoSchema, {
  state: z.nullish(z.string()),
});

export type ChatUserDto = z.infer<typeof chatUserSchema>;
