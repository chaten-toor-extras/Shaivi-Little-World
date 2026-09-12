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
  secrets?: PublicSecret[];
  collectibles?: PublicCollectible[];
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

// ─── Secrets (Phase 8) ─────────────────────────────────────
export type SecretTargetType =
  | 'BUTTERFLY'
  | 'FLYING_PAGE'
  | 'FLYING_PAPER'
  | 'LAMP'
  | 'POND'
  | 'TREE'
  | 'BOOKS'
  | 'HOUSE_WINDOW'
  | 'TELESCOPE'
  | 'MAILBOX'
  | 'CLOCK'
  | 'FLOWERS'
  | 'BENCH'
  | 'WORLD'
  | 'SECTION';

export type SecretTriggerType =
  | 'CLICK'
  | 'MULTI_CLICK'
  | 'HOVER'
  | 'TOGGLE'
  | 'RIPPLE'
  | 'SHAKE'
  | 'VISIT_SECTION'
  | 'LETTER_SENT'
  | 'JOURNEY_VIEWED'
  | 'MOOD_SELECTED'
  | 'TIME_ENTERED'
  | 'CUSTOM_EVENT';

export type SecretRevealType =
  | 'MESSAGE'
  | 'IMAGE'
  | 'QUOTE'
  | 'SOUND'
  | 'VISUAL_EFFECT'
  | 'COLLECTIBLE'
  | 'COLLECTIBLE_PLACEHOLDER'
  | 'CUSTOM';

export type SecretVisualEffect =
  | 'NONE'
  | 'SPARKLE'
  | 'GLOW'
  | 'TINY_STARS'
  | 'PETALS'
  | 'SOFT_PULSE';

export type SecretPosition = 'center' | 'bottom-center' | 'near-target';
export type SecretDuration = 'SHORT' | 'NORMAL' | 'LONG' | 'UNTIL_CLOSED';

export interface SecretTarget {
  type: SecretTargetType;
  id?: string;
}

export interface SecretTrigger {
  type: SecretTriggerType;
  requiredCount: number;
  windowMs?: number;
  eventName?: string;
}

export interface SecretConditions {
  timeOfDay?: ('MORNING' | 'DAY' | 'SUNSET' | 'NIGHT')[];
  moods?: string[];
  sectionsVisited?: ('ABOUT' | 'QUOTES' | 'GALLERY' | 'JOURNEY' | 'CONTACT' | 'MUSIC')[];
  letterSent?: boolean;
  journeyViewed?: boolean;
  requiresSecretIds?: string[];
}

export interface SecretRevealPayload {
  type: SecretRevealType;
  title?: string;
  message?: string;
  position?: SecretPosition;
  duration?: SecretDuration;
  image?: { url: string; alt?: string; src?: string };
  quoteId?: string;
  collectibleId?: string;
  quoteText?: string;
  quoteAuthor?: string;
  soundUrl?: string;
  soundVolume?: number;
  visualEffect?: SecretVisualEffect;
}

export interface SecretBehavior {
  repeatable?: boolean;
  cooldownMs?: number;
  oncePerSession?: boolean;
}

export interface Secret {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  enabled: boolean;
  isPublished: boolean;
  order: number;
  target: SecretTarget;
  trigger: SecretTrigger;
  conditions: SecretConditions;
  reveal: SecretRevealPayload;
  behavior: SecretBehavior;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSecret {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  enabled: boolean;
  isPublished: boolean;
  order: number;
  target: SecretTarget;
  trigger: SecretTrigger;
  conditions: SecretConditions;
  reveal: SecretRevealPayload;
  behavior: SecretBehavior;
}

export interface SecretEvent {
  type: SecretTriggerType;
  targetType?: SecretTargetType;
  targetId?: string;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface DiscoveredSecretRecord {
  secretId?: string;
  slug: string;
  discoveredAt: string;
}

export interface SecretProgressData {
  version: number;
  discovered: Record<string, DiscoveredSecretRecord>;
}

// ─── Collectibles (Phase 9) ──────────────────────────────────
export type CollectibleCategory =
  | 'STAR'
  | 'FLOWER'
  | 'ART'
  | 'MEMORY'
  | 'MUSIC'
  | 'LETTER'
  | 'NATURE'
  | 'MAGIC';

export type CollectibleRarity = 'COMMON' | 'SPECIAL' | 'RARE';

export type CollectibleSource = 'WORLD' | 'SECRET';

export type CollectibleAnchor =
  | 'POND_EDGE'
  | 'HOUSE_GARDEN'
  | 'TREE_CLUSTER'
  | 'BENCH'
  | 'BRIDGE'
  | 'ART_WALL'
  | 'TELESCOPE_BASE'
  | 'MAILBOX_AREA'
  | 'CLOCK_AREA'
  | 'FLOWER_FIELD'
  | 'ISLAND_PATH';

export type CollectibleModelKey =
  | 'tiny_star'
  | 'pressed_flower'
  | 'paint_brush'
  | 'paper_crane'
  | 'polaroid'
  | 'moon_charm'
  | 'music_note'
  | 'golden_wing'
  | 'crystal'
  | 'tiny_letter';

export type CollectibleScalePreset = 'TINY' | 'SMALL' | 'NORMAL' | 'FEATURED';
export type CollectibleRotationPreset = 'DEFAULT' | 'UPRIGHT' | 'FLAT' | 'TILTED';
export type CollectibleIdleAnimation = 'FLOAT' | 'SLOW_SPIN' | 'SOFT_PULSE' | 'NONE';

export interface CollectiblePlacement {
  anchor: CollectibleAnchor;
  offset: { x: number; y: number; z: number };
  visibleInPeriods?: ('MORNING' | 'DAY' | 'SUNSET' | 'NIGHT')[];
  requiredMood?: string | null;
}

export interface CollectibleModelConfig {
  modelKey: CollectibleModelKey;
  scalePreset?: CollectibleScalePreset;
  rotationPreset?: CollectibleRotationPreset;
}

export interface CollectibleAppearance {
  glowColor?: string;
  accentColor?: string;
  idleAnimation?: CollectibleIdleAnimation;
  revealEffect?: SecretVisualEffect;
}

export interface CollectibleBehavior {
  hideAfterCollected?: boolean;
}

export interface Collectible {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  hint?: string;
  category: CollectibleCategory;
  rarity: CollectibleRarity;
  source: CollectibleSource;
  enabled: boolean;
  isPublished: boolean;
  order: number;
  model: CollectibleModelConfig;
  appearance: CollectibleAppearance;
  placement: CollectiblePlacement;
  behavior: CollectibleBehavior;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCollectible {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  hint?: string;
  category: CollectibleCategory;
  rarity: CollectibleRarity;
  source: CollectibleSource;
  enabled: boolean;
  isPublished: boolean;
  order: number;
  model: CollectibleModelConfig;
  appearance: CollectibleAppearance;
  placement: CollectiblePlacement;
  behavior: CollectibleBehavior;
}

export interface CollectedItemRecord {
  id: string;
  slug: string;
  collectedAt: string;
}

export interface CollectionProgressData {
  version: number;
  collected: Record<string, CollectedItemRecord>;
}


