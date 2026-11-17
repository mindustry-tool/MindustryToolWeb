import * as z from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

export const crashStatusSchema = z.enum(['PENDING', 'RESOLVED']);

export const createCrashSchema = z.object({
  content: z.string(),
});

export const modInfoDtoSchema = z.object({
  mod: z.string(),
  name: z.string(),
  repo: z.nullish(z.string()),
  author: z.nullish(z.string()),
  description: z.nullish(z.string()),
  iconUrl: z.nullish(z.string()),
  stars: z.nullish(z.number()),
  version: z.nullish(z.string()),
  minGameVersion: z.nullish(z.string()),
  lastUpdated: z.nullish(z.string()),
});

export type ModInfoDto = z.infer<typeof modInfoDtoSchema>;

export const crashDtoSchema = z.object({
  id: z.uuid(),
  mod: z.nullish(z.string()),
  modName: z.nullish(z.string()),
  message: z.string(),
  cause: z.string(),
  stacktrace: z.string(),
  status: crashStatusSchema,
  count: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.nullish(z.coerce.date()),
  updatedBy: z.nullish(z.uuid()),
  modInfo: z.nullish(modInfoDtoSchema),
});

export type CrashDto = z.infer<typeof crashDtoSchema>;

export const crashSortFieldSchema = z.enum(['last_seen', 'first_created', 'count']);
export type CrashSortField = z.infer<typeof crashSortFieldSchema>;

export const crashSortOrderSchema = z.enum(['asc', 'desc']);
export type CrashSortOrder = z.infer<typeof crashSortOrderSchema>;

export const crashQuerySchema = z.extend(paginationQuerySchema, {
  status: z.optional(z.union([crashStatusSchema, z.literal('ALL')])),
  mod: z.nullish(z.string()),
  modName: z.nullish(z.string()),
  sort: z.optional(crashSortFieldSchema),
  order: z.optional(crashSortOrderSchema),
});

export const crashedModDtoSchema = z.object({
  mod: z.nullish(z.string()),
  modName: z.nullish(z.string()),
  pendingCount: z.number(),
  iconUrl: z.nullish(z.string()),
  repo: z.nullish(z.string()),
  author: z.nullish(z.string()),
  description: z.nullish(z.string()),
  stars: z.nullish(z.number()),
  version: z.nullish(z.string()),
  minGameVersion: z.nullish(z.string()),
  lastUpdated: z.nullish(z.string()),
});

export type CrashedModDto = z.infer<typeof crashedModDtoSchema>;

export const updateCrashSchema = z.object({
  status: crashStatusSchema,
});
