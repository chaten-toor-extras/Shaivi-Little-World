"use client";
import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useExperienceStore } from "@/store/useExperienceStore";
import { sections, labels } from "@/data/portfolio";
import SectionOverlay from "../ui/SectionOverlay";
import { SectionContent } from "../ui/Content";
import { useAudio } from "@/hooks/useAudio";
const World = dynamic(() => import("./World"), { ssr: false });
class WorldBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function Experience() {
  const {
    mode,
    transitioning,
    audio,
    setAudio,
    quality,
    setQuality,
    reducedMotion,
    setReduced,
    visited,
    open,
    skip,
  } = useExperienceStore();
  const [flat, setFlat] = useState(false);
  const [menu, setMenu] = useState(false);
  useAudio(audio);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const handler = () => setReduced(media.matches);
    media.addEventListener("change", handler);
    if (innerWidth < 700 || navigator.hardwareConcurrency <= 4)
      setQuality("LOW");
    return () => media.removeEventListener("change", handler);
  }, [setReduced, setQuality]);
  useEffect(() => {
    if (flat && transitioning) {
      if (mode === "INTRO") skip();
      else useExperienceStore.getState().settle();
    }
  }, [flat, transitioning, mode, skip]);
  const world = mode === "WORLD" || mode === "INTRO";
  return (
    <main
      data-reduced-motion={reducedMotion}
      className={`experience ${!world ? "is-exploring" : ""}`}
    >
      <a href="#world-nav" className="skip-link" onClick={() => setMenu(true)}>
        Skip to navigation
      </a>
      <header>
        <a
          className="wordmark"
          href="./"
          aria-label="Shaivi’s little world home"
        >
          s<span>✳</span>
        </a>
        <div className="header-note">
          A SMALL WORLD.
          <br />A LITTLE BIT OF ME.
        </div>
        <button
          className="index-button"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
          aria-controls="world-nav"
        >
          {menu ? "Close" : "Explore"} <span>{menu ? "×" : "☷"}</span>
        </button>
      </header>
      {world && (
        <div className="world-heading">
          <p className="eyebrow">YOU’RE ALWAYS WELCOME HERE</p>
          <h1>
            Shaivi’s <i>little world.</i>
            <span>✧</span>
          </h1>
          <p>A place for ideas, daydreams, and everything in between.</p>
        </div>
      )}
      {!flat ? (
        <div className="canvas-wrap">
          <WorldBoundary onError={() => setFlat(true)}>
            <Canvas
              shadows={quality !== "LOW"}
              dpr={quality === "LOW" ? 1 : quality === "MEDIUM" ? 1.3 : 1.75}
              camera={{ position: [13, 13, 22], fov: 42 }}
              gl={{ antialias: quality !== "LOW", powerPreference: "default" }}
              fallback={
                <button
                  className="webgl-fallback"
                  onClick={() => setFlat(true)}
                >
                  3D is unavailable. Open the accessible portfolio →
                </button>
              }
              onCreated={({ gl }) => {
                gl.domElement.addEventListener(
                  "webglcontextlost",
                  () => setFlat(true),
                  { once: true },
                );
              }}
            >
              <Suspense fallback={null}>
                <World />
              </Suspense>
            </Canvas>
          </WorldBoundary>
        </div>
      ) : (
        <div className="flat-world">
          {sections.map((section) => (
            <article key={section}>
              <SectionContent section={section} />
            </article>
          ))}
        </div>
      )}
      {mode === "INTRO" && !flat && (
        <div className="intro">
          <span className="intro-star">✳</span>
          <p>Welcome to Shaivi’s little world.</p>
          <small>Look around.</small>
          <button onClick={skip}>Skip intro →</button>
        </div>
      )}
      {menu && (
        <nav
          id="world-nav"
          className="world-nav"
          aria-label="Portfolio sections"
        >
          {sections.map((s, i) => (
            <button
              key={s}
              disabled={transitioning}
              onClick={() => {
                open(s);
                setMenu(false);
              }}
            >
              <small>0{i + 1}</small>
              {labels[s]}
              <span>↗</span>
            </button>
          ))}
          <button
            onClick={() => {
              setFlat(!flat);
              setMenu(false);
            }}
          >
            {flat ? "Return to 3D" : "Read the simple version"}
          </button>
        </nav>
      )}
      <SectionOverlay flat={flat} />
      <footer>
        <div className="world-instruction">
          <span className="compass">✥</span>
          <div>
            {world ? "Follow your curiosity." : "A little closer."}
            <small>
              {world
                ? "Tap an object to explore · drag to look around"
                : "Take your time. There’s more to discover."}
            </small>
          </div>
        </div>
        <div className="world-controls">
          <button
            aria-label={audio ? "Mute sound" : "Enable sound"}
            aria-pressed={audio}
            onClick={() => setAudio(!audio)}
          >
            {audio ? "♫" : "♪"}
            <span>Sound {audio ? "on" : "off"}</span>
          </button>
          <label className="quality">
            <span>Detail</span>
            <select
              aria-label="Graphics quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as typeof quality)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Balanced</option>
              <option value="HIGH">High</option>
            </select>
          </label>
          <button
            className="motion-toggle"
            aria-pressed={reducedMotion}
            onClick={() => setReduced(!reducedMotion)}
            aria-label="Reduce motion"
          >
            {reducedMotion ? "Still" : "Motion"}
          </button>
        </div>
      </footer>
      {world && (
        <div className="discovery">
          {String(visited.length).padStart(2, "0")}{" "}
          <span>/ 06 little discoveries</span>
        </div>
      )}
    </main>
  );
}
