// =====================================================
// ROLES SERVICE
// =====================================================
// Role-based UI layer for Professionals module
// Maps user-friendly roles to backend subcategories

import { supabase } from '../lib/supabaseClient';

export interface Role {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleSubcategory {
  id: string;
  role_id: string;
  category_id: string;
  subcategory_id: string;
  created_at: string;
}

export interface RoleWithSubcategories extends Role {
  subcategories: Array<{
    category_id: string;
    subcategory_id: string;
  }>;
}

/**
 * Get all active roles
 */
export async function getAllRoles(): Promise<{ success: boolean; roles?: Role[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return { success: false, error: error.message };
    }

    return { success: true, roles: data || [] };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return { success: false, error: 'Failed to fetch roles' };
  }
}

/**
 * Get role by ID with subcategories
 */
export async function getRoleById(roleId: string): Promise<{ success: boolean; role?: RoleWithSubcategories; error?: string }> {
  try {
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError) {
      console.error('Error fetching role:', roleError);
      return { success: false, error: roleError.message };
    }

    const { data: subcategoryData, error: subcategoryError } = await supabase
      .from('role_subcategories')
      .select('category_id, subcategory_id')
      .eq('role_id', roleId);

    if (subcategoryError) {
      console.error('Error fetching role subcategories:', subcategoryError);
      return { success: false, error: subcategoryError.message };
    }

    const role: RoleWithSubcategories = {
      ...roleData,
      subcategories: subcategoryData || []
    };

    return { success: true, role };
  } catch (error) {
    console.error('Error fetching role:', error);
    return { success: false, error: 'Failed to fetch role' };
  }
}

/**
 * Get role by name
 */
export async function getRoleByName(name: string): Promise<{ success: boolean; role?: RoleWithSubcategories; error?: string }> {
  try {
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (roleError) {
      console.error('Error fetching role:', roleError);
      return { success: false, error: roleError.message };
    }

    const { data: subcategoryData, error: subcategoryError } = await supabase
      .from('role_subcategories')
      .select('category_id, subcategory_id')
      .eq('role_id', roleData.id);

    if (subcategoryError) {
      console.error('Error fetching role subcategories:', subcategoryError);
      return { success: false, error: subcategoryError.message };
    }

    const role: RoleWithSubcategories = {
      ...roleData,
      subcategories: subcategoryData || []
    };

    return { success: true, role };
  } catch (error) {
    console.error('Error fetching role:', error);
    return { success: false, error: 'Failed to fetch role' };
  }
}

/**
 * Get subcategories for a role
 */
export async function getRoleSubcategories(roleId: string): Promise<{ success: boolean; subcategories?: RoleSubcategory[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('role_subcategories')
      .select('*')
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching role subcategories:', error);
      return { success: false, error: error.message };
    }

    return { success: true, subcategories: data || [] };
  } catch (error) {
    console.error('Error fetching role subcategories:', error);
    return { success: false, error: 'Failed to fetch role subcategories' };
  }
}

/**
 * Find role by subcategory
 * Returns the role that contains the given subcategory
 */
export async function findRoleBySubcategory(categoryId: string, subcategoryId: string): Promise<{ success: boolean; role?: Role; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('role_subcategories')
      .select('role_id, roles(*)')
      .eq('category_id', categoryId)
      .eq('subcategory_id', subcategoryId)
      .eq('roles.is_active', true)
      .limit(1)
      .single();

    if (error) {
      console.error('Error finding role by subcategory:', error);
      return { success: false, error: error.message };
    }

    if (!data || !data.roles) {
      return { success: false, error: 'Role not found' };
    }

    return { success: true, role: data.roles as any };
  } catch (error) {
    console.error('Error finding role by subcategory:', error);
    return { success: false, error: 'Failed to find role' };
  }
}

/**
 * Get professionals by role
 */
export async function getProfessionalsByRole(roleId: string, city?: string, limit: number = 50): Promise<{ success: boolean; professionals?: any[]; error?: string }> {
  try {
    // First get the role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError) {
      console.error('Error fetching role:', roleError);
      return { success: false, error: roleError.message };
    }

    // Get subcategories for this role
    const { data: subcategories, error: subError } = await supabase
      .from('role_subcategories')
      .select('category_id, subcategory_id')
      .eq('role_id', roleId);

    if (subError) {
      console.error('Error fetching role subcategories:', subError);
      return { success: false, error: subError.message };
    }

    if (!subcategories || subcategories.length === 0) {
      return { success: true, professionals: [] };
    }

    // Build query to find professionals with matching subcategories
    let query = supabase
      .from('professionals')
      .select('*')
      .eq('is_active', true);

    // Filter by city if provided
    if (city) {
      query = query.eq('city', city);
    }

    // Filter by subcategories
    // Since subcategory_ids is an array, we need to check if any of the role's subcategories are in it
    const subcategoryIds = subcategories.map(s => s.subcategory_id);
    query = query.overlaps('subcategory_ids', subcategoryIds);

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching professionals by role:', error);
      return { success: false, error: error.message };
    }

    // Fetch services and images for each professional
    const professionalsWithDetails = await Promise.all(
      (data || []).map(async (prof) => {
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

        return {
          ...prof,
          role_name: role.name,
          services: services || [],
          images: images || [],
        };
      })
    );

    return { success: true, professionals: professionalsWithDetails };
  } catch (error) {
    console.error('Error fetching professionals by role:', error);
    return { success: false, error: 'Failed to fetch professionals' };
  }
}

/**
 * Get count of professionals for a role in a city
 */
export async function getProfessionalCountByRole(roleId: string, city: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    // Get subcategories for this role
    const { data: subcategories, error: subError } = await supabase
      .from('role_subcategories')
      .select('subcategory_id')
      .eq('role_id', roleId);

    if (subError) {
      console.error('Error fetching role subcategories:', subError);
      return { success: false, error: subError.message };
    }

    if (!subcategories || subcategories.length === 0) {
      return { success: true, count: 0 };
    }

    // Count professionals with matching subcategories in the city
    const subcategoryIds = subcategories.map(s => s.subcategory_id);
    
    const { count, error } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('city', city)
      .overlaps('subcategory_ids', subcategoryIds);

    if (error) {
      console.error('Error counting professionals:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Error counting professionals:', error);
    return { success: false, error: 'Failed to count professionals' };
  }
}

/**
 * Search roles and professionals
 */
export async function searchRolesAndProfessionals(query: string, city?: string): Promise<{
  success: boolean;
  roles?: Role[];
  professionals?: any[];
  error?: string;
}> {
  try {
    const searchTerm = query.toLowerCase().trim();

    // Search roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${searchTerm}%`)
      .order('display_order', { ascending: true });

    if (rolesError) {
      console.error('Error searching roles:', rolesError);
    }

    // Search professionals
    let profQuery = supabase
      .from('professionals')
      .select('*')
      .eq('is_active', true);

    if (city) {
      profQuery = profQuery.eq('city', city);
    }

    // Search in name, title, and services
    profQuery = profQuery.or(`name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,services.cs.{${searchTerm}}`);

    const { data: professionalsData, error: professionalsError } = await profQuery.limit(20);

    if (professionalsError) {
      console.error('Error searching professionals:', professionalsError);
    }

    return {
      success: true,
      roles: rolesData || [],
      professionals: professionalsData || []
    };
  } catch (error) {
    console.error('Error searching:', error);
    return { success: false, error: 'Search failed' };
  }
}

/**
 * Update role image (admin only)
 */
export async function updateRoleImage(roleId: string, imageUrl: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('roles')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', roleId);

    if (error) {
      console.error('Error updating role image:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating role image:', error);
    return { success: false, error: 'Failed to update role image' };
  }
}

/**
 * Create role (admin only)
 */
export async function createRole(
  name: string,
  subcategories: Array<{ category_id: string; subcategory_id: string }>,
  imageUrl?: string,
  displayOrder?: number
): Promise<{ success: boolean; role?: Role; error?: string }> {
  try {
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .insert({
        name,
        image_url: imageUrl,
        display_order: displayOrder || 0,
        is_active: true
      })
      .select()
      .single();

    if (roleError) {
      console.error('Error creating role:', roleError);
      return { success: false, error: roleError.message };
    }

    // Insert subcategories
    if (subcategories && subcategories.length > 0) {
      const subcategoryInserts = subcategories.map(sub => ({
        role_id: roleData.id,
        category_id: sub.category_id,
        subcategory_id: sub.subcategory_id
      }));

      const { error: subError } = await supabase
        .from('role_subcategories')
        .insert(subcategoryInserts);

      if (subError) {
        console.error('Error creating role subcategories:', subError);
        // Rollback: delete the role
        await supabase.from('roles').delete().eq('id', roleData.id);
        return { success: false, error: subError.message };
      }
    }

    return { success: true, role: roleData };
  } catch (error) {
    console.error('Error creating role:', error);
    return { success: false, error: 'Failed to create role' };
  }
}

// =====================================================
// WISHES & TASKS ROLE MAPPING
// =====================================================

/**
 * Get role ID by helper category
 * Maps helper categories (Quick Help, Repair, etc.) to role IDs
 */
export async function getRoleIdByHelperCategory(helperCategory: string): Promise<{ success: boolean; roleId?: string; error?: string }> {
  try {
    // Mapping from helper categories to role names
    // Supports: AI categorization slugs, frontend display names, AND wish category slugs
    const categoryToRoleMap: Record<string, string> = {
      // AI Categorization slugs (from aiCategorization.ts)
      'delivery-pickup': 'Delivery Person',
      'cooking-cleaning': 'Cook',
      'moving-lifting': 'Packer & Mover',
      'tech-help': 'Computer Repair',
      'office-errands': 'Helper',
      'personal-help': 'Helper',
      'repair-handyman': 'Electrician',
      'tutoring-teaching': 'Tutor',
      'gardening-plant-care': 'Gardener',
      'pet-care': 'Helper',
      'event-assistance': 'Event Helper',
      'beauty-grooming': 'Beautician',
      'driving-vehicle': 'Driver',
      'photography-videography': 'Photographer',
      
      // Frontend category names (from taskCategories.ts)
      'quick-help': 'Helper',
      'Quick Help': 'Helper',
      'repair': 'Electrician',
      'Repair': 'Electrician',
      'installation': 'AC Installation',
      'Installation': 'AC Installation',
      'driver-rides': 'Driver',
      'Driver & Rides': 'Driver',
      'cleaning': 'Cleaner',
      'Cleaning': 'Cleaner',
      'pest-control': 'Pest Control',
      'Pest Control': 'Pest Control',
      'tutoring': 'Tutor',
      'Tutoring': 'Tutor',
      'beauty-wellness': 'Beautician',
      'Beauty & Wellness': 'Beautician',
      'events-entertainment': 'Event Helper',
      'Events & Entertainment': 'Event Helper',
      'professional-services': 'Consultant',
      'Professional Services': 'Consultant',
      'home-services': 'Cook',
      'Home Services': 'Cook',
      'photography-video': 'Photographer',
      'Photography & Video': 'Photographer',
      'moving-packing': 'Packer & Mover',
      'Moving & Packing': 'Packer & Mover',
      'painting': 'Painter',
      'Painting': 'Painter',
      'construction': 'Mason',
      'Construction': 'Mason',
      
      // Wish category slugs (from CreateWishScreen.tsx)
      'find-help': 'Helper',
      'Find Help': 'Helper',
      'find-service': 'Electrician', // Generic service provider
      'Find Service': 'Electrician',
      'need-tech-help': 'Computer Repair',
      'Need Tech Help': 'Computer Repair',
      'find-mentor': 'Tutor',
      'Find Mentor': 'Tutor',
      
      // Non-helper wishes (no specific role match)
      'buy-something': 'Other Professional',
      'Want to Buy Something': 'Other Professional',
      'rent-something': 'Other Professional',
      'Rent House': 'Other Professional',
      'Rent Item': 'Other Professional',
      'find-used': 'Other Professional',
      'Find Used Item': 'Other Professional',
      'find-deal': 'Other Professional',
      'Find Deal': 'Other Professional',
      
      // Fallback
      'other': 'Other Professional',
      'Other': 'Other Professional',
      'Other Wish': 'Other Professional',
    };

    const roleName = categoryToRoleMap[helperCategory] || 'Other Professional';

    const { data, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .eq('is_active', true)
      .maybeSingle(); // ✅ FIX: Use maybeSingle() instead of single() to handle 0 rows gracefully

    if (error) {
      console.error('Error finding role by helper category:', error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      // Role not found - this is normal if roles table is empty
      // Try fallback to "Other Professional"
      const { data: fallbackData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'Other Professional')
        .eq('is_active', true)
        .maybeSingle(); // ✅ FIX: Use maybeSingle() here too
      
      if (fallbackData) {
        return { success: true, roleId: fallbackData.id };
      }
      
      // No roles in database at all - return success with null roleId
      // This allows wishes/tasks to be created without roles
      return { success: true, roleId: null };
    }

    return { success: true, roleId: data.id };
  } catch (error) {
    console.error('Error getting role ID by helper category:', error);
    return { success: false, error: 'Failed to get role ID' };
  }
}

/**
 * Get role name from role ID (for display)
 */
export async function getRoleName(roleId: string): Promise<{ success: boolean; name?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();

    if (error) {
      console.error('Error fetching role name:', error);
      return { success: false, error: error.message };
    }

    return { success: true, name: data.name };
  } catch (error) {
    console.error('Error fetching role name:', error);
    return { success: false, error: 'Failed to fetch role name' };
  }
}