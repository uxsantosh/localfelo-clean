import { supabase } from '../lib/supabaseClient';
import { getHelperCustomSkills, enhancedTaskMatch, recordHelperTaskInteraction } from './customSkills';

export interface HelperPreferences {
  id: string;
  user_id: string;
  selected_categories: string[]; // ✅ NEW: Category IDs (e.g., ['delivery', 'tech-help'])
  selected_subcategories: string[]; // ✅ NEW: Subcategory IDs (e.g., ['package-delivery', 'computer-repair'])
  max_distance: number; // ✅ FIXED: Changed from max_distance_km to max_distance
  min_budget: number | null;
  max_budget: number | null;
  is_available: boolean; // ✅ NEW: Helper availability status
  latitude: number | null; // ✅ NEW: Helper location
  longitude: number | null; // ✅ NEW: Helper location
  created_at: string;
  updated_at: string;
}

/**
 * Get helper preferences for a user
 */
export async function getHelperPreferences(userId: string): Promise<HelperPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('helper_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching helper preferences:', error);
    return null;
  }
}

/**
 * Save or update helper preferences
 */
export async function saveHelperPreferences(
  userId: string,
  preferences: {
    selected_categories: string[];
    selected_subcategories: string[];
    max_distance: number;
    min_budget: number | null;
    max_budget: number | null;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('helper_preferences')
      .upsert({
        user_id: userId,
        selected_categories: preferences.selected_categories,
        selected_subcategories: preferences.selected_subcategories,
        max_distance: preferences.max_distance,
        min_budget: preferences.min_budget,
        max_budget: preferences.max_budget,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving helper preferences:', error);
    return false;
  }
}

/**
 * Enhanced task matching: category + subcategory matching
 */
export async function doesTaskMatchPreferences(
  task: {
    title: string;
    category: string;
    subcategory?: string;
    distance_km: number;
    budget: number;
  },
  preferences: HelperPreferences,
  userId: string
): Promise<boolean> {
  // Check distance
  const distanceMatch = task.distance_km <= preferences.max_distance;

  // Check budget
  const minBudgetMatch = preferences.min_budget === null || task.budget >= preferences.min_budget;
  const maxBudgetMatch = preferences.max_budget === null || task.budget <= preferences.max_budget;

  if (!distanceMatch || !minBudgetMatch || !maxBudgetMatch) {
    return false;
  }

  // Enhanced skills match: official categories + custom skills
  const customSkills = await getHelperCustomSkills(userId);
  const matchResult = enhancedTaskMatch(
    task.title,
    task.category,
    preferences.selected_categories,
    customSkills
  );

  return matchResult.matches;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Notify matching helpers about a new task
 * This runs in the background after task creation
 */
export async function notifyMatchingHelpers(
  taskId: string,
  taskData: {
    title: string;
    category: string;
    latitude: number;
    longitude: number;
    budget: number;
  }
): Promise<void> {
  try {
    // Get all helpers with preferences who want notifications
    const { data: helpers, error } = await supabase
      .from('helper_preferences')
      .select('user_id, max_distance, min_budget, max_budget, is_available')
      .eq('is_available', true);

    if (error || !helpers) {
      console.error('Error fetching helpers:', error);
      return;
    }

    // Check each helper for match
    const notifications = [];
    for (const helper of helpers) {
      // Calculate distance
      const { data: helperLocation } = await supabase
        .from('users')
        .select('latitude, longitude')
        .eq('id', helper.user_id)
        .single();

      if (!helperLocation?.latitude || !helperLocation?.longitude) continue;

      const distance = calculateDistance(
        taskData.latitude,
        taskData.longitude,
        helperLocation.latitude,
        helperLocation.longitude
      );

      // Check if task matches helper preferences
      const matches = await doesTaskMatchPreferences(
        {
          title: taskData.title,
          category: taskData.category,
          distance_km: distance,
          budget: taskData.budget,
        },
        helper as HelperPreferences,
        helper.user_id
      );

      if (matches) {
        notifications.push({
          user_id: helper.user_id,
          type: 'task_match',
          title: '🎯 New Task Match!',
          message: `${taskData.title} - ₹${taskData.budget}`,
          task_id: taskId,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Batch insert notifications
    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
      console.log(`Notified ${notifications.length} helpers about task ${taskId}`);
    }
  } catch (error) {
    console.error('Error notifying helpers:', error);
  }
}