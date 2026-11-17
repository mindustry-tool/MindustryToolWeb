import { z } from 'zod/v4-mini';

export const logicDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.uuidv7(),
});

export const createLogicSchema = z.object({
  name: z.string(),
  content: z.any(),
});
