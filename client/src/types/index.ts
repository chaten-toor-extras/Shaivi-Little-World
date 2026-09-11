export * from "./world";
import type { WorldSettings } from "./world";

// ─── Media ─────────────────────────────────────────────────
export interface MediaAsset {
  url: string;
  secureUrl?: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  originalFilename?: string;
}

/** Backward-compatible image shape matching the old images.json entries */
export interface PhotoData {
  src: string;
  alt: string;
  source?: string;
  credit?: string;
}

// ─── Site Settings ─────────────────────────────────────────
export interface SiteSettings {
  title: string;
  description: string;
  wordmark: string;
  introHeading: string;
  introSubtext: string;
  introDescription: string;
  exploreLabel: string;
  sectionLabels: Record<string, string>;
  footerWorldText: string;
  footerExploreText: string;
  footerWorldInstruction: string;
  footerExploreInstruction: string;
  discoveryLabel: string;
  secretMessages: string[];
  socialLinks: { label: string; url: string }[];
  accentColor: string;
  isPublished?: boolean;
}

// ─── Artist ────────────────────────────────────────────────
export interface ArtistContent {
  name: string;
  label: string;
  caption: string;
  bio: string;
  portrait: PhotoData;
  smallImage?: PhotoData;
  annotationText: string;
  tags: string[];
  details: { label: string; value: string }[];
  note: string;
  sectionHeading: string;
  sectionKicker: string;
  isPublished?: boolean;
}

// ─── Quote ─────────────────────────────────────────────────
export interface Quote {
  _id: string;
  text: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Artwork ───────────────────────────────────────────────
export interface Artwork {
  _id: string;
  title: string;
  year: number;
  caption: string;
  altText?: string;
  source?: string;
  credit?: string;
  image: PhotoData;
  order: number;
  isPublished: boolean;
  initialPosition: { x: number; y: number };
  rotation: number;
  scale: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Journey ───────────────────────────────────────────────
export interface TelescopeMetadata {
  enabled?: boolean;
  x?: number;
  y?: number;
  depth?: number;
  size?: "small" | "normal" | "featured";
  glowColor?: string;
  constellationOrder?: number;
}

export interface JourneyMilestone {
  _id: string;
  title: string;
  year: string;
  text: string;
  image: PhotoData;
  altText?: string;
  order: number;
  isPublished: boolean;
  desktopPosition?: { x: number; y: number };
  telescope?: TelescopeMetadata;
  createdAt: string;
  updatedAt: string;
}

// ─── Song ──────────────────────────────────────────────────
export interface Song {
  _id: string;
  title: string;
  artist: string;
  cover: PhotoData;
  audio?: { url: string };
  duration: number;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Mood ──────────────────────────────────────────────────
export interface Mood {
  _id: string;
  name: string;
  slug?: string;
  paperColor: string;
  inkColor: string;
  songIds: string[];
  order: number;
  isPublished: boolean;
  worldEffect?: import("./world").MoodWorldEffect;
}

// ─── Contact ───────────────────────────────────────────────
export interface ContactSettings {
  heading: string;
  intro: string;
  handwrittenNote: string;
  fieldLabels: { name: string; email: string; message: string };
  buttonText: string;
  successMessage: string;
  disclaimer: string;
  signoff: string;
  email: string;
  isPublished?: boolean;
}

// ─── Letter ────────────────────────────────────────────────
export type LetterStatus = "unread" | "read" | "archived";

export interface Letter {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: LetterStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Public Content Response ───────────────────────────────
export interface PublicContentResponse {
  site: SiteSettings;
  artist: ArtistContent;
  quotes: Quote[];
  artworks: Artwork[];
  journey: JourneyMilestone[];
  music: {
    songs: Song[];
    moods: Mood[];
  };
  contact: ContactSettings;
  world?: WorldSettings;
}

// ─── Admin ─────────────────────────────────────────────────
export interface Admin {
  id: string;
  email: string;
  role: string;
}

// ─── API ───────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Dashboard ─────────────────────────────────────────────
export interface DashboardStats {
  artworks: number;
  quotes: number;
  songs: number;
  moods: number;
  milestones: number;
  unreadLetters: number;
  totalLetters: number;
}
