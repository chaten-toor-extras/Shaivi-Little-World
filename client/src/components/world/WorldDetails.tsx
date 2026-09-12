import { RESOLVED_WORLD_OBJECTS } from "@/data/worldLayout";
import { useWorldSettings } from "@/providers/ContentProvider";
import { safeEmitSecretEvent } from "@/services/secretEventBus";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { ResolvedWorldTheme } from "@/types/world";
import { resolveWorldTheme } from "@/utils/timeOfDay";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, Group, Mesh } from "three";
import { Ball, Box, Cylinder } from "./Shapes";

interface WorldDetailsProps {
  theme?: ResolvedWorldTheme;
}

export default function WorldDetails({ theme }: WorldDetailsProps) {
  const worldSettings = useWorldSettings();
  const details = worldSettings.environment?.details;
  const pond = worldSettings.island?.pond;
  const quality = useExperienceStore((s) => s.quality);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const currentPeriod = useExperienceStore((s) => s.currentTimeOfDay);

  const effectiveTheme = useMemo(() => {
    if (theme) return theme;
    return resolveWorldTheme({
      base: worldSettings,
      dayNight: worldSettings.dayNight,
      period: currentPeriod || "DAY",
      quality,
      reducedMotion: reduced,
    });
  }, [theme, worldSettings, currentPeriod, quality, reduced]);

  const userOverrodeLamp = useRef(false);
  const [lit, setLit] = useState(effectiveTheme.lampDefaultLit);

  useEffect(() => {
    if (!userOverrodeLamp.current) {
      setLit(effectiveTheme.lampDefaultLit);
    }
  }, [effectiveTheme.lampDefaultLit]);

  const ripple = useRef<Mesh>(null);
  const steam = useRef<Group>(null);
  const motes = useRef<Group>(null);
  const rippleAge = useRef(2);
  const steamAge = useRef(3);

  const motionMult = effectiveTheme.motionSpeedMultiplier;

  useFrame(({ clock }, dt) => {
    rippleAge.current += dt;
    steamAge.current += dt;
    if (ripple.current) {
      ripple.current.visible = rippleAge.current < 1.5;
      ripple.current.scale.setScalar(
        reduced ? 0.7 : 0.1 + rippleAge.current * 0.5,
      );
    }
    if (steam.current) {
      steam.current.visible = steamAge.current < 2;
      steam.current.position.y = reduced
        ? 0
        : steamAge.current * 0.12 * motionMult;
    }
    if (motes.current && !reduced) {
      const speed =
        0.65 * Math.max(0.3, effectiveTheme.firefliesMultiplier) * motionMult;
      motes.current.position.y = Math.sin(clock.elapsedTime * speed) * 0.09;
    }
  });

  const allowed = () => useExperienceStore.getState().mode === "WORLD";

  const motesActive =
    (details?.motesEnabled ?? true) &&
    details?.motesAmount !== "OFF" &&
    quality !== "LOW" &&
    effectiveTheme.firefliesMultiplier > 0;
  const baseMotesCount = details?.motesAmount === "SUBTLE" ? 4 : 8;
  const motesCount = Math.max(
    1,
    Math.round(baseMotesCount * effectiveTheme.firefliesMultiplier),
  );

  const lampGlow = useMemo(() => {
    if (!lit) return "#807b69";
    const baseColor = details?.lampGlowColor || "#f7dfa0";
    if (
      !effectiveTheme.lampGlowMultiplier ||
      effectiveTheme.lampGlowMultiplier === 1
    ) {
      return baseColor;
    }
    try {
      const c = new Color(baseColor);
      c.multiplyScalar(Math.min(1.8, effectiveTheme.lampGlowMultiplier));
      return `#${c.getHexString()}`;
    } catch {
      return baseColor;
    }
  }, [lit, details?.lampGlowColor, effectiveTheme.lampGlowMultiplier]);

  return (
    <>
      {/* Lamp */}
      {(details?.lampEnabled ?? true) && (
        <group
          position={RESOLVED_WORLD_OBJECTS.LAMP}
          onClick={(e) => {
            if (allowed()) {
              e.stopPropagation();
              userOverrodeLamp.current = true;
              setLit(!lit);
              safeEmitSecretEvent({
                type: "TOGGLE",
                targetType: "LAMP",
                targetId: "main-lamp",
              });
            }
          }}
        >
          <Cylinder
            position={[0, 0.5, 0]}
            scale={[0.035, 1, 0.035]}
            color={details?.lampPostColor || "#657058"}
          />
          <Box
            position={[0, 1.05, 0]}
            scale={[0.24, 0.3, 0.24]}
            color={lampGlow}
          />
          <Box
            position={[0, 1.23, 0]}
            scale={[0.33, 0.07, 0.33]}
            color={details?.lampPostColor || "#657058"}
          />
        </group>
      )}

      {/* Ripple */}
      {(pond?.rippleEnabled ?? true) && (
        <>
          <mesh
            position={[
              RESOLVED_WORLD_OBJECTS.POND[0],
              0.17,
              RESOLVED_WORLD_OBJECTS.POND[2],
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              if (allowed()) {
                e.stopPropagation();
                rippleAge.current = 0;
                safeEmitSecretEvent({
                  type: "RIPPLE",
                  targetType: "POND",
                  targetId: "main-pond",
                });
              }
            }}
          >
            <circleGeometry args={[0.95, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh
            ref={ripple}
            position={[
              RESOLVED_WORLD_OBJECTS.POND[0],
              0.18,
              RESOLVED_WORLD_OBJECTS.POND[2],
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.83, 0.88, 32]} />
            <meshBasicMaterial
              color={pond?.rippleColor || "#edf4e7"}
              transparent
              opacity={0.65}
            />
          </mesh>
        </>
      )}

      {/* Bridge */}
      {(details?.bridgeVisible ?? true) && (
        <group position={RESOLVED_WORLD_OBJECTS.BRIDGE}>
          {Array.from({ length: 6 }, (_, i) => (
            <Box
              key={i}
              position={[i * 0.21 - 0.52, 0.06 * Math.sin(i * 0.6), 0]}
              scale={[0.19, 0.07, 0.38]}
              color={details?.bridgeColor || "#b69a76"}
            />
          ))}
        </group>
      )}

      {/* Mug Steam */}
      {(details?.mugSteamEnabled ?? true) && (
        <>
          <mesh
            position={[
              RESOLVED_WORLD_OBJECTS.DESK[0] - 0.68,
              RESOLVED_WORLD_OBJECTS.DESK[1] + 1.04,
              RESOLVED_WORLD_OBJECTS.DESK[2] + 0.05,
            ]}
            scale={0.14}
            onClick={(e) => {
              if (allowed()) {
                e.stopPropagation();
                steamAge.current = 0;
              }
            }}
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <group ref={steam}>
            {[0, 1, 2].map((i) => (
              <Ball
                key={i}
                position={[
                  RESOLVED_WORLD_OBJECTS.DESK[0] - 0.68,
                  RESOLVED_WORLD_OBJECTS.DESK[1] + 1.15 + i * 0.1,
                  RESOLVED_WORLD_OBJECTS.DESK[2] + 0.05,
                ]}
                scale={[0.05, 0.08, 0.05]}
                color="#efdfcb"
                castShadow={false}
              />
            ))}
          </group>
        </>
      )}

      {/* Books */}
      {(details?.booksVisible ?? true) && (
        <group
          position={[
            RESOLVED_WORLD_OBJECTS.BENCH[0],
            RESOLVED_WORLD_OBJECTS.BENCH[1] + 0.15,
            RESOLVED_WORLD_OBJECTS.BENCH[2],
          ]}
          onClick={(e) => {
            if (allowed()) {
              e.stopPropagation();
              safeEmitSecretEvent({
                type: "CLICK",
                targetType: "BOOKS",
                targetId: "island-books",
              });
            }
          }}
        >
          {["#9485a0", "#c3ac78", "#879773"].map((c, i) => (
            <Box
              key={c}
              position={[0, i * 0.065, 0]}
              rotation={[0, i * 0.12, 0]}
              scale={[0.35, 0.06, 0.28]}
              color={c}
            />
          ))}
        </group>
      )}

      {/* Motes */}
      {motesActive && (
        <group ref={motes}>
          {Array.from({ length: motesCount }, (_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin(i * 2.4) * 4.2,
                0.5 + (i % 4) * 0.35,
                Math.cos(i * 2.4) * 3.0,
              ]}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial
                color={
                  details?.motesColor ||
                  (effectiveTheme.period === "NIGHT" ? "#d7f57a" : "#ffeab5")
                }
              />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
}
