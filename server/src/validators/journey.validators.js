import { z } from 'zod';

export const milestoneSchema = z.object({
  title: z.string().optional(),
  year: z.string().optional(),
  text: z.string().optional(),
  image: z.any().optional(),
  altText: z.string().optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  desktopPosition: z.object({ x: z.number(), y: z.number() }).optional(),
  telescope: z.object({
    enabled: z.boolean().optional(),
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional(),
    depth: z.number().min(0).max(1).optional(),
    size: z.enum(['small', 'normal', 'featured']).optional(),
    glowColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Invalid hex color').optional(),
    constellationOrder: z.number().int().optional()
  }).optional()
});

