/**
 * Phase 10 Canonical World Evolution Placements
 *
 * Centralized island-local coordinates and offsets for progressive evolution props.
 * All positions derive strictly from RESOLVED_WORLD_OBJECTS in worldLayout.ts
 * and sit naturally on the expanded island terrain and object surfaces.
 */

import { RESOLVED_WORLD_OBJECTS } from "./worldLayout";

export const EVOLUTION_PLACEMENTS = {
  // Gallery: Placed beside the easel stand, firmly on the ground plane
  GALLERY_PALETTE: [
    Number((RESOLVED_WORLD_OBJECTS.ART_WALL[0] + 0.62).toFixed(3)),
    0.13,
    Number((RESOLVED_WORLD_OBJECTS.ART_WALL[2] + 0.28).toFixed(3)),
  ] as [number, number, number],

  GALLERY_SKETCH: [
    Number((RESOLVED_WORLD_OBJECTS.ART_WALL[0] - 0.42).toFixed(3)),
    0.36,
    Number((RESOLVED_WORLD_OBJECTS.ART_WALL[2] + 0.09).toFixed(3)),
  ] as [number, number, number],

  // Telescope: Constellation accent overhead and subtle lens shimmer
  TELESCOPE_STARS: [
    Number((RESOLVED_WORLD_OBJECTS.TELESCOPE[0] - 0.2).toFixed(3)),
    3.6,
    Number((RESOLVED_WORLD_OBJECTS.TELESCOPE[2] - 0.4).toFixed(3)),
  ] as [number, number, number],

  TELESCOPE_LENS: [
    Number((RESOLVED_WORLD_OBJECTS.TELESCOPE[0] + 0.28).toFixed(3)),
    1.65,
    Number((RESOLVED_WORLD_OBJECTS.TELESCOPE[2] + 0.18).toFixed(3)),
  ] as [number, number, number],

  // Mailbox: Letter tucked on post ledge and small star charm on wooden post
  MAILBOX_LETTER: [
    Number((RESOLVED_WORLD_OBJECTS.MAILBOX[0] + 0.06).toFixed(3)),
    0.98,
    Number((RESOLVED_WORLD_OBJECTS.MAILBOX[2] + 0.16).toFixed(3)),
  ] as [number, number, number],

  MAILBOX_STAR: [
    Number((RESOLVED_WORLD_OBJECTS.MAILBOX[0] - 0.08).toFixed(3)),
    0.65,
    Number((RESOLVED_WORLD_OBJECTS.MAILBOX[2] + 0.06).toFixed(3)),
  ] as [number, number, number],

  // Music: Miniature brass musical clef token resting on table next to gramophone
  MUSIC_CHARM: [
    Number((RESOLVED_WORLD_OBJECTS.RECORD_PLAYER[0] - 0.32).toFixed(3)),
    0.53,
    Number((RESOLVED_WORLD_OBJECTS.RECORD_PLAYER[2] + 0.16).toFixed(3)),
  ] as [number, number, number],

  // Quote TV: Rolled parchment quote strip on desk, safely clear of physical TV buttons
  QUOTE_NOTE: [
    Number((RESOLVED_WORLD_OBJECTS.DESK[0] + 0.54).toFixed(3)),
    0.86,
    Number((RESOLVED_WORLD_OBJECTS.DESK[2] + 0.18).toFixed(3)),
  ] as [number, number, number],

  // Secrets: Blooming magical flowers and soft fireflies at wildflower knoll
  SECRET_MEADOW_FLOWER: [
    Number((RESOLVED_WORLD_OBJECTS.FLOWER_MEADOW[0] + 0.38).toFixed(3)),
    0.16,
    Number((RESOLVED_WORLD_OBJECTS.FLOWER_MEADOW[2] + 0.32).toFixed(3)),
  ] as [number, number, number],

  SECRET_FIREFLIES: [
    Number((RESOLVED_WORLD_OBJECTS.FLOWER_MEADOW[0] + 0.1).toFixed(3)),
    0.7,
    Number((RESOLVED_WORLD_OBJECTS.FLOWER_MEADOW[2] + 0.1).toFixed(3)),
  ] as [number, number, number],

  // Collectibles: Wild violets, carved wooden star on bench, and water lily pads on pond
  COLLECTIBLE_VIOLETS: [
    Number((RESOLVED_WORLD_OBJECTS.HOUSE[0] - 1.25).toFixed(3)),
    0.14,
    Number((RESOLVED_WORLD_OBJECTS.HOUSE[2] + 1.12).toFixed(3)),
  ] as [number, number, number],

  COLLECTIBLE_BENCH_STAR: [
    Number((RESOLVED_WORLD_OBJECTS.BENCH[0] - 0.28).toFixed(3)),
    0.46,
    Number((RESOLVED_WORLD_OBJECTS.BENCH[2] + 0.04).toFixed(3)),
  ] as [number, number, number],

  COLLECTIBLE_POND_LILIES: [
    Number((RESOLVED_WORLD_OBJECTS.POND[0] + 0.42).toFixed(3)),
    0.18,
    Number((RESOLVED_WORLD_OBJECTS.POND[2] - 0.28).toFixed(3)),
  ] as [number, number, number],

  // Island Center: Gentle harmonic ground illumination
  ISLAND_HARMONY: [0, 0.15, 0] as [number, number, number],
};

