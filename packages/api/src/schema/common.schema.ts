import * as z from 'zod/v4-mini';
import { DEFAULT_PAGINATION_SIZE } from '../constants/index.js';

export const paginationQuerySchema = z.object({
  page: z.catch(z.coerce.number().check(z.minimum(0)), 0),
  size: z.catch(z.coerce.number().check(z.minimum(1), z.maximum(200)), DEFAULT_PAGINATION_SIZE),
});

export const cursorPaginationQuerySchema = z.object({
  size: z.catch(z.coerce.number().check(z.minimum(1), z.maximum(200)), DEFAULT_PAGINATION_SIZE),
  cursor: z.optional(z.uuidv7()),
});

export type CursorPaginationQuery = typeof cursorPaginationQuerySchema;

export type PaginationQuery = typeof paginationQuerySchema;

export const ltreeSchema = z.string().check(z.regex(/^$|^(?:[a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+$/));

export const searchWikiQuery = z.object({
  path: z.nullish(ltreeSchema),
});

export const uuidSchema = z.uuid();

export const querySchema = z.object({
  q: z.optional(z.string()),
});

export const fullTagsQuerySchema = z.nullish(
  z.pipe(
    z.union([z.string(), z.array(z.string())]),
    z.transform((v) => (Array.isArray(v) ? v : v.split(','))),
  ),
);

export const imageTransformQuerySchema = z.object({
  width: z.optional(z.number()),
  height: z.optional(z.number()),
  format: z.optional(z.literal(['png', 'jpg', 'jpeg', 'webp'])),
});

export const previewImageQuerySchema = z.object({
  variant: z.optional(z.literal(['preview'])),
  format: z.optional(z.literal(['webp', 'jpg', 'jpeg', 'png'])),
});
