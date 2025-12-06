/**
 * Zustand store for authentication state management
 */

import { create } from "zustand";
import { AuthState, User } from "@/types";
import { authApi } from "@/lib/api";
import { isTokenExpired } from "@/utils/jwt";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    try {
      const tokenResponse = await authApi.login({ email, password });
      const user = await authApi.getCurrentUser();
      
      set({
        user,
        token: tokenResponse.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (data) => {
    try {
      await authApi.register(data);
      // After registration, auto-login
      await get().login(data.email, data.password);
    } catch (error) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    authApi.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /**
   * Check authentication status on app load
   */
  checkAuth: async () => {
    try {
      const token = authApi.getToken();
      
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        authApi.logout();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Fetch current user
      const user = await authApi.getCurrentUser();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      authApi.logout();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Set user manually
   */
  setUser: (user: User | null) => {
    set({ user });
  },
}));
