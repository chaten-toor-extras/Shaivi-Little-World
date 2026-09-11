"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { DoubleSide, Group, Mesh } from "three";

interface FlyingPageProps {
  color?: string;
  requiredClicks?: number;
}

export default function FlyingPage({
  color = "#f6ebd8",
  requiredClicks = 3,
}: FlyingPageProps) {
  const pageRef = useRef<Group>(null);
  const leftPageRef = useRef<Mesh>(null);
  const rightPageRef = useRef<Mesh>(null);
  const sparkle1Ref = useRef<Mesh>(null);
  const sparkle2Ref = useRef<Mesh>(null);
  const sparkle3Ref = useRef<Mesh>(null);

  const [clicks, setClicks] = useState(0);
  const [hovered, setHovered] = useState(false);

  const { mode, transitioning, reducedMotion, openSecret } =
    useExperienceStore();

  useFrame(({ clock }) => {
    if (!pageRef.current) return;

    const t = clock.elapsedTime;

    if (!reducedMotion) {
      // Hogwarts Legacy sweeping organic flight path around the island
      const flightSpeed = 0.5;
      const angle = t * flightSpeed;
      const x = -1.5 + Math.sin(angle) * 1.55;
      const z = 0.9 + Math.cos(angle * 0.85) * 1.35;
      const y =
        1.85 + Math.sin(angle * 1.7) * 0.28 + Math.cos(angle * 0.6) * 0.12;

      pageRef.current.position.set(x, y, z);

      // Natural aerodynamic banking and pitch into turns
      pageRef.current.rotation.y = -angle * 0.85 + Math.PI / 2;
      pageRef.current.rotation.z = Math.sin(angle) * 0.28;
      pageRef.current.rotation.x = Math.sin(angle * 1.7) * 0.16;

      // Fluttering page wave (Hogwarts enchanted flying sheet flap)
      const flapRate = 6.5;
      const flapAngle = Math.sin(t * flapRate) * 0.32;
      const twist = Math.cos(t * flapRate) * 0.08;

      if (leftPageRef.current) {
        leftPageRef.current.rotation.y = flapAngle;
        leftPageRef.current.rotation.z = twist;
      }
      if (rightPageRef.current) {
        rightPageRef.current.rotation.y = -flapAngle;
        rightPageRef.current.rotation.z = -twist;
      }

      // Magical trailing motes (orbiting sparkling dust)
      if (sparkle1Ref.current) {
        sparkle1Ref.current.position.set(
          Math.sin(t * 3.2) * 0.26,
          Math.cos(t * 2.8) * 0.18 - 0.05,
          Math.cos(t * 3.2) * 0.22 - 0.15,
        );
      }
      if (sparkle2Ref.current) {
        sparkle2Ref.current.position.set(
          Math.cos(t * 2.7) * 0.24,
          Math.sin(t * 3.4) * 0.16 + 0.04,
          Math.sin(t * 2.7) * 0.26 - 0.2,
        );
      }
      if (sparkle3Ref.current) {
        sparkle3Ref.current.position.set(
          Math.sin(t * 4.1 + 1.2) * 0.2,
          Math.cos(t * 3.7 + 0.5) * 0.14 - 0.08,
          Math.cos(t * 4.1) * 0.28 - 0.25,
        );
      }
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    if (mode !== "WORLD" || transitioning) return;
    e.stopPropagation();

    const nextClicks = clicks + 1;
    if (nextClicks >= requiredClicks) {
      setClicks(0);
      openSecret();
    } else {
      setClicks(nextClicks);
    }
  };

  const currentScale = hovered ? 1.18 : 1.0;

  return (
    <group
      ref={pageRef}
      position={[-1.5, 1.85, 0.9]}
      scale={[currentScale, currentScale, currentScale]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Center Spine / Fold */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.44, 8]} />
        <meshStandardMaterial color="#c29a67" roughness={0.6} />
      </mesh>

      {/* Left Half of the Flying Parchment Page */}
      <group position={[0, 0, 0]}>
        <mesh
          ref={leftPageRef}
          position={[-0.09, 0, 0]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[0.18, 0.42, 6, 6]} />
          <meshStandardMaterial
            color={color}
            roughness={0.72}
            metalness={0.08}
            side={DoubleSide}
          />

          {/* Antique Inked Manuscript Script Lines on Left Page */}
          <mesh position={[0, 0.12, 0.002]}>
            <planeGeometry args={[0.13, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, 0.06, 0.002]}>
            <planeGeometry args={[0.14, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, 0.0, 0.002]}>
            <planeGeometry args={[0.12, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, -0.06, 0.002]}>
            <planeGeometry args={[0.135, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, -0.12, 0.002]}>
            <planeGeometry args={[0.11, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.55} transparent />
          </mesh>
        </mesh>
      </group>

      {/* Right Half of the Flying Parchment Page */}
      <group position={[0, 0, 0]}>
        <mesh
          ref={rightPageRef}
          position={[0.09, 0, 0]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[0.18, 0.42, 6, 6]} />
          <meshStandardMaterial
            color={color}
            roughness={0.72}
            metalness={0.08}
            side={DoubleSide}
          />

          {/* Antique Inked Manuscript Script Lines on Right Page */}
          <mesh position={[0, 0.12, 0.002]}>
            <planeGeometry args={[0.135, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, 0.06, 0.002]}>
            <planeGeometry args={[0.12, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, 0.0, 0.002]}>
            <planeGeometry args={[0.14, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, -0.06, 0.002]}>
            <planeGeometry args={[0.125, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, -0.12, 0.002]}>
            <planeGeometry args={[0.13, 0.009]} />
            <meshBasicMaterial color="#54402e" opacity={0.55} transparent />
          </mesh>
        </mesh>
      </group>

      {/* Golden Wax Seal / Crest Emblem */}
      <mesh position={[0, 0.16, 0.01]}>
        <circleGeometry args={[0.026, 20]} />
        <meshStandardMaterial
          color="#d4a359"
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* Subtle Warm Magical Illumination */}
      <pointLight
        color="#ffe2a3"
        intensity={hovered ? 2.2 : 1.3}
        distance={2.4}
        decay={2}
      />

      {/* Trailing Magical Sparkle Motes (Hogwarts Flying Page Glow) */}
      <mesh ref={sparkle1Ref}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshBasicMaterial color="#fff3be" />
      </mesh>
      <mesh ref={sparkle2Ref}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshBasicMaterial color="#ffd878" />
      </mesh>
      <mesh ref={sparkle3Ref}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#ffeeb8" />
      </mesh>
    </group>
  );
}
