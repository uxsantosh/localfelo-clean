import React from "react";
import { ArrowLeft } from "lucide-react";
import { Conversation } from "../services/chat.ts";
import { getCurrentUser } from "../services/auth.ts";

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onBack?: () => void;
}

export function ChatList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onBack,
}: ChatListProps) {
  const currentUser = getCurrentUser();
  // Use user.id consistently
  const currentUserId = currentUser?.id || null;

  console.log('📋 [ChatList] Rendering with:', {
    conversationsCount: conversations.length,
    selectedConversationId,
    currentUserId,
    onSelectConversation: typeof onSelectConversation
  });

  if (!currentUser) return null;

  const getOtherParty = (conversation: Conversation) => {
    const isBuyer = conversation.buyer_id === currentUserId;
    return {
      name: isBuyer
        ? conversation.seller_name
        : conversation.buyer_name,
      avatar: isBuyer
        ? conversation.seller_avatar
        : conversation.buyer_avatar,
    };
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-input rounded-lg transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="font-semibold text-heading">Messages</h2>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-center text-muted">
            No conversations yet.
            <br />
            Start chatting from a listing!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {conversations.map((conversation) => {
            const otherParty = getOtherParty(conversation);
            const isSelected =
              selectedConversationId === conversation.id;
            const hasUnread =
              conversation.unread_count &&
              conversation.unread_count > 0;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  console.log('🖱️ CLICK DETECTED on conversation:', conversation.id);
                  onSelectConversation(conversation);
                }}
                className={`w-full p-4 hover:bg-input/50 transition-colors text-left ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 font-bold">
                    {otherParty.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-heading font-semibold truncate">
                          {otherParty.name}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {conversation.listing_title}
                        </p>
                      </div>
                      {conversation.last_message_at && (
                        <span className="text-xs text-muted whitespace-nowrap">
                          {formatTime(
                            conversation.last_message_at,
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-body truncate flex-1">
                        {conversation.last_message ||
                          "No messages yet"}
                      </p>
                      {hasUnread && (
                        <span className="bg-[#CDFF00] text-black text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                          {conversation.unread_count! > 9
                            ? "9+"
                            : conversation.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {conversation.listing_image && (
                        <img
                          src={conversation.listing_image}
                          alt={conversation.listing_title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <span className="text-primary font-semibold text-sm">
                        ₹
                        {conversation.listing_price.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}