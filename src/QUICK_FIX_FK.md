# ⚡ QUICK FIX - Foreign Key Error

## The Problem

Your `profiles` table has a foreign key linking `id` to Supabase Auth's `auth.users` table. Since you're using **custom phone auth** (not Supabase Auth), the random UUIDs you generate don't exist in `auth.users`, causing the insert to fail.

---

## The Solution (2 minutes)

### Run This SQL in Supabase SQL Editor:

```sql
-- Remove the foreign key constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Clean up test data
DELETE FROM profiles WHERE phone_number = '+919063205739';

-- Verify
SELECT '✅ Ready to test!' as status;
```

**File:** `/COMPLETE_CLEANUP.sql` (has the full script)

---

## Why This Works

### Your Design (Perfect!):
```sql
profiles (
  id UUID PRIMARY KEY,        -- For any user
  auth_user_id UUID,          -- Only for Supabase Auth users
  password_hash TEXT,         -- Only for custom auth users
  ...
)
```

This design supports BOTH:
- ✅ Custom phone auth users (your current flow)
- ✅ Google OAuth users (through Supabase Auth)

**Just remove the foreign key constraint so `id` can be independent.**

---

## Test After Running SQL

1. Open your LocalFelo app
2. Register:
   - Phone: **9063205739**
   - OTP: (from SMS)
   - Name: **John Doe**
   - Password: **test123**
3. Should see "Account created successfully!" ✅
4. Logout and login again with same credentials ✅

---

## What's Fixed

### Error Chain:
1. ❌ CHECK constraint → Fixed (added email + phone_number)
2. ❌ Foreign key constraint → **Fix now** (remove profiles_id_fkey)
3. ✅ Ready to work!

### After Fix:
```
Registration Flow:
1. Enter phone ✅
2. Verify OTP ✅
3. Set name + password ✅
4. Insert profile with random UUID ✅ (no foreign key blocking)
5. Auto-login ✅
```

---

## Files Created

1. `/DIAGNOSE_FOREIGN_KEY.sql` - Diagnostic queries
2. `/FIX_FOREIGN_KEY_CONSTRAINT.sql` - Just the fix
3. `/COMPLETE_CLEANUP.sql` - Fix + cleanup + verification
4. `/FOREIGN_KEY_ERROR_FIXED.md` - Detailed explanation

---

## Ready!

**Run `/COMPLETE_CLEANUP.sql` and test registration.** Should work now! 🚀
