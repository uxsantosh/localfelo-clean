// =====================================================
// Task Service - Backend communication for Tasks feature
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';
import { getCurrentUser, getOwnerToken } from './auth';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

interface TaskFilters {
  categoryId?: string | number;
  cityId?: string;
  areaId?: string;
  searchQuery?: string;
  status?: string;
  userLat?: number;
  userLon?: number;
  page?: number;
  limit?: number;
}

// Get all tasks with optional filters
export async function getTasks(filters?: TaskFilters): Promise<{ tasks: Task[]; totalCount: number }> {
  try {
    console.log('📋 [TaskService] getTasks called with filters:', filters);
    
    const currentUser = await getCurrentUser();
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    
    // First, get total count
    let countQuery = supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .in('status', ['open', 'negotiating']); // Only show open or negotiating tasks

    if (currentUser?.id) {
      countQuery = countQuery.neq('user_id', currentUser.id);
    }

    // Apply same filters for count (only category, search, and status - NOT city/area)
    if (filters?.categoryId) {
      countQuery = countQuery.eq('category_id', filters.categoryId);
    }
    // REMOVED: City and area filtering - show ALL tasks from everywhere
    // if (filters?.cityId) {
    //   countQuery = countQuery.eq('city_id', filters.cityId);
    // }
    // if (filters?.areaId) {
    //   countQuery = countQuery.eq('area_id', filters.areaId);
    // }
    if (filters?.searchQuery) {
      countQuery = countQuery.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }
    // REMOVED: Status filter - already applied above with .in('status', ['open', 'negotiating'])
    // if (filters?.status) {
    //   countQuery = countQuery.eq('status', filters.status);
    // }

    const { count: totalCount } = await countQuery;
    
    // Now get paginated data
    let query = supabase
      .from('tasks')
      .select(`
        *,
        city:cities(id, name),
        area:areas(id, name, latitude, longitude)
      `)
      .in('status', ['open', 'negotiating']); // Only show open or negotiating tasks in public feed

    // Exclude current user's own tasks (show only others' tasks)
    if (currentUser?.id) {
      query = query.neq('user_id', currentUser.id);
      console.log('🔍 [TaskService] Filtering out current user\'s own tasks:', currentUser.id);
    }

    // Apply filters (only category, search, and status - NOT city/area)
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    // REMOVED: City and area filtering to show ALL tasks from everywhere
    console.log('🌍 [TaskService] Showing ALL tasks from EVERYWHERE (sorted by distance)');
    // if (filters?.cityId) {
    //   query = query.eq('city_id', filters.cityId);
    // }
    // if (filters?.areaId) {
    //   query = query.eq('area_id', filters.areaId);
    // }
    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }
    // REMOVED: Status filter - already applied above with .in('status', ['open', 'negotiating'])
    // if (filters?.status) {
    //   query = query.eq('status', filters.status);
    // }

    // Apply ordering first, then pagination
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination using range
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      // Silent graceful failure - return empty array
      return { tasks: [], totalCount: 0 };
    }

    if (!data) {
      console.log('ℹ️ [TaskService] No tasks found');
      return { tasks: [], totalCount: totalCount || 0 };
    }

    console.log(`✅ [TaskService] Found ${data.length} tasks (page ${page}, total ${totalCount})`);

    // Transform data to Task type and calculate distance
    const tasks: Task[] = data.map(task => {
      let distance: number | undefined = undefined;

      // Calculate distance if user has coordinates
      if (filters?.userLat && filters?.userLon) {
        // Use task's GPS coordinates if available, otherwise fallback to area coordinates
        let taskLat = task.latitude;
        let taskLon = task.longitude;
        
        // FALLBACK: Use area coordinates if task doesn't have GPS coordinates
        if (!taskLat || !taskLon) {
          taskLat = task.area?.latitude;
          taskLon = task.area?.longitude;
          if (taskLat && taskLon) {
            console.log(`📍 Using area coordinates for task "${task.title}"`);
          }
        }
        
        if (taskLat && taskLon) {
          distance = calculateDistance(
            filters.userLat,
            filters.userLon,
            taskLat,
            taskLon
          );
          console.log(`✅ DISTANCE CALCULATED for task "${task.title}": ${distance.toFixed(1)} km`);
        } else {
          console.log(`⚠️ No distance for task "${task.title}" - no GPS or area coordinates available`);
        }
      }

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        categoryId: task.category_id,
        categoryName: '', // TODO: fetch from category
        cityId: task.city_id,
        cityName: task.city_name || task.city?.name || '',
        areaId: task.area_id,
        areaName: task.area_name || task.area?.name || '',
        latitude: task.latitude,
        longitude: task.longitude,
        address: task.address,
        price: task.price,
        isNegotiable: task.is_negotiable,
        timeWindow: task.time_window,
        exactLocation: task.exact_location,
        phone: task.phone,
        whatsapp: task.whatsapp,
        hasWhatsapp: task.has_whatsapp,
        status: task.status,
        userId: task.user_id,
        userName: '', // TODO: fetch from user
        helperId: task.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
        acceptedBy: task.accepted_by,
        acceptedAt: task.accepted_at,
        acceptedPrice: task.accepted_price,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        // ❌ REMOVED: These fields don't exist in database
        // helperCompleted: false,
        // creatorCompleted: false,
        distance,
      };
    });

    // Sort by distance if available
    if (filters?.userLat && filters?.userLon) {
      tasks.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
      console.log(' [TaskService] Tasks sorted by distance');
    }

    return { tasks, totalCount };
  } catch (error) {
    // Silent graceful failure - return empty array
    return { tasks: [], totalCount: 0 };
  }
}

// Get single task by ID
export async function getTaskById(
  taskId: string,
  userLat?: number,
  userLon?: number
): Promise<Task | null> {
  try {
    console.log('📋 [TaskService] getTaskById:', taskId);

    // ✅ FIX: Make sub_area join optional (left join) since not all tasks have sub_area
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        city:cities(id, name),
        area:areas(id, name, latitude, longitude)
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('❌ [TaskService] Error fetching task:', error);
      throw error;
    }

    if (!data) {
      console.log('ℹ️ [TaskService] Task not found');
      return null;
    }

    console.log('✅ [TaskService] Task found:', data.title);

    // Fetch sub_area separately if it exists (to avoid foreign key errors)
    let subAreaName = '';
    if (data.sub_area_id) {
      const { data: subAreaData } = await supabase
        .from('sub_areas')
        .select('name')
        .eq('id', data.sub_area_id)
        .single();
      
      if (subAreaData) {
        subAreaName = subAreaData.name;
      }
    }

    // Fetch user name from profiles table
    let userName = 'Local User';
    let userAvatar = '';
    if (data.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', data.user_id)
        .single();
      
      if (profileData && profileData.name) {
        userName = profileData.name;
        userAvatar = profileData.avatar_url || '';
      }
    }

    // Fetch helper info if task is accepted
    let helperName = '';
    let helperAvatar = '';
    if (data.accepted_by) {
      const { data: helperData } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', data.accepted_by)
        .single();
      
      if (helperData && helperData.name) {
        helperName = helperData.name;
        helperAvatar = helperData.avatar_url || '';
      }
    }

    // Calculate distance if user coordinates are provided
    let distance: number | undefined = undefined;
    if (userLat && userLon && data.latitude && data.longitude) {
      distance = calculateDistance(userLat, userLon, data.latitude, data.longitude);
      console.log(`📍 [TaskService] Task distance: ${distance.toFixed(2)} km`);
    }

    // ✅ FIX: Fetch location names from joined data OR fallback to direct fields
    const cityName = data.city?.name || data.city_name || '';
    const areaName = data.area?.name || data.area_name || '';
    const cityId = data.city_id || data.city?.id || '';
    const areaId = data.area_id || data.area?.id || '';

    console.log('📍 [TaskService] Location data:', {
      cityId,
      cityName,
      areaId,
      areaName,
      rawCityId: data.city_id,
      rawAreaId: data.area_id,
      cityJoin: data.city,
      areaJoin: data.area
    });

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      categoryName: '', // TODO: fetch from category
      cityId: cityId,
      cityName: cityName,
      areaId: areaId,
      areaName: areaName,
      subAreaId: data.sub_area_id,
      subAreaName: subAreaName, // ✅ FIX: Fetched separately
      latitude: data.latitude,
      longitude: data.longitude,
      price: data.price,
      isNegotiable: data.is_negotiable,
      timeWindow: data.time_window,
      exactLocation: data.exact_location,
      address: data.address,  // Include address field
      phone: data.phone,
      whatsapp: data.whatsapp,
      hasWhatsapp: data.has_whatsapp,
      status: data.status,
      userId: data.user_id,
      userName: userName, // ✅ FIX: Fetched from profiles table
      userAvatar: userAvatar,
      helperId: data.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
      helperName: helperName,
      helperAvatar: helperAvatar,
      acceptedBy: data.accepted_by,
      acceptedAt: data.accepted_at,
      acceptedPrice: data.accepted_price,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      // ❌ REMOVED: These fields don't exist in database
      // helperCompleted: false,
      // creatorCompleted: false,
      distance,
    };
  } catch (error) {
    console.error('❌ [TaskService] getTaskById failed:', error);
    throw error;
  }
}

// Create new task
export async function createTask(task: {
  title: string;
  description: string;
  categoryId: string | number;
  cityId: string;
  areaId: string;
  subAreaId?: string; // NEW: 3rd level location
  areaName?: string; // NEW: Area name for direct display
  cityName?: string; // NEW: City name for direct display
  latitude?: number;
  longitude?: number;
  address?: string; // NEW: User's specific address
  price?: number;
  isNegotiable?: boolean;
  timeWindow?: string;
  exactLocation?: string;
  phone?: string;
  whatsapp?: string;
  hasWhatsapp?: boolean;
}, userId: string): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    console.log('➕ [TaskService] Creating task:', task.title);

    // Get owner_token and client_token for ownership verification
    const ownerToken = await getOwnerToken();
    const currentUser = await getCurrentUser();
    
    if (!ownerToken || !currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        category_id: task.categoryId,
        city_id: task.cityId,
        area_id: task.areaId,
        sub_area_id: task.subAreaId || null, // ✅ FIX: Convert empty/undefined to null
        latitude: task.latitude,
        longitude: task.longitude,
        address: task.address || null,
        price: task.price,
        is_negotiable: task.isNegotiable,
        time_window: task.timeWindow,
        exact_location: task.exactLocation,
        phone: task.phone,
        whatsapp: task.whatsapp,
        has_whatsapp: task.hasWhatsapp,
        user_id: userId,
        owner_token: ownerToken,
        client_token: currentUser.clientToken,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [TaskService] Error creating task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [TaskService] Task created successfully with owner_token:', ownerToken);

    return {
      success: true,
      taskId: data.id,
    };
  } catch (error: any) {
    console.error('❌ [TaskService] createTask failed:', error);
    return { success: false, error: error.message };
  }
}

// Update task status (e.g., accept, start, complete)
export async function updateTaskStatus(
  taskId: string,
  status: 'open' | 'negotiating' | 'accepted' | 'in_progress' | 'completed' | 'cancelled',
  helperId?: string
): Promise<Task> {
  try {
    console.log(`🔄 [TaskService] Updating task ${taskId} to status: ${status}`);

    const updates: any = { status };

    // Set accepted_by when accepting (helper_id column doesn't exist in DB)
    if (status === 'accepted' && helperId) {
      updates.accepted_by = helperId;
      updates.accepted_at = new Date().toISOString();
    }

    // Set completed_at when completing
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select(`
        *,
        city:cities(id, name),
        area:areas(id, name)
      `)
      .single();

    if (error) {
      console.error('❌ [TaskService] Error updating task status:', error);
      throw error;
    }

    console.log('✅ [TaskService] Task status updated successfully');

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      categoryName: '', // TODO: fetch from category
      cityId: data.city_id,
      cityName: data.city?.name || '',
      areaId: data.area_id,
      areaName: data.area?.name || '',
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      userId: data.user_id,
      userName: '', // TODO: fetch from user
      helperId: data.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
      acceptedBy: data.accepted_by,
      acceptedAt: data.accepted_at,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      helperCompleted: data.helper_completed,
      creatorCompleted: data.creator_completed,
    };
  } catch (error) {
    console.error('❌ [TaskService] updateTaskStatus failed:', error);
    throw error;
  }
}

// Delete task (soft delete - hide from public view but keep in DB for history)
export async function deleteTask(taskId: string): Promise<void> {
  try {
    console.log('🗑️ [TaskService] Deleting task:', taskId);

    const ownerToken = await getOwnerToken();
    const currentUser = await getCurrentUser();
    
    if (!ownerToken || !currentUser) {
      throw new Error('Not authenticated');
    }

    // Verify ownership by BOTH owner_token AND user_id before deleting
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('owner_token, user_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      throw new Error('Task not found');
    }

    // Check if user owns this task (check both owner_token and user_id for safety)
    const ownsTask = task.owner_token === ownerToken || task.user_id === currentUser.id;
    
    if (!ownsTask) {
      console.error('❌ [TaskService] Ownership verification failed:', {
        taskOwnerToken: task.owner_token,
        currentOwnerToken: ownerToken,
        taskUserId: task.user_id,
        currentUserId: currentUser.id
      });
      throw new Error('Only the task creator can delete this task');
    }

    // SOFT DELETE: Set status to 'closed' instead of removing from database
    // This keeps the task for user's history but hides it from public view
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('❌ [TaskService] Error deleting task:', error);
      throw error;
    }

    console.log('✅ [TaskService] Task soft-deleted (hidden from public view)');
  } catch (error) {
    console.error('❌ [TaskService] deleteTask failed:', error);
    throw error;
  }
}

// Update task (edit)
export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    categoryId?: string | number;
    cityId?: string;
    areaId?: string;
    latitude?: number;
    longitude?: number;
    status?: string;
  }
): Promise<Task> {
  try {
    console.log('✏️ [TaskService] Updating task:', taskId);

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.cityId !== undefined) updateData.city_id = updates.cityId;
    if (updates.areaId !== undefined) updateData.area_id = updates.areaId;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        city:cities(id, name),
        area:areas(id, name)
      `)
      .single();

    if (error) {
      console.error('❌ [TaskService] Error updating task:', error);
      throw error;
    }

    console.log('✅ [TaskService] Task updated successfully');

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      categoryName: '', // TODO: fetch from category
      cityId: data.city_id,
      cityName: data.city?.name || '',
      areaId: data.area_id,
      areaName: data.area?.name || '',
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      userId: data.user_id,
      userName: '', // TODO: fetch from user
      helperId: data.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
      createdAt: data.created_at,
      completedAt: data.completed_at,
    };
  } catch (error) {
    console.error('❌ [TaskService] updateTask failed:', error);
    throw error;
  }
}

// Edit task (alias for updateTask) - but with result type
export async function editTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    categoryId?: string | number;
    cityId?: string;
    areaId?: string;
    subAreaId?: string; // NEW: 3rd level location
    latitude?: number;
    longitude?: number;
    address?: string; // NEW: User's specific address
    price?: number;
    isNegotiable?: boolean;
    timeWindow?: string;
    exactLocation?: string;
    phone?: string;
    whatsapp?: string;
    hasWhatsapp?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const ownerToken = await getOwnerToken();
    if (!ownerToken) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify ownership by owner_token before editing
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('owner_token, status')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return { success: false, error: 'Task not found' };
    }

    // Only creator can edit (verify by owner_token)
    if (task.owner_token !== ownerToken) {
      return { success: false, error: 'Only the task creator can edit this task' };
    }

    // Can't edit if already completed
    if (task.status === 'completed' || task.status === 'deleted') {
      return { success: false, error: 'Cannot edit completed or deleted task' };
    }

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.cityId !== undefined) updateData.city_id = updates.cityId;
    if (updates.areaId !== undefined) updateData.area_id = updates.areaId;
    if (updates.subAreaId !== undefined) updateData.sub_area_id = updates.subAreaId || null; // ✅ FIX: Convert empty to null
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
    if (updates.address !== undefined) updateData.address = updates.address || null; // ✅ FIX: Add address field
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.isNegotiable !== undefined) updateData.is_negotiable = updates.isNegotiable;
    if (updates.timeWindow !== undefined) updateData.time_window = updates.timeWindow;
    if (updates.exactLocation !== undefined) updateData.exact_location = updates.exactLocation;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.whatsapp !== undefined) updateData.whatsapp = updates.whatsapp;
    if (updates.hasWhatsapp !== undefined) updateData.has_whatsapp = updates.hasWhatsapp;

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('owner_token', ownerToken);

    if (error) {
      console.error('❌ [TaskService] Error updating task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [TaskService] Task updated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ [TaskService] editTask failed:', error);
    return { success: false, error: error.message };
  }
}

// Get active tasks for a user (tasks they created OR helping with, with status accepted/in_progress)
export async function getUserActiveTasks(userId: string): Promise<Task[]> {
  try {
    console.log('📋 [TaskService] Getting active tasks for user:', userId);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`user_id.eq.${userId},accepted_by.eq.${userId}`) // Fixed: Check accepted_by instead of helper_id
      .in('status', ['accepted', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) {
      // Silent graceful failure - return empty array
      return [];
    }

    if (!data) {
      console.log('ℹ️ [TaskService] No active tasks found');
      return [];
    }

    console.log(`✅ [TaskService] Found ${data.length} active tasks`);

    return data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      categoryId: task.category_id,
      categoryName: '', // Will be populated by caller if needed
      cityId: task.city_id,
      cityName: '', // Will be populated by caller if needed
      areaId: task.area_id,
      areaName: '', // Will be populated by caller if needed
      latitude: task.latitude,
      longitude: task.longitude,
      status: task.status,
      userId: task.user_id,
      userName: '', // Will be populated by caller if needed
      helperId: task.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
      createdAt: task.created_at,
      completedAt: task.completed_at,
    }));
  } catch (error: any) {
    // Silent graceful failure - return empty array
    return [];
  }
}

// Get user's tasks (for profile)
export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    console.log('📞 [TaskService] getUserTasks for userId:', userId);
    
    // Query by user_id instead of owner_token for more reliable results
    // user_id is the UUID from the profiles table
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        categories:category_id(id, name, emoji),
        cities:city_id(id, name),
        areas:area_id(id, name)
      `)
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    console.log('📊 [TaskService] Query result:', {
      dataCount: data?.length || 0,
      hasError: !!error,
      error: error
    });

    if (error) {
      console.error('❌ [TaskService] getUserTasks error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ [TaskService] No tasks found for user');
      return [];
    }

    console.log(`✅ [TaskService] Found ${data.length} tasks`);

    // Fetch user profiles separately for all unique user_ids
    const userIds = [...new Set(data.map(task => task.user_id).filter(Boolean))];
    const userProfiles: Record<string, { name: string; avatar_url?: string }> = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach(profile => {
          userProfiles[profile.id] = {
            name: profile.name,
            avatar_url: profile.avatar_url,
          };
        });
      }
    }

    return data.map((task: any) => {
      const userProfile = task.user_id ? userProfiles[task.user_id] : null;
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        categoryId: task.category_id,
        categoryName: task.categories?.name || '',
        categoryEmoji: task.categories?.emoji || '⚒️',
        cityId: task.city_id,
        cityName: task.cities?.name || '',
        areaId: task.area_id,
        areaName: task.areas?.name || '',
        subAreaId: task.sub_area_id,
        subAreaName: task.sub_area_name,
        latitude: task.latitude,
        longitude: task.longitude,
        address: task.address,
        price: task.price,
        isNegotiable: task.is_negotiable,
        timeWindow: task.time_window,
        exactLocation: task.exact_location,
        phone: task.phone,
        whatsapp: task.whatsapp,
        hasWhatsapp: task.has_whatsapp,
        status: task.status,
        userId: task.user_id,
        userName: userProfile?.name || 'User',
        userAvatar: userProfile?.avatar_url,
        helperId: task.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
        acceptedBy: task.accepted_by,
        acceptedAt: task.accepted_at,
        acceptedPrice: task.accepted_price,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        helperCompleted: task.helper_completed,
        creatorCompleted: task.creator_completed,
      };
    });
  } catch (error) {
    console.error('❌ [TaskService] getUserTasks exception:', error);
    return [];
  }
}

// Admin: Get all tasks
export async function getAllTasksAdmin(): Promise<Task[]> {
  try {
    console.log('🔐 [TaskService] Getting all tasks (admin)');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        city:cities(id, name),
        area:areas(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [TaskService] Error fetching all tasks:', error);
      throw error;
    }

    if (!data) {
      console.log('ℹ️ [TaskService] No tasks found');
      return [];
    }

    console.log(`✅ [TaskService] Found ${data.length} tasks (admin)`);

    return data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      categoryId: task.category_id,
      categoryName: '', // TODO: fetch from category
      cityId: task.city_id,
      cityName: task.city?.name || '',
      areaId: task.area_id,
      areaName: task.area?.name || '',
      latitude: task.latitude,
      longitude: task.longitude,
      status: task.status,
      userId: task.user_id,
      userName: '', // TODO: fetch from user
      helperId: task.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
      createdAt: task.created_at,
      completedAt: task.completed_at,
    }));
  } catch (error) {
    console.error('❌ [TaskService] getAllTasksAdmin failed:', error);
    throw error;
  }
}

// Admin: Close task
export async function closeTaskAdmin(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔐 [TaskService] Closing task (admin):', taskId);

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error('❌ [TaskService] Error closing task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [TaskService] Task closed successfully (admin)');
    return { success: true };
  } catch (error: any) {
    console.error('❌ [TaskService] closeTaskAdmin failed:', error);
    return { success: false, error: error.message };
  }
}

// Alias for closeTaskAdmin
export async function closeTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  return closeTaskAdmin(taskId);
}

// Get task negotiations (messages/offers related to task)
export async function getTaskNegotiations(taskId: string): Promise<any[]> {
  try {
    console.log('💬 [TaskService] Getting negotiations for task:', taskId);

    // Get all conversations related to this task
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(
          id,
          content,
          sender_id,
          created_at
        )
      `)
      .eq('listing_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [TaskService] Error fetching negotiations:', error);
      throw error;
    }

    if (!data) {
      console.log('ℹ️ [TaskService] No negotiations found');
      return [];
    }

    console.log(`✅ [TaskService] Found ${data.length} negotiations`);
    return data;
  } catch (error) {
    console.error('❌ [TaskService] getTaskNegotiations failed:', error);
    throw error;
  }
}

// Accept task (helper accepts to work on it)
export async function acceptTask(taskId: string, helperId: string): Promise<Task> {
  console.log('🔄 [TaskService] acceptTask called:', { taskId, helperId });
  
  // Verify the helper is not the task creator
  const { data: taskData, error: fetchError } = await supabase
    .from('tasks')
    .select('user_id, status, owner_token')
    .eq('id', taskId)
    .single();

  if (fetchError || !taskData) {
    throw new Error('Task not found');
  }

  // Prevent task creator from accepting their own task
  if (taskData.user_id === helperId) {
    throw new Error('You cannot accept your own task');
  }

  // Only open or negotiating tasks can be accepted
  if (taskData.status !== 'open' && taskData.status !== 'negotiating') {
    throw new Error('This task is no longer available for acceptance');
  }
  
  // Update task status
  const updatedTask = await updateTaskStatus(taskId, 'accepted', helperId);
  
  console.log('✅ [TaskService] Task updated, sending notification to creator:', updatedTask.userId);
  
  // Send notification to task creator
  try {
    const { sendTaskAcceptedNotification } = await import('./notifications');
    
    // Get helper's name
    const { data: helperProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', helperId)
      .single();
    
    const helperName = helperProfile?.name || 'Someone';
    
    console.log('📧 [TaskService] Sending notification:', {
      recipientId: updatedTask.userId,
      taskId: taskId,
      taskTitle: updatedTask.title,
      helperName: helperName
    });
    
    // Send in-app notification to creator
    const notificationSent = await sendTaskAcceptedNotification(
      updatedTask.userId,
      taskId,
      updatedTask.title,
      helperName
    );
    
    if (notificationSent) {
      console.log('✅ [TaskService] In-app notification sent successfully');
    } else {
      console.error('❌ [TaskService] Failed to send in-app notification');
    }
    
    // 🔔 Send push notification (non-blocking)
    const { notifyTaskUpdate } = await import('./pushNotificationDispatcher');
    notifyTaskUpdate({
      recipientId: updatedTask.userId,
      taskId: taskId,
      action: 'accepted',
      title: 'Task Accepted!',
      body: `${helperName} has accepted your task "${updatedTask.title}"`,
      senderId: helperId,
    }).catch(err => console.warn('[TaskService] Push notification failed:', err));
    
  } catch (notifError) {
    console.error('⚠️ [TaskService] Failed to send notification:', notifError);
    // Don't throw - notification failure shouldn't break task acceptance
  }
  
  return updatedTask;
}

// Cancel task - Resets to 'open' status and clears accepted_by
export async function cancelTask(taskId: string, cancelledBy?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 [TaskService] Cancelling task and resetting to open:', taskId);
    
    if (!cancelledBy) {
      return { success: false, error: 'User authentication required' };
    }
    
    // First, get task details to verify ownership and send notifications
    const { data: taskData, error: fetchError } = await supabase
      .from('tasks')
      .select('user_id, accepted_by, title, status') // ✅ FIX: Removed helper_id (doesn't exist in DB)
      .eq('id', taskId)
      .single();

    if (fetchError || !taskData) {
      return { success: false, error: 'Task not found' };
    }

    // Only creator or helper can cancel
    const isCreator = taskData.user_id === cancelledBy;
    const isHelper = taskData.accepted_by === cancelledBy;

    if (!isCreator && !isHelper) {
      return { success: false, error: 'Only the task creator or assigned helper can cancel this task' };
    }

    // BUSINESS RULE: Only helper can cancel an accepted task
    // Creator can only delete tasks while they're still "open"
    if (isCreator && taskData.status !== 'open') {
      return { success: false, error: 'Task creator cannot cancel once task is accepted. Only the helper can cancel.' };
    }

    // Can't cancel if already completed or deleted
    if (taskData.status === 'completed' || taskData.status === 'deleted') {
      return { success: false, error: 'Cannot cancel completed or deleted task' };
    }
    
    // Reset task to 'open' status and clear accepted_by
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'open',
        accepted_by: null,
        accepted_at: null,
        accepted_price: null,
      })
      .eq('id', taskId);

    if (error) {
      console.error('❌ [TaskService] Error cancelling task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [TaskService] Task cancelled and reset to open');
    
    // Send notification to the OTHER party (not the one who cancelled)
    try {
      const { sendTaskCancelledNotification } = await import('./notifications');
      
      // Get canceller's name
      const { data: cancellerProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', cancelledBy)
        .single();
      
      const cancellerName = cancellerProfile?.name || 'Someone';
      
      // Determine who to notify: if creator cancelled, notify helper. If helper cancelled, notify creator.
      let recipientId: string | null = null;
      
      if (cancelledBy === taskData.user_id && taskData.accepted_by) {
        // Creator cancelled -> notify helper
        recipientId = taskData.accepted_by;
      } else if (cancelledBy === taskData.accepted_by && taskData.user_id) {
        // Helper cancelled -> notify creator
        recipientId = taskData.user_id;
      }
      
      if (recipientId) {
        // Send in-app notification
        await sendTaskCancelledNotification(
          recipientId,
          taskId,
          taskData.title,
          cancellerName
        );
        console.log('✅ [TaskService] In-app cancellation notification sent');
        
        // 🔔 Send push notification (non-blocking)
        const { notifyTaskUpdate } = await import('./pushNotificationDispatcher');
        notifyTaskUpdate({
          recipientId,
          taskId,
          action: 'cancelled',
          title: 'Task Cancelled',
          body: `${cancellerName} has cancelled the task "${taskData.title}"`,
          senderId: cancelledBy,
        }).catch(err => console.warn('[TaskService] Push notification failed:', err));
      }
    } catch (notifError) {
      console.error('⚠️ [TaskService] Failed to send cancellation notification:', notifError);
      // Don't throw - notification failure shouldn't break cancellation
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ [TaskService] cancelTask failed:', error);
    return { success: false, error: error.message };
  }
}

// Complete task
export async function completeTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateTaskStatus(taskId, 'completed');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Confirm task completion (helper or creator) - SIMPLIFIED: No dual completion system
export async function confirmTaskCompletion(taskId: string, userId: string, isCreator: boolean): Promise<Task> {
  console.log('✅ [TaskService] confirmTaskCompletion called - marking as completed:', { taskId, userId, isCreator });
  
  try {
    // Simply mark the task as completed (no dual completion columns exist in DB)
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select(`
        *,
        city:cities(id, name),
        area:areas(id, name)
      `)
      .single();

    if (error) throw error;

    console.log('✅ [TaskService] Task marked as completed:', data);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      categoryName: '', // TODO: fetch from category
      cityId: data.city_id,
      cityName: data.city?.name || '',
      areaId: data.area_id,
      areaName: data.area?.name || '',
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      userId: data.user_id,
      userName: '', // TODO: fetch from user
      helperId: data.accepted_by, // ✅ FIX: Use accepted_by instead of helper_id
      acceptedBy: data.accepted_by,
      acceptedAt: data.accepted_at,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    };
  } catch (error: any) {
    console.error('❌ [TaskService] confirmTaskCompletion failed:', error);
    throw error;
  }
}

// Start task (transition from accepted to in_progress)
export async function startTask(taskId: string): Promise<Task> {
  console.log('🚀 [TaskService] startTask called:', { taskId });
  
  try {
    const updatedTask = await updateTaskStatus(taskId, 'in_progress');
    console.log('✅ [TaskService] Task started successfully');
    return updatedTask;
  } catch (error) {
    console.error('❌ [TaskService] startTask failed:', error);
    throw error;
  }
}

// Get all tasks (alias for getTasks without filters)
export async function getAllTasks(filters?: TaskFilters): Promise<Task[]> {
  return getTasks(filters).then(result => result.tasks);
}