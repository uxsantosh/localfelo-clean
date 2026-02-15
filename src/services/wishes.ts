// =====================================================
// Wishes Service - "Wish Anything" Feature
// Users post what they're looking for
// =====================================================

import { supabase, IS_OFFLINE_MODE } from '../lib/supabaseClient';
import { Wish, CreateWishData } from '../types';
import { getClientToken, getOwnerToken, getCurrentUser } from './auth';
import { categorizeWish } from './aiCategorization';

// Mock data fallback for when Supabase is not available
const MOCK_WISHES: Wish[] = [
  {
    id: '1',
    title: 'Looking for iPhone 13 Pro',
    description: 'Need a used iPhone 13 Pro in good condition. Budget flexible for the right deal.',
    categoryId: '1',
    categoryName: 'Electronics',
    categoryEmoji: '📱',
    cityId: '1',
    cityName: 'Mumbai',
    areaId: '1',
    areaName: 'Andheri',
    budgetMin: 40000,
    budgetMax: 50000,
    urgency: 'flexible',
    status: 'open',
    phone: '',
    whatsapp: '',
    hasWhatsapp: false,
    userId: 'mock-user-1',
    userName: 'Rahul S.',
    createdAt: new Date().toISOString(),
    isHidden: false,
    latitude: 19.1136,
    longitude: 72.8697,
  },
  {
    id: '2',
    title: 'Need a laptop for coding',
    description: 'Looking for a laptop with at least 16GB RAM and SSD. Prefer ThinkPad or Dell.',
    categoryId: '1',
    categoryName: 'Electronics',
    categoryEmoji: '💻',
    cityId: '1',
    cityName: 'Mumbai',
    areaId: '2',
    areaName: 'Bandra',
    budgetMin: 30000,
    budgetMax: 45000,
    urgency: 'flexible',
    status: 'open',
    phone: '',
    whatsapp: '',
    hasWhatsapp: false,
    userId: 'mock-user-2',
    userName: 'Priya M.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isHidden: false,
    latitude: 19.0596,
    longitude: 72.8295,
  },
];

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get user's active wishes (wishes they are helping with)
 */
export async function getUserActiveWishes(userId: string): Promise<Wish[]> {
  try {
    // Get wishes directly from database without using getWishes (which filters out user's own wishes)
    const { data, error } = await supabase
      .from('wishes')
      .select(`
        *,
        categories:category_id(name, emoji),
        cities:city_id(name),
        areas:area_id(name),
        profiles(name)
      `)
      .eq('is_hidden', false)
      .or(`user_id.eq.${userId},accepted_by.eq.${userId}`)
      .in('status', ['accepted', 'in_progress', 'negotiating'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch active wishes:', error);
      return [];
    }

    return (data || []).map((wish: any) => ({
      id: wish.id,
      title: wish.title,
      description: wish.description,
      categoryId: wish.category_id,
      categoryName: wish.categories?.name || 'Unknown',
      categoryEmoji: wish.categories?.emoji || '❤️',
      cityId: wish.city_id,
      cityName: wish.cities?.name || 'Unknown',
      areaId: wish.area_id,
      areaName: wish.areas?.name || 'Unknown',
      budgetMin: wish.budget_min,
      budgetMax: wish.budget_max,
      urgency: wish.urgency || 'flexible',
      status: wish.status || 'open',
      phone: wish.phone || '',
      whatsapp: wish.whatsapp,
      hasWhatsapp: wish.has_whatsapp,
      userId: wish.user_id,
      userName: wish.profiles?.name || 'User',
      createdAt: wish.created_at,
      isHidden: wish.is_hidden,
      exactLocation: wish.exact_location,
      latitude: wish.latitude,
      longitude: wish.longitude,
      acceptedBy: wish.accepted_by,
      acceptedAt: wish.accepted_at,
      acceptedPrice: wish.accepted_price,
    }));
  } catch (error) {
    console.error('Exception in getUserActiveWishes:', error);
    return [];
  }
}

/**
 * Get all wishes (with filters and helper preferences)
 */
export async function getWishes(filters?: {
  categoryId?: string;
  cityId?: string;
  areaId?: string;
  searchQuery?: string;
  status?: string;
  helperPreferences?: string[]
;
  showAll?: boolean;
  userLat?: number;
  userLon?: number;
}): Promise<Wish[]> {
  try {
    const currentUser = getCurrentUser();
    
    let query = supabase
      .from('wishes')
      .select(`
        *,
        categories:category_id(name, emoji),
        cities:city_id(name),
        areas:area_id(name, latitude, longitude),
        profiles(name)
      `)
      .eq('is_hidden', false);

    // Exclude current user's own wishes (show only others' wishes)
    if (currentUser?.id) {
      query = query.neq('user_id', currentUser.id);
    }

    // Apply filters
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    // Location filtering - DON'T apply any location filters
    // We're using distance-based sorting now instead of city/area filtering
    // All wishes are shown globally, sorted by distance from user
    
    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      // By default, only show open wishes in public feed
      // Hide accepted, in_progress, completed, and closed wishes (they're in Active Wishes for involved parties)
      query = query.eq('status', 'open');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch wishes:', error);
      console.log('⚠️ Using mock wishes data as fallback');
      return MOCK_WISHES;
    }

    console.log(`✅ [getWishes] Fetched ${data?.length || 0} wishes from database`);
    
    if (!data || data.length === 0) {
      console.log('ℹ️ [getWishes] No wishes found in database - returning empty array');
      if (currentUser?.id) {
        console.log('💡 Note: Your own wishes are filtered out from this view. Check "My Wishes" to see wishes you created.');
      }
      return [];
    }

    // Transform data and calculate distances
    let wishes = (data || []).map((wish: any) => {
      const wishObj: Wish = {
        id: wish.id,
        title: wish.title,
        description: wish.description,
        categoryId: wish.category_id,
        categoryName: wish.categories?.name || 'Unknown',
        categoryEmoji: wish.categories?.emoji || '✨',
        cityId: wish.city_id,
        cityName: wish.cities?.name || 'Unknown',
        areaId: wish.area_id,
        areaName: wish.areas?.name || 'Unknown',
        budgetMin: wish.budget_min,
        budgetMax: wish.budget_max,
        urgency: wish.urgency || 'flexible',
        phone: wish.phone || '',
        whatsapp: wish.whatsapp,
        hasWhatsapp: wish.has_whatsapp,
        userId: wish.user_id,
        userName: 'User',
        createdAt: wish.created_at,
        isHidden: wish.is_hidden,
        latitude: wish.latitude,
        longitude: wish.longitude,
        status: wish.status || 'open',
        exactLocation: wish.exact_location,
        acceptedBy: wish.accepted_by,
        acceptedAt: wish.accepted_at,
        acceptedPrice: wish.accepted_price,
      };

      // Calculate distance if user location provided and wish has coordinates
      if (filters?.userLat && filters?.userLon) {
        // Use wish's GPS coordinates if available, otherwise fallback to area coordinates
        let wishLat = wish.latitude;
        let wishLon = wish.longitude;
        
        // FALLBACK: Use area coordinates if wish doesn't have GPS coordinates
        if (!wishLat || !wishLon) {
          wishLat = wish.areas?.latitude;
          wishLon = wish.areas?.longitude;
          if (wishLat && wishLon) {
            console.log(`📍 Using area coordinates for wish "${wish.title}"`);
          }
        }
        
        if (wishLat && wishLon) {
          wishObj.distance = calculateDistance(
            filters.userLat,
            filters.userLon,
            wishLat,
            wishLon
          );
          console.log(`✅ DISTANCE CALCULATED for wish "${wish.title}": ${wishObj.distance?.toFixed(1)} km`);
        } else {
          console.log(`⚠️ No distance for wish "${wish.title}" - no GPS or area coordinates available`);
        }
      }

      return wishObj;
    });

    // Filter by helper preferences if provided and not showing all
    if (filters?.helperPreferences && filters.helperPreferences.length > 0 && !filters.showAll) {
      wishes = wishes.filter(wish => {
        // If wish has a helper_category, check if it matches preferences
        const helperCategory = (wish as any).helper_category;
        if (helperCategory) {
          return filters.helperPreferences!.includes(helperCategory);
        }
        return false;
      });
    }

    // Sort by distance if coordinates provided, otherwise by created_at
    if (filters?.userLat && filters?.userLon) {
      wishes.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
      });
    } else {
      wishes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return wishes;
  } catch (error) {
    console.error('Exception in getWishes:', error);
    return [];
  }
}

/**
 * Get a single wish by ID
 */
export async function getWishById(
  id: string,
  userLat?: number,
  userLon?: number
): Promise<Wish | null> {
  try {
    // Don't filter by is_hidden for detail view - user might be viewing their own hidden wish
    const { data, error } = await supabase
      .from('wishes')
      .select(`
        *,
        categories(name, emoji),
        cities(name),
        areas(name, latitude, longitude),
        profiles(name)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch wish:', error);
      return null;
    }

    const wishObj: Wish = {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      categoryName: data.categories?.name || 'Unknown',
      categoryEmoji: data.categories?.emoji || '✨',
      cityId: data.city_id,
      cityName: data.cities?.name || 'Unknown',
      areaId: data.area_id,
      areaName: data.areas?.name || 'Unknown',
      budgetMin: data.budget_min,
      budgetMax: data.budget_max,
      urgency: data.urgency || 'flexible',
      phone: data.phone || '',
      whatsapp: data.whatsapp,
      hasWhatsapp: data.has_whatsapp,
      userId: data.user_id,
      userName: data.profiles?.name || 'User',
      userAvatar: undefined,
      createdAt: data.created_at,
      isHidden: data.is_hidden,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status || 'open',
      exactLocation: data.exact_location,
      acceptedBy: data.accepted_by,
      acceptedAt: data.accepted_at,
      acceptedPrice: data.accepted_price,
    };

    // Calculate distance if user location provided and wish has coordinates
    if (userLat && userLon && data.latitude && data.longitude) {
      wishObj.distance = calculateDistance(userLat, userLon, data.latitude, data.longitude);
      console.log(`📍 [WishService] Wish distance: ${wishObj.distance.toFixed(2)} km`);
    }

    return wishObj;
  } catch (error) {
    console.error('Exception in getWishById:', error);
    return null;
  }
}

/**
 * Create a new wish
 */
export async function createWish(wishData: CreateWishData): Promise<{ success: boolean; wishId?: string; error?: string }> {
  try {
    const clientToken = getClientToken();
    const ownerToken = await getOwnerToken();

    if (!clientToken || !ownerToken) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('wishes')
      .insert({
        title: wishData.title,
        description: wishData.description,
        category_id: wishData.categoryId,
        city_id: wishData.cityId,
        area_id: wishData.areaId || null,
        budget_min: wishData.budgetMin,
        budget_max: wishData.budgetMax,
        urgency: wishData.urgency,
        phone: wishData.phone || '',
        whatsapp: wishData.whatsapp || '',
        has_whatsapp: wishData.hasWhatsapp,
        user_id: currentUser.id,
        exact_location: wishData.exactLocation,
        latitude: wishData.latitude,
        longitude: wishData.longitude,
        address: wishData.address || null,
        client_token: clientToken,
        owner_token: ownerToken,
        is_hidden: false,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create wish:', error);
      return { success: false, error: error.message };
    }

    return { success: true, wishId: data.id };
  } catch (error) {
    console.error('Exception in createWish:', error);
    return { success: false, error: 'Failed to create wish' };
  }
}

/**
 * Edit an existing wish
 * Only creator can edit, and only before it's accepted
 */
export async function editWish(
  wishId: string,
  wishData: Partial<CreateWishData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = getCurrentUser();
    const ownerToken = await getOwnerToken();

    if (!currentUser || !ownerToken) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get wish to verify ownership and status
    const { data: wish, error: fetchError } = await supabase
      .from('wishes')
      .select('user_id, status')
      .eq('id', wishId)
      .single();

    if (fetchError || !wish) {
      return { success: false, error: 'Wish not found' };
    }

    // Only creator can edit
    if (wish.user_id !== currentUser.id) {
      return { success: false, error: 'Only the wish creator can edit this wish' };
    }

    // Can't edit if already accepted or fulfilled
    if (wish.status !== 'open' && wish.status !== 'negotiating') {
      return { success: false, error: 'Cannot edit wish after it has been accepted' };
    }

    // Build update object with only provided fields
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (wishData.title !== undefined) updates.title = wishData.title;
    if (wishData.description !== undefined) updates.description = wishData.description;
    if (wishData.categoryId !== undefined) updates.category_id = wishData.categoryId;
    if (wishData.budgetMin !== undefined) updates.budget_min = wishData.budgetMin;
    if (wishData.budgetMax !== undefined) updates.budget_max = wishData.budgetMax;
    if (wishData.urgency !== undefined) updates.urgency = wishData.urgency;
    if (wishData.cityId !== undefined) updates.city_id = wishData.cityId;
    if (wishData.areaId !== undefined) updates.area_id = wishData.areaId || null;
    if (wishData.phone !== undefined) updates.phone = wishData.phone;
    if (wishData.whatsapp !== undefined) updates.whatsapp = wishData.whatsapp;
    if (wishData.hasWhatsapp !== undefined) updates.has_whatsapp = wishData.hasWhatsapp;
    if (wishData.exactLocation !== undefined) updates.exact_location = wishData.exactLocation;
    if (wishData.latitude !== undefined) updates.latitude = wishData.latitude;
    if (wishData.longitude !== undefined) updates.longitude = wishData.longitude;

    const { error } = await supabase
      .from('wishes')
      .update(updates)
      .eq('id', wishId)
      .eq('owner_token', ownerToken);

    if (error) {
      console.error('Failed to edit wish:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in editWish:', error);
    return { success: false, error: 'Failed to edit wish' };
  }
}

/**
 * Accept wish with chat creation (atomic operation)
 */
export async function acceptWish(
  wishId: string, 
  wish: Wish,
  acceptedPrice?: number
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    const { getOrCreateConversation } = await import('./chat');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    // 1. Create chat room FIRST
    const { conversation, error: chatError } = await getOrCreateConversation(
      wishId,
      wish.title,
      undefined,
      acceptedPrice || wish.budgetMax || 0,
      wish.userId,
      wish.userName,
      wish.userAvatar
    );

    if (chatError || !conversation) {
      return { success: false, error: chatError || 'Failed to create chat' };
    }

    // 2. Update wish status to accepted with accepted price
    const { error: updateError } = await supabase
      .from('wishes')
      .update({ 
        status: 'accepted',
        accepted_by: currentUser.id,
        accepted_at: new Date().toISOString(),
        accepted_price: acceptedPrice
      })
      .eq('id', wishId);

    if (updateError) {
      console.error('Failed to update wish status:', updateError);
      return { success: false, error: 'Failed to accept wish' };
    }

    // 🆕 3. Send notification to wish owner
    try {
      const { sendWishOfferNotification } = await import('./notifications');
      await sendWishOfferNotification(
        wish.userId,
        wishId,
        wish.title,
        currentUser.name || 'Someone'
      );
      console.log('✅ Wish offer notification sent to wish owner');
    } catch (notifError) {
      console.error('⚠️ Failed to send wish offer notification:', notifError);
      // Don't fail the operation if notification fails
    }

    return { success: true, conversationId: conversation.id };
  } catch (error: any) {
    console.error('Exception in acceptWish:', error);
    return { success: false, error: error.message || 'Failed to accept wish' };
  }
}

/**
 * Update wish status
 */
export async function updateWishStatus(
  wishId: string, 
  status: string,
  changedByUserId?: string,
  changedByName?: string
): Promise<void> {
  const { error } = await supabase
    .from('wishes')
    .update({ status })
    .eq('id', wishId);

  if (error) {
    console.error('Failed to update wish status:', error);
    throw new Error('Failed to update wish status');
  }

  // 🆕 Send notification on status change
  if (changedByUserId && changedByName) {
    try {
      // Get wish details to notify relevant parties
      const { data: wish } = await supabase
        .from('wishes')
        .select('user_id, accepted_by, title')
        .eq('id', wishId)
        .single();

      if (wish) {
        const { sendWishStatusChangeNotification } = await import('./notifications');
        
        // Notify wish owner if they didn't make the change
        if (wish.user_id !== changedByUserId) {
          await sendWishStatusChangeNotification(
            wish.user_id,
            wishId,
            wish.title,
            status,
            changedByName
          );
        }
        
        // Notify helper if they didn't make the change
        if (wish.accepted_by && wish.accepted_by !== changedByUserId) {
          await sendWishStatusChangeNotification(
            wish.accepted_by,
            wishId,
            wish.title,
            status,
            changedByName
          );
        }
      }
    } catch (notifError) {
      console.error('⚠️ Failed to send wish status change notification:', notifError);
      // Don't throw - notification failure shouldn't break status update
    }
  }
}

/**
 * Get user's wishes
 */
export async function getUserWishes(userId: string): Promise<Wish[]> {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select(`
        *,
        categories:category_id(name, emoji),
        cities:city_id(name),
        areas:area_id(name),
        profiles(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user wishes:', error);
      return [];
    }

    return (data || []).map((wish: any) => ({
      id: wish.id,
      title: wish.title,
      description: wish.description,
      categoryId: wish.category_id,
      categoryName: wish.categories?.name || 'Unknown',
      categoryEmoji: wish.categories?.emoji || '✨',
      cityId: wish.city_id,
      cityName: wish.cities?.name || 'Unknown',
      areaId: wish.area_id,
      areaName: wish.areas?.name || 'Unknown',
      budgetMin: wish.budget_min,
      budgetMax: wish.budget_max,
      urgency: wish.urgency || 'flexible',
      phone: wish.phone || '',
      whatsapp: wish.whatsapp,
      hasWhatsapp: wish.has_whatsapp,
      userId: wish.user_id,
      userName: wish.profiles?.name || 'User',
      createdAt: wish.created_at,
      isHidden: wish.is_hidden,
      latitude: wish.latitude,
      longitude: wish.longitude,
      status: wish.status || 'open',
      exactLocation: wish.exact_location,
      acceptedBy: wish.accepted_by,
      acceptedAt: wish.accepted_at,
      acceptedPrice: wish.accepted_price,
    }));
  } catch (error) {
    console.error('Exception in getUserWishes:', error);
    return [];
  }
}

/**
 * Delete a wish (soft delete - hide from public view but keep in DB for history)
 */
export async function deleteWish(wishId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const ownerToken = await getOwnerToken();
    if (!ownerToken) {
      return { success: false, error: 'Not authenticated' };
    }

    // SOFT DELETE: Set status to 'deleted' and is_hidden to true
    // This keeps the wish for user's history but hides it from public view
    const { error } = await supabase
      .from('wishes')
      .update({ 
        status: 'deleted',
        is_hidden: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', wishId)
      .eq('owner_token', ownerToken);

    if (error) {
      console.error('Failed to delete wish:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [WishService] Wish soft-deleted (hidden from public view)');
    return { success: true };
  } catch (error) {
    console.error('Exception in deleteWish:', error);
    return { success: false, error: 'An error occurred' };
  }
}

/**
 * Cancel a wish (sets status to closed)
 */
export async function cancelWish(wishId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const ownerToken = await getOwnerToken();
    if (!ownerToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('wishes')
      .update({ status: 'closed', is_hidden: true })
      .eq('id', wishId)
      .eq('owner_token', ownerToken);

    if (error) {
      console.error('Failed to cancel wish:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in cancelWish:', error);
    return { success: false, error: 'Failed to cancel wish' };
  }
}

/**
 * Update a wish
 */
export async function updateWish(wishId: string, updates: Partial<{ 
  title: string; 
  description: string; 
  status: string;
  budget_max: number;
  urgency: string;
}>): Promise<{ success: boolean; error?: string }> {
  try {
    const ownerToken = await getOwnerToken();
    if (!ownerToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('wishes')
      .update(updates)
      .eq('id', wishId)
      .eq('owner_token', ownerToken);

    if (error) {
      console.error('Failed to update wish:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in updateWish:', error);
    return { success: false, error: 'Failed to update wish' };
  }
}

// =====================================================
// ADMIN FUNCTIONS
// =====================================================

/**
 * Get all wishes (admin)
 */
export async function getAllWishesAdmin(): Promise<Wish[]> {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select(`
        *,
        categories:category_id(name, emoji),
        cities:city_id(name),
        areas:area_id(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch wishes (admin):', error);
      return [];
    }

    return (data || []).map((wish: any) => ({
      id: wish.id,
      title: wish.title,
      description: wish.description,
      categoryId: wish.category_id,
      categoryName: wish.categories?.name || 'Unknown',
      categoryEmoji: wish.categories?.emoji || '✨',
      cityId: wish.city_id,
      cityName: wish.cities?.name || 'Unknown',
      areaId: wish.area_id,
      areaName: wish.areas?.name || 'Unknown',
      budgetMin: wish.budget_min,
      budgetMax: wish.budget_max,
      urgency: wish.urgency || 'flexible',
      phone: wish.phone || '',
      whatsapp: wish.whatsapp,
      hasWhatsapp: wish.has_whatsapp,
      userId: wish.user_id,
      userName: 'User',
      createdAt: wish.created_at,
      isHidden: wish.is_hidden,
      latitude: wish.latitude,
      longitude: wish.longitude,
      status: wish.status || 'open',
      exactLocation: wish.exact_location,
      acceptedBy: wish.accepted_by,
      acceptedAt: wish.accepted_at,
      acceptedPrice: wish.accepted_price,
    }));
  } catch (error) {
    console.error('Exception in getAllWishesAdmin:', error);
    return [];
  }
}

/**
 * Close a wish (admin)
 */
export async function closeWishAdmin(wishId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('wishes')
      .update({ status: 'expired', is_hidden: true })
      .eq('id', wishId);

    if (error) {
      console.error('Failed to close wish (admin):', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in closeWishAdmin:', error);
    return { success: false, error: 'Failed to close wish' };
  }
}