"use client";

import {
  authService,
  type ChangePasswordInput,
  type LoginCredentials,
} from "@/services/auth.service";
import type { Admin } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();

  // Check current admin session
  const {
    data: admin,
    isLoading,
    isError,
    refetch,
  } = useQuery<Admin | null>({
    queryKey: ["authAdmin"],
    queryFn: async () => {
      try {
        return await authService.getMe();
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (res) => {
      queryClient.setQueryData(["authAdmin"], res.data.admin);
      queryClient.invalidateQueries({ queryKey: ["authAdmin"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["authAdmin"], null);
      queryClient.clear(); // Clear all admin caches on logout
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => authService.changePassword(data),
  });

  return {
    admin: admin ?? null,
    isLoading,
    isAuthenticated: !!admin,
    isError,
    refetch,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
