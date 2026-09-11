import type { ApiResponse, PublicContentResponse } from "@/types";
import { apiGet, apiPost } from "./api";

export interface ContactLetterInput {
  name: string;
  email: string;
  message: string;
}

export const contentService = {
  getPublicContent: async (): Promise<PublicContentResponse> => {
    const res = await apiGet<PublicContentResponse>("/public/content");
    return res.data;
  },

  submitLetter: async (
    data: ContactLetterInput,
  ): Promise<ApiResponse<{ id: string }>> => {
    return apiPost<{ id: string }>("/public/letters", data);
  },
};
