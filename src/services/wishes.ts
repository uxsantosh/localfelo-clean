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
  helperPreferences?: string[];
  page?: number;
  limit?: number;
  userLat?: number;
  userLon?: number;
  distance?: string;
}): Promise<{ wishes: Wish[]; totalCount: number }> {
  const limit = filters?.limit || 20;
  
  try {
    const currentUser = await getCurrentUser();
    
    // First, get total count
    let countQuery = supabase
      .from('wishes')
      .select('id', { count: 'exact', head: true })
      .eq('is_hidden', false);

    // Exclude current user's own wishes (if logged in)
    if (currentUser?.id) {
      countQuery = countQuery.neq('user_id', currentUser.id);
    }

    // Apply same filters for count (only category, search, and status - NOT city/area)
    if (filters?.categoryId) {
      countQuery = countQuery.eq('category_id', filters.categoryId);
    }
    // ✅ NEW: Product subcategory filter
    if (filters?.subcategoryId) {
      countQuery = countQuery.eq('subcategory_id', filters.subcategoryId);
    }
    // REMOVED: City and area filtering - show ALL wishes from everywhere
    // if (filters?.cityId) {
    //   countQuery = countQuery.eq('city_id', filters.cityId);
    // }
    // if (filters?.areaId) {
    //   countQuery = countQuery.eq('area_id', filters.areaId);
    // }
    if (filters?.searchQuery) {
      countQuery = countQuery.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,product_name.ilike.%${filters.searchQuery}%`);
    }
    if (filters?.status) {
      countQuery = countQuery.eq('status', filters.status);
    }

    const { count: totalCount } = await countQuery;
    
    // Now get paginated data
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
      console.log('🔍 [getWishes] Filtering out current user\'s own wishes');
    }

    // Apply filters (only category, search, and status - NOT city/area)
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    // ✅ NEW: Product subcategory filter
    if (filters?.subcategoryId) {
      query = query.eq('subcategory_id', filters.subcategoryId);
    }
    // REMOVED: City and area filtering to show ALL wishes from everywhere
    // console.log('🌍 [getWishes] Showing ALL wishes from EVERYWHERE (sorted by distance)');
    // if (filters?.cityId) {
    //   query = query.eq('city_id', filters.cityId);
    // }
    // if (filters?.areaId) {
    //   query = query.eq('area_id', filters.areaId);
    // }
    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,product_name.ilike.%${filters.searchQuery}%`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Apply ordering first, then pagination
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    const offset = ((filters?.page || 1) - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch wishes:', error);
      console.log('⚠️ Using mock wishes data as fallback');
      return { wishes: MOCK_WISHES, totalCount: MOCK_WISHES.length };
    }

    console.log(`✅ [getWishes] Fetched ${data?.length || 0} wishes from database`);
    
    if (!data || data.length === 0) {
      console.log('ℹ️ [getWishes] No wishes found in database - returning empty array');
      if (currentUser?.id) {
        console.log('💡 Note: Your own wishes are filtered out from this view. Check "My Wishes" to see wishes you created.');
      }
      return { wishes: [], totalCount: 0 };
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
    if (filters?.helperPreferences && filters.helperPreferences.length > 0) {
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

    return { wishes, totalCount };
  } catch (error) {
    console.error('Exception in getWishes:', error);
    return { wishes: [], totalCount: 0 };
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

    // NEW: Fetch user phone from profile (same as tasks)
    let userPhone = '';
    let userAvatar = '';
    if (data.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone, avatar_url')
        .eq('id', data.user_id)
        .single();
      
      if (profileData) {
        userPhone = profileData.phone || '';
        userAvatar = profileData.avatar_url || '';
        console.log('📞 [WishService] User phone fetched:', userPhone ? 'Available' : 'Not available');
      }
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
      phone: userPhone, // NEW: Use phone from profile instead of wish table
      whatsapp: data.whatsapp,
      hasWhatsapp: data.has_whatsapp,
      userId: data.user_id,
      userName: data.profiles?.name || 'User',
      userAvatar: userAvatar, // NEW: Use avatar from profile fetch
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
    const clientToken = await getClientToken();
    const ownerToken = await getOwnerToken();

    if (!clientToken || !ownerToken) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    // ✅ ROLE-BASED SYSTEM: Determine role_id from BOTH AI categorization AND user selection
    let roleId = null;
    let helperCategory = null;
    let intentType = null;
    
    // STEP 1: Try AI categorization first (for help-type wishes)
    try {
      const { categorizeWish } = await import('./aiCategorization');
      const categorization = await categorizeWish(wishData.title, wishData.description);
      
      if (categorization.isHelpRequest && categorization.helperCategory) {
        helperCategory = categorization.helperCategory;
        intentType = categorization.intentType;
        
        // Map AI helper category to role_id
        const { getRoleIdByHelperCategory } = await import('./roles');
        const roleResult = await getRoleIdByHelperCategory(helperCategory);
        
        if (roleResult.success && roleResult.roleId) {
          roleId = roleResult.roleId;
          console.log(`✅ AI categorization mapped to role: ${helperCategory} → ${roleResult.roleId}`);
        } else if (roleResult.success && !roleResult.roleId) {
          // No role found but that's OK - roles table might be empty
          console.log(`ℹ️ No role mapping for: ${helperCategory} (roles table might be empty)`);
        }
      }
    } catch (catError) {
      console.warn('⚠️ AI categorization failed, trying user selection:', catError);
    }

    // STEP 2: If no role_id yet, try mapping from user-selected category_id
    if (!roleId && wishData.categoryId) {
      try {
        // Get category details from database
        const { getCategoryById } = await import('./categories');
        const category = await getCategoryById(wishData.categoryId);
        
        if (category && category.slug) {
          // Map category slug to role
          const { getRoleIdByHelperCategory } = await import('./roles');
          const roleResult = await getRoleIdByHelperCategory(category.slug);
          
          if (roleResult.success && roleResult.roleId) {
            roleId = roleResult.roleId;
            helperCategory = category.slug;
            console.log(`✅ User category mapped to role: ${category.slug} → ${roleResult.roleId}`);
          } else if (roleResult.success && !roleResult.roleId) {
            // No role found but that's OK - roles table might be empty
            console.log(`ℹ️ No role mapping for: ${category.slug} (roles table might be empty)`);
          }
        }
      } catch (catError) {
        console.warn('⚠️ Category mapping failed:', catError);
      }
    }

    const { data, error } = await supabase
      .from('wishes')
      .insert({
        title: wishData.title,
        description: wishData.description,
        category_id: wishData.categoryId, // OLD: Keep for backward compatibility
        // category_ids: REMOVED - column doesn't exist in database yet
        // subcategory_ids: REMOVED - column doesn't exist in database yet
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
        address: wishData.address,
        client_token: clientToken,
        owner_token: ownerToken,
        helper_category: helperCategory, // Store AI detected category
        intent_type: intentType, // Store detected intent type
        role_id: roleId, // ✅ ROLE-BASED: Store mapped role ID
        subcategory_id: wishData.subcategoryId || null, // Use for product matching
        product_name: wishData.productName || null, // ✅ NEW: Custom product name
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create wish:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Wish created successfully with role_id:', roleId);

    // 🔔 IMMEDIATE NOTIFICATIONS: Notify matching professionals AND helpers
    try {
      await notifyMatchingProvidersForWish(
        data.id,
        wishData.title,
        wishData.description,
        roleId,
        wishData.cityId,
        wishData.areaId,
        currentUser.id
      );
    } catch (notifError) {
      // Don't fail wish creation if notification fails
      console.error('⚠️ Failed to notify providers:', notifError);
    }

    // ✅ STEP 2: Notify matching SHOPS (product-type wishes only)
    if (wishData.categoryIds && wishData.subcategoryIds) {
      try {
        await notifyMatchingShopsForWish(
          data.id,
          wishData.title,
          wishData.categoryIds,
          wishData.subcategoryIds,
          data.latitude,
          data.longitude,
          currentUser.id
        );
      } catch (shopNotifError) {
        console.error('⚠️ Failed to notify shops:', shopNotifError);
      }
      
      // ✅ FIX 2: Match with EXISTING MARKETPLACE LISTINGS
      try {
        const matchingListingsCount = await matchWishWithExistingListings(
          data.id,
          wishData.title,
          wishData.categoryIds,
          wishData.subcategoryIds,
          data.latitude,
          data.longitude,
          currentUser.id
        );
        
        if (matchingListingsCount > 0) {
          console.log(`  ✅ Found ${matchingListingsCount} existing listings matching wish`);
        }
      } catch (listingMatchError) {
        console.error('⚠️ Failed to match existing listings:', listingMatchError);
      }
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
    const currentUser = await getCurrentUser();
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

    // Only creator can edit (verify by user_id)
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
    // REMOVED: category_ids and subcategory_ids - columns don't exist in database yet
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
    if (wishData.subcategoryId !== undefined) updates.subcategory_id = wishData.subcategoryId || null; // Use for product matching
    if (wishData.productName !== undefined) updates.product_name = wishData.productName || null; // ✅ NEW: Custom product name

    const { error } = await supabase
      .from('wishes')
      .update(updates)
      .eq('id', wishId)
      .eq('user_id', currentUser.id);

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
    
    const currentUser = await getCurrentUser();
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
      
      // 🔔 Send push notification (non-blocking)
      const { notifyWishUpdate } = await import('./pushNotificationDispatcher');
      notifyWishUpdate({
        recipientId: wish.userId,
        wishId: wishId,
        action: 'offer',
        title: 'Someone Can Help! 🎉',
        body: `${currentUser.name || 'Someone'} wants to help with "${wish.title}"`,
        senderId: currentUser.id,
      }).catch(err => console.warn('[WishService] Push notification failed:', err));
      
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
    console.log('🔍 [WishService] getUserWishes called with userId:', userId);
    
    // First, let's check ALL wishes to see what user_ids exist
    const { data: allWishes, error: allError } = await supabase
      .from('wishes')
      .select('id, title, user_id, owner_token, client_token')
      .limit(5);
    
    console.log('📋 [WishService] Sample of ALL wishes in database:', allWishes);
    
    // Query by user_id instead of owner_token for more reliable results
    // user_id is the UUID from the profiles table
    const { data, error } = await supabase
      .from('wishes')
      .select(`
        *,
        categories:category_id(id, name, emoji),
        cities:city_id(name),
        areas:area_id(name),
        profiles(name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('📊 [WishService] Query result:', {
      dataCount: data?.length || 0,
      hasError: !!error,
      error: error,
      queriedUserId: userId
    });

    if (error) {
      console.error('Failed to fetch user wishes:', error);
      return [];
    }

    const wishes = (data || []).map((wish: any) => ({
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
      subAreaId: wish.sub_area_id,
      subAreaName: wish.sub_area_name,
      budgetMin: wish.budget_min,
      budgetMax: wish.budget_max,
      urgency: wish.urgency || 'flexible',
      phone: wish.phone || '',
      whatsapp: wish.whatsapp,
      hasWhatsapp: wish.has_whatsapp,
      userId: wish.user_id,
      userName: wish.profiles?.name || 'User',
      userAvatar: wish.profiles?.avatar_url,
      createdAt: wish.created_at,
      isHidden: wish.is_hidden,
      latitude: wish.latitude,
      longitude: wish.longitude,
      address: wish.address,
      status: wish.status || 'open',
      exactLocation: wish.exact_location,
      acceptedBy: wish.accepted_by,
      acceptedAt: wish.accepted_at,
      acceptedPrice: wish.accepted_price,
      helperCategory: wish.helper_category,
      intentType: wish.intent_type,
    }));

    return wishes;
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    // SOFT DELETE: Set status to 'cancelled' and is_hidden to true
    // This keeps the wish for user's history but hides it from public view
    const { error } = await supabase
      .from('wishes')
      .update({ 
        status: 'cancelled',
        is_hidden: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', wishId)
      .eq('user_id', currentUser.id);

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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('wishes')
      .update({ status: 'closed', is_hidden: true })
      .eq('id', wishId)
      .eq('user_id', currentUser.id);

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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('wishes')
      .update(updates)
      .eq('id', wishId)
      .eq('user_id', currentUser.id);

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
    console.log('🔍 [getAllWishesAdmin] Starting to fetch all wishes...');
    
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
      console.error('❌ [getAllWishesAdmin] Failed to fetch wishes:', error);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      return [];
    }

    console.log(`✅ [getAllWishesAdmin] Successfully fetched ${data?.length || 0} wishes from database`);
    
    if (data && data.length > 0) {
      console.log('📊 [getAllWishesAdmin] Sample wish data:', {
        id: data[0].id,
        title: data[0].title,
        user_id: data[0].user_id,
        city_id: data[0].city_id,
        category_id: data[0].category_id,
        status: data[0].status
      });
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
    console.error('❌ [getAllWishesAdmin] Exception:', error);
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

// =====================================================
// ROLE-BASED NOTIFICATIONS
// =====================================================

/**
 * Notify matching professionals AND helpers when a wish is posted
 * Sends both in-app and WhatsApp notifications immediately
 */
async function notifyMatchingProvidersForWish(
  wishId: string,
  title: string,
  description: string,
  roleId: string | null,
  cityId: string | null,
  areaId: string | null,
  requesterId: string
): Promise<void> {
  try {
    console.log('🔔 [Wish Notifications] Finding matching providers...');
    console.log(`   Role ID: ${roleId || 'none'}`);
    console.log(`   City: ${cityId || 'all'}`);
    console.log(`   Area: ${areaId || 'all'}`);

    const providers: Array<{
      userId: string;
      name: string;
      phone: string;
      whatsapp: string;
      type: 'professional' | 'helper';
    }> = [];

    // Get requester details for notifications
    const { data: requesterData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', requesterId)
      .single();
    const requesterName = requesterData?.name || 'Someone';

    // 1. Find matching PROFESSIONALS by role
    if (roleId && cityId) {
      const { data: professionals } = await supabase
        .from('professionals')
        .select(`
          user_id,
          name,
          phone,
          whatsapp,
          profiles!inner(id, name, phone)
        `)
        .eq('role_id', roleId)
        .eq('city', cityId)
        .eq('is_active', true);

      if (professionals && professionals.length > 0) {
        professionals.forEach((prof: any) => {
          providers.push({
            userId: prof.user_id,
            name: prof.name || prof.profiles?.name || 'Professional',
            phone: prof.phone || prof.profiles?.phone || '',
            whatsapp: prof.whatsapp || prof.phone || prof.profiles?.phone || '',
            type: 'professional'
          });
        });
        console.log(`   ✅ Found ${professionals.length} matching professionals`);
      }
    }

    // 2. Find matching HELPERS by preferences
    // Helpers have helper_preferences array in their profile
    const { data: helpers } = await supabase
      .from('profiles')
      .select('id, name, phone, helper_preferences')
      .not('helper_preferences', 'is', null)
      .eq('is_helper_active', true);

    if (helpers && helpers.length > 0 && roleId) {
      // Get role name to match against helper preferences
      const { getRoleName } = await import('./roles');
      const roleResult = await getRoleName(roleId);
      const roleName = roleResult.name;

      if (roleName) {
        helpers.forEach((helper: any) => {
          // Check if helper preferences include this role
          if (helper.helper_preferences && Array.isArray(helper.helper_preferences)) {
            if (helper.helper_preferences.includes(roleName)) {
              providers.push({
                userId: helper.id,
                name: helper.name || 'Helper',
                phone: helper.phone || '',
                whatsapp: helper.phone || '',
                type: 'helper'
              });
            }
          }
        });
        console.log(`   ✅ Found ${providers.filter(p => p.type === 'helper').length} matching helpers`);
      }
    }

    if (providers.length === 0) {
      console.log('   ℹ️ No matching providers found');
      return;
    }

    console.log(`   🎯 Total providers to notify: ${providers.length}`);

    // 3. Send notifications to all providers
    let notifiedCount = 0;
    const { sendWhatsAppNotification } = await import('./interaktWhatsApp');

    for (const provider of providers) {
      try {
        // Create in-app notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: provider.userId,
            title: `New Wish Match: ${title}`,
            message: `${requesterName} posted a wish you can help with. Tap to view details.`,
            type: 'professional_wish_match',
            reference_id: wishId,
            reference_type: 'wish',
            is_read: false,
          });

        if (!notifError) {
          notifiedCount++;
          console.log(`   ✅ In-app notification sent to ${provider.name} (${provider.type})`);

          // Send WhatsApp notification (non-blocking)
          if (provider.whatsapp) {
            sendWhatsAppNotification({
              phoneNumber: provider.whatsapp,
              templateName: 'wish_match',
              variables: {
                provider_name: provider.name,
                requester_name: requesterName,
                wish_title: title,
                wish_preview: description?.substring(0, 100) || '',
                wish_link: `${window.location.origin}/wishes/${wishId}`
              },
              userId: provider.userId
            }).catch(err => {
              console.warn(`   ⚠️ WhatsApp notification failed for ${provider.name}:`, err.message);
            });
          }
        }
      } catch (err) {
        console.error(`   ❌ Failed to notify ${provider.name}:`, err);
      }
    }

    console.log(`   ✅ Sent notifications to ${notifiedCount}/${providers.length} providers`);
  } catch (error) {
    console.error('❌ [Wish Notifications] Error:', error);
  }
}

/**
 * Notify matching SHOPS when a product-type wish is posted
 * Sends both in-app and WhatsApp notifications immediately
 */
async function notifyMatchingShopsForWish(
  wishId: string,
  title: string,
  categoryIds: string[],
  subcategoryIds: string[],
  latitude: number,
  longitude: number,
  requesterId: string
): Promise<void> {
  try {
    console.log('🔔 [Wish → Shops Notifications] Finding matching shops...');
    console.log(`   Categories: ${categoryIds.join(', ')}`);
    console.log(`   Subcategories: ${subcategoryIds.join(', ')}`);
    console.log(`   Location: ${latitude}, ${longitude}`);

    const shops: Array<{
      userId: string;
      name: string;
      phone: string;
      whatsapp: string;
      type: 'shop';
    }> = [];

    // Get requester details for notifications
    const { data: requesterData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', requesterId)
      .single();
    const requesterName = requesterData?.name || 'Someone';

    // 1. Find matching SHOPS by category and subcategory
    if (categoryIds.length > 0 && subcategoryIds.length > 0) {
      const { data: shopProducts } = await supabase
        .from('shop_products')
        .select(`
          shop_id,
          name,
          phone,
          whatsapp,
          profiles!inner(id, name, phone)
        `)
        .in('category_id', categoryIds)
        .in('subcategory_id', subcategoryIds)
        .eq('is_active', true);

      if (shopProducts && shopProducts.length > 0) {
        shopProducts.forEach((product: any) => {
          shops.push({
            userId: product.shop_id,
            name: product.name || product.profiles?.name || 'Shop',
            phone: product.phone || product.profiles?.phone || '',
            whatsapp: product.whatsapp || product.phone || product.profiles?.phone || '',
            type: 'shop'
          });
        });
        console.log(`   ✅ Found ${shopProducts.length} matching shops`);
      }
    }

    if (shops.length === 0) {
      console.log('   ℹ️ No matching shops found');
      return;
    }

    console.log(`   🎯 Total shops to notify: ${shops.length}`);

    // 3. Send notifications to all shops
    let notifiedCount = 0;
    const { sendWhatsAppNotification } = await import('./interaktWhatsApp');

    for (const shop of shops) {
      try {
        // Create in-app notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: shop.userId,
            title: `New Product Wish Match: ${title}`,
            message: `${requesterName} posted a wish for a product you sell. Tap to view details.`,
            type: 'shop_wish_match',
            reference_id: wishId,
            reference_type: 'wish',
            is_read: false,
          });

        if (!notifError) {
          notifiedCount++;
          console.log(`   ✅ In-app notification sent to ${shop.name} (${shop.type})`);

          // Send WhatsApp notification (non-blocking)
          if (shop.whatsapp) {
            sendWhatsAppNotification({
              phoneNumber: shop.whatsapp,
              templateName: 'wish_match',
              variables: {
                provider_name: shop.name,
                requester_name: requesterName,
                wish_title: title,
                wish_preview: description?.substring(0, 100) || '',
                wish_link: `${window.location.origin}/wishes/${wishId}`
              },
              userId: shop.userId
            }).catch(err => {
              console.warn(`   ⚠️ WhatsApp notification failed for ${shop.name}:`, err.message);
            });
          }
        }
      } catch (err) {
        console.error(`   ❌ Failed to notify ${shop.name}:`, err);
      }
    }

    console.log(`   ✅ Sent notifications to ${notifiedCount}/${shops.length} shops`);
  } catch (error) {
    console.error('❌ [Wish Notifications] Error:', error);
  }
}

/**
 * ✅ FIX 2: Match a wish with existing marketplace listings
 * When a wish is created, instantly check existing listings
 * and notify the wish creator if matches are found
 */
async function matchWishWithExistingListings(
  wishId: string,
  wishTitle: string,
  categoryIds: string[],
  subcategoryIds: string[],
  wishLatitude: number,
  wishLongitude: number,
  wishCreatorId: string
): Promise<number> {
  try {
    console.log('🔔 [FIX 2: Wish → Existing Listings] Searching marketplace...');
    console.log(`   Categories: ${categoryIds.join(', ')}`);
    console.log(`   Subcategories: ${subcategoryIds.join(', ')}`);
    console.log(`   Location: ${wishLatitude}, ${wishLongitude}`);

    const listings: Array<{
      userId: string;
      name: string;
      phone: string;
      whatsapp: string;
      type: 'listing';
    }> = [];

    // Get requester details for notifications
    const { data: requesterData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', wishCreatorId)
      .single();
    const requesterName = requesterData?.name || 'Someone';

    // 1. Find matching LISTINGS by category and subcategory
    if (categoryIds.length > 0 && subcategoryIds.length > 0) {
      const { data: marketplaceListings } = await supabase
        .from('marketplace_listings')
        .select(`
          user_id,
          name,
          phone,
          whatsapp,
          profiles!inner(id, name, phone)
        `)
        .in('category_id', categoryIds)
        .in('subcategory_id', subcategoryIds)
        .eq('is_active', true);

      if (marketplaceListings && marketplaceListings.length > 0) {
        marketplaceListings.forEach((listing: any) => {
          listings.push({
            userId: listing.user_id,
            name: listing.name || listing.profiles?.name || 'Listing',
            phone: listing.phone || listing.profiles?.phone || '',
            whatsapp: listing.whatsapp || listing.phone || listing.profiles?.phone || '',
            type: 'listing'
          });
        });
        console.log(`   ✅ Found ${marketplaceListings.length} matching listings`);
      }
    }

    if (listings.length === 0) {
      console.log('   ℹ️ No matching listings found');
      return 0;
    }

    console.log(`   🎯 Total listings to notify: ${listings.length}`);

    // 3. Send notifications to all listings
    let notifiedCount = 0;
    const { sendWhatsAppNotification } = await import('./interaktWhatsApp');

    for (const listing of listings) {
      try {
        // Create in-app notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: listing.userId,
            title: `New Product Wish Match: ${wishTitle}`,
            message: `${requesterName} posted a wish for a product you sell. Tap to view details.`,
            type: 'listing_wish_match',
            reference_id: wishId,
            reference_type: 'wish',
            is_read: false,
          });

        if (!notifError) {
          notifiedCount++;
          console.log(`   ✅ In-app notification sent to ${listing.name} (${listing.type})`);

          // Send WhatsApp notification (non-blocking)
          if (listing.whatsapp) {
            sendWhatsAppNotification({
              phoneNumber: listing.whatsapp,
              templateName: 'wish_match',
              variables: {
                provider_name: listing.name,
                requester_name: requesterName,
                wish_title: wishTitle,
                wish_preview: description?.substring(0, 100) || '',
                wish_link: `${window.location.origin}/wishes/${wishId}`
              },
              userId: listing.userId
            }).catch(err => {
              console.warn(`   ⚠️ WhatsApp notification failed for ${listing.name}:`, err.message);
            });
          }
        }
      } catch (err) {
        console.error(`   ❌ Failed to notify ${listing.name}:`, err);
      }
    }

    console.log(`   ✅ Sent notifications to ${notifiedCount}/${listings.length} listings`);
    return notifiedCount;
  } catch (error) {
    console.error('❌ [Wish Notifications] Error:', error);
    return 0;
  }
}