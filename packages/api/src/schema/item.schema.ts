import { z } from 'zod/v4-mini';

export const itemUpdateTagSchema = z.object({
	tags: z.array(z.string()),
});

export const rejectItemSchema = z.object({
	reason: z.optional(z.string().check(z.maxLength(500))),
});

export type RejectItemDto = z.infer<typeof rejectItemSchema>;
