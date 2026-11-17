import { z } from 'zod/v4-mini';

export const fileDto = z.object({
  path: z.string(),
  directory: z.boolean(),
  data: z.nullish(z.string()),
  items: z.number(),
  size: z.number(),
});

export type FileDto = z.infer<typeof fileDto>;
