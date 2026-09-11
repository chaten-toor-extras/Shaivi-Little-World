import { z } from 'zod';

export const quoteSchema = z.object({
  text: z.string().min(1),
  category: z.string().optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional()
});

