import { useRef } from "react";

interface PointerRecord {
  x: number;
  y: number;
  time: number;
  isMultiTouch: boolean;
}

/**
 * Shared helper to prevent drag, orbit, and pinch gestures from triggering object clicks.
 * - Suppresses clicks if pointer moved beyond threshold (6px mouse, 10px touch)
 * - Suppresses clicks if multi-touch was active (e.g. 2-finger pinch/drag)
 * - Suppresses clicks if pointer was held down longer than 800ms (drag hold)
 */
export function useIntentionalClick() {
  const recordRef = useRef<PointerRecord | null>(null);

  const handlePointerDown = (e: React.PointerEvent<any> | any) => {
    const isTouch = e.pointerType === "touch" || (e.nativeEvent && "touches" in e.nativeEvent);
    const touchCount = e.nativeEvent?.touches?.length || 1;
    const clientX = e.clientX ?? e.nativeEvent?.clientX ?? 0;
    const clientY = e.clientY ?? e.nativeEvent?.clientY ?? 0;

    recordRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
      isMultiTouch: touchCount > 1,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<any> | any) => {
    if (e.nativeEvent?.touches && e.nativeEvent.touches.length > 1 && recordRef.current) {
      recordRef.current.isMultiTouch = true;
    }
  };

  const handleTouchMove = handlePointerMove;

  const isIntentionalClick = (e: React.MouseEvent<any> | React.PointerEvent<any> | any): boolean => {
    if (!recordRef.current) return true;

    // Multi-touch gestures (pinch/dolly) must NEVER trigger an object click
    if (recordRef.current.isMultiTouch) {
      recordRef.current = null;
      return false;
    }

    const clientX = e.clientX ?? e.nativeEvent?.clientX ?? 0;
    const clientY = e.clientY ?? e.nativeEvent?.clientY ?? 0;
    const isTouch = e.pointerType === "touch" || (e.nativeEvent && "touches" in e.nativeEvent);

    const dx = clientX - recordRef.current.x;
    const dy = clientY - recordRef.current.y;
    const dist = Math.hypot(dx, dy);
    const duration = Date.now() - recordRef.current.time;

    recordRef.current = null;

    // Starting thresholds: 6px mouse, 10px touch
    const threshold = isTouch ? 10 : 6;
    if (dist > threshold) return false;
    if (duration > 850) return false;

    return true;
  };

  return { handlePointerDown, handlePointerMove, handleTouchMove, isIntentionalClick };
}
