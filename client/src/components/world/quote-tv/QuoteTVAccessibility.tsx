"use client";

import { useEffect, useRef } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useQuoteTV } from "./QuoteTVContext";
import styles from "./QuoteTV3D.module.css";

export default function QuoteTVAccessibility({ menuOpen }: { menuOpen: boolean }) {
  const tv = useQuoteTV();
  const close = useExperienceStore((s) => s.close);
  const back = useRef<HTMLButtonElement>(null);
  const focused = !!tv?.focused;
  useEffect(() => {
    if (!focused) return;
    const before = document.activeElement as HTMLElement | null;
    back.current?.focus({ preventScroll: true });
    return () => {
      if (before?.isConnected) before.focus({ preventScroll: true });
      else document.querySelector<HTMLButtonElement>(".index-button")?.focus();
    };
  }, [focused]);
  useEffect(() => {
    if (!tv?.focused || menuOpen) return;
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      const target = event.target as HTMLElement;
      if (!tv.interactive || target.closest("input,textarea,select,[contenteditable=true]")) return;
      if (event.key === "ArrowLeft" && tv.canTune) { event.preventDefault(); tv.previous(); }
      if (event.key === "ArrowRight" && tv.canTune) { event.preventDefault(); tv.next(); }
      if (event.key.toLowerCase() === "p" || (event.key === " " && !target.closest("button,summary,a"))) {
        event.preventDefault(); tv.toggle();
      }
      if (event.key === "ArrowDown" && tv.on && tv.pages.length > 1) { event.preventDefault(); tv.turnPage(tv.pages.length); }
    };
    // Existing modal handlers run on document first; the menu has first refusal.
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [tv, menuOpen, close]);
  if (!tv?.focused) return null;
  return <div className={styles.controls} aria-label="Quote television controls" role="region" hidden={menuOpen}>
    <button ref={back} onClick={close}>← Back to world</button>
      <div className={styles.keyboardControls}>
        <button disabled={!tv.canTune} onClick={tv.previous} aria-label="Previous quote">Previous</button>
        <button disabled={!tv.interactive} onClick={tv.toggle} aria-pressed={tv.on} aria-label={tv.on ? "Turn television off" : "Turn television on"}>Power</button>
        <button disabled={!tv.canTune} onClick={tv.next} aria-label="Next quote">Next</button>
        {tv.pages.length > 1 && <button disabled={!tv.interactive || !tv.on} onClick={() => tv.turnPage(tv.pages.length)}>Next page ({tv.page + 1}/{tv.pages.length})</button>}
      </div>
    <span className={styles.announcement} aria-live="polite" aria-atomic="true">
      {tv.power === "ON" && !tv.isLoading ? tv.quote ? `${tv.quote.text}${tv.quote.author ? ` — ${tv.quote.author}` : ""}` : "Nothing on air yet." : ""}
    </span>
  </div>;
}
