/**
 * Completion Cinematic Local Storage Service
 *
 * Persists minimal browser-local playback state for Phase 11 completion moment.
 * Zero database writes; strictly client-local.
 */

export interface CompletionCinematicData {
  version: 1;
  hasPlayed: boolean;
  firstPlayedAt?: string;
  lastReplayAt?: string;
}

const STORAGE_KEY = "shaivi-completion-cinematic-v1";
const CURRENT_VERSION = 1;

const DEFAULT_DATA: CompletionCinematicData = {
  version: CURRENT_VERSION,
  hasPlayed: false,
};

type Listener = (data: CompletionCinematicData) => void;
const listeners = new Set<Listener>();

function notify(data: CompletionCinematicData): void {
  listeners.forEach((fn) => {
    try {
      fn(data);
    } catch (err) {
      console.error("[completionCinematicStorage] Listener error:", err);
    }
  });
}

export const completionCinematicStorage = {
  load(): CompletionCinematicData {
    if (typeof window === "undefined") {
      return { ...DEFAULT_DATA };
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_DATA };
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || parsed.version !== CURRENT_VERSION) {
        return { ...DEFAULT_DATA };
      }

      return {
        version: CURRENT_VERSION,
        hasPlayed: Boolean(parsed.hasPlayed),
        firstPlayedAt: typeof parsed.firstPlayedAt === "string" ? parsed.firstPlayedAt : undefined,
        lastReplayAt: typeof parsed.lastReplayAt === "string" ? parsed.lastReplayAt : undefined,
      };
    } catch (err) {
      console.warn("[completionCinematicStorage] Failed to read from localStorage, using fallback:", err);
      return { ...DEFAULT_DATA };
    }
  },

  markPlayed(): CompletionCinematicData {
    if (typeof window === "undefined") {
      return { ...DEFAULT_DATA, hasPlayed: true };
    }

    try {
      const current = this.load();
      const now = new Date().toISOString();
      const updated: CompletionCinematicData = {
        version: CURRENT_VERSION,
        hasPlayed: true,
        firstPlayedAt: current.firstPlayedAt || now,
        lastReplayAt: current.hasPlayed ? now : current.lastReplayAt,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notify(updated);
      return updated;
    } catch (err) {
      console.warn("[completionCinematicStorage] Failed to write to localStorage:", err);
      const fallback: CompletionCinematicData = { ...DEFAULT_DATA, hasPlayed: true };
      notify(fallback);
      return fallback;
    }
  },

  recordReplay(): CompletionCinematicData {
    if (typeof window === "undefined") {
      return { ...DEFAULT_DATA, hasPlayed: true };
    }

    try {
      const current = this.load();
      const now = new Date().toISOString();
      const updated: CompletionCinematicData = {
        version: CURRENT_VERSION,
        hasPlayed: true,
        firstPlayedAt: current.firstPlayedAt || now,
        lastReplayAt: now,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notify(updated);
      return updated;
    } catch (err) {
      console.warn("[completionCinematicStorage] Failed to record replay in localStorage:", err);
      return currentCinematicDataFallback();
    }
  },

  reset(): void {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(STORAGE_KEY);
      notify({ ...DEFAULT_DATA });
    } catch (err) {
      console.warn("[completionCinematicStorage] Failed to reset localStorage:", err);
    }
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

function currentCinematicDataFallback(): CompletionCinematicData {
  return { ...DEFAULT_DATA, hasPlayed: true };
}

