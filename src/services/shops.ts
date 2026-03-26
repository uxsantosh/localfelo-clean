// =====================================================
// SHOPS SERVICE
// =====================================================
// Complete shop management for LocalFelo
// Enables local businesses to register and list products

import { supabase } from '../lib/supabaseClient';
import { getClientToken } from './authHelpers';

// =====================================================
// TYPES
// =====================================================

export interface Shop {
  id: string;
  user_id: string;
  shop_name: string;
  address: string;
  latitude: number;
  longitude: number;
  logo_url: string | null;
  shop_image_url: string | null; // ✅ Deprecated: Use shop_images array instead
  shop_images: string[] | null; // ✅ NEW: Multiple shop display images
  gallery_images: string[];
  whatsapp_number: string | null;
  week_timings: any[] | null; // ✅ NEW: Weekly opening/closing hours
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopCategory {
  id: string;
  shop_id: string;
  category_id: string;
  subcategory_id: string | null;
  created_at: string;
}

export interface ShopProduct {
  id: string;
  shop_id: string;
  product_name: string;
  price: number;
  images: string[];
  category?: string | null; // ✅ NEW: User-created category
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopWithCategories extends Shop {
  categories: Array<{
    category_id: string;
    subcategory_id: string | null;
    category_name?: string; // ✅ For display
    subcategory_name?: string; // ✅ For display
  }>;
  products_count?: number;
  distance_km?: number;
}

export interface ShopWithProducts extends ShopWithCategories {
  products: ShopProduct[];
}

// =====================================================
// CREATE SHOP
// =====================================================

export async function createShop(data: {
  shop_name: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: Array<{ category_id: string; subcategory_id?: string }>;
  logo_url?: string;
  shop_image_url?: string; // ✅ Deprecated: Use shop_images array instead
  shop_images?: string[]; // ✅ NEW: Multiple shop display images
  whatsapp_number?: string;
  week_timings?: any[]; // ✅ NEW
}): Promise<{ success: boolean; shop_id?: string; error?: string }> {
  try {
    const token = await getClientToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user from localStorage (LocalFelo uses x-client-token, not Supabase Auth)
    const userDataStr = localStorage.getItem('oldcycle_user');
    if (!userDataStr) {
      return { success: false, error: 'Authentication required' };
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id;
    
    if (!userId) {
      return { success: false, error: 'Invalid authentication' };
    }

    // Create shop
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .insert({
        user_id: userId,
        shop_name: data.shop_name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        logo_url: data.logo_url || null,
        shop_image_url: data.shop_image_url || null, // ✅ Deprecated: Use shop_images array instead
        shop_images: data.shop_images || null, // ✅ NEW: Multiple shop display images
        whatsapp_number: data.whatsapp_number || null,
        gallery_images: [],
        week_timings: data.week_timings || null, // ✅ NEW
        is_active: true,
      })
      .select()
      .single();

    if (shopError) {
      console.error('Error creating shop:', shopError);
      return { success: false, error: shopError.message };
    }

    // Add categories
    if (data.categories.length > 0) {
      const categoryInserts = data.categories.map(cat => ({
        shop_id: shop.id,
        category_id: cat.category_id,
        subcategory_id: cat.subcategory_id || null,
      }));

      const { error: catError } = await supabase
        .from('shop_categories')
        .insert(categoryInserts);

      if (catError) {
        console.error('Error adding categories:', catError);
        // Shop created but categories failed - still return success
      }
    }

    return { success: true, shop_id: shop.id };
  } catch (error: any) {
    console.error('Error creating shop:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// GET ALL SHOPS (with filters)
// =====================================================

export async function getAllShops(filters?: {
  category_id?: string;
  subcategory_id?: string;
  user_latitude?: number;
  user_longitude?: number;
  max_distance_km?: number;
}): Promise<{ success: boolean; shops?: ShopWithCategories[]; error?: string }> {
  try {
    let query = supabase
      .from('shops')
      .select(`
        *,
        shop_categories (
          category_id,
          subcategory_id
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching shops:', error);
      return { success: false, error: error.message };
    }

    let shops: ShopWithCategories[] = (data || []).map(shop => ({
      ...shop,
      categories: shop.shop_categories || [],
    }));

    // Filter by category if provided
    if (filters?.category_id) {
      shops = shops.filter(shop =>
        shop.categories.some(cat => cat.category_id === filters.category_id)
      );
    }

    // Filter by subcategory if provided
    if (filters?.subcategory_id) {
      shops = shops.filter(shop =>
        shop.categories.some(cat => cat.subcategory_id === filters.subcategory_id)
      );
    }

    // Calculate distance if user location provided
    if (filters?.user_latitude && filters?.user_longitude) {
      shops = shops.map(shop => ({
        ...shop,
        distance_km: calculateDistance(
          filters.user_latitude!,
          filters.user_longitude!,
          shop.latitude,
          shop.longitude
        ),
      }));

      // Filter by max distance if provided
      if (filters.max_distance_km) {
        shops = shops.filter(shop => 
          shop.distance_km !== undefined && shop.distance_km <= filters.max_distance_km!
        );
      }

      // Sort by distance
      shops.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    }

    return { success: true, shops };
  } catch (error: any) {
    console.error('Error fetching shops:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// GET SHOP BY ID
// =====================================================

export async function getShopById(shopId: string): Promise<{ 
  success: boolean; 
  shop?: ShopWithProducts; 
  error?: string 
}> {
  try {
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select(`
        *,
        shop_categories (
          category_id,
          subcategory_id
        )
      `)
      .eq('id', shopId)
      .eq('is_active', true)
      .single();

    if (shopError) {
      console.error('Error fetching shop:', shopError);
      return { success: false, error: shopError.message };
    }

    // Get products
    const { data: products, error: productsError } = await supabase
      .from('shop_products')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return { success: false, error: productsError.message };
    }

    const shopWithProducts: ShopWithProducts = {
      ...shop,
      categories: shop.shop_categories || [],
      products: products || [],
    };

    return { success: true, shop: shopWithProducts };
  } catch (error: any) {
    console.error('Error fetching shop:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// GET USER'S SHOPS
// =====================================================

export async function getUserShops(): Promise<{ 
  success: boolean; 
  shops?: ShopWithCategories[]; 
  error?: string 
}> {
  try {
    const token = await getClientToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user from localStorage (LocalFelo uses x-client-token, not Supabase Auth)
    const userDataStr = localStorage.getItem('oldcycle_user');
    if (!userDataStr) {
      return { success: false, error: 'Authentication required' };
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id;
    
    if (!userId) {
      return { success: false, error: 'Invalid authentication' };
    }

    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        shop_categories (
          category_id,
          subcategory_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user shops:', error);
      return { success: false, error: error.message };
    }

    // Get product counts for each shop
    const shopsWithCounts = await Promise.all(
      (data || []).map(async (shop) => {
        const { count } = await supabase
          .from('shop_products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shop.id)
          .eq('is_active', true);

        return {
          ...shop,
          categories: shop.shop_categories || [],
          products_count: count || 0,
        };
      })
    );

    return { success: true, shops: shopsWithCounts };
  } catch (error: any) {
    console.error('Error fetching user shops:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// UPDATE SHOP
// =====================================================

export async function updateShop(
  shopId: string,
  updates: Partial<{
    shop_name: string;
    address: string;
    latitude: number;
    longitude: number;
    logo_url: string;
    shop_images: string[]; // ✅ NEW: Multiple shop images
    gallery_images: string[];
    whatsapp_number: string;
    week_timings: any[]; // ✅ NEW
    is_active: boolean;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getClientToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('shops')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', shopId);

    if (error) {
      console.error('Error updating shop:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating shop:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// ADD PRODUCT
// =====================================================

export async function addProduct(data: {
  shop_id: string;
  product_name: string;
  price: number;
  images: string[];
  category?: string | null; // ✅ NEW: User-created category
}): Promise<{ success: boolean; product_id?: string; error?: string }> {
  try {
    const token = await getClientToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const { data: product, error } = await supabase
      .from('shop_products')
      .insert({
        shop_id: data.shop_id,
        product_name: data.product_name,
        price: data.price,
        images: data.images.slice(0, 2), // Max 2 images
        category: data.category || null, // ✅ NEW: User-created category
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }

    return { success: true, product_id: product.id };
  } catch (error: any) {
    console.error('Error adding product:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// UPDATE PRODUCT
// =====================================================

export async function updateProduct(
  productId: string,
  updates: Partial<{
    product_name: string;
    price: number;
    images: string[];
    category: string | null;
    is_active: boolean;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getClientToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('shop_products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// DELETE PRODUCT
// =====================================================

export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getClientToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('shop_products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// HELPER: Calculate Distance
// =====================================================

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

// =====================================================
// GET SHOPS BY CATEGORY (for SEO pages)
// =====================================================

export async function getShopsByCategory(
  categoryId: string,
  subcategoryId?: string
): Promise<{ success: boolean; shops?: ShopWithCategories[]; error?: string }> {
  return getAllShops({
    category_id: categoryId,
    subcategory_id: subcategoryId,
  });
}

// =====================================================
// DELETE SHOP
// =====================================================

export async function deleteShop(shopId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getClientToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user from localStorage (LocalFelo uses x-client-token, not Supabase Auth)
    const userDataStr = localStorage.getItem('oldcycle_user');
    if (!userDataStr) {
      return { success: false, error: 'Authentication required' };
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id;
    
    if (!userId) {
      return { success: false, error: 'Invalid authentication' };
    }

    // Verify ownership
    const { data: shop, error: fetchError } = await supabase
      .from('shops')
      .select('user_id')
      .eq('id', shopId)
      .single();

    if (fetchError || !shop) {
      return { success: false, error: 'Shop not found' };
    }

    if (shop.user_id !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete shop (this will cascade delete products and categories if DB is set up correctly)
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (error) {
      console.error('Error deleting shop:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting shop:', error);
    return { success: false, error: error.message };
  }
}