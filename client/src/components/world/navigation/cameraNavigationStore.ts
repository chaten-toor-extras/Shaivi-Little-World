import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import * as THREE from "three";
import { create } from "zustand";

interface CameraNavigationState {
  hasUserNavigated: boolean;
  savedExplorationPose: {
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null;
  resetCounter: number;
  isCinematicActive: boolean;
  setHasUserNavigated: (v: boolean) => void;
  saveExplorationPose: (position: THREE.Vector3, target: THREE.Vector3) => void;
  clearExplorationPose: () => void;
  triggerResetView: () => void;
  setIsCinematicActive: (v: boolean) => void;
}

/**
 * Runtime memory store for free camera exploration state.
 * Never persists camera positions to localStorage or backend.
 */
export const useCameraNavigationStore = create<CameraNavigationState>((set) => ({
  hasUserNavigated: false,
  savedExplorationPose: null,
  resetCounter: 0,
  isCinematicActive: false,
  setHasUserNavigated: (v) => set({ hasUserNavigated: v }),
  saveExplorationPose: (position, target) =>
    set({
      savedExplorationPose: {
        position: position.clone(),
        target: target.clone(),
      },
    }),
  clearExplorationPose: () => set({ savedExplorationPose: null }),
  triggerResetView: () => set((s) => ({ resetCounter: s.resetCounter + 1 })),
  setIsCinematicActive: (isCinematicActive) => set({ isCinematicActive }),
}));

/**
 * Canonical resolver for world camera navigation.
 * Evaluates existing application state across all stores:
 * - Active mode must be WORLD
 * - No programmatic camera transition in flight
 * - No modal secret dialog open
 * - No collection book open
 * - No completion cinematic active
 */
export function canNavigateWorld(): boolean {
  const exp = useExperienceStore.getState();
  const col = useCollectibleStore.getState();
  const nav = useCameraNavigationStore.getState();

  return (
    exp.mode === "WORLD" &&
    !exp.transitioning &&
    !exp.secretOpen &&
    !col.bookOpen &&
    !nav.isCinematicActive
  );
}
