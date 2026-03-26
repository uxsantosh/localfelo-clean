// =====================================================
// HELPER CATEGORIES EXPANDED - UPDATED TO MATCH NEW 22 CATEGORIES
// This file is now deprecated - use /services/serviceCategories.ts instead
// =====================================================

// Re-export from serviceCategories to maintain compatibility
import { 
  SERVICE_CATEGORIES, 
  getAllServiceCategories,
  getCategoryById,
  type ServiceCategory,
  type ServiceSubcategory
} from '../services/serviceCategories';

// Map new categories to old format for backward compatibility
export const HELPER_CATEGORIES_EXPANDED = SERVICE_CATEGORIES.map((cat, index) => ({
  id: index + 1,
  name: cat.name,
  slug: cat.id,
  emoji: cat.emoji,
  group: cat.priority === 1 ? 'priority' : 'regular',
  keywords: cat.subcategories.map(sub => sub.name.toLowerCase()),
}));

// Category groups
export const CATEGORY_GROUPS = {
  priority: { name: 'Priority Categories', icon: '⭐', color: '#CDFF00' },
  regular: { name: 'Regular Categories', icon: '📋', color: '#E5E7EB' },
} as const;

export type HelperCategoryExpanded = typeof HELPER_CATEGORIES_EXPANDED[number];
export type CategoryGroup = keyof typeof CATEGORY_GROUPS;

// Helper function to get popular categories (priority categories)
export const POPULAR_CATEGORIES = SERVICE_CATEGORIES
  .filter(cat => cat.priority === 1)
  .map(cat => cat.id);

// Get categories by group
export function getCategoriesByGroup(group: CategoryGroup) {
  return HELPER_CATEGORIES_EXPANDED.filter(cat => cat.group === group);
}

// Search categories by keyword
export function searchCategories(query: string): typeof HELPER_CATEGORIES_EXPANDED[number][] {
  const lowerQuery = query.toLowerCase().trim();
  
  return HELPER_CATEGORIES_EXPANDED.filter(cat => 
    cat.name.toLowerCase().includes(lowerQuery) ||
    cat.keywords.some(keyword => keyword.includes(lowerQuery))
  );
}

// Backward compatibility exports
export { SERVICE_CATEGORIES as ALL_CATEGORIES };
export { getAllServiceCategories };
