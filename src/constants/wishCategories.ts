// LocalFelo Wish Categories - Using Task Categories
// Wishes now use the SAME helper categories as Tasks for consistency

// Import task categories to reuse them
import { TASK_CATEGORIES, TaskCategory, TaskSubcategory } from '../services/taskCategories';

// Re-export task categories as wish categories
export const WISH_CATEGORIES = TASK_CATEGORIES;

export type WishCategory = TaskCategory;
export type WishSubcategory = TaskSubcategory;

// Helper functions (re-exported from taskCategories)
export { 
  getAllTaskCategories as getAllWishCategories,
  getTaskCategoryById as getWishCategoryById,
  getTaskSubcategoriesByCategoryId as getWishSubcategoriesByCategoryId,
  getTaskCategoryEmojiById as getWishCategoryEmojiById,
  getTaskCategoryNameById as getWishCategoryNameById,
  getTaskSubcategoryName as getWishSubcategoryName,
  getPriorityTaskCategories as getPriorityWishCategories,
  searchTaskCategories as searchWishCategories
} from '../services/taskCategories';