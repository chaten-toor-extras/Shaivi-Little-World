/**
 * Canonical Safe-Trigger Resolver for Phase 11 Completion Cinematic
 *
 * Evaluates existing application state across all stores to determine
 * whether the completion cinematic can safely start.
 *
 * Centralized, pure, and 100% unit-testable.
 */

export interface CompletionTriggerContext {
  completionEligible: boolean;
  hasPlayed: boolean;
  isReplay: boolean;
  mode: string;
  transitioning: boolean;
  secretOpen: boolean;
  bookOpen: boolean;
  activeCelebration: boolean;
  activeReveal: boolean;
  menuOpen: boolean;
  isHydrated: boolean;
  sceneReady: boolean;
  featureFlagEnabled: boolean;
  cmsEnabled: boolean;
  cmsAutoPlayEnabled: boolean;
}

export function canStartCompletionCinematic(
  ctx: CompletionTriggerContext
): boolean {
  // 1. Feature flags & CMS configuration
  if (!ctx.featureFlagEnabled || !ctx.cmsEnabled) {
    return false;
  }

  // 2. Hydration & Scene readiness (prevents premature jump on page load)
  if (!ctx.isHydrated || !ctx.sceneReady) {
    return false;
  }

  // 3. Playback eligibility
  if (!ctx.isReplay) {
    // First auto-play: requires Phase 10 completionEligible, has NOT played yet, and auto-play enabled
    if (!ctx.completionEligible || ctx.hasPlayed || !ctx.cmsAutoPlayEnabled) {
      return false;
    }
  } else {
    // Replay: visitor must have previously earned completion (hasPlayed === true) or be currently eligible
    if (!ctx.hasPlayed && !ctx.completionEligible) {
      return false;
    }
  }

  // 4. Safe idle world state
  // Must be in canonical WORLD exploration mode (not in INTRO or active section)
  if (ctx.mode !== "WORLD") return false;

  // No active camera transitions
  if (ctx.transitioning) return false;

  // No active modal dialogs or menus
  if (ctx.secretOpen) return false;
  if (ctx.bookOpen) return false;
  if (ctx.menuOpen) return false;

  // No active celebration layers (collectible or secret reveal)
  if (ctx.activeCelebration) return false;
  if (ctx.activeReveal) return false;

  return true;
}

