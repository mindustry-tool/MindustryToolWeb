import { z } from 'zod/v4-mini';
import { paginationQuerySchema } from './common.schema.js';

export const createCommentSchema = z.object({
	itemId: z.string().check(z.uuid()),
	content: z.string().check(z.minLength(1), z.maxLength(1024)),
	replyId: z.nullish(z.uuid()),
});

export const commentDtoSchema = z.object({
	id: z.string().check(z.uuid()),
	itemId: z.string().check(z.uuid()),
	userId: z.string().check(z.uuid()),
	content: z.string().check(z.minLength(1), z.maxLength(1024)),
	replyId: z.nullish(z.uuid()),
	createdAt: z.coerce.date(),
});

export type CommentDto = z.infer<typeof commentDtoSchema>;

export const adminCommentDtoSchema = z.extend(commentDtoSchema, {
	itemType: z.string(),
});

export type AdminCommentDto = z.infer<typeof adminCommentDtoSchema>;

export const commentQuerySchema = paginationQuerySchema;
