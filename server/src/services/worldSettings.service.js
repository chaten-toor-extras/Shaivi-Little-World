import { WorldSettings } from '../models/WorldSettings.js';
import { defaultWorldSettings } from '../seeds/defaultWorldSettings.js';
import { parseTimeToMinutes } from '../validators/worldSettings.validators.js';

/**
 * Deep merge utility that safely combines partial updates with existing documents
 */
function isPlainObject(item) {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge(target, source) {
  const output = { ...target };
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      if (isPlainObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else if (source[key] !== undefined) {
        output[key] = source[key];
      }
    });
  }
  return output;
}

export const worldSettingsService = {
  /**
   * Get the singleton WorldSettings document, auto-initializing or migrating if absent
   */
  async getWorldSettings() {
    let settings = await WorldSettings.findOne().lean();
    if (!settings) {
      const created = await WorldSettings.create(defaultWorldSettings);
      settings = created.toObject();
    } else {
      let needsSave = false;
      const doc = await WorldSettings.findById(settings._id);
      if (doc) {
        if (!doc.dayNight || settings.schemaVersion < 2) {
          if (!doc.dayNight) doc.set('dayNight', defaultWorldSettings.dayNight);
          doc.set('schemaVersion', 2);
          needsSave = true;
        }
        if (!doc.musicMood) {
          doc.set('musicMood', defaultWorldSettings.musicMood);
          needsSave = true;
        }
        if (needsSave) {
          await doc.save();
          settings = doc.toObject();
        }
      }
    }
    return settings;
  },

  /**
   * Partially update world settings with deep merging and validation
   */
  async updateWorldSettings(partialData) {
    let doc = await WorldSettings.findOne();
    if (!doc) {
      doc = await WorldSettings.create(defaultWorldSettings);
    }

    const currentObj = doc.toObject();
    const merged = deepMerge(currentObj, partialData);

    // Section validation: ensure at least one section remains enabled
    if (merged.sections) {
      const activeCount = Object.values(merged.sections).filter(
        (sec) => sec && sec.enabled === true
      ).length;
      if (activeCount === 0) {
        const error = new Error('At least one section must remain enabled');
        error.statusCode = 400;
        throw error;
      }
    }

    // Schedule ordering validation on merged data
    if (merged.dayNight?.schedule) {
      const s = merged.dayNight.schedule;
      const m = parseTimeToMinutes(s.morningStart);
      const d = parseTimeToMinutes(s.dayStart);
      const su = parseTimeToMinutes(s.sunsetStart);
      const n = parseTimeToMinutes(s.nightStart);
      if (!(m < d && d < su && su < n)) {
        const error = new Error('Schedule start times must follow strict order: morning < day < sunset < night');
        error.statusCode = 400;
        throw error;
      }
    }

    // Assign merged properties onto Mongoose document
    Object.keys(merged).forEach((key) => {
      if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
        doc.set(key, merged[key]);
      }
    });
    doc.set('schemaVersion', 2);

    await doc.save();
    return doc.toObject();
  },

  /**
   * Reset all settings, a specific section, or a specific dayNight profile to defaults
   */
  async resetWorldSettings(sectionName) {
    let doc = await WorldSettings.findOne();
    if (!doc) {
      doc = await WorldSettings.create(defaultWorldSettings);
      return doc.toObject();
    }

    if (sectionName) {
      if (sectionName.startsWith('dayNight.profiles.')) {
        const profileName = sectionName.split('.')[2];
        if (!defaultWorldSettings.dayNight.profiles[profileName]) {
          const error = new Error(`Invalid profile name: ${profileName}`);
          error.statusCode = 400;
          throw error;
        }
        doc.set(`dayNight.profiles.${profileName}`, defaultWorldSettings.dayNight.profiles[profileName]);
      } else if (sectionName in defaultWorldSettings) {
        doc.set(sectionName, defaultWorldSettings[sectionName]);
      } else {
        const error = new Error(`Invalid section name: ${sectionName}`);
        error.statusCode = 400;
        throw error;
      }
    } else {
      // Reset all sections to defaultWorldSettings
      Object.keys(defaultWorldSettings).forEach((key) => {
        doc.set(key, defaultWorldSettings[key]);
      });
      doc.set('schemaVersion', 2);
    }

    await doc.save();
    return doc.toObject();
  },

  /**
   * Return clean sanitized DTO for public consumption
   */
  async getPublicWorldSettings() {
    const settings = await this.getWorldSettings();
    const { _id, __v, createdAt, updatedAt, ...safeSettings } = settings;
    return safeSettings;
  },
};

