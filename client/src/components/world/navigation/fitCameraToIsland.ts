import { WORLD_LAYOUT } from "@/data/worldLayout";
import * as THREE from "three";

export interface CameraFitResult {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  distance: number;
}

/**
 * Derives responsive 3D camera distance and starting pose
 * based on viewport aspect ratio, vertical/horizontal FOV, and island bounds.
 *
 * Ensures portrait mobile (320px–430px) frames the island at ~68–78%
 * of useful visual area with comfortable margins for header & footer,
 * while desktop comfortably frames at ~65–72%.
 */
export function fitCameraToIsland(
  width: number,
  height: number,
  baseFov: number = 38
): CameraFitResult {
  const aspect = width / Math.max(1, height);
  const isPortrait = aspect < 1.0;

  // Adapt FOV slightly on portrait mobile to maintain natural perspective
  const fov = isPortrait ? 44 : baseFov;

  // Navigable island bounding radius
  const radius = WORLD_LAYOUT.islandRadius;

  // Safe padding factor accounting for UI headers, footer, and float drift
  const padding = isPortrait ? 1.28 : 1.18;

  // Vertical half-angle in radians
  const vFovRad = (fov * Math.PI) / 360;
  // Horizontal half-angle derived from vertical FOV and aspect ratio
  const hFovRad = Math.atan(Math.tan(vFovRad) * aspect);

  // Distance required to fit vertical extent
  const distV = (radius / Math.tan(vFovRad)) * padding;
  // Distance required to fit horizontal extent
  const distH = (radius / Math.tan(hFovRad)) * padding;

  // Constrain to whichever axis needs more distance
  const distance = Math.max(distV, distH);

  // Canonical elevated three-quarter viewing angle
  const elevationAngle = (31 * Math.PI) / 180;
  const azimuthAngle = (52 * Math.PI) / 180;

  const targetY = isPortrait ? 0.95 : 0.85;
  const target = new THREE.Vector3(0, targetY, 0);

  const x = distance * Math.cos(elevationAngle) * Math.sin(azimuthAngle);
  const y = targetY + distance * Math.sin(elevationAngle);
  const z = distance * Math.cos(elevationAngle) * Math.cos(azimuthAngle);

  const position = new THREE.Vector3(
    Number(x.toFixed(2)),
    Number(y.toFixed(2)),
    Number(z.toFixed(2))
  );

  return { position, target, fov, distance };
}

