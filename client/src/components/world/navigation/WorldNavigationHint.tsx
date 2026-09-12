"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import React, { useEffect, useState } from "react";
import styles from "./WorldNavigation.module.css";
import { useCameraNavigationStore } from "./cameraNavigationStore";

const STORAGE_KEY = "shaivi-world-controls-hint-seen-v1";

export default function WorldNavigationHint() {
  const mode = useExperienceStore((s) => s.mode);
  const transitioning = useExperienceStore((s) => s.transitioning);
  const hasUserNavigated = useCameraNavigationStore(
    (s) => s.hasUserNavigated
  );

  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect mobile touch
    const mobile =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 680;
    setIsMobile(mobile);

    // Check if already seen
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Delay display slightly so it appears gracefully after world ready
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);

      // Auto-dismiss after 5.5 seconds
      const dismissTimer = setTimeout(() => {
        setVisible(false);
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {
          // ignore localStorage error
        }
      }, 5500);

      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, []);

  // Dismiss immediately when user actively explores
  useEffect(() => {
    if (hasUserNavigated && visible) {
      setVisible(false);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // ignore localStorage error
      }
    }
  }, [hasUserNavigated, visible]);

  if (!visible || mode !== "WORLD" || transitioning) return null;

  return (
    <div className={styles.hintBanner} role="status" aria-live="polite">
      <span className={styles.hintIcon}>✧</span>
      <span>
        {isMobile
          ? "Drag to look around · Pinch to zoom"
          : "Drag to look around · Scroll to zoom"}
      </span>
    </div>
  );
}

