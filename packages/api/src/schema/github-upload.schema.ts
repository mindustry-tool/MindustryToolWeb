import { z } from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

// Upload Status Enum
export const uploadStatusSchema = z.literal(['PENDING', 'DOWNLOADING', 'PROCESSING', 'COMPLETED', 'FAILED']);

export type UploadStatus = z.infer<typeof uploadStatusSchema>;

// GitHub Upload Schema
export const gitHubUploadDtoSchema = z.object({
  id: z.string(),
  githubUrl: z.url(),
  authorId: z.uuidv7(),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
  total: z.nullable(z.int()),
  success: z.nullable(z.int()),
  fail: z.nullable(z.int()),
  duplicate: z.nullable(z.int()),
  status: uploadStatusSchema,
});

export type GitHubUpload = z.infer<typeof gitHubUploadDtoSchema>;

export const getGithubUploadSchema = z.array(gitHubUploadDtoSchema);

export type GetGithubUpload = z.infer<typeof getGithubUploadSchema>;

// Create Upload Request
export const createUploadSchema = z.object({
  githubUrl: z.string().check(
    z.regex(/https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/, {
      error: 'Must be a valid GitHub repository URL',
    }),
  ),
  authorId: z.uuidv7(),
});

export const updateUploadSchema = z.object({
  githubUrl: z.optional(
    z.string().check(
      z.regex(/https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/, {
        error: 'Must be a valid GitHub repository URL',
      }),
    ),
  ),
  status: z.optional(uploadStatusSchema),
  authorId: z.optional(z.uuidv7()),
});

export type UpdateUploadRequest = z.infer<typeof updateUploadSchema>;

export type CreateUploadRequest = z.infer<typeof createUploadSchema>;

// Get Uploads Query
export const getUploadsQuerySchema = z.extend(paginationQuerySchema, {
  status: z.optional(uploadStatusSchema),
  authorId: z.optional(z.uuidv7()),
});

export const countGitHubUploadQuerySchema = z.omit(getUploadsQuerySchema, {
  page: true,
  size: true,
});

export type CountGitHubUploadQuery = z.infer<typeof countGitHubUploadQuerySchema>;

export type GetUploadsQuery = z.infer<typeof getUploadsQuerySchema>;

// Upload Statistics
export const UploadStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  downloading: z.number(),
  processing: z.number(),
  completed: z.number(),
  failed: z.number(),
});

export type UploadStats = z.infer<typeof UploadStatsSchema>;
