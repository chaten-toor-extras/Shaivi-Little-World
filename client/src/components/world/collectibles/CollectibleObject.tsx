"use client";

import { getAnchorPosition } from "@/data/worldAnchors";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { PublicCollectible } from "@/types";
import { useIntentionalClick } from "@/utils/intentionalClick";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import * as THREE from "three";
import CollectibleModel from "./CollectibleModel";

interface CollectibleObjectProps {
  collectible: PublicCollectible;
}

export default function CollectibleObject({ collectible }: CollectibleObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);
  const [isPickingUp, setIsPickingUp] = useState(false);
  const [collectedLocally, setCollectedLocally] = useState(false);
  const { handlePointerDown, handlePointerMove, isIntentionalClick } = useIntentionalClick();

  const mode = useExperienceStore((s) => s.mode);
  const transitioning = useExperienceStore((s) => s.transitioning);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const isItemCollected = useCollectibleStore((s) => s.isItemCollected);
  const grantCollectible = useCollectibleStore((s) => s.grantCollectible);

  const isCollected = isItemCollected(collectible._id) || collectedLocally;

  // Base island-local position from anchor + offset
  const basePosition = getAnchorPosition(
    collectible.placement?.anchor || "POND_EDGE",
    collectible.placement?.offset
  );

  const idleType = collectible.appearance?.idleAnimation || "FLOAT";
  const glowColor = collectible.appearance?.glowColor || "#ffe8b2";
  const accentColor = collectible.appearance?.accentColor || "#f7d070";

  // Pickup animation state in ref (zero React state updates per frame!)
  const pickupProgress = useRef(0);

  useFrame((_, delta) => {
    if (isCollected && !isPickingUp) return;

    // 1. Pickup Animation (0.8s lift, slight spin, fade)
    if (isPickingUp) {
      pickupProgress.current += delta / (reducedMotion ? 0.3 : 0.8);
      const p = Math.min(1, pickupProgress.current);

      if (animRef.current) {
        if (!reducedMotion) {
          // Smooth rise curve
          animRef.current.position.y = Math.sin(p * Math.PI * 0.5) * 0.45;
          animRef.current.rotation.y += delta * 4.5;
          const scale = Math.max(0, 1 - p * 0.9);
          animRef.current.scale.set(scale, scale, scale);
        } else {
          // Simple instant scale-down fade
          const scale = Math.max(0, 1 - p);
          animRef.current.scale.set(scale, scale, scale);
        }
      }

      if (haloRef.current) {
        haloRef.current.scale.setScalar(1 + p * 1.5);
      }

      if (p >= 1) {
        setIsPickingUp(false);
        setCollectedLocally(true);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "auto";
        }
      }
      return;
    }

    // 2. Idle Animation
    if (animRef.current) {
      if (reducedMotion || idleType === "NONE") {
        animRef.current.position.y = 0;
        animRef.current.rotation.y = 0;
      } else if (idleType === "FLOAT") {
        const t = performance.now() * 0.0018;
        animRef.current.position.y = Math.sin(t + basePosition[0]) * 0.035;
      } else if (idleType === "SLOW_SPIN") {
        animRef.current.rotation.y += delta * 0.4;
      } else if (idleType === "SOFT_PULSE") {
        const t = performance.now() * 0.0025;
        const s = 1.0 + Math.sin(t) * 0.04;
        animRef.current.scale.set(s, s, s);
      }
    }

    // 3. Subtle hover glow response
    if (haloRef.current) {
      const targetScale = hovered ? 1.4 : 1.0;
      haloRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // If already collected and hideAfterCollected is enabled, unmount cleanly
  if (isCollected && !isPickingUp && collectible.behavior?.hideAfterCollected !== false) {
    return null;
  }

  const handleClick = (e?: { stopPropagation: () => void }) => {
    if (e) e.stopPropagation();
    if (mode !== "WORLD" || transitioning || isCollected || isPickingUp) return;

    setIsPickingUp(true);
    pickupProgress.current = 0;

    // Grant collectible via store
    grantCollectible(collectible._id, "WORLD");
  };

  return (
    <group ref={groupRef} position={basePosition}>
      {/* Invisible Comfort Hit Cylinder (radius 0.28, height 0.4) for easy desktop/mobile tap */}
      <mesh
        position={[0, 0.1, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClick={(e) => {
          if (!isIntentionalClick(e)) return;
          handleClick(e);
        }}
        onPointerOver={(e) => {
          if (mode === "WORLD" && !transitioning && !isCollected) {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[0.28, 0.28, 0.4, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Subtle Ambient Floor Glow Ring */}
      <mesh
        ref={haloRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
      >
        <ringGeometry args={[0.08, 0.22, 24]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={hovered ? 0.45 : 0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Animated 3D Model Group */}
      <group ref={animRef} position={[0, 0.06, 0]}>
        <CollectibleModel
          modelKey={collectible.model?.modelKey}
          scalePreset={collectible.model?.scalePreset}
          rotationPreset={collectible.model?.rotationPreset}
          glowColor={glowColor}
          accentColor={accentColor}
        />
      </group>

      {/* Accessible HTML Mirror / Keyboard Control (Hidden from screen view, accessible to screen readers & keyboard tab) */}
      <Html position={[0, 0, 0]} zIndexRange={[10, 0]}>
        <button
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
          aria-label={`Pick up collectible: ${collectible.name}`}
          onClick={() => handleClick()}
        />
      </Html>
    </group>
  );
}

