import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  countGitHubUploadQuerySchema,
  createUploadSchema,
  getGithubUploadSchema,
  getUploadsQuerySchema,
  updateUploadSchema
} from '../../schema/index.js';

export const githubUploadRoutes = {
  create: defineApiRoute({
    path: `/github-uploads`,
    method: 'POST',
    body: createUploadSchema,
    action: 'upload.create',
  }),
  findAll: defineApiRoute({
    query: getUploadsQuerySchema,
    response: getGithubUploadSchema,
    path: `/github-uploads`,
    method: 'GET',
  }),
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: updateUploadSchema,
    path: `/github-uploads/:id`,
    method: 'PUT',
    action: 'upload.update',
  }),
  count: defineApiRoute({
    query: countGitHubUploadQuerySchema,
    response: z.number(),
    path: `/github-uploads/count`,
    method: 'GET',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/github-uploads/:id`,
    method: 'DELETE',
    action: 'upload.delete',
  }),
} as const;
