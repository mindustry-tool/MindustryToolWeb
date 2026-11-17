import { z } from 'zod/v4-mini';
import { SERVER_IMAGES, SERVER_MODES, SERVER_STATUSES } from '../constants/index.js';

export const createServerManagerSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(128)),
  address: z.string().check(z.minLength(5), z.maxLength(512), z.url(), z.regex(/^https?:\/\//)),
});

export const serverManagerDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
});

export const serverManagerDetailSchema = z.extend(serverManagerDtoSchema, {
  securityKey: z.string(),
  accessToken: z.string(),
});

export const serverManagerJwtPayload = z.object({
  id: z.string(),
});

export type ServerManagerJwtPayload = z.infer<typeof serverManagerJwtPayload>;

export const serverImageSchema = z.object({
  name: z.string(),
  image: z.string(),
  gameVersion: z.int(),
});

export type ServerImage = z.infer<typeof serverImageSchema>;

export const createServerSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(128)),
  managerId: z.optional(z.uuidv7()),
  description: z.string().check(z.minLength(1), z.maxLength(256)),
  mode: z.enum(SERVER_MODES),
  gamemode: z.optional(z.string()),
  port: z.int().check(z.gte(10000), z.lte(65535)),
  hostCommand: z.optional(z.string()),
  avatar: z.optional(z.string()),
  image: z.string().check(z.refine((image) => SERVER_IMAGES.some((item) => item.image === image))),
  gameVersion: z.int(),
});

export const updateServerSchema = z.omit(createServerSchema, {
  managerId: true,
});

export const adminUpdateServerSchema = z.object({
  isDefault: z.boolean(),
  isOfficial: z.boolean(),
  isAutoTurnOff: z.boolean(),
  isHub: z.boolean(),
  cpu: z.float32().check(z.gte(0.1), z.lte(4.0)),
  memory: z.int().check(z.gte(128), z.lte(4096)),
});

export const transferCreditSchema = z.object({
  amount: z.int().check(z.gte(1)),
});

export const serverDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdBy: z.uuidv7(),
  createdAt: z.coerce.date(),
  updatedAt: z.nullish(z.coerce.date()),
  managerId: z.string(),
  groupId: z.nullish(z.uuidv7()),
  address: z.string(),
  description: z.nullish(z.string()),
  mode: z.string(),
  gamemode: z.nullish(z.string()),
  port: z.int(),
  hostCommand: z.nullish(z.string()),
  avatar: z.nullish(z.string()),
  image: z.string(),
  gameVersion: z.int(),
  players: z.int(),
  status: z.int(),
  mapName: z.nullish(z.string()),
  mods: z.array(z.string()),
  isDefault: z.boolean(),
  isAutoTurnOff: z.boolean(),
  isOfficial: z.boolean(),
  isHub: z.boolean(),
  cpu: z.float32(),
  memory: z.int(),
  credit: z.int(),
});

export type ServerDto = z.infer<typeof serverDtoSchema>;

export const serverMismatchDtoSchema = z.object({
  field: z.string(),
  current: z.nullish(z.string()),
  expected: z.nullish(z.string()),
});

export const serverConfigSchema = z.object({
  id: z.uuidv7(),
  userId: z.uuidv7(),
  name: z.string().check(z.minLength(1), z.maxLength(128)),
  description: z.nullish(z.string().check(z.minLength(1), z.maxLength(2048))),
  mode: z.string().check(z.minLength(1), z.maxLength(256)),
  gamemode: z.string().check(z.minLength(1), z.maxLength(256)),
  hostCommand: z.nullish(z.string().check(z.maxLength(256))),
  port: z.int().check(z.gte(10000), z.lte(65535)),
  env: z.record(z.string().check(z.minLength(1)), z.string().check(z.minLength(1))),
  image: z.string().check(z.minLength(1), z.maxLength(256)),
  isDefault: z.boolean(),
  isAutoTurnOff: z.boolean(),
  isOfficial: z.boolean(),
  isHub: z.boolean(),
  cpu: z.float32(),
  memory: z.int(),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

export const teamDtoSchema = z.object({
  name: z.string(),
  color: z.string(),
});

export type TeamDto = z.infer<typeof teamDtoSchema>;

export const playerDtoSchema = z.object({
  name: z.string(),
  uuid: z.string(),
  locale: z.string(),
  ip: z.string(),
  team: teamDtoSchema,
  isAdmin: z.boolean(),
  joinedAt: z.number(),
  login: z.nullish(
    z.object({
      uuid: z.string(),
      name: z.string(),
      isAdmin: z.boolean(),
    }),
  ),
});

export type PlayerDto = z.infer<typeof playerDtoSchema>;

export const recentPlayerDtoSchema = z.object({
  name: z.string(),
  uuid: z.string(),
  ip: z.string(),
  joinedAt: z.number(),
});

export type RecentPlayerDto = z.infer<typeof recentPlayerDtoSchema>;

export const kickedIpsDtoSchema = z.record(z.string(), z.number());

export type KickedIpsDto = z.infer<typeof kickedIpsDtoSchema>;

export const removeKickedIpResponseSchema = z.object({
  success: z.boolean(),
});

export type RemoveKickedIpResponse = z.infer<typeof removeKickedIpResponseSchema>;

export const serverUsageDtoSchema = z.object({
  cpu: z.coerce.number(),
  ram: z.coerce.number(),
  createdAt: z.union([
    z.pipe(
      z.number(),
      z.transform((v) => new Date(v * 1000)),
    ),
    z.coerce.date(),
  ]),
});

export type ServerUsageDto = z.infer<typeof serverUsageDtoSchema>;

export const updateServerAdminSchema = z.object({
  userId: z.uuidv7(),
  authorities: z.array(z.string()),
});

export const serverAdminDtoSchema = z.object({
  id: z.uuidv7(),
  serverId: z.uuidv7(),
  userId: z.uuidv7(),
  authorities: z.array(z.string()),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
  updatedAt: z.nullish(z.coerce.date()),
  updatedBy: z.nullish(z.uuidv7()),
});

export const serverWebhookDtoSchema = z.object({
  id: z.uuidv7(),
  serverId: z.uuidv7(),
  url: z.string(),
  event: z.string(),
  data: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
  updatedAt: z.nullish(z.coerce.date()),
  updatedBy: z.nullish(z.uuidv7()),
});

export type ServerWebhookDto = z.infer<typeof serverWebhookDtoSchema>;

export const serverWebhookEventSchema = z.object({
  name: z.string(),
  description: z.string(),
  example: z.any(),
});

export type ServerWebhookEvent = z.infer<typeof serverWebhookEventSchema>;

export const createServerWebhookSchema = z.object({
  url: z.string(),
  event: z.string(),
  data: z.string(),
  active: z.optional(z.boolean()),
});

export const updateServerWebhookSchema = z.partial(createServerWebhookSchema);

export const serverGroupWebhookDtoSchema = z.object({
  id: z.uuidv7(),
  groupId: z.uuidv7(),
  url: z.string(),
  event: z.string(),
  data: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
  updatedAt: z.nullish(z.coerce.date()),
  updatedBy: z.nullish(z.uuidv7()),
});

export type ServerGroupWebhookDto = z.infer<typeof serverGroupWebhookDtoSchema>;

export const createServerGroupWebhookSchema = z.object({
  url: z.string(),
  event: z.string(),
  data: z.string(),
  active: z.optional(z.boolean()),
});

export const updateServerGroupWebhookSchema = z.partial(createServerGroupWebhookSchema);

export const createServerAdminSchema = z.object({
  userId: z.uuidv7(),
  authorities: z.array(z.string()),
});

export const createServerGroupSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(128)),
  description: z.optional(z.string().check(z.minLength(1), z.maxLength(512))),
});

export const updateServerGroupSchema = z.object({
  name: z.optional(z.string().check(z.minLength(1), z.maxLength(128))),
  description: z.optional(z.nullish(z.string().check(z.minLength(1), z.maxLength(512)))),
});

export const serverGroupDtoSchema = z.object({
  id: z.uuidv7(),
  name: z.string(),
  description: z.nullish(z.string()),
  ownerId: z.uuidv7(),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
  updatedAt: z.nullish(z.coerce.date()),
  updatedBy: z.nullish(z.uuidv7()),
});

export type ServerGroupDto = z.infer<typeof serverGroupDtoSchema>;

export const upsertGroupServerAdminSchema = z.object({
  userId: z.uuidv7(),
  authorities: z.array(z.string()),
});

export const groupServerAdminDtoSchema = z.object({
  id: z.uuidv7(),
  groupId: z.uuidv7(),
  userId: z.uuidv7(),
  authorities: z.array(z.string()),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
  updatedAt: z.nullish(z.coerce.date()),
  updatedBy: z.nullish(z.uuidv7()),
});

export const upsertGroupServerEnvSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(256)),
  value: z.string().check(z.minLength(1), z.maxLength(4096)),
});

export const groupServerEnvDtoSchema = z.object({
  id: z.uuidv7(),
  groupId: z.uuidv7(),
  name: z.string(),
  value: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
  updatedAt: z.nullish(z.coerce.date()),
  updatedBy: z.nullish(z.uuidv7()),
});

export const assignServerGroupSchema = z.object({
  serverId: z.uuidv7(),
});

export const serverResolvedConfigSchema = z.object({
  admins: z.array(groupServerAdminDtoSchema),
  envs: z.record(z.string(), z.string()),
});

export type ServerResolvedConfig = z.infer<typeof serverResolvedConfigSchema>;

export const loginTokenDto = z.object({
  uuid: z.string(),
  name: z.string(),
  ip: z.string(),
});

export const loginRequestDtoSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  ip: z.string(),
});

export const loginDto = z.union([
  z.object({
    uuid: z.string(),
    isAdmin: z.literal(false),
    name: z.string(),
    loginLink: z.string(),
  }),
  z.object({
    uuid: z.string(),
    isAdmin: z.boolean(),
    name: z.string(),
    userId: z.uuidv7(),
  }),
]);

export type LoginDto = z.infer<typeof loginDto>;

export const baseEventSchema = z.object({
  name: z.string(),
  serverId: z.uuidv7(),
  createdAt: z.union([
    z.pipe(
      z.number(),
      z.transform((v) => new Date(v * 1000)),
    ),
    z.coerce.date(),
  ]),
});

export const logEventSchema = z.extend(baseEventSchema, {
  name: z.literal('log'),
  level: z.literal(['info', 'error', 'warning']),
  data: z.string(),
});

export const startEventSchema = z.extend(baseEventSchema, {
  name: z.literal('start'),
});

export const stopEventSchema = z.extend(baseEventSchema, {
  name: z.literal('stop'),
  reason: z.string(),
});

export const disconnectEventSchema = z.extend(baseEventSchema, {
  name: z.literal('disconnect'),
});

export const serverStateSchema = z.object({
  serverId: z.uuidv7(),
  players: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
      ip: z.string(),
    }),
  ),
  mapName: z.string(),
  mods: z.array(
    z.object({
      name: z.string(),
      filename: z.string(),
      meta: z.object({
        name: z.string(),
        internalName: z.string(),
        minGameVersion: z.nullish(z.string()),
        displayName: z.nullish(z.string()),
        author: z.nullish(z.string()),
        description: z.nullish(z.string()),
        main: z.nullish(z.string()),
        version: z.nullish(z.string()),
      }),
    }),
  ),
  status: z.enum(SERVER_STATUSES),
  kicks: z.int(),
  version: z.string(),
  startedAt: z.number(),
});

export type ServerState = z.infer<typeof serverStateSchema>;

export const serverStateEvent = z.extend(baseEventSchema, {
  name: z.literal('server-state'),
  state: z.array(serverStateSchema),
});

export const chatEventSchema = z.extend(baseEventSchema, {
  name: z.literal('chat'),
  data: z.string(),
});

export const playerJoinEventSchema = z.extend(baseEventSchema, {
  name: z.literal('player-join'),
  player: playerDtoSchema,
});

export const playerLeaveSchema = z.extend(baseEventSchema, {
  name: z.literal('player-leave'),
  player: playerDtoSchema,
});

export const playerKickSchema = z.extend(baseEventSchema, {
  name: z.literal('player-kick'),
  uuid: z.nullish(z.string()),
  playerName: z.nullish(z.string()),
  ip: z.nullish(z.string()),
  reason: z.nullish(z.string()),
});

export const playerVoteKickSchema = z.extend(baseEventSchema, {
  name: z.literal('player-vote-kick'),
  uuid: z.nullish(z.string()),
  playerName: z.nullish(z.string()),
  ip: z.nullish(z.string()),
  reason: z.nullish(z.string()),
  participants: z.array(z.string()),
});

export const playerBanSchema = z.extend(baseEventSchema, {
  name: z.literal('player-ban'),
  uuid: z.nullish(z.string()),
  playerName: z.nullish(z.string()),
  ip: z.nullish(z.string()),
});

export const eventMap = {
  log: logEventSchema,
  'server-state': serverStateEvent,
  start: startEventSchema,
  stop: stopEventSchema,
  disconnect: disconnectEventSchema,
  chat: chatEventSchema,
  'player-join': playerJoinEventSchema,
  'player-leave': playerLeaveSchema,
  'player-kick': playerKickSchema,
  'player-ban': playerBanSchema,
  'player-vote-kick': playerVoteKickSchema,
} as const;

export type ServerEvent<T extends keyof typeof eventMap> = z.infer<(typeof eventMap)[T]>;

export function parseServerEvent(event: Record<string, any>): ServerEvent<keyof typeof eventMap> {
  const name = event.name as keyof typeof eventMap;

  if (!name) {
    throw new Error('Event name is required');
  }

  const parser = eventMap[name];

  if (!parser) {
    throw new Error(`Event ${name} is not supported`);
  }

  try {
    return parser.parse(event);
  } catch (error) {
    console.error('Invalid value: ' + JSON.stringify(event));
    throw error;
  }
}

export const serverLogDtoSchema = z.object({
  id: z.uuidv7(),
  serverId: z.uuidv7(),
  createdAt: z.coerce.date(),
  level: z.literal(['info', 'error', 'warning']),
  data: z.string(),
});

export type ServerLogDto = z.infer<typeof serverLogDtoSchema>;

export const serverMapDto = z.object({
  name: z.string(),
  filename: z.string(),
  width: z.int(),
  height: z.int(),
  custom: z.boolean(),
});

export type ServerMapDto = z.infer<typeof serverMapDto>;

export const serverModDto = z.object({
  name: z.string(),
  filename: z.string(),
  meta: z.object({
    name: z.string(),
    internalName: z.nullish(z.string()),
    minGameVersion: z.nullish(z.string()),
    displayName: z.nullish(z.string()),
    author: z.nullish(z.string()),
    description: z.nullish(z.string()),
    subtitle: z.nullish(z.string()),
    version: z.nullish(z.string()),
    main: z.nullish(z.string()),
    repo: z.nullish(z.string()),
    dependencies: z.nullish(z.array(z.string())),
    hidden: z.nullish(z.boolean()),
    java: z.nullish(z.boolean()),
  }),
});

export const serverCommandParamSchema = z.object({
  name: z.string(),
  optional: z.boolean(),
  variadic: z.boolean(),
});

export type ServerCommandParamDto = z.infer<typeof serverCommandParamSchema>;

export type ServerModDto = z.infer<typeof serverModDto>;

export const serverCommandSchema = z.object({
  text: z.string(),
  paramText: z.string(),
  description: z.string(),
  params: z.array(serverCommandParamSchema),
});

export type ServerCommandDto = z.infer<typeof serverCommandSchema>;
