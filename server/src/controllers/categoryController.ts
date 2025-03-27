import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

/**
 * Get all categories
 * GET /api/categories
 */
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        content: {
          include: {
            content: true,
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Transform the response to include content items directly
    const transformedCategory = {
      ...category,
      content: category.content.map((item) => item.content),
    };

    res.status(200).json({
      success: true,
      data: transformedCategory,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get category by slug
 * GET /api/categories/slug/:slug
 */
export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        content: {
          include: {
            content: true,
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Transform the response to include content items directly
    const transformedCategory = {
      ...category,
      content: category.content.map((item) => item.content),
    };

    res.status(200).json({
      success: true,
      data: transformedCategory,
    });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create a new category
 * POST /api/admin/categories
 */
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, isActive, displayOrder } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: "Category name is required",
      });
      return;
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true });

    // Check if category with same name or slug already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder || 0,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update a category
 * PUT /api/admin/categories/:id
 */
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, isActive, displayOrder } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Generate new slug if name is changed
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = slugify(name, { lower: true });

      // Check if slug is already in use by another category
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
        return;
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        slug: slug !== existingCategory.slug ? slug : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        displayOrder: displayOrder !== undefined ? displayOrder : undefined,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a category
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Delete the category
    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add content to a category
 * POST /api/admin/categories/:id/content
 */
export const addContentToCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { contentIds } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Content IDs are required",
      });
      return;
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Check if all content items exist
    const contentCount = await prisma.content.count({
      where: {
        id: { in: contentIds },
      },
    });

    if (contentCount !== contentIds.length) {
      res.status(400).json({
        success: false,
        message: "One or more content items do not exist",
      });
      return;
    }

    // Create connections between category and content
    const operations = contentIds.map((contentId) => {
      return prisma.categoryOnContent.upsert({
        where: {
          contentId_categoryId: {
            contentId,
            categoryId: id,
          },
        },
        update: {}, // No updates needed if it exists
        create: {
          contentId,
          categoryId: id,
        },
      });
    });

    await prisma.$transaction(operations);

    // Get updated category with content
    const updatedCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        content: {
          include: {
            content: true,
          },
        },
      },
    });

    // Transform the response
    const transformedCategory = {
      ...updatedCategory,
      content: updatedCategory?.content.map((item) => item.content) || [],
    };

    res.status(200).json({
      success: true,
      message: "Content added to category successfully",
      data: transformedCategory,
    });
  } catch (error) {
    console.error("Error adding content to category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add content to category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Remove content from a category
 * DELETE /api/admin/categories/:id/content/:contentId
 */
export const removeContentFromCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, contentId } = req.params;

    // Check if the relationship exists
    const relationship = await prisma.categoryOnContent.findUnique({
      where: {
        contentId_categoryId: {
          contentId,
          categoryId: id,
        },
      },
    });

    if (!relationship) {
      res.status(404).json({
        success: false,
        message: "Content is not in this category",
      });
      return;
    }

    // Remove the relationship
    await prisma.categoryOnContent.delete({
      where: {
        contentId_categoryId: {
          contentId,
          categoryId: id,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Content removed from category successfully",
    });
  } catch (error) {
    console.error("Error removing content from category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove content from category",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Reorder category display order
 * PUT /api/admin/categories/reorder
 */
export const reorderCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryOrders } = req.body;

    if (!categoryOrders || !Array.isArray(categoryOrders)) {
      res.status(400).json({
        success: false,
        message: "Category orders are required",
      });
      return;
    }

    // Update each category's display order
    const operations = categoryOrders.map(({ id, displayOrder }) => {
      return prisma.category.update({
        where: { id },
        data: { displayOrder },
      });
    });

    await prisma.$transaction(operations);

    // Get all categories with updated order
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Categories reordered successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error reordering categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder categories",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
