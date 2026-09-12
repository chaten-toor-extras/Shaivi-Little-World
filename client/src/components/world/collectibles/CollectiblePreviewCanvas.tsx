"use client";

import type {
  CollectibleModelKey,
  CollectibleRotationPreset,
  CollectibleScalePreset,
} from "@/types";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
import CollectibleModel from "./CollectibleModel";

interface PreviewSceneProps {
  modelKey?: CollectibleModelKey;
  scalePreset?: CollectibleScalePreset;
  rotationPreset?: CollectibleRotationPreset;
  glowColor?: string;
  accentColor?: string;
}

function PreviewRotator({
  modelKey,
  scalePreset,
  rotationPreset,
  glowColor,
  accentColor,
}: PreviewSceneProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.65;
    }
  });

  return (
    <group ref={ref} position={[0, -0.02, 0]}>
      <CollectibleModel
        modelKey={modelKey}
        scalePreset={scalePreset || "FEATURED"}
        rotationPreset={rotationPreset || "DEFAULT"}
        glowColor={glowColor}
        accentColor={accentColor}
      />
    </group>
  );
}

export default function CollectiblePreviewCanvas(props: PreviewSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 0.75], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 4, 3]} intensity={1.4} />
      <pointLight position={[-2, 1, 2]} intensity={0.6} color="#ffeec2" />
      <PreviewRotator {...props} />
    </Canvas>
  );
}

