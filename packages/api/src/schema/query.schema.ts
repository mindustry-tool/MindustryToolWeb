import * as z from 'zod/v4-mini';
import { DEFAULT_SORT_TAG, LOCALES, SORT_TAGS } from '../constants/index.js';
import { fullTagsQuerySchema, paginationQuerySchema } from './common.schema.js';

export const sortSchema = z.catch(z.optional(z.enum(SORT_TAGS)), DEFAULT_SORT_TAG);

export const nameSchema = z.optional(z.string());
export const roleSchema = z.optional(z.string());
export const authorIdSchema = z.optional(z.string());
export const bannedSchema = z.optional(z.boolean());

export const languageSchema = z.catch(z.enum(LOCALES), 'en');
export const targetLanguageSchema = z.catch(z.enum(LOCALES), 'vi');
export const languageKeySchema = z.catch(z.string(), '');
export const isTranslatedSchema = z.catch(z.boolean(), false);

export type PaginationSchema = z.infer<typeof paginationQuerySchema>;

export const itemQuerySchema = z.extend(paginationQuerySchema, {
	name: nameSchema,
	authorId: authorIdSchema,
	tags: fullTagsQuerySchema,
	sort: sortSchema,
});

export type ItemQuerySchema = z.infer<typeof itemQuerySchema>;

export const playerInfoQuerySchema = z.extend(paginationQuerySchema, {
	banned: bannedSchema,
	filter: z.catch(z.string(), ''),
});

export type PlayerInfoQuerySchema = z.infer<typeof playerInfoQuerySchema>;


export const pingQuerySchema = z.object({
	client: z.string(),
});

export const revalidateQuerySchema = z.object({
	path: z.catch(z.optional(z.array(z.string())), []),
	tag: z.catch(z.optional(z.array(z.string())), []),
});
