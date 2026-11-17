import { z } from 'zod/v4-mini';
import { fullTagsQuerySchema, paginationQuerySchema } from './common.schema.js';
import { SEARCH_VERIFICATION_STATUSES, SORT_TAGS, VERIFICATION_STATUSES } from '../constants/index.js';
import { itemTagDtoSchema } from './tag.schema.js';
import { mapPreviewSchema } from './content-parser.schema.js';

export const mapQuerySchema = z.extend(paginationQuerySchema, {
  name: z.optional(z.string()),
  tags: fullTagsQuerySchema,
  author: z.optional(z.uuid()),
  sort: z.optional(z.enum(SORT_TAGS)),
  verification: z.optional(z.literal(SEARCH_VERIFICATION_STATUSES)),
});

export const countMapSchema = z.omit(mapQuerySchema, {
  sort: true,
  page: true,
  size: true,
});

export const mapDtoSchema = z.object({
  id: z.uuid(),
  itemId: z.uuid(),
  name: z.string(),
  likes: z.number(),
  comments: z.number(),
  downloads: z.number(),
});

export const mapDetailDtoSchema = z.object({
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
  meta: mapPreviewSchema.def.shape.meta,
  verifierId: z.nullish(z.uuid()),
  verificationStatus: z.enum(VERIFICATION_STATUSES),
});

export const updateMapSchema = z.object({
  name: z.optional(z.string().check(z.minLength(1), z.maxLength(100))),
  description: z.optional(z.string().check(z.maxLength(2000))),
});

export type MapDto = z.infer<typeof mapDtoSchema>;
export type MapDetailDto = z.infer<typeof mapDetailDtoSchema>;
export type UpdateMapDto = z.infer<typeof updateMapSchema>;
