import { z } from 'zod';

const categoryValues = [
  'STAR',
  'FLOWER',
  'ART',
  'MEMORY',
  'MUSIC',
  'LETTER',
  'NATURE',
  'MAGIC',
];

const rarityValues = ['COMMON', 'SPECIAL', 'RARE'];

const sourceValues = ['WORLD', 'SECRET'];

const anchorValues = [
  'POND_EDGE',
  'HOUSE_GARDEN',
  'TREE_CLUSTER',
  'BENCH',
  'BRIDGE',
  'ART_WALL',
  'TELESCOPE_BASE',
  'MAILBOX_AREA',
  'CLOCK_AREA',
  'FLOWER_FIELD',
  'ISLAND_PATH',
];

const modelKeyValues = [
  'tiny_star',
  'pressed_flower',
  'paint_brush',
  'paper_crane',
  'polaroid',
  'moon_charm',
  'music_note',
  'golden_wing',
  'crystal',
  'tiny_letter',
];

const scalePresetValues = ['TINY', 'SMALL', 'NORMAL', 'FEATURED'];
const rotationPresetValues = ['DEFAULT', 'UPRIGHT', 'FLAT', 'TILTED'];
const idleAnimationValues = ['FLOAT', 'SLOW_SPIN', 'SOFT_PULSE', 'NONE'];
const revealEffectValues = [
  'NONE',
  'SPARKLE',
  'GLOW',
  'TINY_STARS',
  'PETALS',
  'SOFT_PULSE',
];
const timeOfDayValues = ['MORNING', 'DAY', 'SUNSET', 'NIGHT'];

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createCollectibleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80, 'Slug must be at most 80 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional().default(''),
  hint: z.string().max(200).optional().default(''),
  category: z.enum(categoryValues).default('STAR'),
  rarity: z.enum(rarityValues).default('COMMON'),
  source: z.enum(sourceValues).default('WORLD'),
  enabled: z.boolean().optional().default(true),
  isPublished: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
  model: z
    .object({
      modelKey: z.enum(modelKeyValues).default('tiny_star'),
      scalePreset: z.enum(scalePresetValues).optional().default('NORMAL'),
      rotationPreset: z.enum(rotationPresetValues).optional().default('DEFAULT'),
    })
    .optional()
    .default({}),
  appearance: z
    .object({
      glowColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional().default('#ffe8b2'),
      accentColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional().default('#d4a373'),
      idleAnimation: z.enum(idleAnimationValues).optional().default('FLOAT'),
      revealEffect: z.enum(revealEffectValues).optional().default('SPARKLE'),
    })
    .optional()
    .default({}),
  placement: z
    .object({
      anchor: z.enum(anchorValues).optional().default('POND_EDGE'),
      offset: z
        .object({
          x: z.number().min(-2).max(2).optional().default(0),
          y: z.number().min(-1).max(2).optional().default(0),
          z: z.number().min(-2).max(2).optional().default(0),
        })
        .optional()
        .default({}),
      visibleInPeriods: z.array(z.enum(timeOfDayValues)).optional().default([]),
      requiredMood: z.string().nullable().optional().default(null),
    })
    .optional()
    .default({}),
  behavior: z
    .object({
      hideAfterCollected: z.boolean().optional().default(true),
    })
    .optional()
    .default({}),
  adminNote: z.string().max(500).optional().default(''),
});

export const updateCollectibleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().optional(), // Immutable - ignored if unchanged
  description: z.string().max(500).optional(),
  hint: z.string().max(200).optional(),
  category: z.enum(categoryValues).optional(),
  rarity: z.enum(rarityValues).optional(),
  source: z.enum(sourceValues).optional(),
  enabled: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int().optional(),
  model: z
    .object({
      modelKey: z.enum(modelKeyValues).optional(),
      scalePreset: z.enum(scalePresetValues).optional(),
      rotationPreset: z.enum(rotationPresetValues).optional(),
    })
    .optional(),
  appearance: z
    .object({
      glowColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
      accentColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
      idleAnimation: z.enum(idleAnimationValues).optional(),
      revealEffect: z.enum(revealEffectValues).optional(),
    })
    .optional(),
  placement: z
    .object({
      anchor: z.enum(anchorValues).optional(),
      offset: z
        .object({
          x: z.number().min(-2).max(2).optional(),
          y: z.number().min(-1).max(2).optional(),
          z: z.number().min(-2).max(2).optional(),
        })
        .optional(),
      visibleInPeriods: z.array(z.enum(timeOfDayValues)).optional(),
      requiredMood: z.string().nullable().optional(),
    })
    .optional(),
  behavior: z
    .object({
      hideAfterCollected: z.boolean().optional(),
    })
    .optional(),
  adminNote: z.string().max(500).optional(),
});

