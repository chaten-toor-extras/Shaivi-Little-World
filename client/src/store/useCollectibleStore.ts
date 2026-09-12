import { collectibleStorage } from "@/services/collectibleStorage";
import type { CollectedItemRecord, PublicCollectible } from "@/types";
import { create } from "zustand";

export interface CollectibleStoreState {
  definitions: PublicCollectible[];
  collected: Record<string, CollectedItemRecord>;
  activeCelebration: PublicCollectible | null;
  bookOpen: boolean;
  selectedBookItemId: string | null;

  setDefinitions: (definitions: PublicCollectible[]) => void;
  loadLocalProgress: () => void;
  grantCollectible: (
    identifier: string,
    source?: "WORLD" | "SECRET"
  ) => boolean;
  dismissCelebration: () => void;
  openBook: (itemId?: string) => void;
  closeBook: () => void;
  selectBookItem: (itemId: string) => void;
  resetProgress: () => void;

  // Computed / progress helpers
  getActiveTotal: () => number;
  getCollectedCount: () => number;
  isItemCollected: (idOrSlug: string) => boolean;
}

export const useCollectibleStore = create<CollectibleStoreState>((set, get) => ({
  definitions: [],
  collected: {},
  activeCelebration: null,
  bookOpen: false,
  selectedBookItemId: null,

  setDefinitions: (definitions) => {
    set({ definitions });
  },

  loadLocalProgress: () => {
    const progress = collectibleStorage.loadProgress();
    set({ collected: progress.collected || {} });
  },

  grantCollectible: (identifier, source) => {
    if (!identifier) return false;

    const { definitions, collected } = get();

    // Match definition by _id or slug
    const target = definitions.find(
      (d) => d._id === identifier || d.slug === identifier || d.id === identifier
    );

    if (!target || !target.enabled || !target.isPublished) {
      return false;
    }

    const canonicalId = target._id || target.id || identifier;

    // Check if already collected
    if (collectibleStorage.isCollected(canonicalId, { version: 1, collected })) {
      return false;
    }

    // Persist to localStorage
    const { updated, isNew } = collectibleStorage.saveCollectedItem(canonicalId, target.slug);
    if (!isNew) return false;

    set({
      collected: updated.collected,
      activeCelebration: target,
    });

    // Semantic events for Phase 10 / telemetry
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("COLLECTIBLE_FOUND", {
          detail: {
            collectible: target,
            source: source || target.source,
            collectedAt: new Date().toISOString(),
          },
        })
      );

      const activeTotal = get().getActiveTotal();
      const collectedCount = get().getCollectedCount();

      window.dispatchEvent(
        new CustomEvent("COLLECTION_PROGRESS_CHANGED", {
          detail: { collectedCount, activeTotal },
        })
      );

      if (collectedCount >= activeTotal && activeTotal > 0) {
        window.dispatchEvent(
          new CustomEvent("COLLECTION_COMPLETE", {
            detail: { total: activeTotal },
          })
        );
      }
    }

    return true;
  },

  dismissCelebration: () => {
    set({ activeCelebration: null });
  },

  openBook: (itemId) => {
    const { definitions, collected, selectedBookItemId } = get();
    const activeItems = definitions.filter((d) => d.enabled && d.isPublished);

    let nextSelected: string | null = itemId || null;
    if (!nextSelected) {
      // Prefer currently selected if still valid, otherwise first collected, otherwise first active item
      if (selectedBookItemId && activeItems.some((d) => d._id === selectedBookItemId)) {
        nextSelected = selectedBookItemId;
      } else {
        const firstCollected = activeItems.find((d) => collected[d._id]);
        nextSelected = firstCollected?._id || activeItems[0]?._id || null;
      }
    }

    set({ bookOpen: true, selectedBookItemId: nextSelected });
  },

  closeBook: () => {
    set({ bookOpen: false });
  },

  selectBookItem: (itemId) => {
    set({ selectedBookItemId: itemId });
  },

  resetProgress: () => {
    collectibleStorage.resetProgress();
    set({ collected: {}, activeCelebration: null });
  },

  getActiveTotal: () => {
    const { definitions } = get();
    return definitions.filter((d) => d.enabled && d.isPublished).length;
  },

  getCollectedCount: () => {
    const { definitions, collected } = get();
    // Count only active & published items that have been collected (safely handles unpublished items)
    return definitions.filter(
      (d) => d.enabled && d.isPublished && Boolean(collected[d._id])
    ).length;
  },

  isItemCollected: (idOrSlug) => {
    if (!idOrSlug) return false;
    const { collected } = get();
    if (collected[idOrSlug]) return true;
    return Object.values(collected).some(
      (rec) => rec.id === idOrSlug || rec.slug === idOrSlug
    );
  },
}));
