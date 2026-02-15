// =====================================================
// Categories Service - Dynamic category fetching
// =====================================================

import { supabase, IS_OFFLINE_MODE } from '../lib/supabaseClient';

export interface Category {
  id: string; // Changed from number to string
  name: string;
  slug: string;
  emoji: string;
  type: 'listing' | 'wish' | 'task';
  sortOrder?: number;
}

// Mock data fallback
const MOCK_MARKETPLACE_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', emoji: '📱', type: 'listing', sortOrder: 1 },
  { id: '2', name: 'Furniture', slug: 'furniture', emoji: '🛋️', type: 'listing', sortOrder: 2 },
  { id: '3', name: 'Clothing', slug: 'clothing', emoji: '👕', type: 'listing', sortOrder: 3 },
  { id: '4', name: 'Books', slug: 'books', emoji: '📚', type: 'listing', sortOrder: 4 },
  { id: '5', name: 'Sports', slug: 'sports', emoji: '⚽', type: 'listing', sortOrder: 5 },
];

const MOCK_WISH_CATEGORIES: Category[] = [
  { id: '11', name: 'Electronics', slug: 'electronics', emoji: '📱', type: 'wish', sortOrder: 1 },
  { id: '12', name: 'Furniture', slug: 'furniture', emoji: '🛋️', type: 'wish', sortOrder: 2 },
  { id: '13', name: 'Clothing', slug: 'clothing', emoji: '👕', type: 'wish', sortOrder: 3 },
  { id: '14', name: 'Books', slug: 'books', emoji: '📚', type: 'wish', sortOrder: 4 },
];

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
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'listing')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch marketplace categories:', error);
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
    console.error('Exception in getMarketplaceCategories:', error);
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
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'wish')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch wish categories:', error);
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
    console.error('Exception in getWishCategories:', error);
    return MOCK_WISH_CATEGORIES;
  }
}

/**
 * Get task categories (type='task')
 */
export async function getTaskCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'task')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch task categories:', error);
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
    console.error('Exception in getTaskCategories:', error);
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