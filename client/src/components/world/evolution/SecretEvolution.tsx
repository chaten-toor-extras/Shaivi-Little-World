"use client";

import React, { useRef } from "react";
import { EVOLUTION_PLACEMENTS } from "@/data/worldEvolutionPlacements";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SecretEvolutionProps {
  meadowFlowerVisible: boolean;
  firefliesVisible: boolean;
  isNewFlower?: boolean;
  isNewFireflies?: boolean;
  quality?: "LOW" | "MEDIUM" | "HIGH";
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

const ignoreRaycast = () => null;

export default function SecretEvolution({
  meadowFlowerVisible,
  firefliesVisible,
  isNewFlower,
  quality = "MEDIUM",
  theme,
  reducedMotion,
}: SecretEvolutionProps) {
  const flowerRef = useRef<THREE.Group>(null);
  const firefliesRef = useRef<THREE.Group>(null);
  const animProgress = useRef(isNewFlower ? 0 : 1);

  const isNight = theme?.period === "NIGHT";
  const glowIntensity = isNight ? 0.8 : 0.25;

  useFrame(({ clock }, dt) => {
    if (flowerRef.current && meadowFlowerVisible) {
      if (animProgress.current < 1 && !reducedMotion) {
        animProgress.current = Math.min(1, animProgress.current + dt * 1.5);
        flowerRef.current.scale.setScalar(animProgress.current);
      } else {
        flowerRef.current.scale.setScalar(1);
      }
    }

    if (firefliesRef.current && firefliesVisible && !reducedMotion) {
      const t = clock.elapsedTime;
      firefliesRef.current.position.y =
        EVOLUTION_PLACEMENTS.SECRET_FIREFLIES[1] + Math.sin(t * 1.4) * 0.08;
      firefliesRef.current.rotation.y = t * 0.15;
    }
  });

  // Skip fireflies on LOW quality
  const showFireflies = firefliesVisible && quality !== "LOW";

  return (
    <>
      {/* 1. Luminous Wildflower Cluster on Central Meadow Knoll */}
      {meadowFlowerVisible && (
        <group
          ref={flowerRef}
          position={EVOLUTION_PLACEMENTS.SECRET_MEADOW_FLOWER}
        >
          {[
            { pos: [-0.08, 0.06, -0.06] as const, color: "#f7d070", stem: 0.14 },
            { pos: [0.06, 0.08, 0.05] as const, color: "#f5df82", stem: 0.18 },
            { pos: [-0.02, 0.07, 0.09] as const, color: "#e8c258", stem: 0.16 },
            { pos: [0.1, 0.05, -0.04] as const, color: "#f7e394", stem: 0.12 },
          ].map((f, i) => (
            <group key={i} position={f.pos}>
              {/* Slender green stem */}
              <mesh
                raycast={ignoreRaycast}
                position={[0, f.stem * 0.5, 0]}
              >
                <cylinderGeometry args={[0.008, 0.008, f.stem, 6]} />
                <meshStandardMaterial color="#6a8759" roughness={0.8} />
              </mesh>
              {/* Soft blooming buttercup flower head */}
              <mesh
                raycast={ignoreRaycast}
                position={[0, f.stem + 0.015, 0]}
              >
                <sphereGeometry args={[0.038, 8, 8]} />
                <meshStandardMaterial
                  color={f.color}
                  emissive={f.color}
                  emissiveIntensity={glowIntensity}
                  roughness={0.4}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 2. Capped Fairy Fireflies over the Wildflower Knoll */}
      {showFireflies && (
        <group
          ref={firefliesRef}
          position={EVOLUTION_PLACEMENTS.SECRET_FIREFLIES}
        >
          {[
            [-0.22, 0.05, -0.15],
            [0.18, 0.12, 0.14],
            [-0.08, -0.06, 0.22],
            [0.12, -0.08, -0.18],
            [0.0, 0.15, 0.0],
          ].map(([x, y, z], i) => (
            <mesh
              key={i}
              raycast={ignoreRaycast}
              position={[x, y, z]}
            >
              <sphereGeometry args={[0.022, 6, 6]} />
              <meshStandardMaterial
                color="#eef587"
                emissive="#dff573"
                emissiveIntensity={isNight ? 1.2 : 0.4}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
}

