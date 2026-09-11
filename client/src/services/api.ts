import type { ApiError, ApiResponse } from "@/types";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── CSRF token cache & helper ──────────────────────────────
const CSRF_STORAGE_KEY = "slw_csrf_token";
let memoryCsrfToken: string | null = null;

export function setCsrfToken(token: string | null | undefined): void {
  memoryCsrfToken = token || null;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem(CSRF_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(CSRF_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage errors (e.g. private browsing quota)
    }
  }
}

export function getCsrfToken(): string | undefined {
  if (memoryCsrfToken) {
    return memoryCsrfToken;
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CSRF_STORAGE_KEY);
      if (stored) {
        memoryCsrfToken = stored;
        return stored;
      }
    } catch {
      // Ignore localStorage access errors
    }
  }

  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
    if (match?.[1]) {
      memoryCsrfToken = match[1];
      return match[1];
    }
  }

  return undefined;
}

// ── Response interceptor: unwrap data & capture CSRF ───────
api.interceptors.response.use(
  (res) => {
    // Capture CSRF token if returned in header or response payload
    const headerToken = res.headers?.["x-csrf-token"];
    const bodyData = (res.data as Record<string, unknown> | undefined)?.data as
      | Record<string, unknown>
      | undefined;
    const bodyToken = bodyData?.csrfToken;

    const token =
      (typeof headerToken === "string" ? headerToken : undefined) ||
      (typeof bodyToken === "string" ? bodyToken : undefined);

    if (token) {
      setCsrfToken(token);
    }

    return res;
  },
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

// Add CSRF token to mutation requests
api.interceptors.request.use((config) => {
  if (
    config.method &&
    ["post", "patch", "put", "delete"].includes(config.method.toLowerCase())
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
