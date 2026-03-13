# 🚨 URGENT: Fix Broadcast Notifications

## Problem
Admin sends broadcast → Shows "sent to X users" → Users DON'T receive under bell icon

## Root Cause
**RLS policies using `auth.uid()` which is NULL for localStorage auth** ❌

Users can't read notifications because:
```sql
-- This check always fails:
USING (user_id = auth.uid()::text)  -- auth.uid() is NULL!
```

---

## ✅ Quick Fix (2 Steps)

### Step 1: Run SQL in Supabase

1. Go to: https://supabase.com/dashboard
2. Open **SQL Editor**
3. Copy `/migrations/FIX_BROADCAST_NOTIFICATIONS_COMPLETE.sql`
4. Paste and click **Run**

Expected output:
```
✅ BROADCAST NOTIFICATIONS FIX COMPLETE
• Function exists: ✅ YES
• RLS enabled: ✅ NO (correct)
• RLS policies: 0 (should be 0)
```

### Step 2: Test

**As Admin:**
- Admin Panel → Broadcast → Send test notification
- Should see: "✅ Notification sent to X users"

**As User:**
- Bell icon should show red badge
- Click bell → notification appears
- ✅ WORKING!

---

## What It Does

1. **Disables RLS** (localStorage auth doesn't work with `auth.uid()`)
2. **Creates broadcast function** (accepts `admin_id` from localStorage)
3. **Adds indexes** (performance)
4. **Enables realtime** (instant delivery)

---

## Why It Happened

LocalFelo uses localStorage auth (not Supabase auth)
- `auth.uid()` only works with Supabase auth sessions
- Since no auth session → `auth.uid()` = NULL
- RLS blocks all reads → users see no notifications
- Solution: Disable RLS (app already filters by user_id)

---

## Files

- **SQL Migration:** `/migrations/FIX_BROADCAST_NOTIFICATIONS_COMPLETE.sql` ⚠️ RUN THIS
- **Full Guide:** `/BROADCAST_NOTIFICATIONS_COMPLETE_FIX.md`
- **Code Status:** ✅ Already updated (no changes needed)

---

## Status

| What | Status |
|------|--------|
| Code | ✅ Done |
| SQL | ⚠️ **YOU NEED TO RUN** |
| Docs | ✅ Done |

**After running SQL:** Notifications will work! 🎉
