"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import type { ResolvedWorldTheme } from "@/types/world";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, DirectionalLight, Fog, HemisphereLight, Vector3 } from "three";

interface WorldAtmosphereProps {
  theme: ResolvedWorldTheme;
  transitionDuration?: number;
  shadowLevel?: "OFF" | "BALANCED" | "HIGH";
  directionalCastShadow?: boolean;
}

export default function WorldAtmosphere({
  theme,
  transitionDuration = 6,
  shadowLevel = "BALANCED",
  directionalCastShadow = true,
}: WorldAtmosphereProps) {
  const quality = useExperienceStore((s) => s.quality);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  const bgRef = useRef<Color>(null);
  const fogRef = useRef<Fog>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const dirRef = useRef<DirectionalLight>(null);

  // Reusable colors and vectors to eliminate garbage collection in frame loop
  const currentBgColor = useMemo(
    () => new Color(theme.backgroundColor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const currentFogColor = useMemo(
    () => new Color(theme.fog.color),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const currentHemiSky = useMemo(
    () => new Color(theme.hemisphere.skyColor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const currentHemiGround = useMemo(
    () => new Color(theme.hemisphere.groundColor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const currentDirColor = useMemo(
    () => new Color(theme.directional.color),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const currentDirPos = useMemo(
    () =>
      new Vector3(
        theme.directional.position.x,
        theme.directional.position.y,
        theme.directional.position.z,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const targetBgColor = useMemo(
    () => new Color(theme.backgroundColor),
    [theme.backgroundColor],
  );
  const targetFogColor = useMemo(
    () => new Color(theme.fog.color),
    [theme.fog.color],
  );
  const targetHemiSky = useMemo(
    () => new Color(theme.hemisphere.skyColor),
    [theme.hemisphere.skyColor],
  );
  const targetHemiGround = useMemo(
    () => new Color(theme.hemisphere.groundColor),
    [theme.hemisphere.groundColor],
  );
  const targetDirColor = useMemo(
    () => new Color(theme.directional.color),
    [theme.directional.color],
  );
  const targetDirPos = useMemo(
    () =>
      new Vector3(
        theme.directional.position.x,
        theme.directional.position.y,
        theme.directional.position.z,
      ),
    [
      theme.directional.position.x,
      theme.directional.position.y,
      theme.directional.position.z,
    ],
  );

  // Handle instant jump when reduced motion is enabled
  useEffect(() => {
    if (reducedMotion || transitionDuration <= 0) {
      currentBgColor.copy(targetBgColor);
      currentFogColor.copy(targetFogColor);
      currentHemiSky.copy(targetHemiSky);
      currentHemiGround.copy(targetHemiGround);
      currentDirColor.copy(targetDirColor);
      currentDirPos.copy(targetDirPos);

      if (bgRef.current) {
        bgRef.current.copy(targetBgColor);
      }
      if (fogRef.current) {
        fogRef.current.color.copy(targetFogColor);
        fogRef.current.near = theme.fog.near;
        fogRef.current.far = theme.fog.far;
      }
      if (hemiRef.current) {
        hemiRef.current.color.copy(targetHemiSky);
        hemiRef.current.groundColor.copy(targetHemiGround);
        hemiRef.current.intensity = theme.hemisphere.intensity;
      }
      if (dirRef.current) {
        dirRef.current.color.copy(targetDirColor);
        dirRef.current.intensity = theme.directional.intensity;
        dirRef.current.position.copy(targetDirPos);
      }
    }
  }, [
    reducedMotion,
    transitionDuration,
    targetBgColor,
    targetFogColor,
    targetHemiSky,
    targetHemiGround,
    targetDirColor,
    targetDirPos,
    currentBgColor,
    currentFogColor,
    currentHemiSky,
    currentHemiGround,
    currentDirColor,
    currentDirPos,
    theme.fog.near,
    theme.fog.far,
    theme.hemisphere.intensity,
    theme.directional.intensity,
  ]);

  const shadowMapResolution =
    shadowLevel === "HIGH" || quality === "HIGH" ? 2048 : 1024;
  const canCastShadow =
    directionalCastShadow && shadowLevel !== "OFF" && quality !== "LOW";

  // Smooth lerp in frame loop with zero React setState overhead
  useFrame((_, dt) => {
    if (reducedMotion || transitionDuration <= 0) return;

    // Exponential smoothing factor based on duration
    const speed = Math.max(0.2, transitionDuration);
    const alpha = 1 - Math.exp(-dt * (3.5 / speed));

    // Lerp background color
    if (bgRef.current) {
      bgRef.current.lerp(targetBgColor, alpha);
    }

    // Lerp fog properties via ref
    if (fogRef.current) {
      currentFogColor.lerp(targetFogColor, alpha);
      fogRef.current.color.copy(currentFogColor);
      fogRef.current.near += (theme.fog.near - fogRef.current.near) * alpha;
      fogRef.current.far += (theme.fog.far - fogRef.current.far) * alpha;
    }

    // Lerp hemisphere light
    if (hemiRef.current) {
      currentHemiSky.lerp(targetHemiSky, alpha);
      currentHemiGround.lerp(targetHemiGround, alpha);
      hemiRef.current.color.copy(currentHemiSky);
      hemiRef.current.groundColor.copy(currentHemiGround);
      hemiRef.current.intensity +=
        (theme.hemisphere.intensity - hemiRef.current.intensity) * alpha;
    }

    // Lerp directional light
    if (dirRef.current) {
      currentDirColor.lerp(targetDirColor, alpha);
      currentDirPos.lerp(targetDirPos, alpha);
      dirRef.current.color.copy(currentDirColor);
      dirRef.current.position.copy(currentDirPos);
      dirRef.current.intensity +=
        (theme.directional.intensity - dirRef.current.intensity) * alpha;
    }
  });

  return (
    <>
      <color ref={bgRef} attach="background" args={[theme.backgroundColor]} />
      {theme.fog.enabled && (
        <fog
          ref={fogRef}
          attach="fog"
          args={[theme.fog.color, theme.fog.near, theme.fog.far]}
        />
      )}

      {theme.hemisphere.enabled && (
        <hemisphereLight
          ref={hemiRef}
          args={[
            theme.hemisphere.skyColor,
            theme.hemisphere.groundColor,
            theme.hemisphere.intensity,
          ]}
        />
      )}

      {theme.directional.enabled && (
        <directionalLight
          ref={dirRef}
          position={[
            theme.directional.position.x,
            theme.directional.position.y,
            theme.directional.position.z,
          ]}
          color={theme.directional.color}
          intensity={theme.directional.intensity}
          castShadow={canCastShadow}
          shadow-mapSize={[shadowMapResolution, shadowMapResolution]}
          shadow-camera-left={-11}
          shadow-camera-right={11}
          shadow-camera-top={11}
          shadow-camera-bottom={-11}
          shadow-normalBias={0.05}
        />
      )}
    </>
  );
}
