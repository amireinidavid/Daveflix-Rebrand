"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowUpDown, 
  Loader2, 
  Grid, 
  List, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCategoryStore, { Category } from '@/store/useCategoryStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const AdminCategoriesPage = () => {
  const router = useRouter();
  const { 
    categories, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    reorderCategories,
    isLoading, 
    error 
  } = useCategoryStore();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    isActive: true
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      name,
      slug: generateSlug(name)
    }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      isActive: true
    });
  };

  // Open add dialog
  const openAddDialog = () => {
    resetFormData();
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      isActive: category.isActive
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle add category
  const handleAddCategory = async () => {
    try {
      if (!formData.name) {
        toast.error('Category name is required');
        return;
      }

      const result = await createCategory({
        name: formData.name,
        description: formData.description || null,
        slug: formData.slug,
        isActive: formData.isActive,
        displayOrder: categories.length + 1
      });

      if (result) {
        toast.success('Category created successfully');
        setIsAddDialogOpen(false);
        resetFormData();
      }
    } catch (error) {
      toast.error('Failed to create category');
      console.error(error);
    }
  };

  // Handle edit category
  const handleEditCategory = async () => {
    try {
      if (!currentCategory || !formData.name) {
        toast.error('Category name is required');
        return;
      }

      const result = await updateCategory(currentCategory.id, {
        name: formData.name,
        description: formData.description || null,
        slug: formData.slug,
        isActive: formData.isActive
      });

      if (result) {
        toast.success('Category updated successfully');
        setIsEditDialogOpen(false);
        resetFormData();
      }
    } catch (error) {
      toast.error('Failed to update category');
      console.error(error);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    try {
      if (!currentCategory) return;

      const result = await deleteCategory(currentCategory.id);

      if (result) {
        toast.success('Category deleted successfully');
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to delete category');
      console.error(error);
    }
  };

  // Handle reorder
  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) return;

    const newCategories = [...categories];
    
    if (direction === 'up' && categoryIndex > 0) {
      // Swap with the category above
      [newCategories[categoryIndex], newCategories[categoryIndex - 1]] = 
      [newCategories[categoryIndex - 1], newCategories[categoryIndex]];
    } else if (direction === 'down' && categoryIndex < categories.length - 1) {
      // Swap with the category below
      [newCategories[categoryIndex], newCategories[categoryIndex + 1]] = 
      [newCategories[categoryIndex + 1], newCategories[categoryIndex]];
    } else {
      return; // No change needed
    }

    // Update display orders
    const categoryOrders = newCategories.map((cat, index) => ({
      id: cat.id,
      displayOrder: index + 1
    }));

    try {
      await reorderCategories(categoryOrders);
      toast.success('Categories reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder categories');
      console.error(error);
    }
  };

  // Toggle reordering mode
  const toggleReordering = () => {
    setIsReordering(!isReordering);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage content categories for your streaming platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openAddDialog} className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add Category</span>
            </Button>
            <Button 
              variant={isReordering ? "secondary" : "outline"} 
              onClick={toggleReordering}
              className="flex items-center gap-2"
            >
              <ArrowUpDown size={16} />
              <span>{isReordering ? "Done" : "Reorder"}</span>
            </Button>
          </div>
        </div>

        {/* Search and view options */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Categories list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No categories found</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm ? "Try adjusting your search term" : "Create your first category to get started"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">{category.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {category.description || "No description"}
                              </p>
                            </div>
                            {!isReordering ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => router.push(`/categories/${category.slug}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteDialog(category)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleMoveCategory(category.id, 'up')}
                                  disabled={categories.indexOf(category) === 0}
                                >
                                  <ChevronUp size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleMoveCategory(category.id, 'down')}
                                  disabled={categories.indexOf(category) === categories.length - 1}
                                >
                                  <ChevronDown size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <Badge variant={category.isActive ? "default" : "outline"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Order: {category.displayOrder}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm">
                  <div className="col-span-5 md:col-span-4">Name</div>
                  <div className="col-span-4 hidden md:block">Description</div>
                  <div className="col-span-3 md:col-span-2">Status</div>
                  <div className="col-span-2 md:col-span-1">Order</div>
                  <div className="col-span-2 md:col-span-1 text-right">Actions</div>
                </div>
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`grid grid-cols-12 gap-4 p-4 items-center ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <div className="col-span-5 md:col-span-4 font-medium truncate">
                      {category.name}
                    </div>
                    <div className="col-span-4 hidden md:block text-muted-foreground truncate">
                      {category.description || "No description"}
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <Badge variant={category.isActive ? "default" : "outline"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="col-span-2 md:col-span-1 text-muted-foreground">
                      {category.displayOrder}
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      {!isReordering ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/categories/${category.slug}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(category)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveCategory(category.id, 'up')}
                            disabled={categories.indexOf(category) === 0}
                          >
                            <ChevronUp size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveCategory(category.id, 'down')}
                            disabled={categories.indexOf(category) === categories.length - 1}
                          >
                            <ChevronDown size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing your content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Category name"
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="category-slug"
                value={formData.slug}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs. Auto-generated from name if left empty.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of this category"
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive" className="cursor-pointer">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details for this category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Category name"
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                name="slug"
                placeholder="category-slug"
                value={formData.slug}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs. Auto-generated from name if left empty.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Brief description of this category"
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isActive" className="cursor-pointer">Active Status</Label>
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">{currentCategory?.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {currentCategory?.description || "No description"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategoriesPage;
