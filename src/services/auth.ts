// OldCycle Authentication Service - Password-Based Login
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { storage } from '../utils/storage';

// =====================================================
// TYPES
// =====================================================

export interface LoginResult {
  user: User;
  clientToken: string;
}

// =====================================================
// HELPER METHODS
// =====================================================

/**
 * Generate client token
 */
function generateClientToken(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save user data to storage (Capacitor Preferences on native, localStorage on web)
 */
async function saveUserData(user: User, clientToken: string): Promise<void> {
  await storage.setItem('oldcycle_user', JSON.stringify(user));
  await storage.setItem('oldcycle_token', clientToken);
  await storage.setItem('userId', user.id); // ✅ CRITICAL: Save userId for push notifications
  await storage.setItem('clientToken', clientToken); // ✅ CRITICAL: Save clientToken for push notifications
}

/**
 * Get current user from storage
 */
export async function getCurrentUser(): Promise<User | null> {
  const userStr = await storage.getItem('oldcycle_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get current user from storage synchronously
 */
export function getCurrentUserSync(): User | null {
  // On web, localStorage is synchronous
  // On native, this won't work properly, so we should use getCurrentUser() instead
  try {
    const userStr = localStorage.getItem('oldcycle_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get client token from storage
 */
export async function getClientToken(): Promise<string | null> {
  return await storage.getItem('oldcycle_token');
}

/**
 * Get owner token from current user's profile
 */
export async function getOwnerToken(): Promise<string | null> {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    console.log('[getOwnerToken] No current user');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('owner_token, id')
      .eq('id', currentUser.id)
      .single();

    console.log('[getOwnerToken] Profile query result:', { data, error });

    if (error) {
      console.error('[getOwnerToken] Error fetching owner token:', error);
      // If column doesn't exist, use user ID as fallback (UUID)
      if (error.code === '42703') {
        console.warn('[getOwnerToken] owner_token column not found, using user ID as fallback');
        return currentUser.id; // ✅ FIX: Return UUID, not client_token
      }
      return null;
    }

    if (!data || !data.owner_token) {
      console.warn('[getOwnerToken] No owner token found in profile, using user ID as fallback');
      console.log('[getOwnerToken] Data received:', data);
      return currentUser.id; // ✅ FIX: Return UUID, not client_token
    }

    console.log('[getOwnerToken] Successfully retrieved owner_token:', data.owner_token);
    return data.owner_token;
  } catch (error) {
    console.error('[getOwnerToken] Exception:', error);
    return currentUser.id; // ✅ FIX: Return UUID, not client_token
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  const token = await getClientToken();
  return !!user && !!token;
}

/**
 * Check if current user is admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const currentUser = await getCurrentUser();
  
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

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  // Sign out from Supabase Auth (if any session exists)
  await supabase.auth.signOut();
  
  // Clear storage
  await storage.removeItem('oldcycle_user');
  await storage.removeItem('oldcycle_token');
  await storage.removeItem('userId');
  await storage.removeItem('clientToken');
  console.log('✅ User logged out');
}

// =====================================================
// PASSWORD-BASED AUTHENTICATION (NEW)
// =====================================================

/**
 * Login with client token (after password verification)
 */
export async function loginWithClientToken(clientToken: string): Promise<LoginResult> {
  console.log('🔐 Logging in with client token...');

  try {
    // Fetch profile by client_token
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_token', clientToken)
      .single();

    if (error || !profile) {
      console.error('❌ Profile not found:', error);
      throw new Error('Invalid credentials');
    }

    const user: User = {
      id: profile.id,
      name: profile.display_name || profile.name || profile.email?.split('@')[0] || profile.phone_number || 'User',
      email: profile.email || '',
      phone: profile.phone_number || profile.phone || '',
      whatsappSame: profile.whatsapp_same ?? true,
      whatsappNumber: profile.whatsapp_number || undefined,
      authUserId: profile.id,
      clientToken: clientToken,
      profilePic: profile.avatar_url || undefined,
      avatar_url: profile.avatar_url || undefined, // ✅ ADD: Avatar URL
      gender: profile.gender || undefined, // ✅ ADD: Gender
      reliabilityScore: profile.reliability_score || undefined,
      isVerified: profile.is_verified || false,
      isTrusted: profile.is_trusted || false,
      city: profile.city || undefined,
      area: profile.area || undefined,
    };

    await saveUserData(user, clientToken);

    console.log('✅ User logged in successfully with client token');
    return { user, clientToken };
  } catch (error: any) {
    console.error('❌ loginWithClientToken failed:', error);
    throw error;
  }
}

// =====================================================
// LEGACY METHODS (Keep for backward compatibility)
// =====================================================

/**
 * Check if email is already registered
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  console.log('🔍 Checking if email exists:', email);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error);
      return false;
    }

    const exists = !!(data && data.length > 0);
    console.log(exists ? '✅ Email found in database' : '❌ Email not found in database');
    return exists;
  } catch (error: any) {
    console.error('❌ checkEmailExists failed:', error.message);
    return false;
  }
}

/**
 * Send verification email to new user (they'll set password via link)
 */
export async function sendVerificationEmail(email: string): Promise<void> {
  console.log('📧 Sending verification email to:', email);
  
  // Generate a temporary random password
  const tempPassword = `temp_${Math.random().toString(36).slice(2, 15)}_${Date.now()}`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: tempPassword,
    options: {
      emailRedirectTo: `${window.location.origin}/`, // Redirect to home page
      data: {
        needs_password_setup: true, // Flag to show password setup UI
      }
    },
  });

  if (error) {
    console.error('❌ Signup error details:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    
    // If user exists but email not confirmed, resend confirmation
    if (error.message?.toLowerCase().includes('already') || 
        error.message?.toLowerCase().includes('registered') ||
        error.status === 400) {
      console.log('🔄 User might exist, attempting to resend...');
      try {
        await resendVerificationEmail(email);
        console.log('✅ Resend successful!');
        return;
      } catch (resendError: any) {
        console.error('❌ Resend also failed:', resendError);
        // If resend also fails, just show success to user anyway
        // (Supabase won't send duplicate emails if already sent recently)
        console.log('⚠️ Treating as success to avoid confusing user');
        return;
      }
    }
    
    throw error;
  }

  // Check if user was created but email not confirmed
  if (data.user && !data.user.confirmed_at && data.session === null) {
    console.log('✅ Verification email sent (user needs to confirm)');
  } else {
    console.log('✅ Verification email sent successfully');
  }
}

/**
 * Resend verification email for existing unconfirmed user
 */
export async function resendVerificationEmail(email: string): Promise<void> {
  console.log('🔄 Resending verification email to:', email);
  
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    }
  });

  if (error) {
    console.error('❌ Resend error details:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    
    // If error says email already confirmed or similar, treat as success
    if (error.message?.toLowerCase().includes('confirmed') || 
        error.message?.toLowerCase().includes('verified')) {
      console.log('⚠️ Email already confirmed, user should try logging in');
      throw new Error('This email is already verified. Please try logging in with your password.');
    }
    
    throw error;
  }

  console.log('✅ Verification email resent successfully:', data);
}

/**
 * Login with email and password
 */
export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
  console.log('🔐 Logging in with password:', email);

  // Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Login error:', error);
    throw error;
  }

  if (!data.user) {
    throw new Error('No user returned after login');
  }

  console.log('✅ Supabase login successful');

  // Get or create profile
  let profile = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const clientToken = generateClientToken();

  // If profile doesn't exist, create it
  if (profile.error) {
    console.log('📝 Creating new profile...');
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        client_token: clientToken,
        // owner_token will be auto-generated by database
      })
      .select()
      .single();

    if (insertError) throw insertError;
    profile.data = newProfile;
  } else {
    // Update client token
    await supabase
      .from('profiles')
      .update({ client_token: clientToken })
      .eq('id', data.user.id);
  }

  const user: User = {
    id: data.user.id,
    name: profile.data.name || data.user.user_metadata?.name || 'User',
    email: data.user.email!,
    phone: profile.data.phone || '',
    whatsappSame: profile.data.whatsapp_same ?? true,
    authUserId: data.user.id,
    clientToken: clientToken,
  };

  await saveUserData(user, clientToken);

  console.log('✅ User logged in successfully');
  return { user, clientToken };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  console.log('📧 Sending password reset email to:', email);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });

  if (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }

  console.log('✅ Password reset email sent successfully');
}

/**
 * Set password for newly verified user
 */
export async function setNewPassword(password: string): Promise<void> {
  console.log('🔐 Setting new password...');
  
  const { error } = await supabase.auth.updateUser({
    password: password,
    data: {
      needs_password_setup: false, // Clear the flag
    }
  });

  if (error) {
    console.error('❌ Error setting password:', error);
    throw error;
  }

  console.log('✅ Password set successfully');
}

/**
 * Check if current user needs to set password
 */
export async function needsPasswordSetup(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  return user.user_metadata?.needs_password_setup === true;
}

// =====================================================
// PROFILE MANAGEMENT
// =====================================================

/**
 * Update user profile in database
 */
export async function updateUserProfileInDB(updates: Partial<User>): Promise<void> {
  const currentUser = await getCurrentUser();
  const clientToken = await getClientToken();

  if (!currentUser || !clientToken) {
    throw new Error('User not authenticated');
  }

  console.log('💾 Updating user profile...', updates);

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        phone: updates.phone,
        whatsapp_same: updates.whatsappSame,
      })
      .eq('id', currentUser.id);

    if (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }

    // Update storage
    const updatedUser = {
      ...currentUser,
      ...updates,
    };
    await storage.setItem('oldcycle_user', JSON.stringify(updatedUser));

    console.log('✅ Profile updated successfully');
  } catch (error) {
    console.error('❌ updateUserProfileInDB failed:', error);
    throw error;
  }
}