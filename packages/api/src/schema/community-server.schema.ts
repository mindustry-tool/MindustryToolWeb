import * as z from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

export const communityServerSnapshotDtoSchema = z.object({
  id: z.string(),
  serverId: z.string(),
  players: z.number(),
  ping: z.nullable(z.number()),
  isOnline: z.boolean(),
  createdAt: z.string(),
});

export type CommunityServerSnapshotDto = z.infer<typeof communityServerSnapshotDtoSchema>;

export const communityServerDtoSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  groupTotalPlayers: z.number(),
  groupServerCount: z.number(),
  address: z.string(),
  host: z.string(),
  port: z.number(),
  channels: z.array(z.string()),
  countryCode: z.nullable(z.string()),
  isOnline: z.boolean(),
  ping: z.nullable(z.number()),
  serverName: z.nullable(z.string()),
  cleanName: z.nullable(z.string()),
  mapName: z.nullable(z.string()),
  gamemode: z.nullable(z.string()),
  wave: z.nullable(z.number()),
  players: z.number(),
  playerLimit: z.nullable(z.number()),
  version: z.nullable(z.number()),
  description: z.nullable(z.string()),
  isHub: z.boolean(),
  lastPingAt: z.nullable(z.string()),
  snapshots: z.optional(z.array(communityServerSnapshotDtoSchema)),
});

export type CommunityServerDto = z.infer<typeof communityServerDtoSchema>;

export const communityServerGroupDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  channels: z.array(z.string()),
  totalPlayers: z.number(),
  serverCount: z.number(),
  lastSeenAt: z.string(),
});

export type CommunityServerGroupDto = z.infer<typeof communityServerGroupDtoSchema>;

export const communityServerSortEnum = z.enum(['players', 'name']);

export const communityServerQuerySchema = z.extend(paginationQuerySchema, {
  search: z.optional(z.string()),
  channel: z.optional(z.string()),
  gamemode: z.optional(z.string()),
  countryCode: z.optional(z.string()),
  sort: z.optional(communityServerSortEnum),
  order: z.optional(z.enum(['asc', 'desc'])),
});

export type CommunityServerQuery = z.infer<typeof communityServerQuerySchema>;
