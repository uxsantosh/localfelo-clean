# 🔧 GOOGLE OAUTH DEBUGGING GUIDE

## Current Issue
Google OAuth redirect is not creating a session after successful authentication.

## Root Cause Checklist

### ✅ 1. Check Supabase Google OAuth Provider Settings

Go to Supabase Dashboard → Authentication → Providers → Google

**Required fields:**
- ✅ **Enabled:** ON
- ✅ **Client ID:** (from Google Cloud Console)
- ✅ **Client Secret:** (from Google Cloud Console)
- ✅ **Authorized Client IDs:** (Optional - leave empty)
- ✅ **Skip nonce check:** OFF (keep default)

**🔥 CRITICAL:** Make sure you clicked **SAVE** after entering credentials!

---

### ✅ 2. Check Google Cloud Console OAuth Settings

**Authorized JavaScript origins:**
```
https://drofnrntrbedtjtpseve.supabase.co
https://oldcycle.hueandhype.com
http://localhost:5173
http://localhost:4173
```

**Authorized redirect URIs (ONLY THIS ONE!):**
```
https://drofnrntrbedtjtpseve.supabase.co/auth/v1/callback
```

**❌ REMOVE these if present:**
- ❌ `https://oldcycle.hueandhype.com`
- ❌ `http://localhost:5173`
- ❌ `http://localhost:4173`

---

### ✅ 3. Check Supabase Site URL

Go to Supabase Dashboard → Authentication → URL Configuration

**Site URL should be:**
```
http://localhost:5173
```

**Redirect URLs should include:**
```
http://localhost:5173/**
http://localhost:4173/**
https://oldcycle.hueandhype.com/**
```

---

### ✅ 4. Verify RLS Policies Allow Profile Creation

Run this SQL in Supabase SQL Editor:

```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- If no INSERT policy exists, add one:
CREATE POLICY "allow_insert_profile" 
ON profiles FOR INSERT 
WITH CHECK (true);

-- Make sure SELECT is also allowed:
CREATE POLICY "allow_select_profile" 
ON profiles FOR SELECT 
USING (true);
```

---

### ✅ 5. Test OAuth Flow Manually

1. Open browser DevTools → Network tab
2. Click "Sign in with Google"
3. Complete Google sign-in
4. After redirect back, check Network tab for:
   - Request to `/auth/v1/callback` (should be 200 OK)
   - Request to `/auth/v1/token` (should return access_token)

If these requests fail, the issue is with OAuth config.

---

### ✅ 6. Clear ALL Browser State

```javascript
// Run in browser console:
localStorage.clear();
sessionStorage.clear();
// Then hard refresh: Ctrl+Shift+R
```

---

## Quick Fix Script

If none of the above works, try this alternative approach using Phone OTP instead:

1. Disable Google OAuth temporarily
2. Use Phone/Email OTP authentication
3. Re-enable Google OAuth with fresh credentials

---

## Still Not Working?

**Check Supabase Logs:**
1. Go to Supabase Dashboard → Logs → Auth Logs
2. Look for errors around the time you tried to sign in
3. Share the error message for debugging

**Common errors:**
- `Invalid redirect URL` → Check Site URL + Redirect URLs in Supabase
- `Invalid client credentials` → Re-enter Google Client ID/Secret in Supabase
- `PKCE flow failed` → Clear browser cache and try again
