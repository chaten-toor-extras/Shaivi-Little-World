"use client";

import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import React, { useEffect, useState } from "react";
import styles from "./CollectibleHUD.module.css";

export default function CollectibleHUD() {
  const [mounted, setMounted] = useState(false);
  const mode = useExperienceStore((s) => s.mode);
  const loadLocalProgress = useCollectibleStore((s) => s.loadLocalProgress);
  const collected = useCollectibleStore((s) => s.collected);
  const getActiveTotal = useCollectibleStore((s) => s.getActiveTotal);
  const getCollectedCount = useCollectibleStore((s) => s.getCollectedCount);
  const openBook = useCollectibleStore((s) => s.openBook);

  useEffect(() => {
    setMounted(true);
    loadLocalProgress();
  }, [loadLocalProgress]);

  if (!mounted) return null;

  const collectedCount = getCollectedCount();
  const activeTotal = getActiveTotal();

  // HIDDEN UNTIL FIRST COLLECTIBLE IS FOUND (Preserves mystery per spec)
  if (collectedCount === 0 || activeTotal === 0) {
    return null;
  }

  // Only render during 3D World or main browsing (not during full intro)
  if (mode === "INTRO") return null;

  return (
    <div className={styles.hudContainer}>
      <button
        type="button"
        className={styles.hudButton}
        onClick={() => openBook()}
        aria-label={`Open Keepsakes Collection: ${collectedCount} of ${activeTotal} found`}
        title="View your discovered keepsakes"
      >
        <span className={styles.hudSparkle}>✦</span>
        <span className={styles.hudCount}>
          {collectedCount} / {activeTotal}
        </span>
        <span className={styles.hudLabel}>keepsakes</span>
      </button>
    </div>
  );
}

