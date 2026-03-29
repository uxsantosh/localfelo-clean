// =====================================================
// ROLES SERVICE - FINAL WORKING VERSION (NO DB MAPPING)
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { ROLE_TO_SUBCATEGORIES } from './professionalRoles';

export interface Role {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// GET ALL ROLES
// =====================================================

export async function getAllRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('❌ getAllRoles error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, roles: data || [] };
}

// =====================================================
// GET ROLE BY ID
// =====================================================

export async function getRoleById(roleId: string) {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error) {
    console.error('❌ getRoleById error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, role: data };
}

// =====================================================
// UPDATE ROLE IMAGE
// =====================================================

export async function updateRoleImage(roleId: string, imageUrl: string) {
  const { error } = await supabase
    .from('roles')
    .update({ image_url: imageUrl })
    .eq('id', roleId);

  if (error) {
    console.error('❌ updateRoleImage error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// =====================================================
// CREATE ROLE
// =====================================================

export async function createRole(name: string) {
  const { data, error } = await supabase
    .from('roles')
    .insert({ name, is_active: true })
    .select()
    .single();

  if (error) {
    console.error('❌ createRole error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, role: data };
}

// =====================================================
// 🔥 FINAL FIXED FUNCTION (USES CODE MAPPING ONLY)
// =====================================================

export async function getProfessionalsByRole(
  roleName: string,
  city?: string
) {
  try {
    console.log('🔥 ROLE NAME:', roleName);

    // ✅ Get mapping from code (NOT DB)
    const mappedSubcategories = ROLE_TO_SUBCATEGORIES[roleName];

    console.log('🔥 MAPPED:', mappedSubcategories);

    if (!mappedSubcategories || mappedSubcategories.length === 0) {
      console.warn('❌ No mapping found for role:', roleName);
      return { success: true, professionals: [] };
    }

    // Normalize: "category:subcategory" → "subcategory"
    const subcategoryIds = mappedSubcategories.map((id: string) =>
      id.includes(':') ? id.split(':')[1] : id
    );

    console.log('🔥 NORMALIZED:', subcategoryIds);

    let query = supabase
      .from('professionals')
      .select('*')
      .eq('is_active', true);

    // City filter
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Build OR filter
    const filter = subcategoryIds
      .map(id => `subcategory_ids.cs.{${id}}`)
      .join(',');

    console.log('🔥 FILTER:', filter);

    query = query.or(filter);

    const { data, error } = await query;

    console.log('🔥 RESULT:', data);

    if (error) {
      console.error('❌ Query error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, professionals: data || [] };

  } catch (err) {
    console.error('❌ getProfessionalsByRole error:', err);
    return { success: false, error: 'Failed to fetch professionals' };
  }
}