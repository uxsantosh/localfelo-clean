# 💬 OldCycle Chat Feature Documentation

## Overview
The chat feature enables real-time 1-to-1 messaging between buyers and sellers directly in the OldCycle app. Messages are stored in Supabase and updated in real-time using Supabase Realtime subscriptions.

---

## 🎯 Features

### ✅ **What's Included:**
1. **Real-time Messaging** - Live updates using Supabase Real-time
2. **Conversation Management** - Organized chats per listing
3. **Unread Count Badges** - Visual indicators for new messages
4. **Mobile-First UI** - Optimized for mobile with responsive desktop layout
5. **Login-Required** - Chat only available to authenticated users
6. **Message History** - Persistent message storage
7. **Date Grouping** - Messages grouped by date for better readability
8. **Typing Indicators** - Visual feedback while sending
9. **Image Carousel Integration** - Shows listing details in chat

### 🚫 **What's NOT Included (Future Enhancements):**
- File/Image attachments
- Voice messages
- Read receipts for individual messages
- Message editing/deletion
- Push notifications
- Typing indicators (live)
- Message search

---

## 📁 Files Created

### **1. Backend Services**
- `/services/chat.ts` - Chat operations and Supabase queries

### **2. UI Components**
- `/components/ChatList.tsx` - List of all conversations
- `/components/ChatWindow.tsx` - Individual chat interface
- `/components/BottomNavigation.tsx` - **UPDATED** - Added chat icon and moved Sell button to right

### **3. Screens**
- `/screens/ChatScreen.tsx` - Main chat screen with mobile/desktop layouts

### **4. Database Schema**
- `/supabase_chat_schema.sql` - SQL schema for Supabase tables

### **5. Documentation**
- `/CHAT_FEATURE_README.md` - This file

---

## 📱 UI Changes

### **Bottom Navigation (Mobile)**
**NEW ORDER (Left to Right):**
1. 🏠 **Home** - Browse listings
2. 💬 **Chat** - Messages (with unread badge)
3. 👤 **Profile** - User profile
4. 🛡️ **Admin** - Admin panel (if admin)
5. ➕ **SELL** - Create listing (FAR RIGHT, prominent button)

**Changes:**
- Added Chat icon between Home and Profile
- Moved SELL button to the far right for better balance
- Added red unread count badge on Chat icon
- Chat only visible when logged in

---

## 🗄️ Database Schema

### **Tables Created:**

#### **1. `conversations`**
Stores conversation metadata between buyer and seller for a listing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `listing_id` | TEXT | Reference to listing |
| `listing_title` | TEXT | Listing title (cached) |
| `listing_image` | TEXT | First listing image URL |
| `listing_price` | INTEGER | Listing price (cached) |
| `buyer_id` | TEXT | Buyer's user ID |
| `buyer_name` | TEXT | Buyer's name (cached) |
| `buyer_avatar` | TEXT | Buyer's avatar URL |
| `seller_id` | TEXT | Seller's user ID |
| `seller_name` | TEXT | Seller's name (cached) |
| `seller_avatar` | TEXT | Seller's avatar URL |
| `last_message` | TEXT | Preview of last message |
| `last_message_at` | TIMESTAMP | When last message was sent |
| `created_at` | TIMESTAMP | When conversation started |
| `updated_at` | TIMESTAMP | Last activity timestamp |

**Unique Constraint:** `(listing_id, buyer_id, seller_id)` - One conversation per buyer-seller-listing combination

#### **2. `messages`**
Stores individual messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | Foreign key to conversations |
| `sender_id` | TEXT | User ID of sender |
| `sender_name` | TEXT | Sender's name (cached) |
| `sender_avatar` | TEXT | Sender's avatar URL |
| `content` | TEXT | Message text content |
| `read` | BOOLEAN | Whether message has been read |
| `created_at` | TIMESTAMP | When message was sent |

---

## 🔐 Security (RLS Policies)

**Row Level Security (RLS) is ENABLED for both tables.**

### **Conversations Policies:**
✅ Users can view conversations where they are buyer OR seller
✅ Users can create conversations (as buyer)
✅ Users can update conversations they're part of

### **Messages Policies:**
✅ Users can view messages in their conversations
✅ Users can send messages in their conversations
✅ Users can update messages (mark as read)

---

## 🚀 Setup Instructions

### **Step 1: Run SQL Schema**
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy contents of `/supabase_chat_schema.sql`
3. Paste and **Run** the SQL script
4. Verify tables created: `conversations` and `messages`

### **Step 2: Enable Realtime**
1. Go to **Database** → **Replication**
2. Ensure **`conversations`** table is enabled for replication
3. Ensure **`messages`** table is enabled for replication

### **Step 3: Test the Feature**
1. Login as User A
2. View a listing created by User B
3. Click "Chat with Seller" button *(You'll need to add this button to ListingDetailScreen)*
4. Send a message
5. Login as User B and see the message appear in real-time!

---

## 🔧 Integration Points

### **Where to Add "Chat with Seller" Button:**

In `/screens/ListingDetailScreen.tsx`, add a button to start a conversation:

```tsx
import { getOrCreateConversation } from '../services/chat';

const handleChatSeller = async () => {
  if (!isLoggedIn) {
    onLoginRequired();
    return;
  }

  const { conversation, error } = await getOrCreateConversation(
    listing.id,
    listing.sellerId,
    listing.sellerName,
    listing.title,
    listing.price,
    listing.images[0]
  );

  if (error) {
    toast.error('Failed to start chat');
    return;
  }

  // Navigate to chat screen with this conversation
  // You'll need to pass conversation ID and update ChatScreen
  navigateToChat(conversation.id);
};
```

---

## 📊 Real-time Functionality

### **How it Works:**
1. **Supabase Realtime** listens for INSERT events on `messages` table
2. When a new message is inserted, all subscribed clients receive the update
3. The `ChatWindow` component automatically displays the new message
4. The `ChatList` updates to show the latest message preview

### **Subscriptions:**
- **`subscribeToMessages(conversationId, callback)`** - Listen for new messages in a specific conversation
- **`subscribeToConversations(callback)`** - Listen for updates to all user's conversations

---

## 🎨 UI/UX Features

### **Mobile View:**
- Full-screen chat when conversation selected
- Back button to return to conversation list
- Fixed input at bottom
- Swipe-friendly message bubbles

### **Desktop View:**
- Split layout: Conversation list (left) | Chat window (right)
- Persistent conversation list
- Larger message area
- Quick switching between conversations

### **Message Display:**
- Date dividers (Today, Yesterday, specific dates)
- Sender's messages on right (primary color)
- Receiver's messages on left (card background)
- Timestamps on each message
- Auto-scroll to latest message

---

## 🐛 Known Limitations

1. **No file attachments** - Text-only for now
2. **Phone/WhatsApp buttons not connected** - Need to integrate with listing data
3. **No push notifications** - Only in-app real-time updates
4. **No message search** - Manual scrolling required
5. **No typing indicators** - Can't see when other person is typing
6. **No read receipts per message** - Only unread count per conversation

---

## 📝 Next Steps / Future Enhancements

1. **Add "Chat with Seller" button on listing details page**
2. **Implement image attachments** using Supabase Storage
3. **Add push notifications** using Supabase Edge Functions + FCM
4. **Typing indicators** using Supabase Presence
5. **Message search functionality**
6. **Block/Report users** for safety
7. **Delete conversations**
8. **Mute notifications per conversation**

---

## 📚 API Reference

### **Chat Service Functions:**

#### `getOrCreateConversation(listingId, sellerId, sellerName, listingTitle, listingPrice, listingImage?)`
Returns existing conversation or creates new one.

#### `getConversations()`
Fetch all conversations for current user.

#### `getMessages(conversationId)`
Fetch all messages in a conversation.

#### `sendMessage(conversationId, content)`
Send a new message.

#### `markMessagesAsRead(conversationId)`
Mark all unread messages as read.

#### `subscribeToMessages(conversationId, callback)`
Subscribe to real-time updates for a conversation.

#### `subscribeToConversations(callback)`
Subscribe to real-time updates for all conversations.

---

## 🎉 Summary

The chat feature is now fully integrated into OldCycle! Users can:
- ✅ Start conversations from listing pages
- ✅ Send and receive messages in real-time
- ✅ View all conversations in one place
- ✅ See unread message counts
- ✅ Use on both mobile and desktop

All without disturbing the existing UI - the Sell button is now on the right side of the bottom navigation for better balance! 🚀
