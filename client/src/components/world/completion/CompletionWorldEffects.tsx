"use client";

import { RESOLVED_WORLD_OBJECTS } from "@/data/worldLayout";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useCompletionCinematicStore } from "./useCompletionCinematicStore";

interface CompletionWorldEffectsProps {
  theme: ResolvedWorldTheme;
}

/**
 * Additive temporary visual effects layer active during the completion cinematic.
 * Features:
 * - Temporary window warmth boost via soft localized point light
 * - Deterministic, capped fairy motes floating above meadow & house
 * - Subtle telescope eyepiece constellation accent
 * - Subtle permanent star charm visible after first completion (purely decorative)
 *
 * All elements have raycast={() => null} to guarantee zero click interference.
 */
export default function CompletionWorldEffects({
  theme,
}: CompletionWorldEffectsProps) {
  const stage = useCompletionCinematicStore((s) => s.stage);
  const hasPlayed = useCompletionCinematicStore((s) => s.hasPlayed);
  const quality = useExperienceStore((s) => s.quality);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  const isActive =
    stage === "WORLD_GLOW" || stage === "MESSAGE" || stage === "RETURNING";

  // Lerp progress for smooth fade-in and fade-out of temporary accents
  const intensityRef = useRef(0);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // House coordinates from canonical layout
  const housePos = RESOLVED_WORLD_OBJECTS.HOUSE;
  const telescopePos = RESOLVED_WORLD_OBJECTS.TELESCOPE;

  // Quality-aware deterministic particle count
  const particleCount = useMemo(() => {
    if (reducedMotion) return 0;
    if (quality === "LOW") return 10;
    if (quality === "MEDIUM") return 20;
    return 32;
  }, [quality, reducedMotion]);

  // Deterministic seeded particle positions and velocities
  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const ph = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Deterministic pseudorandom spread around central meadow and house
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.2 + ((i * 17) % 23) * 0.12;
      const x = Math.cos(angle) * radius;
      const y = 0.95 + ((i * 13) % 19) * 0.08;
      const z = Math.sin(angle) * radius - 0.2;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      ph[i] = (i * 0.618) % 1.0;
    }

    return [pos, ph];
  }, [particleCount]);

  useFrame((_, delta) => {
    // Smooth lerp of temporary intensity (0 -> 1 when active, 1 -> 0 when inactive)
    const targetIntensity = isActive ? 1 : 0;
    intensityRef.current = THREE.MathUtils.damp(
      intensityRef.current,
      targetIntensity,
      isActive ? 2.5 : 4.0,
      delta
    );

    const currentIntensity = intensityRef.current;

    // 1. Modulate window glow point light
    if (pointLightRef.current) {
      pointLightRef.current.intensity = currentIntensity * 1.6;
    }

    // 2. Modulate motes animation & opacity
    if (pointsRef.current && pointsRef.current.material) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = currentIntensity * 0.75;

      if (!reducedMotion && currentIntensity > 0.01) {
        const geom = pointsRef.current.geometry;
        const posAttr = geom.getAttribute("position");
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const originalY = positions[i * 3 + 1];
          const phase = phases[i];
          const time = Date.now() * 0.001;
          const offsetY = Math.sin(time * 1.2 + phase * Math.PI * 2) * 0.18;
          posAttr.setY(i, originalY + offsetY);
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group raycast={() => null}>
      {/* Temporary warm window glow accent during cinematic */}
      <pointLight
        ref={pointLightRef}
        position={[housePos[0] + 0.15, housePos[1] + 0.75, housePos[2] + 0.95]}
        color="#ffdfa0"
        distance={4.2}
        decay={2}
        intensity={0}
      />

      {/* Temporary deterministic motes drifting peacefully over island center */}
      {particleCount > 0 && (
        <points ref={pointsRef} raycast={() => null}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.16}
            color="#ffe9b5"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Temporary subtle telescope eyepiece shimmer during cinematic */}
      {isActive && (
        <mesh
          position={[
            telescopePos[0] - 0.08,
            telescopePos[1] + 1.15,
            telescopePos[2] + 0.38,
          ]}
          raycast={() => null}
        >
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial
            color="#ffe8a3"
            transparent
            opacity={intensityRef.current * 0.65}
          />
        </mesh>
      )}

      {/* Subtle permanent decorative completion detail: tiny wooden star charm near porch sill */}
      {hasPlayed && (
        <group
          position={[housePos[0] + 0.82, housePos[1] + 0.08, housePos[2] + 1.12]}
          rotation={[0.1, 0.4, 0]}
          scale={[0.7, 0.7, 0.7]}
          raycast={() => null}
        >
          {/* Miniature carved star charm */}
          <mesh position={[0, 0.1, 0]} raycast={() => null}>
            <octahedronGeometry args={[0.055, 0]} />
            <meshStandardMaterial
              color="#d4aa70"
              roughness={0.4}
              metalness={0.2}
              emissive="#f4cc85"
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* Small twine cord */}
          <mesh position={[0, 0.15, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.005, 0.005, 0.08, 4]} />
            <meshStandardMaterial color="#887055" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}
