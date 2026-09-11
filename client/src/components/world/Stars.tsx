"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Points, PointsMaterial } from "three";

interface StarsProps {
  enabled: boolean;
  count: number;
  brightness?: number;
  twinkle?: boolean;
}

// Deterministically generate a fixed celestial dome of up to 300 star coordinates
function generateDomeStars(maxCount: number): Float32Array {
  const positions = new Float32Array(maxCount * 3);
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < maxCount; i++) {
    // Upper hemisphere distribution
    const u = pseudoRandom();
    const v = pseudoRandom();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(1.0 - 0.75 * v); // limit to upper sky hemisphere
    const radius = 38 + pseudoRandom() * 16; // 38 to 54 units distance

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) + 4; // elevate above horizon
    const z = radius * Math.sin(phi) * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

const MAX_STARS = 300;

export default function Stars({
  enabled,
  count,
  brightness = 0.8,
  twinkle = true,
}: StarsProps) {
  const pointsRef = useRef<Points>(null);
  const matRef = useRef<PointsMaterial>(null);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  // Generate once and never recreate positions
  const allPositions = useMemo(() => generateDomeStars(MAX_STARS), []);

  // Filter positions by effective count
  const activePositions = useMemo(() => {
    const clampedCount = Math.max(0, Math.min(MAX_STARS, count));
    return allPositions.slice(0, clampedCount * 3);
  }, [allPositions, count]);

  const targetOpacity = enabled && count > 0 ? brightness : 0;
  const currentOpacity = useRef(targetOpacity);

  useFrame(({ clock }, dt) => {
    if (!matRef.current) return;

    // Smoothly interpolate opacity towards target
    const speed = reducedMotion ? 1 : 1 - Math.exp(-dt * 3);
    currentOpacity.current += (targetOpacity - currentOpacity.current) * speed;

    if (pointsRef.current) {
      pointsRef.current.visible = currentOpacity.current > 0.01;
    }

    if (currentOpacity.current > 0.01) {
      let finalOpacity = currentOpacity.current;
      if (twinkle && !reducedMotion) {
        // Very subtle twinkle modulation
        finalOpacity *= 0.88 + Math.sin(clock.elapsedTime * 2.2) * 0.12;
      }
      matRef.current.opacity = finalOpacity;
    }
  });

  if (activePositions.length === 0) return null;

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[activePositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.28}
        sizeAttenuation={false}
        color="#eef3ff"
        transparent
        opacity={targetOpacity}
        depthWrite={false}
      />
    </points>
  );
}
