"use client";

import React, { useMemo, useRef } from "react";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CompanionButterflyProps {
  theme?: ResolvedWorldTheme;
  reducedMotion?: boolean;
}

const ignoreRaycast = () => null;

// High-altitude wide complementary flight loop across the expanded island sky
const COMPANION_WAYPOINTS: [number, number, number][] = [
  [-1.8, 2.2, -2.4],
  [0.8, 2.35, -2.8],
  [2.8, 2.15, -1.2],
  [3.2, 2.3, 1.4],
  [1.4, 2.25, 3.2],
  [-1.6, 2.1, 2.6],
  [-3.2, 2.3, 0.4],
];

const COMPANION_PATH = new THREE.CatmullRomCurve3(
  COMPANION_WAYPOINTS.map((w) => new THREE.Vector3(...w)),
  true,
  "centripetal"
);

export default function CompanionButterfly({
  reducedMotion,
}: CompanionButterflyProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  // Subtle delicate azure wing shape
  const wingGeometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.04, 0.08, 0.14, 0.22, 0.22, 0.24);
    s.bezierCurveTo(0.2, 0.18, 0.16, 0.12, 0.12, 0.08);
    s.bezierCurveTo(0.08, 0.04, 0.04, 0.01, 0, 0);
    s.closePath();

    return new THREE.ExtrudeGeometry(s, {
      depth: 0.002,
      bevelEnabled: false,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!rootRef.current) return;

    const t = clock.elapsedTime;
    const speed = reducedMotion ? 0.04 : 0.08;
    const u = (t * speed) % 1;

    const currentPos = COMPANION_PATH.getPointAt(u);
    const lookTarget = COMPANION_PATH.getPointAt((u + 0.02) % 1);

    currentPos.y += Math.sin(t * 2.4) * 0.04;
    rootRef.current.position.copy(currentPos);
    rootRef.current.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);

    const flapAngle = Math.sin(t * (reducedMotion ? 4 : 9)) * 0.55 + 0.15;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flapAngle;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flapAngle;
  });

  return (
    <group ref={rootRef} scale={[0.9, 0.9, 0.9]}>
      {/* Slender body */}
      <mesh
        raycast={ignoreRaycast}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.012, 0.008, 0.16, 6]} />
        <meshStandardMaterial color="#2a3842" roughness={0.7} />
      </mesh>

      {/* Left Wing (Azure) */}
      <group ref={leftWingRef} position={[-0.01, 0.005, 0.01]}>
        <mesh
          geometry={wingGeometry}
          raycast={ignoreRaycast}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <meshStandardMaterial
            color="#82bfe0"
            emissive="#5eaad4"
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* Right Wing (Azure) */}
      <group ref={rightWingRef} position={[0.01, 0.005, 0.01]}>
        <mesh
          geometry={wingGeometry}
          raycast={ignoreRaycast}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        >
          <meshStandardMaterial
            color="#82bfe0"
            emissive="#5eaad4"
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>
    </group>
  );
}

