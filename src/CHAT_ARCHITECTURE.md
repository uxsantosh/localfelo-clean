# 🏗️ OldCycle Chat Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ChatScreen   │  │  ChatList    │  │ ChatWindow   │      │
│  │              │  │              │  │              │      │
│  │ - Main UI    │  │ - Show all   │  │ - Messages   │      │
│  │ - Routing    │  │   convos     │  │ - Send input │      │
│  │              │  │ - Unread     │  │ - Real-time  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  /services/     │                        │
│                  │   chat.ts       │                        │
│                  │                 │                        │
│                  │ - getConvos     │                        │
│                  │ - getMessages   │                        │
│                  │ - sendMessage   │                        │
│                  │ - subscribe     │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            │ Supabase Client
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   SUPABASE (Backend)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              AUTHENTICATION (auth.uid())                │ │
│  │  Google OAuth → auth_user_id                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │          HELPER FUNCTION: is_user_id_match()           │ │
│  │                                                         │ │
│  │  Checks if ID matches:                                 │ │
│  │  ✓ auth.uid() (Google OAuth ID)                       │ │
│  │  ✓ profile.id (Database ID)                           │ │
│  │  ✓ client_token (Legacy)                              │ │
│  │  ✓ owner_token (Listings)                             │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │             ROW LEVEL SECURITY (RLS)                   │ │
│  │                                                         │ │
│  │  Conversations:                                        │ │
│  │  → Can view if buyer OR seller                         │ │
│  │  → Can create if buyer                                 │ │
│  │  → Can update if participant                           │ │
│  │                                                         │ │
│  │  Messages:                                             │ │
│  │  → Can view if in conversation                         │ │
│  │  → Can send if in conversation                         │ │
│  │  → Can update (mark read) if in conversation           │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │                  DATABASE TABLES                       │ │
│  │                                                         │ │
│  │  ┌──────────────────┐      ┌──────────────────┐       │ │
│  │  │  conversations   │      │    messages      │       │ │
│  │  │                  │      │                  │       │ │
│  │  │ - id             │◄─────┤ - conversation_id│       │ │
│  │  │ - listing_id     │      │ - sender_id      │       │ │
│  │  │ - buyer_id       │      │ - content        │       │ │
│  │  │ - seller_id      │      │ - read           │       │ │
│  │  │ - last_message   │      │ - created_at     │       │ │
│  │  └──────────────────┘      └──────────────────┘       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │               REALTIME SUBSCRIPTIONS                   │ │
│  │                                                         │ │
│  │  ✓ New conversations                                   │ │
│  │  ✓ New messages                                        │ │
│  │  ✓ Message updates (read status)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow

### Creating a Conversation

```
User clicks "Chat with Seller"
         │
         ▼
getOrCreateConversation(listing, seller)
         │
         ▼
Check if conversation exists
  (listing_id + buyer_id + seller_id)
         │
    ┌────┴────┐
    │         │
  EXISTS    DOESN'T EXIST
    │         │
    ▼         ▼
  Return    Create new
  existing  conversation
    │         │
    └────┬────┘
         ▼
  Open ChatWindow
         │
         ▼
  Subscribe to messages
         │
         ▼
  Poll every 5s (fallback)
```

### Sending a Message

```
User types message
         │
         ▼
Click Send button
         │
         ▼
sendMessage(conversation_id, content)
         │
         ▼
Insert into messages table
         │
         ▼
Update conversation.last_message
         │
         ├─────────────────┐
         ▼                 ▼
  Real-time broadcast   Update UI
         │                 │
         ▼                 ▼
  Other user receives   Scroll to bottom
         │
         ▼
  Auto mark as read (3s delay)
```

### Real-time Updates

```
Message sent in DB
         │
         ▼
Supabase Realtime broadcasts
         │
         ├────────────────────┐
         ▼                    ▼
   User A (sender)     User B (recipient)
         │                    │
         ▼                    ▼
   Update UI            Update UI
   (no duplicate)       Add new message
                             │
                             ▼
                        Mark as read
                        (after 3s viewing)
```

---

## 🆔 User ID Mapping

```
┌─────────────────────────────────────────────────────────┐
│                      PROFILES TABLE                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  id (UUID)              → Database primary key           │
│      ↓                                                    │
│  Used as: user.id in frontend                           │
│                                                           │
│  auth_user_id (UUID)    → Google OAuth ID                │
│      ↓                                                    │
│  Maps to: auth.uid() in Supabase                        │
│                                                           │
│  client_token (TEXT)    → Legacy compatibility           │
│      ↓                                                    │
│  Used in: Old soft-auth system                          │
│                                                           │
│  owner_token (TEXT)     → Listing ownership              │
│      ↓                                                    │
│  Used in: listings.owner_token                          │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            CONVERSATIONS & MESSAGES TABLES               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  buyer_id (TEXT)   → Can be ANY of the above            │
│  seller_id (TEXT)  → Can be ANY of the above            │
│  sender_id (TEXT)  → Can be ANY of the above            │
│                                                           │
│  is_user_id_match() checks ALL possible values          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

### Layer 1: Authentication
```
User must be logged in with Google OAuth
         │
         ▼
auth.uid() is set (Google user ID)
```

### Layer 2: Profile Lookup
```
auth.uid() → profiles.auth_user_id
         │
         ▼
Get all user IDs:
- profile.id
- client_token
- owner_token
```

### Layer 3: RLS Policy Check
```
For each operation, check:
         │
         ▼
is_user_id_match(buyer_id)
    OR
is_user_id_match(seller_id)
         │
         ▼
  ✅ ALLOW  or  ❌ DENY
```

---

## ⚡ Performance Optimizations

### Database Indexes
```
conversations:
- idx_conversations_buyer_id
- idx_conversations_seller_id
- idx_conversations_listing_id
- idx_conversations_updated_at

messages:
- idx_messages_conversation_id
- idx_messages_sender_id
- idx_messages_created_at
- idx_messages_unread (partial index)
```

### Caching Strategy
```
Frontend:
- Conversations cached in ChatScreen state
- Messages cached in ChatWindow state
- Real-time updates merge with cache

Backend:
- PostgreSQL query cache
- Supabase connection pooling
```

### Real-time + Polling
```
Primary: Supabase Realtime subscriptions
         │
         ▼
    WebSocket connection
         │
    ┌────┴─────┐
    │          │
  SUCCESS    FAIL
    │          │
    ▼          ▼
  Instant   Fall back to
  updates   5s polling
```

---

## 📈 Scalability Considerations

### Current Setup (Good for 1,000s of users)
- ✅ Database indexes
- ✅ RLS policies
- ✅ Connection pooling
- ✅ Realtime subscriptions

### Future Improvements (10,000+ users)
- Add pagination for conversations list
- Add pagination for message history
- Add message search indexing
- Consider read replicas
- Add caching layer (Redis)

---

## 🧪 Testing Points

### Unit Tests (Frontend)
- [ ] getOrCreateConversation returns existing
- [ ] getOrCreateConversation creates new
- [ ] sendMessage adds to messages
- [ ] markMessagesAsRead updates read status

### Integration Tests
- [ ] User A can create conversation
- [ ] User B can see conversation
- [ ] Both users can send messages
- [ ] Messages appear in real-time
- [ ] Unread counts update correctly

### E2E Tests
- [ ] Full chat flow from listing to message
- [ ] Multiple conversations per user
- [ ] Real-time updates across tabs
- [ ] Offline → online sync

---

## 🎯 Architecture Decisions

### Why TEXT for IDs in chat tables?
- Flexibility to use any ID type
- No foreign key constraints needed
- Supports legacy soft-auth system
- Simple migration path

### Why is_user_id_match() function?
- DRY principle (Don't Repeat Yourself)
- Single source of truth for ID matching
- Easy to update if ID logic changes
- Performance (compiled SQL function)

### Why real-time + polling?
- Real-time for instant updates
- Polling as fallback for reliability
- 5s interval balances UX and performance
- Covers edge cases (network issues)

---

## 🔄 Data Flow Summary

```
User Action → Frontend Component → Service Layer → Supabase Client
                                                          │
                                                          ▼
                                                   Auth Check
                                                          │
                                                          ▼
                                                   RLS Policy
                                                          │
                                                          ▼
                                                   Database
                                                          │
                                                          ▼
                                                   Real-time
                                                          │
                                                          ▼
                                            Other User's Frontend
```

---

This architecture provides:
- ✅ Security (RLS)
- ✅ Real-time updates
- ✅ Scalability
- ✅ Flexibility (multiple ID types)
- ✅ Reliability (polling fallback)
