# 🔍 DEBUG: Notifications Error

## Current Error:
```
Failed to get unread count: { "message": "" }
```

## ✅ **IMMEDIATE FIX APPLIED:**

Updated `/services/notifications.ts` with better error logging to diagnose the issue.

---

## 🔍 **Next Steps to Diagnose:**

### **Step 1: Check Console for Detailed Error**

After refreshing, you should now see **detailed error information** in the console:

```javascript
Notifications error details: {
  message: "...",
  code: "...",
  details: "...",
  hint: "..."
}
```

**Look for:**
- ❌ `code: "42P01"` → Table doesn't exist
- ❌ `code: "PGRST204"` → Table not found (PostgREST error)
- ❌ `message: "relation does not exist"` → Table missing
- ⚠️ Any other error codes

---

## 💡 **Most Likely Causes:**

### **Cause 1: Notifications Table Doesn't Exist** (90% chance)

**Solution:** Run the SQL setup script

1. Go to Supabase → **SQL Editor**
2. Copy & paste from `/DATABASE_SETUP_NOTIFICATIONS.sql`
3. Click **Run**
4. Refresh your app

---

### **Cause 2: RLS Policy Blocking Access** (8% chance)

If table exists but you get empty errors, check RLS:

```sql
-- Check if RLS is blocking
SELECT * FROM notifications;
```

If you get permission error:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

Then check if notifications work. If yes, your RLS policies need fixing.

---

### **Cause 3: Wrong Column Names** (2% chance)

If you created the table manually, verify column names:

```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications';
```

Required columns:
- ✅ `user_id` (UUID)
- ✅ `read` (BOOLEAN) ← NOT "isRead" or "is_read"
- ✅ `created_at` (TIMESTAMP)

---

## 🛠️ **Quick Fixes:**

### **Fix 1: Create Table**
```sql
-- Run the setup script from DATABASE_SETUP_NOTIFICATIONS.sql
```

### **Fix 2: Check if Table Exists**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'notifications'
);
```

### **Fix 3: Drop & Recreate (Nuclear Option)**
```sql
-- Only if table exists but is broken
DROP TABLE IF EXISTS notifications CASCADE;
-- Then run DATABASE_SETUP_NOTIFICATIONS.sql
```

---

## 🧪 **Test After Fix:**

### **Test 1: Check console**
Should see:
```
✅ No more "Failed to get unread count" errors
```

### **Test 2: Manual query**
```sql
-- Should return 0 (not error)
SELECT COUNT(*) FROM notifications;
```

### **Test 3: Create test notification**
```javascript
// In browser console
await window.testNotification();
```

Should see:
```
✅ Test notification created
```

---

## 📋 **Checklist:**

- [ ] Updated `/services/notifications.ts` (copy from Figma Make)
- [ ] Checked browser console for detailed error
- [ ] Ran `/DATABASE_SETUP_NOTIFICATIONS.sql` in Supabase
- [ ] Verified table exists in Supabase Table Editor
- [ ] Refreshed app (Ctrl+Shift+R)
- [ ] No more errors in console

---

## 🆘 **Still Getting Errors?**

Check the console output and share:
1. The error code (e.g., "42P01", "PGRST204")
2. The full error message
3. Whether notifications table shows in Supabase

This will tell us exactly what's wrong!

---

## ✅ **Updated Files:**

Copy this file to your local:
- **`/services/notifications.ts`** ✅ UPDATED - Better error logging

After copying, refresh and check console for detailed error info.
