import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createPlanetSchema,
  planetDtoSchema,
  updatePlanetSchema
} from '../../schema/index.js';

export const plannetRoutes = {
  findAll: defineApiRoute({
    response: z.array(planetDtoSchema),
    path: `/planets`,
    method: 'GET',
  }),
  create: defineApiRoute({
    body: createPlanetSchema,
    response: planetDtoSchema,
    path: `/planets`,
    method: 'POST',
    action: 'planet.create',
  }),
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: updatePlanetSchema,
    response: planetDtoSchema,
    path: `/planets/:id`,
    method: 'PUT',
    action: 'planet.update',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/planets/:id`,
    method: 'DELETE',
    action: 'planet.delete',
  }),
} as const;
