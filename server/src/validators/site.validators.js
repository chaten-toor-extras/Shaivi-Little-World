import { z } from 'zod';

export const siteSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  wordmark: z.string().optional(),
  introHeading: z.string().optional(),
  introSubtext: z.string().optional(),
  introDescription: z.string().optional(),
  exploreLabel: z.string().optional(),
  sectionLabels: z.record(z.string()).optional(),
  footerWorldText: z.string().optional(),
  footerExploreText: z.string().optional(),
  footerWorldInstruction: z.string().optional(),
  footerExploreInstruction: z.string().optional(),
  discoveryLabel: z.string().optional(),
  secretMessages: z.array(z.string()).optional(),
  socialLinks: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  accentColor: z.string().optional(),
  isPublished: z.boolean().optional()
});

