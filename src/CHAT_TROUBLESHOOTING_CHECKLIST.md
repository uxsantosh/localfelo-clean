# 🔍 Chat Feature Troubleshooting Checklist

## Pre-Flight Check ✈️

Before testing, verify:

- [ ] LocalFelo app is running (localhost:5173)
- [ ] You have a Supabase project set up
- [ ] Supabase URL and keys are in `.env` or config
- [ ] You're logged into LocalFelo (not just viewing)
- [ ] Browser console is open (F12) for debugging

## Test Page Checklist 📋

Go to: `http://localhost:5173/chat-test`

### Test 1: Authentication ✅
- [ ] Shows "Authenticated as: [Your Name]"
- [ ] Shows your user ID
- [ ] Status: Green checkmark

**If fails:**
- [ ] Go to home page
- [ ] Click Login
- [ ] Enter credentials
- [ ] Rerun test

### Test 2: Supabase Connection ✅
- [ ] Shows "Supabase connected successfully"
- [ ] Status: Green checkmark

**If fails:**
- [ ] Check Supabase dashboard is accessible
- [ ] Verify Supabase URL in config
- [ ] Verify Supabase anon key in config
- [ ] Check internet connection

### Test 3: Conversations Table ✅
- [ ] Shows "Conversations table exists"
- [ ] Status: Green checkmark

**If fails:**
- [ ] Open Supabase SQL Editor
- [ ] Run `/CHAT_COMPREHENSIVE_FIX.sql`
- [ ] Verify "Success" message
- [ ] Rerun test

### Test 4: Messages Table ✅
- [ ] Shows "Messages table exists"
- [ ] Status: Green checkmark

**If fails:**
- [ ] Same fix as Test 3 (run SQL migration)

### Test 5: Conversations RLS ✅
- [ ] Shows "RLS allows read access"
- [ ] Shows count of conversations found
- [ ] Status: Green checkmark

**If fails:**
- [ ] RLS policies are missing or incorrect
- [ ] Run `/CHAT_COMPREHENSIVE_FIX.sql` again
- [ ] Or temporarily disable RLS (testing only):
  ```sql
  ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
  ```

### Test 6: Messages RLS ✅
- [ ] Shows "RLS allows read access"
- [ ] Shows count of messages found
- [ ] Status: Green checkmark

**If fails:**
- [ ] Same fix as Test 5 (RLS policies)

### Test 7: getConversations() ✅
- [ ] Shows "Successfully fetched X conversations"
- [ ] Status: Green checkmark

**If fails:**
- [ ] Check browser console for errors
- [ ] Verify Tests 5 passed (RLS)
- [ ] Check if user ID is correct

### Test 8: Create Conversation ✅
- [ ] Shows "Can create conversations successfully"
- [ ] Status: Green checkmark

**If fails:**
- [ ] RLS blocking INSERT
- [ ] Run `/CHAT_COMPREHENSIVE_FIX.sql`
- [ ] Check RLS policies exist

### Test 9: Real-time Subscriptions ⚠️
- [ ] Shows "Real-time subscriptions are working" OR
- [ ] Shows warning "Real-time not available, but polling will work"
- [ ] Status: Green checkmark OR Yellow warning (both OK)

**If warning:**
- [ ] That's normal! Polling fallback works
- [ ] Real-time is nice-to-have, not required
- [ ] To enable, run in Supabase:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  ```

## Real Chat Test Checklist 💬

After all tests pass:

### Test: Create Conversation 📨
- [ ] Go to `/marketplace`
- [ ] Click any listing
- [ ] Click "Contact Seller" button
- [ ] Contact modal appears
- [ ] Click "Message" option
- [ ] Chat screen opens
- [ ] Conversation is created

**If fails:**
- [ ] Check console for errors
- [ ] Run `/chat-test` again
- [ ] Verify you're logged in

### Test: Send Message 📤
- [ ] Type "Hello, is this available?"
- [ ] Press Enter OR click Send button
- [ ] Message appears immediately in green bubble on right
- [ ] Input field clears
- [ ] Message has timestamp

**If fails:**
- [ ] Check console for red errors
- [ ] Look for "Failed to send" toast
- [ ] Verify RLS policies allow INSERT
- [ ] Check Network tab for failed requests

### Test: View Conversations 📋
- [ ] Go to `/chat` tab (bottom navigation)
- [ ] Conversation appears in list
- [ ] Shows listing title
- [ ] Shows last message
- [ ] Shows unread count (if any)
- [ ] Shows user avatar/initial

**If fails:**
- [ ] Check Test 7 passed (getConversations)
- [ ] Verify RLS allows SELECT
- [ ] Check user ID matches

### Test: Open Chat Window 💬
- [ ] Click conversation from list
- [ ] Chat window opens
- [ ] Shows other party's name
- [ ] Shows listing details in header
- [ ] Shows all previous messages
- [ ] Shows message input at bottom

**If fails:**
- [ ] Check Test 6 passed (Messages RLS)
- [ ] Verify conversation ID is correct
- [ ] Check console errors

### Test: Real-time Updates 🔄
- [ ] Send a new message
- [ ] Message appears without refresh
- [ ] OR message appears within 3-5 seconds (polling)

**If slow:**
- [ ] That's normal with polling
- [ ] To enable real-time, check Test 9 above

### Test: Unread Badges 🔴
- [ ] Send message to yourself (testing)
- [ ] Badge appears on Chat tab icon
- [ ] Shows correct count
- [ ] Badge disappears when you open chat

**If fails:**
- [ ] Check `getTotalUnreadCount()` in console
- [ ] Verify user ID is consistent
- [ ] Check messages `read` column

## Database Check Checklist 🗄️

If tests still fail, check database directly:

### Verify Tables Exist 📊
Run in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');
```

- [ ] Returns 2 rows: conversations, messages

### Verify RLS Status 🔒
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages');
```

- [ ] Both show `rowsecurity: true`

### Verify Policies Exist 📜
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages');
```

- [ ] Shows at least 3-4 policies per table

### Verify Your Profile 👤
```sql
SELECT id, name, email, client_token 
FROM profiles 
WHERE email = 'YOUR_EMAIL_HERE';
```

- [ ] Returns your profile row
- [ ] ID is a valid UUID
- [ ] client_token exists

### Check Existing Data 📊
```sql
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;
```

- [ ] Shows count (may be 0 if fresh)
- [ ] No error returned

## Browser Console Checklist 🖥️

Press F12, go to Console tab:

### Check for Errors ❌
- [ ] No red errors about "conversations"
- [ ] No red errors about "messages"
- [ ] No red errors about "RLS"
- [ ] No red errors about "undefined"

### Check User Data 👤
Run in console:
```javascript
console.log(JSON.parse(localStorage.getItem('oldcycle_user')));
```

- [ ] Shows user object
- [ ] Has `id` field (UUID)
- [ ] Has `name` field
- [ ] Has `clientToken` field

### Check Network Requests 🌐
Go to Network tab, filter "fetch/XHR":

- [ ] Requests to Supabase succeed (status 200)
- [ ] No 401 (Unauthorized) errors
- [ ] No 403 (Forbidden) errors
- [ ] No 500 (Server) errors

## Final Verification ✅

Your chat is FULLY WORKING when:

- [ ] ✅ All tests on `/chat-test` are green (or 1 yellow warning OK)
- [ ] ✅ Can contact sellers from listings
- [ ] ✅ Messages send successfully
- [ ] ✅ Messages appear in chat window
- [ ] ✅ Conversations show in /chat tab
- [ ] ✅ Unread counts work
- [ ] ✅ Real-time OR polling updates work
- [ ] ✅ No console errors
- [ ] ✅ Mobile UI is responsive
- [ ] ✅ Works across page reloads

## Quick Command Reference 📝

### Run test page:
```
http://localhost:5173/chat-test
```

### Check user in console:
```javascript
console.log(localStorage.getItem('oldcycle_user'));
```

### Disable RLS (testing only):
```sql
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

### Enable real-time:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Reset chat data:
```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
-- Then run /CHAT_COMPREHENSIVE_FIX.sql
```

## Status Summary 📊

Fill this out after testing:

**Date:** _______________

**Tests Passed:** ___ / 10

**Real Chat Works:** ☐ Yes  ☐ No

**Issues Found:**
- ________________________________
- ________________________________
- ________________________________

**Issues Fixed:**
- ________________________________
- ________________________________
- ________________________________

**Next Steps:**
- ________________________________
- ________________________________
- ________________________________

---

**Need more help?** See:
- `/CHAT_STEP_BY_STEP.txt` - Simple guide
- `/CHAT_QUICK_FIX.md` - Quick reference
- `/CHAT_TEST_README.md` - Detailed docs
- `/CHAT_TESTING_IMPLEMENTATION_SUMMARY.md` - Full summary
