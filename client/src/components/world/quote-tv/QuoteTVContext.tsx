"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useContent } from "@/providers/ContentProvider";
import { useQuotePlayer } from "./useQuotePlayer";
import { quotePages } from "./quoteTVConfig";

export type TVPower = "OFF" | "POWERING_ON" | "ON" | "POWERING_OFF";
function useController(enabled: boolean) {
  const player = useQuotePlayer();
  const { mode, transitioning, reducedMotion } = useExperienceStore();
  const { isLoading } = useContent();
  const focused = enabled && mode === "QUOTES";
  const interactive = focused && !transitioning;
  const [power, setPower] = useState<TVPower>("OFF");
  const [arrived, setArrived] = useState(false);
  const setOn = player.setOn;
  useEffect(() => {
    setArrived(false);
    if (!interactive) return;
    setOn(true);
    const timer = setTimeout(() => setArrived(true), 300);
    return () => clearTimeout(timer);
  }, [interactive, setOn]);
  useEffect(() => {
    if (!interactive) { setPower("OFF"); return; }
    const on = arrived && player.on;
    setPower(on ? "POWERING_ON" : "POWERING_OFF");
    const timer = setTimeout(() => setPower(on ? "ON" : "OFF"), reducedMotion ? 90 : 420);
    return () => clearTimeout(timer);
  }, [interactive, arrived, player.on, reducedMotion]);
  const pages = quotePages(player.quote?.text || "");
  const page = player.page % pages.length;
  return { ...player, enabled, focused, interactive, power, reducedMotion, isLoading,
    pages, page, pageText: pages[page], canTune: interactive && player.on && player.total > 1 && !isLoading };
}
type Controller = ReturnType<typeof useController>;
const Context = createContext<Controller | null>(null);
export function QuoteTVProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const controller = useController(enabled);
  return <Context.Provider value={controller}>{children}</Context.Provider>;
}
export const useQuoteTV = () => useContext(Context);
