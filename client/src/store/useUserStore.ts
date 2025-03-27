import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { API_ROUTES } from "@/utils/api";
import axios from "axios";
interface Profile {
  id: string;
  name: string;
  isKids: boolean;
  avatar: string;
  maturityLevel: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  tier: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  maxQuality: string;
  maxSimultaneousStreams: number;
  downloadAllowed: boolean;
  adFree: boolean;
  offlineViewing: boolean;
  maxProfiles: number;
  familySharingEnabled: boolean;
  isSubscriptionActive: boolean;
  isInTrialPeriod: boolean;
  daysLeftInPeriod: number;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "USER";
  profiles: Profile[];
  subscription: Subscription | null;
  activeProfile: Profile | null;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  activeProfile: Profile | null;
  initialized: boolean;
  // Actions
  setUser: (user: User | null) => void;
  setActiveProfile: (profile: Profile) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
  getWatchHistory: (limit?: number, offset?: number) => Promise<any>;
  getLikedMovies: (limit?: number, offset?: number) => Promise<any>;
  // Profile management
  createProfile: (profileData: Partial<Profile>) => Promise<void>;
  updateProfile: (
    profileId: string,
    profileData: Partial<Profile>
  ) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  // Subscription management
  updateSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  checkoutSubscription: (planId: string) => Promise<string>; // Returns checkout URL
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,
        activeProfile: null,
        initialized: false,

        setUser: (user) => set({ user, error: null }),

        setActiveProfile: (profile) =>
          set((state) => ({
            activeProfile: profile,
            user: state.user ? { ...state.user, activeProfile: profile } : null,
          })),

        clearUser: () => set({ user: null, activeProfile: null, error: null }),

        fetchUser: async () => {
          try {
            set({ isLoading: true, error: null });
            const response = await axios.get(API_ROUTES.USER.ME, {
              withCredentials: true,
            });

            if (!response.data.success) throw new Error("Failed to fetch user");

            const { data } = response.data;
            set({
              user: data,
              activeProfile: data.activeProfile || data.profiles[0],
              isLoading: false,
              initialized: true,
            });
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
              initialized: true,
            });
          }
        },

        getWatchHistory: async (limit = 20, offset = 0) => {
          try {
            const response = await fetch(
              `${API_ROUTES.USER.WATCH_HISTORY}?limit=${limit}&offset=${offset}`,
              { credentials: "include" }
            );

            if (!response.ok) throw new Error("Failed to fetch watch history");

            const { data } = await response.json();
            return data;
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
            });
            return [];
          }
        },

        getLikedMovies: async (limit = 20, offset = 0) => {
          try {
            const response = await fetch(
              `${API_ROUTES.USER.LIKED_MOVIES}?limit=${limit}&offset=${offset}`,
              { credentials: "include" }
            );

            if (!response.ok) throw new Error("Failed to fetch liked movies");

            const { data } = await response.json();
            return data;
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
            });
            return [];
          }
        },

        // Profile Management
        createProfile: async (profileData) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(API_ROUTES.USER.PROFILES.CREATE, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profileData),
            });

            if (!response.ok) throw new Error("Failed to create profile");

            const { data } = await response.json();
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    profiles: [...state.user.profiles, data],
                  }
                : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
            });
          }
        },

        updateProfile: async (profileId, profileData) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(
              API_ROUTES.USER.PROFILES.UPDATE(profileId),
              {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
              }
            );

            if (!response.ok) throw new Error("Failed to update profile");

            const { data } = await response.json();
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    profiles: state.user.profiles.map((p) =>
                      p.id === profileId ? { ...p, ...data } : p
                    ),
                    activeProfile:
                      state.user.activeProfile?.id === profileId
                        ? { ...state.user.activeProfile, ...data }
                        : state.user.activeProfile,
                  }
                : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
            });
          }
        },

        deleteProfile: async (profileId) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(
              API_ROUTES.USER.PROFILES.DELETE(profileId),
              {
                method: "DELETE",
                credentials: "include",
              }
            );

            if (!response.ok) throw new Error("Failed to delete profile");

            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    profiles: state.user.profiles.filter(
                      (p) => p.id !== profileId
                    ),
                    activeProfile:
                      state.user.activeProfile?.id === profileId
                        ? state.user.profiles[0]
                        : state.user.activeProfile,
                  }
                : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
            });
          }
        },

        // Subscription Management
        updateSubscription: async (plan) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(API_ROUTES.USER.SUBSCRIPTION.UPDATE, {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan }),
            });

            if (!response.ok) throw new Error("Failed to update subscription");

            const { data } = await response.json();
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    subscription: data,
                  }
                : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
            });
          }
        },

        cancelSubscription: async () => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(API_ROUTES.USER.SUBSCRIPTION.CANCEL, {
              method: "POST",
              credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to cancel subscription");

            const { data } = await response.json();
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    subscription: data,
                  }
                : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
            });
          }
        },

        reactivateSubscription: async () => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(
              API_ROUTES.USER.SUBSCRIPTION.REACTIVATE,
              {
                method: "POST",
                credentials: "include",
              }
            );

            if (!response.ok)
              throw new Error("Failed to reactivate subscription");

            const { data } = await response.json();
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    subscription: data,
                  }
                : null,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
            });
          }
        },

        checkoutSubscription: async (planId) => {
          try {
            set({ isLoading: true, error: null });
            const response = await fetch(
              API_ROUTES.USER.SUBSCRIPTION.CHECKOUT,
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
              }
            );

            if (!response.ok)
              throw new Error("Failed to create checkout session");

            const { url } = await response.json();
            set({ isLoading: false });
            return url;
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "An error occurred",
              isLoading: false,
            });
            return "";
          }
        },
      }),
      {
        name: "user-storage",
        partialize: (state) => ({
          user: state.user,
          activeProfile: state.activeProfile,
          isLoading: false,
          error: null,
          initialized: state.initialized,
        }),
      }
    )
  )
);

// Initialize axios auth header from persisted store
if (typeof window !== "undefined") {
  const persistedState = JSON.parse(
    localStorage.getItem("auth-storage") || "{}"
  );
  if (persistedState?.state?.user?.token) {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${persistedState.state.user.token}`;
  }
}
