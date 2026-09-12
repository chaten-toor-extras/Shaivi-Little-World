"use client";

import { useQuotePlayer } from "../world/quote-tv/useQuotePlayer";
import { useEffect } from "react";

export default function QuoteTV() {
  const { quotes, index, on, total, tune, toggle } = useQuotePlayer();

  useEffect(() => {
    if (total < 2 || !on) return;
    const key = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); tune(-1, total); }
      if (e.key === "ArrowRight") { e.preventDefault(); tune(1, total); }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [total, tune, on]);

  // Ensure index is within range if quotes count changes
  const safeIndex = total > 0 ? index % total : 0;
  const currentQuote = total > 0 ? quotes[safeIndex] : null;

  return (
    <div className="quote-room">
      <div className="quote-heading">
        <p className="section-kicker">A SMALL BROADCAST FROM INSIDE MY HEAD</p>
        <h2>
          Quiet <i>frequencies.</i>
        </h2>
      </div>
      <div className={`quote-television ${on ? "tv-on" : "tv-off"}`}>
        <div className="crt-screen">
          <div key={`${safeIndex}-${on}`} className="quote-broadcast">
            {on ? (
              currentQuote ? (
                <>
                  <span className="channel-id">
                    CH {String(safeIndex + 1).padStart(2, "0")} <b>● ON AIR</b>
                  </span>
                  <blockquote>{currentQuote.text}</blockquote>
                  <span className="broadcast-meta">
                    {currentQuote.category}
                  </span>
                </>
              ) : (
                <span className="off-message">No quotes broadcast yet.</span>
              )
            ) : (
              <span className="off-message">A moment of quiet.</span>
            )}
          </div>
        </div>
        <div className="tv-hardware">
          <div className="tv-dials">
            <button
              aria-label="Previous quote"
              disabled={!on || total === 0}
              onClick={() => tune(-1, total)}
            >
              ←
            </button>
            <button
              aria-label="Next quote"
              disabled={!on || total === 0}
              onClick={() => tune(1, total)}
            >
              →
            </button>
          </div>
          <span className="speaker-grille" />
          <button
            className="tv-power"
            aria-label={on ? "Turn television off" : "Turn television on"}
            aria-pressed={on}
            onClick={toggle}
          >
            ⏻
          </button>
          <span className="tv-brand">
            LITTLE WORLD
            <br />
            COLOUR TELEVISION
          </span>
        </div>
      </div>
      <div className="quote-room-foot">
        <span>NO BREAKING NEWS. JUST PASSING THOUGHTS.</span>
        <span>
          {total > 0 ? (
            <>
              {String(safeIndex + 1).padStart(2, "0")} / {total}{" "}
              <small>← → to tune in</small>
            </>
          ) : (
            <small>Tuning in...</small>
          )}
        </span>
      </div>
    </div>
  );
}
