"use client";

import React, { useRef } from "react";
import { EVOLUTION_PLACEMENTS } from "@/data/worldEvolutionPlacements";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MailboxEvolutionProps {
  letterVisible: boolean;
  isNew?: boolean;
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

const ignoreRaycast = () => null;

export default function MailboxEvolution({
  letterVisible,
  isNew,
  reducedMotion,
}: MailboxEvolutionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(isNew ? 0 : 1);

  useFrame((_, dt) => {
    if (!groupRef.current || !letterVisible) return;

    if (animProgress.current < 1 && !reducedMotion) {
      animProgress.current = Math.min(1, animProgress.current + dt * 1.5);
      const s = animProgress.current;
      groupRef.current.scale.set(s, s, s);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  if (!letterVisible) return null;

  return (
    <group ref={groupRef}>
      {/* 1. Miniature Sealed Letter tucked near the front box ledge */}
      <group
        position={EVOLUTION_PLACEMENTS.MAILBOX_LETTER}
        rotation={[-0.15, 0.2, 0.05]}
      >
        {/* Parchment envelope body */}
        <mesh raycast={ignoreRaycast}>
          <boxGeometry args={[0.18, 0.12, 0.012]} />
          <meshStandardMaterial color="#faf4e8" roughness={0.7} />
        </mesh>
        {/* Tiny red sealing wax stamp */}
        <mesh raycast={ignoreRaycast} position={[0, 0, 0.008]}>
          <cylinderGeometry args={[0.016, 0.016, 0.006, 10]} />
          <meshStandardMaterial color="#ba4334" roughness={0.4} />
        </mesh>
      </group>

      {/* 2. Delicate Paper Star Charm pinned on the rustic wooden post */}
      <group
        position={EVOLUTION_PLACEMENTS.MAILBOX_STAR}
        rotation={[0, 0, 0.1]}
      >
        <mesh raycast={ignoreRaycast}>
          <boxGeometry args={[0.07, 0.07, 0.012]} />
          <meshStandardMaterial color="#f0d58a" roughness={0.6} />
        </mesh>
        <mesh
          raycast={ignoreRaycast}
          rotation={[0, 0, Math.PI / 4]}
        >
          <boxGeometry args={[0.07, 0.07, 0.012]} />
          <meshStandardMaterial color="#f0d58a" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

