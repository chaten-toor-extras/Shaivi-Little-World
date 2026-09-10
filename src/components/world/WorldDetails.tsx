import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group } from "three";
import { Box, Ball, Cylinder } from "./Shapes";
import { useExperienceStore } from "@/store/useExperienceStore";
export default function WorldDetails() {
  const [lit, setLit] = useState(true);
  const ripple = useRef<Mesh>(null),
    steam = useRef<Group>(null),
    motes = useRef<Group>(null);
  const rippleAge = useRef(2),
    steamAge = useRef(3);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  useFrame(({ clock }, dt) => {
    rippleAge.current += dt;
    steamAge.current += dt;
    if (ripple.current) {
      ripple.current.visible = rippleAge.current < 1.5;
      ripple.current.scale.setScalar(
        reduced ? 0.7 : 0.1 + rippleAge.current * 0.5,
      );
    }
    if (steam.current) {
      steam.current.visible = steamAge.current < 2;
      steam.current.position.y = reduced ? 0 : steamAge.current * 0.12;
    }
    if (motes.current && !reduced)
      motes.current.position.y = Math.sin(clock.elapsedTime * 0.65) * 0.09;
  });
  const allowed = () => useExperienceStore.getState().mode === "WORLD";
  return (
    <>
      <group
        position={[-1.4, 0.13, 1.2]}
        onClick={(e) => {
          if (allowed()) {
            e.stopPropagation();
            setLit(!lit);
          }
        }}
      >
        <Cylinder
          position={[0, 0.5, 0]}
          scale={[0.035, 1, 0.035]}
          color="#657058"
        />
        <Box
          position={[0, 1.05, 0]}
          scale={[0.24, 0.3, 0.24]}
          color={lit ? "#f7dfa0" : "#807b69"}
        />
        <Box
          position={[0, 1.23, 0]}
          scale={[0.33, 0.07, 0.33]}
          color="#657058"
        />
      </group>
      <mesh
        position={[-2.7, 0.17, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          if (allowed()) {
            e.stopPropagation();
            rippleAge.current = 0;
          }
        }}
      >
        <circleGeometry args={[0.95, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh
        ref={ripple}
        position={[-2.7, 0.18, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.83, 0.88, 32]} />
        <meshBasicMaterial color="#edf4e7" transparent opacity={0.65} />
      </mesh>
      <group position={[-2.65, 0.25, 1.9]}>
        {Array.from({ length: 6 }, (_, i) => (
          <Box
            key={i}
            position={[i * 0.21 - 0.52, 0.06 * Math.sin(i * 0.6), 0]}
            scale={[0.19, 0.07, 0.38]}
            color="#b69a76"
          />
        ))}
      </group>
      <mesh
        position={[0.72, 1.16, 2.15]}
        scale={0.14}
        onClick={(e) => {
          if (allowed()) {
            e.stopPropagation();
            steamAge.current = 0;
          }
        }}
      >
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <Ball
            key={i}
            position={[0.72, 1.27 + i * 0.1, 2.15]}
            scale={[0.05, 0.08, 0.05]}
            color="#efdfcb"
            castShadow={false}
          />
        ))}
      </group>
      <group position={[2.9, 0.5, 1.4]}>
        {["#9485a0", "#c3ac78", "#879773"].map((c, i) => (
          <Box
            key={c}
            position={[0, i * 0.065, 0]}
            rotation={[0, i * 0.12, 0]}
            scale={[0.35, 0.06, 0.28]}
            color={c}
          />
        ))}
      </group>
      <Ball
        position={[-0.8, -1.4, -2.7]}
        scale={[1.8, 0.8, 1]}
        color="#a28d86"
      />
      <Ball
        position={[-2.9, 0.15, -2.1]}
        scale={[1.25, 0.27, 1]}
        color="#aabc8a"
      />
      <group ref={motes}>
        {Array.from({ length: 8 }, (_, i) => (
          <Ball
            key={i}
            position={[
              Math.sin(i * 2.4) * 3,
              0.5 + (i % 4) * 0.35,
              Math.cos(i * 2.4) * 2,
            ]}
            scale={0.018}
            color="#ffeab5"
            castShadow={false}
          />
        ))}
      </group>
    </>
  );
}
