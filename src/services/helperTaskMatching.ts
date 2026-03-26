import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';

/**
 * HELPER TASK MATCHING v3.0
 * Uses database view for category/subcategory matching
 */

export interface MatchedTask extends Task {
  match_score: number;
  distance_km: number | null;
}

export interface HelperPreferences {
  selected_categories: string[];
  selected_subcategories: string[];
  max_distance: number;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Get matching tasks for a helper using the database view
 */
export async function getMatchingTasksForHelper(
  userId: string,
  limit: number = 50
): Promise<MatchedTask[]> {
  try {
    // Call the database function
    const { data, error } = await supabase.rpc('get_matching_tasks_for_helper', {
      p_helper_user_id: userId,
      p_limit: limit
    });

    if (error) {
      console.error('Error fetching matching tasks:', error);
      return [];
    }

    // Transform the data to match our Task type
    const tasks: MatchedTask[] = (data || []).map((row: any) => ({
      id: row.task_id,
      title: row.task_title,
      detected_category: row.task_category,
      subcategory: row.task_subcategory,
      price: row.task_budget,
      latitude: row.task_lat,
      longitude: row.task_lon,
      created_at: row.created_at,
      match_score: row.match_score,
      distance_km: row.distance_km,
      // Add default values for required Task fields
      status: 'open',
      userId: '', // Will be populated if needed
      description: '',
    }));

    return tasks;
  } catch (error) {
    console.error('Error in getMatchingTasksForHelper:', error);
    return [];
  }
}

/**
 * Get helper preferences for filtering
 */
export async function getHelperPreferences(userId: string): Promise<HelperPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('helper_preferences')
      .select('selected_categories, selected_subcategories, max_distance, latitude, longitude')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching helper preferences:', error);
      return null;
    }

    return {
      selected_categories: data.selected_categories || [],
      selected_subcategories: data.selected_subcategories || [],
      max_distance: data.max_distance || 10,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('Error in getHelperPreferences:', error);
    return null;
  }
}

/**
 * Update helper location for distance-based matching
 */
export async function updateHelperLocation(
  userId: string,
  latitude: number,
  longitude: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('helper_preferences')
      .update({
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating helper location:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateHelperLocation:', error);
    return false;
  }
}

/**
 * Get all tasks (for public browsing without helper preferences)
 */
export async function getAllPublicTasks(
  filters?: {
    categories?: string[];
    subcategories?: string[];
    maxDistance?: number;
    userLat?: number;
    userLon?: number;
    limit?: number;
  }
): Promise<Task[]> {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    // Apply category filter if provided
    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('detected_category', filters.categories);
    }

    // Apply subcategory filter if provided
    if (filters?.subcategories && filters.subcategories.length > 0) {
      query = query.in('subcategory', filters.subcategories);
    }

    // Limit results
    query = query.limit(filters?.limit || 100);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching public tasks:', error);
      return [];
    }

    let tasks = data || [];

    // Apply distance filter if location provided
    if (filters?.userLat && filters?.userLon && filters?.maxDistance) {
      tasks = tasks.filter(task => {
        if (!task.latitude || !task.longitude) return false;
        
        const distance = calculateDistance(
          filters.userLat!,
          filters.userLon!,
          task.latitude,
          task.longitude
        );
        
        return distance <= filters.maxDistance!;
      });
    }

    return tasks as Task[];
  } catch (error) {
    console.error('Error in getAllPublicTasks:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
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
