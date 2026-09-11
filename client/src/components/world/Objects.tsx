import { labels, type Section } from "@/data/portfolio";
import { useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useMusicStore } from "@/store/useMusicStore";
import type { ResolvedWorldTheme } from "@/types/world";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Group } from "three";
import HouseDetails from "./HouseDetails";
import { Ball, Box, Cylinder } from "./Shapes";

function ObjectLink({
  section,
  position,
  labelHeight = 2,
  children,
}: {
  section: Section;
  position: [number, number, number];
  labelHeight?: number;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const worldSettings = useWorldSettings();
  const mode = useExperienceStore((s) => s.mode);
  const busy = useExperienceStore((s) => s.transitioning);
  const open = useExperienceStore((s) => s.open);

  const secConfig = worldSettings.sections?.[section];
  if (secConfig && secConfig.enabled === false) {
    return null;
  }

  const active = mode === "WORLD" && !busy;
  const hoverPreset = worldSettings.interactions?.hoverScale || "NORMAL";
  const hoverScale = hover
    ? hoverPreset === "NONE"
      ? 1.0
      : hoverPreset === "SUBTLE"
        ? 1.02
        : hoverPreset === "PLAYFUL"
          ? 1.06
          : 1.035
    : 1;

  const defaultIcon =
    section === "QUOTES"
      ? "✳"
      : section === "ABOUT"
        ? "⌂"
        : section === "GALLERY"
          ? "▧"
          : section === "JOURNEY"
            ? "✧"
            : section === "CONTACT"
              ? "✉"
              : "♫";

  const displayIcon = secConfig?.icon || defaultIcon;
  const displayLabel = secConfig?.label || labels[section];

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        if (active) {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        if (active) {
          e.stopPropagation();
          document.body.style.cursor = "auto";
          setHover(false);
          open(section);
        }
      }}
    >
      <group scale={hoverScale}>{children}</group>
      {active && (
        <Html center position={[0, labelHeight, 0]} zIndexRange={[20, 10]}>
          <button
            className={`world-label ${hover ? "hovered" : ""}`}
            onClick={() => {
              setHover(false);
              document.body.style.cursor = "auto";
              open(section);
            }}
          >
            <span>{displayIcon}</span>
            {displayLabel}
          </button>
        </Html>
      )}
    </group>
  );
}

export function House({ theme }: { theme?: ResolvedWorldTheme } = {}) {
  const door = useRef<Group>(null);
  const worldSettings = useWorldSettings();
  const mode = useExperienceStore((s) => s.mode);
  const obj = worldSettings.objects?.house;

  useFrame((_, dt) => {
    if (door.current)
      door.current.rotation.y +=
        ((mode === "ABOUT" ? -1.3 : 0) - door.current.rotation.y) *
        Math.min(dt * 5, 1);
  });

  if (obj && obj.visible === false) return null;

  const wallColor = obj?.wallColor || "#e9cfaa";
  const roofColor = obj?.roofColor || "#b46d57";
  const doorColor = obj?.doorColor || "#75877a";
  const currentPeriod = useExperienceStore((s) => s.currentTimeOfDay);
  const profileKey = (currentPeriod?.toLowerCase() || "day") as
    | "morning"
    | "day"
    | "sunset"
    | "night";
  const glowMultiplier =
    theme !== undefined
      ? theme.windowGlowMultiplier
      : worldSettings.dayNight?.enabled !== false
        ? (worldSettings.dayNight?.profiles?.[profileKey]
            ?.windowGlowMultiplier ?? 1.0)
        : 1.0;

  return (
    <ObjectLink section="ABOUT" position={[0, 0.15, -1.1]} labelHeight={3.2}>
      <HouseDetails
        windowGlowEnabled={obj?.windowGlowEnabled ?? true}
        windowGlowColor={obj?.windowGlowColor || "#f7ddb0"}
        windowGlowIntensity={obj?.windowGlowIntensity ?? 0.35}
        glowMultiplier={glowMultiplier}
        chimneySmokeEnabled={obj?.chimneySmokeEnabled ?? true}
        plantsEnabled={obj?.plantsEnabled ?? true}
      />
      <Box position={[0, 1, 0]} scale={[2.1, 1.9, 1.65]} color={wallColor} />
      <mesh position={[0, 2.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.85, 1.15, 4]} />
        <meshStandardMaterial color={roofColor} roughness={1} />
      </mesh>
      <Box
        position={[0.65, 2.65, -0.3]}
        scale={[0.3, 0.85, 0.32]}
        color="#b38671"
      />
      <Box position={[0, 0.1, 1]} scale={[1.1, 0.15, 0.55]} color="#e1d4b9" />
      <group ref={door} position={[-0.32, 0.75, 0.84]}>
        <Box
          position={[0.3, 0, 0]}
          scale={[0.6, 1.4, 0.08]}
          color={doorColor}
        />
        <Ball position={[0.5, 0, 0.07]} scale={0.04} color="#e5ba6d" />
      </group>
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 1.1, 0.84]}>
          <Box scale={[0.48, 0.55, 0.07]} color="#fcdf9e" />
          <Box scale={[0.04, 0.62, 0.1]} color="#a98168" />
          <Box scale={[0.54, 0.04, 0.1]} color="#a98168" />
          <Box
            position={[0, -0.35, 0.1]}
            scale={[0.63, 0.16, 0.25]}
            color="#b67860"
          />
          <Box
            position={[0, -0.22, 0.12]}
            scale={[0.55, 0.12, 0.18]}
            color="#7c9265"
          />
        </group>
      ))}
    </ObjectLink>
  );
}

export function Desk() {
  const mode = useExperienceStore((s) => s.mode);
  const worldSettings = useWorldSettings();
  const obj = worldSettings.objects?.desk;

  if (obj && obj.visible === false) return null;

  const woodColor = obj?.woodColor || "#b89372";
  const frameColor = obj?.frameColor || "#4a5555";
  const screenInactiveColor = obj?.screenInactiveColor || "#a7b8b3";
  const screenActiveColor = obj?.screenActiveColor || "#efe9df";

  return (
    <ObjectLink section="QUOTES" position={[1.4, 0.12, 2.1]} labelHeight={2.1}>
      <Box position={[0, 0.78, 0]} scale={[1.8, 0.13, 0.8]} color={woodColor} />
      {[-0.75, 0.75].flatMap((x) =>
        [-0.28, 0.28].map((z) => (
          <Box
            key={`${x}${z}`}
            position={[x, 0.38, z]}
            scale={[0.08, 0.76, 0.08]}
            color="#786756"
          />
        )),
      )}
      <Box
        position={[0, 1.4, 0]}
        scale={[1.25, 0.83, 0.1]}
        color={frameColor}
      />
      <Box
        position={[0.73, 1.4, 0]}
        scale={[0.24, 0.83, 0.18]}
        color="#ac8867"
      />
      {[1.25, 1.55].map((y) => (
        <Cylinder
          key={y}
          position={[0.74, y, 0.12]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.07, 0.05, 0.07]}
          color="#d9c5a6"
        />
      ))}
      <Cylinder
        position={[-0.3, 1.97, 0]}
        rotation={[0, 0, 0.4]}
        scale={[0.012, 0.45, 0.012]}
        color="#777364"
      />
      <Box
        position={[0, 1.4, 0.061]}
        scale={[1.13, 0.7, 0.025]}
        color={mode === "QUOTES" ? screenActiveColor : screenInactiveColor}
      />
      <Box position={[0, 0.97, 0]} scale={[0.1, 0.3, 0.1]} color="#5b615b" />
      <Box
        position={[0, 0.85, 0.02]}
        scale={[0.5, 0.03, 0.27]}
        color="#5b615b"
      />
      <Box
        position={[0, 0.86, 0.25]}
        scale={[0.65, 0.025, 0.2]}
        color="#e4ded0"
      />
      <Ball
        position={[0.5, 0.86, 0.25]}
        scale={[0.07, 0.03, 0.09]}
        color="#e6dfd0"
      />
      <Cylinder
        position={[-0.68, 0.96, 0.05]}
        scale={[0.1, 0.23, 0.1]}
        color="#e0b89b"
      />
      <Box
        position={[0.5, 0.96, -0.2]}
        scale={[0.24, 0.2, 0.16]}
        color="#bca175"
      />
    </ObjectLink>
  );
}

export function ArtWall() {
  const worldSettings = useWorldSettings();
  const obj = worldSettings.objects?.artWall;

  if (obj && obj.visible === false) return null;

  const frameColor = obj?.frameColor || "#a88364";
  const canvasColor = obj?.canvasColor || "#f2d9b8";
  const easelColor = obj?.easelColor || "#967655";

  return (
    <ObjectLink
      section="GALLERY"
      position={[-2.8, 0.12, -0.3]}
      labelHeight={2.4}
    >
      <Box position={[0, 1.2, 0]} scale={[1.1, 1.45, 0.1]} color={frameColor} />
      <Box
        position={[0, 1.2, 0.07]}
        scale={[0.94, 1.28, 0.03]}
        color={canvasColor}
      />
      <Ball
        position={[-0.1, 1.43, 0.1]}
        scale={[0.28, 0.28, 0.02]}
        color="#c88968"
      />
      <Box
        position={[0, 0.86, 0.1]}
        scale={[0.93, 0.5, 0.025]}
        color="#8f9c82"
      />
      {[-0.38, 0.38].map((x) => (
        <Box
          key={x}
          position={[x, 0.65, -0.04]}
          rotation={[0, 0, -x * 0.25]}
          scale={[0.07, 1.5, 0.09]}
          color={easelColor}
        />
      ))}
      <Box
        position={[0, 0.49, 0.15]}
        scale={[1.3, 0.08, 0.3]}
        color="#9e7b60"
      />
    </ObjectLink>
  );
}

export function Telescope() {
  const worldSettings = useWorldSettings();
  const obj = worldSettings.objects?.telescope;

  if (obj && obj.visible === false) return null;

  const bodyColor = obj?.bodyColor || "#ede0bb";
  const standColor = obj?.standColor || "#9b7f61";
  const accentColor = obj?.accentColor || "#556478";

  return (
    <ObjectLink
      section="JOURNEY"
      position={[1.65, 0.35, -2.5]}
      labelHeight={2.5}
    >
      <Cylinder
        position={[0, -0.25, 0]}
        scale={[0.85, 0.12, 0.85]}
        color="#9cb07e"
      />
      {[0, 2.1, 4.2].map((a) => (
        <Cylinder
          key={a}
          position={[Math.sin(a) * 0.22, 0.6, Math.cos(a) * 0.22]}
          rotation={[Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35]}
          scale={[0.035, 1.15, 0.035]}
          color={standColor}
        />
      ))}
      <group position={[0, 1.35, 0]} rotation={[0.75, 0, -0.65]}>
        <Cylinder scale={[0.15, 0.9, 0.15]} color={bodyColor} />
        <Cylinder
          position={[0, 0.5, 0]}
          scale={[0.18, 0.12, 0.18]}
          color="#776957"
        />
        <Cylinder
          position={[0, 0.57, 0]}
          scale={[0.13, 0.02, 0.13]}
          color={accentColor}
        />
      </group>
    </ObjectLink>
  );
}

export function Mailbox() {
  const lid = useRef<Group>(null);
  const mode = useExperienceStore((s) => s.mode);
  const worldSettings = useWorldSettings();
  const obj = worldSettings.objects?.mailbox;

  useFrame((_, dt) => {
    if (lid.current)
      lid.current.rotation.x +=
        ((mode === "CONTACT" ? 1.3 : 0) - lid.current.rotation.x) *
        Math.min(dt * 5, 1);
  });

  if (obj && obj.visible === false) return null;

  const bodyColor = obj?.bodyColor || "#b67469";
  const postColor = obj?.postColor || "#967857";
  const flagColor = obj?.flagColor || "#e8c886";

  return (
    <ObjectLink
      section="CONTACT"
      position={[-0.5, 0.12, 3.1]}
      labelHeight={1.6}
    >
      <Box position={[0, 0.45, 0]} scale={[0.1, 0.9, 0.1]} color={postColor} />
      <Box position={[0, 0.95, 0]} scale={[0.56, 0.4, 0.5]} color={bodyColor} />
      <group ref={lid} position={[0, 0.75, 0.26]}>
        <Box
          position={[0, 0.19, 0]}
          scale={[0.56, 0.4, 0.045]}
          color="#d08e7c"
        />
      </group>
      <Box
        position={[0.33, 1.12, 0]}
        scale={[0.04, 0.32, 0.04]}
        color="#775e54"
      />
      <Box
        position={[0.41, 1.25, 0]}
        scale={[0.2, 0.12, 0.045]}
        color={flagColor}
      />
      {mode === "CONTACT" && (
        <Box
          position={[0, 1.13, 0.4]}
          rotation={[-0.3, 0, 0]}
          scale={[0.4, 0.24, 0.015]}
          color="#fff1d9"
        />
      )}
    </ObjectLink>
  );
}

export function RecordPlayer() {
  const hand = useRef<Group>(null);
  const mode = useExperienceStore((s) => s.mode);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const worldSettings = useWorldSettings();
  const obj = worldSettings.objects?.clock;

  useFrame((_, dt) => {
    if (hand.current && (mode === "MUSIC" || isPlaying) && !reduced)
      hand.current.rotation.z -= dt * 0.8;
  });

  if (obj && obj.visible === false) return null;

  const bodyColor = obj?.bodyColor || "#ac876a";
  const faceColor = obj?.faceColor || "#f0ddb6";
  const handColor = obj?.handColor || "#596555";

  return (
    <ObjectLink section="MUSIC" position={[3, 0.12, 0.3]} labelHeight={1.7}>
      <Box position={[0, 0.46, 0]} scale={[1, 0.09, 0.7]} color="#9f8065" />
      {[-0.4, 0.4].map((x) => (
        <Box
          key={x}
          position={[x, 0.24, 0]}
          scale={[0.06, 0.45, 0.5]}
          color="#81644e"
        />
      ))}
      <Cylinder
        position={[0, 1.02, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.5, 0.19, 0.5]}
        color={bodyColor}
      />
      <Cylinder
        position={[0, 1.02, 0.11]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.44, 0.025, 0.44]}
        color={faceColor}
      />
      {Array.from({ length: 12 }, (_, i) => (
        <Ball
          key={i}
          position={[
            Math.sin((i * Math.PI) / 6) * 0.35,
            1.02 + Math.cos((i * Math.PI) / 6) * 0.35,
            0.14,
          ]}
          scale={0.024}
          color="#7e735d"
        />
      ))}
      <group ref={hand} position={[0, 1.02, 0.15]}>
        <Box
          position={[0, 0.12, 0]}
          scale={[0.025, 0.26, 0.02]}
          color={handColor}
        />
      </group>
      <Box
        position={[-0.09, 1.05, 0.16]}
        rotation={[0, 0, 1.1]}
        scale={[0.025, 0.22, 0.02]}
        color={handColor}
      />
      <Ball position={[0, 1.02, 0.18]} scale={0.04} color="#aa7958" />
      {[-0.32, 0.32].map((x) => (
        <Ball
          key={x}
          position={[x, 1.49, 0]}
          scale={[0.2, 0.08, 0.12]}
          color="#aa7958"
        />
      ))}
    </ObjectLink>
  );
}
