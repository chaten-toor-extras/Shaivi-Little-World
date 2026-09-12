import type {
  ApiResponse,
  ArtistContent,
  Artwork,
  Collectible,
  ContactSettings,
  DashboardStats,
  JourneyMilestone,
  Letter,
  LetterStatus,
  Mood,
  PaginatedResponse,
  Quote,
  Secret,
  SiteSettings,
  Song,
  WorldSettings,
} from "@/types";
import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

export interface ReorderItem {
  id: string;
  order: number;
}

export const adminService = {
  // ── Dashboard ──────────────────────────────────────────────
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiGet<any>("/admin/dashboard");
    const d = res.data;
    if (d?.counts) {
      return {
        artworks: d.counts.artworks ?? d.artworks ?? 0,
        quotes: d.counts.quotes ?? d.quotes ?? 0,
        songs: d.counts.songs ?? d.songs ?? 0,
        moods: d.counts.moods ?? d.moods ?? 0,
        milestones: d.counts.milestones ?? d.milestones ?? 0,
        unreadLetters: d.counts.letters?.unread ?? d.unreadLetters ?? 0,
        totalLetters: d.counts.letters?.total ?? d.totalLetters ?? 0,
      };
    }
    return {
      artworks: d?.artworks ?? 0,
      quotes: d?.quotes ?? 0,
      songs: d?.songs ?? 0,
      moods: d?.moods ?? 0,
      milestones: d?.milestones ?? 0,
      unreadLetters: d?.unreadLetters ?? 0,
      totalLetters: d?.totalLetters ?? 0,
    };
  },

  // ── Site Settings ──────────────────────────────────────────
  getSiteSettings: async (): Promise<SiteSettings> => {
    const res = await apiGet<SiteSettings>("/admin/site");
    return res.data;
  },
  updateSiteSettings: async (
    data: Partial<SiteSettings>,
  ): Promise<ApiResponse<SiteSettings>> => {
    return apiPatch<SiteSettings>("/admin/site", data);
  },

  // ── Artist ─────────────────────────────────────────────────
  getArtist: async (): Promise<ArtistContent> => {
    const res = await apiGet<ArtistContent>("/admin/artist");
    return res.data;
  },
  updateArtist: async (
    data: Partial<ArtistContent>,
  ): Promise<ApiResponse<ArtistContent>> => {
    return apiPatch<ArtistContent>("/admin/artist", data);
  },

  // ── Quotes ─────────────────────────────────────────────────
  getQuotes: async (): Promise<Quote[]> => {
    const res = await apiGet<Quote[]>("/admin/quotes");
    return res.data;
  },
  createQuote: async (data: Partial<Quote>): Promise<ApiResponse<Quote>> => {
    return apiPost<Quote>("/admin/quotes", data);
  },
  updateQuote: async (
    id: string,
    data: Partial<Quote>,
  ): Promise<ApiResponse<Quote>> => {
    return apiPatch<Quote>(`/admin/quotes/${id}`, data);
  },
  deleteQuote: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/quotes/${id}`);
  },
  reorderQuotes: async (items: ReorderItem[]): Promise<ApiResponse<null>> => {
    return apiPatch<null>("/admin/quotes/reorder", { items });
  },

  // ── Artworks ───────────────────────────────────────────────
  getArtworks: async (): Promise<Artwork[]> => {
    const res = await apiGet<Artwork[]>("/admin/artworks");
    return res.data;
  },
  createArtwork: async (
    data: Partial<Artwork>,
  ): Promise<ApiResponse<Artwork>> => {
    return apiPost<Artwork>("/admin/artworks", data);
  },
  updateArtwork: async (
    id: string,
    data: Partial<Artwork>,
  ): Promise<ApiResponse<Artwork>> => {
    return apiPatch<Artwork>(`/admin/artworks/${id}`, data);
  },
  deleteArtwork: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/artworks/${id}`);
  },
  reorderArtworks: async (items: ReorderItem[]): Promise<ApiResponse<null>> => {
    return apiPatch<null>("/admin/artworks/reorder", { items });
  },

  // ── Journey ────────────────────────────────────────────────
  getMilestones: async (): Promise<JourneyMilestone[]> => {
    const res = await apiGet<JourneyMilestone[]>("/admin/journey");
    return res.data;
  },
  createMilestone: async (
    data: Partial<JourneyMilestone>,
  ): Promise<ApiResponse<JourneyMilestone>> => {
    return apiPost<JourneyMilestone>("/admin/journey", data);
  },
  updateMilestone: async (
    id: string,
    data: Partial<JourneyMilestone>,
  ): Promise<ApiResponse<JourneyMilestone>> => {
    return apiPatch<JourneyMilestone>(`/admin/journey/${id}`, data);
  },
  deleteMilestone: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/journey/${id}`);
  },
  reorderMilestones: async (
    items: ReorderItem[],
  ): Promise<ApiResponse<null>> => {
    return apiPatch<null>("/admin/journey/reorder", { items });
  },

  // ── Songs ──────────────────────────────────────────────────
  getSongs: async (): Promise<Song[]> => {
    const res = await apiGet<Song[]>("/admin/songs");
    return res.data;
  },
  createSong: async (data: Partial<Song>): Promise<ApiResponse<Song>> => {
    return apiPost<Song>("/admin/songs", data);
  },
  updateSong: async (
    id: string,
    data: Partial<Song>,
  ): Promise<ApiResponse<Song>> => {
    return apiPatch<Song>(`/admin/songs/${id}`, data);
  },
  deleteSong: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/songs/${id}`);
  },
  reorderSongs: async (items: ReorderItem[]): Promise<ApiResponse<null>> => {
    return apiPatch<null>("/admin/songs/reorder", { items });
  },

  // ── Moods ──────────────────────────────────────────────────
  getMoods: async (): Promise<Mood[]> => {
    const res = await apiGet<Mood[]>("/admin/moods");
    return res.data;
  },
  createMood: async (data: Partial<Mood>): Promise<ApiResponse<Mood>> => {
    return apiPost<Mood>("/admin/moods", data);
  },
  updateMood: async (
    id: string,
    data: Partial<Mood>,
  ): Promise<ApiResponse<Mood>> => {
    return apiPatch<Mood>(`/admin/moods/${id}`, data);
  },
  deleteMood: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/moods/${id}`);
  },

  // ── Contact Settings ───────────────────────────────────────
  getContactSettings: async (): Promise<ContactSettings> => {
    const res = await apiGet<ContactSettings>("/admin/contact-settings");
    return res.data;
  },
  updateContactSettings: async (
    data: Partial<ContactSettings>,
  ): Promise<ApiResponse<ContactSettings>> => {
    return apiPatch<ContactSettings>("/admin/contact-settings", data);
  },

  // ── Letters ────────────────────────────────────────────────
  getLetters: async (params?: {
    page?: number;
    limit?: number;
    status?: LetterStatus;
    search?: string;
  }): Promise<PaginatedResponse<Letter>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    const url = `/admin/letters${qs ? `?${qs}` : ""}`;
    const res = await apiGet<Letter[]>(url);
    return {
      items: res.data,
      meta: res.meta || {
        page: 1,
        limit: 20,
        total: res.data.length,
        pages: 1,
      },
    };
  },
  getLetter: async (id: string): Promise<Letter> => {
    const res = await apiGet<Letter>(`/admin/letters/${id}`);
    return res.data;
  },
  updateLetterStatus: async (
    id: string,
    status: LetterStatus,
    adminNote?: string,
  ): Promise<ApiResponse<Letter>> => {
    return apiPatch<Letter>(`/admin/letters/${id}/status`, {
      status,
      adminNote,
    });
  },
  deleteLetter: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/letters/${id}`);
  },

  // ── World Settings ─────────────────────────────────────────
  getWorldSettings: async (): Promise<WorldSettings> => {
    const res = await apiGet<WorldSettings>("/admin/world");
    return res.data;
  },
  updateWorldSettings: async (
    data: Partial<WorldSettings>,
  ): Promise<ApiResponse<WorldSettings>> => {
    const { _id, __v, createdAt, updatedAt, schemaVersion, ...cleanData } =
      data as any;
    return apiPatch<WorldSettings>("/admin/world", cleanData);
  },
  resetWorldSettings: async (
    section?: string,
  ): Promise<ApiResponse<WorldSettings>> => {
    const url = section
      ? `/admin/world/reset/${section}`
      : "/admin/world/reset";
    return apiPost<WorldSettings>(url, {});
  },

  // ── Secrets (Phase 8) ──────────────────────────────────────
  getSecrets: async (): Promise<Secret[]> => {
    const res = await apiGet<Secret[]>("/admin/secrets");
    return res.data;
  },
  createSecret: async (
    data: Partial<Secret>,
  ): Promise<ApiResponse<Secret>> => {
    return apiPost<Secret>("/admin/secrets", data);
  },
  updateSecret: async (
    id: string,
    data: Partial<Secret>,
  ): Promise<ApiResponse<Secret>> => {
    const { _id, __v, createdAt, updatedAt, ...cleanData } = data as any;
    return apiPatch<Secret>(`/admin/secrets/${id}`, cleanData);
  },
  deleteSecret: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/secrets/${id}`);
  },
  duplicateSecret: async (id: string): Promise<ApiResponse<Secret>> => {
    return apiPost<Secret>(`/admin/secrets/${id}/duplicate`, {});
  },
  reorderSecrets: async (
    items: ReorderItem[],
  ): Promise<ApiResponse<null>> => {
    return apiPatch<null>("/admin/secrets/reorder", { items });
  },

  // ── Collectibles (Phase 9) ──────────────────────────────────
  getCollectibles: async (): Promise<Collectible[]> => {
    const res = await apiGet<Collectible[]>("/admin/collectibles");
    return res.data;
  },
  createCollectible: async (
    data: Partial<Collectible>,
  ): Promise<ApiResponse<Collectible>> => {
    return apiPost<Collectible>("/admin/collectibles", data);
  },
  updateCollectible: async (
    id: string,
    data: Partial<Collectible>,
  ): Promise<ApiResponse<Collectible>> => {
    const { _id, __v, createdAt, updatedAt, ...cleanData } = data as any;
    return apiPatch<Collectible>(`/admin/collectibles/${id}`, cleanData);
  },
  deleteCollectible: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<null>(`/admin/collectibles/${id}`);
  },
  reorderCollectibles: async (
    items: ReorderItem[],
  ): Promise<ApiResponse<null>> => {
    return apiPatch<null>("/admin/collectibles/reorder", { items });
  },
};
