import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  crashDtoSchema,
  crashQuerySchema,
  crashedModDtoSchema,
  createCrashSchema,
  modInfoDtoSchema,
  paginationQuerySchema,
  updateCrashSchema
} from '../../schema/index.js';

export const crashRoutes = {
  create: defineApiRoute({
    body: createCrashSchema,
    path: `/crashes`,
    method: 'POST',
  }),
  findAll: defineApiRoute({
    query: crashQuerySchema,
    response: z.array(crashDtoSchema),
    path: `/crashes`,
    method: 'GET',
  }),
  count: defineApiRoute({
    query: crashQuerySchema,
    response: z.number(),
    path: `/crashes/count`,
    method: 'GET',
  }),
  get: defineApiRoute({
    params: z.object({
      id: z.string(),
    }),
    response: crashDtoSchema,
    path: `/crashes/:id`,
    method: 'GET',
    action: 'crash-view'
  }),
  update: defineApiRoute({
    params: z.object({
      id: z.string(),
    }),
    body: updateCrashSchema,
    response: crashDtoSchema,
    path: `/crashes/:id`,
    method: 'PUT',
  }),
  findMods: defineApiRoute({
    query: paginationQuerySchema,
    response: z.array(crashedModDtoSchema),
    path: `/crashed-mods`,
    method: 'GET',
  }),
  getModInfo: defineApiRoute({
    params: z.object({
      mod: z.string(),
    }),
    response: modInfoDtoSchema,
    path: `/crashed-mods/:mod`,
    method: 'GET',
  }),
  countMods: defineApiRoute({
    query: paginationQuerySchema,
    response: z.number(),
    path: `/crashed-mods/count`,
    method: 'GET',
  }),
} as const;
