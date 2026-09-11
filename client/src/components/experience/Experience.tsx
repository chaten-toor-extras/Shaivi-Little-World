"use client";
import { labels, sections } from "@/data/portfolio";
import { useAudio } from "@/hooks/useAudio";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useSiteSettings, useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useMusicStore } from "@/store/useMusicStore";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SectionContent } from "../ui/Content";
import SecretModal from "../ui/SecretModal";
import SectionOverlay from "../ui/SectionOverlay";
import GlobalAudioPlayer from "./GlobalAudioPlayer";

// Suppress internal library deprecation noise (e.g. THREE.Clock in Three.js r183 from @react-three/fiber)
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Clock: This module has been deprecated")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

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
  const site = useSiteSettings();
  const worldSettings = useWorldSettings();
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
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (flat || sceneReady) return;
    const timeout = setTimeout(() => setFlat(true), 12000);
    return () => clearTimeout(timeout);
  }, [flat, sceneReady]);

  const [menu, setMenu] = useState(false);
  const isMusicPlaying = useMusicStore((s) => s.isPlaying);
  const musicPlay = useMusicStore((s) => s.play);
  const musicPause = useMusicStore((s) => s.pause);
  const setMusicVolume = useMusicStore((s) => s.setVolume);

  const defaultVolume = worldSettings.ambience?.defaultVolume ?? 70;

  useEffect(() => {
    if (typeof worldSettings.ambience?.defaultVolume === "number") {
      setMusicVolume(worldSettings.ambience.defaultVolume);
    }
  }, [worldSettings.ambience?.defaultVolume, setMusicVolume]);

  const isSoundActive = audio || isMusicPlaying;
  useAudio(audio && !isMusicPlaying, defaultVolume);

  const handleToggleSound = () => {
    if (isSoundActive) {
      musicPause();
      setAudio(false);
    } else {
      setAudio(true);
      musicPlay();
    }
  };

  useEffect(() => {
    if (!menu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menu]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const handler = () => setReduced(media.matches);
    media.addEventListener("change", handler);
    if (innerWidth < 700 || navigator.hardwareConcurrency <= 4)
      setQuality("LOW");
    return () => media.removeEventListener("change", handler);
  }, [setReduced, setQuality]);

  // If intro is disabled via CMS, bypass intro smoothly
  useEffect(() => {
    if (worldSettings.intro?.enabled === false && mode === "INTRO") {
      skip();
    }
  }, [worldSettings.intro?.enabled, mode, skip]);

  useEffect(() => {
    if (flat && transitioning) {
      if (mode === "INTRO") skip();
      else useExperienceStore.getState().settle();
    }
  }, [flat, transitioning, mode, skip]);

  const world = mode === "WORLD" || mode === "INTRO";

  const enabledSections = sections.filter(
    (s) => worldSettings.sections?.[s]?.enabled ?? true,
  );

  const getSectionLabel = (s: (typeof sections)[number]) => {
    return (
      worldSettings.sections?.[s]?.label ||
      site?.sectionLabels?.[s] ||
      labels[s]
    );
  };

  const wordmarkText =
    worldSettings.identity?.wordmark || site?.wordmark || "s✳";
  const exploreLabel =
    worldSettings.identity?.exploreLabel || site?.exploreLabel || "Explore";

  const visitedEnabled = visited.filter((s) => enabledSections.includes(s));

  const { effectivePeriod, timeOfDayOverride, setTimeOfDayOverride, mounted } =
    useTimeOfDay();
  const profileKey = effectivePeriod.toLowerCase() as
    | "morning"
    | "day"
    | "sunset"
    | "night";
  const currentProfile =
    worldSettings.dayNight?.enabled !== false
      ? worldSettings.dayNight?.profiles?.[profileKey]
      : undefined;

  const defaultBg = worldSettings.scene?.backgroundColor || "#d5cbdc";
  const bgColor = currentProfile?.backgroundColor || defaultBg;
  const renderBg = mounted ? bgColor : defaultBg;

  const isDark = useMemo(() => {
    const activeColor = mounted ? bgColor : defaultBg;
    if (!activeColor || !/^#[0-9a-fA-F]{6}$/.test(activeColor)) return false;
    const r = parseInt(activeColor.slice(1, 3), 16);
    const g = parseInt(activeColor.slice(3, 5), 16);
    const b = parseInt(activeColor.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 135;
  }, [bgColor, defaultBg, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.style.setProperty("--world-bg", bgColor);
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
  }, [bgColor, mounted]);

  return (
    <main
      data-reduced-motion={reducedMotion}
      data-theme={isDark ? "dark" : "light"}
      className={`experience ${!world ? "is-exploring" : ""}`}
      style={
        {
          backgroundColor: renderBg,
          "--world-bg": renderBg,
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <a href="#world-nav" className="skip-link" onClick={() => setMenu(true)}>
        Skip to navigation
      </a>
      <header>
        <a
          className="wordmark"
          href="./"
          aria-label={`${worldSettings.identity?.worldTitle || site?.title || "Shaivi’s little world"} home`}
        >
          {wordmarkText ? (
            <>
              {wordmarkText[0]}
              <span>{wordmarkText.slice(1)}</span>
            </>
          ) : (
            <>
              s<span>✳</span>
            </>
          )}
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
          {menu ? "Close" : exploreLabel} <span>{menu ? "×" : "☷"}</span>
        </button>
      </header>
      {mode === "WORLD" && (
        <div className="world-heading">
          <p className="eyebrow">
            {worldSettings.intro?.eyebrow || "YOU’RE ALWAYS WELCOME HERE"}
          </p>
          <h1>
            {worldSettings.intro?.heading ? (
              worldSettings.intro.heading
            ) : site?.introHeading ? (
              site.introHeading
            ) : (
              <>
                Shaivi’s <i>little world.</i>
                <span>✧</span>
              </>
            )}
          </h1>
          <p>
            {worldSettings.intro?.body ||
              site?.introDescription ||
              "A place for ideas, daydreams, and everything in between."}
          </p>
        </div>
      )}
      {!flat ? (
        <div className="canvas-wrap">
          <WorldBoundary onError={() => setFlat(true)}>
            <Canvas
              shadows={quality === "LOW" ? false : "percentage"}
              dpr={quality === "LOW" ? 1 : quality === "MEDIUM" ? 1.3 : 1.75}
              camera={{ position: [10.5, 11, 17], fov: 38 }}
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
                <World onReady={() => setSceneReady(true)} />
              </Suspense>
            </Canvas>
          </WorldBoundary>
        </div>
      ) : (
        <div className="flat-world">
          {enabledSections.map((section) => (
            <article key={section}>
              <SectionContent section={section} />
            </article>
          ))}
        </div>
      )}
      {mode === "INTRO" && !flat && (worldSettings.intro?.enabled ?? true) && (
        <div className="intro">
          {(worldSettings.intro?.starEnabled ?? true) && (
            <span className="intro-star" aria-hidden="true">
              ✳
            </span>
          )}
          <p>
            {worldSettings.intro?.body ||
              site?.introSubtext ||
              "Welcome to Shaivi’s little world."}
          </p>
          <small>Look around.</small>
          <button onClick={skip}>
            {worldSettings.intro?.enterButtonLabel || "Skip intro →"}
          </button>
        </div>
      )}
      {menu && (
        <>
          <div
            className="world-nav-backdrop"
            onClick={() => setMenu(false)}
            aria-hidden="true"
          />
          <nav
            id="world-nav"
            className="world-nav"
            aria-label="Portfolio sections"
          >
            <div className="world-nav-header">
              <span className="world-nav-tag">INDEX · SECTIONS</span>
            </div>
            <div className="world-nav-list">
              {enabledSections.map((s, i) => (
                <button
                  key={s}
                  className="world-nav-item"
                  disabled={transitioning}
                  onClick={() => {
                    open(s);
                    setMenu(false);
                  }}
                >
                  <small className="world-nav-num">0{i + 1}</small>
                  <span className="world-nav-label">{getSectionLabel(s)}</span>
                  <span className="world-nav-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              ))}
            </div>
            <div className="world-nav-footer">
              <button
                className="world-nav-alt"
                onClick={() => {
                  setFlat(!flat);
                  setMenu(false);
                }}
              >
                <span>
                  {flat ? "↻ Return to 3D World" : "✦ Read the simple version"}
                </span>
              </button>
            </div>
          </nav>
        </>
      )}
      <SectionOverlay />
      <SecretModal />
      <GlobalAudioPlayer />
      <footer>
        <div className="world-instruction">
          <span className="compass">✥</span>
          <div className="instruction-text">
            <span className="instruction-primary">
              {world
                ? site?.footerWorldText || "Follow your curiosity."
                : site?.footerExploreText || "A little closer."}
            </span>
            <small className="instruction-secondary">
              {world
                ? worldSettings.identity?.instructionText ||
                  site?.footerWorldInstruction ||
                  "Tap an object to explore · drag to look around"
                : site?.footerExploreInstruction ||
                  "Take your time. There’s more to discover."}
            </small>
          </div>
        </div>
        <div className="world-controls">
          <button
            className="control-button sound-button"
            aria-label={isSoundActive ? "Mute sound" : "Enable sound"}
            aria-pressed={isSoundActive}
            onClick={handleToggleSound}
          >
            <span className="control-icon">{isSoundActive ? "♫" : "♪"}</span>
            <span className="control-label">
              Sound {isSoundActive ? "on" : "off"}
            </span>
          </button>
          <label className="control-button quality">
            <span className="quality-label">Detail</span>
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
            className="control-button motion-toggle"
            aria-pressed={reducedMotion}
            onClick={() => setReduced(!reducedMotion)}
            aria-label="Reduce motion"
          >
            {reducedMotion ? "Still" : "Motion"}
          </button>
          {(worldSettings.dayNight?.enabled ?? true) &&
            (worldSettings.dayNight?.allowVisitorOverride ?? true) && (
              <label
                className="control-button quality time-select"
                title="Time of day"
              >
                <span className="quality-label">Time</span>
                <select
                  aria-label="Time of day"
                  value={mounted ? timeOfDayOverride : "AUTO"}
                  onChange={(e) =>
                    setTimeOfDayOverride(
                      e.target.value as typeof timeOfDayOverride,
                    )
                  }
                  suppressHydrationWarning
                >
                  <option value="AUTO" suppressHydrationWarning>
                    {mounted
                      ? `Auto (${effectivePeriod.toLowerCase()})`
                      : "Auto"}
                  </option>
                  <option value="MORNING">Dawn</option>
                  <option value="DAY">Day</option>
                  <option value="SUNSET">Sunset</option>
                  <option value="NIGHT">Night</option>
                </select>
              </label>
            )}
        </div>
      </footer>
      {world && (
        <div className="discovery">
          {String(visitedEnabled.length).padStart(2, "0")}{" "}
          <span>
            / {String(enabledSections.length).padStart(2, "0")}{" "}
            {worldSettings.identity?.discoveryLabel ||
              site?.discoveryLabel ||
              "little discoveries"}
          </span>
        </div>
      )}
    </main>
  );
}
