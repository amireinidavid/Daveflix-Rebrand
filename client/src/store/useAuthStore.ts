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
  maturityLevel?: string;
  language?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  profile: Profile[];
  activeProfile?: Profile | null;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ProfileData {
  name: string;
  isKids?: boolean;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  
  register: (data: RegisterData) => Promise<User>;
  login: (data: LoginData) => Promise<User>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
  
  // Profile management
  createProfile: (data: ProfileData) => Promise<Profile>;
  updateProfile: (profileId: string, data: Partial<ProfileData>) => Promise<Profile>;
  deleteProfile: (profileId: string) => Promise<void>;
  setActiveProfile: (profileId: string) => Promise<Profile>;
  
  // Account management
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(API_ROUTES.AUTH.REGISTER, data, {
            withCredentials: true,
          });

          if (response.data.success) {
            set({
              isAuthenticated: true,
              isLoading: false,
              user: response.data.user,
            });
            return response.data.user;
          } else {
            throw new Error(response.data.error || "Registration failed");
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message || "Registration failed",
            isLoading: false,
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

          if (response.data.success) {
            set({
              isAuthenticated: true,
              isLoading: false,
              user: response.data.user,
            });
            return response.data.user;
          } else {
            throw new Error(response.data.error || "Login failed");
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message || "Login failed",
            isLoading: false,
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
          set({ isAuthenticated: false, user: null });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
      
      refreshToken: async () => {
        try {
          const response = await axios.post(
            API_ROUTES.AUTH.REFRESH_TOKEN,
            {},
            {
              withCredentials: true,
            }
          );
          return response.data.success;
        } catch (error) {
          return false;
        }
      },

      checkAuth: async () => {
        try {
          // First check if we already have a user in state
          if (get().isAuthenticated && get().user) {
            return true;
          }
          
          // Try to refresh the token first
          const tokenRefreshed = await get().refreshToken();
          
          // If token refresh failed, try to get user data
          if (!tokenRefreshed) {
            const response = await axios.get(API_ROUTES.USER.ME, {
              withCredentials: true,
            });
            
            if (response.data.success) {
              set({ 
                isAuthenticated: true,
                user: response.data.user
              });
              return true;
            }
          } else {
            // If token refresh succeeded, get user data
            const response = await axios.get(API_ROUTES.USER.ME, {
              withCredentials: true,
            });
            
            if (response.data.success) {
              set({ 
                isAuthenticated: true,
                user: response.data.user
              });
              return true;
            }
          }
          
          set({ isAuthenticated: false });
          return false;
        } catch (error) {
          console.error("Auth check error:", error);
          set({ isAuthenticated: false });
          return false;
        }
      },
      
      createProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(
            API_ROUTES.AUTH.PROFILES.CREATE,
            data,
            {
              withCredentials: true,
            }
          );
          
          // Update user with new profile
          const user = get().user;
          if (user) {
            set({
              user: {
                ...user,
                profile: [...user.profile, response.data.profile]
              }
            });
          }
          
          set({ isLoading: false });
          return response.data.profile;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Failed to create profile",
            isLoading: false,
          });
          throw error;
        }
      },
      
      updateProfile: async (profileId, data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.put(
            API_ROUTES.AUTH.PROFILES.UPDATE(profileId),
            data,
            {
              withCredentials: true,
            }
          );
          
          // Update user with updated profile
          const user = get().user;
          if (user) {
            set({
              user: {
                ...user,
                profile: user.profile.map(p => 
                  p.id === profileId ? response.data.profile : p
                ),
                activeProfile: user.activeProfile?.id === profileId 
                  ? response.data.profile 
                  : user.activeProfile
              }
            });
          }
          
          set({ isLoading: false });
          return response.data.profile;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Failed to update profile",
            isLoading: false,
          });
          throw error;
        }
      },
      
      deleteProfile: async (profileId) => {
        try {
          set({ isLoading: true, error: null });
          await axios.delete(
            API_ROUTES.AUTH.PROFILES.DELETE(profileId),
            {
              withCredentials: true,
            }
          );
          
          // Update user by removing deleted profile
          const user = get().user;
          if (user) {
            set({
              user: {
                ...user,
                profile: user.profile.filter(p => p.id !== profileId),
                activeProfile: user.activeProfile?.id === profileId 
                  ? null 
                  : user.activeProfile
              }
            });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Failed to delete profile",
            isLoading: false,
          });
          throw error;
        }
      },
      
      setActiveProfile: async (profileId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(
            API_ROUTES.AUTH.PROFILES.ACTIVATE(profileId),
            {},
            {
              withCredentials: true,
            }
          );
          
          // Update user with new active profile
          const user = get().user;
          if (user) {
            set({
              user: {
                ...user,
                activeProfile: response.data.activeProfile
              }
            });
          }
          
          set({ isLoading: false });
          return response.data.activeProfile;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Failed to set active profile",
            isLoading: false,
          });
          throw error;
        }
      },
      
      deleteAccount: async () => {
        try {
          set({ isLoading: true, error: null });
          await axios.delete(
            API_ROUTES.AUTH.DELETE_ACCOUNT,
            {
              withCredentials: true,
            }
          );
          
          set({ 
            isAuthenticated: false, 
            user: null,
            isLoading: false 
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || "Failed to delete account",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
