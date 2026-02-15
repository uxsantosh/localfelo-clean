// LocalFelo Chat Service - Clean & Reliable
import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from './auth.ts';

// =====================================================
// TYPES
// =====================================================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_image?: string;
  listing_price: number;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar?: string;
  seller_id: string;
  seller_name: string;
  seller_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  listingtype?: string; // Database column is lowercase
}

// =====================================================
// HELPER
// =====================================================

function getUserId(): string | null {
  const user = getCurrentUser();
  return user?.id || null;
}

// =====================================================
// GET OR CREATE CONVERSATION
// =====================================================

export async function getOrCreateConversation(
  listingId: string,
  listingTitle: string,
  listingImage: string | undefined,
  listingPrice: number | undefined,
  sellerId: string,
  sellerName: string | undefined,
  sellerAvatar: string | undefined,
  listingType: 'listing' | 'wish' | 'task' = 'listing'
): Promise<{ conversation: Conversation | null; error: string | null }> {
  try {
    const userId = getUserId();
    if (!userId) {
      return { conversation: null, error: 'Not authenticated' };
    }

    const currentUser = getCurrentUser()!;

    console.log('💬 [getOrCreateConversation] Starting...');
    console.log('  Listing ID:', listingId);
    console.log('  Listing Type:', listingType);
    console.log('  Current User ID:', userId);
    console.log('  Seller ID (input):', sellerId);

    // Validate seller ID
    if (!sellerId || sellerId.trim() === '') {
      console.error('❌ Invalid seller ID');
      return { conversation: null, error: 'Invalid seller information' };
    }

    // Prevent chatting with yourself
    if (sellerId === userId) {
      console.log('⚠️ User trying to chat with themselves');
      return { conversation: null, error: 'You cannot chat with yourself' };
    }

    // Look up seller profile
    console.log('🔍 Looking up seller profile...');
    let sellerProfile = null;
    let actualSellerId = sellerId; // Default to the provided sellerId
    let actualSellerName = sellerName || 'User';
    let actualSellerAvatar = sellerAvatar || null;

    // Try by ID first (UUID)
    const { data: profileById, error: profileByIdError } = await supabase
      .from('profiles')
      .select('id, client_token, owner_token, display_name, avatar_url')
      .eq('id', sellerId)
      .maybeSingle();

    if (profileByIdError) {
      console.warn('⚠️ Error looking up profile by ID:', profileByIdError);
    }

    if (profileById) {
      console.log('✅ Found seller profile by ID:', profileById.id);
      sellerProfile = profileById;
    } else {
      // Try by owner_token (legacy support)
      const { data: profileByOwnerToken, error: profileByOwnerTokenError } = await supabase
        .from('profiles')
        .select('id, client_token, owner_token, display_name, avatar_url')
        .eq('owner_token', sellerId)
        .maybeSingle();

      if (profileByOwnerTokenError) {
        console.warn('⚠️ Error looking up profile by owner_token:', profileByOwnerTokenError);
      }

      if (profileByOwnerToken) {
        console.log('✅ Found seller profile by owner_token:', profileByOwnerToken.id);
        sellerProfile = profileByOwnerToken;
      } else {
        // Try by client_token as last resort
        const { data: profileByClientToken, error: profileByClientTokenError } = await supabase
          .from('profiles')
          .select('id, client_token, owner_token, display_name, avatar_url')
          .eq('client_token', sellerId)
          .maybeSingle();

        if (profileByClientTokenError) {
          console.warn('⚠️ Error looking up profile by client_token:', profileByClientTokenError);
        }

        if (profileByClientToken) {
          console.log('✅ Found seller profile by client_token:', profileByClientToken.id);
          sellerProfile = profileByClientToken;
        }
      }
    }

    // If profile found, use actual data
    if (sellerProfile) {
      actualSellerId = sellerProfile.id;
      actualSellerName = sellerProfile.display_name || sellerName || 'User';
      actualSellerAvatar = sellerProfile.avatar_url || sellerAvatar || null;
      console.log('✅ Found seller profile:', { id: actualSellerId, name: actualSellerName });
    } else {
      // Profile not found - this can happen with orphaned data or deleted users
      // We'll still allow the conversation to be created for better UX
      console.warn('⚠️ Seller profile not found for ID:', sellerId);
      console.warn('⚠️ Tried: ID lookup, owner_token lookup, client_token lookup');
      console.warn('⚠️ Creating conversation with provided seller info (orphaned data)');
      
      // Use the sellerId as-is (it might be a valid UUID even if profile is deleted)
      actualSellerId = sellerId;
      actualSellerName = sellerName || 'User';
      actualSellerAvatar = sellerAvatar || null;
    }

    // Prevent chatting with yourself (check both original and actual seller ID)
    if (sellerId === userId || actualSellerId === userId) {
      console.log('⚠️ User trying to chat with themselves');
      return { conversation: null, error: 'You cannot chat with yourself' };
    }

    // Check if conversation already exists (in BOTH directions)
    console.log('🔍 Checking for existing conversation...');

    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', listingId)
      .or(`and(buyer_id.eq.${userId},seller_id.eq.${actualSellerId}),and(buyer_id.eq.${actualSellerId},seller_id.eq.${userId})`)
      .maybeSingle();

    if (existing) {
      console.log('✅ Found existing conversation:', existing.id);
      return { conversation: existing, error: null };
    }

    // Create new conversation
    console.log('💬 Creating new conversation...');

    const conversationData = {
      listing_id: listingId,
      listing_title: listingTitle,
      listing_image: listingImage || null,
      listing_price: listingPrice || 0,
      buyer_id: userId,
      buyer_name: currentUser.name,
      buyer_avatar: currentUser.profilePic || null,
      seller_id: actualSellerId,
      seller_name: actualSellerName,
      seller_avatar: actualSellerAvatar,
      listingtype: listingType, // ✅ Database column is lowercase
    };

    console.log('📝 Conversation data:', conversationData);

    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create conversation:', insertError);
      return { conversation: null, error: insertError.message };
    }

    console.log('✅ Conversation created:', newConversation.id);
    return { conversation: newConversation, error: null };
  } catch (error: any) {
    console.error('❌ Exception in getOrCreateConversation:', error);
    return { conversation: null, error: error.message || 'Failed to create conversation' };
  }
}

// =====================================================
// GET CONVERSATIONS WITH SMART FILTERING
// =====================================================

export async function getConversations(): Promise<{
  conversations: Conversation[];
  error: string | null;
}> {
  try {
    const userId = getUserId();
    if (!userId) {
      return { conversations: [], error: 'Not authenticated' };
    }

    console.log('📋 [getConversations] Fetching for user:', userId);

    // Get all conversations where user is buyer OR seller
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching conversations:', error);
      return { conversations: [], error: null };
    }

    console.log(`📋 Found ${data?.length || 0} conversations`);

    // Filter conversations based on listing type
    const validConversations = await Promise.all(
      (data || []).map(async (conv) => {
        const listingType = conv.listingtype || 'listing';

        console.log(`🔍 Checking conversation ${conv.id.slice(0, 8)}... type: ${listingType}`);

        // Tasks and wishes - always keep (they're in separate tables)
        if (listingType === 'task' || listingType === 'wish') {
          console.log(`  ✅ Keeping ${listingType} conversation`);
          return conv;
        }

        // If listingType is 'listing' but listing doesn't exist in listings table,
        // check if it exists in tasks or wishes tables (fix for old conversations)
        if (listingType === 'listing') {
          // Check tasks table
          const { data: taskExists } = await supabase
            .from('tasks')
            .select('id')
            .eq('id', conv.listing_id)
            .maybeSingle();

          if (taskExists) {
            console.log(`  🔧 Found in tasks table, keeping and updating type...`);
            // Update the conversation to have correct type
            await supabase
              .from('conversations')
              .update({ listingtype: 'task' })
              .eq('id', conv.id);
            return { ...conv, listingtype: 'task' };
          }

          // Check wishes table
          const { data: wishExists } = await supabase
            .from('wishes')
            .select('id')
            .eq('id', conv.listing_id)
            .maybeSingle();

          if (wishExists) {
            console.log(`  🔧 Found in wishes table, keeping and updating type...`);
            // Update the conversation to have correct type
            await supabase
              .from('conversations')
              .update({ listingtype: 'wish' })
              .eq('id', conv.id);
            return { ...conv, listingtype: 'wish' };
          }
        }

        // Marketplace listings - check if still active
        const { data: listing } = await supabase
          .from('listings')
          .select('id, is_active')
          .eq('id', conv.listing_id)
          .eq('is_active', true)
          .maybeSingle();

        if (!listing) {
          console.log(`  ❌ Filtering out inactive/deleted marketplace listing`);
          return null;
        }

        console.log(`  ✅ Keeping active marketplace listing`);
        return conv;
      })
    );

    // Remove nulls
    const filtered = validConversations.filter((c): c is Conversation => c !== null);

    // Add unread counts
    const withUnread = await Promise.all(
      filtered.map(async (conv) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .eq('read', false);

        return {
          ...conv,
          unread_count: count || 0,
        };
      })
    );

    console.log(`📋 Returning ${withUnread.length} conversations`);
    return { conversations: withUnread, error: null };
  } catch (error: any) {
    console.error('❌ Exception in getConversations:', error);
    return { conversations: [], error: null };
  }
}

// =====================================================
// MESSAGES
// =====================================================

export async function getMessages(
  conversationId: string
): Promise<{ messages: Message[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { messages: data || [], error: null };
  } catch (error: any) {
    console.error('Error in getMessages:', error);
    return { messages: [], error: error.message };
  }
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ message: Message | null; error: string | null }> {
  try {
    const userId = getUserId();
    if (!userId) {
      return { message: null, error: 'Not authenticated' };
    }

    const currentUser = getCurrentUser()!;
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return { message: null, error: 'Message cannot be empty' };
    }

    console.log('📤 Sending message...');

    // Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        sender_name: currentUser.name,
        sender_avatar: currentUser.profilePic,
        content: trimmedContent,
        read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to send message:', insertError);
      return { message: null, error: insertError.message };
    }

    // Update conversation
    await supabase
      .from('conversations')
      .update({
        last_message: trimmedContent,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // Send notification (don't wait for it)
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('buyer_id, seller_id, listing_title')
        .eq('id', conversationId)
        .single();

      if (conv) {
        const recipientId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
        const { sendChatMessageNotification } = await import('./notifications');
        await sendChatMessageNotification(
          recipientId,
          userId,
          currentUser.name,
          conversationId,
          conv.listing_title || 'Conversation',
          trimmedContent
        );
      }
    } catch (notifError) {
      console.warn('⚠️ Notification failed:', notifError);
    }

    console.log('✅ Message sent');
    return { message: newMessage, error: null };
  } catch (error: any) {
    console.error('❌ Exception in sendMessage:', error);
    return { message: null, error: error.message };
  }
}

export async function markMessagesAsRead(
  conversationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = getUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in markMessagesAsRead:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// UNREAD COUNTS
// =====================================================

export async function getTotalUnreadCount(): Promise<number> {
  try {
    const userId = getUserId();
    if (!userId) return 0;

    const { data: userConversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    if (!userConversations || userConversations.length === 0) {
      return 0;
    }

    const conversationIds = userConversations.map(c => c.id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('read', false);

    return count || 0;
  } catch (error: any) {
    console.error('Error in getTotalUnreadCount:', error);
    return 0;
  }
}

export const getUnreadCount = getTotalUnreadCount;

export async function markAllMessagesAsRead(): Promise<{
  success: boolean;
  error: string | null;
  count?: number;
}> {
  try {
    const userId = getUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userConversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    if (!userConversations || userConversations.length === 0) {
      return { success: true, error: null, count: 0 };
    }

    const conversationIds = userConversations.map(c => c.id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('read', false);

    if (!count || count === 0) {
      return { success: true, error: null, count: 0 };
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { success: true, error: null, count };
  } catch (error: any) {
    console.error('Error in markAllMessagesAsRead:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
    supabase.removeChannel(channel);
  };
}

export function subscribeToConversations(onChange: () => void) {
  console.log('🔔 Setting up real-time subscriptions...');

  const channel = supabase
    .channel('conversations-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      () => {
        console.log('🔔 Conversation changed');
        onChange();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      () => {
        console.log('🔔 Message changed');
        onChange();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscriptions active');
      }
    });

  return {
    unsubscribe: () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    },
  };
}

// =====================================================
// LEGACY COMPATIBILITY (for wishes/tasks)
// =====================================================

export async function createWishChatThread(): Promise<{ threadId: string | null; error: string | null }> {
  // Conversations are created on-demand when users click Chat
  return { threadId: null, error: null };
}

export async function createTaskChatThread(): Promise<{ threadId: string | null; error: string | null }> {
  // Conversations are created on-demand when users click Chat
  return { threadId: null, error: null };
}