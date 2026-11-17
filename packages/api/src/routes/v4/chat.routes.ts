import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  channelSchema,
  chatMessageDtoSchema,
  chatStreamEventSchema,
  chatUserSchema,
  createChatMessageSchema
} from '../../schema/index.js';

export const chatRoutes = {
  stream: defineApiRoute({
    response: chatStreamEventSchema,
    path: `/chats/stream`,
    method: 'GET',
  }),
  users: defineApiRoute({
    response: z.array(chatUserSchema),
    path: `/chats/users`,
    method: 'GET',
    query: z.object({
      channelId: z.nullish(z.uuidv7()),
    }),
  }),
  userCount: defineApiRoute({
    response: z.number(),
    path: `/chats/users/count`,
    method: 'GET',
    query: z.object({
      channelId: z.uuidv7(),
    }),
  }),
  send: defineApiRoute({
    body: createChatMessageSchema,
    response: chatMessageDtoSchema,
    path: `/chats/:type`,
    params: z.object({
      type: z.literal(['text', 'msch', 'msav']),
    }),
    method: 'POST',
  }),
  fetch: defineApiRoute({
    response: z.array(chatMessageDtoSchema),
    path: `/chats`,
    method: 'GET',
    query: z.object({
      channelId: z.uuidv7(),
      cursor: z.optional(z.uuidv7()),
    }),
  }),
  channels: defineApiRoute({
    response: z.array(channelSchema),
    path: `/chats/channels`,
    method: 'GET',
  }),
  updateState: defineApiRoute({
    body: z.object({ state: z.string().check(z.minLength(1), z.maxLength(128)) }),
    path: `/chats/users/state`,
    method: 'PUT',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/chats/:id`,
    method: 'DELETE',
    action: 'chat.delete',
  }),
};
