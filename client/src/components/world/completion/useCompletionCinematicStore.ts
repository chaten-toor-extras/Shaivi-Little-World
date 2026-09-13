import { completionCinematicStorage } from "../../../services/completionCinematicStorage";
import { useCameraNavigationStore } from "../navigation/cameraNavigationStore";
import { useMusicStore } from "../../../store/useMusicStore";
import * as THREE from "three";
import { create } from "zustand";

export type CinematicStage =
  | "IDLE"
  | "PREPARING"
  | "PULLBACK"
  | "WORLD_GLOW"
  | "MESSAGE"
  | "RETURNING"
  | "COMPLETE";

export interface PreCinematicPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

interface CompletionCinematicState {
  stage: CinematicStage;
  isReplay: boolean;
  previewMode: boolean;
  hasPlayed: boolean;
  firstPlayedAt?: string;
  lastReplayAt?: string;
  preCinematicPose: PreCinematicPose | null;
  initialVolumeBeforeDuck: number | null;
  userTouchedVolume: boolean;

  setStage: (stage: CinematicStage) => void;
  setPreCinematicPose: (pose: PreCinematicPose | null) => void;
  syncStorage: () => void;
  startCinematic: (isReplay?: boolean, previewMode?: boolean) => void;
  skipCinematic: () => void;
  dismissCinematic: () => void;
  finishCinematic: () => void;
  resetAll: () => void;
}

export const useCompletionCinematicStore = create<CompletionCinematicState>(
  (set, get) => ({
    stage: "IDLE",
    isReplay: false,
    previewMode: false,
    hasPlayed: false,
    firstPlayedAt: undefined,
    lastReplayAt: undefined,
    preCinematicPose: null,
    initialVolumeBeforeDuck: null,
    userTouchedVolume: false,

    setStage: (stage) => {
      const { previewMode, hasPlayed } = get();

      // Constraint 5: Mark hasPlayed when MESSAGE stage is reached
      if (stage === "MESSAGE" && !previewMode && !hasPlayed) {
        const saved = completionCinematicStorage.markPlayed();
        set({
          hasPlayed: true,
          firstPlayedAt: saved.firstPlayedAt,
          lastReplayAt: saved.lastReplayAt,
        });
      }

      set({ stage });
    },

    setPreCinematicPose: (preCinematicPose) => set({ preCinematicPose }),

    syncStorage: () => {
      const data = completionCinematicStorage.load();
      set({
        hasPlayed: data.hasPlayed,
        firstPlayedAt: data.firstPlayedAt,
        lastReplayAt: data.lastReplayAt,
      });
    },

    startCinematic: (isReplay = false, previewMode = false) => {
      const current = get();
      if (current.stage !== "IDLE" && current.stage !== "COMPLETE") return;

      // Establish camera lock: OrbitControls disabled, CameraRig ignored
      useCameraNavigationStore.getState().setIsCinematicActive(true);

      // Audio ducking: gently duck music volume by 0.75x if playing
      const musicState = useMusicStore.getState();
      let initialVol: number | null = null;
      if (musicState.isPlaying && typeof musicState.volume === "number") {
        initialVol = musicState.volume;
        const ducked = Math.round(initialVol * 0.75);
        musicState.setVolume(ducked);
      }

      if (isReplay && !previewMode) {
        const updated = completionCinematicStorage.recordReplay();
        set({
          stage: "PREPARING",
          isReplay: true,
          previewMode,
          lastReplayAt: updated.lastReplayAt,
          initialVolumeBeforeDuck: initialVol,
          userTouchedVolume: false,
        });
      } else {
        set({
          stage: "PREPARING",
          isReplay,
          previewMode,
          initialVolumeBeforeDuck: initialVol,
          userTouchedVolume: false,
        });
      }
    },

    skipCinematic: () => {
      const { previewMode, hasPlayed, stage } = get();

      // Constraint 6: Skipping counts as played for auto-play purposes
      if (!previewMode && !hasPlayed && stage !== "IDLE") {
        const saved = completionCinematicStorage.markPlayed();
        set({
          hasPlayed: true,
          firstPlayedAt: saved.firstPlayedAt,
          lastReplayAt: saved.lastReplayAt,
        });
      }

      // Transition to RETURNING to gracefully ease camera back without abrupt teleport
      set({ stage: "RETURNING" });
    },

    dismissCinematic: () => {
      // Called when user clicks "Continue exploring" on message
      set({ stage: "RETURNING" });
    },

    finishCinematic: () => {
      const { initialVolumeBeforeDuck, userTouchedVolume } = get();

      // Audio volume restoration: restore prior volume only if user didn't manually modify it
      if (initialVolumeBeforeDuck !== null && !userTouchedVolume) {
        const musicState = useMusicStore.getState();
        musicState.setVolume(initialVolumeBeforeDuck);
      }

      // Release camera lock so OrbitControls and CameraRig restore
      useCameraNavigationStore.getState().setIsCinematicActive(false);

      set({
        stage: "IDLE",
        isReplay: false,
        previewMode: false,
        preCinematicPose: null,
        initialVolumeBeforeDuck: null,
        userTouchedVolume: false,
      });
    },

    resetAll: () => {
      useCameraNavigationStore.getState().setIsCinematicActive(false);
      completionCinematicStorage.reset();
      set({
        stage: "IDLE",
        isReplay: false,
        previewMode: false,
        hasPlayed: false,
        firstPlayedAt: undefined,
        lastReplayAt: undefined,
        preCinematicPose: null,
        initialVolumeBeforeDuck: null,
        userTouchedVolume: false,
      });
    },
  })
);
