"use client";

import { labels } from "@/data/portfolio";
import { useSiteSettings } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import { SectionContent } from "./Content";
import FullscreenExperience from "./FullscreenExperience";

export default function SectionOverlay({ inWorldQuotes = false }: { inWorldQuotes?: boolean }) {
  const { mode, transitioning, close } = useExperienceStore();
  const site = useSiteSettings();

  if (mode === "WORLD" || mode === "INTRO" || transitioning) return null;
  if (mode === "QUOTES" && inWorldQuotes) return null;

  const title = site?.sectionLabels?.[mode] || labels[mode];

  return (
    <FullscreenExperience
      title={title}
      theme={mode.toLowerCase()}
      onClose={close}
    >
      <SectionContent section={mode} />
    </FullscreenExperience>
  );
}
