import type { Section } from "@/data/portfolio";

export const WORLD_PROGRESS_STORAGE_KEY = "shaivi-world-progress-v1";

export interface WorldProgressStorageData {
  version: 1;
  visitedSections: Section[];
  letterSent: boolean;
  journeyExplored: boolean;
  musicPlayed: boolean;
  quoteInteracted: boolean;
}

const DEFAULT_STORAGE: WorldProgressStorageData = {
  version: 1,
  visitedSections: [],
  letterSent: false,
  journeyExplored: false,
  musicPlayed: false,
  quoteInteracted: false,
};

type ProgressListener = (data: WorldProgressStorageData) => void;

class WorldProgressStorageService {
  private listeners: Set<ProgressListener> = new Set();

  subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(data: WorldProgressStorageData): void {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.warn("WorldProgressStorage listener error:", err);
      }
    }
  }

  loadProgress(): WorldProgressStorageData {
    if (typeof window === "undefined") {
      return { ...DEFAULT_STORAGE };
    }
    try {
      const raw = localStorage.getItem(WORLD_PROGRESS_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STORAGE };
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.version === 1) {
        return {
          version: 1,
          visitedSections: Array.isArray(parsed.visitedSections)
            ? parsed.visitedSections
            : [],
          letterSent: Boolean(parsed.letterSent),
          journeyExplored: Boolean(parsed.journeyExplored),
          musicPlayed: Boolean(parsed.musicPlayed),
          quoteInteracted: Boolean(parsed.quoteInteracted),
        };
      }
      return { ...DEFAULT_STORAGE };
    } catch (e) {
      console.warn("Could not read world progress from localStorage:", e);
      return { ...DEFAULT_STORAGE };
    }
  }

  private save(data: WorldProgressStorageData): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(WORLD_PROGRESS_STORAGE_KEY, JSON.stringify(data));
      this.notify(data);
    } catch (e) {
      console.warn("Could not save world progress to localStorage:", e);
    }
  }

  recordSectionVisited(section: Section): void {
    const current = this.loadProgress();
    if (!current.visitedSections.includes(section)) {
      const updated: WorldProgressStorageData = {
        ...current,
        visitedSections: [...current.visitedSections, section],
      };
      this.save(updated);
    }
  }

  recordLetterSent(): void {
    const current = this.loadProgress();
    if (!current.letterSent) {
      this.save({ ...current, letterSent: true });
    }
  }

  recordJourneyExplored(): void {
    const current = this.loadProgress();
    if (!current.journeyExplored) {
      this.save({ ...current, journeyExplored: true });
    }
  }

  recordMusicPlayed(): void {
    const current = this.loadProgress();
    if (!current.musicPlayed) {
      this.save({ ...current, musicPlayed: true });
    }
  }

  recordQuoteInteracted(): void {
    const current = this.loadProgress();
    if (!current.quoteInteracted) {
      this.save({ ...current, quoteInteracted: true });
    }
  }

  resetProgress(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(WORLD_PROGRESS_STORAGE_KEY);
      this.notify({ ...DEFAULT_STORAGE });
    } catch (e) {
      console.warn("Could not reset world progress in localStorage:", e);
    }
  }
}

export const worldProgressStorage = new WorldProgressStorageService();

