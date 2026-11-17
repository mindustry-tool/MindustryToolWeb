import * as z from 'zod/v4-mini';
import { roleDtoSchema, simpleRoleDtoSchema } from './role.schema.js';
import { paginationQuerySchema } from './common.schema.js';
import { AUTHORITIES, FRIEND_STATUS } from '../constants/index.js';

export const userDtoSchema = z.object({
  id: z.string(),
  name: z.string().check(z.minLength(1), z.maxLength(200)),
  imageUrl: z.nullish(z.string()),
  roles: z.array(roleDtoSchema),
  createdAt: z.coerce.date(),
  bannedUntil: z.nullish(z.coerce.date()),
  stats: z.record(z.string(), z.number()),
  thumbnailUrl: z.nullish(z.string()),
  authorities: z.catch(z.array(z.enum(AUTHORITIES)), []),
});

export const simpleUserDtoSchema = z.extend(
  z.omit(userDtoSchema, {
    authorities: true,
    stats: true,
    createdAt: true,
    bannedUntil: true,
    thumbnailUrl: true,
    roles: true,
  }),
  {
    roles: z.array(simpleRoleDtoSchema),
  },
);

export type UserDto = z.infer<typeof userDtoSchema>;

export const getUserBatchSchema = z.object({
  ids: z.array(z.uuid()),
});

export const userQuerySchema = z.object({
  q: z.optional(z.string()),
});

export const queryAllUserSchema = z.extend(paginationQuerySchema, {
  role: z.optional(z.string()),
  name: z.optional(z.string()),
});

export type QueryAllUserSchema = z.infer<typeof queryAllUserSchema>;

export const countAllUserSchema = z.omit(queryAllUserSchema, {
  page: true,
  size: true,
});

export const createUserSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(200)),
  imageUrl: z.nullish(z.string()),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  authorities: z.array(z.enum(AUTHORITIES)),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export const updateMyUsernameSchema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(200)),
});

export type UpdateMyUsernameSchema = z.infer<typeof updateMyUsernameSchema>;

export const friendshipDtoSchema = z.extend(
  z.omit(userDtoSchema, {
    authorities: true,
    roles: true,
    stats: true,
  }),
  {
    status: z.literal(['online', 'offline']),
  },
);

export const friendshipQuerySchema = z.object({
  status: z.optional(z.enum(FRIEND_STATUS)),
});

export const adRewardSessionResponseSchema = z.object({
  nonce: z.string(),
  expiresAt: z.coerce.date(),
});

export type AdRewardSessionResponse = z.infer<typeof adRewardSessionResponseSchema>;

export const adRewardClaimBodySchema = z.object({
  nonce: z.string().check(z.minLength(1), z.maxLength(128)),
});

export type AdRewardClaimBody = z.infer<typeof adRewardClaimBodySchema>;

export const adRewardClaimResponseSchema = z.object({
  granted: z.number(),
  remainingDaily: z.number(),
});

export type AdRewardClaimResponse = z.infer<typeof adRewardClaimResponseSchema>;
