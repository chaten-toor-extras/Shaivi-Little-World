"use client";

import { useSecrets } from "@/providers/ContentProvider";
import { secretEventBus } from "@/services/secretEventBus";
import { SecretEngineCore } from "@/services/secretEngineCore";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useMusicStore } from "@/store/useMusicStore";
import { useSecretStore } from "@/store/useSecretStore";
import { useEffect, useRef } from "react";

export function useSecretEngine(): void {
  const publicSecrets = useSecrets();
  const setDefinitions = useSecretStore((s) => s.setDefinitions);
  const loadLocalProgress = useSecretStore((s) => s.loadLocalProgress);
  const recordDiscovery = useSecretStore((s) => s.recordDiscovery);
  const enqueueReveal = useSecretStore((s) => s.enqueueReveal);

  const engineRef = useRef<SecretEngineCore | null>(null);

  // Initialize engine instance once
  if (engineRef.current == null) {
    engineRef.current = new SecretEngineCore({
      onDiscover: (slug, secretId) => {
        recordDiscovery(slug, secretId);
      },
      onReveal: (reveal, meta) => {
        enqueueReveal(reveal, meta);

        // Phase 9: Grant linked collectible reward if specified
        if (reveal.collectibleId || reveal.type === "COLLECTIBLE") {
          const collectibleId = reveal.collectibleId;
          if (collectibleId) {
            useCollectibleStore.getState().grantCollectible(collectibleId, "SECRET");
          }
        }
      },
      getRuntimeContext: () => {
        const exp = useExperienceStore.getState();
        const music = useMusicStore.getState();
        const secret = useSecretStore.getState();

        return {
          timeOfDay: exp.currentTimeOfDay,
          activeMoodId: music.activeMoodId,
          visitedSections: exp.visited,
          letterSent: secret.letterSentSession,
          journeyViewed: secret.journeyViewedSession,
        };
      },
      getDiscovered: () => {
        return useSecretStore.getState().discovered;
      },
    });
  }

  // Initial load of local storage progress
  useEffect(() => {
    loadLocalProgress();
  }, [loadLocalProgress]);

  // Update engine definitions when public secrets load or change
  useEffect(() => {
    if (publicSecrets && publicSecrets.length > 0) {
      setDefinitions(publicSecrets);
      engineRef.current?.setDefinitions(publicSecrets);
    }
  }, [publicSecrets, setDefinitions]);

  // Subscribe to secret event bus
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const unsubscribe = secretEventBus.subscribe((event) => {
      engine.processEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
