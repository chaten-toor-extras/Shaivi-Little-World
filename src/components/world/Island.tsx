import { useMemo, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Ball, Box, Cylinder } from "./Shapes";
import { useExperienceStore } from "@/store/useExperienceStore";
function Terrain() {
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
      <meshStandardMaterial color="#9b7f78" flatShading roughness={1} />
    </mesh>
  );
}
function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const tree = useRef<THREE.Group>(null),
    shake = useRef(0);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  useFrame(({ clock }, dt) => {
    if (tree.current)
      tree.current.rotation.z = reduced
        ? 0
        : Math.sin(clock.elapsedTime * 0.8 + position[0]) * 0.012 +
          Math.sin(clock.elapsedTime * 18) * shake.current;
    shake.current = Math.max(0, shake.current - dt * 0.1);
  });
  return (
    <group
      ref={tree}
      position={position}
      scale={scale}
      onClick={(e) => {
        if (useExperienceStore.getState().mode === "WORLD") {
          e.stopPropagation();
          shake.current = 0.1;
        }
      }}
    >
      <Cylinder
        position={[0, 0.65, 0]}
        scale={[0.1, 1.3, 0.1]}
        color="#867055"
      />
      <Ball
        position={[-0.2, 1.6, 0]}
        scale={[0.66, 0.88, 0.6]}
        color="#9ca97a"
      />
      <Ball
        position={[0.3, 1.9, 0.05]}
        scale={[0.64, 0.95, 0.6]}
        color="#b4bd8c"
      />
      <Ball
        position={[0.15, 1.35, 0.3]}
        scale={[0.58, 0.6, 0.55]}
        color="#a5b681"
      />
    </group>
  );
}
function Flowers() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const quality = useExperienceStore((s) => s.quality);
  const count = quality === "LOW" ? 30 : 80;
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = i * 2.399,
        r = 2.5 + (i % 13) / 6;
      o.position.set(Math.cos(a) * r, 0.16, Math.sin(a) * r * 0.73);
      o.scale.setScalar(0.035 + (i % 3) * 0.012);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(
        i,
        new THREE.Color(i % 3 ? "#f4dbac" : "#df9ca5"),
      );
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
export default function Island() {
  const clouds = useRef<THREE.Group>(null);
  const pond = useRef<THREE.Mesh>(null);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  useFrame(({ clock }) => {
    if (reduced) return;
    if (clouds.current)
      clouds.current.position.x = Math.sin(clock.elapsedTime * 0.08) * 0.25;
    if (pond.current)
      pond.current.scale.x = 1 + Math.sin(clock.elapsedTime) * 0.015;
  });
  return (
    <group>
      <Terrain />
      <mesh position={[0, -0.02, 0]} scale={[1, 1, 0.78]} receiveShadow>
        <cylinderGeometry args={[5.55, 5.45, 0.22, 11]} />
        <meshStandardMaterial color="#bbc79c" roughness={1} />
      </mesh>
      <group scale={[1, 1, 0.78]}>
        <mesh
          position={[0, 0.095, 0]}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[5.4, 11]} />
          <meshStandardMaterial color="#c6cfab" />
        </mesh>
      </group>
      {Array.from({ length: 12 }, (_, i) => (
        <Cylinder
          key={i}
          position={[-0.5 + Math.sin(i * 0.48) * 1.1, 0.13, -0.6 + i * 0.35]}
          scale={[0.35, 0.06, 0.22]}
          color={i % 2 ? "#e5d7bc" : "#eaddc5"}
        />
      ))}
      <Tree position={[-3.5, 0.12, -1.8]} scale={1.1} />
      <Tree position={[-2.1, 0.12, -3]} scale={0.8} />
      <Tree position={[-2.8, 0.12, -2.5]} scale={0.55} />
      <Tree position={[3.5, 0.12, -1.9]} scale={0.65} />
      <Tree position={[2.9, 0.12, -2.2]} scale={1.25} />
      <Tree position={[4, 0.12, 0.6]} scale={0.72} />
      <Tree position={[-4, 0.12, 0.5]} scale={0.65} />
      <mesh
        ref={pond}
        position={[-2.7, 0.13, 2]}
        rotation={[-Math.PI / 2, 0, 0.2]}
        scale={[1, 0.62, 1]}
      >
        <circleGeometry args={[1.03, 32]} />
        <meshStandardMaterial
          color="#89b9b9"
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
          color="#d6cbbb"
        />
      ))}
      <Flowers />
      <group ref={clouds}>
        {[
          [-6, 1, -3],
          [5, 3, -5],
          [-4, -2, 4],
          [5, -1, 3],
        ].map((p, i) => (
          <group key={i} position={p as [number, number, number]}>
            <Ball color="#f1e7ed" scale={[1, 0.32, 0.5]} />
            <Ball
              color="#f1e7ed"
              position={[0.6, 0.04, 0]}
              scale={[0.7, 0.25, 0.4]}
            />
          </group>
        ))}
      </group>
      <Box
        position={[2.9, 0.35, 1.4]}
        scale={[1.3, 0.12, 0.5]}
        color="#b39273"
      />
      {[2.4, 3.4].map((x) => (
        <Box
          key={x}
          position={[x, 0.2, 1.4]}
          scale={[0.09, 0.35, 0.4]}
          color="#876850"
        />
      ))}
    </group>
  );
}
