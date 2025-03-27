import express from "express";
import * as movieController from "../controllers/movieController";
import { authenticate } from "../middleware/auth";
import { isAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

// Public content browsing routes
router.get("/all", movieController.getAllContent);
router.get("/content/:id", movieController.getContentById);
router.get("/featured", movieController.getFeaturedContent);
router.get("/trending", movieController.getTrendingContent);
router.get("/new-releases", movieController.getNewReleases);
router.get("/genre/:genreId", movieController.getContentByGenre);
router.get("/search", movieController.searchContent);
router.get("/genres", movieController.getAllGenres);

// User interaction routes (require authentication)
router.use(authenticate);

// Content interaction
router.post("/content/:id/rate", movieController.rateContent);
router.post("/content/:id/review", movieController.addReview);
router.post("/content/:id/like", movieController.toggleLike);
// router.post("/content/:id/watch-history", movieController.recordWatchHistory);

// Watchlist management
router.post("/watchlist/:contentId", movieController.toggleWatchlist);
router.get("/watchlist", movieController.getWatchlist);

// Continue watching
router.get("/continue-watching", movieController.getContinueWatching);

// Recommendations
router.get("/recommendations", movieController.getRecommendations);

// TV Show specific routes
router.get("/tv-show/:id/seasons", movieController.getTVShowSeasons);
router.get(
  "/tv-show/:id/season/:seasonNumber",
  movieController.getSeasonDetails
);
router.get(
  "/tv-show/:id/season/:seasonNumber/episode/:episodeNumber",
  movieController.getEpisodeDetails
);
router.post(
  "/tv-show/:id/season/:seasonNumber/episode/:episodeNumber/watch-history",
  movieController.recordEpisodeWatchHistory
);

// Admin routes (require admin privileges)
router.use("/admin", isAdmin);

// Content management for admin
router.post("/admin/content", movieController.createContent);
router.put("/admin/content/:id", movieController.updateContent);
router.delete("/admin/content/:id", movieController.deleteContent);

// Media uploads
router.post("/admin/content/:id/poster", movieController.uploadPosterImage);
router.post("/admin/content/:id/backdrop", movieController.uploadBackdropImage);
router.post("/admin/content/:id/trailer", movieController.uploadTrailer);
router.post("/admin/content/:id/video", movieController.uploadVideo);

// TV Show management
router.post("/admin/content/:id/seasons", movieController.createSeason);
router.post("/admin/seasons/:id/poster", movieController.uploadSeasonPoster);
router.post("/admin/seasons/:id/episodes", movieController.createEpisode);
router.post(
  "/admin/episodes/:id/thumbnail",
  movieController.uploadEpisodeThumbnail
);
router.post("/admin/episodes/:id/video", movieController.uploadEpisodeVideo);

// Content relationships
router.put("/admin/content/:id/genres", movieController.updateContentGenres);
router.put("/admin/content/:id/cast", movieController.updateContentCast);

export default router;
