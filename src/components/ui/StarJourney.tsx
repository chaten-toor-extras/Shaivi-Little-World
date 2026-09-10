"use client";
import { useState } from "react";
import { milestones } from "@/data/timeline";
import Photo from "./Photo";
export default function StarJourney() {
  const [index, setIndex] = useState(4);
  const m = milestones[index];
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
        {milestones.map((s, i) => (
          <button
            key={s.title}
            className={`milestone-star ${index === i ? "selected" : ""}`}
            style={{
              left: `${[8, 29, 48, 69, 91][i]}%`,
              top: `${[65, 21, 62, 15, 48][i]}%`,
            }}
            onClick={() => setIndex(i)}
            aria-pressed={index === i}
          >
            <span>✧</span>
            <small>{s.year}</small>
            <b>{s.title}</b>
          </button>
        ))}
      </div>
      <div className="star-note" key={index}>
        <Photo image={m.image} />
        <div>
          <p className="section-kicker">{m.year} / IMAGINED MILESTONE</p>
          <h3>{m.title}</h3>
          <p>{m.text}</p>
          <small>Demo timeline — not biographical facts.</small>
        </div>
      </div>
    </div>
  );
}
