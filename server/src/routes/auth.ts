import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  createProfile,
  updateProfile,
  deleteProfile,
  setActiveProfile,
  deleteAccount,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);

// Profile management routes
router.post("/profiles", protect, createProfile);
router.put("/profiles/:profileId", protect, updateProfile);
router.delete("/profiles/:profileId", protect, deleteProfile);
router.post("/profiles/:profileId/activate", protect, setActiveProfile);

// Account management
router.delete("/account", protect, deleteAccount);

export default router;
