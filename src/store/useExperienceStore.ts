import { create } from "zustand";
import type { Section } from "@/data/portfolio";
export type Mode = "INTRO" | "WORLD" | Section;
type State = {
  mode: Mode;
  transitioning: boolean;
  audio: boolean;
  quality: "HIGH" | "MEDIUM" | "LOW";
  reducedMotion: boolean;
  visited: Section[];
  open: (section: Section) => void;
  close: () => void;
  settle: () => void;
  skip: () => void;
  setAudio: (v: boolean) => void;
  setQuality: (v: State["quality"]) => void;
  setReduced: (v: boolean) => void;
};
export const useExperienceStore = create<State>((set, get) => ({
  mode: "INTRO",
  transitioning: true,
  audio: false,
  quality: "MEDIUM",
  reducedMotion: false,
  visited: [],
  open: (mode) => {
    if (get().transitioning) return;
    set({
      mode,
      transitioning: true,
      visited: [...new Set([...get().visited, mode])],
    });
  },
  close: () => set({ mode: "WORLD", transitioning: true }),
  settle: () => set({ transitioning: false }),
  skip: () => set({ mode: "WORLD", transitioning: true }),
  setAudio: (audio) => set({ audio }),
  setQuality: (quality) => set({ quality }),
  setReduced: (reducedMotion) => set({ reducedMotion }),
}));
