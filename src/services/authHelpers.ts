// =====================================================
// AUTH HELPERS - Shared Functions for All Auth Methods
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

// =====================================================
// LOCAL STORAGE HELPERS
// =====================================================

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('oldcycle_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getClientToken(): string | null {
  return localStorage.getItem('oldcycle_token');
}

export function isAuthenticated(): boolean {
  return !!getCurrentUser() && !!getClientToken();
}

// =====================================================
// ADMIN CHECK
// =====================================================

export async function checkIsAdmin(): Promise<boolean> {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', currentUser.id)
      .single();

    if (error || !data) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }

    return data.is_admin === true;
  } catch (error) {
    console.error('❌ checkIsAdmin failed:', error);
    return false;
  }
}

// =====================================================
// LOGOUT
// =====================================================

export async function logout(): Promise<void> {
  // Sign out from Supabase Auth (if using Google OAuth)
  await supabase.auth.signOut();
  
  // Clear localStorage
  localStorage.removeItem('oldcycle_user');
  localStorage.removeItem('oldcycle_token');
  console.log('✅ User logged out');
}

// =====================================================
// PROFILE UPDATES
// =====================================================

export async function updateUserProfileInDB(updates: {
  name?: string;
  email?: string;
  phone?: string;
  whatsappSame?: boolean;
}): Promise<void> {
  const currentUser = getCurrentUser();
  const clientToken = getClientToken();

  if (!currentUser || !clientToken) {
    throw new Error('Not authenticated');
  }

  console.log('📝 Updating user profile in database:', updates);

  // Build the update object based on what fields are provided
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.whatsappSame !== undefined) updateData.whatsapp_same = updates.whatsappSame;

  // Update in database
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', currentUser.id)
    .eq('client_token', clientToken);

  if (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }

  // Update localStorage with new data
  const updatedUser: User = {
    ...currentUser,
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.email !== undefined && { email: updates.email }),
    ...(updates.phone !== undefined && { phone: updates.phone }),
    ...(updates.whatsappSame !== undefined && { whatsappSame: updates.whatsappSame }),
  };

  localStorage.setItem('oldcycle_user', JSON.stringify(updatedUser));
  localStorage.setItem('oldcycle_token', clientToken);

  console.log('✅ Profile updated successfully');
}
