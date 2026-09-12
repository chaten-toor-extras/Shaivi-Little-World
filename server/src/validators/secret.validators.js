import { z } from 'zod';

const targetTypes = [
  'BUTTERFLY',
  'FLYING_PAGE',
  'FLYING_PAPER',
  'LAMP',
  'POND',
  'TREE',
  'BOOKS',
  'HOUSE_WINDOW',
  'TELESCOPE',
  'MAILBOX',
  'CLOCK',
  'FLOWERS',
  'BENCH',
  'WORLD',
  'SECTION',
];

const triggerTypes = [
  'CLICK',
  'MULTI_CLICK',
  'HOVER',
  'TOGGLE',
  'RIPPLE',
  'SHAKE',
  'VISIT_SECTION',
  'LETTER_SENT',
  'JOURNEY_VIEWED',
  'MOOD_SELECTED',
  'TIME_ENTERED',
  'CUSTOM_EVENT',
];

const revealTypes = [
  'MESSAGE',
  'IMAGE',
  'QUOTE',
  'SOUND',
  'VISUAL_EFFECT',
  'COLLECTIBLE',
  'COLLECTIBLE_PLACEHOLDER',
  'CUSTOM',
];

const visualEffects = [
  'NONE',
  'SPARKLE',
  'GLOW',
  'TINY_STARS',
  'PETALS',
  'SOFT_PULSE',
];

const timeOfDayValues = ['MORNING', 'DAY', 'SUNSET', 'NIGHT'];

const sectionValues = [
  'ABOUT',
  'QUOTES',
  'GALLERY',
  'JOURNEY',
  'CONTACT',
  'MUSIC',
];

export const createSecretSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80, 'Slug must be at most 80 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  enabled: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int().optional(),
  target: z.object({
    type: z.enum(targetTypes),
    id: z.string().optional().default(''),
  }),
  trigger: z.object({
    type: z.enum(triggerTypes),
    requiredCount: z.number().int().min(1).default(1),
    windowMs: z.number().min(0).default(0),
    eventName: z.string().optional().default(''),
  }),
  conditions: z
    .object({
      timeOfDay: z.array(z.enum(timeOfDayValues)).optional().default([]),
      moods: z.array(z.string()).optional().default([]),
      sectionsVisited: z.array(z.enum(sectionValues)).optional().default([]),
      letterSent: z.boolean().optional().default(false),
      journeyViewed: z.boolean().optional().default(false),
      requiresSecretIds: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({}),
  reveal: z.object({
    type: z.enum(revealTypes).default('MESSAGE'),
    title: z.string().max(80).optional().default(''),
    message: z.string().max(500).optional().default(''),
    position: z.enum(['center', 'bottom-center', 'near-target']).optional().default('center'),
    duration: z.enum(['SHORT', 'NORMAL', 'LONG', 'UNTIL_CLOSED']).optional().default('NORMAL'),
    image: z.any().optional(),
    quoteId: z.string().nullable().optional(),
    collectibleId: z.string().nullable().optional(),
    quoteText: z.string().optional().default(''),
    quoteAuthor: z.string().optional().default(''),
    soundUrl: z.string().optional().default(''),
    soundVolume: z.number().min(0).max(1).optional().default(0.5),
    visualEffect: z.enum(visualEffects).optional().default('NONE'),
  }),
  behavior: z
    .object({
      repeatable: z.boolean().optional().default(false),
      cooldownMs: z.number().min(0).optional().default(0),
      oncePerSession: z.boolean().optional().default(false),
    })
    .optional()
    .default({}),
  adminNote: z.string().optional().default(''),
});

export const updateSecretSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  // Slug is immutable on update - if provided, should match existing or is rejected/ignored
  slug: z.string().optional(),
  enabled: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int().optional(),
  target: z
    .object({
      type: z.enum(targetTypes),
      id: z.string().optional(),
    })
    .optional(),
  trigger: z
    .object({
      type: z.enum(triggerTypes),
      requiredCount: z.number().int().min(1).optional(),
      windowMs: z.number().min(0).optional(),
      eventName: z.string().optional(),
    })
    .optional(),
  conditions: z
    .object({
      timeOfDay: z.array(z.enum(timeOfDayValues)).optional(),
      moods: z.array(z.string()).optional(),
      sectionsVisited: z.array(z.enum(sectionValues)).optional(),
      letterSent: z.boolean().optional(),
      journeyViewed: z.boolean().optional(),
      requiresSecretIds: z.array(z.string()).optional(),
    })
    .optional(),
  reveal: z
    .object({
      type: z.enum(revealTypes).optional(),
      title: z.string().max(80).optional(),
      message: z.string().max(500).optional(),
      position: z.enum(['center', 'bottom-center', 'near-target']).optional(),
      duration: z.enum(['SHORT', 'NORMAL', 'LONG', 'UNTIL_CLOSED']).optional(),
      image: z.any().optional(),
      quoteId: z.string().nullable().optional(),
      collectibleId: z.string().nullable().optional(),
      quoteText: z.string().optional(),
      quoteAuthor: z.string().optional(),
      soundUrl: z.string().optional(),
      soundVolume: z.number().min(0).max(1).optional(),
      visualEffect: z.enum(visualEffects).optional(),
    })
    .optional(),
  behavior: z
    .object({
      repeatable: z.boolean().optional(),
      cooldownMs: z.number().min(0).optional(),
      oncePerSession: z.boolean().optional(),
    })
    .optional(),
  adminNote: z.string().optional(),
});

