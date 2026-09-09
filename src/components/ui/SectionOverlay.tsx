import { useEffect, useRef } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { labels } from "@/data/portfolio";
import { SectionContent } from "./Content";
export default function SectionOverlay({ flat = false }: { flat?: boolean }) {
  const { mode, transitioning, close } = useExperienceStore();
  const ref = useRef<HTMLDivElement>(null);
  const active = mode !== "WORLD" && mode !== "INTRO" && !transitioning;
  const monitor = mode === "PROJECTS" && !flat;
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const selector = 'button,a[href],[tabindex="0"]';
        const monitorRoot = monitor
          ? document.getElementById("monitor-content")
          : null;
        const nodes = [
          ...Array.from(
            ref.current?.querySelectorAll<HTMLElement>(selector) || [],
          ),
          ...Array.from(
            monitorRoot?.querySelectorAll<HTMLElement>(selector) || [],
          ),
        ];
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        const index = nodes.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        if (index >= 0)
          nodes[
            (index + (e.shiftKey ? nodes.length - 1 : 1)) % nodes.length
          ]?.focus();
        else (e.shiftKey ? last : first)?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      if (previous?.isConnected) previous.focus();
      else document.querySelector<HTMLButtonElement>(".index-button")?.focus();
    };
  }, [active, close, monitor]);
  if (!active) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-owns={monitor ? "monitor-content" : undefined}
      aria-label={labels[mode]}
      className={`section-shell ${mode.toLowerCase()} ${monitor ? "screen-mode" : ""}`}
    >
      <button className="back-world" onClick={close}>
        ← Back to the world <kbd>esc</kbd>
      </button>
      {!monitor && (
        <article className="section-paper">
          <SectionContent key={mode} section={mode} />
        </article>
      )}
      {monitor && (
        <p className="monitor-hint">A few things from the creative desktop.</p>
      )}
    </div>
  );
}
