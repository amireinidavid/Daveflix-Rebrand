import { create } from "zustand";
import axios from "axios";
import { API_ROUTES } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";

// First, export the MaturityRating enum so it can be used in other files
export enum MaturityRating {
  G = "G",
  PG = "PG",
  PG_13 = "PG_13",
  R = "R",
  NC_17 = "NC_17",
  TV_Y = "TV_Y",
  TV_Y7 = "TV_Y7",
  TV_G = "TV_G",
  TV_PG = "TV_PG",
  TV_14 = "TV_14",
  TV_MA = "TV_MA",
}

// Types from Prisma schema
interface Content {
  id: string;
  title: string;
  description: string;
  type: "MOVIE" | "TV_SHOW" | "DOCUMENTARY" | "SHORT_FILM" | "SPECIAL";
  releaseYear: number;
  maturityRating: MaturityRating;
  duration?: number;
  posterImage: string;
  audioLanguages: ["en"]
  director: string
  studio: string
  language: string
  country: string
  subtitleLanguages: ["en"]
  backdropImage?: string;
  trailerUrl?: string;
  trailerFile?: string;
  trailerType: "URL" | "UPLOADED";
  videoUrl?: string;
  videoFile?: string;
  videoSourceType: "URL" | "UPLOADED";
  videoSD?: string;
  videoHD?: string;
  video4K?: string;
  videoHDR?: string;
  genres: Genre[];
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  viewCount: number;
  averageRating?: number;
  likeCount: number;
  cast: CastMember[];
  seasons?: Season[];
  likes?: any[]; // You can define a more specific type if needed
}

interface Genre {
  id: string;
  name: string;
  description?: string;
}

interface Season {
  id: string;
  seasonNumber: number;
  title?: string;
  overview?: string;
  posterImage?: string;
  releaseYear?: number;
  episodes: Episode[];
}

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  duration?: number;
  thumbnailImage?: string;
  videoUrl?: string;
  videoFile?: string;
  videoSourceType: "URL" | "UPLOADED";
  videoSD?: string;
  videoHD?: string;
  video4K?: string;
  videoHDR?: string;
}

interface CastMember {
  id: string;
  name: string;
  role: string;
  character?: string;
  profileImage?: string;
}

interface WatchHistory {
  id: string;
  userId: string;
  profileId: string;
  episodeId?: string;
  progress: number;
  completed: boolean;
  lastWatched: Date;
}
// Add the Watchlist interface based on the schema
interface Watchlist {
  id: string;
  userId: string;
  profileId: string;
  contentId: string;
  createdAt: Date;
  content: Content; // The related content item
}
interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  contentId: string;
  createdAt: Date;
}

interface ContinueWatching {
  id: string;
  userId: string;
  contentId?: string;
  profileId: string;
  episodeId?: string;
  progress: number; // Position in seconds
  completionPercentage: number; // Completion percentage
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  lastWatched: Date;
  content?: Content; // Optional related content
  episode?: Episode; // Optional related episode
  isEpisode: boolean; // To differentiate between movies and TV shows
}

interface MovieStore {
  // State
  content: Content[];
  currentContent: Content | null;
  featuredContent: Content[];
  trendingContent: Content[];
  newReleases: Content[];
  searchResults: Content[];
  contentByGenre: Record<string, Content[]>;
  watchHistory: WatchHistory[];
  watchlist: Watchlist[]; // Add watchlist state
  continueWatching: ContinueWatching[];
  recommendations: Content[];
  seasons: Season[];
  currentSeason: Season | null;
  currentEpisode: Episode | null;
  loading: boolean;
  error: string | null;
  genres: Genre[];

  // Content Actions
  fetchAllContent: (page?: number, limit?: number) => Promise<void>;
  fetchContentById: (id: string) => Promise<void>;
  fetchFeaturedContent: () => Promise<void>;
  fetchTrendingContent: () => Promise<void>;
  fetchNewReleases: () => Promise<void>;
  fetchContentByGenre: (genreId: string) => Promise<any[]>;
  searchContent: (query: string) => Promise<void>;

  // User Interaction Actions
  rateContent: (contentId: string, score: number) => Promise<void>;
  addReview: (contentId: string, review: Review) => Promise<void>;
  toggleLike: (contentId: string) => Promise<void>;
  toggleWatchlist: (contentId: string) => Promise<void>;
  getWatchlist: () => Promise<void>;
  fetchContinueWatching: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;

  // TV Show Actions
  fetchTVShowSeasons: (showId: string) => Promise<void>;
  fetchSeasonDetails: (showId: string, seasonNumber: number) => Promise<void>;
  fetchEpisodeDetails: (
    showId: string,
    seasonNumber: number,
    episodeNumber: number
  ) => Promise<void>;
  recordEpisodeWatchHistory: (
    showId: string,
    seasonNumber: number,
    episodeNumber: number,
    progress: number,
    completed: boolean
  ) => Promise<void>;

  // Admin Actions
  createContent: (content: CreateContentInput) => Promise<any>;
  updateContent: (id: string, content: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  uploadPosterImage: (formData: FormData) => Promise<{
    success: boolean;
    message: string;
    data: {
      posterImage: string;
    };
  }>;
  uploadBackdropImage: (formData: FormData) => Promise<{
    success: boolean;
    message: string;
    data: {
      backdropImage: string;
    };
  }>;
  uploadTrailer: (
    id: string,
    file: File,
    type: "URL" | "UPLOADED"
  ) => Promise<{
    success: boolean;
    message: string;
    data: {
      trailerUrl: string | null;
      trailerFile: string | null;
      trailerType: "URL" | "UPLOADED";
    };
  }>;
  uploadVideo: (
    id: string,
    file: File,
    type: "URL" | "UPLOADED"
  ) => Promise<{
    success: boolean;
    message: string;
    data: {
      videoSourceType: "URL" | "UPLOADED";
      videoUrl: string | null;
      videoFile: string | null;
      videoSD: string | null;
      videoHD: string | null;
      video4K: string | null;
      videoHDR: string | null;
    };
  }>;

  // TV Show Management
  createSeason: (showId: string, season: Partial<Season>) => Promise<void>;
  uploadSeasonPoster: (seasonId: string, file: File) => Promise<void>;
  createEpisode: (seasonId: string, episode: Partial<Episode>) => Promise<void>;
  uploadEpisodeThumbnail: (episodeId: string, file: File) => Promise<void>;
  uploadEpisodeVideo: (
    episodeId: string,
    file: File,
    type: "URL" | "UPLOADED"
  ) => Promise<void>;

  // Content Relationships
  updateContentGenres: (contentId: string, genreIds: string[]) => Promise<void>;
  updateContentCast: (
    contentId: string,
    cast: Partial<CastMember>[]
  ) => Promise<void>;

  // Error Handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // New methods
  fetchGenres: () => Promise<Genre[]>;

  // User likes
  getLikes: () => Promise<void>;
}

// Create input types with optional IDs
export interface CreateEpisodeInput {
  episodeNumber: number;
  title: string;
  description?: string;
  duration?: number;
  thumbnailImage?: string;
  videoUrl?: string;
  videoFile?: string;
  videoSourceType?: "URL" | "UPLOADED";
  videoSD?: string;
  videoHD?: string;
  video4K?: string;
  videoHDR?: string;
  id?: string;
}

export interface CreateSeasonInput extends Omit<Season, "id" | "episodes"> {
  id?: string;
  episodes: CreateEpisodeInput[];
}

export type CreateContentInput = {
  title: string;
  description: string;
  type: "MOVIE" | "TV_SHOW" | "DOCUMENTARY" | "SHORT_FILM" | "SPECIAL";
  releaseYear: number;
  maturityRating: MaturityRating;
  duration?: number;
  posterImage?: string | null;
  backdropImage?: string | null;
  trailerUrl?: string | null;
  trailerFile?: string | null;
  trailerType?: "URL" | "UPLOADED";
  videoUrl?: string | null;
  videoFile?: string | null;
  videoSourceType?: "URL" | "UPLOADED";
  videoSD?: string | null;
  videoHD?: string | null;
  video4K?: string | null;
  videoHDR?: string | null;
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  director?: string | null;
  studio?: string | null;
  language?: string;
  country?: string | null;
  awards?: string | null;
  hasSD?: boolean;
  hasHD?: boolean;
  has4K?: boolean;
  hasHDR?: boolean;
  audioLanguages?: string[];
  subtitleLanguages?: string[];
  availableFrom?: Date;
  availableUntil?: Date | null;
  seasons?: CreateSeasonInput[];
  categories?: string[];
};

const useMovieStore = create<MovieStore>((set, get) => {
  // Create an axios instance with auth interceptor
  const api = axios.create();
  
  // Add request interceptor to include auth credentials and handle auth errors
  api.interceptors.request.use((config) => {
    // Always include credentials for API requests
    config.withCredentials = true;
    return config;
  });
  
  // Add response interceptor to handle auth errors
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // If we get a 401 Unauthorized error, try to refresh the token
      if (error.response && error.response.status === 401) {
        try {
          // Import dynamically to avoid circular dependency
          const { useAuthStore } = await import('./useAuthStore');
          const refreshToken = useAuthStore.getState().refreshToken;
          const success = await refreshToken();
          
          if (success) {
            // If token refresh was successful, retry the original request
            return api(error.config);
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
  
  return {
    // Initial State
    content: [],
    currentContent: null,
    featuredContent: [],
    trendingContent: [],
    newReleases: [],
    searchResults: [],
    contentByGenre: {},
    watchHistory: [],
    watchlist: [], // Initialize empty watchlist array
    continueWatching: [],
    recommendations: [],
    seasons: [],
    currentSeason: null,
    currentEpisode: null,
    loading: false,
    error: null,
    genres: [],

    // Content Actions
    fetchAllContent: async (page = 1, limit = 20) => {
      try {
        set({ loading: true, error: null });
        
        // Import dynamically to avoid circular dependency
        const { useAuthStore } = await import('./useAuthStore');
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        
        // If not authenticated, try to check auth status
        if (!isAuthenticated) {
          const checkAuth = useAuthStore.getState().checkAuth;
          const authSuccess = await checkAuth();
          if (!authSuccess) {
            set({ 
              error: "Authentication required", 
              loading: false,
              content: [] 
            });
            return [];
          }
        }
        
        const response = await api.get(API_ROUTES.CONTENT.ALL, {
          params: { page, limit },
        });
        const contentData = response.data.data || [];
        set({ content: contentData, loading: false });
        return contentData;
      } catch (error) {
        console.error("Error fetching content:", error);
        set({ 
          error: "Failed to fetch content. Please try again.", 
          loading: false 
        });
        return [];
      }
    },

    fetchContentById: async (id: string) => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.CONTENT.BY_ID(id));
        set({ currentContent: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch content details" });
      } finally {
        set({ loading: false });
      }
    },

    fetchFeaturedContent: async () => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.CONTENT.FEATURED);
        set({ featuredContent: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch featured content" });
      } finally {
        set({ loading: false });
      }
    },

    fetchTrendingContent: async () => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.CONTENT.TRENDING);
        set({ trendingContent: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch trending content" });
      } finally {
        set({ loading: false });
      }
    },

    fetchNewReleases: async () => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.CONTENT.NEW_RELEASES);
        set({ newReleases: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch new releases" });
      } finally {
        set({ loading: false });
      }
    },

    fetchContentByGenre: async (genreId: string) => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.CONTENT.BY_GENRE(genreId));
        set(state => ({ 
          contentByGenre: { 
            ...state.contentByGenre,
            [genreId]: response.data.data 
          } 
        }));
        return response.data.data;
      } catch (error) {
        set({ error: "Failed to fetch content by genre" });
        console.error("Error fetching content by genre:", error);
        return [];
      } finally {
        set({ loading: false });
      }
    },

    searchContent: async (query: string) => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.CONTENT.SEARCH, {
          params: { query },
        });
        set({ searchResults: response.data.data });
      } catch (error) {
        set({ error: "Failed to search content" });
      } finally {
        set({ loading: false });
      }
    },

    // User Interaction Actions
    rateContent: async (contentId: string, score: number) => {
      try {
        set({ loading: true });
        await api.post(API_ROUTES.CONTENT.RATE(contentId), { score });
        await get().fetchContentById(contentId);
      } catch (error) {
        set({ error: "Failed to rate content" });
      } finally {
        set({ loading: false });
      }
    },

    addReview: async (contentId: string, review: Review) => {
      try {
        set({ loading: true });
        await api.post(API_ROUTES.CONTENT.REVIEW(contentId), review);
        await get().fetchContentById(contentId);
      } catch (error) {
        set({ error: "Failed to add review" });
      } finally {
        set({ loading: false });
      }
    },

    toggleLike: async (contentId: string) => {
      try {
        set({ loading: true });
        await api.post(API_ROUTES.CONTENT.LIKE(contentId));
        await get().fetchContentById(contentId);
      } catch (error) {
        set({ error: "Failed to toggle like" });
      } finally {
        set({ loading: false });
      }
    },

    toggleWatchlist: async (contentId: string) => {
      try {
        set({ loading: true });
        await api.post(API_ROUTES.USER.WATCHLIST.TOGGLE(contentId));
      } catch (error) {
        set({ error: "Failed to toggle watchlist" });
      } finally {
        set({ loading: false });
      }
    },

    getWatchlist: async () => {
      try {
        set({ loading: true, error: null });
        const response = await api.get(API_ROUTES.USER.WATCHLIST.GET);
        
        if (response.data.success) {
          set({ watchlist: response.data.data });
        } else {
          set({ error: response.data.message || "Failed to fetch watchlist" });
        }
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || "Failed to fetch watchlist" 
        });
      } finally {
        set({ loading: false });
      }
    },

    fetchContinueWatching: async () => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.USER.CONTINUE_WATCHING);
        set({ continueWatching: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch continue watching" });
      } finally {
        set({ loading: false });
      }
    },

    fetchRecommendations: async () => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.USER.RECOMMENDATIONS);
        set({ recommendations: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch recommendations" });
      } finally {
        set({ loading: false });
      }
    },

    // TV Show Actions
    fetchTVShowSeasons: async (showId: string) => {
      try {
        set({ loading: true, error: null });
        const response = await api.get(API_ROUTES.TV_SHOW.SEASONS(showId));
        set({ seasons: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch TV show seasons" });
      } finally {
        set({ loading: false });
      }
    },

    fetchSeasonDetails: async (showId: string, seasonNumber: number) => {
      try {
        set({ loading: true });
        const response = await api.get(
          API_ROUTES.TV_SHOW.SEASON_DETAILS(showId, seasonNumber)
        );
        set({ currentSeason: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch season details" });
      } finally {
        set({ loading: false });
      }
    },

    fetchEpisodeDetails: async (
      showId: string,
      seasonNumber: number,
      episodeNumber: number
    ) => {
      try {
        set({ loading: true });
        const response = await api.get(
          API_ROUTES.TV_SHOW.EPISODE_DETAILS(showId, seasonNumber, episodeNumber)
        );
        set({ currentEpisode: response.data.data });
      } catch (error) {
        set({ error: "Failed to fetch episode details" });
      } finally {
        set({ loading: false });
      }
    },

    recordEpisodeWatchHistory: async (
      showId: string,
      seasonNumber: number,
      episodeNumber: number,
      progress: number,
      completed: boolean
    ) => {
      try {
        set({ loading: true });
        await api.post(
          API_ROUTES.TV_SHOW.RECORD_WATCH(showId, seasonNumber, episodeNumber),
          { progress, completed }
        );
      } catch (error) {
        set({ error: "Failed to record watch history" });
      } finally {
        set({ loading: false });
      }
    },

    // Admin Actions
    createContent: async (content: CreateContentInput) => {
      try {
        set({ loading: true });
        
        // Ensure seasons is an array if it exists
        const contentData = {
          ...content,
          seasons: content.seasons
            ? Array.isArray(content.seasons)
              ? content.seasons
              : [content.seasons]
            : undefined,
        };
        
        const response = await api.post(
          API_ROUTES.ADMIN.CONTENT.CREATE,
          contentData
        );
        
        set({ currentContent: response.data.data });
        return response.data;
      } catch (error) {
        set({ error: "Failed to create content" });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    updateContent: async (id: string, content: Partial<Content>) => {
      try {
        set({ loading: true });
        const response = await api.put(
          API_ROUTES.ADMIN.CONTENT.UPDATE(id),
          content
        );
        set({ currentContent: response.data.data });
      } catch (error) {
        set({ error: "Failed to update content" });
      } finally {
        set({ loading: false });
      }
    },

    deleteContent: async (id: string) => {
      try {
        set({ loading: true });
        await api.delete(API_ROUTES.ADMIN.CONTENT.DELETE(id));
        set({ content: get().content.filter((item) => item.id !== id) });
      } catch (error) {
        set({ error: "Failed to delete content" });
      } finally {
        set({ loading: false });
      }
    },

    uploadPosterImage: async (formData: FormData) => {
      try {
        const response = await api.post(
          API_ROUTES.ADMIN.CONTENT.UPLOAD.POSTER("temp"),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error uploading poster:", error);
        throw error;
      }
    },

    uploadBackdropImage: async (formData: FormData) => {
      try {
        const response = await api.post(
          API_ROUTES.ADMIN.CONTENT.UPLOAD.BACKDROP("temp"),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error uploading backdrop:", error);
        throw error;
      }
    },

    uploadTrailer: async (id: string, file: File, type: "URL" | "UPLOADED") => {
      try {
        set({ loading: true });
        const formData = new FormData();
        formData.append("trailer", file);
        formData.append("trailerType", type);
        
        const response = await api.post(
          API_ROUTES.ADMIN.CONTENT.UPLOAD.TRAILER(id),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        
        return response.data;
      } catch (error) {
        console.error("Error uploading trailer:", error);
        set({ error: "Failed to upload trailer" });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    uploadVideo: async (id: string, file: File, type: "URL" | "UPLOADED") => {
      try {
        set({ loading: true });
        const formData = new FormData();
        
        if (type === "UPLOADED") {
          // Append the file to the appropriate field based on its quality
          // For now, let's assume it's HD quality
          formData.append("videoHD", file);
          formData.append("videoSourceType", type);
        } else {
          formData.append("videoUrl", file);
          formData.append("videoSourceType", type);
        }

        const response = await api.post(
          API_ROUTES.ADMIN.CONTENT.UPLOAD.VIDEO(id),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 300000, // 5 minutes timeout
          }
        );
        
        return response.data;
      } catch (error) {
        console.error("Error uploading video:", error);
        set({ error: "Failed to upload video" });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    // TV Show Management
    createSeason: async (showId: string, season: Partial<Season>) => {
      try {
        set({ loading: true });
        const response = await api.post(
          API_ROUTES.ADMIN.TV_SHOW.CREATE_SEASON(showId),
          season
        );
        set({ seasons: [...get().seasons, response.data.data] });
      } catch (error) {
        set({ error: "Failed to create season" });
      } finally {
        set({ loading: false });
      }
    },

    uploadSeasonPoster: async (seasonId: string, file: File) => {
      try {
        set({ loading: true });
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post(
          API_ROUTES.ADMIN.TV_SHOW.UPLOAD_SEASON_POSTER(seasonId),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        set({ currentSeason: response.data.data });
      } catch (error) {
        set({ error: "Failed to upload season poster" });
      } finally {
        set({ loading: false });
      }
    },

    createEpisode: async (seasonId: string, episode: Partial<Episode>) => {
      try {
        set({ loading: true });
        const response = await api.post(
          API_ROUTES.ADMIN.TV_SHOW.CREATE_EPISODE(seasonId),
          episode
        );
        set({ currentEpisode: response.data.data });
      } catch (error) {
        set({ error: "Failed to create episode" });
      } finally {
        set({ loading: false });
      }
    },

    uploadEpisodeThumbnail: async (episodeId: string, file: File) => {
      try {
        set({ loading: true });
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post(
          API_ROUTES.ADMIN.TV_SHOW.UPLOAD_EPISODE_THUMBNAIL(episodeId),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        set({ currentEpisode: response.data.data });
      } catch (error) {
        set({ error: "Failed to upload episode thumbnail" });
      } finally {
        set({ loading: false });
      }
    },

    uploadEpisodeVideo: async (
      episodeId: string,
      file: File,
      type: "URL" | "UPLOADED"
    ) => {
      try {
        set({ loading: true });
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post(
          API_ROUTES.ADMIN.TV_SHOW.UPLOAD_EPISODE_VIDEO(episodeId),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        set({ currentEpisode: response.data.data });
      } catch (error) {
        set({ error: "Failed to upload episode video" });
      } finally {
        set({ loading: false });
      }
    },

    // Content Relationships
    updateContentGenres: async (contentId: string, genreIds: string[]) => {
      try {
        set({ loading: true });
        const response = await api.put(
          API_ROUTES.ADMIN.RELATIONSHIPS.UPDATE_GENRES(contentId),
          { genreIds }
        );
        set({ currentContent: response.data.data });
      } catch (error) {
        set({ error: "Failed to update content genres" });
      } finally {
        set({ loading: false });
      }
    },

    updateContentCast: async (contentId: string, cast: Partial<CastMember>[]) => {
      try {
        set({ loading: true });
        const response = await api.put(
          API_ROUTES.ADMIN.RELATIONSHIPS.UPDATE_CAST(contentId),
          { cast }
        );
        set({ currentContent: response.data.data });
      } catch (error) {
        set({ error: "Failed to update content cast" });
      } finally {
        set({ loading: false });
      }
    },

    // Error Handling
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),

    // New methods
    fetchGenres: async () => {
      try {
        set({ loading: true });
        const response = await api.get(API_ROUTES.GENRE.ALL);
        const genres = response.data.data;
        set({ genres });
        return genres;
      } catch (error) {
        set({ error: "Failed to fetch genres" });
        console.error("Error fetching genres:", error);
        return [];
      } finally {
        set({ loading: false });
      }
    },

    // User likes
    getLikes: async () => {
      try {
        set({ loading: true, error: null });
        const response = await api.get(API_ROUTES.CONTENT.GET_LIKES);
        
        if (response.data.success) {
          // Update the current content with likes information if it exists
          if (get().currentContent) {
            set(state => ({
              currentContent: {
                ...state.currentContent!,
                likes: response.data.data.filter(
                  (like: any) => like.contentId === state.currentContent?.id
                )
              }
            }));
          }
        } else {
          set({ error: response.data.message || "Failed to fetch likes" });
        }
      } catch (error: any) {
        set({ 
          error: error.response?.data?.message || "Failed to fetch likes" 
        });
      } finally {
        set({ loading: false });
      }
    },
  };
});

export default useMovieStore;
