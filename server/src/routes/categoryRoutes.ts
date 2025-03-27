import express from "express";
import * as categoryController from "../controllers/categoryController";
import { authenticate } from "../middleware/auth";
import { isAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// Admin routes - protected with authentication and admin middleware
router.post("/", authenticate, isAdmin, categoryController.createCategory);
router.put("/:id", authenticate, isAdmin, categoryController.updateCategory);
router.delete("/:id", authenticate, isAdmin, categoryController.deleteCategory);
router.post(
  "/:id/content",
  authenticate,
  isAdmin,
  categoryController.addContentToCategory
);
router.delete(
  "/:id/content/:contentId",
  authenticate,
  isAdmin,
  categoryController.removeContentFromCategory
);
router.put(
  "/reorder",
  authenticate,
  isAdmin,
  categoryController.reorderCategories
);

export default router;
