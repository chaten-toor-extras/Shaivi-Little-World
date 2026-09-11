import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid 6-character hex color');

const worldEffectSceneSchema = z
  .object({
    tint: hexColor.optional(),
    tintStrength: z.number().min(0).max(1).optional(),
    fogMultiplier: z.number().min(0.5).max(1.5).optional(),
  })
  .strict()
  .optional();

const worldEffectLightingSchema = z
  .object({
    intensityMultiplier: z.number().min(0.5).max(1.5).optional(),
    tint: hexColor.optional(),
    tintStrength: z.number().min(0).max(1).optional(),
  })
  .strict()
  .optional();

const worldEffectAtmosphereSchema = z
  .object({
    starBrightnessMultiplier: z.number().min(0).max(2).optional(),
    fireflyMultiplier: z.number().min(0).max(2).optional(),
    cloudSpeedMultiplier: z.number().min(0.25).max(2).optional(),
    cloudTint: hexColor.optional(),
    cloudTintStrength: z.number().min(0).max(1).optional(),
    moonBrightnessMultiplier: z.number().min(0.5).max(2).optional(),
    windowGlowMultiplier: z.number().min(0.5).max(2).optional(),
    lampGlowMultiplier: z.number().min(0.5).max(2).optional(),
  })
  .strict()
  .optional();

const worldEffectEnvironmentSchema = z
  .object({
    pondTint: hexColor.optional(),
    pondTintStrength: z.number().min(0).max(1).optional(),
    flowerBrightnessMultiplier: z.number().min(0.5).max(1.5).optional(),
  })
  .strict()
  .optional();

const worldEffectMotionSchema = z
  .object({
    globalSpeedMultiplier: z.number().min(0.5).max(1.5).optional(),
  })
  .strict()
  .optional();

export const worldEffectValidationSchema = z
  .object({
    enabled: z.boolean().optional(),
    intensity: z.number().min(0).max(1).optional(),
    scene: worldEffectSceneSchema,
    lighting: worldEffectLightingSchema,
    atmosphere: worldEffectAtmosphereSchema,
    environment: worldEffectEnvironmentSchema,
    motion: worldEffectMotionSchema,
  })
  .strict();

export const moodSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().optional(),
  paperColor: hexColor.optional(),
  inkColor: hexColor.optional(),
  songIds: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  worldEffect: worldEffectValidationSchema.optional(),
});

