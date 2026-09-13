import type { Section } from "@/data/portfolio";

export type WorldEvolutionStage = "QUIET" | "AWAKENING" | "BLOOMING" | "ALIVE";

export type WorldEvolutionEffectId =
  | "GALLERY_PALETTE"
  | "GALLERY_SKETCH"
  | "TELESCOPE_STARS"
  | "TELESCOPE_LENS"
  | "MAILBOX_FLAG"
  | "MAILBOX_LETTER"
  | "MUSIC_CHARM"
  | "QUOTE_NOTE"
  | "SECRET_MEADOW_FLOWER"
  | "SECRET_FIREFLIES"
  | "COLLECTIBLE_VIOLETS"
  | "COLLECTIBLE_BENCH_STAR"
  | "COLLECTIBLE_POND_LILIES"
  | "COLLECTIBLE_HARMONY"
  | "COMPANION_BUTTERFLY";

export interface WorldProgressInput {
  visitedSections: Section[];
  discoveredSecretCount: number;
  totalActiveSecrets: number;
  collectedItemCount: number;
  totalActiveCollectibles: number;
  letterSent: boolean;
  journeyExplored: boolean;
  musicPlayed: boolean;
  quoteInteracted: boolean;
}

export interface WorldEvolutionState {
  visitedCount: number;
  visitedRatio: number;
  secretCount: number;
  secretRatio: number;
  collectibleCount: number;
  collectibleRatio: number;
  overallProgress: number; // 0.0 to 1.0 clamped
  stage: WorldEvolutionStage; // Internal derived stage
  completionEligible: boolean; // Phase 11 readiness
  effects: Record<WorldEvolutionEffectId, boolean>;
}

export interface WorldEvolutionRule {
  id: WorldEvolutionEffectId;
  name: string;
  description: string;
  evaluate: (ctx: {
    input: WorldProgressInput;
    visitedRatio: number;
    secretRatio: number;
    collectibleRatio: number;
    overallProgress: number;
  }) => boolean;
}

export const WORLD_EVOLUTION_RULES: WorldEvolutionRule[] = [
  {
    id: "GALLERY_PALETTE",
    name: "Artist Palette & Brushes",
    description: "Appears near the art easel after visitor explores the Gallery.",
    evaluate: ({ input }) => input.visitedSections.includes("GALLERY"),
  },
  {
    id: "GALLERY_SKETCH",
    name: "Pinned Mini Sketch",
    description: "Appears pinned on the easel stand once Gallery is explored and world is awakening.",
    evaluate: ({ input, overallProgress }) =>
      input.visitedSections.includes("GALLERY") && overallProgress >= 0.45,
  },
  {
    id: "TELESCOPE_STARS",
    name: "Constellation Glow",
    description: "Subtle localized star cluster accents in the sky above the Telescope after Journey is explored.",
    evaluate: ({ input }) => input.journeyExplored,
  },
  {
    id: "TELESCOPE_LENS",
    name: "Telescope Lens Shimmer",
    description: "Soft brass eyepiece shimmer on the telescope after Journey exploration.",
    evaluate: ({ input }) => input.journeyExplored,
  },
  {
    id: "MAILBOX_FLAG",
    name: "Raised Mailbox Flag",
    description: "Mailbox flag stands upright after a confirmed letter is sent.",
    evaluate: ({ input }) => input.letterSent,
  },
  {
    id: "MAILBOX_LETTER",
    name: "Parchment Envelope & Star Charm",
    description: "Tiny sealed letter tucked on mailbox ledge and paper star on post.",
    evaluate: ({ input }) => input.letterSent,
  },
  {
    id: "MUSIC_CHARM",
    name: "Treble Clef Token",
    description: "Miniature brass musical clef token resting on table beside the gramophone.",
    evaluate: ({ input }) => input.musicPlayed,
  },
  {
    id: "QUOTE_NOTE",
    name: "Parchment Quote Strip",
    description: "Delicate rolled paper quote strip on the desk beside the TV.",
    evaluate: ({ input }) => input.quoteInteracted,
  },
  {
    id: "SECRET_MEADOW_FLOWER",
    name: "Magical Meadow Flourish",
    description: "Cluster of luminous buttercups and wildflowers on the central meadow knoll.",
    evaluate: ({ input, secretRatio }) =>
      secretRatio >= 0.25 || input.discoveredSecretCount >= 1,
  },
  {
    id: "SECRET_FIREFLIES",
    name: "Meadow Firefly Cluster",
    description: "Soft dancing fairy motes hovering over the wildflower knoll.",
    evaluate: ({ secretRatio }) => secretRatio >= 0.5,
  },
  {
    id: "COLLECTIBLE_VIOLETS",
    name: "Cottage Garden Violets",
    description: "Patch of gentle blue violets blossoming near the cottage planter.",
    evaluate: ({ input, collectibleRatio }) =>
      collectibleRatio >= 0.25 || input.collectedItemCount >= 1,
  },
  {
    id: "COLLECTIBLE_BENCH_STAR",
    name: "Carved Bench Star Token",
    description: "Smooth carved wooden star token resting on the wooden bench beside the books.",
    evaluate: ({ collectibleRatio }) => collectibleRatio >= 0.5,
  },
  {
    id: "COLLECTIBLE_POND_LILIES",
    name: "Water Lily Pads",
    description: "Serene green lily pads floating on the pebble bank of the pond.",
    evaluate: ({ collectibleRatio }) => collectibleRatio >= 0.75,
  },
  {
    id: "COLLECTIBLE_HARMONY",
    name: "Island Center Harmony",
    description: "Subtle harmonic ground accent at island center upon finding all collectibles.",
    evaluate: ({ collectibleRatio }) => collectibleRatio >= 1.0,
  },
  {
    id: "COMPANION_BUTTERFLY",
    name: "Companion Azure Butterfly",
    description: "A delicate azure companion butterfly gliding in a wide, peaceful arc at high progress.",
    evaluate: ({ overallProgress }) => overallProgress >= 0.65,
  },
];

/**
 * Pure progression resolver.
 * Evaluates all rules against current exploration state without side effects.
 */
export function resolveWorldProgress(
  input: WorldProgressInput
): WorldEvolutionState {
  // Safe zero-division handling for dynamic CMS catalogs
  const secretRatio =
    input.totalActiveSecrets > 0
      ? Math.min(1, Math.max(0, input.discoveredSecretCount / input.totalActiveSecrets))
      : 1.0;

  const collectibleRatio =
    input.totalActiveCollectibles > 0
      ? Math.min(1, Math.max(0, input.collectedItemCount / input.totalActiveCollectibles))
      : 1.0;

  const visitedCount = input.visitedSections.length;
  const visitedRatio = Math.min(1, Math.max(0, visitedCount / 6));

  // Weighted overall progress calculation (clamped [0.0, 1.0])
  const weighted =
    visitedRatio * 0.3 +
    secretRatio * 0.25 +
    collectibleRatio * 0.25 +
    (input.letterSent ? 0.06 : 0) +
    (input.journeyExplored ? 0.06 : 0) +
    (input.musicPlayed ? 0.04 : 0) +
    (input.quoteInteracted ? 0.04 : 0);

  const overallProgress = Number(Math.min(1, Math.max(0, weighted)).toFixed(3));

  // Derive internal descriptive stage
  let stage: WorldEvolutionStage = "QUIET";
  if (overallProgress >= 0.8) {
    stage = "ALIVE";
  } else if (overallProgress >= 0.5) {
    stage = "BLOOMING";
  } else if (overallProgress >= 0.2) {
    stage = "AWAKENING";
  }

  // Phase 11 readiness condition
  const completionEligible =
    visitedCount >= 6 &&
    input.journeyExplored &&
    secretRatio >= 0.7 &&
    collectibleRatio >= 0.7;

  // Evaluate each declarative rule
  const effects = {} as Record<WorldEvolutionEffectId, boolean>;
  const ctx = {
    input,
    visitedRatio,
    secretRatio,
    collectibleRatio,
    overallProgress,
  };

  for (const rule of WORLD_EVOLUTION_RULES) {
    effects[rule.id] = rule.evaluate(ctx);
  }

  return {
    visitedCount,
    visitedRatio: Number(visitedRatio.toFixed(3)),
    secretCount: input.discoveredSecretCount,
    secretRatio: Number(secretRatio.toFixed(3)),
    collectibleCount: input.collectedItemCount,
    collectibleRatio: Number(collectibleRatio.toFixed(3)),
    overallProgress,
    stage,
    completionEligible,
    effects,
  };
}

