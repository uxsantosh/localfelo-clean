// =====================================================
// HELPER TASK CATEGORIES - UPDATED TO MATCH NEW 22 CATEGORIES
// This file is now deprecated - use /services/serviceCategories.ts instead
// =====================================================

import { SERVICE_CATEGORIES } from '../services/serviceCategories';

// Distance options for helper mode (in kilometers)
export const DISTANCE_OPTIONS = [1, 3, 5, 10, 25, 50, 100];

// Map new categories to old format for backward compatibility (adds 'slug' and 'subSkills' properties)
export const HELPER_CATEGORIES = SERVICE_CATEGORIES.map(cat => ({
  ...cat,
  slug: cat.id, // Map 'id' to 'slug' for backward compatibility
  subSkills: cat.subcategories.map(sub => sub.name), // Map 'subcategories' to 'subSkills' (array of strings)
}));

// Also export as HELPER_TASK_CATEGORIES with same mapping
export const HELPER_TASK_CATEGORIES = SERVICE_CATEGORIES.map(cat => ({
  ...cat,
  slug: cat.id,
  subSkills: cat.subcategories.map(sub => sub.name),
}));

// Re-export from serviceCategories to maintain compatibility
export { 
  getAllServiceCategories as getHelperCategories,
  type ServiceCategory as TaskCategory,
  type ServiceSubcategory as SubSkill
} from '../services/serviceCategories';