"use client";

import type { JourneyMilestone } from "@/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import JourneyStarCard from "./JourneyStarCard";
import TelescopeAccessibleControls from "./TelescopeAccessibleControls";
import styles from "./TelescopeJourney.module.css";
import { getResolvedMilestoneCoords } from "./telescopeUtils";

// Dynamic import for R3F Canvas to ensure clean client-side WebGL mounting
const DynamicTelescopeCanvas = dynamic(() => import("./TelescopeCanvas"), {
  ssr: false,
});

interface TelescopeJourneyProps {
  milestones: JourneyMilestone[];
  onFallback?: () => void;
}

export default function TelescopeJourney({
  milestones,
}: TelescopeJourneyProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cardOpen, setCardOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Detect mobile viewport and reduced-motion preferences
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handleMotionChange = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mql.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mql.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Compute resolved star coordinates
  const resolvedCoords = useMemo(
    () => getResolvedMilestoneCoords(milestones, isMobile),
    [milestones, isMobile],
  );

  const total = milestones.length;
  const safeActiveIndex =
    total > 0 ? Math.max(0, Math.min(total - 1, activeIndex)) : 0;
  const currentMilestone = total > 0 ? milestones[safeActiveIndex] : null;

  const handleSelectStar = useCallback((index: number) => {
    setActiveIndex(index);
    setCardOpen(true);
  }, []);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    setCardOpen(true);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    setCardOpen(true);
  }, [total]);

  // Keyboard navigation across milestones
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
        setCardOpen(true);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(Math.max(0, total - 1));
        setCardOpen(true);
      } else if (e.key === "Escape" && cardOpen) {
        setCardOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, cardOpen, total]);

  return (
    <div className={styles.telescopeContainer}>
      {/* Telescope circular vignette and lens optical reticle */}
      <div className={styles.vignetteOverlay} aria-hidden="true" />
      <div className={styles.reticleFrame} aria-hidden="true" />

      {/* Center Telescope Crosshair Sight */}
      <div className={styles.lensCrosshair} aria-hidden="true">
        <div className={styles.crosshairRing} />
        <div className={styles.crosshairH} />
        <div className={styles.crosshairV} />
      </div>

      {/* Header bar */}
      <header className={styles.telescopeHeader}>
        <div>
          <p className="section-kicker">TELESCOPE VIEW / CONSTELLATION</p>
          <h2 className={styles.headerTitle}>
            Star <em>journey.</em>
          </h2>
        </div>
      </header>

      {/* Floating Left/Right Edge Chevrons for immediate 1-tap star flipping */}
      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.edgeChevron} ${styles.edgeChevronLeft}`}
            onClick={handlePrev}
            aria-label="Previous star"
            title="Previous star"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.edgeChevron} ${styles.edgeChevronRight}`}
            onClick={handleNext}
            aria-label="Next star"
            title="Next star"
          >
            ›
          </button>
        </>
      )}

      {/* Main 3D Canvas / Starfield */}
      {total > 0 ? (
        <>
          <div className={styles.canvasWrapper}>
            <DynamicTelescopeCanvas
              milestoneCoords={resolvedCoords}
              activeIndex={safeActiveIndex}
              hoveredIndex={hoveredIndex}
              onSelectStar={handleSelectStar}
              onHoverStar={setHoveredIndex}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
            />
          </div>

          {/* Accessible HTML interactive layer mirroring stars */}
          <TelescopeAccessibleControls
            coords={resolvedCoords}
            activeIndex={safeActiveIndex}
            hoveredIndex={hoveredIndex}
            onSelectStar={handleSelectStar}
            onHoverStar={setHoveredIndex}
          />

          {/* Active milestone story card */}
          {cardOpen && currentMilestone && (
            <JourneyStarCard
              milestone={currentMilestone}
              currentIndex={safeActiveIndex}
              totalCount={total}
              onPrev={handlePrev}
              onNext={handleNext}
              onClose={() => setCardOpen(false)}
            />
          )}
        </>
      ) : (
        <div className={styles.emptySky}>
          <p>the sky is quiet for now ✦</p>
        </div>
      )}

      {/* Footer navigation controls */}
      {total > 1 && (
        <footer className={styles.telescopeFooter}>
          <div className={styles.navControls}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrev}
              aria-label="Previous star"
            >
              ← Previous Star
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNext}
              aria-label="Next star"
            >
              Next Star →
            </button>
          </div>

          <span className={styles.starCounter} aria-live="polite">
            {String(safeActiveIndex + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>

          <span className={styles.telescopeHint}>
            Swipe or drag to explore the stars. Tap any star to focus.
          </span>
        </footer>
      )}
    </div>
  );
}
