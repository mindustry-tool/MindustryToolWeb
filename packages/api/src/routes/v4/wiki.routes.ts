import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  createWikiSchema,
  searchWikiQuery,
  searchWikiViewSchema,
  updateWikiSchema,
  wikiDtoSchema,
  wikiLinkSchema,
  wikiViewDtoSchema
} from '../../schema/index.js';

export const wikiRoutes = {
  create: defineApiRoute({
    body: createWikiSchema,
    response: wikiDtoSchema,
    path: '/wiki',
    method: 'POST',
    action: 'wiki.create',
  }),
  update: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: updateWikiSchema,
    response: wikiDtoSchema,
    path: `/wiki/:id`,
    method: 'PUT',
    action: 'wiki.update',
  }),
  findAll: defineApiRoute({
    query: searchWikiQuery,
    response: z.array(wikiDtoSchema),
    path: '/wiki',
    method: 'GET',
  }),
  view: defineApiRoute({
    query: searchWikiViewSchema,
    response: z.array(wikiViewDtoSchema),
    path: '/wiki/view',
    method: 'GET',
  }),
  delete: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    path: `/wiki/:id`,
    method: 'DELETE',
    action: 'wiki.delete',
  }),
  linkPost: defineApiRoute({
    params: z.object({
      id: z.uuid(),
    }),
    body: wikiLinkSchema,
    path: `/wiki/:id/link`,
    method: 'POST',
    action: 'wiki.link',
  }),
  removeLink: defineApiRoute({
    params: z.object({
      wikiId: z.string(),
      postId: z.string(),
    }),
    path: `/wiki/:wikiId/link/:postId`,
    method: 'DELETE',
    action: 'wiki.link.remove',
  }),
} as const;
