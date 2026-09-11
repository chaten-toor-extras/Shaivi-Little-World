"use client";

import Photo from "@/components/ui/Photo";
import type { JourneyMilestone } from "@/types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./JourneyStarCard.module.css";

interface JourneyStarCardProps {
  milestone: JourneyMilestone | null;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function JourneyStarCard({
  milestone,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  onClose,
}: JourneyStarCardProps) {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);
  const touchViewerX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation when fullscreen viewer is open
  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsViewerOpen(false);
      } else if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "ArrowRight") {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewerOpen, onPrev, onNext]);

  if (!milestone) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (diff > 45) {
      onNext();
    } else if (diff < -45) {
      onPrev();
    }
  };

  const handleViewerTouchStart = (e: React.TouchEvent) => {
    touchViewerX.current = e.touches[0].clientX;
  };

  const handleViewerTouchEnd = (e: React.TouchEvent) => {
    if (touchViewerX.current === null) return;
    const diff = touchViewerX.current - e.changedTouches[0].clientX;
    touchViewerX.current = null;
    if (diff > 45) {
      onNext();
    } else if (diff < -45) {
      onPrev();
    }
  };

  // Minimized compact pill state for unobstructed stargazing
  if (isMinimized) {
    return (
      <div
        className={styles.minimizedPill}
        role="region"
        aria-label={`Milestone: ${milestone.title}`}
      >
        <button
          type="button"
          className={styles.pillNavBtn}
          onClick={onPrev}
          aria-label="Previous star"
          disabled={totalCount <= 1}
        >
          ←
        </button>

        <button
          type="button"
          className={styles.pillContentBtn}
          onClick={() => setIsMinimized(false)}
          title="Click to expand story"
        >
          <span className={styles.pillYear}>{milestone.year || "✦"}</span>
          <span className={styles.pillTitle}>{milestone.title}</span>
          <span className={styles.pillExpandIcon}>▲</span>
        </button>

        <button
          type="button"
          className={styles.pillNavBtn}
          onClick={onNext}
          aria-label="Next star"
          disabled={totalCount <= 1}
        >
          →
        </button>
      </div>
    );
  }

  const imageSrc =
    milestone.image?.src ||
    (
      milestone.image as {
        url?: string;
        secureUrl?: string;
        secure_url?: string;
      }
    )?.url ||
    (
      milestone.image as {
        url?: string;
        secureUrl?: string;
        secure_url?: string;
      }
    )?.secureUrl ||
    (
      milestone.image as {
        url?: string;
        secureUrl?: string;
        secure_url?: string;
      }
    )?.secure_url ||
    "";
  const hasImage = Boolean(imageSrc && imageSrc.trim().length > 0);

  return (
    <div
      className={styles.cardContainer}
      role="region"
      aria-label={`Milestone: ${milestone.title}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.yearTag}>{milestone.year || "✦"}</span>
          <span className={styles.counterBadge}>
            {String(currentIndex + 1).padStart(2, "0")} /{" "}
            {String(totalCount).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.minimizeBtn}
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize story card to gaze at stars"
            title="Minimize card"
          >
            _
          </button>
          <button
            type="button"
            className={styles.closeCardBtn}
            onClick={onClose}
            aria-label="Close milestone card"
            title="Close card"
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        {hasImage && (
          <div
            className={styles.cardImageWrapper}
            role="button"
            tabIndex={0}
            onClick={() => setIsViewerOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsViewerOpen(true);
              }
            }}
            aria-label={`View ${milestone.title} full screen`}
            title="Click to view full screen"
          >
            <Photo
              image={{
                src: imageSrc,
                alt:
                  milestone.image?.alt || milestone.altText || milestone.title,
              }}
              sizes="(max-width: 768px) 90vw, 360px"
            />
            <div className={styles.imageExpandBadge}>
              <span className={styles.expandIcon}>⤢</span>
              <span>Fullscreen</span>
            </div>
          </div>
        )}

        <h3 className={styles.cardTitle}>{milestone.title}</h3>
        <p className={styles.cardText}>{milestone.text}</p>

        {milestone.altText && (
          <p className={styles.cardCaption}>{milestone.altText}</p>
        )}
      </div>

      {/* Prominent in-card navigation buttons */}
      {totalCount > 1 && (
        <div className={styles.cardFooterNav}>
          <button
            type="button"
            className={styles.cardNavBtn}
            onClick={onPrev}
            aria-label="Previous star"
          >
            ← Prev Star
          </button>
          <button
            type="button"
            className={styles.cardNavBtn}
            onClick={onNext}
            aria-label="Next star"
          >
            Next Star →
          </button>
        </div>
      )}

      {/* Fullscreen Celestial Lightbox Viewer (similar to Art section viewer) */}
      {isViewerOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.celestialViewer}
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen milestone: ${milestone.title}`}
            onTouchStart={handleViewerTouchStart}
            onTouchEnd={handleViewerTouchEnd}
          >
            <div className={styles.viewerHeader}>
              <button
                type="button"
                className={styles.viewerBackBtn}
                onClick={() => setIsViewerOpen(false)}
                aria-label="Return to the starry sky"
              >
                ← Back to the sky
              </button>
              <span className={styles.viewerHeaderYear}>
                {milestone.year ? `✦ ${milestone.year}` : "✦"}
              </span>
            </div>

            <div className={styles.viewerImageFrame}>
              <Photo
                key={milestone._id || milestone.title}
                image={{
                  src: imageSrc,
                  alt:
                    milestone.image?.alt ||
                    milestone.altText ||
                    milestone.title,
                }}
                sizes="90vw"
                className={styles.viewerPhoto}
                priority
              />
            </div>

            <div className={styles.viewerCaptionArea}>
              <div className={styles.viewerStoryInfo}>
                <p className={styles.viewerKicker}>
                  STUDY / {milestone.year || "✦"}
                </p>
                <h2 className={styles.viewerTitle}>{milestone.title}</h2>
                <p className={styles.viewerText}>{milestone.text}</p>
                {milestone.altText && (
                  <p className={styles.viewerSubcaption}>{milestone.altText}</p>
                )}
                {milestone.image?.credit && (
                  <span className={styles.viewerCredit}>
                    Photo: {milestone.image.credit}
                  </span>
                )}
              </div>

              {totalCount > 1 && (
                <div className={styles.viewerControls}>
                  <button
                    type="button"
                    className={styles.viewerNavBtn}
                    onClick={onPrev}
                    aria-label="Previous milestone"
                  >
                    ←
                  </button>
                  <span className={styles.viewerCounter}>
                    {String(currentIndex + 1).padStart(2, "0")} /{" "}
                    {String(totalCount).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    className={styles.viewerNavBtn}
                    onClick={onNext}
                    aria-label="Next milestone"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
