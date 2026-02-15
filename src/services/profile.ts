// =====================================================
// Profile Service - Enhanced User Profiles
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { User, UserActivityLog, Task, Wish } from '../types';

// =====================================================
// Get Profile by ID (for validation checks)
// =====================================================
export async function getProfileById(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (error) {
      // Profile doesn't exist
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching profile by id:', error);
    return null;
  }
}

// =====================================================
// Helper Preferences
// =====================================================
export async function getHelperPreferences(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('helper_preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.helper_preferences || [];
  } catch (error) {
    console.error('Error fetching helper preferences:', error);
    return [];
  }
}

export async function updateHelperPreferences(userId: string, preferences: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ helper_preferences: preferences })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating helper preferences:', error);
    return false;
  }
}

// =====================================================
// Get Enhanced User Profile
// =====================================================
export async function getEnhancedProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsappSame: data.whatsapp_same,
      whatsappNumber: data.whatsapp_number,
      authUserId: data.auth_user_id,
      clientToken: data.client_token,
      profilePic: data.avatar_url, // Fixed: Use avatar_url from database
      reliabilityScore: data.reliability_score || 100,
      isVerified: data.is_verified || false,
      isTrusted: data.is_trusted || false,
      totalTasksCompleted: data.total_tasks_completed || 0,
      totalWishesGranted: data.total_wishes_granted || 0,
      badgeNotes: data.badge_notes,
    };
  } catch (error) {
    console.error('Error fetching enhanced profile:', error);
    return null;
  }
}

// =====================================================
// Get User Activity Logs
// =====================================================
export async function getUserActivityLogs(userId: string, limit = 20): Promise<UserActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((log: any) => ({
      id: log.id,
      userId: log.user_id,
      activityType: log.activity_type,
      activityDescription: log.activity_description,
      metadata: log.metadata,
      createdAt: log.created_at,
    }));
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

// =====================================================
// Get User Task History
// =====================================================
export async function getUserTaskHistory(userId: string, limit = 10): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        categories(name, emoji),
        areas(name, cities(name))
      `)
      .or(`user_id.eq.${userId},helper_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      categoryId: task.category_id,
      categoryName: task.categories?.name || '',
      categoryEmoji: task.categories?.emoji || '📦',
      cityId: task.city_id,
      cityName: task.areas?.cities?.name || '',
      areaId: task.area_id,
      areaName: task.areas?.name || '',
      budgetMin: task.budget_min,
      budgetMax: task.budget_max,
      status: task.status,
      userId: task.user_id,
      helperId: task.helper_id,
      createdAt: task.created_at,
      latitude: task.latitude,
      longitude: task.longitude,
      completedAt: task.completed_at,
    }));
  } catch (error) {
    console.error('Error fetching task history:', error);
    return [];
  }
}

// =====================================================
// Get User Wish History
// =====================================================
export async function getUserWishHistory(userId: string, limit = 10): Promise<Wish[]> {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select(`
        *,
        categories(name, emoji),
        areas(name, cities(name))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((wish: any) => ({
      id: wish.id,
      title: wish.title,
      description: wish.description,
      categoryId: wish.category_id,
      categoryName: wish.categories?.name || '',
      categoryEmoji: wish.categories?.emoji || '❤️',
      cityId: wish.city_id,
      cityName: wish.areas?.cities?.name || '',
      areaId: wish.area_id,
      areaName: wish.areas?.name || '',
      budgetMin: wish.budget_min,
      budgetMax: wish.budget_max,
      urgency: wish.urgency,
      status: wish.status,
      userId: wish.user_id,
      createdAt: wish.created_at,
      isHidden: wish.is_hidden,
      latitude: wish.latitude,
      longitude: wish.longitude,
      acceptedBy: wish.accepted_by,
      acceptedAt: wish.accepted_at,
    }));
  } catch (error) {
    console.error('Error fetching wish history:', error);
    return [];
  }
}

// =====================================================
// Log User Activity (Internal Use)
// =====================================================
export async function logUserActivity(
  userId: string,
  activityType: string,
  activityDescription: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      activity_type: activityType,
      activity_description: activityDescription,
      metadata,
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}

// =====================================================
// ADMIN: Update Reliability Score
// =====================================================
export async function updateReliabilityScore(
  userId: string,
  newScore: number,
  adminNote?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ reliability_score: Math.max(0, Math.min(100, newScore)) })
      .eq('id', userId);

    if (error) throw error;

    // Log the activity
    await logUserActivity(
      userId,
      'reliability_updated',
      `Reliability score updated to ${newScore}`,
      { adminNote }
    );

    return true;
  } catch (error) {
    console.error('Error updating reliability score:', error);
    return false;
  }
}

// =====================================================
// ADMIN: Toggle Verified Badge
// =====================================================
export async function toggleVerifiedBadge(
  userId: string,
  isVerified: boolean,
  note?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_verified: isVerified,
        badge_notes: note || null,
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the activity
    await logUserActivity(
      userId,
      'badge_updated',
      `Verified badge ${isVerified ? 'granted' : 'revoked'}`,
      { note }
    );

    return true;
  } catch (error) {
    console.error('Error toggling verified badge:', error);
    return false;
  }
}

// =====================================================
// ADMIN: Toggle Trusted Badge
// =====================================================
export async function toggleTrustedBadge(
  userId: string,
  isTrusted: boolean,
  note?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_trusted: isTrusted,
        badge_notes: note || null,
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the activity
    await logUserActivity(
      userId,
      'badge_updated',
      `Trusted badge ${isTrusted ? 'granted' : 'revoked'}`,
      { note }
    );

    return true;
  } catch (error) {
    console.error('Error toggling trusted badge:', error);
    return false;
  }
}

// =====================================================
// ADMIN: Block User
// =====================================================
export async function blockUser(
  userId: string,
  reason: string,
  adminId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_blocked: true,
        suspension_reason: reason,
        blocked_by: adminId,
        blocked_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the activity
    await logUserActivity(
      userId,
      'user_blocked',
      `User blocked: ${reason}`,
      { blockedBy: adminId }
    );

    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
}

// =====================================================
// ADMIN: Unblock User
// =====================================================
export async function unblockUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_blocked: false,
        suspension_reason: null,
        blocked_by: null,
        blocked_at: null,
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the activity
    await logUserActivity(
      userId,
      'user_unblocked',
      'User unblocked'
    );

    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
}

// =====================================================
// ADMIN: Suspend User (Temporary)
// =====================================================
export async function suspendUser(
  userId: string,
  reason: string,
  durationDays: number,
  adminId: string
): Promise<boolean> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const { error } = await supabase
      .from('profiles')
      .update({
        is_suspended: true,
        suspension_reason: reason,
        suspension_expires_at: expiresAt.toISOString(),
        blocked_by: adminId,
        blocked_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the activity
    await logUserActivity(
      userId,
      'user_suspended',
      `User suspended for ${durationDays} days: ${reason}`,
      { suspendedBy: adminId, expiresAt: expiresAt.toISOString() }
    );

    return true;
  } catch (error) {
    console.error('Error suspending user:', error);
    return false;
  }
}

// =====================================================
// ADMIN: Unsuspend User
// =====================================================
export async function unsuspendUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_suspended: false,
        suspension_reason: null,
        suspension_expires_at: null,
        blocked_by: null,
        blocked_at: null,
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the activity
    await logUserActivity(
      userId,
      'user_unsuspended',
      'User suspension lifted'
    );

    return true;
  } catch (error) {
    console.error('Error unsuspending user:', error);
    return false;
  }
}