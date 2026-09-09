import { useEffect, useRef } from "react";
export function useAudio(enabled: boolean) {
  const context = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled) return;
    try {
      const ctx = new AudioContext();
      context.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0.012;
      gain.connect(ctx.destination);
      const oscillators = [174.61, 261.63, 349.23].map((f) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        o.connect(gain);
        o.start();
        return o;
      });
      void ctx.resume().catch(() => {});
      return () => {
        oscillators.forEach((o) => o.stop());
        void ctx.close().catch(() => {});
        context.current = null;
      };
    } catch {
      return;
    }
  }, [enabled]);
}
