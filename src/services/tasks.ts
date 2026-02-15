// =====================================================
// Task Service - Backend communication for Tasks feature
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';
import { getCurrentUser } from './auth';

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
}

// Get all tasks with optional filters
export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  try {
    console.log('📋 [TaskService] getTasks called with filters:', filters);
    
    const currentUser = getCurrentUser();
    
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

    // Apply filters
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.cityId) {
      query = query.eq('city_id', filters.cityId);
    }
    if (filters?.areaId) {
      query = query.eq('area_id', filters.areaId);
    }
    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      // Silent graceful failure - return empty array
      return [];
    }

    if (!data) {
      console.log('ℹ️ [TaskService] No tasks found');
      return [];
    }

    console.log(`✅ [TaskService] Found ${data.length} tasks`);

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
        helperId: task.helper_id,
        acceptedBy: task.accepted_by,
        acceptedAt: task.accepted_at,
        acceptedPrice: task.accepted_price,
        createdAt: task.created_at,
        completedAt: task.completed_at,
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
      console.log('📊 [TaskService] Tasks sorted by distance');
    }

    return tasks;
  } catch (error) {
    // Silent graceful failure - return empty array
    return [];
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

    // Calculate distance if user coordinates are provided
    let distance: number | undefined = undefined;
    if (userLat && userLon && data.latitude && data.longitude) {
      distance = calculateDistance(userLat, userLon, data.latitude, data.longitude);
      console.log(`📍 [TaskService] Task distance: ${distance.toFixed(2)} km`);
    }

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
      userName: '', // TODO: fetch from user
      helperId: data.helper_id,
      acceptedBy: data.accepted_by,
      acceptedAt: data.accepted_at,
      acceptedPrice: data.accepted_price,
      createdAt: data.created_at,
      completedAt: data.completed_at,
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
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [TaskService] Error creating task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [TaskService] Task created successfully');

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

    // Set helper_id and accepted_by when accepting
    if (status === 'accepted' && helperId) {
      updates.helper_id = helperId;
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
      helperId: data.helper_id,
      acceptedBy: data.accepted_by,
      acceptedAt: data.accepted_at,
      createdAt: data.created_at,
      completedAt: data.completed_at,
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

    // SOFT DELETE: Set status to 'deleted' instead of removing from database
    // This keeps the task for user's history but hides it from public view
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'deleted',
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
      helperId: data.helper_id,
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
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.cityId !== undefined) updateData.city_id = updates.cityId;
    if (updates.areaId !== undefined) updateData.area_id = updates.areaId;
    if (updates.subAreaId !== undefined) updateData.sub_area_id = updates.subAreaId || null; // ✅ FIX: Convert empty to null
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
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
      .eq('id', taskId);

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
      .or(`user_id.eq.${userId},helper_id.eq.${userId}`)
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
      helperId: task.helper_id,
      createdAt: task.created_at,
      completedAt: task.completed_at,
    }));
  } catch (error: any) {
    // Silent graceful failure - return empty array
    return [];
  }
}

// Get tasks created by user
export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    console.log('📋 [TaskService] Getting tasks for user:', userId);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [TaskService] Error fetching user tasks:', error);
      throw error;
    }

    if (!data) {
      console.log('ℹ️ [TaskService] No tasks found for user');
      return [];
    }

    console.log(`✅ [TaskService] Found ${data.length} tasks for user`);

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
      helperId: task.helper_id,
      createdAt: task.created_at,
      completedAt: task.completed_at,
    }));
  } catch (error) {
    console.error('❌ [TaskService] getUserTasks failed:', error);
    // Return empty array instead of throwing to prevent app crashes
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
      helperId: task.helper_id,
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
    
    // Send notification to creator
    const notificationSent = await sendTaskAcceptedNotification(
      updatedTask.userId,
      taskId,
      updatedTask.title,
      helperName
    );
    
    if (notificationSent) {
      console.log('✅ [TaskService] Acceptance notification sent successfully');
    } else {
      console.error('❌ [TaskService] Failed to send acceptance notification');
    }
  } catch (notifError) {
    console.error('⚠️ [TaskService] Failed to send notification:', notifError);
    // Don't throw - notification failure shouldn't break task acceptance
  }
  
  return updatedTask;
}

// Cancel task - Resets to 'open' status and clears helper_id
export async function cancelTask(taskId: string, cancelledBy?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 [TaskService] Cancelling task and resetting to open:', taskId);
    
    // First, get task details to send notifications
    const { data: taskData } = await supabase
      .from('tasks')
      .select('user_id, helper_id, accepted_by, title')
      .eq('id', taskId)
      .single();
    
    // Reset task to 'open' status and clear helper_id
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'open',
        helper_id: null,
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
    if (taskData && cancelledBy) {
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
          await sendTaskCancelledNotification(
            recipientId,
            taskId,
            taskData.title,
            cancellerName
          );
          console.log('✅ [TaskService] Cancellation notification sent');
        }
      } catch (notifError) {
        console.error('⚠️ [TaskService] Failed to send cancellation notification:', notifError);
        // Don't throw - notification failure shouldn't break cancellation
      }
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

// Confirm task completion (helper or creator)
export async function confirmTaskCompletion(taskId: string, userId: string, isCreator: boolean): Promise<Task> {
  console.log('✅ [TaskService] confirmTaskCompletion called:', { taskId, userId, isCreator });
  
  try {
    // Get current task to check status (simplified query without foreign key hints)
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError) throw fetchError;
    if (!currentTask) throw new Error('Task not found');

    // Get creator and helper names separately
    let creatorName = 'Task creator';
    let helperName = 'Helper';
    
    if (currentTask.user_id) {
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', currentTask.user_id)
        .single();
      if (creatorProfile) creatorName = creatorProfile.name;
    }
    
    if (currentTask.helper_id) {
      const { data: helperProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', currentTask.helper_id)
        .single();
      if (helperProfile) helperName = helperProfile.name;
    }

    // Determine which field to update
    const updateField = isCreator ? 'creator_completed' : 'helper_completed';
    const otherField = isCreator ? 'helper_completed' : 'creator_completed';

    // Update the completion flag
    const updateData: any = { [updateField]: true };

    // If the other party has already confirmed, mark task as completed
    const bothConfirmed = currentTask[otherField] === true;
    if (bothConfirmed) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        city:cities(id, name),
        area:areas(id, name),
        category:categories(id, name, emoji)
      `)
      .single();

    if (error) throw error;

    console.log('✅ [TaskService] Task completion confirmed:', data);

    // Send notification to the other party
    const otherUserId = isCreator ? currentTask.helper_id : currentTask.user_id;
    const confirmerName = isCreator ? creatorName : helperName;

    if (otherUserId) {
      try {
        const { createNotification } = await import('./notifications');
        
        if (bothConfirmed) {
          // Task is now completed - notify both parties
          await createNotification({
            userId: otherUserId,
            title: '🎉 Task Completed!',
            message: `Task "${currentTask.title}" has been marked as complete by both parties.`,
            type: 'task_completed',
            taskId: taskId,
          });
          console.log('✅ Sent task completed notification');
        } else {
          // Waiting for other party's confirmation
          await createNotification({
            userId: otherUserId,
            title: '✅ Confirm Task Completion',
            message: `${confirmerName} marked the task complete. Click to confirm: "${currentTask.title}"`,
            type: 'task_completion_pending',
            taskId: taskId,
            actionUrl: `/tasks/${taskId}`,
            actionLabel: 'Confirm Completion',
          });
          console.log('✅ Sent completion pending notification');
        }
      } catch (notifError) {
        console.error('Failed to send completion notification:', notifError);
        // Don't throw - notification failure shouldn't block completion
      }
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      categoryName: data.category?.name || '',
      categoryEmoji: data.category?.emoji || '',
      price: data.price,
      budgetMin: data.budget_min,
      budgetMax: data.budget_max,
      isNegotiable: data.is_negotiable,
      cityId: data.city_id,
      cityName: data.city?.name || '',
      areaId: data.area_id,
      areaName: data.area?.name || '',
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      userId: data.user_id,
      userName: '', // Will be populated by caller if needed
      helperId: data.helper_id,
      acceptedBy: data.accepted_by,
      acceptedAt: data.accepted_at,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      helperCompleted: data.helper_completed,
      creatorCompleted: data.creator_completed,
    };
  } catch (error: any) {
    console.error('❌ [TaskService] confirmTaskCompletion failed:', error);
    throw error;
  }
}

// Undo task completion confirmation (allows user to revert before other party confirms)
export async function undoTaskCompletion(taskId: string, userId: string, isCreator: boolean): Promise<{ success: boolean; error?: string }> {
  console.log('↩️ [TaskService] undoTaskCompletion called:', { taskId, userId, isCreator });
  
  try {
    // Get current task to check status
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('status, creator_completed, helper_completed, user_id, helper_id')
      .eq('id', taskId)
      .single();

    if (fetchError) throw fetchError;
    if (!currentTask) throw new Error('Task not found');

    // Can't undo if task is already completed by both parties
    if (currentTask.status === 'completed') {
      return { 
        success: false, 
        error: 'Cannot undo - task is already completed by both parties' 
      };
    }

    // Verify user is part of this task
    if (isCreator && currentTask.user_id !== userId) {
      return { success: false, error: 'You are not the creator of this task' };
    }
    if (!isCreator && currentTask.helper_id !== userId) {
      return { success: false, error: 'You are not the helper for this task' };
    }

    // Determine which field to update
    const updateField = isCreator ? 'creator_completed' : 'helper_completed';

    // Remove the completion flag
    const { error } = await supabase
      .from('tasks')
      .update({ [updateField]: false })
      .eq('id', taskId);

    if (error) throw error;

    console.log('✅ [TaskService] Task completion undone');
    return { success: true };
  } catch (error: any) {
    console.error('❌ [TaskService] undoTaskCompletion failed:', error);
    return { success: false, error: error.message };
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
  return getTasks(filters);
}