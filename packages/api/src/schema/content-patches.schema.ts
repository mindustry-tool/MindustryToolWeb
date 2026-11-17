import { z } from 'zod/v4-mini';
import { SEARCH_VERIFICATION_STATUSES, SORT_TAGS, VERIFICATION_STATUSES } from '../constants/index.js';
import { fullTagsQuerySchema, paginationQuerySchema } from './common.schema.js';
import { itemTagDtoSchema } from './tag.schema.js';

export const CONTENT_PATCH_TYPE = ['DATA', 'DATAPACK'] as const;

export type ContentPatchType = (typeof CONTENT_PATCH_TYPE)[number];

export const contentPacthDtoSchema = z.object({
  id: z.uuidv7(),
  itemId: z.uuidv7(),
  name: z.string(),
  type: z.literal(CONTENT_PATCH_TYPE),
  description: z.string(),
  downloads: z.number(),
  comments: z.number(),
  likes: z.number(),
});

export type ContentPatchDto = z.infer<typeof contentPacthDtoSchema>;

export const contentPatchDetailSchema = z.object({
  id: z.uuidv7(),
  itemId: z.uuidv7(),
  name: z.string(),
  description: z.string(),
  type: z.literal(CONTENT_PATCH_TYPE),
  data: z.string(),
  verifierId: z.nullish(z.uuidv7()),
  verificationStatus: z.literal(VERIFICATION_STATUSES),
  downloads: z.number(),
  comments: z.number(),
  likes: z.number(),
  createdBy: z.uuid(),
  updatedBy: z.nullish(z.uuid()),
  createdAt: z.coerce.date(),
  updatedAt: z.nullish(z.coerce.date()),
  tags: z.array(itemTagDtoSchema),
  children: z.array(contentPacthDtoSchema),
});

export type ContentPatchDetailDto = z.infer<typeof contentPatchDetailSchema>;

export const createContentPatchSchema = z.object({
  name: z.string().check(z.minLength(1, 'name is required'), z.maxLength(128)),
  description: z.string(),
  data: z.string().check(z.minLength(10, 'data is required'), z.maxLength(1024 * 8)),
  type: z.literal(CONTENT_PATCH_TYPE),
});

export const queryContentPatchSchema = z.extend(paginationQuerySchema, {
  name: z.optional(z.string()),
  tags: fullTagsQuerySchema,
  author: z.optional(z.uuid()),
  sort: z.optional(z.enum(SORT_TAGS)),
  verification: z.optional(z.literal(SEARCH_VERIFICATION_STATUSES)),
});

export const countContentPatchSchema = z.omit(queryContentPatchSchema, {
  page: true,
  size: true,
});
