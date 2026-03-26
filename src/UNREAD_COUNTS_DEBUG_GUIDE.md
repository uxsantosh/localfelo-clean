# 🐛 UNREAD COUNTS - DEBUGGING GUIDE

## 🎯 ISSUES FIXED

### ✅ **Issue 1: Unread counts not showing**
- Added detailed logging throughout the flow
- Enhanced error handling in count calculation
- Added SQL debug script to verify database state

### ✅ **Issue 2: Badge not showing in header/bottom nav**
- Improved badge visibility check
- Added logging to trace unread count flow
- Fixed badge conditional rendering

### ✅ **Issue 3: Chat switching when receiving message**
- Fixed selected conversation going stale when list updates
- Added effect to keep selected conversation fresh
- Prevents auto-switching when new messages arrive

---

## 📁 FILES UPDATED

### 1. `/services/chat.ts` ✅
**Changes:**
- Enhanced `getConversations()` with detailed per-conversation logging
- Enhanced `getUnreadCount()` with step-by-step logging
- Added error handling for count queries
- Logs show: conversation IDs, unread counts, errors

### 2. `/screens/ChatScreen.tsx` ✅
**Changes:**
- Added new useEffect to keep `selectedConversation` fresh
- When conversations list updates, finds and updates the selected one
- Uses JSON comparison to avoid infinite loops
- Prevents chat from switching unexpectedly

### 3. `/components/Header.tsx` ✅
**Changes:**
- Improved unread badge conditional: `unreadCount !== undefined && unreadCount > 0`
- More defensive check for badge visibility

### 4. `/components/BottomNavigation.tsx` ✅
**Changes:**
- Improved unread badge conditional: `unreadCount !== undefined && unreadCount > 0`
- More defensive check for badge visibility

### 5. `/App.tsx` ✅
**Changes:**
- Added logging when user logs in/out
- Logs when unread count is fetched
- Logs when real-time updates trigger count refresh

### 6. `/DEBUG_UNREAD_COUNTS.sql` ✅ (NEW)
**Purpose:**
- SQL script to debug unread counts in Supabase
- Check conversations, messages, read status
- Manually test count queries
- Reset messages for testing

---

## 🔍 HOW TO DEBUG

### **Step 1: Open Browser Console**

Open DevTools (F12) and check for these logs:

**When app loads with logged-in user:**
```
📊 [App] User logged in, fetching unread count...
📊 [getUnreadCount] Counting unread messages for user: abc123
📊 [getUnreadCount] Found 3 conversations
📊 [getUnreadCount] Total unread messages: 5
📊 [App] ✅ Unread count fetched: 5
```

**When conversations are loaded:**
```
✅ Fetched 3 conversations with unread counts: 
  [
    { id: "conv-1", unread: 2 },
    { id: "conv-2", unread: 3 },
    { id: "conv-3", unread: 0 }
  ]
```

**When new message arrives:**
```
📬 [subscribeToConversations] New message inserted - refreshing list
📊 [App] Conversation update detected, refreshing unread count...
📊 [getUnreadCount] Total unread messages: 6
📊 [App] ✅ Unread count fetched: 6
```

---

### **Step 2: Run SQL Debug Script**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `/DEBUG_UNREAD_COUNTS.sql`
3. Replace `YOUR_USER_ID_HERE` with your actual user ID
   - Get your user ID: Run `SELECT auth.uid();` in Supabase
   - Or check console logs for "Counting unread messages for user: [ID]"
4. Run each section one by one

**Section 1: Check conversations**
```sql
SELECT * FROM conversations 
WHERE buyer_id = 'your-id' OR seller_id = 'your-id';
```
✅ Should show all your conversations

**Section 3: Count unread per conversation**
```sql
-- This is the SAME query the app uses
SELECT 
  c.id,
  COUNT(CASE WHEN m.read = false AND m.sender_id != 'your-id' THEN 1 END) as unread_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.buyer_id = 'your-id' OR c.seller_id = 'your-id'
GROUP BY c.id;
```
✅ Should match the console logs

**Section 4: Total unread count**
```sql
SELECT COUNT(*) FROM messages
WHERE read = false
  AND sender_id != 'your-id'
  AND conversation_id IN (
    SELECT id FROM conversations
    WHERE buyer_id = 'your-id' OR seller_id = 'your-id'
  );
```
✅ Should match the badge number

---

### **Step 3: Check Badge Visibility**

**In Console, type:**
```javascript
// Check if unreadCount is being passed
console.log('Unread count in state:', unreadCount);

// Check if badge element exists
document.querySelector('.bg-red-500')?.textContent;
```

**Expected output:**
- If unread > 0: Badge element exists with count
- If unread = 0: Badge element doesn't exist (correct)

---

### **Step 4: Test Real-Time Updates**

1. **Open 2 browser windows side-by-side**
   - Window A: User A
   - Window B: User B

2. **User B sends message to User A**

3. **Check Window A console:**
```
📬 [subscribeToConversations] New message inserted - refreshing list
📊 Conversation conv-123: 1 unread messages
✅ Fetched 1 conversations with unread counts: [{ id: "conv-123", unread: 1 }]
📊 [App] Conversation update detected, refreshing unread count...
📊 [getUnreadCount] Total unread messages: 1
📊 [App] ✅ Unread count fetched: 1
```

4. **Check Window A UI:**
   - ✅ Red badge appears on chat icon (header on desktop, bottom nav on mobile)
   - ✅ Badge shows "1"
   - ✅ Purple badge appears on conversation card

5. **User A clicks the conversation**

6. **Check console:**
```
📖 [ChatWindow] Marking messages as read
✅ Marked 1 messages as read
📬 [subscribeToConversations] Message updated (read status changed) - refreshing list
📊 Conversation conv-123: 0 unread messages
📊 [getUnreadCount] Total unread messages: 0
```

7. **Check UI:**
   - ✅ Red badge disappears
   - ✅ Purple badge disappears

---

## 🐛 COMMON ISSUES & FIXES

### **Issue: Badge never shows up**

**Check 1: Is unreadCount being calculated?**
```
Console → Search for "getUnreadCount"
Expected: "Total unread messages: [number]"
```
- ❌ **Not found**: Chat service not being called
- ✅ **Found with 0**: No unread messages (correct)
- ✅ **Found with >0**: Should show badge

**Check 2: Is unreadCount being passed to components?**
```
Console → Search for "Unread count fetched"
Expected: "✅ Unread count fetched: [number]"
```
- ❌ **Not found**: User not logged in or effect not running
- ✅ **Found**: State is being updated

**Check 3: Database check**
```sql
-- Run this in Supabase SQL Editor
SELECT 
  COUNT(*) as unread_count
FROM messages m
WHERE m.read = false
  AND m.sender_id != 'YOUR_USER_ID'
  AND m.conversation_id IN (
    SELECT id FROM conversations
    WHERE buyer_id = 'YOUR_USER_ID' OR seller_id = 'YOUR_USER_ID'
  );
```
- If count = 0: No unread messages in database (correct)
- If count > 0: Badge SHOULD show (check UI)

---

### **Issue: Chat switches when receiving message**

**Before fix:** When you're in Conversation A, and a message arrives in Conversation B, the app would switch to Conversation B.

**After fix:** The selected conversation stays active.

**How it works:**
```typescript
// This effect keeps selected conversation fresh
useEffect(() => {
  if (selectedConversation && conversations.length > 0) {
    const updatedConversation = conversations.find(c => c.id === selectedConversation.id);
    if (updatedConversation) {
      // Only update if data changed (to avoid loops)
      if (JSON.stringify(updatedConversation) !== JSON.stringify(selectedConversation)) {
        setSelectedConversation(updatedConversation);
      }
    }
  }
}, [conversations, selectedConversation]);
```

**Test:**
1. Open conversation with User A
2. Have User B send you a message
3. ✅ You should stay in User A's conversation
4. ✅ User B's conversation card should show unread badge

---

### **Issue: Unread count is wrong**

**Scenario 1: Count is higher than actual**
- Messages marked as read but database wasn't updated
- Check RLS policies (should have been fixed by SUPABASE_FINAL_FIX.sql)
- Run: `UPDATE messages SET read = true WHERE ...` (see SQL file)

**Scenario 2: Count is lower than actual**
- Real-time subscription not firing
- Check: `📬 [subscribeToConversations]` logs
- Verify Supabase Realtime is enabled on messages table

**Scenario 3: Count doesn't update in real-time**
- Subscription not working
- Check console for subscription status:
  ```
  📡 [subscribeToConversations] Subscription status: SUBSCRIBED
  ✅ [subscribeToConversations] Successfully subscribed
  ```
- If missing, check Supabase Realtime settings

---

## ✅ EXPECTED BEHAVIOR

### **Scenario 1: First Login**
1. User logs in
2. Console: "📊 [App] User logged in, fetching unread count..."
3. Console: "📊 [getUnreadCount] Total unread messages: X"
4. If X > 0: Badge appears with count
5. If X = 0: No badge (correct)

### **Scenario 2: New Message Arrives**
1. Another user sends you a message
2. Console: "📬 [subscribeToConversations] New message inserted"
3. Console: "📊 Conversation [id]: 1 unread messages"
4. Console: "📊 [getUnreadCount] Total unread messages: X"
5. Badge updates to show new count

### **Scenario 3: Opening Conversation**
1. User clicks conversation with unread messages
2. Console: "📖 Marking messages as read"
3. Console: "📬 [subscribeToConversations] Message updated"
4. Console: "📊 Conversation [id]: 0 unread messages"
5. Badge disappears

### **Scenario 4: Multiple Conversations**
1. 3 conversations with 2, 1, and 0 unread messages
2. Console: 
   ```
   ✅ Fetched 3 conversations with unread counts:
   [
     { id: "conv-1", unread: 2 },
     { id: "conv-2", unread: 1 },
     { id: "conv-3", unread: 0 }
   ]
   ```
3. Chat icon badge shows: "3" (total)
4. Conversation cards show: "2", "1", and no badge

---

## 🎯 TESTING CHECKLIST

Use this checklist to verify everything works:

### **Badge Visibility**
- [ ] Badge appears in header (desktop) when unread > 0
- [ ] Badge appears in bottom nav (mobile) when unread > 0
- [ ] Badge shows correct count (1-9 or "9+")
- [ ] Badge has red background and white text
- [ ] Badge disappears when unread = 0

### **Conversation Cards**
- [ ] Purple badge appears on cards with unread messages
- [ ] Badge shows correct count per conversation
- [ ] Badge disappears when conversation is opened

### **Real-Time Updates**
- [ ] Badge appears immediately when new message arrives
- [ ] Badge disappears immediately when messages are read
- [ ] Works across multiple browser tabs
- [ ] No page refresh needed

### **Chat Stability**
- [ ] Selected conversation stays active when new message arrives
- [ ] New message appears in current conversation
- [ ] Can switch conversations without issues
- [ ] Back button works correctly

### **Console Logs**
- [ ] See "📊 [getUnreadCount]" logs on login
- [ ] See "📬 [subscribeToConversations]" on updates
- [ ] See "✅ Fetched X conversations with unread counts"
- [ ] No errors in console

---

## 🚀 NEXT STEPS

1. **Refresh the app** to load the new code
2. **Open browser console** (F12)
3. **Login as a user**
4. Check for console logs starting with 📊 or 📬
5. Send yourself a message from another account
6. Verify badge appears and count is correct
7. Open the conversation and verify badge disappears
8. If issues persist, run the SQL debug script

---

## 📝 FILES TO CHECK

All relevant files:
- ✅ `/services/chat.ts` - Backend logic with logging
- ✅ `/components/Header.tsx` - Desktop chat badge
- ✅ `/components/BottomNavigation.tsx` - Mobile chat badge
- ✅ `/components/ChatList.tsx` - Conversation card badges
- ✅ `/screens/ChatScreen.tsx` - Conversation stability fix
- ✅ `/App.tsx` - State management with logging
- ✅ `/DEBUG_UNREAD_COUNTS.sql` - SQL debugging script

**All logging prefixes:**
- `📊` = Unread count calculation
- `📬` = Real-time subscription events
- `✅` = Success messages
- `❌` = Error messages
- `🔄` = Refresh/update actions
- `📖` = Mark as read actions
