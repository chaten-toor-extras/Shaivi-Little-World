"use client";

import React from "react";
import { useWorldProgress } from "@/hooks/useWorldProgress";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { ResolvedWorldTheme } from "@/types/world";
import CollectibleEvolution from "./CollectibleEvolution";
import CompanionButterfly from "./CompanionButterfly";
import GalleryEvolution from "./GalleryEvolution";
import MailboxEvolution from "./MailboxEvolution";
import MusicEvolution from "./MusicEvolution";
import QuoteTVEvolution from "./QuoteTVEvolution";
import SecretEvolution from "./SecretEvolution";
import TelescopeEvolution from "./TelescopeEvolution";

interface WorldEvolutionProps {
  theme?: ResolvedWorldTheme;
}

export default function WorldEvolution({ theme }: WorldEvolutionProps) {
  // Feature flag check (safe rollback)
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_WORLD_EVOLUTION_ENABLED === "false"
  ) {
    return null;
  }

  const { effects, isHydrated, isNewlyUnlocked } = useWorldProgress();
  const quality = useExperienceStore((s) => s.quality);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  // Hydration guard: prevent flashing un-evolved then evolved state on page load
  if (!isHydrated) {
    return null;
  }

  return (
    <group name="world-evolution">
      {/* 1. Gallery Evolution (Artist Palette, Brushes & Pinned Sketch) */}
      <GalleryEvolution
        paletteVisible={effects.GALLERY_PALETTE}
        sketchVisible={effects.GALLERY_SKETCH}
        isNewPalette={isNewlyUnlocked("GALLERY_PALETTE")}
        isNewSketch={isNewlyUnlocked("GALLERY_SKETCH")}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 2. Telescope Evolution (Constellation Stars & Eyepiece Shimmer) */}
      <TelescopeEvolution
        starsVisible={effects.TELESCOPE_STARS}
        lensVisible={effects.TELESCOPE_LENS}
        isNew={isNewlyUnlocked("TELESCOPE_STARS")}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 3. Mailbox Evolution (Sealed Letter & Paper Star Charm) */}
      <MailboxEvolution
        letterVisible={effects.MAILBOX_LETTER}
        isNew={isNewlyUnlocked("MAILBOX_LETTER")}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 4. Music Evolution (Brass Clef Token) */}
      <MusicEvolution
        charmVisible={effects.MUSIC_CHARM}
        isNew={isNewlyUnlocked("MUSIC_CHARM")}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 5. Quote TV Evolution (Rolled Parchment Quote Strip) */}
      <QuoteTVEvolution
        noteVisible={effects.QUOTE_NOTE}
        isNew={isNewlyUnlocked("QUOTE_NOTE")}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 6. Secrets Evolution (Luminous Meadow Flowers & Motes) */}
      <SecretEvolution
        meadowFlowerVisible={effects.SECRET_MEADOW_FLOWER}
        firefliesVisible={effects.SECRET_FIREFLIES}
        isNewFlower={isNewlyUnlocked("SECRET_MEADOW_FLOWER")}
        isNewFireflies={isNewlyUnlocked("SECRET_FIREFLIES")}
        quality={quality}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 7. Collectibles Evolution (Garden Violets, Bench Star & Lily Pads) */}
      <CollectibleEvolution
        violetsVisible={effects.COLLECTIBLE_VIOLETS}
        benchStarVisible={effects.COLLECTIBLE_BENCH_STAR}
        pondLiliesVisible={effects.COLLECTIBLE_POND_LILIES}
        harmonyVisible={effects.COLLECTIBLE_HARMONY}
        isNew={isNewlyUnlocked("COLLECTIBLE_VIOLETS")}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 8. Companion Butterfly (Azure, gliding high at >= 65% progress) */}
      {effects.COMPANION_BUTTERFLY && (
        <CompanionButterfly theme={theme} reducedMotion={reducedMotion} />
      )}
    </group>
  );
}

