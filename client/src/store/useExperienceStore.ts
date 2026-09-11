import type { Section } from "@/data/portfolio";
import type { TimeOfDay, TimeOfDayOverride } from "@/types/world";
import { create } from "zustand";

export type Mode = "INTRO" | "WORLD" | Section;

type State = {
  mode: Mode;
  transitioning: boolean;
  audio: boolean;
  quality: "HIGH" | "MEDIUM" | "LOW";
  reducedMotion: boolean;
  visited: Section[];
  secretOpen: boolean;
  timeOfDayOverride: TimeOfDayOverride;
  currentTimeOfDay: TimeOfDay;
  open: (section: Section) => void;
  close: () => void;
  settle: () => void;
  skip: () => void;
  openSecret: () => void;
  closeSecret: () => void;
  setAudio: (v: boolean) => void;
  setQuality: (v: State["quality"]) => void;
  setReduced: (v: boolean) => void;
  setTimeOfDayOverride: (v: TimeOfDayOverride) => void;
  setCurrentTimeOfDay: (v: TimeOfDay) => void;
};

export const useExperienceStore = create<State>((set, get) => ({
  mode: "INTRO",
  transitioning: true,
  audio: false,
  quality: "MEDIUM",
  reducedMotion: false,
  visited: [],
  secretOpen: false,
  timeOfDayOverride: "AUTO",
  currentTimeOfDay: "DAY",
  open: (mode) => {
    if (get().transitioning) return;
    set({
      mode,
      transitioning: true,
      visited: [...new Set([...get().visited, mode])],
      secretOpen: false,
    });
  },
  close: () => set({ mode: "WORLD", transitioning: true, secretOpen: false }),
  settle: () => set({ transitioning: false }),
  skip: () => set({ mode: "WORLD", transitioning: true }),
  openSecret: () => set({ secretOpen: true }),
  closeSecret: () => set({ secretOpen: false }),
  setAudio: (audio) => set({ audio }),
  setQuality: (quality) => set({ quality }),
  setReduced: (reducedMotion) => set({ reducedMotion }),
  setTimeOfDayOverride: (timeOfDayOverride) => {
    try {
      if (typeof window !== "undefined") {
        if (timeOfDayOverride === "AUTO") {
          localStorage.removeItem("shaivi-time-mode");
        } else {
          localStorage.setItem("shaivi-time-mode", timeOfDayOverride);
        }
      }
    } catch {
      // Ignore localStorage access errors
    }
    set({ timeOfDayOverride });
  },
  setCurrentTimeOfDay: (currentTimeOfDay) => set({ currentTimeOfDay }),
}));
