import { z } from 'zod/v4-mini';

export const schematicPreviewSchema = z.object({
  name: z.string(),
  description: z.string(),
  labels: z.array(z.string()),
  width: z.number(),
  height: z.number(),
  meta: z.object({
    powerConsumption: z.number(),
    powerProduction: z.number(),
    requirements: z.array(
      z.object({
        name: z.string(),
        color: z.string(),
        amount: z.number(),
      }),
    ),
    blocks: z.catch(z.array(z.string()), []),
  }),
  mod: z.nullish(z.string()),
});

export const mapPreviewSchema = z.object({
  name: z.string(),
  description: z.string(),
  width: z.number(),
  height: z.number(),
  meta: z.any(),
  author: z.string(),
});

export const mapPreviewCombinedSchema = z.extend(mapPreviewSchema, {
  image: z.base64(),
});

export const generateSorterImageSchema = z.object({
  image: z.any(),
  blockSize: z.number(),
  splitVertical: z.int(),
  splitHorizontal: z.int(),
});

export const generateMapFloorSchema = z.object({
  image: z.any(),
});
