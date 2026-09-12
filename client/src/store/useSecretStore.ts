import { secretStorage } from "@/services/secretStorage";
import type {
  DiscoveredSecretRecord,
  PublicSecret,
  SecretRevealPayload,
} from "@/types";
import { create } from "zustand";

export interface ActiveReveal {
  secretId?: string;
  slug?: string;
  reveal: SecretRevealPayload;
  previewMode?: boolean;
  discoveredAt?: string;
}

export interface SecretStoreState {
  definitions: PublicSecret[];
  discovered: Record<string, DiscoveredSecretRecord>;
  activeReveal: ActiveReveal | null;
  revealQueue: ActiveReveal[];
  letterSentSession: boolean;
  journeyViewedSession: boolean;

  setDefinitions: (definitions: PublicSecret[]) => void;
  loadLocalProgress: () => void;
  recordDiscovery: (slug: string, secretId?: string) => void;
  enqueueReveal: (
    reveal: SecretRevealPayload,
    meta?: { secretId?: string; slug?: string; previewMode?: boolean },
  ) => void;
  dismissActiveReveal: () => void;
  setLetterSentSession: (sent: boolean) => void;
  setJourneyViewedSession: (viewed: boolean) => void;
  resetProgress: () => void;
}

export const useSecretStore = create<SecretStoreState>((set, get) => ({
  definitions: [],
  discovered: {},
  activeReveal: null,
  revealQueue: [],
  letterSentSession: false,
  journeyViewedSession: false,

  setDefinitions: (definitions) => {
    set({ definitions });
  },

  loadLocalProgress: () => {
    const progress = secretStorage.loadProgress();
    set({ discovered: progress.discovered || {} });
  },

  recordDiscovery: (slug, secretId) => {
    const updated = secretStorage.saveDiscoveredSecret(slug, secretId);
    set({ discovered: updated.discovered });
  },

  enqueueReveal: (reveal, meta) => {
    const newReveal: ActiveReveal = {
      reveal,
      secretId: meta?.secretId,
      slug: meta?.slug,
      previewMode: meta?.previewMode || false,
      discoveredAt: new Date().toISOString(),
    };

    const { activeReveal, revealQueue } = get();

    if (!activeReveal) {
      set({ activeReveal: newReveal });
    } else {
      // FIFO reveal queue
      set({ revealQueue: [...revealQueue, newReveal] });
    }
  },

  dismissActiveReveal: () => {
    const { revealQueue } = get();
    if (revealQueue.length > 0) {
      const [next, ...remaining] = revealQueue;
      set({ activeReveal: next, revealQueue: remaining });
    } else {
      set({ activeReveal: null });
    }
  },

  setLetterSentSession: (sent) => {
    set({ letterSentSession: sent });
  },

  setJourneyViewedSession: (viewed) => {
    set({ journeyViewedSession: viewed });
  },

  resetProgress: () => {
    secretStorage.resetProgress();
    set({ discovered: {} });
  },
}));
