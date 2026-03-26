# Fix Device Tokens "Row Not Inserted" Issue

## 🔍 Issue Found

Your database has **10 RLS policies** (created during troubleshooting), including:
- ❌ A "TEMP allow insert" policy that bypasses security
- ❌ Duplicate policies (4 UPDATE policies, 3 INSERT policies, 2 SELECT policies)
- ❌ Incomplete UPDATE policies (missing WITH CHECK clause)

While some policies are correct, the duplicates and incomplete ones may be causing conflicts.

---

## ✅ Solution

### Step 1: Run Migration Script

1. Open **Supabase SQL Editor**
2. Copy contents of `/database/migrations/fix_device_tokens_policies.sql`
3. Run the script

This will:
- ✅ Drop all 10 existing policies
- ✅ Create 4 clean, correct policies (INSERT, SELECT, UPDATE, DELETE)
- ✅ Ensure UPDATE policy has both USING and WITH CHECK

### Step 2: Verify Migration

Run this query to verify exactly 4 policies exist:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'device_tokens'
ORDER BY cmd, policyname;
```

**Expected output:**
```
[
  {
    "policyname": "Users can delete own device tokens",
    "cmd": "DELETE",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can insert own device tokens",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "policyname": "Users can read own device tokens",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can update own device tokens",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = user_id)",
    "with_check": "(auth.uid() = user_id)"
  }
]
```

### Step 3: Test on Android

1. Build and install the app
2. Log in as a user
3. Check console logs for:

```
[usePushNotifications] ✅ Token stored in device_tokens table: {
  platform: 'android',
  rowId: '...',
  isEnabled: true,
  createdAt: '...'
}
```

---

## 📊 What Changed

### Before (10 policies):
- TEMP allow insert device tokens (INSERT) - **INSECURE**
- Users can insert own device tokens (INSERT)
- user can upsert own device token (INSERT)
- Users can read own tokens (SELECT)
- Users can view own device tokens (SELECT)
- Allow user to update own device token (UPDATE) - **INCOMPLETE**
- Users can update own device tokens (UPDATE) - **INCOMPLETE**
- Users can update own tokens (UPDATE)
- user can update own device token (UPDATE)
- Users can delete own device tokens (DELETE)

### After (4 policies):
- Users can insert own device tokens (INSERT) ✅
- Users can read own device tokens (SELECT) ✅
- Users can update own device tokens (UPDATE) ✅ **WITH CHECK ADDED**
- Users can delete own device tokens (DELETE) ✅

---

## 🎯 Why This Should Fix It

The incomplete UPDATE policies had:
```sql
USING (auth.uid() = user_id)  -- ✅ Checks who can access the row
WITH CHECK null              -- ❌ Missing constraint for new values
```

For UPSERT to work with `.select()`:
1. **UPSERT** tries INSERT first
2. If conflict (token exists), switches to **UPDATE**
3. UPDATE needs **both USING and WITH CHECK**
4. Then `.select()` needs **SELECT policy** to return data

The new UPDATE policy has both:
```sql
USING (auth.uid() = user_id)      -- ✅ Can access existing row
WITH CHECK (auth.uid() = user_id)  -- ✅ New values pass check
```

---

## 🧪 If It Still Doesn't Work

Run the Android app and copy the **FULL console output** from:
```
[usePushNotifications] Storing push token in database
```

The detailed logs I added will show:
- Session verification status
- Exact error message/code
- Whether data was returned

Then I can provide a more specific fix.

---

## 🔐 Security Note

The "TEMP allow insert device tokens" policy with `with_check: true` was bypassing ALL security checks - any user could insert tokens for any other user. The migration removes this vulnerability.
