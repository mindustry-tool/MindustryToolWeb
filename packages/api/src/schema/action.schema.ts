import { z } from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

export const actionDtoSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	metadata: z.any(),
	triggeredAt: z.coerce.date(),
	triggeredBy: z.uuid(),
});

export const getActionQuerySchema = z.extend(paginationQuerySchema, {
	action: z.optional(z.string()),
	triggeredBy: z.optional(z.uuid()),
});

export const countActionQuerySchema = z.omit(getActionQuerySchema, {
	page: true,
	size: true,
});
