import type { Song } from "@/types";
import { create } from "zustand";
import { useExperienceStore } from "./useExperienceStore";

export interface MusicState {
  playlist: Song[];
  currentIndex: number;
  activeMoodId: string | null;
  activeSongId: string | null;
  worldMoodActivated: boolean;
  worldMoodEffectsEnabled: boolean;
  isPlaying: boolean;
  volume: number; // 0 to 100
  currentTime: number;
  duration: number;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage: string | null;
  seekTarget: number | null;

  setPlaylist: (playlist: Song[], startIndex?: number) => void;
  setCurrentIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  clearSeekTarget: () => void;
  selectMood: (moodId: string) => void;
  setActiveMoodId: (moodId: string | null) => void;
  setWorldMoodActivated: (activated: boolean) => void;
  resetWorldMood: () => void;
  setWorldMoodEffectsEnabled: (enabled: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveSongId: (songId: string | null) => void;
  setVolume: (volume: number) => void;
  setTime: (currentTime: number, duration?: number) => void;
  setPlaybackStatus: (status: {
    isLoading?: boolean;
    isBuffering?: boolean;
    hasError?: boolean;
    errorMessage?: string | null;
  }) => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  playlist: [],
  currentIndex: 0,
  activeMoodId: null,
  activeSongId: null,
  worldMoodActivated: false,
  worldMoodEffectsEnabled: true,
  isPlaying: false,
  volume: 70,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  isBuffering: false,
  hasError: false,
  errorMessage: null,
  seekTarget: null,

  setPlaylist: (playlist, startIndex) => {
    set((state) => ({
      playlist,
      currentIndex:
        startIndex !== undefined
          ? startIndex
          : Math.min(state.currentIndex, Math.max(0, playlist.length - 1)),
      activeSongId:
        startIndex !== undefined && playlist[startIndex]
          ? playlist[startIndex]._id
          : state.activeSongId,
    }));
  },

  setCurrentIndex: (index) => {
    const playlist = get().playlist;
    const safeIdx =
      playlist.length > 0 ? (index + playlist.length) % playlist.length : 0;
    const song = playlist[safeIdx];
    set({
      currentIndex: safeIdx,
      activeSongId: song?._id || null,
      currentTime: 0,
      hasError: false,
      errorMessage: null,
    });
  },

  play: () => {
    // Automatically turn on global audio so footer sound button reflects "Sound on"
    try {
      useExperienceStore.getState().setAudio(true);
    } catch {
      // Ignore
    }
    set({ isPlaying: true, hasError: false, errorMessage: null });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  togglePlay: () => {
    if (get().isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  nextTrack: () => {
    const { playlist, currentIndex } = get();
    if (playlist.length > 0) {
      get().setCurrentIndex((currentIndex + 1) % playlist.length);
    }
  },

  prevTrack: () => {
    const { playlist, currentIndex } = get();
    if (playlist.length > 0) {
      get().setCurrentIndex(
        (currentIndex - 1 + playlist.length) % playlist.length,
      );
    }
  },

  seek: (seconds) => {
    set({ currentTime: seconds, seekTarget: seconds });
  },

  clearSeekTarget: () => {
    set({ seekTarget: null });
  },

  setPlaybackStatus: (status) => {
    set((state) => ({
      isLoading:
        status.isLoading !== undefined ? status.isLoading : state.isLoading,
      isBuffering:
        status.isBuffering !== undefined
          ? status.isBuffering
          : state.isBuffering,
      hasError:
        status.hasError !== undefined ? status.hasError : state.hasError,
      errorMessage:
        status.errorMessage !== undefined
          ? status.errorMessage
          : state.errorMessage,
    }));
  },

  selectMood: (moodId: string) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("shaivi-active-mood", moodId);
      }
    } catch {
      // Ignore localStorage errors
    }
    set({
      activeMoodId: moodId,
      worldMoodActivated: true,
    });
  },

  setActiveMoodId: (activeMoodId) => set({ activeMoodId }),

  setWorldMoodActivated: (worldMoodActivated) => set({ worldMoodActivated }),

  resetWorldMood: () => {
    set({ worldMoodActivated: false });
  },

  setWorldMoodEffectsEnabled: (worldMoodEffectsEnabled) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "shaivi-music-world-effect",
          worldMoodEffectsEnabled ? "true" : "false",
        );
      }
    } catch {
      // Ignore localStorage errors
    }
    set({ worldMoodEffectsEnabled });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setActiveSongId: (activeSongId) => set({ activeSongId }),

  setVolume: (volume) => set({ volume }),

  setTime: (currentTime, duration) =>
    set((state) => ({
      currentTime,
      duration: duration !== undefined ? duration : state.duration,
    })),
}));
