import assert from "node:assert";
import type { Mood } from "../src/types";
import type { WorldSettings } from "../src/types/world";
import { blendHexColor } from "../src/utils/applyMoodEffect";
import { resolveWorldTheme } from "../src/utils/timeOfDay";

console.log("Starting Mood Resolver Tests...");

// 1. blendHexColor tests
{
  const base = "#ffffff";
  const tint = "#000000";
  assert.strictEqual(
    blendHexColor(base, undefined, 0.5),
    "#ffffff",
    "Should return base if tint is undefined",
  );
  assert.strictEqual(
    blendHexColor(base, tint, 0),
    "#ffffff",
    "Should return base if strength is 0",
  );

  const blended = blendHexColor(base, tint, 0.5, 0.5);
  assert.ok(blended.startsWith("#"), "Blended color should be hex string");
  assert.notStrictEqual(
    blended,
    "#ffffff",
    "Blended color should shift from base",
  );
  assert.notStrictEqual(
    blended,
    "#000000",
    "Blended color should not completely replace base",
  );

  const clamped = blendHexColor(base, tint, 1.0, 0.4);
  const exact = blendHexColor(base, tint, 0.4, 0.4);
  assert.strictEqual(
    clamped,
    exact,
    "Strength should be clamped to maxStrength",
  );
  console.log("✓ blendHexColor tests passed");
}

// Mock base settings
const mockBaseSettings: WorldSettings = {
  schemaVersion: 1,
  identity: {
    worldTitle: "Test World",
    wordmark: "Shaivi",
    exploreLabel: "Explore",
    instructionText: "Click to explore",
    discoveryLabel: "Found",
    secretMessage: "Hello",
  },
  intro: {
    enabled: true,
    eyebrow: "Welcome",
    heading: "Shaivi's World",
    body: "Body",
    enterButtonLabel: "Enter",
    starEnabled: true,
  },
  scene: {
    backgroundColor: "#112233",
    fog: { enabled: true, color: "#112233", near: 20, far: 60 },
  },
  lighting: {
    hemisphere: {
      enabled: true,
      skyColor: "#ffffff",
      groundColor: "#888888",
      intensity: 2.0,
    },
    directional: {
      enabled: true,
      color: "#ffffff",
      intensity: 3.0,
      position: { x: 5, y: 10, z: 5 },
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
      speed: 0.4,
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
      wallColor: "#e4dcd3",
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
      woodColor: "#c2ab87",
      frameColor: "#6e6259",
      screenInactiveColor: "#7d8b82",
      screenActiveColor: "#b9cbbe",
    },
    artWall: {
      visible: true,
      frameColor: "#a08068",
      canvasColor: "#f2ede4",
      easelColor: "#806852",
    },
    telescope: {
      visible: true,
      bodyColor: "#867055",
      standColor: "#584c3d",
      accentColor: "#c2ab87",
    },
    mailbox: {
      visible: true,
      bodyColor: "#829288",
      postColor: "#675949",
      flagColor: "#c27161",
    },
    clock: {
      visible: true,
      bodyColor: "#867055",
      faceColor: "#f4ede0",
      handColor: "#42382e",
    },
  },
  interactions: {
    hoverScale: "NORMAL",
    treeShakeEnabled: true,
    treeShakeStrength: "NORMAL",
    butterflySecret: {
      enabled: true,
      requiredClicks: 3,
      butterflyColor: "#f6ebd8",
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
  ambience: { soundEnabled: true, defaultVolume: 50 },
  sections: {
    ABOUT: { enabled: true, label: "About", icon: "⌂" },
    QUOTES: { enabled: true, label: "Quotes", icon: "✎" },
    GALLERY: { enabled: true, label: "Gallery", icon: "▧" },
    JOURNEY: { enabled: true, label: "Journey", icon: "✧" },
    CONTACT: { enabled: true, label: "Contact", icon: "✉" },
    MUSIC: { enabled: true, label: "Music", icon: "♫" },
  },
  dayNight: {
    enabled: true,
    mode: "automatic",
    timeSource: "visitor-local",
    fixedTimezone: "Asia/Kolkata",
    fixedPeriod: "DAY",
    defaultPeriod: "DAY",
    allowVisitorOverride: true,
    transition: { enabled: true, durationSeconds: 2.5 },
    schedule: {
      morningStart: "05:30",
      dayStart: "08:00",
      sunsetStart: "17:00",
      nightStart: "19:00",
    },
    profiles: {
      morning: {
        backgroundColor: "#e8d7c3",
        fog: { enabled: true, color: "#e8d7c3", near: 26, far: 62 },
        hemisphere: {
          enabled: true,
          skyColor: "#ffe7cc",
          groundColor: "#a3988f",
          intensity: 2.1,
        },
        directional: {
          enabled: true,
          color: "#ffd5a4",
          intensity: 3.2,
          position: { x: -8, y: 7, z: 5 },
        },
        windowGlowMultiplier: 0.35,
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
        firefliesMultiplier: 0.4,
        cloudTint: "#f7e5d2",
        pondTint: "#8eb5b3",
        ambienceMultiplier: 0.9,
      },
      day: {
        backgroundColor: "#d5cbdc",
        fog: { enabled: true, color: "#d5cbdc", near: 28, far: 65 },
        hemisphere: {
          enabled: true,
          skyColor: "#fff3d7",
          groundColor: "#9b91b1",
          intensity: 2.3,
        },
        directional: {
          enabled: true,
          color: "#ffffff",
          intensity: 3.4,
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
        firefliesMultiplier: 0.2,
        cloudTint: "#f1e7ed",
        pondTint: "#89b9b9",
        ambienceMultiplier: 1.0,
      },
      sunset: {
        backgroundColor: "#c78676",
        fog: { enabled: true, color: "#c78676", near: 25, far: 58 },
        hemisphere: {
          enabled: true,
          skyColor: "#f7b28d",
          groundColor: "#6c586e",
          intensity: 1.8,
        },
        directional: {
          enabled: true,
          color: "#f98b60",
          intensity: 2.6,
          position: { x: 9, y: 4, z: 4 },
        },
        windowGlowMultiplier: 0.85,
        lampDefaultLit: true,
        stars: {
          enabled: true,
          density: "SPARSE",
          brightness: 0.4,
          twinkle: true,
        },
        moon: {
          enabled: true,
          color: "#faebd7",
          brightness: 0.5,
          size: "NORMAL",
        },
        firefliesMultiplier: 1.1,
        cloudTint: "#e5a794",
        pondTint: "#9c7f89",
        ambienceMultiplier: 1.1,
      },
      night: {
        backgroundColor: "#161b2e",
        fog: { enabled: true, color: "#161b2e", near: 22, far: 52 },
        hemisphere: {
          enabled: true,
          skyColor: "#2a3556",
          groundColor: "#1a1e29",
          intensity: 0.9,
        },
        directional: {
          enabled: true,
          color: "#8ca8d8",
          intensity: 1.2,
          position: { x: -4, y: 8, z: -4 },
        },
        windowGlowMultiplier: 1.7,
        lampDefaultLit: true,
        stars: {
          enabled: true,
          density: "FULL",
          brightness: 0.85,
          twinkle: true,
        },
        moon: {
          enabled: true,
          color: "#e8efff",
          brightness: 0.95,
          size: "NORMAL",
        },
        firefliesMultiplier: 1.6,
        cloudTint: "#262f48",
        pondTint: "#2d4257",
        ambienceMultiplier: 0.75,
      },
    },
  },
  musicMood: {
    enabled: true,
    transitionDuration: 2.5,
  },
};

const mockMoodRainy: Mood = {
  _id: "mood-rainy-1",
  name: "Rainy",
  slug: "rainy",
  paperColor: "#c2cbd0",
  inkColor: "#2b3842",
  songIds: [],
  order: 0,
  isPublished: true,
  worldEffect: {
    enabled: true,
    intensity: 0.85,
    scene: { tint: "#7a8a99", tintStrength: 0.25, fogMultiplier: 1.3 },
    lighting: {
      intensityMultiplier: 0.75,
      tint: "#8ca0b3",
      tintStrength: 0.25,
    },
    atmosphere: {
      starBrightnessMultiplier: 0.6,
      fireflyMultiplier: 0.3,
      cloudSpeedMultiplier: 1.4,
      cloudTint: "#6e7e8c",
      cloudTintStrength: 0.3,
      moonBrightnessMultiplier: 0.7,
      windowGlowMultiplier: 1.4,
      lampGlowMultiplier: 1.3,
    },
    environment: {
      pondTint: "#556b7d",
      pondTintStrength: 0.35,
      flowerBrightnessMultiplier: 0.8,
    },
    motion: {
      globalSpeedMultiplier: 0.75,
    },
  },
};

// 2. applyMoodEffect tests
{
  const nightTheme = resolveWorldTheme({
    base: mockBaseSettings,
    dayNight: mockBaseSettings.dayNight,
    period: "NIGHT",
    mood: mockMoodRainy,
    worldMoodActivated: true,
  });

  assert.strictEqual(nightTheme.period, "NIGHT", "Night period preserved");
  assert.ok(nightTheme.stars.enabled, "Stars remain enabled at night");
  assert.ok(nightTheme.moon.enabled, "Moon remains enabled at night");
  assert.ok(
    nightTheme.motionSpeedMultiplier < 1.0,
    "Motion slowed down for rainy mood",
  );
  assert.ok(
    nightTheme.fog.far < 52,
    "Fog came closer for rainy mood (fog multiplier > 1)",
  );
  assert.ok(
    nightTheme.cloudSpeedMultiplier > 1.0,
    "Clouds move faster for rainy mood",
  );
  console.log("✓ applyMoodEffect basic mood modulation passed");
}

// 3. Visitor / Admin toggle tests
{
  const deactivatedTheme = resolveWorldTheme({
    base: mockBaseSettings,
    dayNight: mockBaseSettings.dayNight,
    period: "NIGHT",
    mood: mockMoodRainy,
    worldMoodActivated: false,
  });

  assert.strictEqual(
    deactivatedTheme.motionSpeedMultiplier,
    1.0,
    "Motion multiplier is 1.0 when visitor deactivated mood",
  );
  assert.strictEqual(
    deactivatedTheme.fog.far,
    52,
    "Fog far is baseline night when visitor deactivated mood",
  );

  const adminDisabledTheme = resolveWorldTheme({
    base: mockBaseSettings,
    dayNight: mockBaseSettings.dayNight,
    period: "NIGHT",
    mood: mockMoodRainy,
    worldMoodActivated: true,
    adminMoodEnabled: false,
  });
  assert.strictEqual(
    adminDisabledTheme.motionSpeedMultiplier,
    1.0,
    "Motion is 1.0 when admin disabled mood effects",
  );
  console.log("✓ Visitor/Admin toggle tests passed");
}

// 4. Reduced Motion Invariant: ALWAYS sets motion to 0
{
  const reducedTheme = resolveWorldTheme({
    base: mockBaseSettings,
    dayNight: mockBaseSettings.dayNight,
    period: "NIGHT",
    mood: mockMoodRainy,
    worldMoodActivated: true,
    reducedMotion: true,
  });

  assert.strictEqual(
    reducedTheme.motionSpeedMultiplier,
    0,
    "Motion multiplier must be 0 when reduced motion",
  );
  assert.strictEqual(
    reducedTheme.cloudSpeedMultiplier,
    0,
    "Cloud speed must be 0 when reduced motion",
  );
  assert.strictEqual(
    reducedTheme.stars.twinkle,
    false,
    "Star twinkle must be false when reduced motion",
  );
  console.log("✓ Reduced Motion invariant passed");
}

// 5. Low Quality Invariant: Caps fireflies and stars
{
  const lowQualityTheme = resolveWorldTheme({
    base: mockBaseSettings,
    dayNight: mockBaseSettings.dayNight,
    period: "NIGHT",
    mood: mockMoodRainy,
    worldMoodActivated: true,
    quality: "LOW",
  });

  assert.ok(
    lowQualityTheme.firefliesMultiplier <= 0.5,
    "Fireflies multiplier capped at <= 0.5 on LOW quality",
  );
  assert.ok(
    lowQualityTheme.stars.count <= 80,
    "Stars count capped at <= 80 on LOW quality",
  );
  console.log("✓ Quality cap invariant passed");
}

console.log("All Mood Resolver Tests Passed Successfully! 🎉");
