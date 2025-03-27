import { create } from "zustand";
import axios from "axios";
import { API_ROUTES } from "../utils/api";

// Define types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  content?: Content[];
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  posterImage: string;
  // Add other content properties as needed
}

export interface CategoryOrder {
  id: string;
  displayOrder: number;
}

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  fetchCategoryBySlug: (slug: string) => Promise<void>;
  createCategory: (category: Partial<Category>) => Promise<Category | null>;
  updateCategory: (
    id: string,
    category: Partial<Category>
  ) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  addContentToCategory: (
    categoryId: string,
    contentIds: string[]
  ) => Promise<Category | null>;
  removeContentFromCategory: (
    categoryId: string,
    contentId: string
  ) => Promise<boolean>;
  reorderCategories: (categoryOrders: CategoryOrder[]) => Promise<Category[]>;
  clearError: () => void;
}

const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  // Fetch all categories
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_ROUTES.CATEGORIES.ALL);
      if (response.data.success) {
        set({ categories: response.data.data, isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
        isLoading: false,
      });
    }
  },

  // Fetch category by ID
  fetchCategoryById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_ROUTES.CATEGORIES.BY_ID(id));
      if (response.data.success) {
        set({ currentCategory: response.data.data, isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch category",
        isLoading: false,
      });
    }
  },

  // Fetch category by slug
  fetchCategoryBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_ROUTES.CATEGORIES.BY_SLUG(slug));
      if (response.data.success) {
        set({ currentCategory: response.data.data, isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch category",
        isLoading: false,
      });
    }
  },

  // Create a new category (admin only)
  createCategory: async (category: Partial<Category>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        API_ROUTES.ADMIN.CATEGORIES.CREATE,
        category
      );
      if (response.data.success) {
        const newCategory = response.data.data;
        set((state) => ({
          categories: [...state.categories, newCategory],
          isLoading: false,
        }));
        return newCategory;
      } else {
        set({ error: response.data.message, isLoading: false });
        return null;
      }
    } catch (error) {
      console.error("Error creating category:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to create category",
        isLoading: false,
      });
      return null;
    }
  },

  // Update a category (admin only)
  updateCategory: async (id: string, category: Partial<Category>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        API_ROUTES.ADMIN.CATEGORIES.UPDATE(id),
        category
      );
      if (response.data.success) {
        const updatedCategory = response.data.data;
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? updatedCategory : cat
          ),
          currentCategory:
            state.currentCategory?.id === id
              ? updatedCategory
              : state.currentCategory,
          isLoading: false,
        }));
        return updatedCategory;
      } else {
        set({ error: response.data.message, isLoading: false });
        return null;
      }
    } catch (error) {
      console.error("Error updating category:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update category",
        isLoading: false,
      });
      return null;
    }
  },

  // Delete a category (admin only)
  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(
        API_ROUTES.ADMIN.CATEGORIES.DELETE(id)
      );
      if (response.data.success) {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          currentCategory:
            state.currentCategory?.id === id ? null : state.currentCategory,
          isLoading: false,
        }));
        return true;
      } else {
        set({ error: response.data.message, isLoading: false });
        return false;
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete category",
        isLoading: false,
      });
      return false;
    }
  },

  // Add content to a category (admin only)
  addContentToCategory: async (categoryId: string, contentIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        API_ROUTES.ADMIN.CATEGORIES.ADD_CONTENT(categoryId),
        { contentIds }
      );
      if (response.data.success) {
        const updatedCategory = response.data.data;
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === categoryId ? updatedCategory : cat
          ),
          currentCategory:
            state.currentCategory?.id === categoryId
              ? updatedCategory
              : state.currentCategory,
          isLoading: false,
        }));
        return updatedCategory;
      } else {
        set({ error: response.data.message, isLoading: false });
        return null;
      }
    } catch (error) {
      console.error("Error adding content to category:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to add content to category",
        isLoading: false,
      });
      return null;
    }
  },

  // Remove content from a category (admin only)
  removeContentFromCategory: async (categoryId: string, contentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(
        API_ROUTES.ADMIN.CATEGORIES.REMOVE_CONTENT(categoryId, contentId)
      );
      if (response.data.success) {
        // Update the current category if it's the one we're modifying
        if (get().currentCategory?.id === categoryId) {
          const currentCategory = get().currentCategory;
          if (currentCategory && currentCategory.content) {
            const updatedContent = currentCategory.content.filter(
              (content) => content.id !== contentId
            );
            set({
              currentCategory: { ...currentCategory, content: updatedContent },
              isLoading: false,
            });
          }
        }
        return true;
      } else {
        set({ error: response.data.message, isLoading: false });
        return false;
      }
    } catch (error) {
      console.error("Error removing content from category:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove content from category",
        isLoading: false,
      });
      return false;
    }
  },

  // Reorder categories (admin only)
  reorderCategories: async (categoryOrders: CategoryOrder[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(API_ROUTES.ADMIN.CATEGORIES.REORDER, {
        categoryOrders,
      });
      if (response.data.success) {
        const updatedCategories = response.data.data;
        set({ categories: updatedCategories, isLoading: false });
        return updatedCategories;
      } else {
        set({ error: response.data.message, isLoading: false });
        return [];
      }
    } catch (error) {
      console.error("Error reordering categories:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to reorder categories",
        isLoading: false,
      });
      return [];
    }
  },

  // Clear any errors
  clearError: () => set({ error: null }),
}));

export default useCategoryStore;
