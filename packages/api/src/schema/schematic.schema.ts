import { z } from 'zod/v4-mini';
import { fullTagsQuerySchema, paginationQuerySchema } from './common.schema.js';
import { SEARCH_VERIFICATION_STATUSES, SORT_TAGS, VERIFICATION_STATUSES } from '../constants/index.js';
import { itemTagDtoSchema } from './tag.schema.js';
import { schematicPreviewSchema } from './content-parser.schema.js';

export const schematicQuerySchema = z.extend(paginationQuerySchema, {
  name: z.optional(z.string()),
  tags: fullTagsQuerySchema,
  author: z.optional(z.uuid()),
  sort: z.optional(z.enum(SORT_TAGS)),
  verification: z.optional(z.literal(SEARCH_VERIFICATION_STATUSES)),
  blocks: z.nullish(
    z.pipe(
      z.union([z.string(), z.array(z.string())]),
      z.transform((v) => (Array.isArray(v) ? v : [v])),
    ),
  ),
});

export const countSchematicSchema = z.omit(schematicQuerySchema, {
  sort: true,
  page: true,
  size: true,
});

export const schematicDtoSchema = z.object({
  id: z.uuid(),
  itemId: z.uuid(),
  name: z.string(),
  likes: z.number(),
  comments: z.number(),
  downloads: z.number(),
});

export const schematicDetailDtoSchema = z.object({
  id: z.uuid(),
  itemId: z.uuid(),
  name: z.string(),
  description: z.string(),
  likes: z.number(),
  width: z.number(),
  height: z.number(),
  comments: z.number(),
  downloads: z.number(),
  createdBy: z.uuid(),
  createdByUser: z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.nullish(z.string()),
  }),
  updatedBy: z.nullish(z.uuid()),
  createdAt: z.coerce.date(),
  updatedAt: z.nullish(z.coerce.date()),
  tags: z.array(itemTagDtoSchema),
  meta: schematicPreviewSchema.def.shape.meta,
  verifierId: z.nullish(z.uuid()),
  verificationStatus: z.enum(VERIFICATION_STATUSES),
});

export const updateSchematicSchema = z.object({
  name: z.optional(z.string().check(z.minLength(1), z.maxLength(100))),
  description: z.optional(z.string().check(z.maxLength(2000))),
});

export type SchematicDto = z.infer<typeof schematicDtoSchema>;
export type SchematicDetailDto = z.infer<typeof schematicDetailDtoSchema>;
export type UpdateSchematicDto = z.infer<typeof updateSchematicSchema>;
