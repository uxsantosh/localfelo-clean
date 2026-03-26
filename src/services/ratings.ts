import { supabase } from '../lib/supabaseClient';

export interface Rating {
  id: string;
  task_id: string;
  rated_user_id: string;
  rater_user_id: string;
  rating_type: 'helper' | 'task_owner';
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface UserRatings {
  helper_rating_avg: number;
  helper_rating_count: number;
  task_owner_rating_avg: number;
  task_owner_rating_count: number;
}

/**
 * Submit a rating for a user after task completion
 */
export async function submitRating(
  taskId: string,
  ratedUserId: string,
  raterUserId: string,
  ratingType: 'helper' | 'task_owner',
  rating: number,
  comment: string
): Promise<void> {
  try {
    // Check if rating already exists
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('task_id', taskId)
      .eq('rated_user_id', ratedUserId)
      .eq('rater_user_id', raterUserId)
      .eq('rating_type', ratingType)
      .single();

    if (existingRating) {
      throw new Error('You have already rated this user for this task');
    }

    // Insert rating
    const { error: insertError } = await supabase
      .from('ratings')
      .insert({
        task_id: taskId,
        rated_user_id: ratedUserId,
        rater_user_id: raterUserId,
        rating_type: ratingType,
        rating,
        comment: comment.trim() || null,
      });

    if (insertError) throw insertError;

    // Update user's average rating
    await updateUserAverageRatings(ratedUserId);
  } catch (error: any) {
    console.error('Failed to submit rating:', error);
    throw error;
  }
}

/**
 * Calculate and update user's average ratings
 */
async function updateUserAverageRatings(userId: string): Promise<void> {
  try {
    // Calculate helper rating average
    const { data: helperRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_user_id', userId)
      .eq('rating_type', 'helper');

    const helperCount = helperRatings?.length || 0;
    const helperAvg = helperCount > 0
      ? helperRatings!.reduce((sum, r) => sum + r.rating, 0) / helperCount
      : 0;

    // Calculate task owner rating average
    const { data: taskOwnerRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_user_id', userId)
      .eq('rating_type', 'task_owner');

    const taskOwnerCount = taskOwnerRatings?.length || 0;
    const taskOwnerAvg = taskOwnerCount > 0
      ? taskOwnerRatings!.reduce((sum, r) => sum + r.rating, 0) / taskOwnerCount
      : 0;

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        helper_rating_avg: helperAvg,
        helper_rating_count: helperCount,
        task_owner_rating_avg: taskOwnerAvg,
        task_owner_rating_count: taskOwnerCount,
      })
      .eq('id', userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Failed to update average ratings:', error);
    throw error;
  }
}

/**
 * Get user's ratings
 */
export async function getUserRatings(userId: string): Promise<UserRatings> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('helper_rating_avg, helper_rating_count, task_owner_rating_avg, task_owner_rating_count')
      .eq('id', userId)
      .single();

    if (error) {
      // If columns don't exist yet (migration not run), return defaults
      if (error.code === '42703') {
        console.warn('Rating columns not found. Please run the avatar_and_rating_system.sql migration.');
        return {
          helper_rating_avg: 0,
          helper_rating_count: 0,
          task_owner_rating_avg: 0,
          task_owner_rating_count: 0,
        };
      }
      throw error;
    }

    return {
      helper_rating_avg: data.helper_rating_avg || 0,
      helper_rating_count: data.helper_rating_count || 0,
      task_owner_rating_avg: data.task_owner_rating_avg || 0,
      task_owner_rating_count: data.task_owner_rating_count || 0,
    };
  } catch (error) {
    console.error('Failed to get user ratings:', error);
    return {
      helper_rating_avg: 0,
      helper_rating_count: 0,
      task_owner_rating_avg: 0,
      task_owner_rating_count: 0,
    };
  }
}

/**
 * Check if user has already rated another user for a specific task
 */
export async function hasUserRated(
  taskId: string,
  ratedUserId: string,
  raterUserId: string,
  ratingType: 'helper' | 'task_owner'
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('id')
      .eq('task_id', taskId)
      .eq('rated_user_id', ratedUserId)
      .eq('rater_user_id', raterUserId)
      .eq('rating_type', ratingType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Failed to check rating status:', error);
    return false;
  }
}

/**
 * Get all ratings for a user (for admin/profile view)
 */
export async function getAllUserRatings(userId: string): Promise<Rating[]> {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        rater:profiles!ratings_rater_user_id_fkey(name),
        task:tasks(title)
      `)
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get user ratings:', error);
    return [];
  }
}

/**
 * Get pending ratings for a user (tasks they need to rate)
 */
export async function getPendingRatings(userId: string): Promise<any[]> {
  try {
    // Get completed tasks where user is creator or helper
    const { data: completedTasks, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        created_by,
        helper_id,
        status,
        creator:profiles!tasks_created_by_fkey(id, name),
        helper:profiles!tasks_helper_id_fkey(id, name)
      `)
      .eq('status', 'completed')
      .or(`created_by.eq.${userId},helper_id.eq.${userId}`);

    if (error) throw error;

    const pendingRatings = [];

    for (const task of completedTasks || []) {
      // If user is the creator, check if they've rated the helper
      if (task.created_by === userId && task.helper_id) {
        const hasRated = await hasUserRated(task.id, task.helper_id, userId, 'helper');
        if (!hasRated) {
          pendingRatings.push({
            task_id: task.id,
            task_title: task.title,
            rated_user_id: task.helper_id,
            rated_user_name: task.helper?.name,
            rating_type: 'helper',
          });
        }
      }

      // If user is the helper, check if they've rated the creator
      if (task.helper_id === userId && task.created_by) {
        const hasRated = await hasUserRated(task.id, task.created_by, userId, 'task_owner');
        if (!hasRated) {
          pendingRatings.push({
            task_id: task.id,
            task_title: task.title,
            rated_user_id: task.created_by,
            rated_user_name: task.creator?.name,
            rating_type: 'task_owner',
          });
        }
      }
    }

    return pendingRatings;
  } catch (error) {
    console.error('Failed to get pending ratings:', error);
    return [];
  }
}