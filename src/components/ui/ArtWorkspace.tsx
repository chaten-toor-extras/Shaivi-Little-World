"use client";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  CSSProperties,
} from "react";
import { artworks } from "@/data/artworks";
import Photo from "./Photo";
import { useExperienceStore } from "@/store/useExperienceStore";
type Art = (typeof artworks)[number];
function Print({
  art,
  index,
  front,
  onOpen,
}: {
  art: Art;
  index: number;
  front: () => number;
  onOpen: (index: number, origin: { x: number; y: number }) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const position = useRef({
    x: art.initialPosition.x / 100,
    y: art.initialPosition.y / 100,
  });
  const drag = useRef<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    lastX: number;
    moved: boolean;
  } | null>(null);
  const suppress = useRef(false);
  useEffect(() => {
    const el = ref.current,
      board = el?.parentElement;
    if (!el || !board) return;
    let first = true;
    const layout = () => {
      if (first && board.clientWidth < 600) {
        position.current = {
          x: (index % 2) * 0.92,
          y: Math.floor(index / 2) / 5,
        };
      }
      first = false;
      el.style.translate = `${position.current.x * Math.max(0, board.clientWidth - el.offsetWidth)}px ${position.current.y * Math.max(0, board.clientHeight - el.offsetHeight)}px`;
    };
    const observer = new ResizeObserver(layout);
    observer.observe(board);
    layout();
    return () => observer.disconnect();
  }, [index]);
  const end = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    suppress.current = d.moved;
    drag.current = null;
    e.currentTarget.classList.remove("picked-up");
    e.currentTarget.style.setProperty("--tilt", `${art.initialRotation}deg`);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return (
    <button
      ref={ref}
      className="scattered-print"
      style={
        {
          "--tilt": `${art.initialRotation}deg`,
          "--paper-scale": art.initialScale,
          zIndex: index + 1,
        } as CSSProperties
      }
      aria-label={`Open artwork ${art.title}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const el = e.currentTarget;
        el.style.zIndex = String(front());
        drag.current = {
          startX: e.clientX,
          startY: e.clientY,
          x:
            position.current.x *
            Math.max(0, el.parentElement!.clientWidth - el.offsetWidth),
          y:
            position.current.y *
            Math.max(0, el.parentElement!.clientHeight - el.offsetHeight),
          lastX: e.clientX,
          moved: false,
        };
        suppress.current = false;
        el.setPointerCapture(e.pointerId);
        el.classList.add("picked-up");
      }}
      onPointerMove={(e) => {
        const d = drag.current,
          el = e.currentTarget,
          board = el.parentElement;
        if (!d || !board) return;
        const dx = e.clientX - d.startX,
          dy = e.clientY - d.startY;
        if (Math.hypot(dx, dy) > 5) d.moved = true;
        const maxX = Math.max(0, board.clientWidth - el.offsetWidth),
          maxY = Math.max(0, board.clientHeight - el.offsetHeight);
        const x = Math.max(0, Math.min(maxX, d.x + dx)),
          y = Math.max(0, Math.min(maxY, d.y + dy));
        position.current = { x: maxX ? x / maxX : 0, y: maxY ? y / maxY : 0 };
        el.style.translate = `${x}px ${y}px`;

        el.style.setProperty(
          "--tilt",
          `${Math.max(-12, Math.min(12, (e.clientX - d.lastX) * 0.35 + art.initialRotation))}deg`,
        );
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
      <span className="paper-tape" />
      <Photo image={art.image} sizes="(max-width: 600px) 45vw, 24vw" />
      <span className="print-caption">
        {art.title}
        <small>{art.year}</small>
      </span>
    </button>
  );
}
function ArtViewer({
  index,
  onChange,
  onClose,
  origin,
}: {
  index: number;
  onChange: (n: number) => void;
  onClose: () => void;
  origin: { x: number; y: number };
}) {
  const root = useRef<HTMLDivElement>(null),
    touch = useRef<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const art = artworks[index];
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);
  useEffect(() => {
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
          (index + (e.key === "ArrowRight" ? 1 : artworks.length - 1)) %
            artworks.length,
        );
      }
    };
    document.addEventListener("keydown", key, true);
    return () => document.removeEventListener("keydown", key, true);
  }, [index, onChange]);
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onClose, reduced ? 0 : 250);
    return () => clearTimeout(t);
  }, [leaving, onClose, reduced]);
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
          Math.abs(e.changedTouches[0].clientX - touch.current) > 45
        )
          onChange(
            (index +
              (e.changedTouches[0].clientX < touch.current
                ? 1
                : artworks.length - 1)) %
              artworks.length,
          );
        touch.current = null;
      }}
    >
      <button
        className="viewer-close"
        aria-label="Return artwork to the desk"
        onClick={() => setLeaving(true)}
      >
        ← Back to the desk
      </button>
      <Photo
        key={art.id}
        image={art.image}
        sizes="85vw"
        className="viewer-image"
      />
      <div className="viewer-caption">
        <div>
          <p className="section-kicker">DEMO STUDY / {art.year}</p>
          <h2>{art.title}</h2>
          <p>{art.caption}</p>
          <a href={art.image.source} target="_blank" rel="noreferrer">
            Photo: {art.image.credit} ↗
          </a>
        </div>
        <div className="viewer-controls">
          <button
            aria-label="Previous artwork"
            onClick={() =>
              onChange((index + artworks.length - 1) % artworks.length)
            }
          >
            ←
          </button>
          <span>
            {String(index + 1).padStart(2, "0")} / {artworks.length}
          </span>
          <button
            aria-label="Next artwork"
            onClick={() => onChange((index + 1) % artworks.length)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
export default function ArtWorkspace() {
  const z = useRef(20);
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
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>(
          `[aria-label="Open artwork ${artworks[i ?? 0].title}"]`,
        )
        ?.focus(),
    );
  };
  return (
    <div className="art-workspace">
      <div className="workspace-heading" inert={selected !== null}>
        <div>
          <p className="section-kicker">THE ART CORNER / 12 LITTLE STUDIES</p>
          <h2>
            A beautiful
            <br />
            <i>little mess.</i>
          </h2>
        </div>
        <div>
          <p>
            Pick one up. Move things around.
            <br />
            Tap a print to look a little closer.
          </p>
          <button className="underlined" onClick={() => setList(!list)}>
            {list ? "Hide artwork index" : "Open artwork index"} ↗
          </button>
        </div>
      </div>
      <div
        className="scattered-desk"
        inert={selected !== null}
        aria-label="Draggable artwork desk"
      >
        {artworks.map((a, i) => (
          <Print
            key={a.id}
            art={a}
            index={i}
            front={() => ++z.current}
            onOpen={open}
          />
        ))}
        <span className="desk-scribble">
          nothing has to stay
          <br />
          where you found it.
        </span>
      </div>
      {list && (
        <nav
          className="art-index"
          aria-label="Artwork index"
          inert={selected !== null}
        >
          {artworks.map((a, i) => (
            <button
              key={a.id}
              onClick={() => open(i, { x: innerWidth / 2, y: innerHeight / 2 })}
            >
              {String(i + 1).padStart(2, "0")} — {a.title}
            </button>
          ))}
        </nav>
      )}
      <p className="demo-note" inert={selected !== null}>
        Imagined artwork studies using credited Pexels reference photos.
      </p>
      {selected !== null && (
        <ArtViewer
          index={selected}
          onChange={setSelected}
          onClose={close}
          origin={origin}
        />
      )}
    </div>
  );
}
