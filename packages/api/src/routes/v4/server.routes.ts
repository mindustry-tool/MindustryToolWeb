import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  adminUpdateServerSchema,
  createServerManagerSchema,
  createServerSchema,
  createServerWebhookSchema,
  cursorPaginationQuerySchema,
  eventMap,
  kickedIpsDtoSchema,
  loginDto,
  loginRequestDtoSchema,
  loginTokenDto,
  paginationQuerySchema,
  playerDtoSchema,
  recentPlayerDtoSchema,
  removeKickedIpResponseSchema,
  serverAdminDtoSchema,
  serverCommandSchema,
  serverDtoSchema,
  serverLogDtoSchema,
  serverManagerDetailSchema,
  serverManagerDtoSchema,
  serverMapDto,
  serverMismatchDtoSchema,
  serverModDto,
  serverStateEvent,
  serverUsageDtoSchema,
  serverWebhookDtoSchema,
  serverWebhookEventSchema,
  transferCreditSchema,
  updateServerAdminSchema,
  updateServerSchema,
  updateServerWebhookSchema
} from '../../schema/index.js';

export const serverRoutes = {
  create: defineApiRoute({
    body: createServerSchema,
    response: serverDtoSchema,
    path: `/servers`,
    method: 'POST',
    action: 'server.create',
  }),
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: updateServerSchema,
    response: serverDtoSchema,
    path: `/servers/:id`,
    method: 'PUT',
    action: 'server.update',
  }),
  adminUpdate: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: adminUpdateServerSchema,
    response: serverDtoSchema,
    path: `/servers/:id/admin`,
    method: 'PUT',
    action: 'server.admin.update',
  }),
  findAll: defineApiRoute({
    response: z.array(serverDtoSchema),
    query: paginationQuerySchema,
    path: `/servers`,
    method: 'GET',
  }),
  findMyServer: defineApiRoute({
    response: z.array(serverDtoSchema),
    query: paginationQuerySchema,
    path: `/@me/servers`,
    method: 'GET',
  }),
  getMyAuthorities: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.array(z.string()),
    path: `/@me/servers/:id/authorities`,
    method: 'GET',
  }),
  get: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: serverDtoSchema,
    path: `/servers/:id`,
    method: 'GET',
  }),
  findMismatch: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.array(serverMismatchDtoSchema),
    path: `/servers/:id/mismatch`,
    method: 'GET',
  }),
  image: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.any(),
    path: `/servers/:id/image`,
    method: 'GET',
  }),
  usage: defineApiRoute({
    method: 'GET',
    path: '/servers/:id/usage',
    params: z.object({
      id: z.uuid(),
    }),
    response: serverUsageDtoSchema,
  }),
  state: defineApiRoute({
    method: 'GET',
    path: '/servers/:id/state',
    params: z.object({
      id: z.uuid(),
    }),
    response: serverStateEvent.shape.state.def.element,
  }),
  count: defineApiRoute({
    response: z.number(),
    path: `/servers/count`,
    method: 'GET',
  }),
  host: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: eventMap['log'],
    path: `/servers/:id/host`,
    method: 'POST',
    action: 'server.host',
  }),
  pause: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.boolean(),
    path: `/servers/:id/pause`,
    method: 'POST',
  }),
  hostServer: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.string(),
    path: `/servers/:id/host-server`,
    method: 'POST',
    action: 'server.host-server',
  }),
  getResolvedConfig: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.any(),
    path: `/servers/:id/resolved-config`,
    method: 'GET',
  }),
  getLogs: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    query: cursorPaginationQuerySchema,
    response: z.array(serverLogDtoSchema),
    path: `/servers/:id/logs`,
    method: 'GET',
  }),
  getLogStream: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: serverLogDtoSchema,
    path: `/servers/:id/logs/stream`,
    method: 'GET',
  }),
  commands: {
    send: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        command: z.string(),
      }),
      path: `/servers/:id/commands`,
      method: 'POST',
      action: 'server.command',
    }),
    getAll: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.array(serverCommandSchema),
      path: `/servers/:id/commands`,
      method: 'GET',
    }),
  },
  remove: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/servers/:id/remove`,
    method: 'DELETE',
    action: 'server.remove',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/servers/:id`,
    method: 'DELETE',
    action: 'server.delete',
  }),
  webhooks: {
    getAll: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.array(serverWebhookDtoSchema),
      path: `/servers/:id/webhooks`,
      method: 'GET',
    }),
    create: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      body: createServerWebhookSchema,
      response: serverWebhookDtoSchema,
      path: `/servers/:id/webhooks`,
      method: 'POST',
      action: 'server.webhook.create',
    }),
    update: defineApiRoute({
      params: z.object({
        id: z.uuid(),
        webhookId: z.uuid(),
      }),
      body: updateServerWebhookSchema,
      response: serverWebhookDtoSchema,
      path: `/servers/:id/webhooks/:webhookId`,
      method: 'PUT',
      action: 'server.webhook.update',
    }),
    delete: defineApiRoute({
      params: z.object({
        id: z.uuid(),
        webhookId: z.uuid(),
      }),
      path: `/servers/:id/webhooks/:webhookId`,
      method: 'DELETE',
      action: 'server.webhook.delete',
    }),
    events: {
      getAll: defineApiRoute({
        response: z.array(serverWebhookEventSchema),
        path: `/servers/webhooks/events`,
        method: 'GET',
      }),
    },
  },
  admins: {
    getAll: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.array(serverAdminDtoSchema),
      path: `/servers/:id/admins`,
      method: 'GET',
    }),
    update: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      body: updateServerAdminSchema,
      response: serverAdminDtoSchema,
      path: `/servers/:id/admins`,
      method: 'PUT',
      action: 'server.admin.update',
    }),
    delete: defineApiRoute({
      params: z.object({
        id: z.uuid(),
        adminId: z.uuid(),
      }),
      path: `/servers/:id/admins/:adminId`,
      method: 'DELETE',
      action: 'server.admin.delete',
    }),
  },
  files: {
    install: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        url: z.string(),
        path: z.string(),
      }),
      path: `/servers/:id/install-file`,
      method: 'POST',
      action: 'server.file.create',
    }),
    list: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      query: z.object({
        path: z.string(),
      }),
      response: z.any(),
      path: `/servers/:id/files`,
      method: 'GET',
    }),
    delete: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      query: z.object({
        path: z.string(),
      }),
      path: `/servers/:id/files`,
      method: 'DELETE',
      action: 'server.file.delete',
    }),
    createFolder: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      query: z.object({
        path: z.string(),
      }),
      path: `/servers/:id/folders`,
      method: 'POST',
      action: 'server.folder.create',
    }),
    write: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      query: z.object({
        path: z.string(),
      }),
      path: `/servers/:id/files`,
      method: 'POST',
      body: z.any(),
      action: 'server.file.write',
    }),
    download: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      query: z.object({
        path: z.string(),
      }),
      response: z.any(),
      path: `/servers/:id/files/download`,
      method: 'GET',
    }),
  },
  maps: {
    getAll: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.array(serverMapDto),
      path: `/servers/:id/maps`,
      method: 'GET',
    }),
  },
  mods: {
    getAll: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.array(serverModDto),
      path: `/servers/:id/mods`,
      method: 'GET',
    }),
  },
  players: {
    getAll: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.array(playerDtoSchema),
      path: `/servers/:id/players`,
      method: 'GET',
    }),
    getPlayerInfos: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      query: z.extend(paginationQuerySchema, {
        banned: z.nullish(z.union([z.boolean(), z.stringbool()])),
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
      path: `/servers/:id/player-infos`,
      method: 'GET',
    }),
    getRecent: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.array(recentPlayerDtoSchema),
      path: `/servers/:id/recent-players`,
      method: 'GET',
    }),
  },
  recentPlayers: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    response: z.array(recentPlayerDtoSchema),
    path: `/servers/:id/recent-players`,
    method: 'GET',
  }),
  kicks: {
    getAll: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: kickedIpsDtoSchema,
      path: `/servers/:id/kicks`,
      method: 'GET',
    }),
    remove: defineApiRoute({
      params: z.object({
        id: z.uuid(),
        ip: z.string(),
      }),
      response: removeKickedIpResponseSchema,
      path: `/servers/:id/kicks/:ip`,
      method: 'DELETE',
      action: 'server.kick.remove',
    }),
  },
  credit: {
    transfer: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      body: transferCreditSchema,
      response: z.any(),
      path: `/servers/:id/credit/transfer`,
      method: 'POST',
      action: 'server.credit.transfer',
    }),
  },
  login: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: loginRequestDtoSchema,
    response: loginDto,
    path: `/servers/:id/login`,
    method: 'POST',
  }),
  verifyLogin: defineApiRoute({
    params: z.object({
      token: z.string(),
    }),
    response: z.any(),
    path: `/servers/login/verify/:token`,
    method: 'POST',
  }),
  loginToken: defineApiRoute({
    params: z.object({
      token: z.string(),
    }),
    response: loginTokenDto,
    path: `/servers/login/:token`,
    method: 'POST',
  }),
  managers: {
    getMyServerManagers: defineApiRoute({
      response: z.array(serverManagerDtoSchema),
      path: `/managers`,
      method: 'GET',
    }),
    getFreeToUseServerManager: defineApiRoute({
      response: z.array(serverManagerDtoSchema),
      path: `/managers/free-to-use`,
      method: 'GET',
    }),
    create: defineApiRoute({
      body: createServerManagerSchema,
      response: serverManagerDtoSchema,
      path: `/server/managers`,
      method: 'POST',
      action: 'server.manager.create',
    }),
    get: defineApiRoute({
      params: z.object({
        id: z.string(),
      }),
      response: serverManagerDetailSchema,
      path: `/managers/:id`,
      method: 'GET',
    }),
    reset: defineApiRoute({
      params: z.object({
        id: z.string(),
      }),
      response: serverManagerDtoSchema,
      path: `/managers/:id/reset`,
      method: 'POST',
      action: 'server.manager.reset',
    }),
    findFreePort: defineApiRoute({
      params: z.object({
        id: z.uuid(),
      }),
      response: z.number(),
      path: `/managers/:id/find-free-port`,
      method: 'GET',
    }),
    isOwner: defineApiRoute({
      params: z.object({
        id: z.string(),
      }),
      response: z.boolean(),
      path: `/managers/:id/is-owner`,
      method: 'GET',
    }),
  },
} as const;
