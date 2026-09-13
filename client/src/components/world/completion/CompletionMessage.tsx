"use client";

import { useWorldSettings } from "@/providers/ContentProvider";
import React, { useEffect, useRef } from "react";
import styles from "./CompletionCinematic.module.css";
import { useCompletionCinematicStore } from "./useCompletionCinematicStore";

export default function CompletionMessage() {
  const worldSettings = useWorldSettings();
  const stage = useCompletionCinematicStore((s) => s.stage);
  const skipCinematic = useCompletionCinematicStore((s) => s.skipCinematic);
  const dismissCinematic = useCompletionCinematicStore(
    (s) => s.dismissCinematic
  );

  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  const isMessageVisible = stage === "MESSAGE";
  const isEarlyStage = stage === "PULLBACK" || stage === "WORLD_GLOW";
  const isActive = stage !== "IDLE" && stage !== "COMPLETE";

  // Capture previously focused element when cinematic starts to restore later
  useEffect(() => {
    if (stage === "PREPARING") {
      previousFocusedElementRef.current = document.activeElement as HTMLElement;
    }
  }, [stage]);

  // Focus trap on Continue button when MESSAGE appears
  useEffect(() => {
    if (isMessageVisible && continueButtonRef.current) {
      continueButtonRef.current.focus();
    }
  }, [isMessageVisible]);

  // Restore focus when cinematic completes
  useEffect(() => {
    if (stage === "IDLE" && previousFocusedElementRef.current) {
      try {
        previousFocusedElementRef.current.focus();
      } catch {
        // Safe fallback
      }
      previousFocusedElementRef.current = null;
    }
  }, [stage]);

  // Keyboard accessibility: Escape to skip at any active stage
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skipCinematic();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, skipCinematic]);

  if (!isActive) return null;

  // Resolve and sanitize copy with lengths constrained
  const rawEyebrow =
    worldSettings.completion?.eyebrow ||
    "you found your way through this little world ✦";
  const rawTitle =
    worldSettings.completion?.title ||
    "some things were meant to be noticed slowly.";
  const rawBody =
    worldSettings.completion?.message ??
    "A quiet thank you for wandering through Shaivi’s Little World.";
  const rawButtonLabel =
    worldSettings.completion?.buttonLabel || "Continue exploring";

  const eyebrow = rawEyebrow.slice(0, 80);
  const title = rawTitle.slice(0, 120);
  const body = rawBody.slice(0, 400);
  const buttonLabel = rawButtonLabel.slice(0, 40);

  return (
    <>
      {/* Subtle early skip control available during pullback and glow */}
      {isEarlyStage && (
        <button
          type="button"
          className={styles.earlySkipButton}
          onClick={skipCinematic}
          aria-label="Skip cinematic"
        >
          Skip ↗
        </button>
      )}

      {/* Main message card overlay */}
      {isMessageVisible && (
        <div
          className={`${styles.overlayBackdrop} ${styles.overlayBackdropActive}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-cinematic-title"
        >
          <div
            className={styles.messageCard}
            onClick={(e) => e.stopPropagation()}
          >
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 id="completion-cinematic-title" className={styles.title}>
              {title}
            </h2>
            {body && <p className={styles.body}>{body}</p>}

            <div className={styles.actions}>
              <button
                ref={continueButtonRef}
                type="button"
                className={styles.continueButton}
                onClick={dismissCinematic}
              >
                {buttonLabel}
              </button>
              <button
                type="button"
                className={styles.skipLink}
                onClick={skipCinematic}
                aria-label="Skip remaining animation"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

