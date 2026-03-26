import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Package, ShoppingBag, Heart, Briefcase, Store } from 'lucide-react';
import { Header } from '../components/Header';
import { Conversation, getConversations, subscribeToConversations } from '../services/chat';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import { getCurrentUserSync } from '../services/auth';
import { toast } from 'sonner';

interface ChatScreenProps {
  onBack?: () => void;
  initialConversationId?: string | null;
  onNavigate?: (screen: string, data?: any) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  onMenuClick?: () => void;
  unreadCount?: number;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onGlobalLocationClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

type ChatTabType = 'all' | 'sell' | 'buy' | 'wishes' | 'tasks' | 'shops';

export function ChatScreen({
  onBack: onBackProp,
  initialConversationId,
  onNavigate,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
  unreadCount = 0,
  onMenuClick,
  globalLocationArea,
  globalLocationCity,
  onGlobalLocationClick,
  notificationCount = 0,
  onNotificationClick,
}: ChatScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChatTabType>('all');
  const [notFoundConversationId, setNotFoundConversationId] = useState<string | null>(null);

  const currentUser = getCurrentUserSync();
  const currentUserId = currentUser?.id || null;
  const hasAttemptedInitialLoad = useRef(false);

  console.log('💬 [ChatScreen] Rendered', {
    initialConversationId,
    selectedConversationId,
    conversations: conversations.length
  });

  // Log each conversation in detail
  conversations.forEach((conv, index) => {
    console.log(`[ChatScreen] Conv ${index + 1}:`, {
      id: conv.id,
      listing_id: conv.listing_id,
      listing_title: conv.listing_title,
      listingtype: conv.listingtype,
      last_message: conv.last_message,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      unread_count: conv.unread_count
    });
  });

  const selectedConversation = selectedConversationId
    ? conversations.find(c => c.id === selectedConversationId) || null
    : null;

  // Fetch conversations
  const fetchConversations = async () => {
    console.log('🔄 Fetching conversations...');
    
    const { conversations: data, error } = await getConversations();

    if (error) {
      console.error('❌ Failed to load conversations:', error);
      
      // Don't show toast for "Not authenticated" - it's expected when not logged in
      if (error !== 'Not authenticated') {
        toast.error('Failed to load conversations');
      }
      
      setLoading(false);
      return [];
    }

    console.log(`✅ Loaded ${data.length} conversations`);
    setConversations(data);
    setLoading(false);
    return data; // Return the fetched conversations
  };

  // Initial load
  useEffect(() => {
    if (!hasAttemptedInitialLoad.current) {
      hasAttemptedInitialLoad.current = true;
      fetchConversations();
    }
  }, []);

  // Auto-select conversation when initialConversationId is provided
  useEffect(() => {
    if (!initialConversationId || conversations.length === 0) {
      return;
    }

    console.log('🎯 Auto-selecting conversation:', initialConversationId);

    const targetConv = conversations.find(c => c.id === initialConversationId);

    if (targetConv) {
      console.log('✅ Found target conversation, selecting it');
      setSelectedConversationId(targetConv.id);
      setNotFoundConversationId(null);
    } else {
      console.warn('⚠️ Conversation not found in list:', initialConversationId);
      
      // Try one more refresh after a short delay
      setTimeout(async () => {
        console.log('🔄 Retrying conversation fetch...');
        const freshConversations = await fetchConversations();
        
        // Check in the freshly fetched conversations
        const retryConv = freshConversations.find(c => c.id === initialConversationId);
        if (!retryConv) {
          console.error('❌ Conversation still not found after retry');
          setNotFoundConversationId(initialConversationId);
          toast.error('This conversation is no longer available');
        } else {
          console.log('✅ Found conversation after retry!');
          setSelectedConversationId(retryConv.id);
          setNotFoundConversationId(null);
        }
      }, 1000); // Increased to 1 second to give DB time to sync
    }
  }, [initialConversationId, conversations]);

  // Real-time subscriptions
  useEffect(() => {
    console.log('🔔 Setting up real-time subscriptions...');
    const subscription = subscribeToConversations(() => {
      console.log('🔔 Real-time change detected, refreshing...');
      fetchConversations();
    });

    return () => {
      console.log('🔔 Cleaning up subscriptions...');
      subscription.unsubscribe();
    };
  }, []);



  // Filter conversations by tab
  const filteredConversations = conversations.filter((conv) => {
    if (!currentUserId) {
      console.log('⚠️ No currentUserId, filtering out conversation:', conv.id);
      return false;
    }

    const listingType = conv.listingtype || 'listing';
    const isSeller = conv.seller_id === currentUserId;

    console.log(`🔍 Filtering conv ${conv.id.slice(0, 8)}...`, {
      listingType,
      activeTab,
      isSeller,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      currentUserId
    });

    switch (activeTab) {
      case 'all':
        return true;
      case 'sell':
        return isSeller;
      case 'buy':
        return !isSeller;
      case 'wishes':
        return listingType === 'wish';
      case 'tasks':
        return listingType === 'task';
      case 'shops':
        return listingType === 'shop';
      default:
        return true;
    }
  });

  const handleConversationSelect = (conversationId: string) => {
    console.log('📱 Conversation selected:', conversationId);
    setSelectedConversationId(conversationId);
    setNotFoundConversationId(null);
  };

  const handleBackFromChat = () => {
    console.log('⬅️ Back from chat window');
    setSelectedConversationId(null);
    setNotFoundConversationId(null);
  };

  const handleBack = () => {
    if (selectedConversationId) {
      handleBackFromChat();
    } else if (onBackProp) {
      onBackProp();
    }
  };

  const onListingClick = (listingId: string, listingType?: string) => {
    console.log('📦 Listing clicked:', listingId, 'type:', listingType);
    
    if (!onNavigate) return;

    if (listingType === 'wish') {
      onNavigate('wishDetail', { wishId: listingId });
    } else if (listingType === 'task') {
      onNavigate('taskDetail', { taskId: listingId });
    } else {
      onNavigate('listingDetail', { listingId });
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'all' as ChatTabType, label: 'All', icon: MessageCircle },
    { id: 'sell' as ChatTabType, label: 'Selling', icon: Package },
    { id: 'buy' as ChatTabType, label: 'Buying', icon: ShoppingBag },
    { id: 'wishes' as ChatTabType, label: 'Wishes', icon: Heart },
    { id: 'tasks' as ChatTabType, label: 'Tasks', icon: Briefcase },
    { id: 'shops' as ChatTabType, label: 'Shops', icon: Store },
  ];

  // Show error state if conversation not found
  if (notFoundConversationId) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <Header
          currentScreen="chat"
          onNavigate={onNavigate as any}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          userDisplayName={userDisplayName}
          unreadCount={unreadCount}
          onMenuClick={onMenuClick}
          showGlobalLocation={true}
          globalLocationArea={globalLocationArea}
          globalLocationCity={globalLocationCity}
          onLocationClick={onGlobalLocationClick}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          onGlobalSearchClick={() => {}}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation Not Found</h3>
            <p className="text-gray-500 mb-6">This conversation may have been deleted or is no longer available.</p>
            <button
              onClick={() => {
                setNotFoundConversationId(null);
                if (onBackProp) onBackProp();
              }}
              className="px-6 py-2 bg-[#CDFF00] text-black font-medium hover:bg-[#b8e600] transition-colors"
            >
              Back to Chats
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show chat window if conversation is selected
  if (selectedConversation) {
    return (
      <div className="h-screen bg-white">
        <ChatWindow
          conversation={selectedConversation}
          onBack={handleBackFromChat}
          onListingClick={onListingClick}
          onConversationUpdate={fetchConversations}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          userDisplayName={userDisplayName}
          unreadCount={unreadCount}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          onMenuClick={onMenuClick}
          globalLocationArea={globalLocationArea}
          globalLocationCity={globalLocationCity}
          onGlobalLocationClick={onGlobalLocationClick}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  // Show conversation list
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header
        currentScreen="chat"
        onNavigate={onNavigate as any}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        onMenuClick={onMenuClick}
        showGlobalLocation={true}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onGlobalLocationClick}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onGlobalSearchClick={() => {}}
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = conversations.filter((conv) => {
              if (!currentUserId) return false;
              const listingType = conv.listingtype || 'listing';
              const isSeller = conv.seller_id === currentUserId;

              switch (tab.id) {
                case 'all':
                  return true;
                case 'sell':
                  return isSeller;
                case 'buy':
                  return !isSeller;
                case 'wishes':
                  return listingType === 'wish';
                case 'tasks':
                  return listingType === 'task';
                case 'shops':
                  return listingType === 'shop';
                default:
                  return true;
              }
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#CDFF00] text-black font-medium'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-black rounded-full font-medium">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-500">Loading chats...</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversations</h3>
              <p className="text-gray-500">
                {activeTab === 'all'
                  ? 'Start chatting by clicking the chat button on any listing, wish, or task.'
                  : `You don't have any ${activeTab} conversations yet.`}
              </p>
            </div>
          </div>
        ) : (
          <ChatList
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={(conv) => handleConversationSelect(conv.id)}
          />
        )}
      </div>

    </div>
  );
}