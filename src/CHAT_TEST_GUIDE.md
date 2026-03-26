# 🧪 OldCycle Chat Testing Guide

## ⚠️ IMPORTANT: You Need TWO DIFFERENT USERS!

Real-time chat only works when **TWO DIFFERENT USERS** message each other. Testing with the same user in two browsers won't work properly!

---

## 📋 Step-by-Step Test Process

### 1. **Run the NEW SQL Script First**

Open Supabase SQL Editor and run **`/supabase_realtime_fix.sql`** - this adds RLS policies for the `conversations` table.

### 2. **Create Two User Accounts**

**Browser 1 (Chrome):**
- Open OldCycle in **Incognito/Private mode**
- Sign in with Google using **email A** (e.g., your personal Gmail)
- Note the user name

**Browser 2 (Edge):**
- Open OldCycle in **Incognito/Private mode**  
- Sign in with Google using **email B** (e.g., a different Gmail account)
- Note the user name

### 3. **Create a Test Listing**

In **Browser 1 (User A)**:
- Go to Profile → Add phone number (required for listings)
- Create a new listing (e.g., "Test Cycle - ₹500")
- Note the listing ID or title

### 4. **Start a Conversation**

In **Browser 2 (User B)**:
- Find the listing created by User A
- Click "Chat with Seller"
- This opens a conversation

### 5. **Test Real-Time Messaging**

**Keep BOTH browser windows visible side-by-side**

**In Browser 1 (User A):**
- Go to Chat tab
- Open the conversation with User B
- **Open Developer Console (F12)**
- Send a message: "Hello from User A"

**In Browser 2 (User B):**
- **Keep the chat window open**
- **Open Developer Console (F12)**
- You should see the message appear **INSTANTLY** without refresh
- Look for console log: `✅✅✅ NEW MESSAGE RECEIVED ✅✅✅`

**In Browser 2, reply:**
- Send: "Hello from User B"

**In Browser 1:**
- You should see the reply appear **INSTANTLY**
- Look for console log: `✅✅✅ NEW MESSAGE RECEIVED ✅✅✅`

---

## ✅ What Should Work:

1. ✅ **Instant message delivery** - Messages appear without refresh
2. ✅ **Badge updates** - Unread count updates in real-time
3. ✅ **Conversation list updates** - Last message updates automatically
4. ✅ **Mark as read** - Messages marked as read after 3 seconds of viewing

---

## 🐛 Troubleshooting

### Console shows "NEW MESSAGE RECEIVED" but message doesn't appear:
- Check if you're testing with the **SAME user** (won't work!)
- Hard refresh both browsers (Ctrl+Shift+R)

### Badge shows wrong count:
- Run the SQL script to enable realtime for conversations table
- Refresh the page

### "Status: CHANNEL_ERROR":
- RLS policies might be missing
- Run the SQL script again
- Check Supabase Dashboard → Database → RLS Policies

### Messages work but badge doesn't update:
- Open console and check for: `📨 Message changed`
- If missing, conversations table needs realtime enabled
- Run step 5 of SQL script: `ALTER PUBLICATION supabase_realtime ADD TABLE conversations;`

---

## 🎯 Expected Console Logs

**When sending a message:**
```
📤 [ChatWindow] Sending message: "Hello..."
✅ [ChatWindow] Message sent successfully: abc-123
➕ [ChatWindow] Adding sent message to state: abc-123
```

**When receiving a message:**
```
📨 [REALTIME] ✅✅✅ NEW MESSAGE RECEIVED ✅✅✅
📨 [REALTIME] Payload: { id: "xyz-789", content: "Hello...", ... }
✅ [ChatWindow] Adding new message to state: xyz-789
📨 Message changed
📊 [App] Conversation update detected, refreshing unread count...
```

**Subscription status:**
```
✅ [REALTIME] SUCCESSFULLY SUBSCRIBED to messages-abc123-1234567890
```

---

## 💡 Quick Debug

If messages still don't work, run this in console:

```javascript
// Check current user
console.log('Current user:', JSON.parse(localStorage.getItem('oldcycle_user')));

// Force refresh unread count
import { getTotalUnreadCount } from './services/chat';
getTotalUnreadCount().then(count => console.log('Unread:', count));
```
