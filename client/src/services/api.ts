import axios from "axios";
import type { ApiResponse, ApiError } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor: unwrap data ──────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // If 401 and not already retrying and not on auth endpoints
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      original._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(original);
      } catch {
        // Refresh failed — let the error propagate
      }
    }

    // Normalize error
    const apiError: ApiError = error.response?.data ?? {
      success: false,
      message: error.message || "Network error",
    };
    return Promise.reject(apiError);
  },
);

// ── CSRF helper ────────────────────────────────────────────
function getCsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match?.[1];
}

// Add CSRF token to mutation requests
api.interceptors.request.use((config) => {
  if (
    config.method &&
    ["post", "patch", "put", "delete"].includes(config.method)
  ) {
    const token = getCsrfToken();
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }
  return config;
});

export default api;

/** Type-safe helper */
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  const res = await api.get<ApiResponse<T>>(url);
  return res.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
): Promise<ApiResponse<T>> {
  const res = await api.post<ApiResponse<T>>(url, data);
  return res.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
): Promise<ApiResponse<T>> {
  const res = await api.patch<ApiResponse<T>>(url, data);
  return res.data;
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const res = await api.delete<ApiResponse<T>>(url);
  return res.data;
}

