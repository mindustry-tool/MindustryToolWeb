import { z } from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

export const ownerSchema = z.object({
  name: z.nullish(z.string()),
  email: z.nullish(z.string()),
  login: z.string(),
  id: z.number(),
  node_id: z.string(),
  avatar_url: z.string(),
  url: z.string(),
});

export const modDtoSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  name: z.string(),
  full_name: z.string(),
  owner: z.nullish(ownerSchema),
  private: z.boolean(),
  description: z.nullish(z.string()),
  url: z.string(),
  html_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  stargazers_count: z.number(),
  topics: z.nullish(z.array(z.string())),
  archived: z.boolean(),
});

export type ModDto = z.infer<typeof modDtoSchema>;

export const releaseDtoSchema = z.object({
  url: z.string(),
  id: z.number(),
  tag_name: z.string(),
  name: z.nullable(z.string()),
  body: z.optional(z.nullable(z.string())),
  draft: z.boolean(),
  prerelease: z.boolean(),
  created_at: z.string(),
  published_at: z.nullable(z.string()),
  updated_at: z.optional(z.nullable(z.string())),
  assets: z.array(
    z.object({
      id: z.number(),
      url: z.string(),
      name: z.string(),
      content_type: z.string(),
      size: z.number(),
      download_count: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  ),
});

export type ReleaseDto = z.infer<typeof releaseDtoSchema>;

export const MINDUSTRY_TAGS = ['mindustry-mod', 'mindustry-plugin'] as const;

export type MindustryTag = (typeof MINDUSTRY_TAGS)[number];

export const mindustryTagSchema = z.literal(MINDUSTRY_TAGS);

export const modQuerySchema = z.extend(paginationQuerySchema, {
  tag: mindustryTagSchema,
});

export const modCountSchema = z.object({
  tag: mindustryTagSchema,
});
