"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useExperienceStore } from "@/store/useExperienceStore";
export default function FullscreenExperience({
  title,
  theme,
  onClose,
  children,
}: {
  title: string;
  theme: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const [leaving, setLeaving] = useState(false);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const page = document.querySelector<HTMLElement>("main.experience");
    if (page) page.inert = true;
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setLeaving(true);
      }
      if (e.key === "Tab") {
        const nodes = Array.from(
          root.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]),a[href],input,textarea,select,[tabindex="0"]',
          ) || [],
        ).filter((n) => n.getClientRects().length);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !root.current?.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      if (page) page.inert = false;
      document.removeEventListener("keydown", key);
      if (before?.isConnected) before.focus();
      else document.querySelector<HTMLButtonElement>(".index-button")?.focus();
    };
  }, []);
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => closeRef.current(), reduced ? 0 : 260);
    return () => clearTimeout(t);
  }, [leaving, reduced]);
  return createPortal(
    <div
      className={`immersive-backdrop theme-${theme} ${leaving ? "is-leaving" : ""}`}
      data-reduced-motion={reduced}
    >
      <div
        ref={root}
        className="immersive-surface"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="experience-bar">
          <span>
            SHAIVI’S LITTLE WORLD <b>/ {title}</b>
          </span>
          <button
            className="return-world"
            onClick={() => setLeaving(true)}
            aria-label={`Close ${title}`}
          >
            Back to the island <span>×</span>
          </button>
        </div>
        <div className="immersive-content">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
