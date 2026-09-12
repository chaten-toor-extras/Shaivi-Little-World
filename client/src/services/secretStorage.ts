import type { DiscoveredSecretRecord, SecretProgressData } from "@/types";

const STORAGE_KEY = "shaivi-secret-progress-v1";

const DEFAULT_PROGRESS: SecretProgressData = {
  version: 1,
  discovered: {},
};

export const secretStorage = {
  /**
   * Loads visitor secret progress from browser local storage.
   */
  loadProgress(): SecretProgressData {
    if (typeof window === "undefined") {
      return DEFAULT_PROGRESS;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PROGRESS, discovered: {} };
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.discovered) {
        return {
          version: parsed.version || 1,
          discovered: parsed.discovered,
        };
      }
      return { ...DEFAULT_PROGRESS, discovered: {} };
    } catch (e) {
      console.warn("Could not read secret progress from localStorage:", e);
      return { ...DEFAULT_PROGRESS, discovered: {} };
    }
  },

  /**
   * Persists newly discovered secret to localStorage.
   * Uses stable slug as canonical key and records secretId and timestamp.
   */
  saveDiscoveredSecret(
    slug: string,
    secretId?: string,
  ): SecretProgressData {
    if (typeof window === "undefined" || !slug) {
      return DEFAULT_PROGRESS;
    }
    try {
      const current = this.loadProgress();
      const record: DiscoveredSecretRecord = {
        slug,
        secretId,
        discoveredAt: new Date().toISOString(),
      };

      const updated: SecretProgressData = {
        ...current,
        discovered: {
          ...current.discovered,
          [slug]: record,
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn("Could not save secret progress to localStorage:", e);
      return DEFAULT_PROGRESS;
    }
  },

  /**
   * Checks whether a secret is already recorded as discovered by slug or ID.
   */
  isDiscovered(
    identifier: string,
    progress?: SecretProgressData,
  ): boolean {
    if (!identifier) return false;
    const p = progress || this.loadProgress();
    if (p.discovered[identifier]) return true;

    // Also check if any record has this as secretId
    return Object.values(p.discovered).some(
      (rec) => rec.secretId === identifier || rec.slug === identifier,
    );
  },

  /**
   * Clears secret progress (useful for admin testing/preview or local debugging).
   */
  resetProgress(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not reset secret progress in localStorage:", e);
    }
  },
};
