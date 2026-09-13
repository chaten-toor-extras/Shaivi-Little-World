export type ShadowLevel = "OFF" | "BALANCED" | "HIGH";
export type FlowerDensity = "LOW" | "MEDIUM" | "HIGH";
export type MotesAmount = "OFF" | "SUBTLE" | "FULL";
export type ScalePreset = "NONE" | "SUBTLE" | "NORMAL" | "PLAYFUL";
export type CameraSpeed = "INSTANT" | "FAST" | "NORMAL" | "CINEMATIC";
export type CameraEasing = "SMOOTH" | "SOFT" | "CINEMATIC";
export type CameraArc = "NONE" | "SUBTLE" | "NORMAL" | "CINEMATIC";
export type CameraFraming = "CLOSE" | "BALANCED" | "WIDE";

export interface WorldIdentitySettings {
  worldTitle: string;
  wordmark: string;
  exploreLabel: string;
  instructionText: string;
  discoveryLabel: string;
  secretMessage: string;
}

export interface WorldIntroSettings {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  body: string;
  enterButtonLabel: string;
  starEnabled: boolean;
}

export interface WorldSceneSettings {
  backgroundColor: string;
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
}

export interface WorldLightingSettings {
  hemisphere: {
    enabled: boolean;
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
  directional: {
    enabled: boolean;
    color: string;
    intensity: number;
    position: {
      x: number;
      y: number;
      z: number;
    };
    castShadow: boolean;
  };
  shadowLevel: ShadowLevel;
}

export interface WorldIslandSettings {
  terrainColor: string;
  grassEdgeColor: string;
  grassTopColor: string;
  steppingStonesColor: string;
  steppingStonesVisible: boolean;
  benchVisible: boolean;
  benchWoodColor: string;
  benchLegsColor: string;
  flowers: {
    enabled: boolean;
    density: FlowerDensity;
    primaryColor: string;
    secondaryColor: string;
  };
  trees: {
    enabled: boolean;
    swayEnabled: boolean;
    swayStrength: number;
    trunkColor: string;
    leavesColor: string;
  };
  pond: {
    enabled: boolean;
    waterColor: string;
    stonesColor: string;
    rippleEnabled: boolean;
    rippleColor: string;
  };
}

export interface WorldEnvironmentSettings {
  clouds: {
    enabled: boolean;
    color: string;
    motionEnabled: boolean;
    speed: number;
  };
  details: {
    lampEnabled: boolean;
    lampDefaultLit: boolean;
    lampPostColor: string;
    lampGlowColor: string;
    bridgeVisible: boolean;
    bridgeColor: string;
    mugSteamEnabled: boolean;
    motesEnabled: boolean;
    motesAmount: MotesAmount;
    motesColor: string;
    booksVisible: boolean;
  };
}

export interface WorldMotionSettings {
  islandFloatEnabled: boolean;
  islandFloatStrength: number;
  islandFloatSpeed: number;
  islandRotationDrift: number;
}

export interface WorldObjectsSettings {
  house: {
    visible: boolean;
    wallColor: string;
    roofColor: string;
    doorColor: string;
    windowGlowEnabled: boolean;
    windowGlowColor: string;
    windowGlowIntensity: number;
    chimneySmokeEnabled: boolean;
    plantsEnabled: boolean;
  };
  desk: {
    visible: boolean;
    woodColor: string;
    frameColor: string;
    screenInactiveColor: string;
    screenActiveColor: string;
  };
  artWall: {
    visible: boolean;
    frameColor: string;
    canvasColor: string;
    easelColor: string;
  };
  telescope: {
    visible: boolean;
    bodyColor: string;
    standColor: string;
    accentColor: string;
  };
  mailbox: {
    visible: boolean;
    bodyColor: string;
    postColor: string;
    flagColor: string;
  };
  clock: {
    visible: boolean;
    bodyColor: string;
    faceColor: string;
    handColor: string;
  };
}

export interface WorldInteractionsSettings {
  hoverScale: ScalePreset;
  treeShakeEnabled: boolean;
  treeShakeStrength: ScalePreset;
  butterflySecret: {
    enabled: boolean;
    requiredClicks: number;
    butterflyColor: string;
  };
}

export interface WorldCameraSettings {
  travelSpeed: CameraSpeed;
  easing: CameraEasing;
  arcStrength: CameraArc;
  orbitEnabled: boolean;
  orbitSpeed: number;
  framing: CameraFraming;
}

export interface WorldAmbienceSettings {
  soundEnabled: boolean;
  defaultVolume: number;
}

export interface WorldSectionConfig {
  enabled: boolean;
  label: string;
  icon: string;
}

export interface WorldSectionsSettings {
  ABOUT: WorldSectionConfig;
  QUOTES: WorldSectionConfig;
  GALLERY: WorldSectionConfig;
  JOURNEY: WorldSectionConfig;
  CONTACT: WorldSectionConfig;
  MUSIC: WorldSectionConfig;
}

export type TimeOfDay = "MORNING" | "DAY" | "SUNSET" | "NIGHT";
export type TimeOfDayOverride = "AUTO" | "MORNING" | "DAY" | "SUNSET" | "NIGHT";
export type DayNightMode = "automatic" | "fixed";
export type DayNightTimeSource = "visitor-local" | "fixed-timezone";
export type StarDensityPreset = "OFF" | "SPARSE" | "NORMAL" | "FULL";
export type MoonSizePreset = "SMALL" | "NORMAL" | "LARGE";

export interface DayNightSchedule {
  morningStart: string; // "HH:mm" e.g. "05:30"
  dayStart: string; // "08:00"
  sunsetStart: string; // "17:00"
  nightStart: string; // "19:00"
}

export interface DayNightTransition {
  enabled: boolean;
  durationSeconds: number; // 0 to 20
}

export interface TimeProfile {
  backgroundColor: string;
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  hemisphere: {
    enabled: boolean;
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
  directional: {
    enabled: boolean;
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
  };
  windowGlowMultiplier: number;
  lampDefaultLit: boolean;
  stars: {
    enabled: boolean;
    density: StarDensityPreset;
    brightness: number;
    twinkle: boolean;
  };
  moon: {
    enabled: boolean;
    color: string;
    brightness: number;
    size: MoonSizePreset;
  };
  firefliesMultiplier: number;
  cloudTint: string;
  pondTint: string;
  ambienceMultiplier: number;
}

export interface DayNightSettings {
  enabled: boolean;
  mode: DayNightMode;
  timeSource: DayNightTimeSource;
  fixedTimezone: string;
  fixedPeriod: TimeOfDay;
  defaultPeriod: TimeOfDay;
  allowVisitorOverride: boolean;
  transition: DayNightTransition;
  schedule: DayNightSchedule;
  profiles: {
    morning: TimeProfile;
    day: TimeProfile;
    sunset: TimeProfile;
    night: TimeProfile;
  };
}

export interface MoodWorldEffect {
  enabled: boolean;
  intensity: number;
  scene?: {
    tint?: string;
    tintStrength?: number;
    fogMultiplier?: number;
  };
  lighting?: {
    intensityMultiplier?: number;
    tint?: string;
    tintStrength?: number;
  };
  atmosphere?: {
    starBrightnessMultiplier?: number;
    fireflyMultiplier?: number;
    cloudSpeedMultiplier?: number;
    cloudTint?: string;
    cloudTintStrength?: number;
    moonBrightnessMultiplier?: number;
    windowGlowMultiplier?: number;
    lampGlowMultiplier?: number;
  };
  environment?: {
    pondTint?: string;
    pondTintStrength?: number;
    flowerBrightnessMultiplier?: number;
  };
  motion?: {
    globalSpeedMultiplier?: number;
  };
}

export interface WorldMusicMoodSettings {
  enabled: boolean;
  transitionDuration: number;
}

export interface ResolvedWorldTheme {
  period: TimeOfDay;
  backgroundColor: string;
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  hemisphere: {
    enabled: boolean;
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
  directional: {
    enabled: boolean;
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
  };
  windowGlowMultiplier: number;
  lampDefaultLit: boolean;
  lampGlowMultiplier: number;
  stars: {
    enabled: boolean;
    count: number;
    brightness: number;
    twinkle: boolean;
  };
  moon: {
    enabled: boolean;
    color: string;
    brightness: number;
    scale: number;
  };
  firefliesMultiplier: number;
  cloudTint: string;
  cloudSpeedMultiplier: number;
  pondTint: string;
  flowerBrightnessMultiplier: number;
  motionSpeedMultiplier: number;
  ambienceMultiplier: number;
  transitionDuration: number;
}

export interface WorldCompletionSettings {
  enabled: boolean;
  autoPlayEnabled?: boolean;
  autoPlayOnce?: boolean;
  eyebrow?: string;
  title?: string;
  message?: string;
  buttonLabel?: string;
  replayLabel?: string;
  optionalChime?: boolean;
}

export interface WorldSettings {
  schemaVersion: number;
  identity: WorldIdentitySettings;
  intro: WorldIntroSettings;
  scene: WorldSceneSettings;
  lighting: WorldLightingSettings;
  island: WorldIslandSettings;
  environment: WorldEnvironmentSettings;
  motion: WorldMotionSettings;
  objects: WorldObjectsSettings;
  interactions: WorldInteractionsSettings;
  camera: WorldCameraSettings;
  ambience: WorldAmbienceSettings;
  sections: WorldSectionsSettings;
  dayNight: DayNightSettings;
  musicMood?: WorldMusicMoodSettings;
  completion?: WorldCompletionSettings;
}
