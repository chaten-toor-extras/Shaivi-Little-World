"use client";

import { safeEmitSecretEvent } from "@/services/secretEventBus";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useIntentionalClick } from "@/utils/intentionalClick";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface ButterflyProps {
  color?: string;
}

// ── Curated Bounded Island Flight Path ─────────────────────────
// Elevated (y: 1.35 - 1.65) so the butterfly is visibly flying in the air,
// clearly clearing all ground foliage, flowers, rocks, and buildings on expanded island.
const WAYPOINTS: [number, number, number][] = [
  [1.1, 1.48, 1.5],    // Above wildflower meadow knoll
  [2.4, 1.58, 2.2],    // Sweeping outward over sunny meadow
  [1.7, 1.42, 3.0],    // Drifting towards stepping path
  [-0.3, 1.50, 2.6],   // Gliding past stepping stones
  [-2.0, 1.42, 2.0],   // Hovering gently over tranquil pond bank
  [-2.2, 1.55, 1.0],   // Sweeping past stone lantern
  [-1.2, 1.60, 0.3],   // Drifting beside cottage garden flowers
  [-0.15, 1.45, 0.9],  // Returning across garden towards meadow
];

const FLIGHT_PATH = new THREE.CatmullRomCurve3(
  WAYPOINTS.map((w) => new THREE.Vector3(...w)),
  true, // closed loop
  "centripetal"
);

export default function Butterfly({ color }: ButterflyProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const sparkle1Ref = useRef<THREE.Mesh>(null);
  const sparkle2Ref = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);
  const { handlePointerDown, handlePointerMove, isIntentionalClick } = useIntentionalClick();

  const mode = useExperienceStore((s) => s.mode);
  const transitioning = useExperienceStore((s) => s.transitioning);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const currentPeriod = useExperienceStore((s) => s.currentTimeOfDay);

  const isNight = currentPeriod === "NIGHT";

  // Natural wing contours: forewing and hindwing with realistic swallowtail scallops
  const { forewingGeo, hindwingGeo } = useMemo(() => {
    // Forewing
    const fw = new THREE.Shape();
    fw.moveTo(0, 0);
    fw.bezierCurveTo(0.04, 0.08, 0.16, 0.26, 0.25, 0.3);
    fw.bezierCurveTo(0.24, 0.28, 0.2, 0.2, 0.18, 0.14);
    fw.bezierCurveTo(0.16, 0.08, 0.1, 0.02, 0, 0);
    fw.closePath();

    const fGeo = new THREE.ExtrudeGeometry(fw, {
      depth: 0.003,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 1,
    });

    // Hindwing with delicate scallop and tail
    const hw = new THREE.Shape();
    hw.moveTo(0, 0);
    hw.bezierCurveTo(0.06, -0.02, 0.14, -0.08, 0.15, -0.16);
    hw.bezierCurveTo(0.11, -0.19, 0.07, -0.18, 0.05, -0.22);
    hw.bezierCurveTo(0.03, -0.18, 0.02, -0.12, 0, 0);
    hw.closePath();

    const hGeo = new THREE.ExtrudeGeometry(hw, {
      depth: 0.003,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 1,
    });

    return { forewingGeo: fGeo, hindwingGeo: hGeo };
  }, []);

  const wingColor = color || (isNight ? "#ffdf80" : "#e89f46");

  useFrame(({ clock }) => {
    if (!rootRef.current) return;

    const t = clock.elapsedTime;

    // Active flight speed: clearly visible, organic, natural pace
    const flightSpeed = reducedMotion ? 0.08 : isNight ? 0.14 : 0.22;
    const u = (t * flightSpeed) % 1;

    // Current position and forward target on flight spline
    const currentPos = FLIGHT_PATH.getPointAt(u);
    const lookTarget = FLIGHT_PATH.getPointAt((u + 0.02) % 1);

    // Organic vertical bobbing
    currentPos.y += Math.sin(t * 3.6) * 0.05 + Math.cos(t * 1.8) * 0.03;
    rootRef.current.position.copy(currentPos);

    // Orient forward in flight direction
    rootRef.current.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);

    // Aerodynamic banking into turns
    const bank = Math.sin(t * 2.2) * 0.22;
    rootRef.current.rotateZ(bank);

    // Active Wing Flapping: realistic 11-13 Hz flutter
    const flapFreq = reducedMotion ? 5.0 : isNight ? 9.0 : 12.5;
    const flapPhase = t * flapFreq;
    const flapAngle = Math.sin(flapPhase) * 0.65 + 0.15;

    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = flapAngle;
      leftWingRef.current.rotation.y = Math.cos(flapPhase) * 0.08;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -flapAngle;
      rightWingRef.current.rotation.y = -Math.cos(flapPhase) * 0.08;
    }

    // Gentle thorax bob
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(flapPhase)) * 0.012;
    }

    // Trailing golden sparkle motes
    if (sparkle1Ref.current) {
      sparkle1Ref.current.position.set(
        Math.sin(t * 3.8) * 0.12,
        Math.cos(t * 3.2) * 0.08 - 0.04,
        -0.18 - Math.sin(t * 4.0) * 0.08
      );
    }
    if (sparkle2Ref.current) {
      sparkle2Ref.current.position.set(
        Math.cos(t * 3.4) * 0.14,
        Math.sin(t * 4.1) * 0.08 - 0.02,
        -0.24 - Math.cos(t * 3.5) * 0.08
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    if (mode !== "WORLD" || transitioning) return;
    e.stopPropagation();

    // Semantic event to Secret Engine (one event per genuine click)
    safeEmitSecretEvent({
      type: "CLICK",
      targetType: "BUTTERFLY",
      targetId: "golden-butterfly",
    });
  };

  const scale = hovered ? 1.45 : 1.2;

  return (
    <group ref={rootRef} scale={[scale, scale, scale]}>
      {/* Invisible Comfort Hit Sphere (radius 0.45) for effortless desktop / mobile click */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClick={(e) => {
          if (!isIntentionalClick(e)) return;
          handleClick(e);
        }}
        onPointerOver={(e) => {
          if (mode === "WORLD" && !transitioning) {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.45, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Subtle Warm Golden Point Light */}
      <pointLight
        color={isNight ? "#ffe899" : "#ffd27d"}
        intensity={hovered ? 2.4 : 1.5}
        distance={2.5}
        decay={2}
      />

      {/* Realistic Anatomy Group (aligned along Z forward axis) */}
      <group ref={bodyRef}>
        {/* Slender Thorax and Abdomen */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.01, 0.22, 8]} />
          <meshStandardMaterial color="#2d241e" roughness={0.7} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.006, 0.11]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#221b16" roughness={0.6} />
        </mesh>

        {/* Compound Eyes */}
        {[-0.012, 0.012].map((x) => (
          <mesh key={x} position={[x, 0.014, 0.116]}>
            <sphereGeometry args={[0.007, 6, 6]} />
            <meshStandardMaterial color="#1a1410" roughness={0.2} metalness={0.5} />
          </mesh>
        ))}

        {/* Curved Antennae pointing forward and slightly up */}
        {[-1, 1].map((dir) => (
          <mesh
            key={dir}
            position={[dir * 0.018, 0.032, 0.14]}
            rotation={[0.4, 0, -dir * 0.45]}
          >
            <cylinderGeometry args={[0.0015, 0.0015, 0.08, 4]} />
            <meshStandardMaterial color="#35281e" roughness={0.7} />
          </mesh>
        ))}

        {/* LEFT WING ASSEMBLY */}
        <group ref={leftWingRef} position={[-0.012, 0.008, 0.02]}>
          {/* Forewing */}
          <mesh geometry={forewingGeo} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <meshStandardMaterial
              color={wingColor}
              roughness={0.35}
              metalness={0.2}
              side={THREE.DoubleSide}
              transparent
              opacity={0.92}
            />
          </mesh>
          {/* Hindwing */}
          <mesh geometry={hindwingGeo} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <meshStandardMaterial
              color={wingColor}
              roughness={0.35}
              metalness={0.2}
              side={THREE.DoubleSide}
              transparent
              opacity={0.92}
            />
          </mesh>
        </group>

        {/* RIGHT WING ASSEMBLY */}
        <group ref={rightWingRef} position={[0.012, 0.008, 0.02]}>
          {/* Forewing */}
          <mesh geometry={forewingGeo} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
            <meshStandardMaterial
              color={wingColor}
              roughness={0.35}
              metalness={0.2}
              side={THREE.DoubleSide}
              transparent
              opacity={0.92}
            />
          </mesh>
          {/* Hindwing */}
          <mesh geometry={hindwingGeo} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
            <meshStandardMaterial
              color={wingColor}
              roughness={0.35}
              metalness={0.2}
              side={THREE.DoubleSide}
              transparent
              opacity={0.92}
            />
          </mesh>
        </group>
      </group>

      {/* Trailing Golden Fairy Motes */}
      <mesh ref={sparkle1Ref}>
        <sphereGeometry args={[0.016, 6, 6]} />
        <meshBasicMaterial color="#ffe899" />
      </mesh>
      <mesh ref={sparkle2Ref}>
        <sphereGeometry args={[0.013, 6, 6]} />
        <meshBasicMaterial color="#ffd878" />
      </mesh>

      {/* Accessible HTML Mirror for screen readers / keyboard accessibility */}
      <Html position={[0, 0, 0]} zIndexRange={[10, 0]}>
        <button
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
          aria-label="Interact with golden butterfly"
          onClick={() => handleClick({ stopPropagation: () => {} })}
        />
      </Html>
    </group>
  );
}
