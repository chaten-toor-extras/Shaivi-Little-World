import { z } from 'zod';

export const artistSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  caption: z.string().optional(),
  bio: z.string().optional(),
  portrait: z.any().optional(),
  smallImage: z.any().optional(),
  annotationText: z.string().optional(),
  tags: z.array(z.string()).optional(),
  details: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  note: z.string().optional(),
  sectionHeading: z.string().optional(),
  sectionKicker: z.string().optional(),
  isPublished: z.boolean().optional()
});

