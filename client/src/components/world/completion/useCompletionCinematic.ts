"use client";

import { useWorldProgress } from "@/hooks/useWorldProgress";
import { useWorldSettings } from "@/providers/ContentProvider";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useSecretStore } from "@/store/useSecretStore";
import { useEffect, useRef } from "react";
import {
  canStartCompletionCinematic,
  type CompletionTriggerContext,
} from "./completionResolver";
import { useCompletionCinematicStore } from "./useCompletionCinematicStore";

export function useCompletionCinematic(sceneReady: boolean = true) {
  const worldSettings = useWorldSettings();
  const { completionEligible, isHydrated } = useWorldProgress();

  const mode = useExperienceStore((s) => s.mode);
  const transitioning = useExperienceStore((s) => s.transitioning);
  const secretOpen = useExperienceStore((s) => s.secretOpen);
  const bookOpen = useCollectibleStore((s) => s.bookOpen);
  const activeCelebration = useCollectibleStore((s) => Boolean(s.activeCelebration));
  const activeReveal = useSecretStore((s) => Boolean(s.activeReveal));

  const stage = useCompletionCinematicStore((s) => s.stage);
  const isReplay = useCompletionCinematicStore((s) => s.isReplay);
  const hasPlayed = useCompletionCinematicStore((s) => s.hasPlayed);
  const syncStorage = useCompletionCinematicStore((s) => s.syncStorage);
  const startCinematic = useCompletionCinematicStore((s) => s.startCinematic);
  const skipCinematic = useCompletionCinematicStore((s) => s.skipCinematic);
  const dismissCinematic = useCompletionCinematicStore((s) => s.dismissCinematic);
  const setStage = useCompletionCinematicStore((s) => s.setStage);

  // Sync initial storage on mount
  useEffect(() => {
    syncStorage();
  }, [syncStorage]);

  // Feature flags
  const featureFlagEnabled =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_COMPLETION_CINEMATIC_ENABLED !== "false";
  const cmsEnabled = worldSettings.completion?.enabled ?? true;
  const cmsAutoPlayEnabled =
    (worldSettings.completion as any)?.autoPlayEnabled ??
    (worldSettings.completion as any)?.autoPlayOnce ??
    true;

  const triggerContext: CompletionTriggerContext = {
    completionEligible,
    hasPlayed,
    isReplay: false,
    mode,
    transitioning,
    secretOpen,
    bookOpen,
    activeCelebration,
    activeReveal,
    menuOpen: false,
    isHydrated,
    sceneReady,
    featureFlagEnabled,
    cmsEnabled,
    cmsAutoPlayEnabled,
  };

  const isEligibleToStart = canStartCompletionCinematic(triggerContext);
  const autoTriggerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play trigger effect with 2.0s quiet idle debounce
  useEffect(() => {
    if (stage !== "IDLE") {
      if (autoTriggerTimerRef.current) {
        clearTimeout(autoTriggerTimerRef.current);
        autoTriggerTimerRef.current = null;
      }
      return;
    }

    if (isEligibleToStart) {
      if (!autoTriggerTimerRef.current) {
        autoTriggerTimerRef.current = setTimeout(() => {
          autoTriggerTimerRef.current = null;
          // Re-verify before starting
          if (canStartCompletionCinematic(triggerContext)) {
            startCinematic(false);
          }
        }, 2000);
      }
    } else {
      if (autoTriggerTimerRef.current) {
        clearTimeout(autoTriggerTimerRef.current);
        autoTriggerTimerRef.current = null;
      }
    }

    return () => {
      if (autoTriggerTimerRef.current) {
        clearTimeout(autoTriggerTimerRef.current);
        autoTriggerTimerRef.current = null;
      }
    };
  }, [
    isEligibleToStart,
    stage,
    startCinematic,
    completionEligible,
    hasPlayed,
    mode,
    transitioning,
    secretOpen,
    bookOpen,
    activeCelebration,
    activeReveal,
  ]);

  // Tab visibility change handler: prevent warped GSAP animations if tab was backgrounded
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentStage = useCompletionCinematicStore.getState().stage;
        if (currentStage === "PULLBACK" || currentStage === "WORLD_GLOW") {
          // Tab was in background during motion; jump cleanly to message state
          setStage("MESSAGE");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setStage]);

  return {
    stage,
    isCinematicActive: stage !== "IDLE",
    hasPlayed,
    isReplay,
    startCinematic,
    skipCinematic,
    dismissCinematic,
  };
}

