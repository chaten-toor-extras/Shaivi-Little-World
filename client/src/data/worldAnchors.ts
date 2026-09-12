import { RESOLVED_WORLD_OBJECTS } from "@/data/worldLayout";
import type { CollectibleAnchor } from "@/types";

export interface WorldAnchorDefinition {
  key: CollectibleAnchor;
  name: string;
  description: string;
  position: [number, number, number];
}

/**
 * Island-local coordinate anchors for collectible world placement.
 * Derived directly from the canonical RESOLVED_WORLD_OBJECTS in worldLayout.ts.
 * Guaranteed to keep collectibles in sync whenever layout spreads or updates.
 */
export const WORLD_ANCHORS: Record<CollectibleAnchor, WorldAnchorDefinition> = {
  POND_EDGE: {
    key: "POND_EDGE",
    name: "Pond Edge",
    description: "Along the mossy pebble bank near the tranquil water.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.POND[0] + 0.85).toFixed(3)),
      0.22,
      Number((RESOLVED_WORLD_OBJECTS.POND[2] + 0.45).toFixed(3)),
    ],
  },
  HOUSE_GARDEN: {
    key: "HOUSE_GARDEN",
    name: "Cottage Garden",
    description: "Beside the planter boxes and wildflowers near the cottage wall.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.HOUSE[0] - 1.4).toFixed(3)),
      0.22,
      Number((RESOLVED_WORLD_OBJECTS.HOUSE[2] + 0.85).toFixed(3)),
    ],
  },
  TREE_CLUSTER: {
    key: "TREE_CLUSTER",
    name: "Pine Grove",
    description: "Nestled in the soft shade under the clustered pine trees.",
    position: [-3.6, 0.22, -2.8],
  },
  BENCH: {
    key: "BENCH",
    name: "Wooden Bench",
    description: "Resting gently on the wooden planks of the island bench.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.BENCH[0] - 0.35).toFixed(3)),
      0.44,
      Number(RESOLVED_WORLD_OBJECTS.BENCH[2].toFixed(3)),
    ],
  },
  BRIDGE: {
    key: "BRIDGE",
    name: "Footbridge",
    description: "On the approach planks crossing over the gentle stream.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.BRIDGE[0] + 0.45).toFixed(3)),
      0.32,
      Number((RESOLVED_WORLD_OBJECTS.BRIDGE[2] - 0.2).toFixed(3)),
    ],
  },
  ART_WALL: {
    key: "ART_WALL",
    name: "Art Easel",
    description: "Beside the wooden easel legs and color palette.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.ART_WALL[0] + 0.75).toFixed(3)),
      0.22,
      Number((RESOLVED_WORLD_OBJECTS.ART_WALL[2] + 0.18).toFixed(3)),
    ],
  },
  TELESCOPE_BASE: {
    key: "TELESCOPE_BASE",
    name: "Telescope Clearing",
    description: "On the grass clearing leading up to the stargazing terrace.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.TELESCOPE[0] - 0.65).toFixed(3)),
      0.25,
      Number((RESOLVED_WORLD_OBJECTS.TELESCOPE[2] + 0.45).toFixed(3)),
    ],
  },
  MAILBOX_AREA: {
    key: "MAILBOX_AREA",
    name: "Postbox Corner",
    description: "Near the rustic wooden postbox on the front path.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.MAILBOX[0] + 0.45).toFixed(3)),
      0.22,
      Number((RESOLVED_WORLD_OBJECTS.MAILBOX[2] - 0.35).toFixed(3)),
    ],
  },
  CLOCK_AREA: {
    key: "CLOCK_AREA",
    name: "Gramophone Table",
    description: "Beside the vintage record player where melodies drift.",
    position: [
      Number((RESOLVED_WORLD_OBJECTS.RECORD_PLAYER[0] - 0.65).toFixed(3)),
      0.22,
      Number((RESOLVED_WORLD_OBJECTS.RECORD_PLAYER[2] + 0.15).toFixed(3)),
    ],
  },
  FLOWER_FIELD: {
    key: "FLOWER_FIELD",
    name: "Wildflower Meadow",
    description: "Hidden among the blooming buttercups and soft petals.",
    position: [
      RESOLVED_WORLD_OBJECTS.FLOWER_MEADOW[0],
      0.22,
      RESOLVED_WORLD_OBJECTS.FLOWER_MEADOW[2],
    ],
  },
  ISLAND_PATH: {
    key: "ISLAND_PATH",
    name: "Stepping Stones",
    description: "Beside the stepping stones that wind across the island.",
    position: [0.45, 0.20, 0.25],
  },
};

export const ANCHOR_LIST = Object.values(WORLD_ANCHORS);

export function getAnchorPosition(
  anchor: CollectibleAnchor,
  offset?: { x?: number; y?: number; z?: number }
): [number, number, number] {
  const def = WORLD_ANCHORS[anchor] || WORLD_ANCHORS.POND_EDGE;
  const ox = offset?.x ?? 0;
  const oy = offset?.y ?? 0;
  const oz = offset?.z ?? 0;
  return [def.position[0] + ox, def.position[1] + oy, def.position[2] + oz];
}
