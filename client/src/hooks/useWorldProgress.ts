"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Section } from "@/data/portfolio";
import {
  resolveWorldProgress,
  type WorldEvolutionEffectId,
  type WorldEvolutionState,
  type WorldProgressInput,
} from "@/data/worldEvolutionRules";
import {
  worldProgressStorage,
  type WorldProgressStorageData,
} from "@/services/worldProgressStorage";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useSecretStore } from "@/store/useSecretStore";

const EMPTY_STATE: WorldEvolutionState = {
  visitedCount: 0,
  visitedRatio: 0,
  secretCount: 0,
  secretRatio: 0,
  collectibleCount: 0,
  collectibleRatio: 0,
  overallProgress: 0,
  stage: "QUIET",
  completionEligible: false,
  effects: {
    GALLERY_PALETTE: false,
    GALLERY_SKETCH: false,
    TELESCOPE_STARS: false,
    TELESCOPE_LENS: false,
    MAILBOX_FLAG: false,
    MAILBOX_LETTER: false,
    MUSIC_CHARM: false,
    QUOTE_NOTE: false,
    SECRET_MEADOW_FLOWER: false,
    SECRET_FIREFLIES: false,
    COLLECTIBLE_VIOLETS: false,
    COLLECTIBLE_BENCH_STAR: false,
    COLLECTIBLE_POND_LILIES: false,
    COLLECTIBLE_HARMONY: false,
    COMPANION_BUTTERFLY: false,
  },
};

// Global development-only simulator state (memory only, never touches localStorage)
let devSimulationRatio: number | null = null;
const devListeners = new Set<() => void>();

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as any).__simulateWorldProgress = (ratio: number | null) => {
    devSimulationRatio =
      typeof ratio === "number" ? Math.max(0, Math.min(1, ratio)) : null;
    console.log(
      `[WorldProgress] Simulated progress set to: ${
        devSimulationRatio === null ? "OFF (real progress)" : devSimulationRatio
      }`
    );
    devListeners.forEach((fn) => fn());
  };
}

export function useWorldProgress(): WorldEvolutionState & {
  isHydrated: boolean;
  isNewlyUnlocked: (effectId: WorldEvolutionEffectId) => boolean;
} {
  // Feature flag check (safe rollback)
  const isEnabled =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_WORLD_EVOLUTION_ENABLED !== "false";

  // Reactive store selectors
  const sessionVisited = useExperienceStore((s) => s.visited);
  const secretDiscovered = useSecretStore((s) => s.discovered);
  const secretDefinitions = useSecretStore((s) => s.definitions);
  const collectibleCollected = useCollectibleStore((s) => s.collected);
  const collectibleDefinitions = useCollectibleStore((s) => s.definitions);

  // Local storage state
  const [storageData, setStorageData] = useState<WorldProgressStorageData>(() =>
    worldProgressStorage.loadProgress()
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [, setDevTick] = useState(0);

  // Subscribe to storage changes
  useEffect(() => {
    setIsHydrated(true);
    setStorageData(worldProgressStorage.loadProgress());
    const unsub = worldProgressStorage.subscribe((data) => {
      setStorageData(data);
    });
    return unsub;
  }, []);

  // Subscribe to dev simulator in dev mode
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const update = () => setDevTick((t) => t + 1);
    devListeners.add(update);
    return () => {
      devListeners.delete(update);
    };
  }, []);

  // Track initial unlocked set on hydration vs newly unlocked in current session
  const initialUnlockedRef = useRef<Set<WorldEvolutionEffectId> | null>(null);

  const resolvedState = useMemo(() => {
    if (!isEnabled) {
      return EMPTY_STATE;
    }

    // If dev simulator is active, generate simulated input matching the ratio
    if (devSimulationRatio !== null) {
      const r = devSimulationRatio;
      const allSections: Section[] = [
        "ABOUT",
        "QUOTES",
        "GALLERY",
        "JOURNEY",
        "CONTACT",
        "MUSIC",
      ];
      const simVisited = allSections.slice(0, Math.round(r * 6));
      return resolveWorldProgress({
        visitedSections: simVisited,
        discoveredSecretCount: Math.round(r * 6),
        totalActiveSecrets: 6,
        collectedItemCount: Math.round(r * 8),
        totalActiveCollectibles: 8,
        letterSent: r >= 0.4,
        journeyExplored: r >= 0.3,
        musicPlayed: r >= 0.2,
        quoteInteracted: r >= 0.2,
      });
    }

    // Merge persistent visited sections with session-visited sections
    const combinedVisited: Section[] = Array.from(
      new Set([...storageData.visitedSections, ...sessionVisited])
    );

    // Active published secrets count
    const activeSecrets = secretDefinitions.filter(
      (s) => s.enabled !== false && s.isPublished !== false
    );
    const totalActiveSecrets = activeSecrets.length;

    // Count how many discovered secrets are currently published/enabled
    const discoveredSecretCount = Object.keys(secretDiscovered).filter(
      (idOrSlug) =>
        activeSecrets.some(
          (s) => s._id === idOrSlug || s.slug === idOrSlug || s.id === idOrSlug
        )
    ).length;

    // Active published collectibles count
    const activeCollectibles = collectibleDefinitions.filter(
      (c) => c.enabled !== false && c.isPublished !== false
    );
    const totalActiveCollectibles = activeCollectibles.length;

    // Count how many collected items are currently published/enabled
    const collectedItemCount = Object.keys(collectibleCollected).filter(
      (idOrSlug) =>
        activeCollectibles.some(
          (c) => c._id === idOrSlug || c.slug === idOrSlug || c.id === idOrSlug
        )
    ).length;

    const input: WorldProgressInput = {
      visitedSections: combinedVisited,
      discoveredSecretCount,
      totalActiveSecrets,
      collectedItemCount,
      totalActiveCollectibles,
      letterSent: storageData.letterSent,
      journeyExplored: storageData.journeyExplored,
      musicPlayed: storageData.musicPlayed,
      quoteInteracted: storageData.quoteInteracted,
    };

    return resolveWorldProgress(input);
  }, [
    isEnabled,
    storageData,
    sessionVisited,
    secretDiscovered,
    secretDefinitions,
    collectibleCollected,
    collectibleDefinitions,
  ]);

  // Record initial unlocked set on first hydration
  useEffect(() => {
    if (isHydrated && initialUnlockedRef.current === null) {
      const initialSet = new Set<WorldEvolutionEffectId>();
      for (const [key, value] of Object.entries(resolvedState.effects)) {
        if (value) initialSet.add(key as WorldEvolutionEffectId);
      }
      initialUnlockedRef.current = initialSet;
    }
  }, [isHydrated, resolvedState.effects]);

  const isNewlyUnlocked = (effectId: WorldEvolutionEffectId): boolean => {
    if (!initialUnlockedRef.current) return false;
    return (
      Boolean(resolvedState.effects[effectId]) &&
      !initialUnlockedRef.current.has(effectId)
    );
  };

  return {
    ...resolvedState,
    isHydrated,
    isNewlyUnlocked,
  };
}

