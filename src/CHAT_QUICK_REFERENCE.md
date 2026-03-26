# 🚀 OldCycle Chat - Quick Reference

## 📁 Files Overview

### SQL Scripts (Run in Supabase SQL Editor)
| File | Purpose | When to Use |
|------|---------|-------------|
| `CHAT_SUPABASE_RESET_FIXED.sql` | 🔄 Reset & recreate tables | **START HERE** - First time setup or if chat is broken |
| `CHAT_VERIFY.sql` | ✅ Verify setup is correct | After running reset script |
| `CHAT_DEBUG.sql` | 🔍 Debug issues | When chat isn't working as expected |

### Frontend Code Files
| File | Purpose |
|------|---------|
| `/services/chat.ts` | Chat service (API calls, real-time) |
| `/screens/ChatScreen.tsx` | Main chat screen |
| `/components/ChatList.tsx` | Conversation list sidebar |
| `/components/ChatWindow.tsx` | Individual chat window |

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Reset Database
```
Open Supabase SQL Editor
→ Copy /CHAT_SUPABASE_RESET_FIXED.sql
→ Paste & Run
→ Should see: "✅ CHAT TABLES CREATED SUCCESSFULLY!"
```

### 2️⃣ Verify Setup
```
Open Supabase SQL Editor
→ Copy /CHAT_VERIFY.sql
→ Paste & Run
→ All checks should show: "✅ PASS"
```

### 3️⃣ Test App
```
Hard refresh app (Ctrl+Shift+R)
→ Login as 2 different users
→ Create conversation
→ Send messages
→ Should work! 🎉
```

---

## 🆘 Quick Troubleshooting

### Issue: Can't create conversation
```bash
1. Run /CHAT_DEBUG.sql
2. Check "YOUR CURRENT AUTH STATUS"
3. If "NOT AUTHENTICATED" → Login with Google
4. If authenticated but still fails → Check RLS policies
```

### Issue: Messages not appearing
```bash
1. Hard refresh (Ctrl+Shift+R)
2. Wait 5 seconds (polling fallback)
3. Check browser console for errors
4. Run /CHAT_DEBUG.sql to see if messages exist in DB
```

### Issue: Permission denied
```bash
1. Make sure you ran CHAT_SUPABASE_RESET_FIXED.sql (the FIXED version!)
2. Run /CHAT_VERIFY.sql
3. Check if is_user_id_match() function exists
```

---

## 🎯 How It Works

### User Flow
```
1. User clicks "Chat with Seller" on listing
   ↓
2. Frontend calls getOrCreateConversation()
   ↓
3. Checks if conversation exists (by listing_id + buyer_id + seller_id)
   ↓
4. If not, creates new conversation
   ↓
5. Opens ChatScreen with conversation ID
   ↓
6. Real-time subscription + 5s polling for new messages
```

### ID Matching System
```
OldCycle uses multiple ID types:
- auth_user_id (Google OAuth)
- profile.id (Database primary key)
- client_token (Compatibility)
- owner_token (Listings)

The is_user_id_match() function checks ALL of these!
```

---

## 📊 Key Database Tables

### conversations
```
Stores chat conversations between buyer and seller
- One conversation per listing + buyer + seller combo
- Tracks last message for preview
```

### messages
```
Stores individual messages in conversations
- Links to conversation via conversation_id
- Has read/unread status
```

---

## 🔐 Security (RLS Policies)

### What's Protected
✅ Users can only see conversations they're part of (buyer OR seller)
✅ Users can only send messages in their own conversations
✅ Users can only create conversations where they are the buyer
✅ Works with ALL OldCycle user ID types

### What's NOT Protected
❌ Chat content is NOT encrypted (standard for most chat apps)
❌ Users can see each other's names/avatars (by design)

---

## 🔧 Common Commands

### View all conversations (Supabase SQL)
```sql
SELECT * FROM conversations ORDER BY updated_at DESC;
```

### View all messages (Supabase SQL)
```sql
SELECT m.*, c.listing_title 
FROM messages m 
JOIN conversations c ON c.id = m.conversation_id 
ORDER BY m.created_at DESC;
```

### Delete all chat data (Supabase SQL)
```sql
DELETE FROM messages;
DELETE FROM conversations;
```

### Mark all messages as read (Supabase SQL)
```sql
UPDATE messages SET read = true;
```

---

## 📞 Support

If you're still stuck after trying everything:
1. Run `/CHAT_DEBUG.sql` and copy the output
2. Check browser console for errors
3. Share both with your team for help

---

## ✅ Success Indicators

### Frontend
- ✅ No errors in browser console
- ✅ Unread count updates in real-time
- ✅ Messages appear within 5 seconds
- ✅ Can scroll through message history

### Backend (via CHAT_DEBUG.sql)
- ✅ Helper function exists
- ✅ RLS policies enabled
- ✅ Realtime enabled
- ✅ Conversations and messages appear in DB

---

## 🎉 That's It!

You now have a complete, working chat system!

**Files to run in order:**
1. `CHAT_SUPABASE_RESET_FIXED.sql` (setup)
2. `CHAT_VERIFY.sql` (verify)
3. `CHAT_DEBUG.sql` (if issues)

**Remember**: Always hard refresh (Ctrl+Shift+R) after database changes!
