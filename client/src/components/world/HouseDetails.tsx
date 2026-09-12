import { safeEmitSecretEvent } from "@/services/secretEventBus";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MeshStandardMaterial } from "three";
import { Box, Cylinder } from "./Shapes";

interface HouseDetailsProps {
  windowGlowEnabled?: boolean;
  windowGlowColor?: string;
  windowGlowIntensity?: number;
  glowMultiplier?: number;
  chimneySmokeEnabled?: boolean;
  plantsEnabled?: boolean;
}

export default function HouseDetails({
  windowGlowEnabled = true,
  windowGlowColor = "#f7ddb0",
  windowGlowIntensity = 0.35,
  glowMultiplier = 1,
  chimneySmokeEnabled = true,
  plantsEnabled = true,
}: HouseDetailsProps) {
  const smoke = useRef<Group>(null);
  const vine = useRef<Group>(null);
  const winMat = useRef<MeshStandardMaterial>(null);
  const reduced = useExperienceStore((s) => s.reducedMotion);

  const targetGlow = windowGlowEnabled
    ? windowGlowIntensity * glowMultiplier
    : 0;

  useFrame(({ clock }, dt) => {
    if (winMat.current) {
      if (reduced) {
        winMat.current.emissiveIntensity = targetGlow;
      } else {
        winMat.current.emissiveIntensity +=
          (targetGlow - winMat.current.emissiveIntensity) *
          Math.min(1, dt * 2.5);
      }
    }
    if (reduced) return;
    if (smoke.current && chimneySmokeEnabled) {
      const time = clock.elapsedTime;
      smoke.current.children.forEach((child, i) => {
        const t = (time * 0.3 + i * 0.25) % 1;
        child.position.y = t * 2.5;
        child.position.x = Math.sin(time + i) * 0.3 * t;
        const scale = 0.1 + t * 0.3;
        child.scale.set(scale, scale, scale);
        const mat = (child as any).material;
        if (mat) {
          mat.opacity = (1 - t) * 0.6;
        }
      });
    }
    if (vine.current && plantsEnabled)
      vine.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.02;
  });
  return (
    <>
      <Box
        position={[0, 0.04, 1.02]}
        scale={[2.45, 0.14, 0.85]}
        color="#c2a686"
      />
      <Box
        position={[0, -0.03, 1.55]}
        scale={[1.6, 0.12, 0.35]}
        color="#ccb899"
      />
      {[-1.05, 1.05].map((x) => (
        <Box
          key={x}
          position={[x, 0.8, 1.25]}
          scale={[0.065, 1.6, 0.065]}
          color="#a98664"
        />
      ))}
      <Box
        position={[0, 1.63, 1.25]}
        scale={[2.2, 0.08, 0.2]}
        color="#b17a5e"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <Box
          key={i}
          position={[-1.05 + i * 0.19, 1.78, 1]}
          rotation={[0.22, 0, 0]}
          scale={[0.17, 0.06, 0.65]}
          color={i % 2 ? "#bd8870" : "#b77d65"}
        />
      ))}
      <Box
        position={[1.07, 1, 0.1]}
        scale={[0.04, 0.8, 0.75]}
        color="#947656"
      />
      <mesh
        position={[1.096, 1, 0.1]}
        onClick={(e) => {
          if (useExperienceStore.getState().mode === "WORLD") {
            e.stopPropagation();
            safeEmitSecretEvent({
              type: "CLICK",
              targetType: "HOUSE_WINDOW",
              targetId: "front-window",
            });
          }
        }}
      >
        <boxGeometry args={[0.02, 0.63, 0.6]} />
        <meshStandardMaterial
          ref={winMat}
          color={windowGlowColor}
          emissive={windowGlowEnabled ? windowGlowColor : "#000000"}
          emissiveIntensity={targetGlow}
        />
      </mesh>
      <Box
        position={[1.12, 1, 0.1]}
        scale={[0.035, 0.68, 0.025]}
        color="#927654"
      />
      <Box
        position={[1.12, 1, 0.1]}
        scale={[0.035, 0.025, 0.64]}
        color="#927654"
      />
      <Box
        position={[1.13, 0.68, 0.1]}
        scale={[0.15, 0.04, 0.66]}
        color="#a8835e"
      />
      {["#85937a", "#c2947c", "#d1b178"].map((c, i) => (
        <Box
          key={c}
          position={[1.16, 0.77, -0.1 + i * 0.15]}
          rotation={[0, 0, i * 0.03]}
          scale={[0.08, 0.16, 0.11]}
          color={c}
        />
      ))}
      {plantsEnabled && (
        <group ref={vine} position={[-1.05, 1.7, 1.3]}>
          <Cylinder
            position={[0, -0.4, 0]}
            scale={[0.02, 0.8, 0.02]}
            color="#5a6e4d"
          />
          {Array.from({ length: 5 }, (_, i) => (
            <Box
              key={i}
              position={[Math.sin(i * 1.5) * 0.04, -i * 0.15 - 0.05, 0]}
              rotation={[0, 0, i % 2 ? 0.3 : -0.3]}
              scale={[0.06, 0.04, 0.03]}
              color={i % 2 ? "#758c61" : "#98a979"}
            />
          ))}
        </group>
      )}
      {plantsEnabled &&
        [-0.86, 0.86].map((x) => (
          <group key={x} position={[x, 0.18, 1.26]}>
            <Cylinder scale={[0.14, 0.23, 0.14]} color="#bd8c70" />
            <mesh position={[0, 0.22, 0]}>
              <coneGeometry args={[0.15, 0.26, 6]} />
              <meshStandardMaterial
                color="#889d6e"
                roughness={0.7}
                flatShading
              />
            </mesh>
          </group>
        ))}
      <Box
        position={[-1.35, 0.18, 0.85]}
        scale={[0.43, 0.09, 0.35]}
        color="#a0805d"
      />
      <Box
        position={[-1.35, 0.38, 0.85]}
        scale={[0.045, 0.35, 0.045]}
        color="#a0805d"
      />
      <Box
        position={[-1.35, 0.59, 0.85]}
        scale={[0.47, 0.07, 0.39]}
        color="#b89875"
      />
      <Box
        position={[1.34, 0.55, 0.9]}
        rotation={[0, 0.15, -0.12]}
        scale={[0.48, 0.83, 0.065]}
        color="#b89977"
      />
      <Box
        position={[1.34, 0.56, 0.94]}
        rotation={[0, 0.15, -0.12]}
        scale={[0.39, 0.72, 0.015]}
        color="#e4d5b8"
      />
      <mesh position={[1.32, 0.65, 0.96]}>
        <circleGeometry args={[0.07, 12]} />
        <meshStandardMaterial color="#be8a70" roughness={0.8} />
      </mesh>
      {chimneySmokeEnabled && !reduced && (
        <group ref={smoke} position={[0.65, 3.0, -0.3]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial
                color="#cccccc"
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
}
