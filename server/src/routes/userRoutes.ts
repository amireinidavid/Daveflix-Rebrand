import express from "express";
import { getUser, getWatchHistory } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// User routes
router.get("/me", getUser);
router.get("/watch-history", getWatchHistory);

export default router;
