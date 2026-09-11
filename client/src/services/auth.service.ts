import type { Admin, ApiResponse } from "@/types";
import { apiGet, apiPost, setCsrfToken } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ admin: Admin }>> => {
    return apiPost<{ admin: Admin }>("/auth/login", credentials);
  },

  logout: async (): Promise<ApiResponse<null>> => {
    setCsrfToken(undefined);
    return apiPost<null>("/auth/logout");
  },

  refresh: async (): Promise<ApiResponse<null>> => {
    return apiPost<null>("/auth/refresh");
  },

  getMe: async (): Promise<Admin> => {
    const res = await apiGet<{ admin: Admin }>("/auth/me");
    return res.data.admin;
  },

  changePassword: async (
    data: ChangePasswordInput,
  ): Promise<ApiResponse<null>> => {
    return apiPost<null>("/auth/change-password", data);
  },
};
