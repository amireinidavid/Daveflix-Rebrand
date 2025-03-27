import express from "express";
import {
  register,
  login,
  logout,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/profiles", protect, createProfile);
router.put("/profiles/:profileId", protect, updateProfile);
router.delete("/profiles/:profileId", protect, deleteProfile);

export default router;
