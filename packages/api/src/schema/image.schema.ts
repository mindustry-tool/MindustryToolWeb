import { z } from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

export const imageDtoSchema = z.object({
	id: z.uuid(),
	url: z.nullish(z.string()),
	parentId: z.nullish(z.uuid()),
	name: z.string(),
	width: z.int(),
	height: z.int(),
	createdAt: z.coerce.date(),
	createdBy: z.uuid(),
});

export type ImageDto = z.infer<typeof imageDtoSchema>;

export const imageQuerySchema = z.extend(paginationQuerySchema, {
	parentId: z.nullish(z.uuid()),
	q: z.optional(z.string()),
});

export const imageCountSchema = z.omit(imageQuerySchema, {
	page: true,
	size: true,
});

export const createImageFolderSchema = z.object({
	name: z.string(),
	parentId: z.optional(z.uuid()),
});

export const updateImageFolderSchema = z.object({
	name: z.string(),
});
