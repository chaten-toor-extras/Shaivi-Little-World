"use client";

import { WORLD_LAYOUT } from "@/data/worldLayout";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import { useExperienceStore } from "@/store/useExperienceStore";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  canNavigateWorld,
  useCameraNavigationStore,
} from "./cameraNavigationStore";
import { fitCameraToIsland } from "./fitCameraToIsland";

export default function WorldNavigationController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, gl, size } = useThree();

  const mode = useExperienceStore((s) => s.mode);
  const transitioning = useExperienceStore((s) => s.transitioning);
  const secretOpen = useExperienceStore((s) => s.secretOpen);
  const bookOpen = useCollectibleStore((s) => s.bookOpen);

  const resetCounter = useCameraNavigationStore((s) => s.resetCounter);
  const setHasUserNavigated = useCameraNavigationStore(
    (s) => s.setHasUserNavigated
  );
  const saveExplorationPose = useCameraNavigationStore(
    (s) => s.saveExplorationPose
  );

  const isNavigable = canNavigateWorld();
  const prevNavigable = useRef(isNavigable);

  // Suppress context menu on 3D canvas so right-click pan doesn't open browser menu
  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextMenu = (e: MouseEvent) => {
      if (canNavigateWorld()) {
        e.preventDefault();
      }
    };
    canvas.addEventListener("contextmenu", handleContextMenu);
    return () => canvas.removeEventListener("contextmenu", handleContextMenu);
  }, [gl.domElement]);

  // Sync controls enabled state with canonical resolver
  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.enabled = isNavigable;

    // When transitioning from navigable to non-navigable (e.g. user clicked a section),
    // save the current exploration pose so we can return to it cleanly
    if (prevNavigable.current && !isNavigable) {
      saveExplorationPose(camera.position, controlsRef.current.target);
    } else if (!prevNavigable.current && isNavigable) {
      // Returning to world: sync OrbitControls target to current camera view
      const saved = useCameraNavigationStore.getState().savedExplorationPose;
      if (saved) {
        controlsRef.current.target.copy(saved.target);
      } else {
        const fit = fitCameraToIsland(size.width, size.height);
        controlsRef.current.target.copy(fit.target);
      }
      controlsRef.current.update();
    }
    prevNavigable.current = isNavigable;
  }, [isNavigable, camera.position, size.width, size.height, saveExplorationPose]);

  // Initial responsive framing if user has not navigated yet
  useEffect(() => {
    if (!controlsRef.current || useCameraNavigationStore.getState().hasUserNavigated) {
      return;
    }
    // Set initial target from responsive fit
    const fit = fitCameraToIsland(size.width, size.height);
    controlsRef.current.target.copy(fit.target);
  }, [size.width, size.height]);

  // Handle "Reset view" trigger
  useEffect(() => {
    if (resetCounter === 0 || !controlsRef.current) return;

    const fit = fitCameraToIsland(size.width, size.height);
    const startPos = camera.position.clone();
    const startTarget = controlsRef.current.target.clone();

    // Disable user controls while animating reset
    controlsRef.current.enabled = false;

    const animObj = { progress: 0 };
    gsap.to(animObj, {
      progress: 1,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.position.lerpVectors(startPos, fit.position, animObj.progress);
        controlsRef.current?.target.lerpVectors(
          startTarget,
          fit.target,
          animObj.progress
        );
        camera.lookAt(controlsRef.current!.target);
      },
      onComplete: () => {
        if (controlsRef.current && canNavigateWorld()) {
          controlsRef.current.enabled = true;
        }
      },
    });
  }, [resetCounter, camera, size.width, size.height]);

  // Listen to controls change to clamp pan bounds and record navigation
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleChange = () => {
      // 1. Clamp target within safe island pan boundaries
      const t = controls.target;
      const dist = Math.hypot(t.x, t.z);
      if (dist > WORLD_LAYOUT.maxPanRadius) {
        t.x = (t.x / dist) * WORLD_LAYOUT.maxPanRadius;
        t.z = (t.z / dist) * WORLD_LAYOUT.maxPanRadius;
      }
      // Keep target height within sensible island ground plane bounds
      t.y = Math.max(0.4, Math.min(1.35, t.y));

      // 2. Mark that user has actively explored
      setHasUserNavigated(true);
    };

    controls.addEventListener("change", handleChange);
    return () => controls.removeEventListener("change", handleChange);
  }, [setHasUserNavigated]);

  // Update controls damping on each animation frame
  useFrame(() => {
    if (controlsRef.current && isNavigable) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={isNavigable}
      enableDamping
      dampingFactor={0.075}
      enableRotate
      rotateSpeed={0.65}
      enableZoom
      zoomSpeed={0.8}
      minDistance={6.5}
      maxDistance={36.0}
      minPolarAngle={Math.PI * 0.14}
      maxPolarAngle={Math.PI * 0.46}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      enablePan
      panSpeed={0.55}
      screenSpacePanning={false}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
