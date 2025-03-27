import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { API_ROUTES } from "@/utils/api";

interface Profile {
  id: string;
  name: string;
  isKids: boolean;
  avatar?: string;
  pin?: string;
  maturityLevel: number;
  language: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profiles: Profile[];
  token: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;

  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(API_ROUTES.AUTH.REGISTER, data, {
            withCredentials: true,
          });

          const token = response.data.data.token;
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            isAuthenticated: true,
            isLoading: false,
            token: token,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Registration failed",
            isLoading: false,
            isAuthenticated: false,
            token: null,
          });
          throw error;
        }
      },

      login: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(API_ROUTES.AUTH.LOGIN, data, {
            withCredentials: true,
          });

          const token = response.data.data.token;
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            isAuthenticated: true,
            isLoading: false,
            token: token,
          });

          return response.data.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
            isAuthenticated: false,
            token: null,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await axios.post(
            API_ROUTES.AUTH.LOGOUT,
            {},
            {
              withCredentials: true,
            }
          );
          delete axios.defaults.headers.common["Authorization"];
          set({ isAuthenticated: false, token: null });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },

      checkAuth: async () => {
        try {
          const token = get().token;
          if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }

          const response = await axios.get(API_ROUTES.USER.ME, {
            withCredentials: true,
          });
          const isAuthenticated = !!response.data.success;
          set({ isAuthenticated });
          return isAuthenticated;
        } catch (error) {
          set({ isAuthenticated: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (rehydratedState?.token) {
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${rehydratedState.token}`;
          }
        };
      },
    }
  )
);
