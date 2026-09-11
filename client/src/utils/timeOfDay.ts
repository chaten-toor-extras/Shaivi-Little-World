import type { Mood } from "@/types";
import type {
  DayNightSchedule,
  DayNightSettings,
  DayNightTimeSource,
  ResolvedWorldTheme,
  TimeOfDay,
  WorldSettings,
} from "@/types/world";
import { applyMoodEffect } from "./applyMoodEffect";

/**
 * Convert "HH:mm" (24-hour) string to minutes from midnight
 */
export function parseTimeToMinutes(hhmm: string): number {
  if (!hhmm || typeof hhmm !== "string") return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Determine TimeOfDay based on minutes since midnight and CMS schedule
 * Correctly wraps circular overnight Night (nightStart -> midnight -> morningStart)
 */
export function getTimeOfDay(
  minutes: number,
  schedule: DayNightSchedule,
): TimeOfDay {
  if (!schedule) return "DAY";
  const m = parseTimeToMinutes(schedule.morningStart || "05:30");
  const d = parseTimeToMinutes(schedule.dayStart || "08:00");
  const s = parseTimeToMinutes(schedule.sunsetStart || "17:00");
  const n = parseTimeToMinutes(schedule.nightStart || "19:00");

  if (minutes >= m && minutes < d) return "MORNING";
  if (minutes >= d && minutes < s) return "DAY";
  if (minutes >= s && minutes < n) return "SUNSET";
  return "NIGHT";
}

/**
 * Calculate current clock minutes using visitor-local time or fixed IANA timezone
 */
export function getEffectiveMinutes(
  timeSource: DayNightTimeSource = "visitor-local",
  fixedTimezone: string = "Asia/Kolkata",
): number {
  if (timeSource === "fixed-timezone" && fixedTimezone) {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: fixedTimezone,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const parts = formatter.formatToParts(new Date());
      const hourStr = parts.find((p) => p.type === "hour")?.value || "0";
      const minStr = parts.find((p) => p.type === "minute")?.value || "0";
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);
      return (hour % 24) * 60 + minute;
    } catch {
      // Fallback to local time if timezone fails
    }
  }

  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Resolve hierarchical world theme layering base settings, time profile,
 * music mood atmospheric effects, device quality caps, and accessibility requirements.
 */
export function resolveWorldTheme({
  base,
  dayNight,
  period,
  quality = "HIGH",
  reducedMotion = false,
  mood,
  worldMoodActivated = true,
  adminMoodEnabled,
}: {
  base: WorldSettings;
  dayNight?: DayNightSettings;
  period: TimeOfDay;
  quality?: string;
  reducedMotion?: boolean;
  mood?: Mood | null;
  worldMoodActivated?: boolean;
  adminMoodEnabled?: boolean;
}): ResolvedWorldTheme {
  const profileKey = period.toLowerCase() as keyof DayNightSettings["profiles"];
  const profile = dayNight?.profiles?.[profileKey];

  // Base values fallback
  const baseBg = base?.scene?.backgroundColor || "#d5cbdc";
  const baseFog = base?.scene?.fog || {
    enabled: true,
    color: "#d5cbdc",
    near: 28,
    far: 65,
  };
  const baseHemi = base?.lighting?.hemisphere || {
    enabled: true,
    skyColor: "#fff3d7",
    groundColor: "#9b91b1",
    intensity: 2.0,
  };
  const baseDir = base?.lighting?.directional || {
    enabled: true,
    color: "#ffffff",
    intensity: 3.0,
    position: { x: -5, y: 10, z: 6 },
  };

  // If dayNight system is explicitly disabled, return base Phase 4 world with mood layer
  if (dayNight && dayNight.enabled === false) {
    const fallbackTheme: ResolvedWorldTheme = {
      period: "DAY",
      backgroundColor: baseBg,
      fog: { ...baseFog },
      hemisphere: { ...baseHemi },
      directional: { ...baseDir },
      windowGlowMultiplier: 1.0,
      lampDefaultLit: base?.environment?.details?.lampDefaultLit ?? true,
      lampGlowMultiplier: 1.0,
      stars: {
        enabled: false,
        count: 0,
        brightness: 0,
        twinkle: false,
      },
      moon: {
        enabled: false,
        color: "#ffffff",
        brightness: 0,
        scale: 1.0,
      },
      firefliesMultiplier: 1.0,
      cloudTint: base?.environment?.clouds?.color || "#f1e7ed",
      cloudSpeedMultiplier: 1.0,
      pondTint: base?.island?.pond?.waterColor || "#89b9b9",
      flowerBrightnessMultiplier: 1.0,
      motionSpeedMultiplier: reducedMotion ? 0 : 1.0,
      ambienceMultiplier: 1.0,
      transitionDuration: base?.musicMood?.transitionDuration ?? 2.5,
    };

    return applyMoodEffect(fallbackTheme, {
      mood,
      worldMoodActivated,
      adminMoodEnabled: adminMoodEnabled ?? base?.musicMood?.enabled ?? true,
      transitionDuration: base?.musicMood?.transitionDuration ?? 2.5,
      reducedMotion,
      quality,
    });
  }

  // Star density to count mapping with performance caps
  let rawStarCount = 0;
  if (profile?.stars?.enabled) {
    const density = profile.stars.density || "NORMAL";
    if (density === "SPARSE") rawStarCount = 80;
    else if (density === "NORMAL") rawStarCount = 160;
    else if (density === "FULL") rawStarCount = 260;
  }

  // Device quality caps
  if (quality === "LOW") {
    rawStarCount = Math.min(rawStarCount, 80);
  } else if (quality === "MEDIUM") {
    rawStarCount = Math.min(rawStarCount, 160);
  }

  // Moon scale mapping
  const moonSize = profile?.moon?.size || "NORMAL";
  const moonScale =
    moonSize === "SMALL" ? 0.7 : moonSize === "LARGE" ? 1.35 : 1.0;

  // Fireflies multiplier with quality constraint
  let firefliesMult = profile?.firefliesMultiplier ?? 1.0;
  if (quality === "LOW") {
    firefliesMult = Math.min(firefliesMult, 0.5);
  }

  const defaultDuration =
    base?.musicMood?.transitionDuration ??
    dayNight?.transition?.durationSeconds ??
    2.5;

  const baseResolvedTheme: ResolvedWorldTheme = {
    period,
    backgroundColor: profile?.backgroundColor || baseBg,
    fog: {
      enabled: profile?.fog?.enabled ?? baseFog.enabled,
      color: profile?.fog?.color || baseFog.color,
      near: profile?.fog?.near ?? baseFog.near,
      far: profile?.fog?.far ?? baseFog.far,
    },
    hemisphere: {
      enabled: profile?.hemisphere?.enabled ?? baseHemi.enabled,
      skyColor: profile?.hemisphere?.skyColor || baseHemi.skyColor,
      groundColor: profile?.hemisphere?.groundColor || baseHemi.groundColor,
      intensity: profile?.hemisphere?.intensity ?? baseHemi.intensity,
    },
    directional: {
      enabled: profile?.directional?.enabled ?? baseDir.enabled,
      color: profile?.directional?.color || baseDir.color,
      intensity: profile?.directional?.intensity ?? baseDir.intensity,
      position: profile?.directional?.position || baseDir.position,
    },
    windowGlowMultiplier: profile?.windowGlowMultiplier ?? 1.0,
    lampDefaultLit: profile?.lampDefaultLit ?? true,
    lampGlowMultiplier: 1.0,
    stars: {
      enabled: profile?.stars?.enabled ?? false,
      count: rawStarCount,
      brightness: profile?.stars?.brightness ?? 0.8,
      twinkle: reducedMotion ? false : (profile?.stars?.twinkle ?? true),
    },
    moon: {
      enabled: profile?.moon?.enabled ?? false,
      color: profile?.moon?.color || "#ffffff",
      brightness: profile?.moon?.brightness ?? 0.9,
      scale: moonScale,
    },
    firefliesMultiplier: firefliesMult,
    cloudTint:
      profile?.cloudTint || base?.environment?.clouds?.color || "#f1e7ed",
    cloudSpeedMultiplier: 1.0,
    pondTint: profile?.pondTint || base?.island?.pond?.waterColor || "#89b9b9",
    flowerBrightnessMultiplier: 1.0,
    motionSpeedMultiplier: reducedMotion ? 0 : 1.0,
    ambienceMultiplier: profile?.ambienceMultiplier ?? 1.0,
    transitionDuration: defaultDuration,
  };

  return applyMoodEffect(baseResolvedTheme, {
    mood,
    worldMoodActivated,
    adminMoodEnabled: adminMoodEnabled ?? base?.musicMood?.enabled ?? true,
    transitionDuration: defaultDuration,
    reducedMotion,
    quality,
  });
}
