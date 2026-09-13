"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { fitCinematicCamera } from "./fitCinematicCamera";
import {
  useCompletionCinematicStore,
  type PreCinematicPose,
} from "./useCompletionCinematicStore";
import { useCameraNavigationStore } from "@/components/world/navigation/cameraNavigationStore";
import { fitCameraToIsland } from "@/components/world/navigation/fitCameraToIsland";

export default function CompletionCameraController() {
  const { camera, size } = useThree();
  const stage = useCompletionCinematicStore((s) => s.stage);
  const setStage = useCompletionCinematicStore((s) => s.setStage);
  const setPreCinematicPose = useCompletionCinematicStore(
    (s) => s.setPreCinematicPose
  );
  const finishCinematic = useCompletionCinematicStore((s) => s.finishCinematic);
  const preCinematicPoseRef = useRef<PreCinematicPose | null>(null);

  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);
  const activeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTargetRef = useRef(new THREE.Vector3(0, 0.85, 0));

  // Clean up any in-flight tweens and timeouts safely
  const clearInFlight = () => {
    if (activeTweenRef.current) {
      activeTweenRef.current.kill();
      activeTweenRef.current = null;
    }
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;

    // PREPARING: Capture stable camera pose before motion starts
    if (stage === "PREPARING") {
      clearInFlight();

      // Retrieve existing target from saved exploration pose or fallback to default fit target
      const navStore = useCameraNavigationStore.getState();
      const defaultFit = fitCameraToIsland(size.width, size.height);
      const stableTarget = navStore.savedExplorationPose?.target
        ? navStore.savedExplorationPose.target.clone()
        : defaultFit.target.clone();

      const capturedPose: PreCinematicPose = {
        position: cam.position.clone(),
        target: stableTarget,
        fov: cam.fov,
      };

      preCinematicPoseRef.current = capturedPose;
      setPreCinematicPose(capturedPose);
      currentTargetRef.current.copy(stableTarget);

      // Short quiet pause before the camera begins to pull back
      activeTimeoutRef.current = setTimeout(() => {
        setStage("PULLBACK");
      }, 500);
      return;
    }

    // PULLBACK: Smoothly animate camera to responsive wide framing
    if (stage === "PULLBACK") {
      clearInFlight();

      const fit = fitCinematicCamera(size.width, size.height);
      const startPos = cam.position.clone();
      const endPos = fit.position;

      const startTarget = currentTargetRef.current.clone();
      const endTarget = fit.target;

      const startFov = cam.fov;
      const endFov = fit.fov;

      const duration = reducedMotion ? 0.45 : 3.4;
      const ease = reducedMotion ? "sine.out" : "power2.inOut";

      const anim = { value: 0 };
      activeTweenRef.current = gsap.to(anim, {
        value: 1,
        duration,
        ease,
        onUpdate: () => {
          cam.position.lerpVectors(startPos, endPos, anim.value);
          // Gentle elevation arc to clear landscape gracefully
          if (!reducedMotion) {
            cam.position.y += Math.sin(anim.value * Math.PI) * 0.42;
          }

          currentTargetRef.current.lerpVectors(startTarget, endTarget, anim.value);
          cam.lookAt(currentTargetRef.current);

          cam.fov = startFov + (endFov - startFov) * anim.value;
          cam.updateProjectionMatrix();
        },
        onComplete: () => {
          activeTweenRef.current = null;
          setStage("WORLD_GLOW");
        },
      });

      return;
    }

    // WORLD_GLOW: Accents bloom for a brief moment, then message fades in
    if (stage === "WORLD_GLOW") {
      clearInFlight();

      activeTimeoutRef.current = setTimeout(() => {
        setStage("MESSAGE");
      }, reducedMotion ? 400 : 1200);

      return;
    }

    // RETURNING: Gracefully return camera and controls target back to pre-cinematic pose
    if (stage === "RETURNING") {
      clearInFlight();

      const restorePose =
        preCinematicPoseRef.current || {
          position: fitCameraToIsland(size.width, size.height).position,
          target: fitCameraToIsland(size.width, size.height).target,
          fov: fitCameraToIsland(size.width, size.height).fov,
        };

      const startPos = cam.position.clone();
      const endPos = restorePose.position;

      const startTarget = currentTargetRef.current.clone();
      const endTarget = restorePose.target;

      const startFov = cam.fov;
      const endFov = restorePose.fov;

      const duration = reducedMotion ? 0.35 : 1.35;
      const ease = "power2.out";

      const anim = { value: 0 };
      activeTweenRef.current = gsap.to(anim, {
        value: 1,
        duration,
        ease,
        onUpdate: () => {
          cam.position.lerpVectors(startPos, endPos, anim.value);
          currentTargetRef.current.lerpVectors(startTarget, endTarget, anim.value);
          cam.lookAt(currentTargetRef.current);

          cam.fov = startFov + (endFov - startFov) * anim.value;
          cam.updateProjectionMatrix();
        },
        onComplete: () => {
          activeTweenRef.current = null;
          // Synchronize saved exploration pose with restored target
          useCameraNavigationStore
            .getState()
            .saveExplorationPose(restorePose.position, restorePose.target);

          // Finish and re-enable OrbitControls seamlessly
          finishCinematic();
        },
      });

      return;
    }

    // IDLE / COMPLETE
    if (stage === "IDLE" || stage === "COMPLETE") {
      clearInFlight();
    }
  }, [
    stage,
    camera,
    size.width,
    size.height,
    reducedMotion,
    setStage,
    setPreCinematicPose,
    finishCinematic,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInFlight();
      if (useCompletionCinematicStore.getState().stage !== "IDLE") {
        finishCinematic();
      }
    };
  }, [finishCinematic]);

  return null;
}

