import * as z from 'zod/v4-mini';
import { ITEM_TYPES, NAME_REGEX } from '../constants/index.js';

export const createTagSchema = z.object({
	name: z.string().check(z.minLength(1), z.maxLength(100), z.regex(NAME_REGEX)),
	position: z.catch(z.int(), 0),
	planetIds: z.array(z.uuid()),
	categoryId: z.uuid(),
	icon: z.nullish(z.url()),
});

export const updateTagSchema = z.partial(createTagSchema);

export const findAllTagResponseSchema = z.any();

export const tagDetailQuerySchema = z.object({
	planetId: z.nullish(z.uuid()),
});

export const findAllTagQuerySchema = z.object({
	group: z.literal(ITEM_TYPES),
});

export const tagDtoSchema = z.object({
	id: z.uuid(),
	name: z.string().check(z.minLength(1), z.maxLength(100)),
	position: z.catch(z.int(), 0),
	planetIds: z.array(z.uuid()),
	categoryId: z.uuid(),
	icon: z.nullish(z.url()),
	fullTag: z.string(),
	color: z.optional(z.string().check(z.maxLength(100))),
	createdAt: z.coerce.date(),
	updatedAt: z.nullish(z.coerce.date()),
	createdBy: z.uuid(),
	updatedBy: z.nullish(z.uuid()),
});

export const itemTagDtoSchema = z.object({
	id: z.uuid(),
	name: z.string().check(z.minLength(1), z.maxLength(100)),
	position: z.catch(z.int(), 0),
	categoryId: z.uuid(),
	icon: z.nullish(z.url()),
	fullTag: z.string(),
	color: z.optional(z.string().check(z.maxLength(100))),
});

export type ItemTagDto = z.infer<typeof itemTagDtoSchema>;

export type TagDto = z.infer<typeof tagDtoSchema>;
