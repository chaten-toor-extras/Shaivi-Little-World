"use client";

import type { JourneyMilestone } from "@/types";
import styles from "./TelescopeJourney.module.css";
import type { NormalizedStarCoord } from "./telescopeUtils";

interface TelescopeAccessibleControlsProps {
  coords: (NormalizedStarCoord & {
    milestone: JourneyMilestone;
    originalIndex: number;
  })[];
  activeIndex: number;
  hoveredIndex: number | null;
  onSelectStar: (index: number) => void;
  onHoverStar: (index: number | null) => void;
}

export default function TelescopeAccessibleControls({
  coords,
  activeIndex,
  hoveredIndex,
  onSelectStar,
  onHoverStar,
}: TelescopeAccessibleControlsProps) {
  return (
    <div
      className={styles.accessibleLayer}
      role="navigation"
      aria-label="Constellation stars"
    >
      {coords.map((coord) => {
        const isActive = activeIndex === coord.originalIndex;
        const isHovered = hoveredIndex === coord.originalIndex;
        const label = `${coord.milestone.year || "Star"} — ${coord.milestone.title || "Milestone"}`;

        return (
          <button
            key={coord.originalIndex}
            type="button"
            className={styles.accessibleStarBtn}
            style={{
              left: `${coord.x}%`,
              top: `${coord.y}%`,
            }}
            onClick={() => onSelectStar(coord.originalIndex)}
            onMouseEnter={() => onHoverStar(coord.originalIndex)}
            onMouseLeave={() => onHoverStar(null)}
            onFocus={() => onHoverStar(coord.originalIndex)}
            onBlur={() => onHoverStar(null)}
            aria-label={label}
            aria-pressed={isActive}
            tabIndex={0}
          >
            <span className={styles.visuallyHidden}>{label}</span>

            {/* Subtle floating desktop tooltip */}
            {isHovered && (
              <span className={styles.starTooltip} aria-hidden="true">
                <b>{coord.milestone.year}</b> · {coord.milestone.title}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
