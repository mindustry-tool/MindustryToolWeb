import * as z from 'zod/v4-mini';

export const messageDtoSchema = z.object({
  id: z.uuidv7(),
  createdBy: z.uuidv7(),
  createdAt: z.coerce.date(),
  content: z.string().check(z.minLength(1), z.maxLength(1028)),
});

export type MessageDto = z.infer<typeof messageDtoSchema>;
