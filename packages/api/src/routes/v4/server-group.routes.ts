import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  assignServerGroupSchema,
  createServerGroupSchema,
  createServerGroupWebhookSchema,
  groupServerAdminDtoSchema,
  groupServerEnvDtoSchema,
  serverGroupDtoSchema,
  serverGroupWebhookDtoSchema,
  updateServerGroupSchema,
  updateServerGroupWebhookSchema,
  upsertGroupServerAdminSchema,
  upsertGroupServerEnvSchema
} from '../../schema/index.js';

export const serverGroupRoutes = {
  create: defineApiRoute({
    body: createServerGroupSchema,
    response: serverGroupDtoSchema,
    path: `/server-groups`,
    method: 'POST',
    action: 'server-group.create',
  }),
  list: defineApiRoute({
    response: z.array(serverGroupDtoSchema),
    path: `/server-groups`,
    method: 'GET',
  }),
  get: defineApiRoute({
    params: z.object({
      groupId: z.uuidv7(),
    }),
    response: serverGroupDtoSchema,
    path: `/server-groups/:groupId`,
    method: 'GET',
  }),
  update: defineApiRoute({
    params: z.object({
      groupId: z.uuidv7(),
    }),
    body: updateServerGroupSchema,
    response: serverGroupDtoSchema,
    path: `/server-groups/:groupId`,
    method: 'PUT',
    action: 'server-group.update',
  }),
  delete: defineApiRoute({
    params: z.object({
      groupId: z.uuidv7(),
    }),
    response: serverGroupDtoSchema,
    path: `/server-groups/:groupId`,
    method: 'DELETE',
    action: 'server-group.delete',
  }),
  admins: {
    list: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      response: z.array(groupServerAdminDtoSchema),
      path: `/server-groups/:groupId/admins`,
      method: 'GET',
    }),
    upsert: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      body: upsertGroupServerAdminSchema,
      response: groupServerAdminDtoSchema,
      path: `/server-groups/:groupId/admins`,
      method: 'PUT',
      action: 'server-group.admin.upsert',
    }),
    delete: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
        adminId: z.uuidv7(),
      }),
      path: `/server-groups/:groupId/admins/:adminId`,
      method: 'DELETE',
      action: 'server-group.admin.delete',
    }),
  },
  envs: {
    list: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      response: z.array(groupServerEnvDtoSchema),
      path: `/server-groups/:groupId/envs`,
      method: 'GET',
    }),
    upsert: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      body: upsertGroupServerEnvSchema,
      response: groupServerEnvDtoSchema,
      path: `/server-groups/:groupId/envs`,
      method: 'PUT',
      action: 'server-group.env.upsert',
    }),
    delete: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
        envId: z.uuidv7(),
      }),
      path: `/server-groups/:groupId/envs/:envId`,
      method: 'DELETE',
      action: 'server-group.env.delete',
    }),
  },
  webhooks: {
    getAll: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      response: z.array(serverGroupWebhookDtoSchema),
      path: `/server-groups/:groupId/webhooks`,
      method: 'GET',
    }),
    create: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      body: createServerGroupWebhookSchema,
      response: serverGroupWebhookDtoSchema,
      path: `/server-groups/:groupId/webhooks`,
      method: 'POST',
      action: 'server-group.webhook.create',
    }),
    update: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
        webhookId: z.uuidv7(),
      }),
      body: updateServerGroupWebhookSchema,
      response: serverGroupWebhookDtoSchema,
      path: `/server-groups/:groupId/webhooks/:webhookId`,
      method: 'PUT',
      action: 'server-group.webhook.update',
    }),
    delete: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
        webhookId: z.uuidv7(),
      }),
      path: `/server-groups/:groupId/webhooks/:webhookId`,
      method: 'DELETE',
      action: 'server-group.webhook.delete',
    }),
  },
  servers: {
    list: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      response: z.any(),
      path: `/server-groups/:groupId/servers`,
      method: 'GET',
    }),
    assign: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
      }),
      body: assignServerGroupSchema,
      response: z.any(),
      path: `/server-groups/:groupId/servers`,
      method: 'POST',
      action: 'server-group.server.assign',
    }),
    unassign: defineApiRoute({
      params: z.object({
        groupId: z.uuidv7(),
        serverId: z.uuidv7(),
      }),
      response: z.any(),
      path: `/server-groups/:groupId/servers/:serverId`,
      method: 'DELETE',
      action: 'server-group.server.unassign',
    }),
  },
} as const;
