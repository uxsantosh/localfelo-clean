# 🐛 Debugging "Failed to Send Message" Error

## Step 1: Check What Error You're Getting

Open your browser's **Developer Console** (F12 or right-click → Inspect → Console tab)

Look for errors that say:
- "Supabase error inserting message: ..."
- "Error in sendMessage: ..."

**Copy the EXACT error message** and let me know what it says.

---

## Step 2: Check If You Ran the SQL Script

Did you run `/CHAT_SUPABASE_RESET_FIXED.sql` in Supabase?

**If NO** → That's the problem! Run it now:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy `/CHAT_SUPABASE_RESET_FIXED.sql`
4. Paste and Run

**If YES** → Continue to Step 3

---

## Step 3: Check Your User ID

Add this diagnostic component temporarily to see what's happening:

1. Open `/App.tsx`
2. Add at the top:
```tsx
import { ChatDiagnostics } from './CHAT_TEST_USER_ID';
```

3. Add at the bottom of your JSX (before closing div):
```tsx
{/* Temporary diagnostics */}
<ChatDiagnostics />
```

4. Hard refresh your browser (Ctrl+Shift+R)
5. Look at the bottom of the page - you'll see diagnostic info

**Copy and share this info:**
- currentUser.id
- sessionAuthId
- conversationsAccess
- messagesAccess

---

## Step 4: Common Errors & Solutions

### Error: "new row violates row-level security policy"
**Cause:** RLS policies not set up correctly
**Solution:** 
1. Run `/CHAT_SUPABASE_RESET_FIXED.sql` again
2. Make sure `is_user_id_match()` function was created
3. Run `/CHAT_VERIFY.sql` to check

### Error: "permission denied for table messages"
**Cause:** RLS policies missing
**Solution:** Run `/CHAT_SUPABASE_RESET_FIXED.sql`

### Error: "Not authenticated"
**Cause:** Not logged in or session expired
**Solution:**
1. Logout and login again
2. Check localStorage for 'oldcycle_user'

### Error: "null value in column 'sender_id'"
**Cause:** user.id is not set properly
**Solution:** Check the diagnostic output from Step 3

---

## Step 5: Run Debug Query in Supabase

1. Open Supabase SQL Editor
2. Copy and run this:

```sql
-- Check if helper function exists
SELECT proname FROM pg_proc WHERE proname = 'is_user_id_match';

-- Check your current auth
SELECT auth.uid() as my_auth_id;

-- Check your profile
SELECT id, auth_user_id, client_token, owner_token, name, email
FROM profiles 
WHERE auth_user_id = auth.uid();

-- Check RLS policies on messages table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'messages';
```

**Share the results of these queries**

---

## Step 6: Test Basic Insert

Try inserting a message manually in Supabase to see if it's a permission issue:

```sql
-- First, find a conversation ID
SELECT id, listing_title FROM conversations LIMIT 1;

-- Then try to insert (replace YOUR_CONVERSATION_ID with actual ID)
INSERT INTO messages (
  conversation_id,
  sender_id,
  sender_name,
  content
) VALUES (
  'YOUR_CONVERSATION_ID',
  auth.uid()::TEXT,
  'Test User',
  'Test message'
);
```

**Does this work?**
- If YES → Problem is in frontend
- If NO → Problem is in RLS policies

---

## 🆘 Quick Checklist

- [ ] Ran `/CHAT_SUPABASE_RESET_FIXED.sql`
- [ ] Ran `/CHAT_VERIFY.sql` - all show ✅ PASS
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Logged out and logged back in
- [ ] Checked browser console for errors
- [ ] Copied exact error message
- [ ] Ran diagnostic component (Step 3)
- [ ] Ran debug queries (Step 5)

---

## 📤 What to Share

When asking for help, please provide:

1. **Exact error message** from browser console
2. **Diagnostic info** from ChatDiagnostics component
3. **Results** from Step 5 debug queries
4. **Screenshot** of the error (if possible)

This will help diagnose the exact issue!
