# 🔧 Chat Feature Testing Guide

## Quick Start

Your chat feature is not working. Here's how to test and fix it:

### Step 1: Run the Test Page

1. **Make sure you're logged in** to LocalFelo
2. **Navigate to** `/chat-test` in your browser URL
   - Example: `http://localhost:5173/chat-test`
3. **Click "Run All Tests"**
4. **Review the results** - it will tell you exactly what's wrong

### Step 2: Fix Issues Based on Test Results

#### If you see "Conversations table does not exist" or "Messages table does not exist"

**FIX:** Run the SQL migration in Supabase

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `/CHAT_COMPREHENSIVE_FIX.sql`
3. Paste and run it
4. Go back to `/chat-test` and run tests again

#### If you see "RLS policy blocking access"

**FIX:** The RLS policies are not configured correctly

1. The `/CHAT_COMPREHENSIVE_FIX.sql` script includes RLS policies
2. Run it in Supabase SQL Editor
3. Or manually disable RLS temporarily to test:
```sql
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```
4. **⚠️ Warning:** Disabling RLS is NOT recommended for production!

#### If you see "Not authenticated"

**FIX:** You need to log in first

1. Go to home page
2. Click "Login" 
3. Enter your credentials
4. Go back to `/chat-test`

### Step 3: Test Real Chat Functionality

Once all tests pass:

1. Go to **Marketplace** (`/marketplace`)
2. Find a listing and click "Contact Seller"
3. Send a test message
4. Go to **Chat** tab to see your conversations
5. Try sending and receiving messages

## Common Issues

### Issue 1: Messages not appearing in real-time

**Symptoms:**
- You send a message but don't see it until you refresh
- Other user's messages don't appear automatically

**Fix:**
- Real-time is probably not enabled
- The app has polling fallback (refreshes every 3-5 seconds)
- To enable real-time, run this in Supabase SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Issue 2: "Failed to send" error when sending messages

**Symptoms:**
- Click send, message doesn't go through
- Error toast appears

**Possible causes:**
1. **RLS blocking insert** - Check RLS policies
2. **Database connection issue** - Check Supabase dashboard
3. **User not authenticated** - Log in again
4. **Foreign key constraint** - The conversation might not exist

**Debug:**
1. Open browser console (F12)
2. Look for red error messages
3. Check what the actual error says
4. Run `/chat-test` to diagnose

### Issue 3: Chat screen is blank or shows no conversations

**Symptoms:**
- Chat tab shows "No conversations yet"
- But you know you should have conversations

**Possible causes:**
1. **RLS blocking SELECT** - Can't read conversations
2. **Wrong user ID** - Check if you're logged in with correct account
3. **Database empty** - No conversations created yet

**Fix:**
1. Run `/chat-test` to check RLS policies
2. Check browser console for errors
3. Try contacting a seller to create a new conversation

## Manual Database Check

If the test page doesn't work, check the database directly:

### 1. Check if tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages');
```

Should return 2 rows.

### 2. Check if you have any conversations
```sql
SELECT * FROM conversations LIMIT 5;
```

### 3. Check if you have any messages
```sql
SELECT * FROM messages LIMIT 5;
```

### 4. Check your user ID
```sql
SELECT id, name, email FROM profiles WHERE email = 'YOUR_EMAIL';
```

## Files Related to Chat

- **Frontend:**
  - `/screens/ChatScreen.tsx` - Main chat screen
  - `/components/ChatWindow.tsx` - Chat message window
  - `/components/ChatList.tsx` - List of conversations
  - `/services/chat.ts` - Chat service functions

- **Database:**
  - `/CHAT_COMPREHENSIVE_FIX.sql` - Complete setup SQL
  - `/CHAT_SUPABASE_RESET_FIXED.sql` - Alternative migration
  - `/supabase_chat_schema_fixed.sql` - Schema only

## Need More Help?

1. **Check browser console** (F12 → Console tab)
2. **Check network tab** (F12 → Network tab) to see failed requests
3. **Run the test page** (`/chat-test`) for detailed diagnostics
4. **Check Supabase logs** in Supabase Dashboard → Logs

## Success Criteria

Your chat is working when:
- ✅ All tests in `/chat-test` show green checkmarks
- ✅ You can contact a seller from a listing
- ✅ Messages appear in chat screen
- ✅ You can send messages
- ✅ Messages appear in real-time (or within 3-5 seconds)
- ✅ Unread count badge shows correctly
- ✅ Messages are marked as read when you open conversation

## Next Steps After Chat Works

1. Test with another user account
2. Check mobile responsiveness
3. Test notifications (if enabled)
4. Check admin panel chat history (if you're admin)
