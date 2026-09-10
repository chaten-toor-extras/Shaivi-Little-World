import { useExperienceStore } from "@/store/useExperienceStore";
import { labels } from "@/data/portfolio";
import { SectionContent } from "./Content";
import FullscreenExperience from "./FullscreenExperience";
export default function SectionOverlay() {
  const { mode, transitioning, close } = useExperienceStore();
  if (mode === "WORLD" || mode === "INTRO" || transitioning) return null;
  return (
    <FullscreenExperience
      title={labels[mode]}
      theme={mode.toLowerCase()}
      onClose={close}
    >
      <SectionContent section={mode} />
    </FullscreenExperience>
  );
}
