import { Mood } from '../models/Mood.js';
import { defaultContent } from '../seeds/defaultContent.js';

export async function migrateMoodWorldEffects() {
  const moods = await Mood.find();
  let updatedCount = 0;

  for (const mood of moods) {
    let changed = false;

    if (!mood.slug && mood.name) {
      mood.slug = mood.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      changed = true;
    }

    if (!mood.worldEffect || !mood.worldEffect.scene) {
      // Find matching default seed if available
      const matchingSeed = defaultContent.moods.find(
        (m) => m.name.toLowerCase() === mood.name.toLowerCase() || m.slug === mood.slug
      );

      if (matchingSeed && matchingSeed.worldEffect) {
        mood.set('worldEffect', matchingSeed.worldEffect);
      } else {
        mood.set('worldEffect', {
          enabled: false,
          intensity: 1.0,
          scene: { tint: '#baa4df', tintStrength: 0.2, fogMultiplier: 1.0 },
          lighting: { intensityMultiplier: 1.0, tint: '#c7b4e9', tintStrength: 0.15 },
          atmosphere: {
            starBrightnessMultiplier: 1.0,
            fireflyMultiplier: 1.0,
            cloudSpeedMultiplier: 1.0,
            cloudTint: '#baa4df',
            cloudTintStrength: 0.15,
            moonBrightnessMultiplier: 1.0,
            windowGlowMultiplier: 1.0,
            lampGlowMultiplier: 1.0,
          },
          environment: {
            pondTint: '#8f87bb',
            pondTintStrength: 0.2,
            flowerBrightnessMultiplier: 1.0,
          },
          motion: { globalSpeedMultiplier: 1.0 },
        });
      }
      changed = true;
    }

    if (changed) {
      await mood.save();
      updatedCount++;
    }
  }

  return { total: moods.length, updated: updatedCount };
}
