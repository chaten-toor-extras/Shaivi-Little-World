"use client";

import { useQuotes } from "@/providers/ContentProvider";
import { useMemo } from "react";
import { create } from "zustand";
import type { Quote } from "@/types";

// Shared runtime memory survives focus exits and switching to Simple Mode.
export const useQuotePlayerMemory = create<{
  index: number; on: boolean; page: number;
  tune: (delta: number, total: number) => void;
  toggle: () => void; setOn: (on: boolean) => void;
  turnPage: (total: number) => void;
}>((set) => ({
  index: 0, on: true, page: 0,
  tune: (delta, total) => set((s) => total > 1
    ? { index: ((s.index + delta) % total + total) % total, page: 0 } : {}),
  toggle: () => set((s) => ({ on: !s.on })),
  setOn: (on) => set({ on }),
  turnPage: (total) => set((s) => ({ page: (s.page + 1) % Math.max(1, total) })),
}));

export function publishedQuotes(source: Quote[]) {
  return source.filter((q) => q.isPublished !== false).slice().sort((a, b) => a.order - b.order);
}

export function useQuotePlayer() {
  const source = useQuotes();
  const quotes = useMemo(() => publishedQuotes(source), [source]);
  const memory = useQuotePlayerMemory();
  const total = quotes.length;
  const index = total ? memory.index % total : 0;
  const quote = quotes[index] as (typeof quotes[number] & { author?: string }) | undefined;
  return { ...memory, quotes, total, index, quote,
    previous: () => memory.tune(-1, total), next: () => memory.tune(1, total) };
}
