"use client";

import type {
  CollectibleModelKey,
  CollectibleRotationPreset,
  CollectibleScalePreset,
} from "@/types";
import React, { useMemo } from "react";
import { COLLECTIBLE_MODELS } from "./modelRegistry";

interface CollectibleModelProps {
  modelKey?: CollectibleModelKey;
  scalePreset?: CollectibleScalePreset;
  rotationPreset?: CollectibleRotationPreset;
  glowColor?: string;
  accentColor?: string;
}

const SCALE_MAP: Record<CollectibleScalePreset, number> = {
  TINY: 0.6,
  SMALL: 0.8,
  NORMAL: 1.0,
  FEATURED: 1.35,
};

const ROTATION_MAP: Record<CollectibleRotationPreset, [number, number, number]> = {
  DEFAULT: [0, 0, 0],
  UPRIGHT: [0, 0, 0],
  FLAT: [-Math.PI / 2, 0, 0],
  TILTED: [0.3, 0.4, 0.2],
};

export default function CollectibleModel({
  modelKey = "tiny_star",
  scalePreset = "NORMAL",
  rotationPreset = "DEFAULT",
  glowColor = "#ffe8b2",
  accentColor = "#f7d070",
}: CollectibleModelProps) {
  const scale = SCALE_MAP[scalePreset] ?? 1.0;
  const rotation = ROTATION_MAP[rotationPreset] ?? [0, 0, 0];

  const registryEntry = useMemo(() => {
    return COLLECTIBLE_MODELS[modelKey] || COLLECTIBLE_MODELS.tiny_star;
  }, [modelKey]);

  return (
    <group scale={[scale, scale, scale]} rotation={rotation}>
      {registryEntry.render({ glowColor, accentColor })}
    </group>
  );
}

