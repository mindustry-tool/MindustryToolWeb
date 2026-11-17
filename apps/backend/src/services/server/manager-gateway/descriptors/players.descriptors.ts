import { z } from 'zod/v4-mini';
import { loginDto, playerDtoSchema, recentPlayerDtoSchema, kickedIpsDtoSchema, removeKickedIpResponseSchema } from '@mindustry-tool/api';
import { defineRpc } from '../protocol';

const serverIdReq = z.object({ serverId: z.uuidv7() });

const playerInfoDtoSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  lastIP: z.string(),
  ips: z.array(z.string()),
  names: z.array(z.string()),
  adminUsid: z.nullish(z.string()),
  timesKicked: z.number(),
  timesJoined: z.number(),
  banned: z.boolean(),
  admin: z.boolean(),
  lastKicked: z.number(),
});

const playerInfoPageDtoSchema = z.object({
  items: z.number(),
  page: z.number(),
  data: z.array(playerInfoDtoSchema),
});

export const playerDescriptors = {
  getPlayers: defineRpc({ type: 'get-players', request: serverIdReq, response: z.array(playerDtoSchema) }),
  getPlayerInfos: defineRpc({
    type: 'get-player-infos',
    request: z.object({
      serverId: z.uuidv7(),
      page: z.nullish(z.number()),
      size: z.nullish(z.number()),
      banned: z.nullish(z.boolean()),
      filter: z.nullish(z.string()),
    }),
    response: playerInfoPageDtoSchema,
  }),
  getRecentPlayers: defineRpc({
    type: 'get-recent-players',
    request: serverIdReq,
    response: z.array(recentPlayerDtoSchema),
  }),
  getKickedIps: defineRpc({ type: 'get-kicked-ips', request: serverIdReq, response: kickedIpsDtoSchema }),
  deleteKickedIp: defineRpc({
    type: 'delete-kicked-ip',
    request: z.object({ serverId: z.uuidv7(), ip: z.string().check(z.minLength(1)) }),
    response: removeKickedIpResponseSchema,
  }),
  updatePlayer: defineRpc({
    type: 'update-player',
    request: z.object({ serverId: z.uuidv7(), uuid: z.string().check(z.minLength(1)), player: loginDto }),
    response: z.void(),
  }),
};
