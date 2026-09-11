import { z } from 'zod';

export const contactSettingsSchema = z.object({
  heading: z.string().optional(),
  intro: z.string().optional(),
  handwrittenNote: z.string().optional(),
  fieldLabels: z.object({
    name: z.string(),
    email: z.string(),
    message: z.string()
  }).optional(),
  buttonText: z.string().optional(),
  successMessage: z.string().optional(),
  disclaimer: z.string().optional(),
  signoff: z.string().optional(),
  email: z.string().optional(),
  isPublished: z.boolean().optional()
});

