"use client";
import { useEffect, useState } from "react";
import { quotes } from "@/data/quotes";
export default function QuoteTV() {
  const [index, setIndex] = useState(0),
    [on, setOn] = useState(true);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if(e.defaultPrevented)return;
      if (e.key === "ArrowLeft")
        setIndex((i) => (i + quotes.length - 1) % quotes.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % quotes.length);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
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
          <div key={`${index}-${on}`} className="quote-broadcast">
            {on ? (
              <>
                <span className="channel-id">
                  CH {String(index + 1).padStart(2, "0")} <b>● ON AIR</b>
                </span>
                <blockquote>{quotes[index].text}</blockquote>
                <span className="broadcast-meta">
                  {quotes[index].category} / Original demo thought
                </span>
              </>
            ) : (
              <span className="off-message">A moment of quiet.</span>
            )}
          </div>
        </div>
        <div className="tv-hardware">
          <div className="tv-dials">
            <button
              aria-label="Previous quote"
              disabled={!on}
              onClick={() =>
                setIndex((index + quotes.length - 1) % quotes.length)
              }
            >
              ←
            </button>
            <button
              aria-label="Next quote"
              disabled={!on}
              onClick={() => setIndex((index + 1) % quotes.length)}
            >
              →
            </button>
          </div>
          <span className="speaker-grille" />
          <button
            className="tv-power"
            aria-label={on ? "Turn television off" : "Turn television on"}
            aria-pressed={on}
            onClick={() => setOn(!on)}
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
          {String(index + 1).padStart(2, "0")} / {quotes.length}{" "}
          <small>← → to tune in</small>
        </span>
      </div>
    </div>
  );
}
