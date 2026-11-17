import { defineApiRoute } from '../types/api.js';
import { revalidateQuerySchema } from '../schema/index.js';
import { z } from 'zod/v4-mini';

export const frontendBackend = {
	v1: {
		revalidate: defineApiRoute({
			query: revalidateQuerySchema,
			response: z.object({
				revalidated: z.literal(true),
				now: z.number(),
				path: z.optional(z.array(z.string())),
				tag: z.optional(z.array(z.string())),
			}),
			method: 'GET',
			path: `/v1/revalidate`,
		}),
	},
};
