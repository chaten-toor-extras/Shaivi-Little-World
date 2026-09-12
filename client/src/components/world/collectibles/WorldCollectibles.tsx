"use client";

import { useCollectibles } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useMusicStore } from "@/store/useMusicStore";
import React, { useMemo } from "react";
import CollectibleObject from "./CollectibleObject";

export default function WorldCollectibles() {
  const collectibles = useCollectibles();
  const currentTimeOfDay = useExperienceStore((s) => s.currentTimeOfDay);
  const activeMoodId = useMusicStore((s) => s.activeMoodId);

  // Filter visible world-placed collectibles
  const visibleCollectibles = useMemo(() => {
    return collectibles.filter((col) => {
      // Must be published, enabled, and intended for world placement
      if (!col.enabled || !col.isPublished || col.source !== "WORLD") {
        return false;
      }

      // Check time-of-day condition if specified
      if (
        col.placement?.visibleInPeriods &&
        col.placement.visibleInPeriods.length > 0
      ) {
        const period = currentTimeOfDay || "DAY";
        if (!col.placement.visibleInPeriods.includes(period)) {
          return false;
        }
      }

      // Check mood condition if specified
      if (col.placement?.requiredMood) {
        if (col.placement.requiredMood !== activeMoodId) {
          return false;
        }
      }

      return true;
    });
  }, [collectibles, currentTimeOfDay, activeMoodId]);

  return (
    <group name="world-collectibles">
      {visibleCollectibles.map((col) => (
        <CollectibleObject key={col._id || col.slug} collectible={col} />
      ))}
    </group>
  );
}

