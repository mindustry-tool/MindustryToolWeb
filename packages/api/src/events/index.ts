import { z } from 'zod/v4-mini';
import { getPlayerConnectRoomWithLinkSchema } from '../schema/index.js';

const baseEventSchema = z.object({
  type: z.string(),
  correlationId: z.uuid(),
});

export type BaseEvent = z.infer<typeof baseEventSchema>;

export const playerConnectEventSchema = z.object({
  rooms: getPlayerConnectRoomWithLinkSchema,
});

export type PlayerConnectEvent = z.infer<typeof playerConnectEventSchema>;

export type EventKey = keyof Event;
export type EventData<T extends EventKey> = Event[T];

export const serverChatEventSchema = z.extend(baseEventSchema, {
  source: z.literal(['game', 'discord', 'global-chat']),
  serverId: z.uuid(),
  content: z.string().check(z.minLength(1)),
});

export type ServerChatEvent = z.infer<typeof serverChatEventSchema>;

export const serverDiscordChatEventSchema = z.extend(baseEventSchema, {
  content: z.string().check(z.minLength(1)),
  channelId: z.string(),
});

export type ServerDiscordChatEvent = z.infer<typeof serverDiscordChatEventSchema>;

export const serverDiscordChatReceiveEventSchema = z.extend(baseEventSchema, {
  content: z.string().check(z.minLength(1)),
  channelId: z.string(),
});

export type ServerDiscordChatReceiveEvent = z.infer<typeof serverDiscordChatReceiveEventSchema>;

export const globalChatEventSchema = z.extend(baseEventSchema, {
  content: z.string().check(z.minLength(1)),
  serverId: z.uuid(),
});

export type GlobalChatEvent = z.infer<typeof globalChatEventSchema>;

export type Event = {
  'player-connect': PlayerConnectEvent;
  'server-chat': ServerChatEvent;
  'server-discord-chat': ServerDiscordChatEvent;
  'server-discord-chat-receive': ServerDiscordChatReceiveEvent;
  'global-chat': GlobalChatEvent;
};
