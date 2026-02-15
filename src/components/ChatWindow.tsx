import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { Conversation, Message, getMessages, sendMessage, markMessagesAsRead, subscribeToMessages } from '../services/chat';
import { getCurrentUser } from '../services/auth.ts';
import { toast } from 'sonner';
import { Header } from './Header';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  onConversationUpdate?: () => void;
  onListingClick?: (listingId: string, listingType?: string) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onGlobalLocationClick?: () => void;
  onNavigate?: (screen: any) => void;
}

export function ChatWindow({ 
  conversation, 
  onBack, 
  onConversationUpdate, 
  onListingClick,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
  unreadCount = 0,
  notificationCount = 0,
  onNotificationClick,
  onMenuClick,
  globalLocationArea,
  globalLocationCity,
  onGlobalLocationClick,
  onNavigate,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // 🔥 NEW: Input field ref for auto-focus
  const markAsReadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedAsReadRef = useRef(false);
  const sendingRef = useRef(false); // 🔥 NEW: Prevent rapid-fire sends with ref

  // Get current user ID consistently
  const currentUserId = useMemo(() => {
    const currentUser = getCurrentUser();
    // Use user.id (UUID string) consistently
    const userId = currentUser?.id || null;
    console.log('💬 [ChatWindow] Current User ID:', userId);
    console.log('💬 [ChatWindow] Current User:', currentUser);
    return userId;
  }, []);

  const currentUser = getCurrentUser();

  const otherParty = conversation.buyer_id === currentUserId
    ? { name: conversation.seller_name, avatar: conversation.seller_avatar }
    : { name: conversation.buyer_name, avatar: conversation.buyer_avatar };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  useEffect(() => {
    // Reset mark-as-read flag when conversation changes
    hasMarkedAsReadRef.current = false;

    const loadMessages = async () => {
      console.log('📨 [ChatWindow] Loading messages for conversation:', conversation.id);
      const { messages: data, error } = await getMessages(conversation.id);
      console.log('📨 [ChatWindow] Messages loaded:', { count: data.length, error, messages: data });
      if (!error) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } else {
        console.error('❌ [ChatWindow] Error loading messages:', error);
      }
    };

    loadMessages();

    // Polling fallback - reload messages every 3 seconds to catch any missed updates
    const pollInterval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [conversation.id]);



  // Stable callback for new messages
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Prevent duplicates
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      setTimeout(scrollToBottom, 100);
      return [...prev, message];
    });

    // If message from other user and tab visible, mark as read after delay
    if (message.sender_id !== currentUserId && document.visibilityState === 'visible') {
      if (markAsReadTimerRef.current) {
        clearTimeout(markAsReadTimerRef.current);
      }
      markAsReadTimerRef.current = setTimeout(() => {
        markMessagesAsRead(conversation.id);
        hasMarkedAsReadRef.current = true;
      }, 500);
    }
  }, [conversation.id, currentUserId]);



  // Real-time message subscription
  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      conversation.id,
      handleNewMessage
    );

    return () => {
      unsubscribe();
    };
  }, [conversation.id, handleNewMessage]);

  // Mark messages as read after 0.5 seconds of viewing (only once)
  useEffect(() => {
    if (hasMarkedAsReadRef.current) return;

    const unreadMessages = messages.filter(
      (m) => !m.read && m.sender_id !== currentUserId
    );

    if (unreadMessages.length === 0) return;

    // Only mark as read if tab is visible
    if (document.visibilityState !== 'visible') return;

    markAsReadTimerRef.current = setTimeout(async () => {
      await markMessagesAsRead(conversation.id);
      hasMarkedAsReadRef.current = true;
      
      // Update local state immediately
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id !== currentUserId && !m.read ? { ...m, read: true } : m
        )
      );
    }, 500);

    return () => {
      if (markAsReadTimerRef.current) {
        clearTimeout(markAsReadTimerRef.current);
      }
    };
  }, [conversation.id, messages, currentUserId]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !hasMarkedAsReadRef.current) {
        const unreadMessages = messages.filter(
          (m) => !m.read && m.sender_id !== currentUserId
        );

        if (unreadMessages.length > 0) {
          markAsReadTimerRef.current = setTimeout(async () => {
            await markMessagesAsRead(conversation.id);
            hasMarkedAsReadRef.current = true;
            
            // Update local state immediately
            setMessages((prev) =>
              prev.map((m) =>
                m.sender_id !== currentUserId && !m.read ? { ...m, read: true } : m
              )
            );
          }, 500);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversation.id, messages, currentUserId]);

  // Send message
  const handleSend = async () => {
    console.log('🔵 [handleSend] START - newMessage:', newMessage);
    console.log('🔵 [handleSend] newMessage.trim():', newMessage.trim());
    console.log('🔵 [handleSend] sending:', sending);
    
    if (!newMessage.trim() || sending || sendingRef.current) {
      console.log('❌ [handleSend] BLOCKED - empty, already sending, or rapid-fire');
      return;
    }

    sendingRef.current = true; // 🔥 NEW: Set ref to true to prevent rapid-fire sends
    setSending(true);
    const content = newMessage.trim();
    console.log('🔵 [handleSend] Content to send:', content);
    console.log('🔵 [handleSend] Clearing input NOW');
    setNewMessage('');

    console.log('🔵 Sending message to conversation:', conversation.id);
    console.log('🔵 Current user ID:', currentUserId);
    console.log('🔵 Message content:', content);

    const { message, error } = await sendMessage(conversation.id, content);

    console.log('🔴 Send result:', { message, error });
    console.log('🔴 Error type:', typeof error);
    console.log('🔴 Error stringified:', JSON.stringify(error));

    if (error) {
      console.error('❌ Send message error:', error);
      // Show the actual error properly
      const errorMsg = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
      toast.error(`Failed to send: ${errorMsg}`);
      setNewMessage(content);
    } else if (message) {
      console.log('✅ Message sent successfully:', message);
      // Add to messages if not already added by realtime
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      onConversationUpdate?.();
    }

    setSending(false);
    sendingRef.current = false; // 🔥 NEW: Reset ref after send
    
    // 🔥 NEW: Keep input focused after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    
    console.log('🔵 [handleSend] COMPLETE');
  };

  // Handle Enter key with proper event prevention
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('⌨️ [handleKeyDown] Key pressed:', e.key);
    console.log('⌨️ [handleKeyDown] Current input value:', newMessage);
    console.log('⌨️ [handleKeyDown] ShiftKey:', e.shiftKey);
    console.log('⌨️ [handleKeyDown] Sending:', sending);
    
    if (e.key === 'Enter' && !e.shiftKey && !sending) {
      console.log('⌨️ [handleKeyDown] ENTER DETECTED - preventing default and calling handleSend');
      e.preventDefault(); // Prevent form submission and duplicate events
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white w-full overflow-hidden">
      {/* Main Navigation Header - Same as all other screens */}
      <Header
        currentScreen="chat"
        onNavigate={onNavigate as any}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onMenuClick={onMenuClick}
        showGlobalLocation={true}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onGlobalLocationClick}
        onGlobalSearchClick={() => {}}
      />

      {/* Conversation Info Sub-header */}
      <div className="flex-none z-30 flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-10 h-10 bg-[#CDFF00] text-black rounded-full flex items-center justify-center shrink-0 font-semibold">
          {otherParty.name.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => {
            console.log('🔥 [ChatWindow] HEADER CLICKED!');
            onListingClick?.(conversation.listing_id, conversation.listingtype);
          }}
          className="flex-1 min-w-0 overflow-hidden text-left hover:bg-gray-100 -my-2 py-2 px-2 -mx-2 rounded-lg transition-colors"
        >
          <h2 className="font-semibold text-sm text-black truncate">{otherParty.name}</h2>
          <p className="text-xs text-gray-600 truncate">{conversation.listing_title}</p>
        </button>
        <div className="text-right shrink-0">
          <p className="text-black font-bold whitespace-nowrap text-sm">
            ₹{conversation.listing_price.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Messages - Scrollable area with padding for fixed input at bottom */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain pb-32 md:pb-24 bg-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            console.log('💬 [Message Render] Message ID:', message.id, 'Sender:', message.sender_id, 'Current User:', currentUserId, 'isOwn:', isOwn);
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-[#CDFF00] text-black rounded-br-sm'
                      : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-black/60' : 'text-gray-600'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - FIXED at bottom for both mobile and desktop */}
      <div className="fixed bottom-16 md:bottom-12 left-0 right-0 z-30 p-4 border-t border-border bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 max-w-7xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
            ref={inputRef}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-[#CDFF00] text-black font-semibold rounded-lg hover:bg-[#B8E600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}