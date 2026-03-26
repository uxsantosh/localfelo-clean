// =====================================================
// Categories Service - Dynamic category fetching
// =====================================================

import { supabase, IS_OFFLINE_MODE } from '../lib/supabaseClient';
import { PRODUCT_CATEGORIES } from './productCategories';

export interface Category {
  id: string; // Changed from number to string
  name: string;
  slug: string;
  emoji: string;
  type: 'listing' | 'wish' | 'task';
  sortOrder?: number;
}

// ✅ NEW: Generate marketplace categories from PRODUCT_CATEGORIES
const generateMarketplaceCategoriesFromProducts = (): Category[] => {
  return PRODUCT_CATEGORIES.map((cat, index) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.id, // Use ID as slug
    emoji: cat.emoji,
    type: 'listing' as const,
    sortOrder: index + 1,
  }));
};

// ✅ NEW: Generate wish categories from PRODUCT_CATEGORIES (same as marketplace)
const generateWishCategoriesFromProducts = (): Category[] => {
  return PRODUCT_CATEGORIES.map((cat, index) => ({
    id: `wish-${cat.id}`,
    name: cat.name,
    slug: cat.id,
    emoji: cat.emoji,
    type: 'wish' as const,
    sortOrder: index + 1,
  }));
};

// Mock data fallback - now auto-generated from PRODUCT_CATEGORIES
const MOCK_MARKETPLACE_CATEGORIES: Category[] = generateMarketplaceCategoriesFromProducts();

const MOCK_WISH_CATEGORIES: Category[] = generateWishCategoriesFromProducts();

const MOCK_TASK_CATEGORIES: Category[] = [
  { id: '21', name: 'Home Services', slug: 'home-services', emoji: '🏠', type: 'task', sortOrder: 1 },
  { id: '22', name: 'Delivery', slug: 'delivery', emoji: '🚚', type: 'task', sortOrder: 2 },
  { id: '23', name: 'Tutoring', slug: 'tutoring', emoji: '📖', type: 'task', sortOrder: 3 },
  { id: '24', name: 'Tech Support', slug: 'tech-support', emoji: '💻', type: 'task', sortOrder: 4 },
];

/**
 * Get marketplace categories (type='listing')
 */
export async function getMarketplaceCategories(): Promise<Category[]> {
  // Return mock data immediately in offline/preview mode
  if (IS_OFFLINE_MODE) {
    console.log('📦 [Categories] Using mock marketplace categories (offline mode)');
    return MOCK_MARKETPLACE_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'listing')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[getCategories] Error:', error);
      return MOCK_MARKETPLACE_CATEGORIES;
    }

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji || '📦',
      type: 'listing',
      sortOrder: cat.sort_order
    }));
  } catch (error) {
    console.error('[getCategories] Error:', error);
    return MOCK_MARKETPLACE_CATEGORIES;
  }
}

/**
 * Get all marketplace categories (alias for backward compatibility)
 */
export async function getAllCategories(): Promise<Category[]> {
  return getMarketplaceCategories();
}

/**
 * Get wish categories (type='wish')
 */
export async function getWishCategories(): Promise<Category[]> {
  // Return mock data immediately in offline/preview mode
  if (IS_OFFLINE_MODE) {
    console.log('✨ [Categories] Using mock wish categories (offline mode)');
    return MOCK_WISH_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'wish')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[getCategories] Error:', error);
      return MOCK_WISH_CATEGORIES;
    }

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji || '✨',
      type: 'wish',
      sortOrder: cat.sort_order
    }));
  } catch (error) {
    console.error('[getCategories] Error:', error);
    return MOCK_WISH_CATEGORIES;
  }
}

/**
 * Get task categories (type='task')
 */
export async function getTaskCategories(): Promise<Category[]> {
  // Return mock data immediately in offline/preview mode
  if (IS_OFFLINE_MODE) {
    console.log('📋 [Categories] Using mock task categories (offline mode)');
    return MOCK_TASK_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'task')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[getCategories] Error:', error);
      return MOCK_TASK_CATEGORIES;
    }

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji || '📋',
      type: 'task',
      sortOrder: cat.sort_order
    }));
  } catch (error) {
    console.error('[getCategories] Error:', error);
    return MOCK_TASK_CATEGORIES;
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string | number): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id.toString())
      .single();

    if (error || !data) {
      console.error('Failed to fetch category:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      emoji: data.emoji || '📦',
      type: data.type,
      sortOrder: data.sort_order
    };
  } catch (error) {
    console.error('Exception in getCategoryById:', error);
    return null;
  }
}

/**
 * Get category by slug and type
 */
export async function getCategoryBySlug(slug: string, type: 'listing' | 'wish' | 'task'): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('type', type)
      .single();

    if (error || !data) {
      console.error('Failed to fetch category:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      emoji: data.emoji || '📦',
      type: data.type,
      sortOrder: data.sort_order
    };
  } catch (error) {
    console.error('Exception in getCategoryBySlug:', error);
    return null;
  }
}