import { z } from 'zod';

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const hexColor = z
  .string()
  .regex(hexColorRegex, { message: 'Must be a valid hex color (e.g. #ffffff or #fff)' });

// Identity
const identitySchema = z.object({
  worldTitle: z.string().min(1).max(100).optional(),
  wordmark: z.string().min(1).max(20).optional(),
  exploreLabel: z.string().min(1).max(40).optional(),
  instructionText: z.string().min(1).max(150).optional(),
  discoveryLabel: z.string().min(1).max(60).optional(),
  secretMessage: z.string().min(1).max(150).optional(),
}).strict().optional();

// Intro
const introSchema = z.object({
  enabled: z.boolean().optional(),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(100).optional(),
  body: z.string().max(300).optional(),
  enterButtonLabel: z.string().max(50).optional(),
  starEnabled: z.boolean().optional(),
}).strict().optional();

// Scene
const sceneSchema = z.object({
  backgroundColor: hexColor.optional(),
  fog: z.object({
    enabled: z.boolean().optional(),
    color: hexColor.optional(),
    near: z.number().min(1).max(100).optional(),
    far: z.number().min(5).max(200).optional(),
  }).refine((val) => {
    if (val.near !== undefined && val.far !== undefined) {
      return val.far > val.near;
    }
    return true;
  }, { message: 'Fog far distance must be strictly greater than near distance' }).optional(),
}).strict().optional();

// Lighting
const lightingSchema = z.object({
  hemisphere: z.object({
    enabled: z.boolean().optional(),
    skyColor: hexColor.optional(),
    groundColor: hexColor.optional(),
    intensity: z.number().min(0).max(6).optional(),
  }).strict().optional(),
  directional: z.object({
    enabled: z.boolean().optional(),
    color: hexColor.optional(),
    intensity: z.number().min(0).max(8).optional(),
    position: z.object({
      x: z.number().min(-50).max(50),
      y: z.number().min(-10).max(50),
      z: z.number().min(-50).max(50),
    }).strict().optional(),
    castShadow: z.boolean().optional(),
  }).strict().optional(),
  shadowLevel: z.enum(['OFF', 'BALANCED', 'HIGH']).optional(),
}).strict().optional();

// Island
const islandSchema = z.object({
  terrainColor: hexColor.optional(),
  grassEdgeColor: hexColor.optional(),
  grassTopColor: hexColor.optional(),
  steppingStonesColor: hexColor.optional(),
  steppingStonesVisible: z.boolean().optional(),
  benchVisible: z.boolean().optional(),
  benchWoodColor: hexColor.optional(),
  benchLegsColor: hexColor.optional(),
  flowers: z.object({
    enabled: z.boolean().optional(),
    density: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    primaryColor: hexColor.optional(),
    secondaryColor: hexColor.optional(),
  }).strict().optional(),
  trees: z.object({
    enabled: z.boolean().optional(),
    swayEnabled: z.boolean().optional(),
    swayStrength: z.number().min(0).max(0.05).optional(),
    trunkColor: hexColor.optional(),
    leavesColor: hexColor.optional(),
  }).strict().optional(),
  pond: z.object({
    enabled: z.boolean().optional(),
    waterColor: hexColor.optional(),
    stonesColor: hexColor.optional(),
    rippleEnabled: z.boolean().optional(),
    rippleColor: hexColor.optional(),
  }).strict().optional(),
}).strict().optional();

// Environment
const environmentSchema = z.object({
  clouds: z.object({
    enabled: z.boolean().optional(),
    color: hexColor.optional(),
    motionEnabled: z.boolean().optional(),
    speed: z.number().min(0).max(3.0).optional(),
  }).strict().optional(),
  details: z.object({
    lampEnabled: z.boolean().optional(),
    lampDefaultLit: z.boolean().optional(),
    lampPostColor: hexColor.optional(),
    lampGlowColor: hexColor.optional(),
    bridgeVisible: z.boolean().optional(),
    bridgeColor: hexColor.optional(),
    mugSteamEnabled: z.boolean().optional(),
    motesEnabled: z.boolean().optional(),
    motesAmount: z.enum(['OFF', 'SUBTLE', 'FULL']).optional(),
    motesColor: hexColor.optional(),
    booksVisible: z.boolean().optional(),
  }).strict().optional(),
}).strict().optional();

// Motion
const motionSchema = z.object({
  islandFloatEnabled: z.boolean().optional(),
  islandFloatStrength: z.number().min(0).max(0.25).optional(),
  islandFloatSpeed: z.number().min(0).max(2.0).optional(),
  islandRotationDrift: z.number().min(0).max(0.05).optional(),
}).strict().optional();

// Objects
const objectsSchema = z.object({
  house: z.object({
    visible: z.boolean().optional(),
    wallColor: hexColor.optional(),
    roofColor: hexColor.optional(),
    doorColor: hexColor.optional(),
    windowGlowEnabled: z.boolean().optional(),
    windowGlowColor: hexColor.optional(),
    windowGlowIntensity: z.number().min(0).max(2.0).optional(),
    chimneySmokeEnabled: z.boolean().optional(),
    plantsEnabled: z.boolean().optional(),
  }).strict().optional(),
  desk: z.object({
    visible: z.boolean().optional(),
    woodColor: hexColor.optional(),
    frameColor: hexColor.optional(),
    screenInactiveColor: hexColor.optional(),
    screenActiveColor: hexColor.optional(),
  }).strict().optional(),
  artWall: z.object({
    visible: z.boolean().optional(),
    frameColor: hexColor.optional(),
    canvasColor: hexColor.optional(),
    easelColor: hexColor.optional(),
  }).strict().optional(),
  telescope: z.object({
    visible: z.boolean().optional(),
    bodyColor: hexColor.optional(),
    standColor: hexColor.optional(),
    accentColor: hexColor.optional(),
  }).strict().optional(),
  mailbox: z.object({
    visible: z.boolean().optional(),
    bodyColor: hexColor.optional(),
    postColor: hexColor.optional(),
    flagColor: hexColor.optional(),
  }).strict().optional(),
  clock: z.object({
    visible: z.boolean().optional(),
    bodyColor: hexColor.optional(),
    faceColor: hexColor.optional(),
    handColor: hexColor.optional(),
  }).strict().optional(),
}).strict().optional();

// Interactions
const interactionsSchema = z.object({
  hoverScale: z.enum(['NONE', 'SUBTLE', 'NORMAL', 'PLAYFUL']).optional(),
  treeShakeEnabled: z.boolean().optional(),
  treeShakeStrength: z.enum(['SUBTLE', 'NORMAL', 'PLAYFUL']).optional(),
  butterflySecret: z.object({
    enabled: z.boolean().optional(),
    requiredClicks: z.number().int().min(1).max(10).optional(),
    butterflyColor: hexColor.optional(),
  }).strict().optional(),
}).strict().optional();

// Camera
const cameraSchema = z.object({
  travelSpeed: z.enum(['INSTANT', 'FAST', 'NORMAL', 'CINEMATIC']).optional(),
  easing: z.enum(['SMOOTH', 'SOFT', 'CINEMATIC']).optional(),
  arcStrength: z.enum(['NONE', 'SUBTLE', 'NORMAL', 'CINEMATIC']).optional(),
  orbitEnabled: z.boolean().optional(),
  orbitSpeed: z.number().min(0.1).max(1.0).optional(),
  framing: z.enum(['CLOSE', 'BALANCED', 'WIDE']).optional(),
}).strict().optional();

// Ambience
const ambienceSchema = z.object({
  soundEnabled: z.boolean().optional(),
  defaultVolume: z.number().min(0).max(100).optional(),
}).strict().optional();

// Section item
const sectionItemSchema = z.object({
  enabled: z.boolean().optional(),
  label: z.string().min(1).max(50).optional(),
  icon: z.string().max(10).optional(),
}).strict();

// Sections
const sectionsSchema = z.object({
  ABOUT: sectionItemSchema.optional(),
  QUOTES: sectionItemSchema.optional(),
  GALLERY: sectionItemSchema.optional(),
  JOURNEY: sectionItemSchema.optional(),
  CONTACT: sectionItemSchema.optional(),
  MUSIC: sectionItemSchema.optional(),
}).strict().optional();

// Time of Day and Day/Night system
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

const timeZoneSchema = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, { message: 'Must be a valid IANA timezone (e.g. Asia/Kolkata, Europe/London)' });

const timeProfileSchema = z.object({
  backgroundColor: hexColor.optional(),
  fog: z.object({
    enabled: z.boolean().optional(),
    color: hexColor.optional(),
    near: z.number().min(1).max(100).optional(),
    far: z.number().min(5).max(200).optional(),
  }).refine((val) => {
    if (val.near !== undefined && val.far !== undefined) {
      return val.far > val.near;
    }
    return true;
  }, { message: 'Fog far distance must be strictly greater than near distance' }).optional(),
  hemisphere: z.object({
    enabled: z.boolean().optional(),
    skyColor: hexColor.optional(),
    groundColor: hexColor.optional(),
    intensity: z.number().min(0).max(6).optional(),
  }).strict().optional(),
  directional: z.object({
    enabled: z.boolean().optional(),
    color: hexColor.optional(),
    intensity: z.number().min(0).max(8).optional(),
    position: z.object({
      x: z.number().min(-50).max(50),
      y: z.number().min(-10).max(50),
      z: z.number().min(-50).max(50),
    }).strict().optional(),
  }).strict().optional(),
  windowGlowMultiplier: z.number().min(0).max(5).optional(),
  lampDefaultLit: z.boolean().optional(),
  stars: z.object({
    enabled: z.boolean().optional(),
    density: z.enum(['OFF', 'SPARSE', 'NORMAL', 'FULL']).optional(),
    brightness: z.number().min(0).max(2).optional(),
    twinkle: z.boolean().optional(),
  }).strict().optional(),
  moon: z.object({
    enabled: z.boolean().optional(),
    color: hexColor.optional(),
    brightness: z.number().min(0).max(3).optional(),
    size: z.enum(['SMALL', 'NORMAL', 'LARGE']).optional(),
  }).strict().optional(),
  firefliesMultiplier: z.number().min(0).max(5).optional(),
  cloudTint: hexColor.optional(),
  pondTint: hexColor.optional(),
  ambienceMultiplier: z.number().min(0).max(2).optional(),
}).strict();

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const timeString = z.string().regex(timeRegex, { message: 'Time must be in HH:mm format (00:00 to 23:59)' });

const scheduleSchema = z.object({
  morningStart: timeString.optional(),
  dayStart: timeString.optional(),
  sunsetStart: timeString.optional(),
  nightStart: timeString.optional(),
}).strict().refine((sched) => {
  if (sched.morningStart && sched.dayStart && sched.sunsetStart && sched.nightStart) {
    const m = parseTimeToMinutes(sched.morningStart);
    const d = parseTimeToMinutes(sched.dayStart);
    const s = parseTimeToMinutes(sched.sunsetStart);
    const n = parseTimeToMinutes(sched.nightStart);
    return m < d && d < s && s < n;
  }
  return true;
}, { message: 'Schedule start times must follow strict order: morning < day < sunset < night' });

const dayNightSchema = z.object({
  enabled: z.boolean().optional(),
  mode: z.enum(['automatic', 'fixed']).optional(),
  timeSource: z.enum(['visitor-local', 'fixed-timezone']).optional(),
  fixedTimezone: timeZoneSchema.optional(),
  fixedPeriod: z.enum(['MORNING', 'DAY', 'SUNSET', 'NIGHT']).optional(),
  defaultPeriod: z.enum(['MORNING', 'DAY', 'SUNSET', 'NIGHT']).optional(),
  allowVisitorOverride: z.boolean().optional(),
  transition: z.object({
    enabled: z.boolean().optional(),
    durationSeconds: z.number().min(0).max(20).optional(),
  }).strict().optional(),
  schedule: scheduleSchema.optional(),
  profiles: z.object({
    morning: timeProfileSchema.optional(),
    day: timeProfileSchema.optional(),
    sunset: timeProfileSchema.optional(),
    night: timeProfileSchema.optional(),
  }).strict().optional(),
}).strict().optional();

const musicMoodSchema = z.object({
  enabled: z.boolean().optional(),
  transitionDuration: z.number().min(0.5).max(10).optional(),
}).strict().optional();

export const worldSettingsPatchSchema = z.object({
  schemaVersion: z.number().optional(),
  _id: z.unknown().optional(),
  __v: z.unknown().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
  identity: identitySchema,
  intro: introSchema,
  scene: sceneSchema,
  lighting: lightingSchema,
  island: islandSchema,
  environment: environmentSchema,
  motion: motionSchema,
  objects: objectsSchema,
  interactions: interactionsSchema,
  camera: cameraSchema,
  ambience: ambienceSchema,
  sections: sectionsSchema,
  dayNight: dayNightSchema,
  musicMood: musicMoodSchema,
}).strict().refine((data) => {
  // Disallow prototype pollution keys
  const keys = Object.keys(data);
  for (const k of keys) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
      return false;
    }
  }
  return true;
}, { message: 'Forbidden property in payload' });

