"use client";

import React, { useRef } from "react";
import { EVOLUTION_PLACEMENTS } from "@/data/worldEvolutionPlacements";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MusicEvolutionProps {
  charmVisible: boolean;
  isNew?: boolean;
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

const ignoreRaycast = () => null;

export default function MusicEvolution({
  charmVisible,
  isNew,
  reducedMotion,
}: MusicEvolutionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(isNew ? 0 : 1);

  useFrame((_, dt) => {
    if (!groupRef.current || !charmVisible) return;

    if (animProgress.current < 1 && !reducedMotion) {
      animProgress.current = Math.min(1, animProgress.current + dt * 1.5);
      const s = animProgress.current;
      groupRef.current.scale.set(s, s, s);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  if (!charmVisible) return null;

  return (
    <group
      ref={groupRef}
      position={EVOLUTION_PLACEMENTS.MUSIC_CHARM}
      rotation={[0, 0.35, 0]}
    >
      {/* Miniature circular brass music coin / token */}
      <mesh
        raycast={ignoreRaycast}
        position={[0, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.065, 0.065, 0.012, 16]} />
        <meshStandardMaterial
          color="#d1a65d"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>

      {/* Raised musical treble note contour */}
      <mesh
        raycast={ignoreRaycast}
        position={[0, 0.014, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.026, 0.007, 8, 16, Math.PI * 1.5]} />
        <meshStandardMaterial
          color="#f2cf85"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
      <mesh
        raycast={ignoreRaycast}
        position={[0.026, 0.014, -0.015]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.006, 0.006, 0.055, 6]} />
        <meshStandardMaterial
          color="#f2cf85"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

