import { z } from 'zod';

export const songSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  cover: z.any().optional(),
  audio: z.any().optional(),
  duration: z.number().optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional()
});

