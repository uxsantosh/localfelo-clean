# 🔍 Broadcast Notifications Debug & Verification Guide

## Quick Diagnostic Queries

Run these in **Supabase SQL Editor** to check the system state.

### 1. Check RLS Status
```sql
-- Should return: relrowsecurity = false (disabled)
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'notifications';
```

**Expected:** `rls_enabled = false` ✅

**If true:** RLS is still enabled → Re-run the migration

---

### 2. Check RLS Policies
```sql
-- Should return: 0 rows
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'notifications';
```

**Expected:** 0 rows (no policies) ✅

**If rows exist:** Policies still exist → Re-run the migration

---

### 3. Check Broadcast Function
```sql
-- Should return: 1 row with correct signature
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as parameters,
  prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'broadcast_notification';
```

**Expected:**
```
function_name: broadcast_notification
parameters: p_admin_id uuid, p_title text, p_message text, p_type text, p_action_url text, p_user_ids uuid[]
is_security_definer: true
```

**If empty:** Function doesn't exist → Re-run the migration

---

### 4. Check Notifications Were Inserted
```sql
-- Check if broadcast notifications exist
SELECT 
  user_id,
  title,
  message,
  type,
  is_read,
  created_at
FROM notifications
WHERE type IN ('info', 'promotion', 'alert', 'broadcast')
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- ✅ Rows exist → Notifications were created
- ❌ No rows → Broadcast function didn't insert anything

---

### 5. Count Notifications Per User
```sql
-- See how many notifications each user has
SELECT 
  user_id,
  COUNT(*) as notification_count,
  SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread_count
FROM notifications
GROUP BY user_id
ORDER BY notification_count DESC;
```

**What to look for:**
- Each user should have notifications
- If 0 notifications → Users weren't included in broadcast

---

### 6. Check User Can Read Their Notifications
```sql
-- Test as a specific user (replace USER_ID with actual ID)
-- This simulates what the app does
SELECT 
  id,
  title,
  message,
  type,
  is_read,
  created_at
FROM notifications
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** Returns notifications for that user

**If empty but notifications exist in table:**
- Either user_id is wrong
- Or RLS is still blocking (check #1 and #2)

---

## Browser Console Checks

### 1. Check User Authentication
```javascript
// Run in browser console (when logged in)
const user = JSON.parse(localStorage.getItem('localfelo_user'));
console.log('User ID:', user?.id);
console.log('Is Admin:', user?.is_admin);
console.log('Full User:', user);
```

**Expected:**
- `user.id` exists
- Valid UUID format

---

### 2. Check Notification Service Logs

**When admin sends broadcast:**
```javascript
// Should see these logs in console:
📢 [BROADCAST] Starting broadcast notification...
✅ [BROADCAST] Authenticated as: [uuid]
🔧 [BROADCAST] Calling PostgreSQL function broadcast_notification()...
  Admin ID: [uuid]
  User IDs (sample): ALL USERS
📊 [BROADCAST] Function result: { success: true, inserted_count: 5 }
✅ [BROADCAST] Successfully created 5 notifications
```

**If you see errors:**
- "Not authenticated" → User ID not found in localStorage
- "Function returned error" → SQL function issue
- PostgreSQL error → Check function exists

---

### 3. Check Notification Fetching

**When user loads notifications:**
```javascript
// Should see in console when useNotifications hook runs:
// (No specific logs, but check network tab)

// Manual test in console:
import { supabase } from './lib/supabaseClient';
const userId = JSON.parse(localStorage.getItem('localfelo_user')).id;

const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

console.log('Notifications:', data);
console.log('Error:', error);
```

**Expected:**
- `data` contains notifications array
- `error` is null

**If error:**
- Check error message
- Usually RLS issue or table doesn't exist

---

## Common Issues & Fixes

### Issue 1: "Not authenticated" error
**Symptoms:**
- Console shows: `❌ [BROADCAST] Not authenticated`
- Toast shows: "Not authenticated"

**Cause:** Admin ID not found in localStorage

**Fix:**
```javascript
// Check in browser console:
const user = JSON.parse(localStorage.getItem('localfelo_user'));
console.log('User exists:', !!user);
console.log('User ID:', user?.id);

// If null, user needs to login again
```

---

### Issue 2: Shows "sent to X users" but users don't see
**Symptoms:**
- Admin sees success toast
- Notifications inserted in database
- Users see empty bell icon

**Cause:** RLS is still enabled

**Fix:**
```sql
-- 1. Check RLS status
SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications';

-- 2. If true, disable it:
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 3. Drop all policies:
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON notifications';
  END LOOP;
END $$;
```

---

### Issue 3: Function not found
**Symptoms:**
- Console shows: `function broadcast_notification does not exist`

**Cause:** Migration didn't run or failed

**Fix:**
1. Re-run `/migrations/FIX_BROADCAST_NOTIFICATIONS_COMPLETE.sql`
2. Check for errors in SQL output
3. Verify function exists with query #3 above

---

### Issue 4: Users see notifications but count is 0
**Symptoms:**
- Notifications visible in panel
- Bell icon shows no badge

**Cause:** Unread count query issue

**Fix:**
```javascript
// In browser console (as user):
import { supabase } from './lib/supabaseClient';
const userId = JSON.parse(localStorage.getItem('localfelo_user')).id;

const { count, error } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);

console.log('Unread count:', count);
console.log('Error:', error);
```

---

### Issue 5: Realtime not working
**Symptoms:**
- Notifications appear only after page refresh
- No instant delivery

**Fix:**
```sql
-- 1. Check if table is in realtime publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'notifications';

-- 2. If not found, add it:
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

## Full System Test

### Test 1: Admin Sends Broadcast

1. **Login as admin**
2. **Admin Panel → Broadcast**
3. **Fill form:**
   - Title: "System Test"
   - Message: "Testing broadcast system"
   - Type: Info
   - Recipients: All Users
4. **Click Send**

**Check Console:**
```javascript
✅ Should see:
📢 [BROADCAST] Starting broadcast notification...
✅ [BROADCAST] Authenticated as: [uuid]
🔧 [BROADCAST] Calling PostgreSQL function...
📊 [BROADCAST] Function result: { success: true, inserted_count: X }
✅ [BROADCAST] Successfully created X notifications

❌ Should NOT see:
❌ [BROADCAST] Not authenticated
❌ [BROADCAST] Function returned error
❌ PostgreSQL error
```

**Check Database:**
```sql
SELECT COUNT(*) FROM notifications WHERE title = 'System Test';
```
Should return: Number of users (excluding admin)

---

### Test 2: User Receives Notification

1. **Logout from admin**
2. **Login as regular user**
3. **Look at bell icon**

**Expected:**
- ✅ Red badge with number
- ✅ Click bell → panel opens
- ✅ "System Test" notification visible
- ✅ Message: "Testing broadcast system"
- ✅ Can mark as read
- ✅ Can delete
- ✅ Badge updates

**If badge is 0 but notification visible:**
- Unread count query is wrong
- Check Issue #4 above

**If notification not visible:**
- RLS is blocking (check Issue #2)
- OR user_id mismatch (check Issue #6)

---

### Test 3: Real-time Delivery

1. **Open two browser windows**
   - Window 1: Login as admin
   - Window 2: Login as user
2. **In Window 2 (user): Keep notification panel CLOSED**
3. **In Window 1 (admin): Send broadcast**
4. **In Window 2 (user): Watch bell icon**

**Expected:**
- ✅ Badge appears within 1-2 seconds (no refresh needed)

**If doesn't appear automatically:**
- Realtime not working (check Issue #5)
- Page refresh should show notification

---

## Emergency Reset

If nothing works, run this complete reset:

```sql
-- 1. Drop everything
DROP FUNCTION IF EXISTS broadcast_notification CASCADE;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON notifications';
  END LOOP;
END $$;

-- 2. Re-run the complete migration
-- Copy and paste: /migrations/FIX_BROADCAST_NOTIFICATIONS_COMPLETE.sql

-- 3. Verify
SELECT 
  'Function exists' as check_type,
  EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'broadcast_notification') as result
UNION ALL
SELECT 
  'RLS disabled',
  NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications')
UNION ALL
SELECT 
  'No policies',
  NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'notifications');
```

**All should return `true`**

---

## Success Criteria

✅ **System is working when:**

1. **Database Level:**
   - RLS is disabled
   - No RLS policies exist
   - Function `broadcast_notification` exists
   - Notifications table has entries

2. **Admin Side:**
   - Can send broadcast
   - See success toast with count
   - Console shows success logs
   - No errors

3. **User Side:**
   - Bell icon shows badge
   - Can open notification panel
   - Sees broadcast notifications
   - Can interact (read/delete)
   - Badge updates correctly

4. **Real-time:**
   - Notifications appear without refresh
   - Badge updates instantly
   - Works across multiple users

---

## Support Checklist

Before asking for help, verify:

- [ ] Ran `/migrations/FIX_BROADCAST_NOTIFICATIONS_COMPLETE.sql`
- [ ] RLS is disabled (query #1)
- [ ] No RLS policies (query #2)
- [ ] Function exists (query #3)
- [ ] Notifications were inserted (query #4)
- [ ] User ID exists in localStorage
- [ ] Checked browser console for errors
- [ ] Tried emergency reset

---

**Need more help?** Provide:
1. Output from queries #1-6
2. Browser console logs (full)
3. SQL migration output
4. Screenshots of issue
