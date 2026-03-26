# 🐛 CHAT DEBUG GUIDE - Messages Not Exchanging

## Step 1: Open Browser Console
**Press F12 → Go to "Console" tab**

## Step 2: Check for Errors

### When you click "Send" button, you should see:

#### ✅ **GOOD - Working:**
```
➕ Optimistically adding message to UI: {id: "temp-1234", ...}
✅ Message sent: abc-123-xyz
📨 [ChatWindow] Received new message via subscription
```

#### ❌ **BAD - RLS Error:**
```
❌ Error sending message: new row violates row-level security policy
🚨 RLS POLICY ERROR - Messages are being blocked!
```
**FIX:** Run `/SUPABASE_RLS_FIX_MIGRATION.sql` in Supabase

#### ❌ **BAD - Auth Error:**
```
❌ Error sending message: Not authenticated
```
**FIX:** Sign out and sign in again

#### ❌ **BAD - User ID Missing:**
```
❌ Error sending message: User ID missing
```
**FIX:** Profile data is corrupted, check localStorage

---

## Step 3: Run This Debug Command

**Paste this in the browser console (F12) and press Enter:**

```javascript
// Check current user data
const user = JSON.parse(localStorage.getItem('oldcycle_user') || '{}');
console.log('👤 Current User:', {
  id: user.id,
  name: user.name,
  authUserId: user.authUserId,
  clientToken: user.clientToken,
  email: user.email
});

// Check which ID will be used
const userId = user.id || user.authUserId || user.clientToken;
console.log('🔑 User ID being used:', userId);

// If userId is undefined or null, there's a problem!
if (!userId) {
  console.error('🚨 USER ID IS MISSING! Sign out and sign in again.');
}
```

---

## Step 4: Check Supabase Policies

Go to Supabase Dashboard → SQL Editor → Run this:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages');

-- Should show:
-- conversations | true
-- messages      | true
```

Then run:

```sql
-- Check if policies exist
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

-- Should show 6 rows:
-- conversations | Users can create conversations as buyer  | INSERT
-- conversations | Users can update their conversations     | UPDATE
-- conversations | Users can view their own conversations   | SELECT
-- messages      | Users can insert messages in their...    | INSERT
-- messages      | Users can update messages they received  | UPDATE
-- messages      | Users can view messages in their...      | SELECT
```

**If you see less than 6 rows, RUN THE MIGRATION!**

---

## Step 5: Test Message Send

### In Browser Console, paste this to test manually:

```javascript
// Test sending a message directly
async function testSendMessage() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  
  const user = JSON.parse(localStorage.getItem('oldcycle_user') || '{}');
  const userId = user.id || user.authUserId || user.clientToken;
  
  console.log('🧪 Testing message send...');
  console.log('User ID:', userId);
  
  // You need to replace these with actual values from your conversation
  const testData = {
    conversation_id: 'YOUR_CONVERSATION_ID_HERE', // Get from URL or conversation list
    sender_id: userId,
    sender_name: user.name,
    sender_avatar: user.profilePic || null,
    content: 'Test message from debug script',
    read: false
  };
  
  console.log('📤 Sending:', testData);
  
  // Get supabase config from your app
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('messages')
    .insert(testData)
    .select()
    .single();
  
  if (error) {
    console.error('❌ FAILED:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes('policy')) {
      console.error('🚨 RLS POLICY ERROR - Run the migration SQL!');
    }
  } else {
    console.log('✅ SUCCESS! Message sent:', data);
  }
}

// Run the test (replace conversation_id first!)
// testSendMessage();
```

---

## Common Issues & Fixes

### Issue 1: "User ID missing"
**Cause:** User profile data is corrupted  
**Fix:**
1. Open Console (F12)
2. Run: `localStorage.removeItem('oldcycle_user')`
3. Refresh page and sign in again

### Issue 2: "RLS policy violation"
**Cause:** Supabase policies not created  
**Fix:** Run `/SUPABASE_RLS_FIX_MIGRATION.sql` in Supabase SQL Editor

### Issue 3: "Not authenticated"
**Cause:** Supabase session expired  
**Fix:**
1. Sign out
2. Sign in again
3. Try chatting again

### Issue 4: Messages send but other user doesn't see them
**Cause:** Real-time subscriptions not working OR user IDs don't match  
**Fix:**
1. Check both users' console for subscription messages
2. Verify both users are using the same conversation ID
3. Check if `buyer_id` and `seller_id` match actual user IDs

### Issue 5: Can't start conversation
**Cause:** Conversation RLS policy issue  
**Fix:** Make sure you ran the FULL migration SQL (not just messages part)

---

## Quick Health Check

Run this in **Supabase SQL Editor** to see current state:

```sql
-- See all conversations
SELECT 
  id,
  listing_title,
  buyer_id,
  seller_id,
  last_message,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 10;

-- See all messages
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.content,
  m.created_at,
  c.listing_title
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
ORDER BY m.created_at DESC
LIMIT 20;
```

This shows you if messages are actually being saved to the database!

---

## What to Report Back

If still not working, tell me:

1. **What error shows in console?** (Copy the exact red error message)
2. **Did you run the SQL migration?** (Yes/No)
3. **Do policies exist?** (Run the policy check SQL above)
4. **What does the user object look like?** (Run the debug command in Step 3)
5. **Are you using two DIFFERENT accounts?** (Can't chat with yourself!)

---

## Emergency Reset

If nothing works:

```sql
-- In Supabase SQL Editor, run this to start fresh:

-- Drop all policies
DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Then run the FULL migration from /SUPABASE_RLS_FIX_MIGRATION.sql
```
