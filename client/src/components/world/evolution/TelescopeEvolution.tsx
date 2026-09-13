"use client";

import React, { useRef } from "react";
import { EVOLUTION_PLACEMENTS } from "@/data/worldEvolutionPlacements";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TelescopeEvolutionProps {
  starsVisible: boolean;
  lensVisible: boolean;
  isNew?: boolean;
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

const ignoreRaycast = () => null;

export default function TelescopeEvolution({
  starsVisible,
  lensVisible,
  isNew,
  theme,
  reducedMotion,
}: TelescopeEvolutionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(isNew ? 0 : 1);

  const isNight = theme?.period === "NIGHT" || theme?.period === "SUNSET";
  const starGlowIntensity = isNight ? 0.9 : 0.35;
  const lensGlowColor = isNight ? "#ffeab0" : "#d9c59a";

  useFrame(({ clock }, dt) => {
    if (!groupRef.current) return;

    if (animProgress.current < 1 && !reducedMotion) {
      animProgress.current = Math.min(1, animProgress.current + dt * 1.5);
      groupRef.current.scale.setScalar(animProgress.current);
    } else {
      groupRef.current.scale.setScalar(1);
    }

    if (!reducedMotion && starsVisible) {
      const t = clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.04;
    }
  });

  return (
    <>
      {/* 1. Localized Constellation Star Accent Overhead */}
      {starsVisible && (
        <group
          ref={groupRef}
          position={EVOLUTION_PLACEMENTS.TELESCOPE_STARS}
        >
          {[
            [-0.24, 0.12, 0.0],
            [-0.08, 0.28, 0.1],
            [0.15, 0.18, -0.08],
            [0.32, -0.05, 0.05],
            [0.05, -0.15, 0.12],
          ].map(([x, y, z], i) => (
            <mesh
              key={i}
              raycast={ignoreRaycast}
              position={[x, y, z]}
            >
              <sphereGeometry args={[0.024 + (i % 2) * 0.008, 8, 8]} />
              <meshStandardMaterial
                color="#ffecc0"
                emissive="#ffdf88"
                emissiveIntensity={starGlowIntensity}
                transparent
                opacity={isNight ? 0.95 : 0.6}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. Soft Eyepiece Brass Shimmer on the Telescope */}
      {lensVisible && (
        <group position={EVOLUTION_PLACEMENTS.TELESCOPE_LENS}>
          <mesh raycast={ignoreRaycast} rotation={[0.4, 0, 0]}>
            <ringGeometry args={[0.045, 0.07, 16]} />
            <meshStandardMaterial
              color={lensGlowColor}
              emissive={lensGlowColor}
              emissiveIntensity={isNight ? 0.7 : 0.25}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </>
  );
}

