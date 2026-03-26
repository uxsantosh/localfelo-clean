// =====================================================
// Professionals Service - LocalFelo
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { calculateDistance } from '../utils/distance';

// Types
export interface ProfessionalService {
  id: string;
  professional_id: string;
  service_name: string;
  price?: number;
}

export interface ProfessionalImage {
  id: string;
  professional_id: string;
  image_url: string;
}

export interface Professional {
  id: string;
  user_id: string;
  name: string;
  title: string;
  slug: string;
  category_id: string;
  category_name?: string;
  category_emoji?: string;
  subcategory_id?: string;
  subcategory_name?: string;
  subcategory_ids?: string[]; // Array of subcategory IDs
  role_id?: string; // NEW: Role ID for role-based UI
  role_name?: string; // NEW: Role name for display
  description?: string;
  whatsapp: string;
  profile_image_url?: string;
  city: string;
  city_name?: string;
  area?: string;
  area_name?: string;
  subarea?: string;
  subarea_name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  is_active: boolean;
  created_at: string;
  services?: ProfessionalService[];
  images?: ProfessionalImage[];
  distance?: number;
  // Verification fields
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | 'reupload_requested';
  verification_message?: string;
  verification_requested_at?: string;
  verification_completed_at?: string;
  is_blocked?: boolean;
}

export interface CreateProfessionalData {
  name: string;
  title: string;
  category_id: string;
  subcategory_id?: string;
  subcategory_ids?: string[]; // NEW: Array of subcategory IDs
  role_id?: string; // NEW: Role ID
  description?: string;
  whatsapp: string;
  profile_image_url?: string;
  city: string;
  area?: string;
  subarea?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  services: { service_name: string; price?: number }[];
  images?: string[];
}

// =====================================================
// Create Professional
// =====================================================
export async function createProfessional(
  userId: string,
  data: CreateProfessionalData
): Promise<{ success: boolean; professional?: Professional; error?: string }> {
  try {
    console.log('🔍 createProfessional called with userId:', userId);
    console.log('🔍 createProfessional data:', data);
    
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const insertData = {
      user_id: userId,
      name: data.name,
      title: data.title,
      slug,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      subcategory_ids: data.subcategory_ids, // NEW: Array of subcategory IDs
      role_id: data.role_id, // NEW: Role ID
      description: data.description,
      whatsapp: data.whatsapp,
      profile_image_url: data.profile_image_url,
      city: data.city,
      area: data.area,
      subarea: data.subarea,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      is_active: true,
    };
    
    console.log('🔍 About to insert into professionals table:', insertData);

    // Create professional profile
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .insert(insertData)
      .select()
      .single();

    if (profError) {
      console.error('❌ Supabase error:', profError);
      throw profError;
    }
    
    console.log('✅ Professional created successfully:', professional);

    // Add services
    if (data.services && data.services.length > 0) {
      const servicesData = data.services.map((service) => ({
        professional_id: professional.id,
        service_name: service.service_name,
        price: service.price,
      }));

      const { error: servicesError } = await supabase
        .from('professional_services')
        .insert(servicesData);

      if (servicesError) console.error('Services error:', servicesError);
    }

    // Add gallery images
    if (data.images && data.images.length > 0) {
      const imagesData = data.images.map((url) => ({
        professional_id: professional.id,
        image_url: url,
      }));

      const { error: imagesError } = await supabase
        .from('professional_images')
        .insert(imagesData);

      if (imagesError) console.error('Images error:', imagesError);
    }

    return { success: true, professional };
  } catch (error: any) {
    console.error('Error creating professional:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// Get Professionals by Category and City
// =====================================================
export async function getProfessionalsByCategory(
  categoryId: string,
  city: string,
  filters?: {
    subcategoryId?: string;
    userLat?: number;
    userLng?: number;
    maxDistance?: number;
  }
): Promise<Professional[]> {
  try {
    let query = supabase
      .from('professionals')
      .select('*')
      .eq('category_id', categoryId)
      .eq('city', city)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.subcategoryId) {
      query = query.eq('subcategory_id', filters.subcategoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data) return [];

    // Fetch services and images for each professional
    const professionalsWithDetails = await Promise.all(
      data.map(async (prof) => {
        // Get services
        const { data: services } = await supabase
          .from('professional_services')
          .select('*')
          .eq('professional_id', prof.id);

        // Get images
        const { data: images } = await supabase
          .from('professional_images')
          .select('*')
          .eq('professional_id', prof.id);

        // Calculate distance if user location provided
        let distance;
        if (filters?.userLat && filters?.userLng && prof.latitude && prof.longitude) {
          distance = calculateDistance(
            filters.userLat,
            filters.userLng,
            prof.latitude,
            prof.longitude
          );
        }

        return {
          ...prof,
          services: services || [],
          images: images || [],
          distance,
        };
      })
    );

    // Filter by distance if specified
    let filtered = professionalsWithDetails;
    if (filters?.maxDistance && filters?.userLat && filters?.userLng) {
      filtered = professionalsWithDetails.filter(
        (prof) => prof.distance && prof.distance <= filters.maxDistance!
      );
    }

    // Sort by distance if available
    if (filters?.userLat && filters?.userLng) {
      filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }
}

// =====================================================
// Get Professional by Slug
// =====================================================
export async function getProfessionalBySlug(
  slug: string
): Promise<Professional | null> {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Get services
    const { data: services } = await supabase
      .from('professional_services')
      .select('*')
      .eq('professional_id', data.id);

    // Get images
    const { data: images } = await supabase
      .from('professional_images')
      .select('*')
      .eq('professional_id', data.id);

    return {
      ...data,
      services: services || [],
      images: images || [],
    };
  } catch (error) {
    console.error('Error fetching professional:', error);
    return null;
  }
}

// =====================================================
// Get All Professionals (Admin)
// =====================================================
export async function getAllProfessionals(): Promise<Professional[]> {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching all professionals:', error);
    return [];
  }
}

// =====================================================
// Get User's Professional Profiles
// =====================================================
export async function getUserProfessionals(
  userId: string
): Promise<{ success: boolean; professionals?: Professional[]; error?: string }> {
  try {
    console.log('🔍 Fetching all professional profiles for user:', userId);
    
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, professionals: [] };
    }

    // Fetch services for each professional
    const professionalsWithDetails = await Promise.all(
      data.map(async (prof) => {
        const { data: services } = await supabase
          .from('professional_services')
          .select('*')
          .eq('professional_id', prof.id);

        const { data: images } = await supabase
          .from('professional_images')
          .select('*')
          .eq('professional_id', prof.id);

        return {
          ...prof,
          services: services || [],
          images: images || [],
        };
      })
    );

    console.log(`✅ Found ${professionalsWithDetails.length} professional profiles`);
    return { success: true, professionals: professionalsWithDetails };
  } catch (error: any) {
    console.error('Error fetching user professionals:', error);
    return { success: false, error: error.message || 'Failed to fetch professional profiles' };
  }
}

// =====================================================
// Delete Professional Profile
// =====================================================
export async function deleteProfessional(
  professionalId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Deleting professional profile:', professionalId);
    
    // Delete will cascade to services and images due to ON DELETE CASCADE
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', professionalId);

    if (error) throw error;

    console.log('✅ Professional profile deleted successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting professional:', error);
    return { success: false, error: error.message || 'Failed to delete professional profile' };
  }
}

// =====================================================
// Update Professional Status (Admin)
// =====================================================
export async function updateProfessionalStatus(
  professionalId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 Updating professional status:', professionalId, 'to', isActive);
    
    const { error } = await supabase
      .from('professionals')
      .update({ is_active: isActive })
      .eq('id', professionalId);

    if (error) throw error;

    console.log('✅ Professional status updated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating professional status:', error);
    return { success: false, error: error.message || 'Failed to update professional status' };
  }
}

// =====================================================
// Get Category Image
// =====================================================
export async function getCategoryImage(categoryId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('professional_categories_images')
      .select('image_url')
      .eq('category_id', categoryId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle "not found" gracefully

    if (error) {
      console.warn(`Failed to load category image for ${categoryId}:`, error);
      return null;
    }

    return data?.image_url || null;
  } catch (error) {
    console.warn(`Error loading category image for ${categoryId}:`, error);
    return null;
  }
}

// =====================================================
// Upload Category Image (Admin)
// =====================================================
export async function uploadCategoryImage(
  roleName: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update the role's image_url in the roles table
    const { error } = await supabase
      .from('roles')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('name', roleName);

    if (error) {
      console.error('Error uploading role image:', error);
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error uploading role image:', error);
    return { success: false, error: error.message };
  }
}