import * as z from 'zod/v4-mini';

export const roomStatus = ['UP', 'DOWN', 'HOST'] as const;

export const playerConnectRoomUpdateSchema = z.object({
  roomId: z.string(),
  data: z.object({
    name: z.string().check(z.minLength(1), z.maxLength(1000)),
    status: z.literal(roomStatus),
    isPrivate: z.boolean(),
    isSecured: z.boolean(),
    mapName: z.string().check(z.minLength(1), z.maxLength(1000)),
    gamemode: z.string().check(z.minLength(1), z.maxLength(100)),
    mods: z.array(z.string().check(z.minLength(1), z.maxLength(1000))),
    version: z.string().check(z.minLength(1), z.maxLength(100)),
    modVersion: z.optional(z.nullable(z.string().check(z.minLength(1), z.maxLength(100)))),
    locale: z.catch(z.optional(z.string().check(z.maxLength(20))), 'unknown'),
    createdAt: z.number(),
    ping: z.number(),
    players: z.array(
      z.object({
        name: z.string().check(z.minLength(1), z.maxLength(1000)),
        locale: z.catch(z.optional(z.string().check(z.maxLength(20))), 'unknown'),
      }),
    ),
    protocolVersion: z.string().check(z.minLength(1), z.maxLength(100)),
  }),
});

export type PlayerConnectRoomUpdate = z.infer<typeof playerConnectRoomUpdateSchema>;

export const playerConnectRoomRemoveSchema = z.object({
  roomId: z.string(),
});

export type PlayerConnectRoomRemove = z.infer<typeof playerConnectRoomRemoveSchema>;

export const playerConnectProviderSchema = z.object({
  id: z.string(),
  name: z.string().check(z.minLength(1), z.maxLength(1000)),
  address: z.string().check(z.minLength(1), z.maxLength(1000)),
  httpAddress: z.string().check(z.minLength(1), z.maxLength(1000)),
  httpPort: z.number(),
  port: z.number(),
});

export type PlayerConnectProvider = z.infer<typeof playerConnectProviderSchema>;

export const getPlayerConnectProvidersSchema = z.array(playerConnectProviderSchema);

export type GetPlayerConnectProviders = z.infer<typeof getPlayerConnectProvidersSchema>;

export const getPlayerConnectRoomsSchema = z.array(
  z.extend(playerConnectRoomUpdateSchema, {
    link: z.string().check(z.minLength(1), z.maxLength(1000)),
  }),
);

export type GetPlayerConnectRooms = z.infer<typeof getPlayerConnectRoomsSchema>;

export const PlayerConnectRoomWithLink = z.extend(playerConnectRoomUpdateSchema, {
  link: z.string().check(z.minLength(1), z.maxLength(1000)),
  address: z.string().check(z.minLength(1), z.maxLength(1000)),
  httpAddress: z.string().check(z.minLength(1), z.maxLength(1000)),
  name: z.string().check(z.minLength(1), z.maxLength(1000)),
});

export type PlayerConnectRoomWithLink = z.infer<typeof PlayerConnectRoomWithLink>;

export const getPlayerConnectRoomWithLinkSchema = z.array(PlayerConnectRoomWithLink);

export const getPlayerConnectRoomQuerySchema = z.object({
  q: z.optional(z.string().check(z.maxLength(1000))),
});
