"use client";

import { useArtworks } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { Artwork } from "@/types";
import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Photo from "./Photo";

function TapedPrint({
  art,
  index,
  total,
  front,
  onOpen,
}: {
  art: Artwork;
  index: number;
  total: number;
  front: () => number;
  onOpen: (index: number, origin: { x: number; y: number }) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // Subtle organic tilt and tape angles so prints look naturally taped to a wall
  const rotation =
    art.rotation ??
    (index % 4 === 0
      ? -2.4
      : index % 4 === 1
        ? 2.1
        : index % 4 === 2
          ? -1.2
          : 1.8);
  const tapeTilt = index % 3 === 0 ? -2.2 : index % 3 === 1 ? 1.6 : -0.8;
  const scale = art.scale ?? 1;

  const position = useRef({ x: 0, y: 0 });
  const isInitialized = useRef(false);

  const drag = useRef<{
    startX: number;
    startY: number;
    posX: number;
    posY: number;
    lastX: number;
    moved: boolean;
  } | null>(null);

  const suppress = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const board = el?.parentElement;
    if (!el || !board) return;

    const layout = () => {
      const bWidth = board.clientWidth;
      const w = el.offsetWidth || 250;
      const h = el.offsetHeight || 240;

      const isMobile = bWidth < 680;
      const cols = isMobile ? 2 : bWidth >= 1050 ? 4 : 3;
      const col = index % cols;
      const row = Math.floor(index / cols);

      // Dynamically guarantee board height fits all rows generously
      const desiredHeight = isMobile
        ? Math.max(540, Math.ceil(total / 2) * (h + 30) + 70)
        : Math.max(700, Math.ceil(total / cols) * (h + 40) + 80);

      if (board.style.minHeight !== `${desiredHeight}px`) {
        board.style.minHeight = `${desiredHeight}px`;
      }

      const bHeight = Math.max(board.clientHeight, desiredHeight);

      if (!isInitialized.current) {
        // Compute clean, comfortable initial positions with organic jitter
        const padX = isMobile ? 12 : 26;
        const padY = isMobile ? 18 : 30;
        const availableW = Math.max(0, bWidth - padX * 2 - w);
        const colStep = cols > 1 ? availableW / (cols - 1) : 0;

        const jitterX = isMobile ? 0 : ((index * 13) % 21) - 10;
        const jitterY = isMobile ? (index % 2) * 14 : ((index * 17) % 25) - 12;

        const initX = padX + col * colStep + jitterX;
        const initY = padY + row * (h + (isMobile ? 24 : 36)) + jitterY;

        const clampedX = Math.max(padX, Math.min(bWidth - w - padX, initX));
        const clampedY = Math.max(padY, Math.min(bHeight - h - padY, initY));

        position.current = { x: clampedX, y: clampedY };
        el.style.translate = `${clampedX}px ${clampedY}px`;
        isInitialized.current = true;
      } else {
        // On screen resize, clamp existing dragged coordinates within bounds
        const pad = isMobile ? 8 : 16;
        const maxX = Math.max(pad, bWidth - w - pad);
        const maxY = Math.max(pad, bHeight - h - pad);
        const clampedX = Math.max(pad, Math.min(maxX, position.current.x));
        const clampedY = Math.max(pad, Math.min(maxY, position.current.y));
        position.current = { x: clampedX, y: clampedY };
        el.style.translate = `${clampedX}px ${clampedY}px`;
      }
    };

    const observer = new ResizeObserver(layout);
    observer.observe(board);
    layout();
    return () => observer.disconnect();
  }, [index, total]);

  const end = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    suppress.current = d.moved;
    drag.current = null;
    e.currentTarget.classList.remove("picked-up");
    e.currentTarget.style.setProperty("--tilt", `${rotation}deg`);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className="taped-print"
      style={
        {
          "--tilt": `${rotation}deg`,
          "--tape-tilt": `${tapeTilt}deg`,
          "--paper-scale": scale,
          zIndex: index + 1,
        } as CSSProperties
      }
      aria-label={`Open artwork ${art.title}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const el = e.currentTarget;
        const board = el.parentElement;
        if (!board) return;

        el.style.zIndex = String(front());
        drag.current = {
          startX: e.clientX,
          startY: e.clientY,
          posX: position.current.x,
          posY: position.current.y,
          lastX: e.clientX,
          moved: false,
        };
        suppress.current = false;
        el.setPointerCapture(e.pointerId);
        el.classList.add("picked-up");
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        const el = e.currentTarget;
        const board = el.parentElement;
        if (!d || !board) return;

        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (Math.hypot(dx, dy) > 4) d.moved = true;

        const isMobile = board.clientWidth < 680;
        const pad = isMobile ? 8 : 16;
        const maxX = Math.max(pad, board.clientWidth - el.offsetWidth - pad);
        const maxY = Math.max(pad, board.clientHeight - el.offsetHeight - pad);

        const newX = Math.max(pad, Math.min(maxX, d.posX + dx));
        const newY = Math.max(pad, Math.min(maxY, d.posY + dy));

        position.current = { x: newX, y: newY };
        el.style.translate = `${newX}px ${newY}px`;

        const tiltShift = Math.max(
          -6,
          Math.min(6, (e.clientX - d.lastX) * 0.25),
        );
        el.style.setProperty("--tilt", `${rotation + tiltShift}deg`);
        d.lastX = e.clientX;
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={() => {
        drag.current = null;
        ref.current?.classList.remove("picked-up");
      }}
      onClick={(e) => {
        if (suppress.current) {
          suppress.current = false;
          return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        onOpen(index, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
    >
      <span className="paper-tape" aria-hidden="true" />
      <div className="art-photo">
        <Photo
          image={art.image}
          sizes="(max-width: 680px) 44vw, (max-width: 1050px) 30vw, 24vw"
        />
      </div>
      <div className="print-caption">
        <span className="print-title">{art.title}</span>
        {art.year ? <small className="print-year">{art.year}</small> : null}
      </div>
    </button>
  );
}

function ArtViewer({
  artworks,
  index,
  onChange,
  onClose,
  origin,
}: {
  artworks: Artwork[];
  index: number;
  onChange: (n: number) => void;
  onClose: () => void;
  origin: { x: number; y: number };
}) {
  const root = useRef<HTMLDivElement>(null),
    touch = useRef<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const total = artworks.length;
  const safeIndex = total > 0 ? index % total : 0;
  const art = artworks[safeIndex];

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    if (total === 0) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const nodes = Array.from(
          root.current?.querySelectorAll<HTMLElement>("button,a[href]") || [],
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
        e.stopImmediatePropagation();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setLeaving(true);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        onChange(
          (safeIndex + (e.key === "ArrowRight" ? 1 : total - 1)) % total,
        );
      }
    };
    document.addEventListener("keydown", key, true);
    return () => document.removeEventListener("keydown", key, true);
  }, [safeIndex, total, onChange]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onClose, reduced ? 0 : 250);
    return () => clearTimeout(t);
  }, [leaving, onClose, reduced]);

  if (!art) return null;

  return (
    <div
      ref={root}
      className={`art-viewer ${leaving ? "returning-print" : ""}`}
      role="region"
      aria-label="Artwork viewer"
      style={
        {
          "--origin-x": `${origin.x}px`,
          "--origin-y": `${origin.y}px`,
        } as CSSProperties
      }
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (
          touch.current !== null &&
          Math.abs(e.changedTouches[0].clientX - touch.current) > 45 &&
          total > 0
        )
          onChange(
            (safeIndex +
              (e.changedTouches[0].clientX < touch.current ? 1 : total - 1)) %
              total,
          );
        touch.current = null;
      }}
    >
      <button
        type="button"
        className="viewer-close"
        aria-label="Return to the wall"
        onClick={() => setLeaving(true)}
      >
        ← Back to the wall
      </button>
      <Photo
        key={art._id || (art as any).id}
        image={art.image}
        sizes="85vw"
        className="viewer-image"
      />
      <div className="viewer-caption">
        <div>
          <p className="section-kicker">STUDY / {art.year}</p>
          <h2>{art.title}</h2>
          <p>{art.caption}</p>
          {art.image?.source && (
            <a href={art.image.source} target="_blank" rel="noreferrer">
              Photo: {art.image.credit || "Reference"} ↗
            </a>
          )}
        </div>
        <div className="viewer-controls">
          <button
            type="button"
            aria-label="Previous artwork"
            onClick={() => onChange((safeIndex + total - 1) % total)}
          >
            ←
          </button>
          <span>
            {String(safeIndex + 1).padStart(2, "0")} / {total}
          </span>
          <button
            type="button"
            aria-label="Next artwork"
            onClick={() => onChange((safeIndex + 1) % total)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArtWorkspace() {
  const artworks = useArtworks();
  const z = useRef(30);
  const [selected, setSelected] = useState<number | null>(null),
    [origin, setOrigin] = useState({ x: 0, y: 0 }),
    [list, setList] = useState(false);

  const open = (i: number, o: { x: number; y: number }) => {
    setOrigin(o);
    setSelected(i);
  };

  const close = () => {
    const i = selected;
    setSelected(null);
    requestAnimationFrame(() => {
      const art = artworks[i ?? 0];
      if (art) {
        document
          .querySelector<HTMLButtonElement>(
            `[aria-label="Open artwork ${art.title}"]`,
          )
          ?.focus();
      }
    });
  };

  const total = artworks?.length || 0;

  return (
    <div className="art-workspace">
      <div className="workspace-heading" inert={selected !== null}>
        <div>
          <p className="section-kicker">
            THE ART WALL / {total} {total === 1 ? "STUDY" : "STUDIES"}
          </p>
          <h2>
            Studio wall &amp;
            <br />
            <i>visual studies.</i>
          </h2>
        </div>
        <div>
          <p>
            Pasted with tape on the wall.
            <br />
            Drag prints to arrange your board · Tap to look closer.
          </p>
          <button
            type="button"
            className="underlined"
            onClick={() => setList(!list)}
          >
            {list ? "Hide artwork index" : "Open artwork index"} ↗
          </button>
        </div>
      </div>

      {list && (
        <nav
          className="art-index"
          aria-label="Artwork index"
          inert={selected !== null}
        >
          {artworks.map((a, i) => (
            <button
              key={a._id || (a as any).id || i}
              type="button"
              onClick={() =>
                open(i, {
                  x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
                  y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
                })
              }
            >
              {String(i + 1).padStart(2, "0")} — {a.title}
            </button>
          ))}
        </nav>
      )}

      <div
        className="art-wall"
        inert={selected !== null}
        aria-label="Draggable studio art wall"
      >
        {artworks.map((a, i) => (
          <TapedPrint
            key={a._id || (a as any).id || i}
            art={a}
            index={i}
            total={total}
            front={() => ++z.current}
            onOpen={open}
          />
        ))}
        <span className="wall-scribble" aria-hidden="true">
          arrange as you like ✦
        </span>
      </div>

      {total === 0 && (
        <div className="gallery-empty-state">
          <p>No visual studies pasted on the wall yet.</p>
        </div>
      )}

      <p className="demo-note" inert={selected !== null}>
        Imagined artwork studies using credited reference photos.
      </p>

      {selected !== null && (
        <ArtViewer
          artworks={artworks}
          index={selected}
          onChange={setSelected}
          onClose={close}
          origin={origin}
        />
      )}
    </div>
  );
}
