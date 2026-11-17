import { z } from 'zod/v4-mini';
import {
  kickedIpsDtoSchema,
  loginDto,
  playerDtoSchema,
  recentPlayerDtoSchema,
  removeKickedIpResponseSchema,
  serverCommandSchema,
  serverConfigSchema,
  serverMapDto,
  serverMismatchDtoSchema,
  serverModDto,
  serverUsageDtoSchema,
} from '../schema/server.schema.js';
import { defineApiRoute } from '../types/api.js';

/**
 * @deprecated Legacy HTTP routes previously used to control Server Managers over HTTP.
 * Replaced by the inbound WebSocket RPC protocol (/managers/gateway).
 */
export const serverManagerApi = {

  servers: {
    host: defineApiRoute({
      method: 'POST',
      path: '/api/v2/servers/:id/host',
      body: serverConfigSchema,
      params: z.object({
        id: z.uuidv7(),
      }),
      response: z.any(),
    }),
    pause: defineApiRoute({
      method: 'POST',
      path: '/api/v2/servers/:id/pause',
      params: z.object({
        id: z.uuidv7(),
      }),
      response: z.boolean(),
    }),
    events: defineApiRoute({
      method: 'GET',
      path: '/api/v2/events',
      response: z.record(z.string(), z.any()),
    }),
    findMismatch: defineApiRoute({
      method: 'POST',
      path: '/api/v2/servers/:id/mismatch',
      params: z.object({
        id: z.uuidv7(),
      }),
      body: serverConfigSchema,
      response: z.array(serverMismatchDtoSchema),
    }),
    usage: defineApiRoute({
      method: 'GET',
      path: '/api/v2/servers/:id/usage',
      params: z.object({
        id: z.uuidv7(),
      }),
      response: serverUsageDtoSchema,
    }),
    players: {
      getAll: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/players',
        params: z.object({
          id: z.uuidv7(),
        }),
        response: z.array(playerDtoSchema),
      }),
      update: defineApiRoute({
        method: 'PUT',
        path: '/api/v2/servers/:id/players/:uuid',
        params: z.object({
          id: z.uuidv7(),
          uuid: z.string(),
        }),
        body: loginDto,
      }),
      getPlayerInfos: defineApiRoute({
        params: z.object({
          id: z.uuid(),
        }),
        query: z.object({
          page: z.nullish(z.number()),
          size: z.nullish(z.number()),
          banned: z.nullish(z.boolean()),
          filter: z.nullish(z.string()),
        }),
        response: z.object({
          items: z.number(),
          page: z.number(),
          data: z.array(
            z.object({
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
            }),
          ),
        }),
        path: `/api/v2/servers/:id/player-infos`,
        method: 'GET',
      }),
      getRecent: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/recent-players',
        params: z.object({
          id: z.uuidv7(),
        }),
        response: z.array(recentPlayerDtoSchema),
      }),
    },
    recentPlayers: defineApiRoute({
      method: 'GET',
      path: '/api/v2/servers/:id/recent-players',
      params: z.object({
        id: z.uuidv7(),
      }),
      response: z.array(recentPlayerDtoSchema),
    }),
    kicks: {
      getAll: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/kicks',
        params: z.object({
          id: z.uuidv7(),
        }),
        response: kickedIpsDtoSchema,
      }),
      remove: defineApiRoute({
        method: 'DELETE',
        path: '/api/v2/servers/:id/kicks/:ip',
        params: z.object({
          id: z.uuidv7(),
          ip: z.string(),
        }),
        response: removeKickedIpResponseSchema,
      }),
    },
    files: {
      write: defineApiRoute({
        method: 'POST',
        path: '/api/v2/servers/:id/files',
        body: z.instanceof(FormData),
        params: z.object({
          id: z.uuidv7(),
        }),
      }),
      list: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/files',
        params: z.object({
          id: z.uuidv7(),
        }),
        query: z.object({
          path: z.string(),
        }),
        response: z.any(),
      }),
      delete: defineApiRoute({
        method: 'DELETE',
        path: '/api/v2/servers/:id/files',
        params: z.object({
          id: z.uuidv7(),
        }),
        query: z.object({
          path: z.string(),
        }),
      }),

      createFolder: defineApiRoute({
        method: 'POST',
        path: '/api/v2/servers/:id/folders',
        params: z.object({
          id: z.uuidv7(),
        }),
        query: z.object({
          path: z.string(),
        }),
      }),
      download: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/files',
        params: z.object({
          id: z.uuidv7(),
        }),
        query: z.object({
          path: z.string(),
        }),
        response: z.any(),
      }),
    },
    image: defineApiRoute({
      method: 'GET',
      path: '/api/v2/servers/:id/image',
      params: z.object({
        id: z.uuidv7(),
      }),
      response: z.instanceof(ArrayBuffer),
    }),
    commands: {
      getAll: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/commands',
        params: z.object({
          id: z.uuidv7(),
        }),
        response: z.array(serverCommandSchema),
      }),
      send: defineApiRoute({
        method: 'POST',
        path: '/api/v2/servers/:id/commands',
        body: z.object({
          command: z.string(),
        }),
        params: z.object({
          id: z.uuidv7(),
        }),
      }),
    },
    chat: {
      send: defineApiRoute({
        method: 'POST',
        path: '/api/v2/servers/:id/chat',
        body: z.object({
          content: z.string(),
        }),
        params: z.object({
          id: z.uuidv7(),
        }),
      }),
    },
    remove: defineApiRoute({
      method: 'DELETE',
      path: '/api/v2/servers/:id/remove',
      params: z.object({
        id: z.uuidv7(),
      }),
    }),
    maps: {
      getAll: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/maps',
        params: z.object({
          id: z.uuidv7(),
        }),
        response: z.array(serverMapDto),
      }),
    },
    mods: {
      getAll: defineApiRoute({
        method: 'GET',
        path: '/api/v2/servers/:id/mods',
        params: z.object({
          id: z.uuidv7(),
        }),
        response: z.array(serverModDto),
      }),
    },
  },
} as const;
