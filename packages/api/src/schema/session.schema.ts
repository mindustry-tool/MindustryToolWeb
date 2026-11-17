import * as z from 'zod/v4-mini';
import { roleDtoSchema } from './role.schema.js';

export const sessionSchema = z.object({
	id: z.string(),
	name: z.string(),
	imageUrl: z.nullish(z.string()),
	roles: z.array(roleDtoSchema),
	authorities: z.array(z.string()),
	stats: z.record(z.string(), z.number()),
    bannedUntil: z.nullish(z.coerce.date()),
});

export type Session = z.infer<typeof sessionSchema>;
