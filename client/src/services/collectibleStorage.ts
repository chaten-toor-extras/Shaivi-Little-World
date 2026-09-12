import type { CollectedItemRecord, CollectionProgressData } from "@/types";

export const STORAGE_KEY = "shaivi-collection-progress-v1";

const DEFAULT_PROGRESS: CollectionProgressData = {
  version: 1,
  collected: {},
};

export const collectibleStorage = {
  /**
   * Loads visitor collectible progress from browser local storage.
   */
  loadProgress(): CollectionProgressData {
    if (typeof window === "undefined") {
      return DEFAULT_PROGRESS;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PROGRESS, collected: {} };
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.version === 1 &&
        parsed.collected &&
        typeof parsed.collected === "object"
      ) {
        return {
          version: 1,
          collected: parsed.collected,
        };
      }
      return { ...DEFAULT_PROGRESS, collected: {} };
    } catch (e) {
      console.warn("Could not read collectible progress from localStorage:", e);
      return { ...DEFAULT_PROGRESS, collected: {} };
    }
  },

  /**
   * Persists newly collected item to localStorage.
   * Canonical key is the stable MongoDB _id, with slug preserved for display.
   * Fully idempotent: duplicate attempts return existing state without mutation.
   */
  saveCollectedItem(id: string, slug: string): { updated: CollectionProgressData; isNew: boolean } {
    if (typeof window === "undefined" || !id) {
      return { updated: DEFAULT_PROGRESS, isNew: false };
    }
    try {
      const current = this.loadProgress();

      // Check if already collected by ID or by slug
      if (this.isCollected(id, current)) {
        return { updated: current, isNew: false };
      }

      const record: CollectedItemRecord = {
        id,
        slug: slug || id,
        collectedAt: new Date().toISOString(),
      };

      const updated: CollectionProgressData = {
        ...current,
        collected: {
          ...current.collected,
          [id]: record,
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { updated, isNew: true };
    } catch (e) {
      console.warn("Could not save collectible progress to localStorage:", e);
      return { updated: DEFAULT_PROGRESS, isNew: false };
    }
  },

  /**
   * Checks whether a collectible is already collected by its MongoDB ID or slug.
   */
  isCollected(identifier: string, progress?: CollectionProgressData): boolean {
    if (!identifier) return false;
    const p = progress || this.loadProgress();
    if (p.collected[identifier]) return true;

    return Object.values(p.collected).some(
      (rec) => rec.id === identifier || rec.slug === identifier
    );
  },

  /**
   * Clears collection progress (for admin testing/preview or local debugging).
   */
  resetProgress(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not reset collectible progress in localStorage:", e);
    }
  },
};

