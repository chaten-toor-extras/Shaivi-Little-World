import type { TimeProfile, WorldSettings } from "@/types/world";

export const DEFAULT_WORLD_SETTINGS: WorldSettings = {
  schemaVersion: 2,
  identity: {
    worldTitle: "Shaivi's Little World",
    wordmark: "s✳",
    exploreLabel: "Explore",
    instructionText: "Tap an object to explore · drag to look around",
    discoveryLabel: "little discoveries",
    secretMessage: "A tiny secret, found.",
  },
  intro: {
    enabled: true,
    eyebrow: "YOU’RE ALWAYS WELCOME HERE",
    heading: "Shaivi’s little world.",
    body: "A place for ideas, daydreams, and everything in between.",
    enterButtonLabel: "Skip intro →",
    starEnabled: true,
  },
  scene: {
    backgroundColor: "#d5cbdc",
    fog: {
      enabled: true,
      color: "#d5cbdc",
      near: 28,
      far: 65,
    },
  },
  lighting: {
    hemisphere: {
      enabled: true,
      skyColor: "#fff3d7",
      groundColor: "#9b91b1",
      intensity: 2.0,
    },
    directional: {
      enabled: true,
      color: "#ffffff",
      intensity: 3.0,
      position: { x: -5, y: 10, z: 6 },
      castShadow: true,
    },
    shadowLevel: "BALANCED",
  },
  island: {
    terrainColor: "#9b7f78",
    grassEdgeColor: "#bbc79c",
    grassTopColor: "#c6cfab",
    steppingStonesColor: "#eaddc5",
    steppingStonesVisible: true,
    benchVisible: true,
    benchWoodColor: "#b39273",
    benchLegsColor: "#876850",
    flowers: {
      enabled: true,
      density: "MEDIUM",
      primaryColor: "#f4dbac",
      secondaryColor: "#df9ca5",
    },
    trees: {
      enabled: true,
      swayEnabled: true,
      swayStrength: 0.012,
      trunkColor: "#867055",
      leavesColor: "#9ca97a",
    },
    pond: {
      enabled: true,
      waterColor: "#89b9b9",
      stonesColor: "#d6cbbb",
      rippleEnabled: true,
      rippleColor: "#edf4e7",
    },
  },
  environment: {
    clouds: {
      enabled: true,
      color: "#f1e7ed",
      motionEnabled: true,
      speed: 1.0,
    },
    details: {
      lampEnabled: true,
      lampDefaultLit: true,
      lampPostColor: "#657058",
      lampGlowColor: "#f7dfa0",
      bridgeVisible: true,
      bridgeColor: "#b69a76",
      mugSteamEnabled: true,
      motesEnabled: true,
      motesAmount: "FULL",
      motesColor: "#ffeab5",
      booksVisible: true,
    },
  },
  motion: {
    islandFloatEnabled: true,
    islandFloatStrength: 0.07,
    islandFloatSpeed: 0.5,
    islandRotationDrift: 0.01,
  },
  objects: {
    house: {
      visible: true,
      wallColor: "#e9cfaa",
      roofColor: "#b46d57",
      doorColor: "#75877a",
      windowGlowEnabled: true,
      windowGlowColor: "#f7ddb0",
      windowGlowIntensity: 0.35,
      chimneySmokeEnabled: true,
      plantsEnabled: true,
    },
    desk: {
      visible: true,
      woodColor: "#b89372",
      frameColor: "#4a5555",
      screenInactiveColor: "#a7b8b3",
      screenActiveColor: "#efe9df",
    },
    artWall: {
      visible: true,
      frameColor: "#a88364",
      canvasColor: "#f2d9b8",
      easelColor: "#967655",
    },
    telescope: {
      visible: true,
      bodyColor: "#ede0bb",
      standColor: "#9b7f61",
      accentColor: "#556478",
    },
    mailbox: {
      visible: true,
      bodyColor: "#b67469",
      postColor: "#967857",
      flagColor: "#e8c886",
    },
    clock: {
      visible: true,
      bodyColor: "#ac876a",
      faceColor: "#f0ddb6",
      handColor: "#596555",
    },
  },
  interactions: {
    hoverScale: "NORMAL",
    treeShakeEnabled: true,
    treeShakeStrength: "NORMAL",
    butterflySecret: {
      enabled: true,
      requiredClicks: 3,
      butterflyColor: "#f9d092",
    },
  },
  camera: {
    travelSpeed: "NORMAL",
    easing: "SMOOTH",
    arcStrength: "NORMAL",
    orbitEnabled: true,
    orbitSpeed: 0.3,
    framing: "BALANCED",
  },
  ambience: {
    soundEnabled: true,
    defaultVolume: 70,
  },
  sections: {
    ABOUT: {
      enabled: true,
      label: "Artist",
      icon: "⌂",
    },
    QUOTES: {
      enabled: true,
      label: "Quotes",
      icon: "✳",
    },
    GALLERY: {
      enabled: true,
      label: "Art Gallery",
      icon: "▧",
    },
    JOURNEY: {
      enabled: true,
      label: "Star Journey",
      icon: "✧",
    },
    CONTACT: {
      enabled: true,
      label: "Post a Letter",
      icon: "✉",
    },
    MUSIC: {
      enabled: true,
      label: "Music & Moods",
      icon: "♫",
    },
  },
  dayNight: {
    enabled: true,
    mode: "automatic",
    timeSource: "visitor-local",
    fixedTimezone: "Asia/Kolkata",
    fixedPeriod: "DAY",
    defaultPeriod: "DAY",
    allowVisitorOverride: true,
    transition: {
      enabled: true,
      durationSeconds: 6,
    },
    schedule: {
      morningStart: "05:30",
      dayStart: "08:00",
      sunsetStart: "17:00",
      nightStart: "19:00",
    },
    profiles: {
      morning: {
        backgroundColor: "#dcd6e8",
        fog: {
          enabled: true,
          color: "#dcd6e8",
          near: 26,
          far: 62,
        },
        hemisphere: {
          enabled: true,
          skyColor: "#fcecd2",
          groundColor: "#9389a6",
          intensity: 2.1,
        },
        directional: {
          enabled: true,
          color: "#ffeec9",
          intensity: 2.6,
          position: { x: -6, y: 8, z: 6 },
        },
        windowGlowMultiplier: 0.35,
        lampDefaultLit: false,
        stars: {
          enabled: false,
          density: "OFF",
          brightness: 0.3,
          twinkle: false,
        },
        moon: {
          enabled: false,
          color: "#f8f4e6",
          brightness: 0.4,
          size: "NORMAL",
        },
        firefliesMultiplier: 0.3,
        cloudTint: "#f5ecf0",
        pondTint: "#96c4c4",
        ambienceMultiplier: 0.85,
      },
      day: {
        backgroundColor: "#d5cbdc",
        fog: {
          enabled: true,
          color: "#d5cbdc",
          near: 28,
          far: 65,
        },
        hemisphere: {
          enabled: true,
          skyColor: "#fff3d7",
          groundColor: "#9b91b1",
          intensity: 2.0,
        },
        directional: {
          enabled: true,
          color: "#ffffff",
          intensity: 3.0,
          position: { x: -5, y: 10, z: 6 },
        },
        windowGlowMultiplier: 0.15,
        lampDefaultLit: false,
        stars: {
          enabled: false,
          density: "OFF",
          brightness: 0,
          twinkle: false,
        },
        moon: {
          enabled: false,
          color: "#ffffff",
          brightness: 0,
          size: "NORMAL",
        },
        firefliesMultiplier: 0.1,
        cloudTint: "#f1e7ed",
        pondTint: "#89b9b9",
        ambienceMultiplier: 1.0,
      },
      sunset: {
        backgroundColor: "#dfbfc0",
        fog: {
          enabled: true,
          color: "#dfbfc0",
          near: 24,
          far: 58,
        },
        hemisphere: {
          enabled: true,
          skyColor: "#ffd1a4",
          groundColor: "#7d627c",
          intensity: 2.3,
        },
        directional: {
          enabled: true,
          color: "#ff9d6c",
          intensity: 2.8,
          position: { x: 7, y: 5, z: 5 },
        },
        windowGlowMultiplier: 0.85,
        lampDefaultLit: true,
        stars: {
          enabled: true,
          density: "SPARSE",
          brightness: 0.6,
          twinkle: true,
        },
        moon: {
          enabled: false,
          color: "#f9f1de",
          brightness: 0.5,
          size: "NORMAL",
        },
        firefliesMultiplier: 0.75,
        cloudTint: "#ecc8bf",
        pondTint: "#c29294",
        ambienceMultiplier: 0.85,
      },
      night: {
        backgroundColor: "#1b1e2e",
        fog: {
          enabled: true,
          color: "#212538",
          near: 22,
          far: 55,
        },
        hemisphere: {
          enabled: true,
          skyColor: "#4f5c88",
          groundColor: "#222538",
          intensity: 2.0,
        },
        directional: {
          enabled: true,
          color: "#b6d4f8",
          intensity: 2.4,
          position: { x: -5, y: 10, z: 6 },
        },
        windowGlowMultiplier: 1.7,
        lampDefaultLit: true,
        stars: {
          enabled: true,
          density: "FULL",
          brightness: 1.0,
          twinkle: true,
        },
        moon: {
          enabled: true,
          color: "#e8f0fc",
          brightness: 1.0,
          size: "NORMAL",
        },
        firefliesMultiplier: 1.4,
        cloudTint: "#555d78",
        pondTint: "#2b394e",
        ambienceMultiplier: 0.65,
      },
    },
  },
  musicMood: {
    enabled: true,
    transitionDuration: 2.5,
  },
  completion: {
    enabled: true,
    autoPlayEnabled: true,
    autoPlayOnce: true,
    eyebrow: "you found your way through this little world ✦",
    title: "some things were meant to be noticed slowly.",
    message: "A quiet thank you for wandering through Shaivi’s Little World.",
    buttonLabel: "Continue exploring",
    replayLabel: "Replay final moment ✦",
    optionalChime: false,
  },
};

export interface WorldPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  settings: Partial<WorldSettings>;
}

export const WORLD_PRESETS: WorldPreset[] = [
  {
    id: "original",
    name: "Pastel Dream (Default)",
    description:
      "The original handcrafted gentle lavender day atmosphere with warm sunlight.",
    badge: "Default",
    settings: {
      scene: {
        backgroundColor: "#d5cbdc",
        fog: { enabled: true, color: "#d5cbdc", near: 28, far: 65 },
      },
      lighting: {
        hemisphere: {
          enabled: true,
          skyColor: "#fff3d7",
          groundColor: "#9b91b1",
          intensity: 2.0,
        },
        directional: {
          enabled: true,
          color: "#ffffff",
          intensity: 3.0,
          position: { x: -5, y: 10, z: 6 },
          castShadow: true,
        },
        shadowLevel: "BALANCED",
      },
    },
  },
  {
    id: "golden-hour",
    name: "Golden Hour Glow",
    description: "Rich amber rays, warm clay tones, and sunset serenity.",
    badge: "Sunset",
    settings: {
      scene: {
        backgroundColor: "#e8cfc2",
        fog: { enabled: true, color: "#e8cfc2", near: 24, far: 60 },
      },
      lighting: {
        hemisphere: {
          enabled: true,
          skyColor: "#ffd6a5",
          groundColor: "#aa7c6d",
          intensity: 2.2,
        },
        directional: {
          enabled: true,
          color: "#ffc482",
          intensity: 3.6,
          position: { x: -6, y: 8, z: 7 },
          castShadow: true,
        },
        shadowLevel: "HIGH",
      },
      island: {
        ...DEFAULT_WORLD_SETTINGS.island,
        grassEdgeColor: "#c7b889",
        grassTopColor: "#d6c99c",
        flowers: {
          enabled: true,
          density: "HIGH",
          primaryColor: "#f7af72",
          secondaryColor: "#e67362",
        },
      },
    },
  },
  {
    id: "twilight-lavender",
    name: "Twilight Magic",
    description:
      "Deep mystic purples and glowing lanterns beneath an early evening sky.",
    badge: "Twilight",
    settings: {
      scene: {
        backgroundColor: "#837894",
        fog: { enabled: true, color: "#837894", near: 22, far: 55 },
      },
      lighting: {
        hemisphere: {
          enabled: true,
          skyColor: "#c9b6e4",
          groundColor: "#4f455d",
          intensity: 1.6,
        },
        directional: {
          enabled: true,
          color: "#eedeff",
          intensity: 2.2,
          position: { x: -5, y: 10, z: 6 },
          castShadow: true,
        },
        shadowLevel: "BALANCED",
      },
      environment: {
        ...DEFAULT_WORLD_SETTINGS.environment,
        details: {
          ...DEFAULT_WORLD_SETTINGS.environment.details,
          lampDefaultLit: true,
          lampGlowColor: "#ffea9f",
          motesAmount: "FULL",
          motesColor: "#fff1a8",
        },
      },
    },
  },
  {
    id: "midnight-dream",
    name: "Midnight Reverie",
    description: "Dark indigo night with luminous motes and cozy window glow.",
    badge: "Night",
    settings: {
      scene: {
        backgroundColor: "#2e293a",
        fog: { enabled: true, color: "#2e293a", near: 20, far: 52 },
      },
      lighting: {
        hemisphere: {
          enabled: true,
          skyColor: "#58527a",
          groundColor: "#1d1929",
          intensity: 1.2,
        },
        directional: {
          enabled: true,
          color: "#9aa6d6",
          intensity: 1.8,
          position: { x: -4, y: 12, z: 5 },
          castShadow: true,
        },
        shadowLevel: "BALANCED",
      },
      environment: {
        ...DEFAULT_WORLD_SETTINGS.environment,
        clouds: {
          ...DEFAULT_WORLD_SETTINGS.environment.clouds,
          color: "#463d57",
        },
        details: {
          ...DEFAULT_WORLD_SETTINGS.environment.details,
          lampDefaultLit: true,
          lampGlowColor: "#ffe180",
          motesAmount: "FULL",
          motesColor: "#ffe79a",
        },
      },
      objects: {
        ...DEFAULT_WORLD_SETTINGS.objects,
        house: {
          ...DEFAULT_WORLD_SETTINGS.objects.house,
          windowGlowEnabled: true,
          windowGlowIntensity: 0.8,
        },
      },
    },
  },
  {
    id: "clean-sage",
    name: "Quiet Garden (Sage)",
    description: "Muted organic greens, earth tones, and serene daylight.",
    badge: "Organic",
    settings: {
      scene: {
        backgroundColor: "#cbd4c8",
        fog: { enabled: true, color: "#cbd4c8", near: 28, far: 65 },
      },
      lighting: {
        hemisphere: {
          enabled: true,
          skyColor: "#f3f6ee",
          groundColor: "#7e8d7c",
          intensity: 2.1,
        },
        directional: {
          enabled: true,
          color: "#ffffff",
          intensity: 2.9,
          position: { x: -5, y: 10, z: 6 },
          castShadow: true,
        },
        shadowLevel: "BALANCED",
      },
    },
  },
];

function isPlainObject(item: unknown): item is Record<string, any> {
  return typeof item === "object" && item !== null && !Array.isArray(item);
}

/**
 * Deeply normalizes any partial or incoming world settings object against DEFAULT_WORLD_SETTINGS.
 * Guarantees zero missing keys or undefined properties.
 */
export function normalizeWorldSettings(
  raw?: Partial<WorldSettings> | null,
): WorldSettings {
  if (!raw) return { ...DEFAULT_WORLD_SETTINGS };

  const merge = (target: any, source: any): any => {
    const result = { ...target };
    if (!source || typeof source !== "object") return result;

    for (const key of Object.keys(source)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype")
        continue;
      const srcVal = source[key];
      const tgtVal = target[key];

      if (isPlainObject(tgtVal) && isPlainObject(srcVal)) {
        result[key] = merge(tgtVal, srcVal);
      } else if (srcVal !== undefined && srcVal !== null) {
        result[key] = srcVal;
      }
    }
    return result;
  };

  return merge(DEFAULT_WORLD_SETTINGS, raw);
}

export interface TimeProfilePreset {
  id: string;
  name: string;
  period: "morning" | "day" | "sunset" | "night";
  description: string;
  profile: Partial<TimeProfile>;
}

export const TIME_PROFILE_PRESETS: TimeProfilePreset[] = [
  // Morning presets
  {
    id: "misty-morning",
    name: "Soft Misty Dawn",
    period: "morning",
    description:
      "Pale lilac skies, gentle awakening fog, and low warm morning glow.",
    profile: {
      backgroundColor: "#dcd6e8",
      fog: { enabled: true, color: "#dcd6e8", near: 24, far: 60 },
      hemisphere: {
        enabled: true,
        skyColor: "#fcecd2",
        groundColor: "#9389a6",
        intensity: 2.1,
      },
      directional: {
        enabled: true,
        color: "#ffeec9",
        intensity: 2.6,
        position: { x: -6, y: 8, z: 6 },
      },
      windowGlowMultiplier: 0.35,
      lampDefaultLit: false,
      stars: {
        enabled: false,
        density: "OFF",
        brightness: 0.3,
        twinkle: false,
      },
      moon: {
        enabled: false,
        color: "#f8f4e6",
        brightness: 0.4,
        size: "NORMAL",
      },
      firefliesMultiplier: 0.3,
      cloudTint: "#f5ecf0",
      pondTint: "#96c4c4",
      ambienceMultiplier: 0.85,
    },
  },
  {
    id: "fresh-sunrise",
    name: "Golden Sunrise",
    period: "morning",
    description:
      "Crisp morning air with brighter golden hues and clean visibility.",
    profile: {
      backgroundColor: "#e8dcdd",
      fog: { enabled: true, color: "#e8dcdd", near: 28, far: 66 },
      hemisphere: {
        enabled: true,
        skyColor: "#fffaea",
        groundColor: "#a39396",
        intensity: 2.2,
      },
      directional: {
        enabled: true,
        color: "#fff0cd",
        intensity: 2.9,
        position: { x: -7, y: 9, z: 5 },
      },
      windowGlowMultiplier: 0.2,
      lampDefaultLit: false,
      stars: {
        enabled: false,
        density: "OFF",
        brightness: 0.2,
        twinkle: false,
      },
      moon: {
        enabled: false,
        color: "#ffffff",
        brightness: 0.2,
        size: "NORMAL",
      },
      firefliesMultiplier: 0.2,
      cloudTint: "#faeef0",
      pondTint: "#8fc0be",
      ambienceMultiplier: 0.9,
    },
  },
  // Day presets
  {
    id: "pastel-day",
    name: "Pastel Day (Default)",
    period: "day",
    description: "The original balanced lavender daylight with neutral warmth.",
    profile: { ...DEFAULT_WORLD_SETTINGS.dayNight.profiles.day },
  },
  {
    id: "bright-sun",
    name: "Sunlit Day",
    period: "day",
    description:
      "Vibrant and clear afternoon daylight with crisp illumination.",
    profile: {
      backgroundColor: "#ded5e6",
      fog: { enabled: true, color: "#ded5e6", near: 30, far: 70 },
      hemisphere: {
        enabled: true,
        skyColor: "#ffffff",
        groundColor: "#9c93a8",
        intensity: 2.2,
      },
      directional: {
        enabled: true,
        color: "#fffdf9",
        intensity: 3.3,
        position: { x: -5, y: 11, z: 6 },
      },
      windowGlowMultiplier: 0.1,
      lampDefaultLit: false,
      stars: { enabled: false, density: "OFF", brightness: 0, twinkle: false },
      moon: { enabled: false, color: "#ffffff", brightness: 0, size: "NORMAL" },
      firefliesMultiplier: 0,
      cloudTint: "#f3edf1",
      pondTint: "#89b9b9",
      ambienceMultiplier: 1.0,
    },
  },
  // Sunset presets
  {
    id: "peach-sunset",
    name: "Dreamy Peach Sunset",
    period: "sunset",
    description:
      "Nostalgic lavender-peach glow with warm directional sun and waking windows.",
    profile: { ...DEFAULT_WORLD_SETTINGS.dayNight.profiles.sunset },
  },
  {
    id: "golden-dusk",
    name: "Golden Hour Dusk",
    period: "sunset",
    description:
      "Rich honey amber tones, lengthened shadows, and cozy lit lanterns.",
    profile: {
      backgroundColor: "#e2b8a8",
      fog: { enabled: true, color: "#e2b8a8", near: 22, far: 54 },
      hemisphere: {
        enabled: true,
        skyColor: "#ffcb94",
        groundColor: "#755462",
        intensity: 2.4,
      },
      directional: {
        enabled: true,
        color: "#ff8c4a",
        intensity: 3.0,
        position: { x: 8, y: 4, z: 4 },
      },
      windowGlowMultiplier: 1.1,
      lampDefaultLit: true,
      stars: {
        enabled: true,
        density: "SPARSE",
        brightness: 0.6,
        twinkle: true,
      },
      moon: {
        enabled: false,
        color: "#f7eed4",
        brightness: 0.4,
        size: "NORMAL",
      },
      firefliesMultiplier: 0.9,
      cloudTint: "#f2bca9",
      pondTint: "#ba7b74",
      ambienceMultiplier: 0.85,
    },
  },
  // Night presets
  {
    id: "soft-night",
    name: "Soft Dreamy Night",
    period: "night",
    description:
      "Gentle indigo lavender skies, glowing cottage windows, and twinkling stars.",
    profile: { ...DEFAULT_WORLD_SETTINGS.dayNight.profiles.night },
  },
  {
    id: "deep-indigo",
    name: "Deep Midnight Indigo",
    period: "night",
    description:
      "Deep starry expanse, cooler moonlight, and bright glowing fireflies.",
    profile: {
      backgroundColor: "#141724",
      fog: { enabled: true, color: "#181b2a", near: 20, far: 50 },
      hemisphere: {
        enabled: true,
        skyColor: "#2c3452",
        groundColor: "#10121c",
        intensity: 1.1,
      },
      directional: {
        enabled: true,
        color: "#95b6e6",
        intensity: 1.4,
        position: { x: -4, y: 9, z: -5 },
      },
      windowGlowMultiplier: 1.9,
      lampDefaultLit: true,
      stars: { enabled: true, density: "FULL", brightness: 1.1, twinkle: true },
      moon: {
        enabled: true,
        color: "#e3eeff",
        brightness: 1.1,
        size: "NORMAL",
      },
      firefliesMultiplier: 1.6,
      cloudTint: "#434b66",
      pondTint: "#222f42",
      ambienceMultiplier: 0.65,
    },
  },
];
