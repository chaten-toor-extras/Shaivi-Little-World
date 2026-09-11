"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MeshStandardMaterial } from "three";

interface MoonProps {
  enabled: boolean;
  color?: string;
  brightness?: number;
  scale?: number;
}

export default function Moon({
  enabled,
  color = "#ffffff",
  brightness = 0.9,
  scale = 1.0,
}: MoonProps) {
  const groupRef = useRef<Group>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const glowMatRef = useRef<MeshStandardMaterial>(null);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  const targetOpacity = enabled ? 1 : 0;
  const currentOpacity = useRef(targetOpacity);

  useFrame((_, dt) => {
    if (!groupRef.current) return;

    const speed = reducedMotion ? 1 : 1 - Math.exp(-dt * 3);
    currentOpacity.current += (targetOpacity - currentOpacity.current) * speed;

    groupRef.current.visible = currentOpacity.current > 0.01;

    if (matRef.current) {
      matRef.current.opacity = currentOpacity.current;
      matRef.current.emissiveIntensity = currentOpacity.current * brightness;
    }
    if (glowMatRef.current) {
      glowMatRef.current.opacity = currentOpacity.current * 0.25;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[-11, 19, -15]}
      scale={[scale, scale, scale]}
      visible={enabled}
    >
      {/* Core Moon Sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={brightness}
          roughness={0.9}
          transparent
          opacity={targetOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle Ambient Moon Glow Halo */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshStandardMaterial
          ref={glowMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={brightness * 0.4}
          roughness={1}
          transparent
          opacity={targetOpacity * 0.25}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
