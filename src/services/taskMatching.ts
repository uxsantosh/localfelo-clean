import { supabase } from '../lib/supabaseClient';
import { TASK_CATEGORIES } from './taskCategories';

/**
 * SMART TASK MATCHING v2.0
 * Matches tasks to helpers based on:
 * 1. Category match (exact category name match)
 * 2. Keyword match (task keywords in helper skills)
 * 3. Location match (within helper's distance preference)
 * 4. Budget match (within helper's budget range - optional)
 */

export interface MatchResult {
  matches: boolean;
  matchType: 'category' | 'keyword' | 'both' | 'none';
  confidence: number; // 0-100
  matchedCategories: string[];
  matchReason: string;
}

/**
 * Check if a task matches a helper's skills
 * @param taskCategory - The detected category from task creation
 * @param taskTitle - The task title for keyword matching
 * @param helperCategories - Array of category names the helper can help with
 * @returns Match result with confidence score
 */
export function matchTaskToHelper(
  taskCategory: string,
  taskTitle: string,
  helperCategories: string[]
): MatchResult {
  const result: MatchResult = {
    matches: false,
    matchType: 'none',
    confidence: 0,
    matchedCategories: [],
    matchReason: '',
  };

  // Exact category match - highest confidence
  if (helperCategories.includes(taskCategory)) {
    result.matches = true;
    result.matchType = 'category';
    result.confidence = 95;
    result.matchedCategories.push(taskCategory);
    result.matchReason = `Helper can do "${taskCategory}" tasks`;
    return result;
  }

  // Keyword-based matching - check if task keywords match any helper category
  const taskLower = taskTitle.toLowerCase();
  let bestKeywordMatch: { category: string; score: number } | null = null;

  for (const helperCat of helperCategories) {
    const categoryData = TASK_CATEGORIES[helperCat as keyof typeof TASK_CATEGORIES];
    if (!categoryData || !categoryData.keywords) continue;

    let score = 0;
    for (const keyword of categoryData.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(taskLower)) {
        score += 3; // Exact word match
      } else if (taskLower.includes(keyword)) {
        score += 1; // Partial match
      }
    }

    if (score > 0) {
      if (!bestKeywordMatch || score > bestKeywordMatch.score) {
        bestKeywordMatch = { category: helperCat, score };
      }
    }
  }

  // If we found keyword matches
  if (bestKeywordMatch && bestKeywordMatch.score > 2) {
    result.matches = true;
    result.matchType = 'keyword';
    result.confidence = Math.min(85, 50 + bestKeywordMatch.score * 5); // Max 85% for keyword match
    result.matchedCategories.push(bestKeywordMatch.category);
    result.matchReason = `Task matches "${bestKeywordMatch.category}" skills`;
    return result;
  }

  // No match found
  result.matchReason = 'No matching skills found';
  return result;
}

/**
 * Filter tasks for a helper based on their preferences
 * @param tasks - Array of tasks to filter
 * @param helperCategories - Helper's selected categories
 * @param helperLocation - Helper's location coordinates
 * @param maxDistance - Helper's maximum distance preference (km)
 * @returns Filtered and sorted tasks with match info
 */
export function filterTasksForHelper(
  tasks: any[],
  helperCategories: string[],
  helperLocation: { latitude: number; longitude: number } | null,
  maxDistance: number = 100
): Array<any & { matchInfo: MatchResult; distance?: number }> {
  const results: Array<any & { matchInfo: MatchResult; distance?: number }> = [];

  for (const task of tasks) {
    // Calculate distance if both locations available
    let distance: number | undefined;
    if (helperLocation && task.latitude && task.longitude) {
      distance = calculateDistance(
        helperLocation.latitude,
        helperLocation.longitude,
        task.latitude,
        task.longitude
      );

      // Skip if too far
      if (distance > maxDistance) {
        continue;
      }
    }

    // Check if task matches helper's skills
    const taskCategory = task.detected_category || task.category || 'Other';
    const matchInfo = matchTaskToHelper(taskCategory, task.title, helperCategories);

    // Only include if it matches
    if (matchInfo.matches) {
      results.push({
        ...task,
        matchInfo,
        distance,
      });
    }
  }

  // Sort by: confidence (desc), then distance (asc)
  results.sort((a, b) => {
    // First by confidence
    if (b.matchInfo.confidence !== a.matchInfo.confidence) {
      return b.matchInfo.confidence - a.matchInfo.confidence;
    }
    
    // Then by distance (if available)
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    
    return 0;
  });

  return results;
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
 * Get matching helpers for a task
 * @param taskCategory - Detected category
 * @param taskTitle - Task title
 * @param taskLocation - Task location
 * @returns Array of matching helper user IDs with match info
 */
export async function getMatchingHelpers(
  taskCategory: string,
  taskTitle: string,
  taskLocation: { latitude: number; longitude: number }
): Promise<Array<{ userId: string; matchInfo: MatchResult; distance: number }>> {
  try {
    // Get all users with helper categories stored in user_metadata
    const { data: users, error } = await supabase
      .from('users')
      .select('id, latitude, longitude, helper_categories')
      .not('helper_categories', 'is', null);

    if (error || !users) {
      console.error('Error fetching helpers:', error);
      return [];
    }

    const matches: Array<{ userId: string; matchInfo: MatchResult; distance: number }> = [];

    for (const user of users) {
      if (!user.latitude || !user.longitude || !user.helper_categories) continue;

      // Calculate distance
      const distance = calculateDistance(
        taskLocation.latitude,
        taskLocation.longitude,
        user.latitude,
        user.longitude
      );

      // Check if task matches helper's skills
      const helperCategories = user.helper_categories as string[];
      const matchInfo = matchTaskToHelper(taskCategory, taskTitle, helperCategories);

      if (matchInfo.matches) {
        matches.push({
          userId: user.id,
          matchInfo,
          distance,
        });
      }
    }

    // Sort by confidence and distance
    matches.sort((a, b) => {
      if (b.matchInfo.confidence !== a.matchInfo.confidence) {
        return b.matchInfo.confidence - a.matchInfo.confidence;
      }
      return a.distance - b.distance;
    });

    return matches;
  } catch (error) {
    console.error('Error finding matching helpers:', error);
    return [];
  }
}

/**
 * Save helper categories to user profile
 */
export async function saveHelperCategories(userId: string, categories: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        helper_categories: categories,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving helper categories:', error);
    return false;
  }
}

/**
 * Get helper categories from user profile
 */
export async function getHelperCategories(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('helper_categories')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return (data?.helper_categories as string[]) || [];
  } catch (error) {
    console.error('Error fetching helper categories:', error);
    return [];
  }
}
