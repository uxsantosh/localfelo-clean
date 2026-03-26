# Error Fix Explanation - Professionals Module

## 🔴 Errors You're Seeing

### 1. **406 Errors** (Not Acceptable)
```
Failed to load resource: the server responded with a status of 406
professional_categories_images?select=image_url&category_id=eq.cooking
```

**Cause:** The `professional_categories_images` table doesn't exist in your Supabase database yet.

**Fix:** Run `/PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql` in Supabase SQL Editor.

---

### 2. **42501 Error** (RLS Policy Violation)
```
Error creating professional: {
  "code": "42501",
  "message": "new row violates row-level security policy for table \"professionals\""
}
```

**Cause:** LocalFelo uses a custom authentication system with `x-client-token` headers, but the default RLS policies were checking for Supabase Auth (`auth.uid()`), which returns `NULL` because no Supabase Auth session exists.

**Fix:** Run `/PROFESSIONALS_RLS_FIX.sql` to update RLS policies to work with LocalFelo's authentication.

---

## 🔧 How the Fix Works

### Before (Broken):
```sql
-- This policy checks auth.uid(), which is NULL in LocalFelo
CREATE POLICY "Users can create their own professional profile"
  ON professionals FOR INSERT
  WITH CHECK (auth.uid() = user_id);  -- ❌ auth.uid() is NULL!
```

### After (Fixed):
```sql
-- This policy uses a custom function to extract user_id from x-client-token
CREATE POLICY "Users can create their own professional profile"
  ON professionals FOR INSERT
  WITH CHECK (get_user_id_from_token() = user_id);  -- ✅ Works!
```

### The Helper Function:
```sql
CREATE OR REPLACE FUNCTION get_user_id_from_token()
RETURNS uuid AS $$
DECLARE
  client_token text;
  found_user_id uuid;
BEGIN
  -- Get the x-client-token from request headers
  client_token := current_setting('request.headers', true)::json->>'x-client-token';
  
  -- Look up user_id from profiles table using client_token
  SELECT id INTO found_user_id
  FROM profiles
  WHERE client_token = get_user_id_from_token.client_token
  LIMIT 1;
  
  RETURN found_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

This function:
1. Extracts the `x-client-token` from the HTTP request headers
2. Looks up the corresponding `user_id` in the `profiles` table
3. Returns the `user_id` for RLS policy checks

---

## 📋 Quick Fix Checklist

Run these in order:

- [ ] **Step 1:** Open Supabase SQL Editor
- [ ] **Step 2:** Run `/PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql` (creates tables)
- [ ] **Step 3:** Run `/PROFESSIONALS_RLS_FIX.sql` (fixes authentication)
- [ ] **Step 4:** Create `professional-images` storage bucket (if needed)
- [ ] **Step 5:** Test the app - register as a professional

---

## ✅ After Fix

Both errors will be resolved:
- ✅ 406 errors gone (tables exist)
- ✅ 42501 error gone (RLS policies work with x-client-token)
- ✅ Professional registration works
- ✅ Category images load properly

---

## 🎯 Why This Matters

**LocalFelo Architecture:**
- Uses **custom authentication** with client tokens stored in `localStorage`
- Does **NOT** use Supabase Auth (no `auth.uid()` available)
- All API requests include `x-client-token` header (configured in `/lib/supabaseClient.ts`)
- Database queries need to validate against this token, not Supabase Auth sessions

**Standard Supabase Apps:**
- Use Supabase Auth with email/password or OAuth
- RLS policies check `auth.uid()` which returns the authenticated user's UUID
- Session managed by Supabase Auth client

**The Bridge:**
Our `get_user_id_from_token()` function bridges the gap between LocalFelo's custom auth and Supabase's RLS system by extracting the user_id from the custom token header.

---

## 🔍 Debugging

If it still doesn't work after running both SQL files:

1. **Check if function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'get_user_id_from_token';
   ```

2. **Test the function:**
   ```sql
   SELECT get_user_id_from_token();
   ```
   Should return your user UUID if authenticated.

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'professionals';
   ```
   Should show policies using `get_user_id_from_token()`.

4. **Verify client token is being sent:**
   Check browser DevTools → Network → Headers → `x-client-token` should be present.

---

**Need more help?** Check Supabase Dashboard → Logs → Postgres Logs for detailed error messages.
