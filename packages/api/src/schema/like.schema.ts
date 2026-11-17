import * as z from 'zod/v4-mini';

export const likeDtoSchema = z.object({
	userId: z.uuid(),
	itemId: z.uuid(),
	state: z.number(),
});

export type LikeDto = z.infer<typeof likeDtoSchema>;

export const likeResultSchema = z.object({
	userId: z.uuid(),
	itemId: z.uuid(),
	state: z.number(),
	likeCount: z.int(),
});

export type LikeResult = z.infer<typeof likeResultSchema>;

export const likeBatchDtoSchema = z.object({
	itemIds: z.array(z.uuid()).check(z.maxLength(100)),
});

export const likeBatchesResultSchema = z.array(z.object({ itemId: z.uuid() }));

export type LikeBatchesResult = z.infer<typeof likeBatchesResultSchema>;
