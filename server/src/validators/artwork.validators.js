import { z } from 'zod';

export const artworkSchema = z.object({
  title: z.string().optional(),
  year: z.union([z.string(), z.number()]).optional(),
  caption: z.string().optional(),
  altText: z.string().optional(),
  source: z.string().optional(),
  credit: z.string().optional(),
  image: z.any().optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  initialPosition: z.object({ x: z.number(), y: z.number() }).optional(),
  rotation: z.number().optional(),
  scale: z.number().optional(),
});
