import { useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore, type Mode } from "@/store/useExperienceStore";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";

export const anchors: Record<
  Exclude<Mode, "INTRO" | "WORLD">,
  [number, number, number]
> = {
  ABOUT: [0, 1.1, -0.9],
  QUOTES: [1.4, 1.52, 2.18],
  GALLERY: [-2.8, 1.05, -0.3],
  JOURNEY: [1.65, 1.8, -2.5],
  CONTACT: [-0.5, 0.8, 3.1],
  MUSIC: [3, 0.8, 0.3],
};

export default function CameraRig() {
  const { camera, size } = useThree();
  const mode = useExperienceStore((s) => s.mode);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const worldSettings = useWorldSettings();
  const target = useRef(new Vector3(0, 0.85, 0));

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const mobile = size.width < 700;
    const world = mode === "WORLD" || mode === "INTRO";
    const destination = world
      ? new Vector3(0, mobile ? 0.95 : 0.85, 0)
      : new Vector3(...anchors[mode]);

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
      ? new Vector3(
          ...(mobile ? ([10.5, 12.8, 19] as const) : ([10.5, 11, 17] as const)),
        )
      : mode === "QUOTES"
        ? new Vector3(1.4, 1.52, 2.18 + screenDistance)
        : destination.clone().add(new Vector3(2.5, 2.1, 5.6));

    const start = cam.position.clone();
    const fromTarget = target.current.clone();
    const startFov = cam.fov;

    // Framing FOV offset
    const framingOffset =
      worldSettings.camera?.framing === "CLOSE"
        ? -4
        : worldSettings.camera?.framing === "WIDE"
          ? 4
          : 0;

    const baseEndFov = world ? (mobile ? 45 : 38) : mode === "QUOTES" ? 37 : 42;
    const endFov = Math.max(25, Math.min(65, baseEndFov + framingOffset));

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
