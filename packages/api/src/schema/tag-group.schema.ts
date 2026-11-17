import { z } from 'zod/v4-mini';
import { tagCategoryDtoSchema } from './tag-category.schema.js';
import { ITEM_TYPES } from '../constants/index.js';

export const tagGroupDtoSchema = z.object({
	group: z.string(),
	categories: z.array(tagCategoryDtoSchema),
});

export const createTagGroupDtoSchema = z.object({
	group: z.enum(ITEM_TYPES),
	categoryId: z.uuid(),
});

export type TagGroupDto = z.infer<typeof tagGroupDtoSchema>;
