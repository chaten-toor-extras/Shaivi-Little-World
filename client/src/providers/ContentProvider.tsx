"use client";

import { contentService } from "@/services/content.service";
import type {
  ArtistContent,
  Artwork,
  ContactSettings,
  JourneyMilestone,
  Mood,
  PublicCollectible,
  PublicContentResponse,
  PublicSecret,
  Quote,
  SiteSettings,
  Song,
  WorldSettings,
} from "@/types";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import {
  DEFAULT_WORLD_SETTINGS,
  normalizeWorldSettings,
} from "@/utils/worldDefaults";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, type ReactNode } from "react";

// Import existing static data as emergency fallbacks
import { artist as staticArtist } from "@/data/artist";
import { artworks as staticArtworks } from "@/data/artworks";
import { contact as staticContact } from "@/data/contact";
import { labels, portfolio } from "@/data/portfolio";
import { quotes as staticQuotes } from "@/data/quotes";
import { moods as staticMoods, songs as staticSongs } from "@/data/songs";
import { milestones as staticMilestones } from "@/data/timeline";

// ── Default Fallback State ─────────────────────────────────
const fallbackData: PublicContentResponse = {
  site: {
    title: "Shaivi's Little World",
    description:
      "A small world for big ideas. Explore a playful, handcrafted creative portfolio.",
    wordmark: "s✳",
    introHeading: "Shaivi's little world.",
    introSubtext: "Welcome to Shaivi's little world.",
    introDescription:
      "A place for ideas, daydreams, and everything in between.",
    exploreLabel: "Explore",
    sectionLabels: labels,
    footerWorldText: "Follow your curiosity.",
    footerExploreText: "A little closer.",
    footerWorldInstruction: "Tap an object to explore · drag to look around",
    footerExploreInstruction: "Take your time. There's more to discover.",
    discoveryLabel: "little discoveries",
    secretMessages: portfolio.secret,
    socialLinks: portfolio.contact.socials,
    accentColor: "#987b68",
    isPublished: true,
  },
  artist: {
    name: staticArtist.name,
    label: staticArtist.label,
    caption: staticArtist.caption,
    bio: staticArtist.bio,
    portrait: staticArtist.image,
    annotationText: "always noticing\nthe little things ↗",
    tags: staticArtist.tags,
    details: staticArtist.details,
    note: staticArtist.note,
    sectionHeading: "MEET THE ARTIST",
    sectionKicker: "MEET THE ARTIST / PROFILE",
    isPublished: true,
  },
  quotes: staticQuotes.map((q) => ({
    _id: q.id,
    text: q.text,
    category: q.category,
    order: 0,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  artworks: staticArtworks.map((a, i) => ({
    _id: a.id,
    title: a.title,
    year: a.year,
    caption: a.caption,
    image: a.image,
    order: i,
    isPublished: true,
    initialPosition: a.initialPosition,
    rotation: a.initialRotation,
    scale: a.initialScale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  journey: staticMilestones.map((m, i) => ({
    _id: `m-${i}`,
    title: m.title,
    year: m.year,
    text: m.text,
    image: m.image,
    order: i,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  music: {
    songs: staticSongs.map((s, i) => ({
      _id: s.id,
      title: s.title,
      artist: s.artist,
      cover: s.cover,
      audio: s.audioSrc ? { url: s.audioSrc } : undefined,
      duration: s.duration,
      order: i,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    moods: staticMoods.map((m, i) => ({
      _id: `mood-${i}`,
      name: m.name,
      paperColor: m.color,
      inkColor: m.ink,
      songIds: m.order.map((idx) => staticSongs[idx]?.id || `track-${idx + 1}`),
      order: i,
      isPublished: true,
    })),
  },
  contact: {
    heading: staticContact.heading,
    intro: staticContact.intro,
    handwrittenNote: "some things are better\nwritten down.",
    fieldLabels: {
      name: "Your name",
      email: "Your email",
      message: "Your little note",
    },
    buttonText: staticContact.button,
    successMessage: staticContact.success,
    disclaimer: staticContact.disclaimer,
    signoff: "With a little curiosity,",
    email: staticContact.email,
    isPublished: true,
  },
  world: DEFAULT_WORLD_SETTINGS,
  secrets: [
    {
      _id: "sec-butterfly",
      id: "sec-butterfly",
      name: "Butterfly Whisper",
      slug: "butterfly-whisper",
      enabled: true,
      isPublished: true,
      order: 0,
      target: { type: "BUTTERFLY", id: "golden-butterfly" },
      trigger: { type: "MULTI_CLICK", requiredCount: 3, windowMs: 12000 },
      conditions: {},
      reveal: {
        type: "MESSAGE",
        title: "✦ Enchanted Discovery ✦",
        message:
          "You caught the golden butterfly! A fleeting whisper from Shaivi’s field guide.",
        visualEffect: "SPARKLE",
        position: "center",
        duration: "NORMAL",
      },
      behavior: { repeatable: true, cooldownMs: 15000 },
    },
    {
      _id: "sec-flying-paper",
      id: "sec-flying-paper",
      name: "Enchanted Flying Manuscript",
      slug: "flying-paper",
      enabled: true,
      isPublished: true,
      order: 1,
      target: { type: "FLYING_PAGE", id: "flying-paper" },
      trigger: { type: "MULTI_CLICK", requiredCount: 3, windowMs: 12000 },
      conditions: {},
      reveal: {
        type: "MESSAGE",
        title: "✦ The Wandering Manuscript ✦",
        message:
          'You caught the enchanted flying page! It carries a gentle message written in gold ink: "Some stories refuse to stay bound in books—they take flight across the open sky."',
        visualEffect: "PETALS",
        position: "center",
        duration: "NORMAL",
      },
      behavior: { repeatable: true, cooldownMs: 15000 },
    },
  ],
  collectibles: [
    {
      _id: "col-little-star",
      id: "col-little-star",
      name: "Little Star",
      slug: "little-star",
      description: "A tiny celestial fragment that fell from the night sky, still holding a gentle glimmer.",
      hint: "Where the water softly catches the sky.",
      category: "STAR",
      rarity: "COMMON",
      source: "WORLD",
      enabled: true,
      isPublished: true,
      order: 0,
      model: {
        modelKey: "tiny_star",
        scalePreset: "NORMAL",
        rotationPreset: "DEFAULT",
      },
      appearance: {
        glowColor: "#ffe8b2",
        accentColor: "#f7d070",
        idleAnimation: "FLOAT",
        revealEffect: "TINY_STARS",
      },
      placement: {
        anchor: "POND_EDGE",
        offset: { x: 0.15, y: 0.05, z: 0.2 },
      },
      behavior: {
        hideAfterCollected: true,
      },
    },
    {
      _id: "col-golden-wing",
      id: "col-golden-wing",
      name: "Golden Wing",
      slug: "golden-wing",
      description: "An ethereal gossamer butterfly wing inscribed with golden starlight.",
      hint: "Awarded to those who greet the winged visitor more than once.",
      category: "MAGIC",
      rarity: "RARE",
      source: "SECRET",
      enabled: true,
      isPublished: true,
      order: 1,
      model: {
        modelKey: "golden_wing",
        scalePreset: "FEATURED",
        rotationPreset: "UPRIGHT",
      },
      appearance: {
        glowColor: "#ffe082",
        accentColor: "#ffb300",
        idleAnimation: "SLOW_SPIN",
        revealEffect: "GLOW",
      },
      placement: {
        anchor: "FLOWER_FIELD",
        offset: { x: 0, y: 0, z: 0 },
      },
      behavior: {
        hideAfterCollected: true,
      },
    },
  ],
};

interface ContentContextValue {
  content: PublicContentResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const ContentContext = createContext<ContentContextValue>({
  content: fallbackData,
  isLoading: false,
  isError: false,
  error: null,
  refetch: () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["publicContent"],
    queryFn: contentService.getPublicContent,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });

  const content = data || fallbackData;

  useEffect(() => {
    if (content.collectibles && content.collectibles.length > 0) {
      useCollectibleStore.getState().setDefinitions(content.collectibles);
    }
  }, [content.collectibles]);

  return (
    <ContentContext.Provider
      value={{
        content,
        isLoading,
        isError,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

// ── Consumer Hooks ─────────────────────────────────────────

export function useContent(): ContentContextValue {
  return useContext(ContentContext);
}

export function useSiteSettings(): SiteSettings {
  return useContext(ContentContext).content.site;
}

export function useArtist(): ArtistContent {
  return useContext(ContentContext).content.artist;
}

export function useQuotes(): Quote[] {
  return useContext(ContentContext).content.quotes;
}

export function useArtworks(): Artwork[] {
  return useContext(ContentContext).content.artworks;
}

export function useJourney(): JourneyMilestone[] {
  return useContext(ContentContext).content.journey;
}

export const MusicOverrideContext = createContext<{
  songs?: Song[];
  moods?: Mood[];
} | null>(null);

export function useMusic(): { songs: Song[]; moods: Mood[] } {
  const override = useContext(MusicOverrideContext);
  const ctx = useContext(ContentContext);
  return {
    songs: override?.songs || ctx.content.music?.songs || [],
    moods: override?.moods || ctx.content.music?.moods || [],
  };
}

export function useContactSettings(): ContactSettings {
  return useContext(ContentContext).content.contact;
}

export const WorldSettingsOverrideContext = createContext<WorldSettings | null>(
  null,
);

export function useWorldSettings(): WorldSettings {
  const override = useContext(WorldSettingsOverrideContext);
  const ctx = useContext(ContentContext);
  if (override) return override;
  return normalizeWorldSettings(ctx.content.world);
}

export function useSecrets(): PublicSecret[] {
  const ctx = useContext(ContentContext);
  return ctx.content.secrets || [];
}

export function useCollectibles(): PublicCollectible[] {
  const ctx = useContext(ContentContext);
  return ctx.content.collectibles || [];
}
