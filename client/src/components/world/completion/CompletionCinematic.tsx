"use client";

import type { ResolvedWorldTheme } from "@/types/world";
import React from "react";
import CompletionCameraController from "./CompletionCameraController";
import CompletionWorldEffects from "./CompletionWorldEffects";

interface CompletionCinematicProps {
  theme: ResolvedWorldTheme;
}

/**
 * 3D Scene container for Phase 11 Completion Cinematic.
 * Mounts the cinematic camera controller and additive world effects.
 */
export default function CompletionCinematic({
  theme,
}: CompletionCinematicProps) {
  return (
    <>
      <CompletionCameraController />
      <CompletionWorldEffects theme={theme} />
    </>
  );
}

