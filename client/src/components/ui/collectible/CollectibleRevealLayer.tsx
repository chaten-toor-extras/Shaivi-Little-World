"use client";

import CollectiblePreviewCanvas from "@/components/world/collectibles/CollectiblePreviewCanvas";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useSecretStore } from "@/store/useSecretStore";
import React, { useEffect, useRef } from "react";
import styles from "./CollectibleReveal.module.css";

export default function CollectibleRevealLayer() {
  const activeCelebration = useCollectibleStore((s) => s.activeCelebration);
  const dismissCelebration = useCollectibleStore((s) => s.dismissCelebration);
  const openBook = useCollectibleStore((s) => s.openBook);

  // Queue safety check: do not fight for focus if SecretRevealLayer is currently active
  const activeSecretReveal = useSecretStore((s) => s.activeReveal);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!activeCelebration || activeSecretReveal) return;

    timerRef.current = setTimeout(() => {
      dismissCelebration();
    }, 8000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeCelebration, activeSecretReveal, dismissCelebration]);

  // Escape key handler
  useEffect(() => {
    if (!activeCelebration || activeSecretReveal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismissCelebration();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCelebration, activeSecretReveal, dismissCelebration]);

  // If secret modal is currently open, wait until it dismisses before showing collectible celebration
  if (!activeCelebration || activeSecretReveal) {
    return null;
  }

  const handleOpenBook = () => {
    dismissCelebration();
    openBook(activeCelebration._id);
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`You discovered ${activeCelebration.name}`}
      onClick={dismissCelebration}
    >
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.kicker}>
          <span className={styles.kickerIcon}>✦</span>
          <span>A Little Discovery</span>
        </div>

        {/* 3D Preview */}
        <div className={styles.previewContainer}>
          <CollectiblePreviewCanvas
            modelKey={activeCelebration.model?.modelKey}
            scalePreset="FEATURED"
            rotationPreset={activeCelebration.model?.rotationPreset}
            glowColor={activeCelebration.appearance?.glowColor}
            accentColor={activeCelebration.appearance?.accentColor}
          />
        </div>

        <h3 className={styles.title}>{activeCelebration.name}</h3>

        <div className={styles.categoryTag}>
          {activeCelebration.category} · {activeCelebration.rarity}
        </div>

        {activeCelebration.description && (
          <p className={styles.description}>{activeCelebration.description}</p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.continueBtn}
            onClick={dismissCelebration}
          >
            Keep Exploring ✦
          </button>
          <button
            type="button"
            className={styles.bookBtn}
            onClick={handleOpenBook}
          >
            View Keepsakes
          </button>
        </div>
      </div>
    </div>
  );
}

