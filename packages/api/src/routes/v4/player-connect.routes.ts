import { defineApiRoute } from '../../types/index.js';
import { playerConnectEventSchema } from '../../events/index.js';
import {
  getPlayerConnectProvidersSchema,
  getPlayerConnectRoomQuerySchema,
  getPlayerConnectRoomWithLinkSchema
} from '../../schema/index.js';

export const playerConnectRoutes = {
  getProviders: defineApiRoute({
    response: getPlayerConnectProvidersSchema,
    path: `/player-connect/providers`,
    method: 'GET',
  }),
  getRooms: defineApiRoute({
    query: getPlayerConnectRoomQuerySchema,
    response: getPlayerConnectRoomWithLinkSchema,
    path: `/player-connect/rooms`,
    method: 'GET',
  }),
  sse: defineApiRoute({
    response: playerConnectEventSchema,
    path: `/player-connect/sse`,
    method: 'GET',
  }),
} as const;
