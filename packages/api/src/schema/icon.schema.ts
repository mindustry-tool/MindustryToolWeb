import * as z from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

export const iconGroupDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdBy: z.uuid(),
	createdAt: z.coerce.date(),
	updatedBy: z.nullish(z.uuid()),
	updatedAt: z.nullish(z.coerce.date()),
});

export type IconGroupDto = z.infer<typeof iconGroupDtoSchema>;

export const iconDtoSchema = z.object({
	id: z.string(),
	url: z.string(),
	groupId: z.nullable(z.string()),
	group: z.nullable(iconGroupDtoSchema),
	createdAt: z.coerce.date(),
	createdBy: z.uuid(),
});

export const createIconSchema = z.object({
	name: z
		.string()
		.check(
			z.minLength(1),
			z.maxLength(32),
			z.regex(/^[a-zA-Z0-9_-]+$/, 'Name shouwld only contain letters, numbers, underscores, and hyphens'),
		),
	url: z.url(),
	groupId: z.nullable(z.uuid()),
});

export const updateIconSchema = z.omit(createIconSchema, { name: true });

export type IconDto = z.infer<typeof iconDtoSchema>;

export const iconQuerySchema = z.extend(paginationQuerySchema, {
	q: z.nullish(z.string()),
});
