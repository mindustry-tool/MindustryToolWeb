import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import { FRIEND_STATUS } from '../../constants/index.js';
import {
  adRewardClaimBodySchema,
  adRewardClaimResponseSchema,
  adRewardSessionResponseSchema,
  countAllUserSchema,
  createUserSchema,
  friendshipDtoSchema,
  friendshipQuerySchema,
  queryAllUserSchema,
  updateMyUsernameSchema,
  updateUserSchema,
  userDtoSchema,
  userQuerySchema
} from '../../schema/index.js';

export const userRoutes = {
  me: {
    update: defineApiRoute({
      method: 'PUT',
      body: updateMyUsernameSchema,
      path: `/users/@me`,
      action: 'user.me.update',
    }),
    ads: {
      session: defineApiRoute({
        method: 'POST',
        response: adRewardSessionResponseSchema,
        path: `/users/@me/ads/session`,
      }),
      claim: defineApiRoute({
        method: 'POST',
        body: adRewardClaimBodySchema,
        response: adRewardClaimResponseSchema,
        path: `/users/@me/ads/claim`,
      }),
    },
    friends: {
      getAll: defineApiRoute({
        method: 'GET',
        response: z.array(friendshipDtoSchema),
        query: friendshipQuerySchema,
        path: `/users/@me/friends`,
      }),
      update: defineApiRoute({
        method: 'PUT',
        params: z.object({
          friendId: z.string(),
        }),
        body: z.object({
          status: z.enum(FRIEND_STATUS),
        }),
        path: `/users/@me/friends/:friendId`,
      }),
      create: defineApiRoute({
        method: 'POST',
        body: z.object({
          userId: z.string(),
        }),
        path: `/users/@me/friends`,
      }),
    },
  },

  getById: defineApiRoute({
    method: 'GET',
    response: userDtoSchema,
    params: z.object({
      id: z.uuid(),
    }),
    path: `/users/:id`,
  }),
  getBatches: defineApiRoute({
    body: z.object({
      ids: z.array(z.uuid()),
    }),
    response: z.array(userDtoSchema),
    method: 'POST',
    path: `/users/batches`,
  }),
  search: defineApiRoute({
    query: userQuerySchema,
    response: z.array(userDtoSchema),
    path: `/users/search`,
    method: 'GET',
  }),
  getByDiscordId: defineApiRoute({
    method: 'GET',
    response: userDtoSchema,
    params: z.object({
      id: z.string(),
    }),
    path: `/users/discord-:id`,
  }),
  findAll: defineApiRoute({
    method: 'GET',
    query: queryAllUserSchema,
    response: z.array(userDtoSchema),
    path: `/users`,
  }),
  count: defineApiRoute({
    method: 'GET',
    query: countAllUserSchema,
    response: z.number(),
    path: `/users/count`,
  }),
  create: defineApiRoute({
    method: 'POST',
    body: createUserSchema,
    response: userDtoSchema,
    path: `/users`,
    action: 'user.create',
  }),
  update: defineApiRoute({
    method: 'PUT',
    params: z.object({
      id: z.uuid(),
    }),
    body: updateUserSchema,
    response: userDtoSchema,
    path: `/users/:id`,
    action: 'user.update',
  }),
  updateUserRoles: defineApiRoute({
    method: 'PUT',
    params: z.object({
      id: z.uuid(),
    }),
    body: z.array(z.string()),
    response: userDtoSchema,
    path: `/users/:id/roles`,
    action: 'user.roles.update',
  }),
  ban: defineApiRoute({
    method: 'PUT',
    params: z.object({
      id: z.uuid(),
    }),
    body: z.object({
      bannedUntil: z.nullish(z.coerce.date()),
    }),
    path: `/users/:id/ban`,
    action: 'user.ban',
  }),
} as const;
