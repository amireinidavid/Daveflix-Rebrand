export const API_BASE_URL = "http://localhost:5000";

export const API_ROUTES = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
    PROFILES: {
      CREATE: `${API_BASE_URL}/api/auth/profiles`,
      UPDATE: (profileId: string) => `${API_BASE_URL}/api/auth/profiles/${profileId}`,
      DELETE: (profileId: string) => `${API_BASE_URL}/api/auth/profiles/${profileId}`,
      ACTIVATE: (profileId: string) => `${API_BASE_URL}/api/auth/profiles/${profileId}/activate`,
    },
    DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/account`,
  },
  CONTENT: {
    ALL: `${API_BASE_URL}/api/content/all`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/content/content/${id}`,
    FEATURED: `${API_BASE_URL}/api/content/featured`,
    TRENDING: `${API_BASE_URL}/api/content/trending`,
    NEW_RELEASES: `${API_BASE_URL}/api/content/new-releases`,
    BY_GENRE: (genreId: string) => `${API_BASE_URL}/api/content/genre/${genreId}`,
    SEARCH: `${API_BASE_URL}/api/content/search`,
    RATE: (id: string) => `${API_BASE_URL}/api/content/content/${id}/rate`,
    REVIEW: (id: string) => `${API_BASE_URL}/api/content/content/${id}/review`,
    LIKE: (id: string) => `${API_BASE_URL}/api/content/content/${id}/like`,
    GET_LIKES: `${API_BASE_URL}/api/content/likes`,
  },
  TV_SHOW: {
    SEASONS: (id: string) => `${API_BASE_URL}/api/content/tv-show/${id}/seasons`,
    SEASON_DETAILS: (showId: string, seasonNumber: number) =>
      `${API_BASE_URL}/api/content/tv-show/${showId}/season/${seasonNumber}`,
    EPISODE_DETAILS: (
      showId: string,
      seasonNumber: number,
      episodeNumber: number
    ) =>
      `${API_BASE_URL}/api/content/tv-show/${showId}/season/${seasonNumber}/episode/${episodeNumber}`,
    RECORD_WATCH: (
      showId: string,
      seasonNumber: number,
      episodeNumber: number
    ) =>
      `${API_BASE_URL}/api/content/tv-show/${showId}/season/${seasonNumber}/episode/${episodeNumber}/watch-history`,
  },
  USER: {
    ME: `${API_BASE_URL}/api/user/me`,
    WATCH_HISTORY: `${API_BASE_URL}/api/user/watch-history`,
    LIKED_MOVIES: `${API_BASE_URL}/api/user/liked-movies`,
    WATCHLIST: {
      TOGGLE: (contentId: string) =>
        `${API_BASE_URL}/api/content/watchlist/${contentId}`,
      GET: `${API_BASE_URL}/api/content/watchlist`,
    },
    CONTINUE_WATCHING: `${API_BASE_URL}/api/continue-watching`,
    RECOMMENDATIONS: `${API_BASE_URL}/api/recommendations`,
    SUBSCRIPTION: {
      UPDATE: `${API_BASE_URL}/api/user/subscription`,
      CANCEL: `${API_BASE_URL}/api/user/subscription/cancel`,
      REACTIVATE: `${API_BASE_URL}/api/user/subscription/reactivate`,
      CHECKOUT: `${API_BASE_URL}/api/user/subscription/checkout`,
    },
  },
  ADMIN: {
    CONTENT: {
      CREATE: `${API_BASE_URL}/api/content/admin/content`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/content/admin/content/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/content/admin/content/${id}`,
      UPLOAD: {
        POSTER: (id: string) =>
          `${API_BASE_URL}/api/content/admin/content/${id}/poster`,
        BACKDROP: (id: string) =>
          `${API_BASE_URL}/api/content/admin/content/${id}/backdrop`,
        TRAILER: (id: string) =>
          `${API_BASE_URL}/api/content/admin/content/${id}/trailer`,
        VIDEO: (id: string) =>
          `${API_BASE_URL}/api/content/admin/content/${id}/video`,
      },
    },
    TV_SHOW: {
      CREATE_SEASON: (showId: string) =>
        `${API_BASE_URL}/api/content/admin/content/${showId}/seasons`,
      UPLOAD_SEASON_POSTER: (seasonId: string) =>
        `${API_BASE_URL}/api/content/admin/seasons/${seasonId}/poster`,
      CREATE_EPISODE: (seasonId: string) =>
        `${API_BASE_URL}/api/content/admin/seasons/${seasonId}/episodes`,
      UPLOAD_EPISODE_THUMBNAIL: (episodeId: string) =>
        `${API_BASE_URL}/api/content/admin/episodes/${episodeId}/thumbnail`,
      UPLOAD_EPISODE_VIDEO: (episodeId: string) =>
        `${API_BASE_URL}/api/content/admin/episodes/${episodeId}/video`,
    },
    RELATIONSHIPS: {
      UPDATE_GENRES: (contentId: string) =>
        `${API_BASE_URL}/api/content/admin/content/${contentId}/genres`,
      UPDATE_CAST: (contentId: string) =>
        `${API_BASE_URL}/api/content/admin/content/${contentId}/cast`,
    },
    CATEGORIES: {
      ALL: `${API_BASE_URL}/api/categories`,
      BY_ID: (id: string) => `${API_BASE_URL}/api/categories/${id}`,
      BY_SLUG: (slug: string) => `${API_BASE_URL}/api/categories/slug/${slug}`,
      CREATE: `${API_BASE_URL}/api/categories`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/categories/${id}`,
      DELETE: (id: string) => `${API_BASE_URL}/api/categories/${id}`,
      ADD_CONTENT: (id: string) =>
        `${API_BASE_URL}/api/categories/${id}/content`,
      REMOVE_CONTENT: (id: string, contentId: string) =>
        `${API_BASE_URL}/api/categories/${id}/content/${contentId}`,
      REORDER: `${API_BASE_URL}/api/categories/reorder`,
    },
  },
  CATEGORIES: {
    ALL: `${API_BASE_URL}/api/categories`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/categories/${id}`,
    BY_SLUG: (slug: string) => `${API_BASE_URL}/api/categories/slug/${slug}`,
  },
  GENRE: {
    ALL: `${API_BASE_URL}/api/content/genres`,
  },
};
