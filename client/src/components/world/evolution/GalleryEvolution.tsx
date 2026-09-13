"use client";

import React, { useRef } from "react";
import { EVOLUTION_PLACEMENTS } from "@/data/worldEvolutionPlacements";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GalleryEvolutionProps {
  paletteVisible: boolean;
  sketchVisible: boolean;
  isNewPalette?: boolean;
  isNewSketch?: boolean;
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

// Raycast ignore helper
const ignoreRaycast = () => null;

export default function GalleryEvolution({
  paletteVisible,
  sketchVisible,
  isNewPalette,
  isNewSketch,
  reducedMotion,
}: GalleryEvolutionProps) {
  const paletteRef = useRef<THREE.Group>(null);
  const sketchRef = useRef<THREE.Group>(null);
  const animProgress = useRef(isNewPalette ? 0 : 1);
  const sketchAnimProgress = useRef(isNewSketch ? 0 : 1);

  useFrame((_, dt) => {
    if (paletteRef.current && paletteVisible) {
      if (animProgress.current < 1 && !reducedMotion) {
        animProgress.current = Math.min(1, animProgress.current + dt * 1.6);
        const s = animProgress.current;
        paletteRef.current.scale.set(s, s, s);
      } else {
        paletteRef.current.scale.set(1, 1, 1);
      }
    }

    if (sketchRef.current && sketchVisible) {
      if (sketchAnimProgress.current < 1 && !reducedMotion) {
        sketchAnimProgress.current = Math.min(1, sketchAnimProgress.current + dt * 1.6);
        const s = sketchAnimProgress.current;
        sketchRef.current.scale.set(s, s, s);
      } else {
        sketchRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <>
      {/* 1. Artist Palette & Brush Cup */}
      {paletteVisible && (
        <group
          ref={paletteRef}
          position={EVOLUTION_PLACEMENTS.GALLERY_PALETTE}
          rotation={[0, 0.45, 0]}
        >
          {/* Wooden palette oval disc */}
          <mesh
            raycast={ignoreRaycast}
            position={[0, 0.015, 0]}
            rotation={[-Math.PI / 2, 0, 0.3]}
          >
            <cylinderGeometry args={[0.18, 0.18, 0.016, 16]} />
            <meshStandardMaterial color="#c4a57b" roughness={0.7} />
          </mesh>

          {/* Thumbhole cutout accent */}
          <mesh
            raycast={ignoreRaycast}
            position={[-0.1, 0.026, 0.02]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.028, 0.028, 0.018, 12]} />
            <meshStandardMaterial color="#7a6245" roughness={0.9} />
          </mesh>

          {/* Colorful paint dollops on the palette */}
          <mesh raycast={ignoreRaycast} position={[-0.05, 0.028, -0.07]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshStandardMaterial color="#c26d52" roughness={0.5} />
          </mesh>
          <mesh raycast={ignoreRaycast} position={[0.04, 0.028, -0.08]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#d6a851" roughness={0.5} />
          </mesh>
          <mesh raycast={ignoreRaycast} position={[0.09, 0.028, -0.02]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshStandardMaterial color="#537c68" roughness={0.5} />
          </mesh>
          <mesh raycast={ignoreRaycast} position={[0.07, 0.028, 0.06]}>
            <sphereGeometry args={[0.021, 8, 8]} />
            <meshStandardMaterial color="#4a6886" roughness={0.5} />
          </mesh>

          {/* Terracotta ceramic brush jar */}
          <mesh raycast={ignoreRaycast} position={[0.22, 0.06, 0.08]}>
            <cylinderGeometry args={[0.045, 0.038, 0.11, 12]} />
            <meshStandardMaterial color="#9e6c58" roughness={0.8} />
          </mesh>

          {/* Paintbrushes leaning in the jar */}
          <mesh
            raycast={ignoreRaycast}
            position={[0.21, 0.14, 0.07]}
            rotation={[0.18, 0, -0.22]}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.16, 6]} />
            <meshStandardMaterial color="#d1b894" roughness={0.6} />
          </mesh>
          <mesh
            raycast={ignoreRaycast}
            position={[0.23, 0.15, 0.09]}
            rotation={[-0.15, 0, 0.2]}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.17, 6]} />
            <meshStandardMaterial color="#554433" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* 2. Pinned Mini Sketch on Easel Stand */}
      {sketchVisible && (
        <group
          ref={sketchRef}
          position={EVOLUTION_PLACEMENTS.GALLERY_SKETCH}
          rotation={[0.08, 0.2, -0.1]}
        >
          {/* Miniature cream card sketch */}
          <mesh raycast={ignoreRaycast} position={[0, 0, 0]}>
            <boxGeometry args={[0.18, 0.24, 0.01]} />
            <meshStandardMaterial color="#f7eedd" roughness={0.9} />
          </mesh>
          {/* Subtle painterly watercolor wash impression */}
          <mesh raycast={ignoreRaycast} position={[0, 0.01, 0.006]}>
            <boxGeometry args={[0.13, 0.17, 0.004]} />
            <meshStandardMaterial color="#9bb098" roughness={0.9} />
          </mesh>
          {/* Tiny brass pin */}
          <mesh raycast={ignoreRaycast} position={[0, 0.1, 0.01]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )}
    </>
  );
}

