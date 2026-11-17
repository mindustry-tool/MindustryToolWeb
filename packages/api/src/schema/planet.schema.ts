import { z } from 'zod/v4-mini';

export const planetDtoSchema = z.object({
	id: z.uuid(),
	name: z.string().check(z.minLength(1), z.maxLength(100)),
	position: z.catch(z.int(), 0),
	icon: z.nullish(z.url()),
	createdAt: z.coerce.date(),
	updatedAt: z.nullish(z.coerce.date()),
	createdBy: z.uuid(),
	updatedBy: z.nullish(z.uuid()),
});

export type PlanetDto = z.infer<typeof planetDtoSchema>;

export const createPlanetSchema = z.object({
	name: z.string().check(z.minLength(1), z.maxLength(100)),
	position: z.catch(z.int(), 0),
	icon: z.nullish(z.url()),
});

export const updatePlanetSchema = z.object({
	name: z.optional(z.string().check(z.minLength(1), z.maxLength(100))),
	position: z.optional(z.catch(z.int(), 0)),
	icon: z.nullish(z.url()),
});
