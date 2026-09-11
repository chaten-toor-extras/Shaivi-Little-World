"use client";

import { portfolio } from "@/data/portfolio";
import { useSiteSettings, useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useEffect } from "react";

export default function SecretModal() {
  const site = useSiteSettings();
  const worldSettings = useWorldSettings();
  const { secretOpen, closeSecret } = useExperienceStore();

  useEffect(() => {
    if (!secretOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSecret();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [secretOpen, closeSecret]);

  if (!secretOpen) return null;

  const title =
    worldSettings.identity?.secretMessage || "A tiny secret, found.";
  const secretList =
    site?.secretMessages && site.secretMessages.length > 0
      ? site.secretMessages
      : portfolio.secret;

  return (
    <div
      className="secret-modal-backdrop"
      onClick={closeSecret}
      role="dialog"
      aria-modal="true"
      aria-label="Enchanted secret field guide page"
    >
      <div className="field-guide-page" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="field-guide-close"
          onClick={closeSecret}
          aria-label="Close field guide page"
        >
          ×
        </button>

        <div className="field-guide-inner">
          <div className="field-guide-header">
            <span className="field-guide-tag">✦ ENCHANTED DISCOVERY ✦</span>
            <h2 className="field-guide-title">{title}</h2>
            <p className="field-guide-subtitle">
              Pages from Shaivi’s Field Guide
            </p>
            <div className="field-guide-divider">
              <span className="divider-line" />
              <span className="divider-symbol">✧</span>
              <span className="divider-line" />
            </div>
          </div>

          <div className="field-guide-entries">
            {secretList.map((fact, index) => (
              <div key={index} className="field-guide-entry">
                <span className="field-guide-num">
                  № {String(index + 1).padStart(2, "0")}
                </span>
                <p className="field-guide-text">{fact}</p>
              </div>
            ))}
          </div>

          <div className="field-guide-footer">
            <button
              type="button"
              className="field-guide-button"
              onClick={closeSecret}
            >
              Return to Island →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
