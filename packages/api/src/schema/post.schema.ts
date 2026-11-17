import * as z from 'zod/v4-mini';
import { LOCALES, POST_STATUSES } from '../constants/index.js';
import { fullTagsQuerySchema, paginationQuerySchema } from './common.schema.js';
import { itemTagDtoSchema } from './tag.schema.js';

// Request Schemas
export const createPostSchema = z.object({
	title: z.string().check(z.minLength(3), z.maxLength(200)),
	content: z.string().check(z.minLength(10), z.maxLength(1_000_000)),
	summary: z.string().check(z.maxLength(300)),
	status: z.enum(POST_STATUSES),
	language: z.enum(LOCALES),
	cover: z.nullish(z.url()),
	tags: z.array(z.uuid()).check(z.maxLength(10)),
});

export const updatePostSchema = z.partial(createPostSchema);

// Response Schema
export const postDtoSchema = z.object({
	id: z.uuid(),
	itemId: z.uuid(),
	title: z.string(),
	summary: z.string(),
	status: z.enum(POST_STATUSES),
	language: z.string(),
	cover: z.nullish(z.url()),
	likes: z.number(),
	views: z.number(),
	comments: z.number(),
	createdBy: z.uuid(),
	updatedBy: z.nullish(z.uuid()),
	createdAt: z.coerce.date(),
	updatedAt: z.nullish(z.coerce.date()),
	tags: z.array(itemTagDtoSchema),
});

export const postDetailDtoSchema = z.object({
	id: z.uuid(),
	itemId: z.uuid(),
	title: z.string(),
	content: z.string(),
	summary: z.string(),
	status: z.enum(POST_STATUSES),
	language: z.string(),
	cover: z.nullish(z.url()),
	likes: z.number(),
	views: z.number(),
	comments: z.number(),
	createdBy: z.uuid(),
	updatedBy: z.nullish(z.uuid()),
	createdAt: z.coerce.date(),
	updatedAt: z.nullish(z.coerce.date()),
	tags: z.array(itemTagDtoSchema),
});

export const postQuerySchema = z.extend(paginationQuerySchema, {
	name: z.optional(z.string()),
	tags: fullTagsQuerySchema,
	author: z.optional(z.uuid()),
});

export const countPostQuerySchema = z.omit(postQuerySchema, {
	page: true,
	size: true,
});

export type PostDto = z.infer<typeof postDtoSchema>;
export type PostDetailDto = z.infer<typeof postDetailDtoSchema>;
