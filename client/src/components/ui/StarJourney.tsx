"use client";

import { milestones as defaultMilestones } from "@/data/timeline";
import { useJourney } from "@/providers/ContentProvider";
import { useState } from "react";
import Photo from "./Photo";

const CANONICAL_COORDS = [
  { left: 8, top: 65 },
  { left: 29, top: 21 },
  { left: 48, top: 62 },
  { left: 69, top: 15 },
  { left: 91, top: 48 },
];

export default function StarJourney() {
  const cmsMilestones = useJourney();
  const milestones =
    cmsMilestones && cmsMilestones.length > 0
      ? cmsMilestones
      : defaultMilestones;

  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(4, milestones.length - 1)),
  );

  const safeIndex =
    index >= 0 && index < milestones.length
      ? index
      : Math.max(0, milestones.length - 1);

  const m = milestones[safeIndex];

  return (
    <div className="star-journey">
      <div className="journey-heading">
        <p className="section-kicker">A FEW POINTS OF LIGHT</p>
        <h2>
          Still <i>becoming.</i>
        </h2>
        <p>Every little beginning belongs somewhere.</p>
      </div>

      <div className="star-map">
        <svg
          viewBox="0 0 1000 260"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M80 170 L290 55 L480 160 L690 40 L910 125" />
        </svg>
        {milestones.map((s, i) => {
          const coord = CANONICAL_COORDS[i % CANONICAL_COORDS.length];
          return (
            <button
              key={s.title || i}
              className={`milestone-star ${safeIndex === i ? "selected" : ""}`}
              style={{
                left: `${coord.left}%`,
                top: `${coord.top}%`,
              }}
              onClick={() => setIndex(i)}
              aria-pressed={safeIndex === i}
            >
              <span>✧</span>
              <small>{s.year}</small>
              <b>{s.title}</b>
            </button>
          );
        })}
      </div>

      {m && (
        <div className="star-note" key={safeIndex}>
          <Photo image={m.image} />
          <div>
            <p className="section-kicker">{m.year} / IMAGINED MILESTONE</p>
            <h3>{m.title}</h3>
            <p>{m.text}</p>
            <small>Demo timeline — not biographical facts.</small>
          </div>
        </div>
      )}
    </div>
  );
}
