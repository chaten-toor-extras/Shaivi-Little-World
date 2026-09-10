import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Box, Ball, Cylinder } from "./Shapes";
import { useExperienceStore } from "@/store/useExperienceStore";
export default function HouseDetails() {
  const smoke = useRef<Group>(null),
    vine = useRef<Group>(null);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  useFrame(({ clock }) => {
    if (reduced) return;
    if (smoke.current) {
      smoke.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.07;
      smoke.current.position.x = Math.sin(clock.elapsedTime * 0.3) * 0.08;
    }
    if (vine.current)
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
      <mesh position={[1.096, 1, 0.1]}>
        <boxGeometry args={[0.02, 0.63, 0.6]} />
        <meshStandardMaterial
          color="#f7ddb0"
          emissive="#f5bf76"
          emissiveIntensity={0.35}
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
      <group ref={vine} position={[-1.05, 1.7, 1.3]}>
        {Array.from({ length: 7 }, (_, i) => (
          <Ball
            key={i}
            position={[Math.sin(i * 1.3) * 0.08, -i * 0.11, 0]}
            scale={[0.09, 0.08, 0.035]}
            color={i % 2 ? "#758c61" : "#98a979"}
          />
        ))}
      </group>
      {[-0.86, 0.86].map((x) => (
        <group key={x} position={[x, 0.18, 1.26]}>
          <Cylinder scale={[0.14, 0.23, 0.14]} color="#bd8c70" />
          <Ball
            position={[0, 0.18, 0]}
            scale={[0.21, 0.22, 0.2]}
            color="#93a875"
          />
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
      <Ball
        position={[1.32, 0.65, 0.96]}
        scale={[0.11, 0.13, 0.01]}
        color="#be8a70"
      />
      <group ref={smoke}>
        {[0, 1, 2].map((i) => (
          <Ball
            key={i}
            position={[0.65 + i * 0.04, 3.15 + i * 0.23, -0.3]}
            scale={[0.12 + i * 0.04, 0.18, 0.12 + i * 0.04]}
            color="#e2d5d7"
            castShadow={false}
          />
        ))}
      </group>
    </>
  );
}
