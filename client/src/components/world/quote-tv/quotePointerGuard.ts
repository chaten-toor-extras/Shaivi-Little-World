/** Supplements the shared click guard with canvas-wide pointer tracking.
 * PointerEvent has no touches array, and a drag can leave and re-enter a mesh.
 */
export function createQuotePointerGuard() {
  const pointers = new Set<number>();
  let start = { x: 0, y: 0, time: 0 };
  let blocked = true;
  return {
    down(id: number, x: number, y: number, time: number) {
      if (!pointers.size) { start = { x, y, time }; blocked = false; }
      pointers.add(id);
      if (pointers.size > 1) blocked = true;
    },
    move(id: number, x: number, y: number) {
      if (pointers.has(id) && Math.hypot(x - start.x, y - start.y) > 6) blocked = true;
    },
    up(id: number) { pointers.delete(id); },
    cancel() { blocked = true; pointers.clear(); },
    allows(time: number) { return !blocked && pointers.size <= 1 && time - start.time < 850; },
  };
}

export const quotePointerGuard = createQuotePointerGuard();
export function bindQuotePointerGuard(canvas: HTMLCanvasElement) {
  const down = (e: PointerEvent) => quotePointerGuard.down(e.pointerId, e.clientX, e.clientY, performance.now());
  const move = (e: PointerEvent) => quotePointerGuard.move(e.pointerId, e.clientX, e.clientY);
  const up = (e: PointerEvent) => { move(e); quotePointerGuard.up(e.pointerId); };
  const cancel = () => quotePointerGuard.cancel();
  canvas.addEventListener("pointerdown", down, true);
  window.addEventListener("pointermove", move, true);
  window.addEventListener("pointerup", up, true);
  window.addEventListener("pointercancel", cancel, true);
  window.addEventListener("blur", cancel);
  return () => {
    canvas.removeEventListener("pointerdown", down, true);
    window.removeEventListener("pointermove", move, true);
    window.removeEventListener("pointerup", up, true);
    window.removeEventListener("pointercancel", cancel, true);
    window.removeEventListener("blur", cancel);
    cancel();
  };
}
