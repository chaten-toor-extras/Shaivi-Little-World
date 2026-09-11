"use client";

import { useWorldSettings } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { TimeOfDay } from "@/types/world";
import { getEffectiveMinutes, getTimeOfDay } from "@/utils/timeOfDay";
import { useCallback, useEffect, useState } from "react";

export function useTimeOfDay() {
  const worldSettings = useWorldSettings();
  const dayNight = worldSettings?.dayNight;

  const timeOfDayOverride = useExperienceStore((s) => s.timeOfDayOverride);
  const setTimeOfDayOverride = useExperienceStore(
    (s) => s.setTimeOfDayOverride,
  );
  const setCurrentTimeOfDay = useExperienceStore((s) => s.setCurrentTimeOfDay);

  const [mounted, setMounted] = useState(false);

  // Hydrate visitor override from localStorage only after client-side mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("shaivi-time-mode");
      if (
        saved === "AUTO" ||
        saved === "MORNING" ||
        saved === "DAY" ||
        saved === "SUNSET" ||
        saved === "NIGHT"
      ) {
        setTimeOfDayOverride(saved);
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, [setTimeOfDayOverride]);

  const calculateAutoPeriod = useCallback((): TimeOfDay => {
    if (!dayNight || dayNight.enabled === false) return "DAY";
    const minutes = getEffectiveMinutes(
      dayNight.timeSource || "visitor-local",
      dayNight.fixedTimezone || "Asia/Kolkata",
    );
    return getTimeOfDay(minutes, dayNight.schedule);
  }, [dayNight]);

  // Default to DAY initially so SSR and initial client hydration match deterministically
  const [autoPeriod, setAutoPeriod] = useState<TimeOfDay>("DAY");

  // Periodic clock check & visibility change listener
  useEffect(() => {
    if (!dayNight || dayNight.enabled === false || dayNight.mode === "fixed") {
      return;
    }

    const check = () => {
      const next = calculateAutoPeriod();
      setAutoPeriod((prev) => (prev !== next ? next : prev));
    };

    // Initial check on mount
    check();

    // 30-second interval check (negligible CPU, accurate period detection)
    const interval = setInterval(check, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        check();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [dayNight, calculateAutoPeriod]);

  // Determine effective period according to priority:
  // 1. Visitor manual override (if permitted by CMS)
  // 2. Fixed CMS mode
  // 3. Automatic time-based schedule
  const allowOverride = dayNight?.allowVisitorOverride ?? true;
  let effectivePeriod: TimeOfDay = "DAY";
  let isAuto = false;

  if (dayNight && dayNight.enabled === false) {
    effectivePeriod = "DAY";
    isAuto = false;
  } else if (allowOverride && timeOfDayOverride !== "AUTO") {
    effectivePeriod = timeOfDayOverride;
    isAuto = false;
  } else if (dayNight?.mode === "fixed") {
    effectivePeriod = dayNight.fixedPeriod || "DAY";
    isAuto = false;
  } else {
    effectivePeriod = autoPeriod;
    isAuto = true;
  }

  // Sync to store for other components to access without rerender loops
  useEffect(() => {
    setCurrentTimeOfDay(effectivePeriod);
  }, [effectivePeriod, setCurrentTimeOfDay]);

  return {
    effectivePeriod,
    timeOfDayOverride,
    setTimeOfDayOverride,
    isAuto,
    mounted,
    allowVisitorOverride: allowOverride,
    transition: dayNight?.transition ?? { enabled: true, durationSeconds: 6 },
    dayNight,
  };
}
