import { useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Ball, Box, Cylinder } from "./Shapes";

function Terrain({ color = "#9b7f78" }: { color?: string }) {
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(5.5, 3.5, 1.8, 11, 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i);
      p.setXYZ(
        i,
        x * (1 + 0.06 * Math.sin(z * 2)),
        p.getY(i) + 0.12 * Math.sin(x * 2 + z),
        z * 0.77,
      );
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} position={[0, -1, 0]} receiveShadow castShadow>
      <meshStandardMaterial color={color} flatShading roughness={1} />
    </mesh>
  );
}

function Tree({
  position,
  scale = 1,
  trunkColor = "#867055",
  leavesColor = "#9ca97a",
  swayEnabled = true,
  swayStrength = 0.012,
  shakeEnabled = true,
  shakeStrength = 0.1,
  motionMultiplier = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  trunkColor?: string;
  leavesColor?: string;
  swayEnabled?: boolean;
  swayStrength?: number;
  shakeEnabled?: boolean;
  shakeStrength?: number;
  motionMultiplier?: number;
}) {
  const tree = useRef<THREE.Group>(null);
  const shake = useRef(0);
  const reduced = useExperienceStore((s) => s.reducedMotion);

  useFrame(({ clock }, dt) => {
    if (tree.current) {
      const activeSway =
        reduced || !swayEnabled
          ? 0
          : Math.sin(clock.elapsedTime * 0.8 * motionMultiplier + position[0]) *
            swayStrength;
      tree.current.rotation.z =
        activeSway + Math.sin(clock.elapsedTime * 18) * shake.current;
    }
    shake.current = Math.max(0, shake.current - dt * 0.1);
  });

  return (
    <group
      ref={tree}
      position={position}
      scale={scale}
      onClick={(e) => {
        if (shakeEnabled && useExperienceStore.getState().mode === "WORLD") {
          e.stopPropagation();
          shake.current = shakeStrength;
        }
      }}
    >
      <Cylinder
        position={[0, 0.45, 0]}
        scale={[0.12, 0.9, 0.12]}
        color={trunkColor}
      />
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.78, 0.75, 6]} />
        <meshStandardMaterial color={leavesColor} roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.62, 0.7, 6]} />
        <meshStandardMaterial color={leavesColor} roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.42, 0.65, 6]} />
        <meshStandardMaterial color={leavesColor} roughness={0.7} flatShading />
      </mesh>
    </group>
  );
}

function Flowers({
  density = "MEDIUM",
  primaryColor = "#f4dbac",
  secondaryColor = "#df9ca5",
  brightnessMultiplier = 1.0,
}: {
  density?: "LOW" | "MEDIUM" | "HIGH";
  primaryColor?: string;
  secondaryColor?: string;
  brightnessMultiplier?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const quality = useExperienceStore((s) => s.quality);

  // Quality override caps flower density
  const baseCount = density === "LOW" ? 30 : density === "HIGH" ? 90 : 60;
  const count = quality === "LOW" ? 30 : baseCount;

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const c1 = new THREE.Color(primaryColor);
    const c2 = new THREE.Color(secondaryColor);
    if (brightnessMultiplier !== 1.0) {
      c1.multiplyScalar(brightnessMultiplier);
      c2.multiplyScalar(brightnessMultiplier);
    }

    for (let i = 0; i < count; i++) {
      const a = i * 2.399;
      const r = 2.5 + (i % 13) / 6;
      o.position.set(Math.cos(a) * r, 0.16, Math.sin(a) * r * 0.73);
      o.scale.setScalar(0.035 + (i % 3) * 0.012);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, i % 3 ? c1 : c2);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) {
      ref.current!.instanceColor.needsUpdate = true;
    }
  }, [count, primaryColor, secondaryColor, brightnessMultiplier]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}

export default function Island({ theme }: { theme?: ResolvedWorldTheme }) {
  const pondRef = useRef<THREE.Mesh>(null);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const worldSettings = useWorldSettings();

  const island = worldSettings.island;
  const interactions = worldSettings.interactions;
  const motionMult = theme?.motionSpeedMultiplier ?? 1.0;

  const shakeStrengthVal =
    interactions?.treeShakeStrength === "SUBTLE"
      ? 0.05
      : interactions?.treeShakeStrength === "PLAYFUL"
        ? 0.2
        : 0.1;

  useFrame(({ clock }) => {
    if (!reduced && pondRef.current && (island?.pond?.rippleEnabled ?? true)) {
      pondRef.current.scale.x =
        1 + Math.sin(clock.elapsedTime * motionMult) * 0.015;
    }
  });

  return (
    <group>
      <Terrain color={island?.terrainColor || "#9b7f78"} />
      <mesh position={[0, -0.02, 0]} scale={[1, 1, 0.78]} receiveShadow>
        <cylinderGeometry args={[5.55, 5.45, 0.22, 11]} />
        <meshStandardMaterial
          color={island?.grassEdgeColor || "#bbc79c"}
          roughness={1}
        />
      </mesh>
      <group scale={[1, 1, 0.78]}>
        <mesh
          position={[0, 0.095, 0]}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[5.4, 11]} />
          <meshStandardMaterial color={island?.grassTopColor || "#c6cfab"} />
        </mesh>
      </group>

      {/* Stepping Stones */}
      {(island?.steppingStonesVisible ?? true) &&
        Array.from({ length: 12 }, (_, i) => (
          <Cylinder
            key={i}
            position={[-0.5 + Math.sin(i * 0.48) * 1.1, 0.13, -0.6 + i * 0.35]}
            scale={[0.35, 0.06, 0.22]}
            color={
              i % 2
                ? island?.steppingStonesColor || "#eaddc5"
                : island?.steppingStonesColor || "#e5d7bc"
            }
          />
        ))}

      {/* Trees */}
      {(island?.trees?.enabled ?? true) && (
        <>
          <Tree
            position={[-3.4, 0.12, -2.1]}
            scale={0.95}
            trunkColor={island.trees.trunkColor}
            leavesColor={island.trees.leavesColor}
            swayEnabled={island.trees.swayEnabled}
            swayStrength={island.trees.swayStrength}
            shakeEnabled={interactions?.treeShakeEnabled ?? true}
            shakeStrength={shakeStrengthVal}
            motionMultiplier={motionMult}
          />
          <Tree
            position={[-2.1, 0.12, -3.1]}
            scale={0.8}
            trunkColor={island.trees.trunkColor}
            leavesColor={island.trees.leavesColor}
            swayEnabled={island.trees.swayEnabled}
            swayStrength={island.trees.swayStrength}
            shakeEnabled={interactions?.treeShakeEnabled ?? true}
            shakeStrength={shakeStrengthVal}
            motionMultiplier={motionMult}
          />
          <Tree
            position={[-2.8, 0.12, -2.6]}
            scale={0.65}
            trunkColor={island.trees.trunkColor}
            leavesColor={island.trees.leavesColor}
            swayEnabled={island.trees.swayEnabled}
            swayStrength={island.trees.swayStrength}
            shakeEnabled={interactions?.treeShakeEnabled ?? true}
            shakeStrength={shakeStrengthVal}
            motionMultiplier={motionMult}
          />
          <Tree
            position={[3.4, 0.12, -2.0]}
            scale={0.75}
            trunkColor={island.trees.trunkColor}
            leavesColor={island.trees.leavesColor}
            swayEnabled={island.trees.swayEnabled}
            swayStrength={island.trees.swayStrength}
            shakeEnabled={interactions?.treeShakeEnabled ?? true}
            shakeStrength={shakeStrengthVal}
            motionMultiplier={motionMult}
          />
          <Tree
            position={[2.9, 0.12, -2.3]}
            scale={1.05}
            trunkColor={island.trees.trunkColor}
            leavesColor={island.trees.leavesColor}
            swayEnabled={island.trees.swayEnabled}
            swayStrength={island.trees.swayStrength}
            shakeEnabled={interactions?.treeShakeEnabled ?? true}
            shakeStrength={shakeStrengthVal}
            motionMultiplier={motionMult}
          />
          <Tree
            position={[3.9, 0.12, 0.2]}
            scale={0.7}
            trunkColor={island.trees.trunkColor}
            leavesColor={island.trees.leavesColor}
            swayEnabled={island.trees.swayEnabled}
            swayStrength={island.trees.swayStrength}
            shakeEnabled={interactions?.treeShakeEnabled ?? true}
            shakeStrength={shakeStrengthVal}
            motionMultiplier={motionMult}
          />
          <Tree
            position={[-3.7, 0.12, -0.6]}
            scale={0.75}
            trunkColor={island.trees.trunkColor}
            leavesColor={island.trees.leavesColor}
            swayEnabled={island.trees.swayEnabled}
            swayStrength={island.trees.swayStrength}
            shakeEnabled={interactions?.treeShakeEnabled ?? true}
            shakeStrength={shakeStrengthVal}
            motionMultiplier={motionMult}
          />
        </>
      )}

      {/* Pond */}
      {(island?.pond?.enabled ?? true) && (
        <>
          <mesh
            ref={pondRef}
            position={[-2.7, 0.13, 2]}
            rotation={[-Math.PI / 2, 0, 0.2]}
            scale={[1, 0.62, 1]}
          >
            <circleGeometry args={[1.03, 32]} />
            <meshStandardMaterial
              color={theme?.pondTint || island.pond.waterColor || "#89b9b9"}
              roughness={0.25}
              metalness={0.15}
            />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <Ball
              key={i}
              position={[
                -2.7 + Math.cos(i * 0.7),
                0.15,
                2 + Math.sin(i * 0.7) * 0.66,
              ]}
              scale={[0.17, 0.11, 0.14]}
              color={island.pond.stonesColor || "#d6cbbb"}
            />
          ))}
        </>
      )}

      {/* Flowers */}
      {(island?.flowers?.enabled ?? true) && (
        <Flowers
          density={island.flowers.density}
          primaryColor={island.flowers.primaryColor}
          secondaryColor={island.flowers.secondaryColor}
          brightnessMultiplier={theme?.flowerBrightnessMultiplier ?? 1.0}
        />
      )}

      {/* Bench */}
      {(island?.benchVisible ?? true) && (
        <>
          <Box
            position={[2.9, 0.35, 1.4]}
            scale={[1.3, 0.12, 0.5]}
            color={island?.benchWoodColor || "#b39273"}
          />
          {[2.4, 3.4].map((x) => (
            <Box
              key={x}
              position={[x, 0.2, 1.4]}
              scale={[0.09, 0.35, 0.4]}
              color={island?.benchLegsColor || "#876850"}
            />
          ))}
        </>
      )}
    </group>
  );
}
