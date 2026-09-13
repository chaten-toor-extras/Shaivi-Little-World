import { WORLD_LAYOUT } from "../../../data/worldLayout";
import * as THREE from "three";

export interface CinematicCameraFit {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

/**
 * Derives responsive camera pose and target for Phase 11 completion shot.
 *
 * Distinctly accounts for mobile portrait vs desktop:
 * - On desktop: elevated three-quarter wide overview centering the expanded island
 *   with generous breathing room.
 * - On mobile portrait (320px–430px): offsets target slightly and balances distance
 *   so the island rests elegantly in the upper 60% of the viewport, leaving the
 *   lower portion comfortably open for the completion message overlay.
 */
export function fitCinematicCamera(
  width: number,
  height: number,
  baseFov: number = 38
): CinematicCameraFit {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const aspect = safeWidth / safeHeight;
  const isPortrait = aspect < 1.0;

  // Portrait mobile uses slightly wider FOV for comfortable vertical breathing room
  const fov = isPortrait ? 44 : baseFov;
  const vFovRad = (fov * Math.PI) / 360;
  const hFovRad = Math.atan(Math.tan(vFovRad) * aspect);

  const radius = WORLD_LAYOUT.islandRadius;

  if (isPortrait) {
    // Mobile Portrait framing
    // Extra vertical padding to lift island and reserve lower screen for message
    const padding = 1.25;
    const distV = (radius / Math.tan(vFovRad)) * padding;
    const distH = (radius / Math.tan(hFovRad)) * 1.15;
    const distance = Math.max(distV, distH);

    // Elevated angle to see island surface clearly
    const elevationAngle = (34 * Math.PI) / 180;
    const azimuthAngle = (50 * Math.PI) / 180;

    // Shift target slightly down-screen in world coordinates to center island in upper viewport
    const targetY = 0.55;
    const target = new THREE.Vector3(0, targetY, 0);

    const x = distance * Math.cos(elevationAngle) * Math.sin(azimuthAngle);
    const y = targetY + distance * Math.sin(elevationAngle);
    const z = distance * Math.cos(elevationAngle) * Math.cos(azimuthAngle);

    return {
      position: new THREE.Vector3(
        Number(x.toFixed(2)),
        Number(y.toFixed(2)),
        Number(z.toFixed(2))
      ),
      target,
      fov,
    };
  }

  // Desktop / Landscape framing
  const padding = 1.18;
  const distV = (radius / Math.tan(vFovRad)) * padding;
  const distH = (radius / Math.tan(hFovRad)) * padding;
  const distance = Math.max(distV, distH);

  const elevationAngle = (32 * Math.PI) / 180;
  const azimuthAngle = (52 * Math.PI) / 180;

  const targetY = 0.85;
  const target = new THREE.Vector3(0, targetY, 0);

  const x = distance * Math.cos(elevationAngle) * Math.sin(azimuthAngle);
  const y = targetY + distance * Math.sin(elevationAngle);
  const z = distance * Math.cos(elevationAngle) * Math.cos(azimuthAngle);

  return {
    position: new THREE.Vector3(
      Number(x.toFixed(2)),
      Number(y.toFixed(2)),
      Number(z.toFixed(2))
    ),
    target,
    fov,
  };
}
