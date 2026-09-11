import mongoose from 'mongoose';
import { defaultWorldSettings } from '../seeds/defaultWorldSettings.js';

const identitySchema = new mongoose.Schema(
  {
    worldTitle: { type: String, default: defaultWorldSettings.identity.worldTitle },
    wordmark: { type: String, default: defaultWorldSettings.identity.wordmark },
    exploreLabel: { type: String, default: defaultWorldSettings.identity.exploreLabel },
    instructionText: { type: String, default: defaultWorldSettings.identity.instructionText },
    discoveryLabel: { type: String, default: defaultWorldSettings.identity.discoveryLabel },
    secretMessage: { type: String, default: defaultWorldSettings.identity.secretMessage },
  },
  { _id: false }
);

const introSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: defaultWorldSettings.intro.enabled },
    eyebrow: { type: String, default: defaultWorldSettings.intro.eyebrow },
    heading: { type: String, default: defaultWorldSettings.intro.heading },
    body: { type: String, default: defaultWorldSettings.intro.body },
    enterButtonLabel: { type: String, default: defaultWorldSettings.intro.enterButtonLabel },
    starEnabled: { type: Boolean, default: defaultWorldSettings.intro.starEnabled },
  },
  { _id: false }
);

const sceneSchema = new mongoose.Schema(
  {
    backgroundColor: { type: String, default: defaultWorldSettings.scene.backgroundColor },
    fog: {
      enabled: { type: Boolean, default: defaultWorldSettings.scene.fog.enabled },
      color: { type: String, default: defaultWorldSettings.scene.fog.color },
      near: { type: Number, default: defaultWorldSettings.scene.fog.near },
      far: { type: Number, default: defaultWorldSettings.scene.fog.far },
    },
  },
  { _id: false }
);

const lightingSchema = new mongoose.Schema(
  {
    hemisphere: {
      enabled: { type: Boolean, default: defaultWorldSettings.lighting.hemisphere.enabled },
      skyColor: { type: String, default: defaultWorldSettings.lighting.hemisphere.skyColor },
      groundColor: { type: String, default: defaultWorldSettings.lighting.hemisphere.groundColor },
      intensity: { type: Number, default: defaultWorldSettings.lighting.hemisphere.intensity },
    },
    directional: {
      enabled: { type: Boolean, default: defaultWorldSettings.lighting.directional.enabled },
      color: { type: String, default: defaultWorldSettings.lighting.directional.color },
      intensity: { type: Number, default: defaultWorldSettings.lighting.directional.intensity },
      position: {
        x: { type: Number, default: defaultWorldSettings.lighting.directional.position.x },
        y: { type: Number, default: defaultWorldSettings.lighting.directional.position.y },
        z: { type: Number, default: defaultWorldSettings.lighting.directional.position.z },
      },
      castShadow: { type: Boolean, default: defaultWorldSettings.lighting.directional.castShadow },
    },
    shadowLevel: {
      type: String,
      enum: ['OFF', 'BALANCED', 'HIGH'],
      default: defaultWorldSettings.lighting.shadowLevel,
    },
  },
  { _id: false }
);

const islandSchema = new mongoose.Schema(
  {
    terrainColor: { type: String, default: defaultWorldSettings.island.terrainColor },
    grassEdgeColor: { type: String, default: defaultWorldSettings.island.grassEdgeColor },
    grassTopColor: { type: String, default: defaultWorldSettings.island.grassTopColor },
    steppingStonesColor: { type: String, default: defaultWorldSettings.island.steppingStonesColor },
    steppingStonesVisible: { type: Boolean, default: defaultWorldSettings.island.steppingStonesVisible },
    benchVisible: { type: Boolean, default: defaultWorldSettings.island.benchVisible },
    benchWoodColor: { type: String, default: defaultWorldSettings.island.benchWoodColor },
    benchLegsColor: { type: String, default: defaultWorldSettings.island.benchLegsColor },
    flowers: {
      enabled: { type: Boolean, default: defaultWorldSettings.island.flowers.enabled },
      density: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: defaultWorldSettings.island.flowers.density,
      },
      primaryColor: { type: String, default: defaultWorldSettings.island.flowers.primaryColor },
      secondaryColor: { type: String, default: defaultWorldSettings.island.flowers.secondaryColor },
    },
    trees: {
      enabled: { type: Boolean, default: defaultWorldSettings.island.trees.enabled },
      swayEnabled: { type: Boolean, default: defaultWorldSettings.island.trees.swayEnabled },
      swayStrength: { type: Number, default: defaultWorldSettings.island.trees.swayStrength },
      trunkColor: { type: String, default: defaultWorldSettings.island.trees.trunkColor },
      leavesColor: { type: String, default: defaultWorldSettings.island.trees.leavesColor },
    },
    pond: {
      enabled: { type: Boolean, default: defaultWorldSettings.island.pond.enabled },
      waterColor: { type: String, default: defaultWorldSettings.island.pond.waterColor },
      stonesColor: { type: String, default: defaultWorldSettings.island.pond.stonesColor },
      rippleEnabled: { type: Boolean, default: defaultWorldSettings.island.pond.rippleEnabled },
      rippleColor: { type: String, default: defaultWorldSettings.island.pond.rippleColor },
    },
  },
  { _id: false }
);

const environmentSchema = new mongoose.Schema(
  {
    clouds: {
      enabled: { type: Boolean, default: defaultWorldSettings.environment.clouds.enabled },
      color: { type: String, default: defaultWorldSettings.environment.clouds.color },
      motionEnabled: { type: Boolean, default: defaultWorldSettings.environment.clouds.motionEnabled },
      speed: { type: Number, default: defaultWorldSettings.environment.clouds.speed },
    },
    details: {
      lampEnabled: { type: Boolean, default: defaultWorldSettings.environment.details.lampEnabled },
      lampDefaultLit: { type: Boolean, default: defaultWorldSettings.environment.details.lampDefaultLit },
      lampPostColor: { type: String, default: defaultWorldSettings.environment.details.lampPostColor },
      lampGlowColor: { type: String, default: defaultWorldSettings.environment.details.lampGlowColor },
      bridgeVisible: { type: Boolean, default: defaultWorldSettings.environment.details.bridgeVisible },
      bridgeColor: { type: String, default: defaultWorldSettings.environment.details.bridgeColor },
      mugSteamEnabled: { type: Boolean, default: defaultWorldSettings.environment.details.mugSteamEnabled },
      motesEnabled: { type: Boolean, default: defaultWorldSettings.environment.details.motesEnabled },
      motesAmount: {
        type: String,
        enum: ['OFF', 'SUBTLE', 'FULL'],
        default: defaultWorldSettings.environment.details.motesAmount,
      },
      motesColor: { type: String, default: defaultWorldSettings.environment.details.motesColor },
      booksVisible: { type: Boolean, default: defaultWorldSettings.environment.details.booksVisible },
    },
  },
  { _id: false }
);

const motionSchema = new mongoose.Schema(
  {
    islandFloatEnabled: { type: Boolean, default: defaultWorldSettings.motion.islandFloatEnabled },
    islandFloatStrength: { type: Number, default: defaultWorldSettings.motion.islandFloatStrength },
    islandFloatSpeed: { type: Number, default: defaultWorldSettings.motion.islandFloatSpeed },
    islandRotationDrift: { type: Number, default: defaultWorldSettings.motion.islandRotationDrift },
  },
  { _id: false }
);

const objectsSchema = new mongoose.Schema(
  {
    house: {
      visible: { type: Boolean, default: defaultWorldSettings.objects.house.visible },
      wallColor: { type: String, default: defaultWorldSettings.objects.house.wallColor },
      roofColor: { type: String, default: defaultWorldSettings.objects.house.roofColor },
      doorColor: { type: String, default: defaultWorldSettings.objects.house.doorColor },
      windowGlowEnabled: { type: Boolean, default: defaultWorldSettings.objects.house.windowGlowEnabled },
      windowGlowColor: { type: String, default: defaultWorldSettings.objects.house.windowGlowColor },
      windowGlowIntensity: { type: Number, default: defaultWorldSettings.objects.house.windowGlowIntensity },
      chimneySmokeEnabled: { type: Boolean, default: defaultWorldSettings.objects.house.chimneySmokeEnabled },
      plantsEnabled: { type: Boolean, default: defaultWorldSettings.objects.house.plantsEnabled },
    },
    desk: {
      visible: { type: Boolean, default: defaultWorldSettings.objects.desk.visible },
      woodColor: { type: String, default: defaultWorldSettings.objects.desk.woodColor },
      frameColor: { type: String, default: defaultWorldSettings.objects.desk.frameColor },
      screenInactiveColor: { type: String, default: defaultWorldSettings.objects.desk.screenInactiveColor },
      screenActiveColor: { type: String, default: defaultWorldSettings.objects.desk.screenActiveColor },
    },
    artWall: {
      visible: { type: Boolean, default: defaultWorldSettings.objects.artWall.visible },
      frameColor: { type: String, default: defaultWorldSettings.objects.artWall.frameColor },
      canvasColor: { type: String, default: defaultWorldSettings.objects.artWall.canvasColor },
      easelColor: { type: String, default: defaultWorldSettings.objects.artWall.easelColor },
    },
    telescope: {
      visible: { type: Boolean, default: defaultWorldSettings.objects.telescope.visible },
      bodyColor: { type: String, default: defaultWorldSettings.objects.telescope.bodyColor },
      standColor: { type: String, default: defaultWorldSettings.objects.telescope.standColor },
      accentColor: { type: String, default: defaultWorldSettings.objects.telescope.accentColor },
    },
    mailbox: {
      visible: { type: Boolean, default: defaultWorldSettings.objects.mailbox.visible },
      bodyColor: { type: String, default: defaultWorldSettings.objects.mailbox.bodyColor },
      postColor: { type: String, default: defaultWorldSettings.objects.mailbox.postColor },
      flagColor: { type: String, default: defaultWorldSettings.objects.mailbox.flagColor },
    },
    clock: {
      visible: { type: Boolean, default: defaultWorldSettings.objects.clock.visible },
      bodyColor: { type: String, default: defaultWorldSettings.objects.clock.bodyColor },
      faceColor: { type: String, default: defaultWorldSettings.objects.clock.faceColor },
      handColor: { type: String, default: defaultWorldSettings.objects.clock.handColor },
    },
  },
  { _id: false }
);

const interactionsSchema = new mongoose.Schema(
  {
    hoverScale: {
      type: String,
      enum: ['NONE', 'SUBTLE', 'NORMAL', 'PLAYFUL'],
      default: defaultWorldSettings.interactions.hoverScale,
    },
    treeShakeEnabled: { type: Boolean, default: defaultWorldSettings.interactions.treeShakeEnabled },
    treeShakeStrength: {
      type: String,
      enum: ['SUBTLE', 'NORMAL', 'PLAYFUL'],
      default: defaultWorldSettings.interactions.treeShakeStrength,
    },
    butterflySecret: {
      enabled: { type: Boolean, default: defaultWorldSettings.interactions.butterflySecret.enabled },
      requiredClicks: { type: Number, default: defaultWorldSettings.interactions.butterflySecret.requiredClicks },
      butterflyColor: { type: String, default: defaultWorldSettings.interactions.butterflySecret.butterflyColor },
    },
  },
  { _id: false }
);

const cameraSchema = new mongoose.Schema(
  {
    travelSpeed: {
      type: String,
      enum: ['INSTANT', 'FAST', 'NORMAL', 'CINEMATIC'],
      default: defaultWorldSettings.camera.travelSpeed,
    },
    easing: {
      type: String,
      enum: ['SMOOTH', 'SOFT', 'CINEMATIC'],
      default: defaultWorldSettings.camera.easing,
    },
    arcStrength: {
      type: String,
      enum: ['NONE', 'SUBTLE', 'NORMAL', 'CINEMATIC'],
      default: defaultWorldSettings.camera.arcStrength,
    },
    orbitEnabled: { type: Boolean, default: defaultWorldSettings.camera.orbitEnabled },
    orbitSpeed: { type: Number, default: defaultWorldSettings.camera.orbitSpeed },
    framing: {
      type: String,
      enum: ['CLOSE', 'BALANCED', 'WIDE'],
      default: defaultWorldSettings.camera.framing,
    },
  },
  { _id: false }
);

const ambienceSchema = new mongoose.Schema(
  {
    soundEnabled: { type: Boolean, default: defaultWorldSettings.ambience.soundEnabled },
    defaultVolume: { type: Number, default: defaultWorldSettings.ambience.defaultVolume },
  },
  { _id: false }
);

const sectionItemSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    label: { type: String, required: true },
    icon: { type: String, default: '✦' },
  },
  { _id: false }
);

const sectionsSchema = new mongoose.Schema(
  {
    ABOUT: { type: sectionItemSchema, default: () => defaultWorldSettings.sections.ABOUT },
    QUOTES: { type: sectionItemSchema, default: () => defaultWorldSettings.sections.QUOTES },
    GALLERY: { type: sectionItemSchema, default: () => defaultWorldSettings.sections.GALLERY },
    JOURNEY: { type: sectionItemSchema, default: () => defaultWorldSettings.sections.JOURNEY },
    CONTACT: { type: sectionItemSchema, default: () => defaultWorldSettings.sections.CONTACT },
    MUSIC: { type: sectionItemSchema, default: () => defaultWorldSettings.sections.MUSIC },
  },
  { _id: false }
);

const timeProfileSchema = new mongoose.Schema(
  {
    backgroundColor: { type: String, required: true },
    fog: {
      enabled: { type: Boolean, default: true },
      color: { type: String, required: true },
      near: { type: Number, default: 26 },
      far: { type: Number, default: 62 },
    },
    hemisphere: {
      enabled: { type: Boolean, default: true },
      skyColor: { type: String, required: true },
      groundColor: { type: String, required: true },
      intensity: { type: Number, default: 2.0 },
    },
    directional: {
      enabled: { type: Boolean, default: true },
      color: { type: String, required: true },
      intensity: { type: Number, default: 2.5 },
      position: {
        x: { type: Number, default: -5 },
        y: { type: Number, default: 10 },
        z: { type: Number, default: 6 },
      },
    },
    windowGlowMultiplier: { type: Number, default: 1.0 },
    lampDefaultLit: { type: Boolean, default: false },
    stars: {
      enabled: { type: Boolean, default: false },
      density: {
        type: String,
        enum: ['OFF', 'SPARSE', 'NORMAL', 'FULL'],
        default: 'OFF',
      },
      brightness: { type: Number, default: 0.5 },
      twinkle: { type: Boolean, default: true },
    },
    moon: {
      enabled: { type: Boolean, default: false },
      color: { type: String, default: '#ffffff' },
      brightness: { type: Number, default: 0.8 },
      size: {
        type: String,
        enum: ['SMALL', 'NORMAL', 'LARGE'],
        default: 'NORMAL',
      },
    },
    firefliesMultiplier: { type: Number, default: 0.5 },
    cloudTint: { type: String, default: '#f1e7ed' },
    pondTint: { type: String, default: '#89b9b9' },
    ambienceMultiplier: { type: Number, default: 1.0 },
  },
  { _id: false }
);

const dayNightSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: defaultWorldSettings.dayNight.enabled },
    mode: {
      type: String,
      enum: ['automatic', 'fixed'],
      default: defaultWorldSettings.dayNight.mode,
    },
    timeSource: {
      type: String,
      enum: ['visitor-local', 'fixed-timezone'],
      default: defaultWorldSettings.dayNight.timeSource,
    },
    fixedTimezone: {
      type: String,
      default: defaultWorldSettings.dayNight.fixedTimezone,
    },
    fixedPeriod: {
      type: String,
      enum: ['MORNING', 'DAY', 'SUNSET', 'NIGHT'],
      default: defaultWorldSettings.dayNight.fixedPeriod,
    },
    defaultPeriod: {
      type: String,
      enum: ['MORNING', 'DAY', 'SUNSET', 'NIGHT'],
      default: defaultWorldSettings.dayNight.defaultPeriod,
    },
    allowVisitorOverride: {
      type: Boolean,
      default: defaultWorldSettings.dayNight.allowVisitorOverride,
    },
    transition: {
      enabled: {
        type: Boolean,
        default: defaultWorldSettings.dayNight.transition.enabled,
      },
      durationSeconds: {
        type: Number,
        default: defaultWorldSettings.dayNight.transition.durationSeconds,
      },
    },
    schedule: {
      morningStart: {
        type: String,
        default: defaultWorldSettings.dayNight.schedule.morningStart,
      },
      dayStart: {
        type: String,
        default: defaultWorldSettings.dayNight.schedule.dayStart,
      },
      sunsetStart: {
        type: String,
        default: defaultWorldSettings.dayNight.schedule.sunsetStart,
      },
      nightStart: {
        type: String,
        default: defaultWorldSettings.dayNight.schedule.nightStart,
      },
    },
    profiles: {
      morning: {
        type: timeProfileSchema,
        default: () => defaultWorldSettings.dayNight.profiles.morning,
      },
      day: {
        type: timeProfileSchema,
        default: () => defaultWorldSettings.dayNight.profiles.day,
      },
      sunset: {
        type: timeProfileSchema,
        default: () => defaultWorldSettings.dayNight.profiles.sunset,
      },
      night: {
        type: timeProfileSchema,
        default: () => defaultWorldSettings.dayNight.profiles.night,
      },
    },
  },
  { _id: false }
);

const musicMoodSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    transitionDuration: { type: Number, default: 2.5, min: 0.5, max: 10 },
  },
  { _id: false }
);

const worldSettingsSchema = new mongoose.Schema(
  {
    schemaVersion: { type: Number, default: 2 },
    identity: { type: identitySchema, default: () => defaultWorldSettings.identity },
    intro: { type: introSchema, default: () => defaultWorldSettings.intro },
    scene: { type: sceneSchema, default: () => defaultWorldSettings.scene },
    lighting: { type: lightingSchema, default: () => defaultWorldSettings.lighting },
    island: { type: islandSchema, default: () => defaultWorldSettings.island },
    environment: { type: environmentSchema, default: () => defaultWorldSettings.environment },
    motion: { type: motionSchema, default: () => defaultWorldSettings.motion },
    objects: { type: objectsSchema, default: () => defaultWorldSettings.objects },
    interactions: { type: interactionsSchema, default: () => defaultWorldSettings.interactions },
    camera: { type: cameraSchema, default: () => defaultWorldSettings.camera },
    ambience: { type: ambienceSchema, default: () => defaultWorldSettings.ambience },
    sections: { type: sectionsSchema, default: () => defaultWorldSettings.sections },
    dayNight: { type: dayNightSchema, default: () => defaultWorldSettings.dayNight },
    musicMood: {
      type: musicMoodSchema,
      default: () => defaultWorldSettings.musicMood || { enabled: true, transitionDuration: 2.5 },
    },
  },
  { timestamps: true }
);

export const WorldSettings = mongoose.model('WorldSettings', worldSettingsSchema);

