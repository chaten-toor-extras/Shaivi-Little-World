"use client";

import React, { useRef } from "react";
import { EVOLUTION_PLACEMENTS } from "@/data/worldEvolutionPlacements";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface QuoteTVEvolutionProps {
  noteVisible: boolean;
  isNew?: boolean;
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

const ignoreRaycast = () => null;

export default function QuoteTVEvolution({
  noteVisible,
  isNew,
  reducedMotion,
}: QuoteTVEvolutionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(isNew ? 0 : 1);

  useFrame((_, dt) => {
    if (!groupRef.current || !noteVisible) return;

    if (animProgress.current < 1 && !reducedMotion) {
      animProgress.current = Math.min(1, animProgress.current + dt * 1.5);
      const s = animProgress.current;
      groupRef.current.scale.set(s, s, s);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  if (!noteVisible) return null;

  return (
    <group
      ref={groupRef}
      position={EVOLUTION_PLACEMENTS.QUOTE_NOTE}
      rotation={[0, -0.25, 0]}
    >
      {/* Rolled parchment quote paper scroll / strip */}
      <mesh
        raycast={ignoreRaycast}
        position={[0, 0.012, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.022, 0.022, 0.16, 12]} />
        <meshStandardMaterial color="#f7f1e4" roughness={0.8} />
      </mesh>

      {/* Ribbon tie around parchment */}
      <mesh
        raycast={ignoreRaycast}
        position={[0, 0.013, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.024, 0.024, 0.03, 12]} />
        <meshStandardMaterial color="#c26d52" roughness={0.6} />
      </mesh>

      {/* Tiny unrolled tail of parchment strip */}
      <mesh
        raycast={ignoreRaycast}
        position={[-0.04, 0.005, 0.05]}
        rotation={[-0.05, 0.2, 0]}
      >
        <boxGeometry args={[0.09, 0.006, 0.08]} />
        <meshStandardMaterial color="#f7f1e4" roughness={0.8} />
      </mesh>
    </group>
  );
}

