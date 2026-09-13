"use client";

import React, { useRef } from "react";
import { EVOLUTION_PLACEMENTS } from "@/data/worldEvolutionPlacements";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CollectibleEvolutionProps {
  violetsVisible: boolean;
  benchStarVisible: boolean;
  pondLiliesVisible: boolean;
  harmonyVisible: boolean;
  isNew?: boolean;
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

const ignoreRaycast = () => null;

export default function CollectibleEvolution({
  violetsVisible,
  benchStarVisible,
  pondLiliesVisible,
  harmonyVisible,
  isNew,
  theme,
  reducedMotion,
}: CollectibleEvolutionProps) {
  const violetsRef = useRef<THREE.Group>(null);
  const benchStarRef = useRef<THREE.Group>(null);
  const pondLiliesRef = useRef<THREE.Group>(null);
  const harmonyRef = useRef<THREE.Mesh>(null);
  const animProgress = useRef(isNew ? 0 : 1);

  const isNight = theme?.period === "NIGHT";

  useFrame((_, dt) => {
    if (animProgress.current < 1 && !reducedMotion) {
      animProgress.current = Math.min(1, animProgress.current + dt * 1.5);
      const s = animProgress.current;
      if (violetsRef.current) violetsRef.current.scale.setScalar(s);
      if (benchStarRef.current) benchStarRef.current.scale.setScalar(s);
      if (pondLiliesRef.current) pondLiliesRef.current.scale.setScalar(s);
    }
  });

  return (
    <>
      {/* 1. Wild Violet Patch near Cottage Garden */}
      {violetsVisible && (
        <group
          ref={violetsRef}
          position={EVOLUTION_PLACEMENTS.COLLECTIBLE_VIOLETS}
        >
          {[
            [-0.06, 0.04, -0.05],
            [0.05, 0.05, 0.06],
            [-0.02, 0.03, 0.08],
          ].map(([x, y, z], i) => (
            <group key={i} position={[x, y, z]}>
              <mesh raycast={ignoreRaycast} position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.08, 6]} />
                <meshStandardMaterial color="#557551" roughness={0.8} />
              </mesh>
              <mesh raycast={ignoreRaycast} position={[0, 0.075, 0]}>
                <sphereGeometry args={[0.032, 6, 6]} />
                <meshStandardMaterial
                  color="#8c82b8"
                  emissive="#7b6fb0"
                  emissiveIntensity={isNight ? 0.6 : 0.2}
                  roughness={0.5}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 2. Carved Wooden Star Token on the Bench */}
      {benchStarVisible && (
        <group
          ref={benchStarRef}
          position={EVOLUTION_PLACEMENTS.COLLECTIBLE_BENCH_STAR}
          rotation={[0, 0.25, 0]}
        >
          <mesh
            raycast={ignoreRaycast}
            position={[0, 0.012, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.065, 0.065, 0.014, 16]} />
            <meshStandardMaterial color="#b38f6b" roughness={0.7} />
          </mesh>
          <mesh
            raycast={ignoreRaycast}
            position={[0, 0.02, 0]}
            rotation={[-Math.PI / 2, 0, 0.4]}
          >
            <cylinderGeometry args={[0.032, 0.032, 0.008, 5]} />
            <meshStandardMaterial color="#dfbf96" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* 3. Water Lily Pads on Pond Pebble Bank */}
      {pondLiliesVisible && (
        <group
          ref={pondLiliesRef}
          position={EVOLUTION_PLACEMENTS.COLLECTIBLE_POND_LILIES}
        >
          {[
            { pos: [-0.08, 0, -0.06] as const, r: 0.11, rot: 0.2 },
            { pos: [0.09, 0.002, 0.05] as const, r: 0.09, rot: -0.4 },
          ].map((pad, i) => (
            <mesh
              key={i}
              raycast={ignoreRaycast}
              position={pad.pos}
              rotation={[-Math.PI / 2, 0, pad.rot]}
            >
              <circleGeometry args={[pad.r, 16]} />
              <meshStandardMaterial
                color="#5f825e"
                roughness={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 4. Subtle Harmonic Ground Ambient Accent at Island Center */}
      {harmonyVisible && (
        <mesh
          ref={harmonyRef}
          raycast={ignoreRaycast}
          position={EVOLUTION_PLACEMENTS.ISLAND_HARMONY}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.6, 1.4, 32]} />
          <meshBasicMaterial
            color="#ffeab0"
            transparent
            opacity={isNight ? 0.16 : 0.09}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}

