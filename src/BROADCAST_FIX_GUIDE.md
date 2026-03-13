# 🔧 Broadcast Notifications - Database Setup Required

## 🎯 Problem
When admin sends a broadcast notification:
- ✅ Toast shows "Notification sent to X users"
- ❌ BUT users don't receive the notification in their bell icon
- ❌ No notification history appears

## 🔍 Root Cause
The PostgreSQL function `broadcast_notification()` doesn't exist in your Supabase database. This function is required to create notifications for users while bypassing Row Level Security (RLS) policies.

---

## ✅ Solution: Run Database Migration

### **Step 1: Open Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your LocalFelo project
3. Click "SQL Editor" in the left sidebar

### **Step 2: Copy the SQL Migration**
Copy the entire contents of this file:
```
/migrations/fix_broadcast_with_function.sql
```

### **Step 3: Run the Migration**
1. In SQL Editor, click "New Query"
2. Paste the entire SQL code
3. Click "Run" (or press Ctrl+Enter / Cmd+Enter)

### **Step 4: Verify Success**
You should see messages like:
```
✅ Notifications table verified
✅ Broadcast notification function created successfully!
```

---

## 🧪 Test After Setup

### **Test 1: Send Broadcast**
1. Login as admin
2. Go to Admin Panel → Broadcast tab
3. Fill in:
   - Title: "Test Notification"
   - Message: "Testing broadcast system"
   - Type: Info
   - Recipients: All Users
4. Click "Send Notification"

**Expected:**
- ✅ Admin sees: "Notification sent to X users!"
- ✅ Check browser console: Should show "Successfully created X notifications"

### **Test 2: Check Notification (Other User)**
1. Logout from admin account
2. Login as a regular user
3. Look at the bell icon in header
4. **Expected:** Red badge showing unread count
5. Click bell icon
6. **Expected:** Notification appears with title and message

### **Test 3: Console Verification**
Open browser console and check for these logs:

**When admin sends:**
```
📢 [BROADCAST] Starting broadcast notification...
🔧 [BROADCAST] Calling PostgreSQL function broadcast_notification()...
✅ [BROADCAST] Successfully created X notifications
```

**When user receives:**
```
✅ Loaded X notifications for user
🔔 New notification received: Test Notification
```

---

## 🔍 Troubleshooting

### **Error: "function broadcast_notification does not exist"**

**Solution:** The SQL migration wasn't run successfully.
1. Check SQL Editor for error messages
2. Make sure you copied the ENTIRE SQL file
3. Run it again

### **Error: "Not authenticated"**

**Solution:** Admin is not logged in with Supabase session.
1. Logout completely
2. Login again
3. Try sending broadcast again

### **Error: "No users found to notify"**

**Solution:** No users exist in the `profiles` table.
1. Make sure you have registered users
2. Check Supabase → Table Editor → profiles
3. Verify there are rows in the table

### **Notifications still not appearing**

**Check 1: Database Table Exists**
```sql
-- Run this in SQL Editor
SELECT COUNT(*) FROM notifications;
```
Should return a number, not an error.

**Check 2: Function Exists**
```sql
-- Run this in SQL Editor
SELECT proname FROM pg_proc WHERE proname = 'broadcast_notification';
```
Should return one row with 'broadcast_notification'.

**Check 3: Permissions**
```sql
-- Run this in SQL Editor
SELECT has_function_privilege('authenticated', 'broadcast_notification(text, text, text, text, uuid[])', 'EXECUTE');
```
Should return `true`.

**Check 4: RLS Policies**
```sql
-- Run this in SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```
Should show policies for SELECT, INSERT, UPDATE, DELETE.

---

## 📋 What the Migration Does

### **1. Creates/Verifies Notifications Table**
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  action_url TEXT,
  related_type TEXT,
  related_id UUID,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **2. Creates Broadcast Function**
```sql
CREATE OR REPLACE FUNCTION broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_user_ids UUID[] DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, inserted_count INTEGER, error_message TEXT)
SECURITY DEFINER  -- Bypasses RLS
```

**What it does:**
- Gets admin ID from `auth.uid()`
- If `p_user_ids` is NULL → sends to ALL users
- If `p_user_ids` has IDs → sends only to those users
- Creates one notification row per user
- Returns success status and count

### **3. Sets Up RLS Policies**
```sql
-- Users can see their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### **4. Creates Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
ON notifications(is_read) WHERE is_read = FALSE;
```

**Benefits:**
- Fast queries when fetching user notifications
- Fast sorting by date
- Fast unread count queries

---

## 🎨 How It Works (Flow Diagram)

```
ADMIN SENDS BROADCAST
         |
         v
Frontend calls sendBroadcastNotification()
         |
         v
Calls Supabase RPC: broadcast_notification(title, message, type, ...)
         |
         v
PostgreSQL Function Runs:
  1. Gets admin ID from auth.uid()
  2. Gets list of all user IDs from profiles table
  3. Creates one notification per user
  4. Returns count
         |
         v
Frontend shows: "Notification sent to X users!"
         |
         v
USER OPENS APP
         |
         v
Frontend calls getNotifications(userId)
         |
         v
Supabase query:
  SELECT * FROM notifications
  WHERE user_id = current_user_id
  ORDER BY created_at DESC
         |
         v
Notifications appear in bell icon!
```

---

## 📊 Expected Database State

### **After Migration:**

**Tables:**
- ✅ `notifications` - Stores all notifications

**Functions:**
- ✅ `broadcast_notification()` - Creates notifications for users

**Policies (RLS):**
- ✅ Users can SELECT their own notifications
- ✅ Users can UPDATE their own notifications (mark as read)
- ✅ Users can DELETE their own notifications

**Indexes:**
- ✅ `idx_notifications_user_id` - Fast user lookup
- ✅ `idx_notifications_created_at` - Fast date sorting
- ✅ `idx_notifications_is_read` - Fast unread count

---

## 🚀 After Setup Works

### **Admin Experience:**
1. Admin Panel → Broadcast
2. Fill in notification details
3. Click "Send Notification"
4. ✅ Toast: "Notification sent to X users!"
5. ✅ Console: Shows success logs with count

### **User Experience:**
1. User opens app (any page)
2. ✅ Bell icon shows red badge with unread count
3. User clicks bell icon
4. ✅ Panel opens showing notifications
5. ✅ Notification list shows:
   - Title: "Test Notification"
   - Message: "Testing broadcast system"
   - Time: "2 minutes ago"
6. User clicks notification
7. ✅ Marked as read (badge count decreases)

### **Real-time Updates:**
- ✅ When notification is created, users see badge update
- ✅ When notification is read, badge decreases
- ✅ When notification is deleted, it disappears from list

---

## 📞 Still Not Working?

### **Check Console Logs**

**Send broadcast (as admin):**
```javascript
// Expected logs:
📢 [BROADCAST] Starting broadcast notification...
✅ [BROADCAST] Authenticated as: [admin-id]
🔧 [BROADCAST] Calling PostgreSQL function broadcast_notification()...
📊 [BROADCAST] Function result: { success: true, inserted_count: 5, error_message: null }
✅ [BROADCAST] Successfully created 5 notifications
```

**Receive notification (as user):**
```javascript
// Expected logs:
✅ Loaded 3 notifications for user [user-id]
🔔 New notification received: Test Notification
```

### **Check Database Directly**

**Run in SQL Editor:**
```sql
-- Check if notifications were created
SELECT 
  n.id,
  n.user_id,
  p.name as user_name,
  n.title,
  n.message,
  n.is_read,
  n.created_at
FROM notifications n
LEFT JOIN profiles p ON p.id = n.user_id
ORDER BY n.created_at DESC
LIMIT 10;
```

**Expected:** Should show recent broadcast notifications for all users.

---

## ✅ Success Checklist

After running the migration:

- [ ] SQL migration ran without errors
- [ ] Function `broadcast_notification` exists in database
- [ ] Table `notifications` exists with correct columns
- [ ] RLS policies exist for notifications table
- [ ] Admin can send broadcast (toast appears)
- [ ] Console shows "Successfully created X notifications"
- [ ] Users see notification in bell icon
- [ ] Notification count badge appears
- [ ] Clicking notification opens details
- [ ] Clicking notification marks it as read
- [ ] Real-time updates work (no refresh needed)

---

## 🎯 Summary

**The Fix:**
1. Run `/migrations/fix_broadcast_with_function.sql` in Supabase SQL Editor
2. Verify success messages appear
3. Test by sending a broadcast as admin
4. Check another user account to see notification

**Why This Works:**
- Creates the PostgreSQL function that was missing
- Function bypasses RLS to create notifications for all users
- Sets up proper permissions and indexes
- Enables real-time notification delivery

**After this fix, broadcast notifications will work end-to-end!** 🎉
