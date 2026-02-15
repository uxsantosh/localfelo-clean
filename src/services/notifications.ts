import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from './auth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task' | 'wish' | 'listing' | 'chat' | 'system' | 'admin' | 'broadcast' | 'info' | 'promotion' | 'alert' | 'task_accepted' | 'task_cancelled' | 'task_completion_request' | 'task_completed' | 'chat_message';
  action_url?: string;
  related_type?: string;
  related_id?: string;
  link?: string; // Legacy - keeping for backward compatibility
  is_read: boolean;
  created_at: string;
  metadata?: any; // For additional data like task titles, prices, etc.
  createdAt?: string; // Alias for created_at (for compatibility)
}

export interface BroadcastNotificationPayload {
  recipients: 'all' | string[]; // 'all' or array of user IDs
  title: string;
  message: string;
  type: 'info' | 'promotion' | 'alert';
  link?: string;
}

/**
 * Send a broadcast notification to multiple users
 */
export async function sendBroadcastNotification({
  recipients,
  title,
  message,
  type,
  link,
}: BroadcastNotificationPayload): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    console.log('📢 [BROADCAST] Starting broadcast notification...');
    console.log('  Recipients mode:', recipients === 'all' ? 'ALL USERS' : `${recipients.length} specific users`);
    console.log('  Title:', title);
    console.log('  Message:', message);
    console.log('  Type:', type);
    
    // Get current user from localStorage (same method used everywhere in the app)
    const currentUser = getCurrentUser();
    
    if (!currentUser?.id) {
      console.error('❌ [BROADCAST] Not authenticated - no user found in localStorage');
      return { success: false, error: 'Not authenticated' };
    }
    
    const adminId = currentUser.id;
    console.log('✅ [BROADCAST] Authenticated as:', adminId);
    
    // Prepare user IDs array (null for all users, keep as UUID)
    const userIds = recipients === 'all' ? null : recipients;
    
    console.log('🔧 [BROADCAST] Calling PostgreSQL function broadcast_notification()...');
    console.log('  Admin ID:', adminId);
    console.log('  User IDs (sample):', userIds ? userIds.slice(0, 3) : 'ALL USERS');
    
    // Call the PostgreSQL function that bypasses RLS
    // Note: Pass admin_id as first parameter (LocalFelo uses localStorage auth, not Supabase auth)
    const { data, error } = await supabase.rpc('broadcast_notification', {
      p_admin_id: adminId,
      p_title: title,
      p_message: message,
      p_type: type,
      p_action_url: link || null,
      p_user_ids: userIds
    });

    if (error) {
      console.error('❌ [BROADCAST] Error calling function:', error);
      throw error;
    }

    // The function returns an array with one row: { success, inserted_count, error_message }
    const result = data?.[0];
    
    if (!result) {
      console.error('❌ [BROADCAST] No result from function');
      return { success: false, error: 'No response from broadcast function' };
    }

    console.log('📊 [BROADCAST] Function result:', result);

    if (!result.success) {
      console.error('❌ [BROADCAST] Function returned error:', result.error_message);
      return { success: false, error: result.error_message || 'Failed to send notification' };
    }

    console.log(`✅ [BROADCAST] Successfully created ${result.inserted_count} notifications`);
    console.log(`📨 Broadcast notification sent to ${result.inserted_count} users`);
    
    return { 
      success: true, 
      count: result.inserted_count 
    };
  } catch (error: any) {
    console.error('❌ [BROADCAST] Failed to send broadcast notification:', error);
    console.error('  Error details:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send notification' 
    };
  }
}

/**
 * Get all notifications (alias for getUserNotifications for backwards compatibility)
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  return getUserNotifications(userId);
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    if (!userId) return 0;
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      // Log the ENTIRE error object to see its structure
      console.warn('🔍 Full notification error object:', JSON.stringify(error, null, 2));
      console.warn('🔍 Error type:', typeof error);
      console.warn('🔍 Error keys:', Object.keys(error));
      
      // Check various possible error properties
      const errorMessage = (error as any).message || '';
      const errorCode = (error as any).code || '';
      
      console.warn('🔍 Extracted - code:', errorCode, 'message:', errorMessage);
      
      // Special case: Error object with only empty "message" property = table doesn't exist
      const errorKeys = Object.keys(error);
      if (errorKeys.length === 1 && errorKeys[0] === 'message' && !errorMessage) {
        console.warn('⚠️ 📋 NOTIFICATIONS TABLE MISSING!');
        console.warn('⚠️ 🔧 ACTION REQUIRED: Run /DATABASE_SETUP_NOTIFICATIONS.sql in Supabase SQL Editor');
        console.warn('⚠️ 📍 Location: Supabase Dashboard → SQL Editor → Paste & Run the SQL file');
        return 0;
      }
      
      // If table doesn't exist, silently return 0
      if (errorCode === '42P01' || 
          errorCode === 'PGRST204' ||
          errorCode === '404' ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('not found')) {
        console.warn('⚠️ Notifications table not found. Run DATABASE_SETUP_NOTIFICATIONS.sql');
        return 0;
      }
      
      // If we get here, it's an unknown error
      console.error('❌ Unknown notification error structure. Returning 0 for safety.');
      return 0;
    }
    return count || 0;
  } catch (error: any) {
    console.error('Failed to get unread count (caught exception):', error);
    return 0;
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // Log the ENTIRE error object to see its structure
      console.warn('🔍 Full notification error object:', JSON.stringify(error, null, 2));
      console.warn('🔍 Error type:', typeof error);
      console.warn('🔍 Error keys:', Object.keys(error));
      
      // Check various possible error properties
      const errorMessage = (error as any).message || '';
      const errorCode = (error as any).code || '';
      
      console.warn('🔍 Extracted - code:', errorCode, 'message:', errorMessage);
      
      // Special case: Error object with only empty "message" property = table doesn't exist
      const errorKeys = Object.keys(error);
      if (errorKeys.length === 1 && errorKeys[0] === 'message' && !errorMessage) {
        console.warn('⚠️ 📋 NOTIFICATIONS TABLE MISSING!');
        console.warn('⚠️ 🔧 ACTION REQUIRED: Run /DATABASE_SETUP_NOTIFICATIONS.sql in Supabase SQL Editor');
        console.warn('⚠️ 📍 Location: Supabase Dashboard → SQL Editor → Paste & Run the SQL file');
        return [];
      }
      
      // If table doesn't exist, silently return empty array
      if (errorCode === '42P01' || 
          errorCode === 'PGRST204' ||
          errorCode === '404' ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('not found')) {
        console.warn('⚠️ Notifications table not found. Run DATABASE_SETUP_NOTIFICATIONS.sql');
        return [];
      }
      
      // If we get here, it's an unknown error
      console.error('❌ Unknown notification error structure. Returning empty array for safety.');
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Failed to get notifications (caught exception):', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
}

/**
 * Create a test notification (for development/testing)
 */
export async function createTestNotification(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
    console.log('✅ Test notification created');
  } catch (error) {
    console.error('Failed to create test notification:', error);
  }
}

/**
 * Subscribe to real-time notification updates
 */
export function subscribeToNotifications(
  userId: string,
  callback: () => void
) {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Send task accepted notification
 */
export async function sendTaskAcceptedNotification(
  taskCreatorId: string,
  taskId: string,
  taskTitle: string,
  helperName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists in profiles table
    const { data: creatorProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', taskCreatorId)
      .single();

    if (profileError || !creatorProfile) {
      console.warn(`⚠️ Cannot send task accepted notification - user ${taskCreatorId} not found in profiles table`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: taskCreatorId,
        title: 'Task Accepted!',
        message: `${helperName} has accepted your task`,
        type: 'task_accepted',
        related_type: 'task',
        related_id: taskId,
        metadata: { taskTitle, helperName },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to send task accepted notification:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send task accepted notification:', error);
    return false;
  }
}

/**
 * Send task cancelled notification
 */
export async function sendTaskCancelledNotification(
  recipientId: string,
  taskId: string,
  taskTitle: string,
  cancellerName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists in profiles table
    const { data: recipientProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipientId)
      .single();

    if (profileError || !recipientProfile) {
      console.warn(`⚠️ Cannot send task cancelled notification - user ${recipientId} not found in profiles table`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title: 'Task Cancelled',
        message: `${cancellerName} has cancelled the task`,
        type: 'task_cancelled',
        related_type: 'task',
        related_id: taskId,
        metadata: { taskTitle, cancellerName },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to send task cancelled notification:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send task cancelled notification:', error);
    return false;
  }
}

/**
 * Send chat message notification
 */
export async function sendChatMessageNotification(
  recipientId: string,
  senderId: string,
  senderName: string,
  conversationId: string,
  listingTitle: string,
  messagePreview: string
): Promise<boolean> {
  try {
    // Don't send notification to yourself
    if (recipientId === senderId) {
      console.log('⚠️ Skipping notification - sender is recipient');
      return true;
    }

    // ✅ VALIDATE: Check if recipient exists in profiles table
    const { data: recipientProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipientId)
      .single();

    if (profileError || !recipientProfile) {
      console.warn(`⚠️ Cannot send notification - recipient ${recipientId} not found in profiles table`);
      console.warn('   This can happen if the profile was deleted or conversation has invalid user_id');
      return false; // Return false but don't throw - this is not a critical error
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title: 'New Message',
        message: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
        type: 'chat_message',
        related_type: 'chat',
        related_id: conversationId,
        action_url: `/chat/${conversationId}`,
        metadata: { 
          conversationId, 
          senderId, 
          senderName,
          listingTitle,
          messagePreview 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to send chat message notification:', error);
      return false;
    }
    
    console.log(`✅ Chat notification sent to ${recipientId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send chat message notification:', error);
    return false;
  }
}

// =====================================================
// 🆕 LISTINGS NOTIFICATIONS
// =====================================================

/**
 * Send notification when someone inquires about a listing via chat
 */
export async function sendListingInquiryNotification(
  listingOwnerId: string,
  listingId: string,
  listingTitle: string,
  inquirerName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: ownerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', listingOwnerId)
      .single();

    if (profileError || !ownerProfile) {
      console.warn(`⚠️ Cannot send listing inquiry notification - owner ${listingOwnerId} not found`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: listingOwnerId,
        title: 'New Inquiry',
        message: `${inquirerName} is interested in "${listingTitle}"`,
        type: 'listing',
        related_type: 'listing',
        related_id: listingId,
        action_url: `/listing/${listingId}`,
        metadata: { 
          listingTitle, 
          inquirerName,
          listingId 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to send listing inquiry notification:', error);
      return false;
    }

    console.log(`✅ Listing inquiry notification sent to ${listingOwnerId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send listing inquiry notification:', error);
    return false;
  }
}

// =====================================================
// 🆕 WISHES NOTIFICATIONS
// =====================================================

/**
 * Send notification when someone offers to help with a wish
 */
export async function sendWishOfferNotification(
  wishOwnerId: string,
  wishId: string,
  wishTitle: string,
  helperName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: ownerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', wishOwnerId)
      .single();

    if (profileError || !ownerProfile) {
      console.warn(`⚠️ Cannot send wish offer notification - owner ${wishOwnerId} not found`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: wishOwnerId,
        title: 'Someone Can Help! 🎉',
        message: `${helperName} wants to help with "${wishTitle}"`,
        type: 'wish',
        related_type: 'wish',
        related_id: wishId,
        action_url: `/wish/${wishId}`,
        metadata: { 
          wishTitle, 
          helperName,
          wishId 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to send wish offer notification:', error);
      return false;
    }

    console.log(`✅ Wish offer notification sent to ${wishOwnerId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send wish offer notification:', error);
    return false;
  }
}

/**
 * Send notification when a wish offer is accepted
 */
export async function sendWishOfferAcceptedNotification(
  helperId: string,
  wishId: string,
  wishTitle: string,
  wishOwnerName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: helperProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', helperId)
      .single();

    if (profileError || !helperProfile) {
      console.warn(`⚠️ Cannot send wish accepted notification - helper ${helperId} not found`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: helperId,
        title: 'Your Help Was Accepted! 🎉',
        message: `${wishOwnerName} accepted your offer to help with "${wishTitle}"`,
        type: 'wish',
        related_type: 'wish',
        related_id: wishId,
        action_url: `/wish/${wishId}`,
        metadata: { 
          wishTitle, 
          wishOwnerName,
          wishId 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to send wish accepted notification:', error);
      return false;
    }

    console.log(`✅ Wish accepted notification sent to ${helperId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send wish accepted notification:', error);
    return false;
  }
}

/**
 * Send notification when wish status changes
 */
export async function sendWishStatusChangeNotification(
  userId: string,
  wishId: string,
  wishTitle: string,
  newStatus: string,
  changedByName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.warn(`⚠️ Cannot send wish status notification - user ${userId} not found`);
      return false;
    }

    // Create user-friendly status messages
    let title = 'Wish Updated';
    let message = '';

    switch (newStatus) {
      case 'completed':
        title = 'Wish Completed! 🎉';
        message = `Your wish "${wishTitle}" has been completed`;
        break;
      case 'cancelled':
        title = 'Wish Cancelled';
        message = `The wish "${wishTitle}" was cancelled by ${changedByName}`;
        break;
      case 'in_progress':
        title = 'Wish In Progress';
        message = `Work has started on "${wishTitle}"`;
        break;
      default:
        message = `Status changed to ${newStatus} for "${wishTitle}"`;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'wish',
        related_type: 'wish',
        related_id: wishId,
        action_url: `/wish/${wishId}`,
        metadata: { 
          wishTitle, 
          newStatus,
          changedByName,
          wishId 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to send wish status notification:', error);
      return false;
    }

    console.log(`✅ Wish status notification sent to ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send wish status notification:', error);
    return false;
  }
}

// =====================================================
// 🆕 TASKS NOTIFICATIONS (Additional)
// =====================================================

/**
 * Send notification when helper requests task completion
 */
export async function sendTaskCompletionRequestNotification(
  taskOwnerId: string,
  taskId: string,
  taskTitle: string,
  helperName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: ownerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', taskOwnerId)
      .single();

    if (profileError || !ownerProfile) {
      console.warn(`⚠️ Cannot send task completion request - owner ${taskOwnerId} not found`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: taskOwnerId,
        title: 'Task Completion Request',
        message: `${helperName} has marked "${taskTitle}" as complete. Please confirm.`,
        type: 'task_completion_request',
        related_type: 'task',
        related_id: taskId,
        action_url: `/task/${taskId}`,
        metadata: { 
          taskTitle, 
          helperName,
          taskId 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error(' Failed to send task completion request:', error);
      return false;
    }

    console.log(`✅ Task completion request sent to ${taskOwnerId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send task completion request:', error);
    return false;
  }
}

/**
 * Send notification when task is fully completed (both parties confirmed)
 */
export async function sendTaskCompletedNotification(
  helperId: string,
  taskId: string,
  taskTitle: string,
  taskOwnerName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: helperProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', helperId)
      .single();

    if (profileError || !helperProfile) {
      console.warn(`⚠️ Cannot send task completed notification - helper ${helperId} not found`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: helperId,
        title: 'Task Completed! 🎉',
        message: `${taskOwnerName} confirmed completion of "${taskTitle}"`,
        type: 'task_completed',
        related_type: 'task',
        related_id: taskId,
        action_url: `/task/${taskId}`,
        metadata: { 
          taskTitle, 
          taskOwnerName,
          taskId 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to send task completed notification:', error);
      return false;
    }

    console.log(`✅ Task completed notification sent to ${helperId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send task completed notification:', error);
    return false;
  }
}

/**
 * Send notification when someone makes an offer on a task
 */
export async function sendTaskOfferNotification(
  taskOwnerId: string,
  taskId: string,
  taskTitle: string,
  offerAmount: number,
  helperName: string
): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: ownerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', taskOwnerId)
      .single();

    if (profileError || !ownerProfile) {
      console.warn(`⚠️ Cannot send task offer notification - owner ${taskOwnerId} not found`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: taskOwnerId,
        title: 'New Task Offer 💰',
        message: `${helperName} offered ₹${offerAmount.toLocaleString('en-IN')} for "${taskTitle}"`,
        type: 'task',
        related_type: 'task',
        related_id: taskId,
        action_url: `/task/${taskId}`,
        metadata: { 
          taskTitle, 
          offerAmount,
          helperName,
          taskId 
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to send task offer notification:', error);
      return false;
    }

    console.log(`✅ Task offer notification sent to ${taskOwnerId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send task offer notification:', error);
    return false;
  }
}

// =====================================================
// 🆕 GENERIC NOTIFICATION CREATOR
// =====================================================

/**
 * Generic function to create any notification
 * Used by task completion and other features
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  taskId?: string;
  wishId?: string;
  listingId?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}): Promise<boolean> {
  try {
    // ✅ VALIDATE: Check if recipient exists
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', params.userId)
      .single();

    if (profileError || !userProfile) {
      console.warn(`⚠️ Cannot send notification - user ${params.userId} not found in profiles table`);
      return false;
    }

    // Determine related_type and related_id
    let relatedType = params.type;
    let relatedId = params.taskId || params.wishId || params.listingId || undefined;

    // Build metadata object
    const metadata = {
      ...params.metadata,
      actionLabel: params.actionLabel,
    };

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type as any,
        related_type: relatedType,
        related_id: relatedId,
        action_url: params.actionUrl,
        metadata,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to create notification:', error);
      return false;
    }

    console.log(`✅ Notification created for user ${params.userId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to create notification:', error);
    return false;
  }
}