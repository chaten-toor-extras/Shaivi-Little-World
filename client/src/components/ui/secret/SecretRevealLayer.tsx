"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import { useSecretStore } from "@/store/useSecretStore";
import { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "./SecretReveal.module.css";

const DURATION_MAP: Record<string, number> = {
  SHORT: 4000,
  NORMAL: 7000,
  LONG: 12000,
  UNTIL_CLOSED: 0,
};

export default function SecretRevealLayer() {
  const activeReveal = useSecretStore((s) => s.activeReveal);
  const dismissActiveReveal = useSecretStore((s) => s.dismissActiveReveal);
  const quality = useExperienceStore((s) => s.quality);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    // Stop and clean up any active reveal sound
    if (audioInstanceRef.current) {
      try {
        audioInstanceRef.current.pause();
        audioInstanceRef.current.src = "";
      } catch {
        // Ignore audio cleanup errors
      }
      audioInstanceRef.current = null;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    dismissActiveReveal();
  }, [dismissActiveReveal]);

  // Escape key handler
  useEffect(() => {
    if (!activeReveal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReveal, handleDismiss]);

  // Auto-close duration timer
  useEffect(() => {
    if (!activeReveal) return;

    const durationKey = activeReveal.reveal.duration || "NORMAL";
    const durationMs = DURATION_MAP[durationKey] ?? 7000;

    if (durationMs > 0) {
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, durationMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeReveal, handleDismiss]);

  // Sound reveal playback with strict isolation from background music
  useEffect(() => {
    if (!activeReveal) return;

    const soundUrl = activeReveal.reveal.soundUrl;
    if (soundUrl) {
      try {
        const audio = new Audio(soundUrl);
        const volume = Math.min(
          1,
          Math.max(0, activeReveal.reveal.soundVolume ?? 0.5),
        );
        audio.volume = volume;

        audio.onended = () => {
          audio.src = "";
          if (audioInstanceRef.current === audio) {
            audioInstanceRef.current = null;
          }
        };

        audioInstanceRef.current = audio;
        audio.play().catch((err) => {
          console.warn("Could not play secret reveal sound:", err);
        });
      } catch (err) {
        console.warn("Audio element initialization failed:", err);
      }
    }

    return () => {
      if (audioInstanceRef.current) {
        try {
          audioInstanceRef.current.pause();
          audioInstanceRef.current.src = "";
        } catch {
          // Ignore
        }
        audioInstanceRef.current = null;
      }
    };
  }, [activeReveal]);

  // Auto-focus close button for accessibility
  useEffect(() => {
    if (activeReveal && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [activeReveal]);

  // Particle calculations based on quality cap
  const particleCount = useMemo(() => {
    if (reducedMotion) return 0;
    if (quality === "LOW") return 6;
    if (quality === "MEDIUM") return 14;
    return 22;
  }, [quality, reducedMotion]);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: `${(i * 37) % 94}%`,
      top: `${(i * 43) % 88}%`,
      size: `${4 + (i % 5) * 2}px`,
      delay: `${(i * 0.25) % 2.5}s`,
    }));
  }, [particleCount]);

  if (!activeReveal) return null;

  const { reveal, previewMode } = activeReveal;
  const position = reveal.position || "center";

  const backdropClass =
    position === "bottom-center"
      ? `${styles.backdrop} ${styles.backdropBottomCenter}`
      : position === "near-target"
        ? `${styles.backdrop} ${styles.backdropNearTarget}`
        : `${styles.backdrop} ${styles.backdropCenter}`;

  const cardClass =
    position === "bottom-center"
      ? `${styles.card} ${styles.cardBottom}`
      : styles.card;

  const visualEffect = reveal.visualEffect || "NONE";

  return (
    <div
      className={backdropClass}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={reveal.title || "Secret discovery"}
    >
      <div className={cardClass} onClick={(e) => e.stopPropagation()}>
        {/* Top close button */}
        <button
          type="button"
          className={styles.topCloseBtn}
          onClick={handleDismiss}
          aria-label="Close secret"
          title="Close"
        >
          ×
        </button>

        {/* Visual Effect Particles */}
        {visualEffect !== "NONE" && !reducedMotion && (
          <div className={styles.effectContainer} aria-hidden="true">
            {visualEffect === "GLOW" && <div className={styles.glowOverlay} />}
            {visualEffect === "SOFT_PULSE" && (
              <div className={styles.softPulseOverlay} />
            )}
            {particles.map((p) => {
              let pClass = styles.sparkleParticle;
              if (visualEffect === "TINY_STARS") pClass = styles.starParticle;
              if (visualEffect === "PETALS") pClass = styles.petalParticle;

              return (
                <span
                  key={p.id}
                  className={`${styles.particle} ${pClass}`}
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Header Kicker */}
        <div className={styles.kicker}>
          <span className={styles.kickerIcon}>✦</span>
          <span>
            {previewMode
              ? "SECRET PREVIEW (TEST MODE)"
              : "LITTLE WORLD DISCOVERY"}
          </span>
        </div>

        {/* Title */}
        {reveal.title && <h2 className={styles.title}>{reveal.title}</h2>}

        {/* Optional Collectible Reward Badge */}
        {(reveal.type === "COLLECTIBLE" || reveal.collectibleId) && (
          <div className={styles.rewardBadge}>
            <span className={styles.rewardIcon}>✦</span>
            <span>Added to Keepsakes & Collection Book</span>
          </div>
        )}

        {/* Message */}
        {reveal.message && <p className={styles.message}>{reveal.message}</p>}

        {/* Optional Quote */}
        {reveal.type === "QUOTE" && (reveal.quoteText || reveal.quoteAuthor) && (
          <div className={styles.quoteBlock}>
            {reveal.quoteText && (
              <p className={styles.quoteText}>“{reveal.quoteText}”</p>
            )}
            {reveal.quoteAuthor && (
              <span className={styles.quoteAuthor}>— {reveal.quoteAuthor}</span>
            )}
          </div>
        )}

        {/* Optional Image */}
        {(reveal.type === "IMAGE" || reveal.image?.url || reveal.image?.src) &&
          (reveal.image?.url || reveal.image?.src) && (
            <div className={styles.imageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reveal.image.url || reveal.image.src}
                alt={reveal.image.alt || reveal.title || "Secret discovery image"}
                className={styles.image}
              />
              {reveal.image.alt && (
                <div className={styles.imageCaption}>{reveal.image.alt}</div>
              )}
            </div>
          )}

        {/* Footer */}
        <div className={styles.footer}>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeBtn}
            onClick={handleDismiss}
          >
            Close ✦
          </button>
        </div>
      </div>
    </div>
  );
}
