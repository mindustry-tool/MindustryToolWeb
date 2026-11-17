import { z } from 'zod/v4-mini';

export const clientVisitBreakdownSchema = z.object({
	total: z.number(),
	mod: z.number(),
	web: z.number(),
	unknown: z.number(),
});

export type ClientVisitBreakdown = z.infer<typeof clientVisitBreakdownSchema>;

export const visitCountsDtoSchema = z.object({
	daily: clientVisitBreakdownSchema,
	weekly: clientVisitBreakdownSchema,
	monthly: clientVisitBreakdownSchema,
});

export type VisitCountsDto = z.infer<typeof visitCountsDtoSchema>;

export const visitCountsQuerySchema = z.object({
	start: z.string(),
	end: z.string(),
});
