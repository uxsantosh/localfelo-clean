// Listings Service for OldCycle
// All listing-related API calls

import { supabase } from '../lib/supabaseClient';

// Cache for categories and cities to avoid repeated DB calls
let categoriesCache = null;
let citiesCache = null;

// Mock data fallback
const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'iPhone 13 Pro - Excellent Condition',
    description: 'Selling my iPhone 13 Pro in excellent condition. Battery health 95%. No scratches.',
    price: 45000,
    categoryId: '1',
    categoryName: 'Electronics',
    cityId: '1',
    cityName: 'Mumbai',
    areaId: '1',
    areaName: 'Andheri',
    images: [],
    userId: 'mock-user-1',
    createdAt: new Date().toISOString(),
    isHidden: false,
    latitude: 19.1136,
    longitude: 72.8697,
  },
  {
    id: '2',
    title: 'Study Table with Chair',
    description: 'Wooden study table with matching chair. Good condition, barely used.',
    price: 3500,
    categoryId: '2',
    categoryName: 'Furniture',
    cityId: '1',
    cityName: 'Mumbai',
    areaId: '2',
    areaName: 'Bandra',
    images: [],
    userId: 'mock-user-2',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isHidden: false,
    latitude: 19.0596,
    longitude: 72.8295,
  },
];

/**
 * Haversine formula to calculate distance between two coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Fetch categories from database (with caching)
 */
async function getCategories() {
  if (categoriesCache) {
    return categoriesCache;
  }
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      // Suppress AbortError logs in development (caused by React StrictMode)
      if (error.message?.includes('AbortError') || error.code === 'PGRST301') {
        return [];
      }
      console.error('[getCategories] Error:', error);
      return [];
    }
    
    categoriesCache = data || [];
    return categoriesCache;
  } catch (error) {
    // Suppress AbortError logs in development
    if (error?.message?.includes('AbortError')) {
      return [];
    }
    console.error('[getCategories] Unexpected error:', error);
    return [];
  }
}

/**
 * Fetch cities with areas from database (with caching)
 */
async function getCities() {
  if (citiesCache) {
    return citiesCache;
  }
  
  try {
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (citiesError) {
      // Suppress AbortError logs in development
      if (citiesError.message?.includes('AbortError') || citiesError.code === 'PGRST301') {
        return [];
      }
      console.error('[getCities] Error fetching cities:', citiesError);
      return [];
    }
    
    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('*')
      .order('name');
    
    if (areasError) {
      // Suppress AbortError logs in development
      if (!areasError.message?.includes('AbortError') && areasError.code !== 'PGRST301') {
        console.error('[getCities] Error fetching areas:', areasError);
      }
    }
    
    const citiesWithAreas = (cities || []).map(city => ({
      ...city,
      areas: (areas || [])
        .filter(area => area.city_id === city.id)
        .map(area => ({
          ...area,
          slug: area.id, // Use area ID as slug (matches locations.ts)
        }))
    }));
    
    citiesCache = citiesWithAreas;
    return citiesCache;
  } catch (error) {
    // Suppress AbortError logs in development
    if (error?.message?.includes('AbortError')) {
      return [];
    }
    console.error('[getCities] Unexpected error:', error);
    return [];
  }
}

/**
 * Helper function to transform database listing to frontend Listing type
 */
async function transformListing(dbListing) {
  const categories = await getCategories();
  const cities = await getCities();
  
  const category = categories.find(c => c.slug === dbListing.category_slug);
  const city = cities.find(c => c.name === dbListing.city);
  const area = city?.areas.find(a => a.slug === dbListing.area_slug);

  // Fetch user name from profiles if not present or empty
  let userName = dbListing.owner_name;
  if (!userName || userName.trim() === '') {
    if (dbListing.owner_token) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', dbListing.owner_token)
          .single();
        
        if (profileData && profileData.name) {
          userName = profileData.name;
        } else {
          userName = 'Local User';
        }
      } catch (error) {
        console.log('[transformListing] Could not fetch user name, using default');
        userName = 'Local User';
      }
    } else {
      userName = 'Local User';
    }
  }

  return {
    id: dbListing.id,
    title: dbListing.title,
    description: dbListing.description,
    price: dbListing.price,
    categoryId: category?.id || '',
    categoryName: category?.name || 'Other',
    categoryEmoji: category?.emoji || '📦',
    cityId: city?.id || '',
    cityName: city?.name || dbListing.city || '',
    areaId: area?.id || '',
    areaName: area?.name || dbListing.area_slug || '',
    images: dbListing.images || [],
    phone: dbListing.owner_phone,
    hasWhatsapp: dbListing.whatsapp_enabled || false,
    whatsapp: dbListing.whatsapp_number,
    userId: dbListing.owner_token,
    userName: userName,
    createdAt: dbListing.created_at,
    isHidden: !dbListing.is_active,
    latitude: dbListing.latitude,
    longitude: dbListing.longitude,
    distance: dbListing.distance,
    exactLocation: dbListing.exact_location,
    address: dbListing.address,
  };
}

/**
 * Get listings with optional filters and cursor-based pagination
 * @param {Object} filters - { categorySlug, city, area, minPrice, maxPrice, searchQuery, cursor, limit }
 * @returns {Promise<Object>} { data: listings[], nextCursor: string | null }
 */
export async function getListings(filters = {}) {
  console.log('[Service] getListings called with filters:', filters);
  console.log('[Service] 🔍 DEBUGGING: Starting getListings function');
  
  const { page = 1, limit = 20, includeOwn = false } = filters;  // ✅ Add page-based pagination
  
  try {
    // Import auth service to get current user
    const { getCurrentUser } = await import('./auth');
    const currentUser = getCurrentUser();
    
    console.log('🔍 [getListings] Current user:', currentUser ? `ID: ${currentUser.id}` : 'GUEST (not logged in)');
    console.log('🔍 [getListings] includeOwn flag:', includeOwn);
    console.log('🔍 [getListings] Pagination: page', page, 'limit', limit);
    
    // First, get total count for pagination
    let countQuery = supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Apply same filters for count
    if (currentUser?.id && !includeOwn) {
      countQuery = countQuery.neq('owner_token', currentUser.id);
    }
    if (filters.categorySlug && filters.categorySlug !== '') {
      countQuery = countQuery.eq('category_slug', filters.categorySlug);
    }
    // REMOVED: City and area filtering - show ALL listings from everywhere
    // if (filters.city && filters.city !== '') {
    //   countQuery = countQuery.eq('city', filters.city);
    // }
    // if (filters.areaSlug && filters.areaSlug !== '') {
    //   countQuery = countQuery.eq('area_slug', filters.areaSlug);
    // }
    if (filters.searchQuery && filters.searchQuery !== '') {
      countQuery = countQuery.ilike('title', `%${filters.searchQuery}%`);
    }
    if (filters.minPrice && filters.minPrice > 0) {
      countQuery = countQuery.gte('price', filters.minPrice);
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      countQuery = countQuery.lte('price', filters.maxPrice);
    }
    
    const { count: totalCount } = await countQuery;
    
    // Now get paginated data
    let query = supabase
      .from('listings')
      .select('*')
      .eq('is_active', true);
    
    console.log('🔍 [getListings] Base query created');
    console.log('🌍 [getListings] Showing ALL listings from EVERYWHERE (sorted by distance)');
    
    // ✅ FILTER OUT CURRENT USER'S OWN LISTINGS (if logged in)
    // Unless includeOwn=true (for testing/debugging)
    // Logged-in users should NOT see their own listings in marketplace
    // They can manage their listings from Profile > My Listings
    // Guest users (not logged in) can see ALL listings
    if (currentUser?.id && !includeOwn) {
      query = query.neq('owner_token', currentUser.id);
      console.log('🔍 [Service] Filtering out current user\'s own listings:', currentUser.id);
    } else if (includeOwn) {
      console.log('🧪 [Service] DEV MODE: Including own listings for testing');
    } else {
      console.log('✅ [Service] Guest user - showing ALL listings (no owner filter)');
    }
    
    // Apply filters - only if they have actual values (NOT city/area)
    if (filters.categorySlug && filters.categorySlug !== '') {
      console.log('[Service] Filtering by category:', filters.categorySlug);
      query = query.eq('category_slug', filters.categorySlug);
    }
    // REMOVED: City and area filtering to show ALL listings from everywhere
    // if (filters.city && filters.city !== '') {
    //   console.log('[Service] Filtering by city:', filters.city);
    //   query = query.eq('city', filters.city);
    // }
    // if (filters.areaSlug && filters.areaSlug !== '') {
    //   console.log('[Service] Filtering by area:', filters.areaSlug);
    //   query = query.eq('area_slug', filters.areaSlug);
    // }
    if (filters.searchQuery && filters.searchQuery !== '') {
      console.log('[Service] Filtering by search:', filters.searchQuery);
      query = query.ilike('title', `%${filters.searchQuery}%`);
    }
    if (filters.minPrice && filters.minPrice > 0) {
      console.log('[Service] Filtering by minPrice:', filters.minPrice);
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      console.log('[Service] Filtering by maxPrice:', filters.maxPrice);
      query = query.lte('price', filters.maxPrice);
    }
    
    // Apply ordering first, then pagination
    query = query.order('created_at', { ascending: false });
    
    // Page-based pagination using range
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[Service] Error fetching listings:', error);
      throw error;
    }
    
    console.log(`✅ [getListings] Fetched ${data?.length || 0} listings from database`);
    
    if (!data || data.length === 0) {
      console.log('ℹ️ [getListings] No listings found in database - returning empty array');
      return { data: [], nextCursor: null };
    }
    
    // Check if there are more results
    const hasMore = data.length > limit;
    const listings = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? listings[listings.length - 1].created_at : null;
    
    // Fetch images for each listing
    const listingsWithImages = await Promise.all(
      listings.map(async (listing) => {
        const { data: images } = await supabase
          .from('listing_images')
          .select('image_url')
          .eq('listing_id', listing.id)
          .order('display_order', { ascending: true });
        
        const imageUrls = images?.map(img => img.image_url) || [];
        
        return {
          ...listing,
          images: imageUrls,
        };
      })
    );
    
    // Transform listings to frontend type
    const transformedListings = await Promise.all(
      listingsWithImages.map(listing => transformListing(listing))
    );
    
    // Calculate distance if user coordinates are provided
    const listingsWithDistance = transformedListings.map(listing => {
      if (filters.userLat && filters.userLon && listing.latitude && listing.longitude) {
        const distance = calculateDistance(
          filters.userLat,
          filters.userLon,
          listing.latitude,
          listing.longitude
        );
        return { ...listing, distance };
      }
      return listing;
    });
    
    // ✅ SORT BY DISTANCE (NEAREST FIRST)
    const sortedListings = listingsWithDistance.sort((a, b) => {
      // Items without distance go to the end
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      
      // Sort by distance ascending (nearest first)
      return a.distance - b.distance;
    });
    
    console.log(`✅ [Listings] Sorted ${sortedListings.length} listings by distance`);
    if (sortedListings.length > 0 && sortedListings[0].distance !== undefined) {
      console.log(`📍 [Listings] Nearest: ${sortedListings[0].title} at ${sortedListings[0].distance.toFixed(1)} km`);
    }
    
    return {
      data: sortedListings,
      nextCursor,
      totalCount,
    };
  } catch (error) {
    console.error('[Service] getListings error:', error);
    console.log('⚠️ Using mock listings data as fallback');
    return {
      data: MOCK_LISTINGS,
      nextCursor: null,
      totalCount: MOCK_LISTINGS.length,
    };
  }
}

/**
 * Get all listings (alias for MarketplaceScreen - returns array directly)
 * @returns {Promise<Array>} Array of all listings
 */
export async function getAllListings() {
  try {
    const result = await getListings({ limit: 1000 }); // Get large batch
    return result.data || [];
  } catch (error) {
    console.error('[Service] getAllListings error:', error);
    return MOCK_LISTINGS;
  }
}

/**
 * Get a single listing by ID
 * @param {string} id - Listing ID
 * @param {number} [userLat] - Optional user latitude for distance calculation
 * @param {number} [userLon] - Optional user longitude for distance calculation
 * @returns {Promise<Object>} Listing details
 */
export async function getListingById(id, userLat, userLon) {
  console.log('[Service] getListingById called with id:', id);
  
  // ✅ Validate ID before making database call
  if (!id || id === 'undefined' || id === 'null' || typeof id !== 'string') {
    console.error('[Service] Invalid listing ID:', id);
    return null;
  }
  
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle(); // ✅ Use maybeSingle() to return null instead of throwing error
    
    if (error) {
      console.error('[Service] Error fetching listing:', error);
      throw error;
    }
    
    // Return null if listing not found (deleted or inactive)
    if (!listing) {
      console.log('[Service] Listing not found or inactive:', id);
      return null;
    }
    
    // Fetch images
    const { data: images } = await supabase
      .from('listing_images')
      .select('image_url')
      .eq('listing_id', id)
      .order('display_order', { ascending: true });
    
    const imageUrls = images?.map(img => img.image_url) || [];
    
    const listingWithImages = {
      ...listing,
      images: imageUrls,
    };
    
    // Transform to frontend type
    const transformedListing = await transformListing(listingWithImages);
    
    // Calculate distance if user coordinates are provided
    if (userLat && userLon && transformedListing.latitude && transformedListing.longitude) {
      const distance = calculateDistance(userLat, userLon, transformedListing.latitude, transformedListing.longitude);
      console.log(`📍 [ListingService] Listing distance: ${distance.toFixed(2)} km`);
      return { ...transformedListing, distance };
    }
    
    return transformedListing;
  } catch (error) {
    console.error('[Service] getListingById error:', error);
    throw error;
  }
}

/**
 * Create a new listing
 * @param {Object} payload - Listing data
 * @returns {Promise<Object>} Created listing
 */
export async function createListing(payload) {
  console.log('[Service] createListing called with payload:', payload);
  
  try {
    // Get client_token from localStorage (soft-auth)
    const clientToken = localStorage.getItem('oldcycle_token');
    const userDataStr = localStorage.getItem('oldcycle_user');
    
    if (!clientToken) {
      throw new Error('User not authenticated. Please login first.');
    }
    
    console.log('[Service] 🔑 Fetching profile to get user ID...');
    
    // Fetch the user's profile to get the UUID and owner_token
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, owner_token, name, phone')
      .eq('client_token', clientToken)
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (profileError || !profiles || profiles.length === 0) {
      console.error('[Service] ❌ Error fetching profile:', profileError);
      throw new Error('User profile not found. Please login again.');
    }
    
    const profile = profiles[0];
    console.log('[Service] ✅ Got profile with ID:', profile.id);
    console.log('[Service] ✅ Got profile owner_token:', profile.owner_token);
    
    // ✅ FIX: ALWAYS use profile.id (UUID), ignore profile.owner_token field
    // The profile.owner_token might contain old client_token strings from migrations
    const ownerToken = profile.id;
    
    // Parse user data to get name and phone
    let userName = profile.name;
    let userPhone = profile.phone;
    
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        userName = userData.name || profile.name;
        userPhone = userData.phone || profile.phone;
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    
    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: profile.id,  // ✅ NEW: Add user_id for consistency with tasks/wishes
        owner_token: ownerToken,  // ✅ Keep for backward compatibility
        owner_name: userName,
        owner_phone: userPhone || payload.phone,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        category_slug: payload.categorySlug,
        area_slug: payload.areaSlug,
        city: payload.city,
        whatsapp_enabled: payload.whatsappEnabled,
        whatsapp_number: payload.whatsappNumber,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address || null,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[Service] Error creating listing:', error);
      throw error;
    }
    
    console.log('[Service] Listing created successfully:', data);
    console.log('[Service] 🔑 Listing owner_token:', data.owner_token);
    return data;
  } catch (error) {
    console.error('[Service] createListing error:', error);
    throw error;
  }
}

/**
 * Edit an existing listing
 * Only owner can edit
 * @param {string} listingId - Listing ID
 * @param {Object} payload - Updated listing data
 * @returns {Promise<Object>} Updated listing
 */
export async function editListing(listingId, payload) {
  console.log('[Service] editListing called with id:', listingId, 'payload:', payload);
  
  try {
    // Get client_token from localStorage
    const clientToken = localStorage.getItem('oldcycle_token');
    
    if (!clientToken) {
      throw new Error('User not authenticated. Please login first.');
    }
    
    // Fetch the user's profile to get the UUID
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('client_token', clientToken)
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (profileError || !profiles || profiles.length === 0) {
      throw new Error('User profile not found. Please login again.');
    }
    
    const userId = profiles[0].id;
    
    // Verify ownership by checking if listing exists with this user ID
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .eq('owner_token', userId)
      .single();
    
    if (fetchError || !existingListing) {
      throw new Error('Listing not found or you do not have permission to edit it.');
    }
    
    // Build update object with only provided fields
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.price !== undefined) updates.price = payload.price;
    
    // LEGACY: Support slug-based fields (current database schema)
    if (payload.categorySlug !== undefined) updates.category_slug = payload.categorySlug;
    if (payload.areaSlug !== undefined) updates.area_slug = payload.areaSlug;
    if (payload.city !== undefined) updates.city = payload.city;
    
    if (payload.whatsappEnabled !== undefined) updates.whatsapp_enabled = payload.whatsappEnabled;
    if (payload.whatsappNumber !== undefined) updates.whatsapp_number = payload.whatsappNumber;
    if (payload.phone !== undefined) updates.owner_phone = payload.phone;
    
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .eq('owner_token', userId)
      .select()
      .single();
    
    if (error) {
      console.error('[Service] Error editing listing:', error);
      throw error;
    }
    
    console.log('[Service] Listing edited successfully:', data);
    return data;
  } catch (error) {
    console.error('[Service] editListing error:', error);
    throw error;
  }
}

/**
 * Upload listing images
 * @param {Array<File>} files - Image files to upload
 * @param {string} listingId - Listing ID
 * @returns {Promise<Array<string>>} Array of storage paths
 */
export async function uploadListingImages(files, listingId) {
  console.log('[Service] uploadListingImages called with files:', files.length);
  
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${listingId}/${Date.now()}_${index}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(uploadData.path);
      
      // Insert record into listing_images table with image_url
      const { error: dbError } = await supabase
        .from('listing_images')
        .insert({
          listing_id: listingId,
          image_url: urlData.publicUrl,
          display_order: index,
        });
      
      if (dbError) throw dbError;
      
      return urlData.publicUrl;
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('[Service] uploadListingImages error:', error);
    throw error;
  }
}

/**
 * Get user's listings by client token
 * @param {string} clientToken - Client token from localStorage
 * @returns {Promise<Array>} User's listings
 */
export async function getMyListings(clientToken) {
  console.log('🔍 [Service] getMyListings called with clientToken:', clientToken ? 'EXISTS' : 'MISSING');
  
  if (!clientToken) {
    console.log('❌ [Service] No clientToken provided');
    return [];
  }
  
  try {
    // Get the user's UUID from the profile
    console.log('📞 [Service] Fetching profile for clientToken...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('client_token', clientToken)
      .limit(1);
    
    console.log('📊 [Service] Profile query result:', { 
      profilesCount: profiles?.length || 0,
      hasError: !!profileError,
      error: profileError 
    });
    
    if (profileError) {
      console.error('❌ [Service] Error fetching profile:', profileError);
      return [];
    }
    
    if (!profiles || profiles.length === 0) {
      console.error('❌ [Service] No profile found for this clientToken');
      return [];
    }
    
    const profile = profiles[0];
    console.log('✅ [Service] Got profile ID:', profile.id);
    console.log('📞 [Service] Fetching listings for user...');
    
    // Query by profile.id (UUID) which matches the listings.owner_token column
    // Filter out deleted listings (is_active: false, is_hidden: true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('owner_token', profile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    console.log('📊 [Service] Listings query result:', { 
      count: data?.length || 0, 
      hasError: !!error,
      error: error 
    });
    
    if (error) {
      console.error('❌ [Service] Error fetching my listings:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ [Service] No listings found for this user');
      return [];
    }
    
    console.log('✅ [Service] Found', data.length, 'listing(s)');
    console.log('📞 [Service] Fetching images for each listing...');
    
    // Fetch images for each listing
    const listingsWithImages = await Promise.all(
      data.map(async (listing) => {
        try {
          const { data: images, error: imagesError } = await supabase
            .from('listing_images')
            .select('image_url, display_order')
            .eq('listing_id', listing.id)
            .order('display_order', { ascending: true });

          if (imagesError) {
            console.error(`⚠️ [Service] Error fetching images for listing ${listing.id}:`, imagesError);
            return { ...listing, images: [] };
          }

          const imageUrls = images ? images.map(img => img.image_url) : [];
          console.log(`  ✅ Listing ${listing.id}: ${imageUrls.length} image(s)`);
          return { ...listing, images: imageUrls };
        } catch (imageError) {
          console.error(`⚠️ [Service] Error processing images for listing ${listing.id}:`, imageError);
          return { ...listing, images: [] };
        }
      })
    );

    console.log('✅ [Service] All listings with images prepared');
    return listingsWithImages;
  } catch (error) {
    console.error('❌ [Service] getMyListings error:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}

/**
 * Get listings by an array of IDs
 * @param {Array<string>} listingIds - Array of listing IDs to fetch
 * @returns {Promise<Array>} Array of listings
 */
export async function getListingsByIds(listingIds) {
  console.log('🔍 [Service] getListingsByIds called with:', listingIds);
  
  if (!listingIds || listingIds.length === 0) {
    console.log('⚠️ [Service] No listing IDs provided');
    return [];
  }

  try {
    // Fetch listings from Supabase
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .in('id', listingIds)
      .eq('is_active', true); // Only fetch active listings

    if (listingsError) {
      console.error('❌ [Service] Failed to fetch listings:', listingsError);
      throw listingsError;
    }

    if (!listings || listings.length === 0) {
      console.log('⚠️ [Service] No listings found for IDs:', listingIds);
      return [];
    }

    console.log('✅ [Service] Fetched listings:', listings.length);

    // Process each listing to get images
    const listingsWithImages = await Promise.all(
      listings.map(async (listing) => {
        try {
          // Fetch images for this listing
          const { data: images, error: imagesError } = await supabase
            .from('listing_images')
            .select('image_url, display_order')
            .eq('listing_id', listing.id)
            .order('display_order', { ascending: true });

          if (imagesError) {
            console.error(`⚠️ [Service] Error fetching images for listing ${listing.id}:`, imagesError);
            return { ...listing, images: [] };
          }

          const imageUrls = images ? images.map(img => img.image_url) : [];
          return { ...listing, images: imageUrls };
        } catch (imageError) {
          console.error(`⚠️ [Service] Error processing images for listing ${listing.id}:`, imageError);
          return { ...listing, images: [] };
        }
      })
    );

    console.log('✅ [Service] Listings with images prepared:', listingsWithImages.length);
    return listingsWithImages;
  } catch (error) {
    console.error('❌ [Service] getListingsByIds error:', error);
    throw error;
  }
}

/**
 * Delete a listing (requires client token)
 * @param {string} listingId - Listing ID to delete
 * @param {string} clientToken - Client token for verification
 * @returns {Promise<void>}
 */
export async function deleteListing(listingId, clientToken) {
  console.log('[Service] deleteListing called with id:', listingId);
  
  try {
    // Get the user's UUID from the profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('client_token', clientToken)
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (profileError || !profiles || profiles.length === 0) {
      console.error('[Service] Error fetching profile for delete:', profileError);
      throw new Error('User profile not found.');
    }
    
    const userId = profiles[0].id;
    
    // SOFT DELETE: Set is_active to false instead of deleting
    // This keeps the listing in database for history but hides it from public view
    const { error } = await supabase
      .from('listings')
      .update({ 
        is_active: false,
        is_hidden: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .eq('owner_token', userId);
    
    if (error) {
      console.error('[Service] Error deleting listing:', error);
      throw error;
    }
    
    console.log('[Service] ✅ Listing soft-deleted (hidden from public view)');
  } catch (error) {
    console.error('[Service] deleteListing error:', error);
    throw error;
  }
}

/**
 * Toggle listing visibility (admin or owner)
 * @param {string} listingId - Listing ID
 * @param {boolean} isActive - Active state
 * @param {string} ownerToken - Owner token for verification (optional)
 * @returns {Promise<void>}
 */
export async function toggleListingVisibility(listingId, isActive, ownerToken) {
  console.log('[Service] toggleListingVisibility called:', listingId, isActive);
  
  try {
    let query = supabase
      .from('listings')
      .update({ is_active: isActive })
      .eq('id', listingId);
    
    if (ownerToken) {
      query = query.eq('owner_token', ownerToken);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error('[Service] Error toggling visibility:', error);
      throw error;
    }
  } catch (error) {
    console.error('[Service] toggleListingVisibility error:', error);
    throw error;
  }
}

/**
 * Update an existing listing
 * @param {string} listingId - Listing ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated listing
 */
export async function updateListing(listingId, updates) {
  console.log('[Service] updateListing called with id:', listingId, 'updates:', updates);
  
  try {
    // Get client_token from localStorage (soft-auth)
    const clientToken = localStorage.getItem('oldcycle_token');
    
    if (!clientToken) {
      throw new Error('User not authenticated. Please login first.');
    }
    
    console.log('[Service] 🔑 Fetching profile to verify ownership...');
    
    // Fetch the user's profile to get the UUID
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('client_token', clientToken)
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (profileError || !profiles || profiles.length === 0) {
      console.error('[Service] ❌ Error fetching profile:', profileError);
      throw new Error('User profile not found. Please login again.');
    }
    
    const userId = profiles[0].id;
    console.log('[Service] ✅ Got profile UUID');
    
    // Build the update object
    const updateData = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.categorySlug !== undefined) updateData.category_slug = updates.categorySlug;
    if (updates.areaSlug !== undefined) updateData.area_slug = updates.areaSlug;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.phone !== undefined) updateData.owner_phone = updates.phone;
    if (updates.whatsappEnabled !== undefined) updateData.whatsapp_enabled = updates.whatsappEnabled;
    if (updates.whatsappNumber !== undefined) updateData.whatsapp_number = updates.whatsappNumber;
    
    console.log('[Service] 📤 Updating listing with data:', updateData);
    
    // Update the listing - must match owner UUID
    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', listingId)
      .eq('owner_token', userId)
      .select()
      .single();
    
    if (error) {
      console.error('[Service] Error updating listing:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Listing not found or you do not have permission to edit it.');
    }
    
    console.log('[Service] ✅ Listing updated successfully');
    return data;
  } catch (error) {
    console.error('[Service] updateListing error:', error);
    throw error;
  }
}

/**
 * Delete listing images
 * @param {string} listingId - Listing ID
 * @param {Array<string>} imageUrls - Array of image URLs to delete
 * @returns {Promise<void>}
 */
export async function deleteListingImages(listingId, imageUrls) {
  console.log('[Service] deleteListingImages called with:', imageUrls.length, 'images');
  
  try {
    // Delete from listing_images table
    const deletePromises = imageUrls.map(async (imageUrl) => {
      const { error: dbError } = await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', listingId)
        .eq('image_url', imageUrl);
      
      if (dbError) {
        console.error('[Service] Error deleting image record:', dbError);
      }
      
      // Extract the file path from the URL and delete from storage
      try {
        const urlParts = imageUrl.split('/listing-images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0]; // Remove query params if any
          const { error: storageError } = await supabase.storage
            .from('listing-images')
            .remove([filePath]);
          
          if (storageError) {
            console.error('[Service] Error deleting image from storage:', storageError);
          }
        }
      } catch (e) {
        console.error('[Service] Error parsing image URL:', e);
      }
    });
    
    await Promise.all(deletePromises);
    console.log('[Service] ✅ Images deleted successfully');
  } catch (error) {
    console.error('[Service] deleteListingImages error:', error);
    throw error;
  }
}