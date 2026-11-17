import * as z from 'zod/v4-mini';

export const mediaDtoSchema = z.object({
	id: z.uuid(),
	url: z.string(),
	name: z.string(),
	width: z.int(),
	height: z.int(),
	createdAt: z.coerce.date(),
	createdBy: z.uuid(),
});

export type MediaDto = z.infer<typeof mediaDtoSchema>;
