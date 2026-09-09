import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { Vector3, PerspectiveCamera } from "three";
import { useExperienceStore, type Mode } from "@/store/useExperienceStore";

export const anchors: Record<
  Exclude<Mode, "INTRO" | "WORLD">,
  [number, number, number]
> = {
  ABOUT: [0, 1.1, -0.9],
  PROJECTS: [1.4, 1.52, 2.18],
  GALLERY: [-2.8, 1.05, -0.3],
  JOURNEY: [1.65, 1.8, -2.5],
  CONTACT: [-0.5, 0.8, 3.1],
  INTERESTS: [3, 0.8, 0.3],
};
export default function CameraRig() {
  const { camera, size } = useThree();
  const mode = useExperienceStore((s) => s.mode);
  const reduced = useExperienceStore((s) => s.reducedMotion);
  const target = useRef(new Vector3(0, 0.35, 0));
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const mobile = size.width < 700;
    const world = mode === "WORLD" || mode === "INTRO";
    const destination = world
      ? new Vector3(0, 0.35, 0)
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
          ...(mobile ? ([10, 12, 18] as const) : ([10, 10, 16] as const)),
        )
      : mode === "PROJECTS"
        ? new Vector3(1.4, 1.52, 2.18 + screenDistance)
        : destination.clone().add(new Vector3(2.5, 2.1, 5.6));
    const start = cam.position.clone();
    const fromTarget = target.current.clone();
    const startFov = cam.fov;
    const endFov = world ? (mobile ? 45 : 38) : mode === "PROJECTS" ? 37 : 42;
    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: 1,
      duration: reduced ? 0.01 : mode === "INTRO" ? 1.5 : 1.25,
      ease: "power2.inOut",
      onUpdate: () => {
        cam.position.lerpVectors(start, end, progress.value);
        // Lift the camera along a gentle arc to clear nearby objects.
        cam.position.y +=
          Math.sin(progress.value * Math.PI) * (reduced ? 0 : 0.65);
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
    return () => {
      tween.kill();
    };
  }, [camera, mode, reduced, size.width, size.height]);
  return null;
}
