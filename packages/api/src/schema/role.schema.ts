import * as z from 'zod/v4-mini';

export const roleDtoSchema = z.object({
	id: z.string(),
	description: z.nullish(z.string()),
	color: z.nullish(z.string()),
	icon: z.nullish(z.string()),
	level: z.number(),
	authorities: z.array(z.string()),
	members: z.optional(z.int()),
});

export const simpleRoleDtoSchema = z.object({
	id: z.string(),
	color: z.nullish(z.string()),
	icon: z.nullish(z.string()),
	level: z.number(),
});

export const createRoleSchema = z.object({
	id: z.string(),
	description: z.string(),
	color: z.nullish(z.string()),
	icon: z.nullish(z.string()),
	level: z.number(),
	authorities: z.array(z.string()),
});

export const updateRoleSchema = z.partial(createRoleSchema);

export type RoleDto = z.infer<typeof roleDtoSchema>;
