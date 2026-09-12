/**
 * Phase 9.5 Canonical World Layout Architecture
 *
 * Single canonical source of truth for island dimensions, scale factors,
 * and world object coordinates in Shaivi's Little World.
 *
 * Architecture:
 * - BASE_WORLD_OBJECTS: Original authoring coordinates
 * - layoutSpread: 1.30x outward horizontal expansion (giving breathing room)
 * - terrainScale: 1.35x terrain footprint expansion
 * - RESOLVED_WORLD_OBJECTS: Spread coordinates consumed by Objects, Details,
 *   CameraRig focus targets, Butterfly flight paths, and Collectibles.
 */

export interface WorldLayoutConfig {
  center: [number, number, number];
  baseRadius: number;
  terrainScale: number;
  layoutSpread: number;
  islandRadius: number;
  maxPanRadius: number;
}

export const WORLD_LAYOUT: WorldLayoutConfig = {
  center: [0, 0, 0],
  baseRadius: 5.5,
  terrainScale: 1.35,
  layoutSpread: 1.30,
  islandRadius: 7.5,
  maxPanRadius: 4.2,
};

/**
 * Utility to spread positions outward from center on the horizontal X/Z plane.
 * Leaves Y (elevation) untouched so objects sit naturally on terrain.
 */
export function spreadXZ(
  position: [number, number, number],
  factor: number = WORLD_LAYOUT.layoutSpread,
  center: [number, number, number] = WORLD_LAYOUT.center
): [number, number, number] {
  const [x, y, z] = position;
  const [cx, , cz] = center;
  const newX = Number((cx + (x - cx) * factor).toFixed(3));
  const newZ = Number((cz + (z - cz) * factor).toFixed(3));
  return [newX, y, newZ];
}

/**
 * Base authored positions of key island features (before spread).
 */
export const BASE_WORLD_OBJECTS = {
  HOUSE: [0, 0.15, -1.1] as [number, number, number],
  DESK: [1.4, 0.12, 2.1] as [number, number, number],
  ART_WALL: [-2.8, 0.12, -0.3] as [number, number, number],
  TELESCOPE: [1.65, 0.35, -2.5] as [number, number, number],
  MAILBOX: [-0.5, 0.12, 3.1] as [number, number, number],
  RECORD_PLAYER: [3.0, 0.12, 0.3] as [number, number, number],
  POND: [-2.7, 0.13, 2.0] as [number, number, number],
  BENCH: [2.9, 0.35, 1.4] as [number, number, number],
  BRIDGE: [-2.65, 0.25, 1.9] as [number, number, number],
  LAMP: [-1.4, 0.13, 1.2] as [number, number, number],
  FLOWER_MEADOW: [0.35, 0.16, 0.95] as [number, number, number],
};

/**
 * Canonical resolved positions (with layoutSpread applied).
 * All scene components, CameraRig, and collectible anchors derive from this single object.
 */
export const RESOLVED_WORLD_OBJECTS = {
  // House shifts slightly further north along Z to open up central meadow
  HOUSE: [0, 0.15, -1.45] as [number, number, number],
  DESK: spreadXZ(BASE_WORLD_OBJECTS.DESK),                    // [1.82, 0.12, 2.73]
  ART_WALL: spreadXZ(BASE_WORLD_OBJECTS.ART_WALL),            // [-3.64, 0.12, -0.39]
  TELESCOPE: spreadXZ(BASE_WORLD_OBJECTS.TELESCOPE),          // [2.15, 0.35, -3.25]
  MAILBOX: spreadXZ(BASE_WORLD_OBJECTS.MAILBOX),              // [-0.65, 0.12, 4.03]
  RECORD_PLAYER: spreadXZ(BASE_WORLD_OBJECTS.RECORD_PLAYER),  // [3.90, 0.12, 0.39]
  POND: spreadXZ(BASE_WORLD_OBJECTS.POND),                    // [-3.51, 0.13, 2.60]
  BENCH: spreadXZ(BASE_WORLD_OBJECTS.BENCH),                  // [3.77, 0.35, 1.82]
  BRIDGE: spreadXZ(BASE_WORLD_OBJECTS.BRIDGE),                // [-3.45, 0.25, 2.47]
  LAMP: spreadXZ(BASE_WORLD_OBJECTS.LAMP),                    // [-1.82, 0.13, 1.56]
  FLOWER_MEADOW: spreadXZ(BASE_WORLD_OBJECTS.FLOWER_MEADOW),  // [0.45, 0.16, 1.24]
};

/**
 * Camera focus destinations derived directly from the canonical resolved positions.
 * Used by CameraRig to ensure cinematic transitions land exactly on the object.
 */
export const CAMERA_FOCUS_TARGETS = {
  ABOUT: [
    RESOLVED_WORLD_OBJECTS.HOUSE[0],
    RESOLVED_WORLD_OBJECTS.HOUSE[1] + 0.95,
    RESOLVED_WORLD_OBJECTS.HOUSE[2] + 0.2,
  ] as [number, number, number],
  QUOTES: [
    RESOLVED_WORLD_OBJECTS.DESK[0],
    RESOLVED_WORLD_OBJECTS.DESK[1] + 1.4,
    RESOLVED_WORLD_OBJECTS.DESK[2] + 0.08,
  ] as [number, number, number],
  GALLERY: [
    RESOLVED_WORLD_OBJECTS.ART_WALL[0],
    RESOLVED_WORLD_OBJECTS.ART_WALL[1] + 0.93,
    RESOLVED_WORLD_OBJECTS.ART_WALL[2] - 0.1,
  ] as [number, number, number],
  JOURNEY: [
    RESOLVED_WORLD_OBJECTS.TELESCOPE[0],
    RESOLVED_WORLD_OBJECTS.TELESCOPE[1] + 1.45,
    RESOLVED_WORLD_OBJECTS.TELESCOPE[2],
  ] as [number, number, number],
  CONTACT: [
    RESOLVED_WORLD_OBJECTS.MAILBOX[0],
    RESOLVED_WORLD_OBJECTS.MAILBOX[1] + 0.68,
    RESOLVED_WORLD_OBJECTS.MAILBOX[2],
  ] as [number, number, number],
  MUSIC: [
    RESOLVED_WORLD_OBJECTS.RECORD_PLAYER[0],
    RESOLVED_WORLD_OBJECTS.RECORD_PLAYER[1] + 0.68,
    RESOLVED_WORLD_OBJECTS.RECORD_PLAYER[2],
  ] as [number, number, number],
};

