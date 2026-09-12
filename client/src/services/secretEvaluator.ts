import type { DiscoveredSecretRecord, PublicSecret, Secret } from "@/types";

export interface SecretRuntimeContext {
  timeOfDay?: string;
  activeMoodId?: string | null;
  visitedSections?: string[];
  letterSent?: boolean;
  journeyViewed?: boolean;
}

/**
 * Pure evaluator for secret conditions.
 * Default semantics: ALL specified conditions must evaluate to true (AND logic).
 */
export function evaluateSecretConditions(
  secret: PublicSecret | Secret,
  runtimeContext: SecretRuntimeContext,
  discoveredMap: Record<string, DiscoveredSecretRecord> = {},
): boolean {
  if (!secret || !secret.conditions) {
    return true;
  }

  const cond = secret.conditions;

  // 1. Time of Day Condition
  if (cond.timeOfDay && cond.timeOfDay.length > 0) {
    if (!runtimeContext.timeOfDay) {
      return false;
    }
    const match = cond.timeOfDay.some(
      (t) => t.toUpperCase() === runtimeContext.timeOfDay?.toUpperCase(),
    );
    if (!match) return false;
  }

  // 2. Music Mood Condition
  if (cond.moods && cond.moods.length > 0) {
    if (!runtimeContext.activeMoodId) {
      return false;
    }
    const currentMoodStr = String(runtimeContext.activeMoodId);
    const match = cond.moods.some((m) => String(m) === currentMoodStr);
    if (!match) return false;
  }

  // 3. Visited Sections Condition (all specified must have been visited)
  if (cond.sectionsVisited && cond.sectionsVisited.length > 0) {
    const visited = runtimeContext.visitedSections || [];
    const allVisited = cond.sectionsVisited.every((sec) =>
      visited.includes(sec),
    );
    if (!allVisited) return false;
  }

  // 4. Letter Sent Condition
  if (cond.letterSent === true) {
    if (runtimeContext.letterSent !== true) {
      return false;
    }
  }

  // 5. Journey Viewed Condition
  if (cond.journeyViewed === true) {
    if (runtimeContext.journeyViewed !== true) {
      return false;
    }
  }

  // 6. Prerequisite Secrets Condition (all required must be discovered)
  if (cond.requiresSecretIds && cond.requiresSecretIds.length > 0) {
    const discoveredList = Object.values(discoveredMap);
    const allPrereqsMet = cond.requiresSecretIds.every((reqId) => {
      const reqIdStr = String(reqId);
      // Check either direct slug key or record secretId/slug match
      if (discoveredMap[reqIdStr]) return true;
      return discoveredList.some(
        (rec) => rec.secretId === reqIdStr || rec.slug === reqIdStr,
      );
    });
    if (!allPrereqsMet) return false;
  }

  return true;
}
