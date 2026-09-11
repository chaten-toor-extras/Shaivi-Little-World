import { Color } from "three";
import type { MoodWorldEffect, ResolvedWorldTheme } from "@/types/world";
import type { Mood } from "@/types";

/**
 * Blend two hex colors together by a weight between 0.0 and 1.0.
 * Strength is capped at maxStrength (default 0.5) so mood tints never completely overwrite base color.
 */
export function blendHexColor(
  baseHex: string,
  tintHex?: string,
  strength: number = 0,
  maxStrength: number = 0.5,
): string {
  if (!tintHex || strength <= 0) return baseHex;
  const clampedStrength = Math.max(0, Math.min(maxStrength, strength));
  try {
    const base = new Color(baseHex);
    const tint = new Color(tintHex);
    base.lerp(tint, clampedStrength);
    return `#${base.getHexString()}`;
  } catch {
    return baseHex;
  }
}

/**
 * Interpolate a multiplier safely with mood effect intensity
 */
function scaleMultiplier(
  baseValue: number,
  moodMultiplier: number | undefined,
  intensity: number,
  minBound: number = 0.1,
  maxBound: number = 3.0,
): number {
  if (moodMultiplier === undefined) return baseValue;
  const effectiveFactor = 1.0 + (moodMultiplier - 1.0) * intensity;
  const result = baseValue * effectiveFactor;
  return Math.max(minBound, Math.min(maxBound, result));
}

export interface ApplyMoodEffectOptions {
  mood?: Mood | null;
  worldMoodActivated?: boolean;
  adminMoodEnabled?: boolean;
  transitionDuration?: number;
  reducedMotion?: boolean;
  quality?: string;
}

/**
 * Pure function to apply additive/multiplicative music mood overrides onto a resolved time-of-day theme.
 * Respects precedence: Day/Night base -> Mood tint/multipliers -> Device quality caps -> Reduced motion.
 */
export function applyMoodEffect(
  theme: ResolvedWorldTheme,
  options: ApplyMoodEffectOptions = {},
): ResolvedWorldTheme {
  const {
    mood,
    worldMoodActivated = true,
    adminMoodEnabled = true,
    transitionDuration,
    reducedMotion = false,
    quality = "HIGH",
  } = options;

  const resolved: ResolvedWorldTheme = {
    ...theme,
    fog: { ...theme.fog },
    hemisphere: { ...theme.hemisphere },
    directional: { ...theme.directional },
    stars: { ...theme.stars },
    moon: { ...theme.moon },
  };

  if (typeof transitionDuration === "number") {
    resolved.transitionDuration = transitionDuration;
  }

  // If mood effect is disabled or mood has no worldEffect enabled
  if (
    !adminMoodEnabled ||
    !worldMoodActivated ||
    !mood ||
    !mood.worldEffect ||
    mood.worldEffect.enabled === false
  ) {
    if (reducedMotion) {
      resolved.motionSpeedMultiplier = 0;
      resolved.cloudSpeedMultiplier = 0;
      resolved.stars.twinkle = false;
    }
    return resolved;
  }

  const effect = mood.worldEffect;
  const intensity = Math.max(0, Math.min(1.0, effect.intensity ?? 0.8));

  // 1. Scene
  if (effect.scene) {
    if (effect.scene.tint) {
      const tintStrength = (effect.scene.tintStrength ?? 0.2) * intensity;
      resolved.backgroundColor = blendHexColor(
        resolved.backgroundColor,
        effect.scene.tint,
        tintStrength,
        0.5,
      );
      if (resolved.fog.enabled) {
        resolved.fog.color = blendHexColor(
          resolved.fog.color,
          effect.scene.tint,
          tintStrength,
          0.5,
        );
      }
    }

    if (effect.scene.fogMultiplier !== undefined && resolved.fog.enabled) {
      const mult = scaleMultiplier(1.0, effect.scene.fogMultiplier, intensity, 0.7, 1.5);
      resolved.fog.far = Math.max(resolved.fog.near + 5, resolved.fog.far / mult);
    }
  }

  // 2. Lighting
  if (effect.lighting) {
    if (effect.lighting.intensityMultiplier !== undefined) {
      const mult = scaleMultiplier(1.0, effect.lighting.intensityMultiplier, intensity, 0.5, 1.5);
      resolved.hemisphere.intensity = Math.max(0.1, resolved.hemisphere.intensity * mult);
      resolved.directional.intensity = Math.max(0.1, resolved.directional.intensity * mult);
    }

    if (effect.lighting.tint) {
      const tintStrength = (effect.lighting.tintStrength ?? 0.2) * intensity;
      resolved.hemisphere.skyColor = blendHexColor(
        resolved.hemisphere.skyColor,
        effect.lighting.tint,
        tintStrength,
        0.4,
      );
      resolved.directional.color = blendHexColor(
        resolved.directional.color,
        effect.lighting.tint,
        tintStrength,
        0.4,
      );
    }
  }

  // 3. Atmosphere
  if (effect.atmosphere) {
    if (effect.atmosphere.starBrightnessMultiplier !== undefined && resolved.stars.enabled) {
      resolved.stars.brightness = scaleMultiplier(
        resolved.stars.brightness,
        effect.atmosphere.starBrightnessMultiplier,
        intensity,
        0.5,
        1.5,
      );
    }

    if (effect.atmosphere.fireflyMultiplier !== undefined) {
      resolved.firefliesMultiplier = scaleMultiplier(
        resolved.firefliesMultiplier,
        effect.atmosphere.fireflyMultiplier,
        intensity,
        0.0,
        2.0,
      );
    }

    if (effect.atmosphere.cloudSpeedMultiplier !== undefined) {
      resolved.cloudSpeedMultiplier = scaleMultiplier(
        resolved.cloudSpeedMultiplier,
        effect.atmosphere.cloudSpeedMultiplier,
        intensity,
        0.2,
        2.5,
      );
    }

    if (effect.atmosphere.cloudTint) {
      const tintStrength = (effect.atmosphere.cloudTintStrength ?? 0.25) * intensity;
      resolved.cloudTint = blendHexColor(
        resolved.cloudTint,
        effect.atmosphere.cloudTint,
        tintStrength,
        0.5,
      );
    }

    if (effect.atmosphere.moonBrightnessMultiplier !== undefined && resolved.moon.enabled) {
      resolved.moon.brightness = scaleMultiplier(
        resolved.moon.brightness,
        effect.atmosphere.moonBrightnessMultiplier,
        intensity,
        0.3,
        1.8,
      );
    }

    if (effect.atmosphere.windowGlowMultiplier !== undefined) {
      resolved.windowGlowMultiplier = scaleMultiplier(
        resolved.windowGlowMultiplier,
        effect.atmosphere.windowGlowMultiplier,
        intensity,
        0.2,
        2.5,
      );
    }

    if (effect.atmosphere.lampGlowMultiplier !== undefined) {
      resolved.lampGlowMultiplier = scaleMultiplier(
        resolved.lampGlowMultiplier,
        effect.atmosphere.lampGlowMultiplier,
        intensity,
        0.2,
        2.5,
      );
    }
  }

  // 4. Environment
  if (effect.environment) {
    if (effect.environment.pondTint) {
      const tintStrength = (effect.environment.pondTintStrength ?? 0.3) * intensity;
      resolved.pondTint = blendHexColor(
        resolved.pondTint,
        effect.environment.pondTint,
        tintStrength,
        0.5,
      );
    }

    if (effect.environment.flowerBrightnessMultiplier !== undefined) {
      resolved.flowerBrightnessMultiplier = scaleMultiplier(
        resolved.flowerBrightnessMultiplier,
        effect.environment.flowerBrightnessMultiplier,
        intensity,
        0.5,
        1.8,
      );
    }
  }

  // 5. Motion
  if (effect.motion) {
    if (effect.motion.globalSpeedMultiplier !== undefined) {
      resolved.motionSpeedMultiplier = scaleMultiplier(
        resolved.motionSpeedMultiplier,
        effect.motion.globalSpeedMultiplier,
        intensity,
        0.2,
        2.0,
      );
    }
  }

  // Device Quality Caps ALWAYS apply
  if (quality === "LOW") {
    resolved.firefliesMultiplier = Math.min(resolved.firefliesMultiplier, 0.5);
    resolved.stars.count = Math.min(resolved.stars.count, 80);
  } else if (quality === "MEDIUM") {
    resolved.stars.count = Math.min(resolved.stars.count, 160);
  }

  // Visitor Reduced Motion ALWAYS wins
  if (reducedMotion) {
    resolved.motionSpeedMultiplier = 0;
    resolved.cloudSpeedMultiplier = 0;
    resolved.stars.twinkle = false;
  }

  return resolved;
}
