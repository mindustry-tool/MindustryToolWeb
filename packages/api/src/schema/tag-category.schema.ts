import * as z from 'zod/v4-mini';
import { NAME_REGEX } from '../constants/index.js';
import { tagDtoSchema } from './tag.schema.js';

export const createTagCategorySchema = z.object({
	name: z.string().check(z.minLength(1), z.maxLength(100), z.regex(NAME_REGEX)),
	color: z.optional(z.string().check(z.maxLength(100))),
	duplicate: z.boolean(),
	position: z.int(),
});

export const updateTagCategorySchema = z.partial(createTagCategorySchema);

export const tagCategoryDtoSchema = z.object({
	id: z.uuid(),
	name: z.string().check(z.minLength(1), z.maxLength(100)),
	color: z.optional(z.string().check(z.maxLength(100))),
	position: z.int(),
	duplicate: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.nullish(z.coerce.date()),
	createdBy: z.uuid(),
	updatedBy: z.nullish(z.uuid()),
});

export type TagCategoryDto = z.infer<typeof tagCategoryDtoSchema>;

export const tagCategoryWithTagsSchema = z.extend(tagCategoryDtoSchema, {
	tags: z.array(
		z.extend(tagDtoSchema, {
			count: z.int(),
		}),
	),
});

export type TagCategoryWithTagsDto = z.infer<typeof tagCategoryWithTagsSchema>;
