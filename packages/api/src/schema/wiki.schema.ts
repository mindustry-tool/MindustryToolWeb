import * as z from 'zod/v4-mini';
import { ltreeSchema } from './common.schema.js';
import { LOCALES, POST_STATUSES } from '../constants/index.js';
import { languageSchema } from './query.schema.js';

export const createWikiSchema = z.object({
	path: ltreeSchema,
});

export const updateWikiSchema = z.object({
	path: ltreeSchema,
});

export const wikiDtoSchema = z.object({
	id: z.uuid(),
	path: ltreeSchema,
	createdAt: z.coerce.date(),
	createdBy: z.uuid(),
	posts: z.array(
		z.object({
			id: z.uuid(),
            itemId: z.uuid(),
			title: z.string(),
			summary: z.string(),
			status: z.enum(POST_STATUSES),
			language: z.enum(LOCALES),
			cover: z.nullish(z.url()),
			likes: z.number(),
			views: z.number(),
			comments: z.number(),
			createdBy: z.uuid(),
			updatedBy: z.nullish(z.uuid()),
			createdAt: z.coerce.date(),
			updatedAt: z.nullish(z.coerce.date()),
		}),
	),
});

export const searchWikiViewSchema = z.object({
	language: languageSchema,
});

export const wikiViewDtoSchema = z.object({
	id: z.uuid(),
	path: ltreeSchema,
	createdAt: z.coerce.date(),
	createdBy: z.uuid(),
	post: z.object({
		id: z.uuid(),
		title: z.string(),
		summary: z.string(),
		status: z.enum(POST_STATUSES),
		language: z.enum(LOCALES),
		cover: z.nullish(z.url()),
		likes: z.number(),
		views: z.number(),
		comments: z.number(),
		createdBy: z.uuid(),
		updatedBy: z.nullish(z.uuid()),
		createdAt: z.coerce.date(),
		updatedAt: z.nullish(z.coerce.date()),
	}),
});

export const wikiLinkSchema = z.object({
	postId: z.uuid(),
});

export type WikiViewDto = z.infer<typeof wikiViewDtoSchema>;
export type WikiDto = z.infer<typeof wikiDtoSchema>;
