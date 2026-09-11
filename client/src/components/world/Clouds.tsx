import { useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { ResolvedWorldTheme } from "@/types/world";
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group } from "three";

export default function Clouds({ theme }: { theme: ResolvedWorldTheme }) {
  const worldSettings = useWorldSettings();
  const cloudsSettings = worldSettings.environment?.clouds;
  const { quality, reducedMotion } = useExperienceStore();

  const cloudsRef = useRef<Group>(null);

  const enabled = cloudsSettings?.enabled ?? true;
  const baseColor = cloudsSettings?.color || "#f1e7ed";
  const motionEnabled = cloudsSettings?.motionEnabled ?? true;
  const speed = (cloudsSettings?.speed ?? 0.05) * theme.cloudSpeedMultiplier;
  const tint = theme.cloudTint || baseColor;

  const count = quality === "LOW" ? 4 : quality === "MEDIUM" ? 6 : 8;

  const cloudData = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 6 + Math.random() * 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 3.5 + Math.random() * 2;
      const scale = 1 + Math.random() * 1.5;
      const speedOffset = 0.5 + Math.random() * 0.5;

      return { x, y, z, scale, speedOffset, angle, radius };
    });
  }, [count]);

  useFrame(({ clock }) => {
    if (reducedMotion || !motionEnabled || !cloudsRef.current) return;
    
    const time = clock.elapsedTime;
    
    cloudsRef.current.children.forEach((cloud, i) => {
      const data = cloudData[i];
      const currentAngle = data.angle + time * speed * data.speedOffset * 0.2;
      cloud.position.x = Math.cos(currentAngle) * data.radius;
      cloud.position.z = Math.sin(currentAngle) * data.radius;
      cloud.position.y = data.y + Math.sin(time * 0.5 + i) * 0.2;
    });
  });

  if (!enabled) return null;

  return (
    <group ref={cloudsRef}>
      {cloudData.map((data, i) => (
        <Billboard
          key={i}
          position={[data.x, data.y, data.z]}
          scale={[data.scale * 2.5, data.scale, 1]}
        >
          <mesh>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={tint}
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}
