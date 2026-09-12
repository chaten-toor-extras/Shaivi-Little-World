import { evaluateSecretConditions, type SecretRuntimeContext } from "./secretEvaluator";
import { secretStorage } from "./secretStorage";
import type {
  DiscoveredSecretRecord,
  PublicSecret,
  SecretEvent,
  SecretRevealPayload,
} from "@/types";

export interface SecretEngineCallbacks {
  onDiscover: (slug: string, secretId?: string) => void;
  onReveal: (
    reveal: SecretRevealPayload,
    meta: { secretId?: string; slug?: string },
  ) => void;
  getRuntimeContext: () => SecretRuntimeContext;
  getDiscovered: () => Record<string, DiscoveredSecretRecord>;
}

export class SecretEngineCore {
  private definitions: PublicSecret[] = [];
  private callbacks: SecretEngineCallbacks;

  // In-memory click / interaction history for windowMs pruning: secretKey -> timestamp[]
  private interactionHistory: Map<string, number[]> = new Map();

  // Cooldown tracking: secretKey -> lastTriggerTimestamp
  private lastTriggered: Map<string, number> = new Map();

  // Session-only tracking: Set of secret slugs
  private sessionTriggered: Set<string> = new Set();

  constructor(callbacks: SecretEngineCallbacks) {
    this.callbacks = callbacks;
  }

  setDefinitions(definitions: PublicSecret[]): void {
    this.definitions = definitions || [];
  }

  getDefinitions(): PublicSecret[] {
    return this.definitions;
  }

  /**
   * Process an incoming semantic event and evaluate matching secrets.
   */
  processEvent(event: SecretEvent): void {
    const now = event.timestamp || Date.now();
    const discovered = this.callbacks.getDiscovered();

    // Find enabled secrets targeting this entity
    const matchingSecrets = this.definitions.filter((sec) => {
      if (!sec.enabled) return false;

      // Check target match
      if (sec.target?.type) {
        if (event.targetType && sec.target.type !== event.targetType) {
          return false;
        }
        if (
          sec.target.id &&
          event.targetId &&
          sec.target.id !== event.targetId
        ) {
          return false;
        }
      }

      return true;
    });

    for (const secret of matchingSecrets) {
      const trigger = secret.trigger;
      if (!trigger) continue;

      const secretKey = secret.slug || secret._id;

      // 1. Evaluate trigger type match
      const isTypeMatch = this.matchesTriggerType(event, trigger);
      if (!isTypeMatch) continue;

      // 2. Evaluate required count & time window
      const countMet = this.evaluateCountAndWindow(
        secretKey,
        trigger.requiredCount || 1,
        trigger.windowMs || 0,
        now,
      );

      if (!countMet) continue;

      // 3. Evaluate environmental & prerequisite conditions
      const runtimeContext = this.callbacks.getRuntimeContext();
      const conditionsPassed = evaluateSecretConditions(
        secret,
        runtimeContext,
        discovered,
      );

      if (!conditionsPassed) continue;

      // 4. Evaluate behavior & repeat policy
      const alreadyDiscovered = secretStorage.isDiscovered(
        secret.slug,
        { version: 1, discovered },
      );

      const isRepeatable = secret.behavior?.repeatable ?? false;
      const cooldownMs = secret.behavior?.cooldownMs ?? 0;
      const oncePerSession = secret.behavior?.oncePerSession ?? false;

      if (!isRepeatable && alreadyDiscovered) {
        // Non-repeatable secret already found; do not trigger full reveal again
        continue;
      }

      if (isRepeatable) {
        // Check cooldown only if previously triggered
        if (cooldownMs > 0 && this.lastTriggered.has(secretKey)) {
          const lastTime = this.lastTriggered.get(secretKey)!;
          if (now - lastTime < cooldownMs) {
            continue;
          }
        }

        // Check once-per-session
        if (oncePerSession && this.sessionTriggered.has(secret.slug)) {
          continue;
        }
      }

      // 5. Valid secret discovery / trigger!
      this.lastTriggered.set(secretKey, now);
      this.sessionTriggered.add(secret.slug);

      // Reset in-memory interaction counter so next trigger requires fresh counts
      this.interactionHistory.delete(secretKey);

      // Save discovery state locally if not already discovered
      if (!alreadyDiscovered) {
        this.callbacks.onDiscover(secret.slug, secret._id);
      }

      // Enqueue reveal
      this.callbacks.onReveal(secret.reveal, {
        secretId: secret._id,
        slug: secret.slug,
      });
    }
  }

  /**
   * Checks whether the event semantics match the secret trigger definition.
   */
  private matchesTriggerType(
    event: SecretEvent,
    trigger: PublicSecret["trigger"],
  ): boolean {
    const evType = event.type;
    const trType = trigger.type;

    if (trType === "CLICK" || trType === "MULTI_CLICK") {
      return evType === "CLICK" || evType === "MULTI_CLICK";
    }

    if (trType === "TOGGLE") {
      return evType === "TOGGLE";
    }

    if (trType === "RIPPLE") {
      return evType === "RIPPLE";
    }

    if (trType === "SHAKE") {
      return evType === "SHAKE";
    }

    if (trType === "LETTER_SENT") {
      return evType === "LETTER_SENT";
    }

    if (trType === "JOURNEY_VIEWED") {
      return evType === "JOURNEY_VIEWED";
    }

    if (trType === "MOOD_SELECTED") {
      return evType === "MOOD_SELECTED";
    }

    if (trType === "TIME_ENTERED") {
      return evType === "TIME_ENTERED";
    }

    if (trType === "VISIT_SECTION") {
      if (evType !== "VISIT_SECTION") return false;
      if (trigger.eventName && event.metadata?.section) {
        return (
          String(trigger.eventName).toUpperCase() ===
          String(event.metadata.section).toUpperCase()
        );
      }
      return true;
    }

    if (trType === "CUSTOM_EVENT") {
      if (evType !== "CUSTOM_EVENT") return false;
      if (trigger.eventName && event.metadata?.eventName) {
        return trigger.eventName === event.metadata.eventName;
      }
      return true;
    }

    return evType === trType;
  }

  /**
   * Tracks and evaluates counter thresholds within windowMs.
   */
  private evaluateCountAndWindow(
    secretKey: string,
    requiredCount: number,
    windowMs: number,
    now: number,
  ): boolean {
    if (requiredCount <= 1) {
      return true;
    }

    const history = this.interactionHistory.get(secretKey) || [];

    // Prune timestamps older than windowMs if windowMs is specified
    const validTimestamps =
      windowMs > 0
        ? history.filter((t) => now - t <= windowMs)
        : [...history];

    validTimestamps.push(now);
    this.interactionHistory.set(secretKey, validTimestamps);

    return validTimestamps.length >= requiredCount;
  }

  /**
   * Resets in-memory interaction history and session triggers.
   */
  resetRuntimeState(): void {
    this.interactionHistory.clear();
    this.lastTriggered.clear();
    this.sessionTriggered.clear();
  }
}
