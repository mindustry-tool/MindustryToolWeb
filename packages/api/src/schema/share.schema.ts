import { z } from 'zod/v4-mini';

export const shareLinkDtoSchema = z.object({
  id: z.uuidv7(),
  url: z.string(),
  count: z.number(),
  createdBy: z.uuidv7(),
  createdAt: z.coerce.date(),
});

export const createShareLinkSchema = z.object({
  url: z.string(),
});
