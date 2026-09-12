import { CAMERA_FOCUS_TARGETS } from "@/data/worldLayout";
import { useCameraNavigationStore } from "@/components/world/navigation/cameraNavigationStore";
import { fitCameraToIsland } from "@/components/world/navigation/fitCameraToIsland";
import { useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore, type Mode } from "@/store/useExperienceStore";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { QUOTE_TV, TV_FOCUS, quoteCameraDistance } from "../world/quote-tv/quoteTVConfig";
import { useQuoteTV } from "../world/quote-tv/QuoteTVContext";

export const anchors = CAMERA_FOCUS_TARGETS;

export default function CameraRig() {
  const inWorldQuotes = !!useQuoteTV()?.enabled;
  const { camera, size } = useThree();
  const mode = useExperienceStore((s) => s.mode);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const worldSettings = useWorldSettings();
  const target = useRef(new Vector3(0, 0.85, 0));

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const world = mode === "WORLD" || mode === "INTRO";
    if (mode === "QUOTES" && inWorldQuotes) useExperienceStore.setState({ transitioning: true });
    const defaultFit = fitCameraToIsland(size.width, size.height);
    const savedPose = useCameraNavigationStore.getState().savedExplorationPose;

    const destination = world
      ? (savedPose ? savedPose.target.clone() : defaultFit.target.clone())
      : new Vector3(...CAMERA_FOCUS_TARGETS[mode]);
    if (mode === "QUOTES" && inWorldQuotes) destination.set(QUOTE_TV[0] + TV_FOCUS[0], QUOTE_TV[1] + TV_FOCUS[1], QUOTE_TV[2] + TV_FOCUS[2]);

    // Fit the screen to both viewport axes, including portrait displays.
    const screenDistance = Math.max(
      1.48,
      1.13 /
        (2 *
          Math.tan((37 * Math.PI) / 360) *
          (size.width / size.height) *
          0.85),
    );
    const end = world
      ? (savedPose ? savedPose.position.clone() : defaultFit.position.clone())
      : mode === "QUOTES"
        ? new Vector3(destination.x, destination.y, destination.z + screenDistance)
        : destination.clone().add(new Vector3(2.5, 2.1, 5.6));

    const start = cam.position.clone();
    const fromTarget = target.current.clone();
    if (mode === "QUOTES" && inWorldQuotes) {
      // Start along the actual free-camera sightline, even after orbit/pan.
      fromTarget.copy(start).add(camera.getWorldDirection(new Vector3()).multiplyScalar(
        Math.max(0.1, start.distanceTo(savedPose?.target || target.current))));
    }
    const startFov = cam.fov;

    // Framing FOV offset
    const framingOffset =
      worldSettings.camera?.framing === "CLOSE"
        ? -4
        : worldSettings.camera?.framing === "WIDE"
          ? 4
          : 0;

    const baseEndFov = world ? defaultFit.fov : mode === "QUOTES" ? 37 : 42;
    const endFov = Math.max(25, Math.min(65, baseEndFov + framingOffset));
    if (mode === "QUOTES" && inWorldQuotes) end.copy(destination).add(new Vector3(0, 0,
      quoteCameraDistance(size.width, size.height, endFov)));

    // Camera speed calculation
    const speedSetting = worldSettings.camera?.travelSpeed || "NORMAL";
    let baseDuration = mode === "INTRO" ? 1.5 : 1.25;
    if (speedSetting === "INSTANT") baseDuration = 0.05;
    else if (speedSetting === "FAST") baseDuration *= 0.65;
    else if (speedSetting === "CINEMATIC") baseDuration *= 1.6;
    const duration = reduced ? 0 : baseDuration;

    // Camera easing calculation
    const easingSetting = worldSettings.camera?.easing || "SMOOTH";
    const ease =
      easingSetting === "SOFT"
        ? "sine.inOut"
        : easingSetting === "CINEMATIC"
          ? "power3.inOut"
          : "power2.inOut";

    // Arc strength calculation
    const arcSetting = worldSettings.camera?.arcStrength || "NORMAL";
    const arcLift = reduced
      ? 0
      : arcSetting === "NONE"
        ? 0
        : arcSetting === "SUBTLE"
          ? 0.3
          : arcSetting === "CINEMATIC"
            ? 1.15
            : 0.65;

    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: 1,
      duration,
      ease,
      onUpdate: () => {
        cam.position.lerpVectors(start, end, progress.value);
        // Lift the camera along a gentle arc to clear nearby objects.
        cam.position.y += Math.sin(progress.value * Math.PI) * arcLift;
        target.current.lerpVectors(fromTarget, destination, progress.value);
        cam.lookAt(target.current);
        cam.fov = startFov + (endFov - startFov) * progress.value;
        cam.updateProjectionMatrix();
      },
      onComplete: () => {
        if (mode === "INTRO") useExperienceStore.getState().skip();
        else useExperienceStore.getState().settle();
      },
    });

    // Background tabs may throttle animation frames; never leave navigation locked.
    const deadlineTimeout = Math.round(duration * 1000 + 400);
    const deadline = setTimeout(() => {
      if (tween.progress() < 1) tween.progress(1);
    }, deadlineTimeout);

    return () => {
      clearTimeout(deadline);
      tween.kill();
    };
  }, [
    camera,
    inWorldQuotes,
    mode,
    reduced,
    size.width,
    size.height,
    worldSettings.camera?.travelSpeed,
    worldSettings.camera?.easing,
    worldSettings.camera?.arcStrength,
    worldSettings.camera?.framing,
  ]);

  return null;
}
