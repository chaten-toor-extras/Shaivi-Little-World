import type { SecretEvent, SecretTargetType, SecretTriggerType } from "@/types";

type SecretEventListener = (event: SecretEvent) => void;

class SecretEventBus {
  private listeners: Set<SecretEventListener> = new Set();

  /**
   * Subscribe to incoming secret interaction events.
   * Returns an unsubscribe function.
   */
  subscribe(listener: SecretEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Safe, fire-and-forget semantic event emission.
   * Never throws and never interrupts base application interactions.
   */
  emit(event: {
    type: SecretTriggerType;
    targetType?: SecretTargetType;
    targetId?: string;
    timestamp?: number;
    metadata?: Record<string, string | number | boolean>;
  }): void {
    try {
      // Check feature flag if present
      if (
        typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_SECRETS_ENABLED === "false"
      ) {
        return;
      }

      const fullEvent: SecretEvent = {
        ...event,
        timestamp: event.timestamp || Date.now(),
      };

      for (const listener of this.listeners) {
        try {
          listener(fullEvent);
        } catch (err) {
          console.warn("Secret event listener error:", err);
        }
      }
    } catch (busError) {
      console.warn("SecretEventBus emit error:", busError);
    }
  }
}

export const secretEventBus = new SecretEventBus();

/**
 * Convenient fire-and-forget helper for world & UI components.
 */
export function safeEmitSecretEvent(event: {
  type: SecretTriggerType;
  targetType?: SecretTargetType;
  targetId?: string;
  timestamp?: number;
  metadata?: Record<string, string | number | boolean>;
}): void {
  secretEventBus.emit(event);
}
