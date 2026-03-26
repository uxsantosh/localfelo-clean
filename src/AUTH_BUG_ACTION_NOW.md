# 🚨 AUTH BUG - IMMEDIATE ACTION REQUIRED

## What to Do RIGHT NOW

### Step 1: Open the App (2 min)
1. Run `npm run dev`
2. Open browser at http://localhost:5173
3. **Open Browser Console** (F12 or right-click → Inspect → Console tab)

### Step 2: Try to Login (1 min)
1. Enter your test phone number (the one you registered 3 times)
2. Click "Continue"
3. **DO NOT CLOSE THE BROWSER**

### Step 3: Copy Console Logs (1 min)
You should see logs like this:
```
🔍 Checking phone: +919876543210
✅ Found user by phone column: {object}
📋 Profile check result: {object}
🔍 FULL PROFILE DATA: {detailed json}
```

**Copy ALL these logs** and share them with me.

---

## What I Need From You

### Console Logs
Look for these specific lines and copy them:

```javascript
📋 Profile check result: {
  exists: true/false,          // ← Is this true or false?
  hasPassword: true/false,     // ← Is this true or false?
  hasPasswordValue: "YES" / "NO", // ← What does it say?
  ...
}

🔍 FULL PROFILE DATA: {
  has_password_hash: true/false,  // ← Is this true or false?
  password_hash_preview: "..."    // ← Does this show or say "NULL"?
}
```

### Expected Behavior
If you've registered 3 times, you should see:
- ✅ `exists: true`
- ✅ `hasPassword: true`
- ✅ `has_password_hash: true`
- ✅ `password_hash_preview: "$2a$10$abcdef..."`

Then it should show **password input screen** (NOT OTP).

### If Bug Exists
You'll probably see:
- ❌ `exists: false` OR
- ❌ `hasPassword: false` OR
- ❌ `password_hash_preview: "NULL"`

Then it incorrectly sends OTP.

---

## Quick Database Check

### Option 1: Supabase Dashboard
1. Go to https://supabase.com
2. Select your project
3. Go to "Table Editor" → "profiles"
4. Find your phone number row
5. Check these columns:
   - `phone` = "+919876543210" ?
   - `password_hash` = filled (long string) ?
   - `client_token` = filled ?
   - `name` = your name ?

### Option 2: SQL Query
Run this in Supabase SQL Editor:

```sql
SELECT 
  id,
  phone,
  name,
  password_hash IS NOT NULL as has_password,
  LENGTH(password_hash) as password_length,
  client_token IS NOT NULL as has_token,
  created_at
FROM profiles
WHERE phone LIKE '%<YOUR_LAST_4_DIGITS>%'
ORDER BY created_at DESC;
```

Replace `<YOUR_LAST_4_DIGITS>` with your phone's last 4 digits.

---

## Possible Issues & Quick Fixes

### Issue 1: Password Not Saved ❌
**Symptom:** `password_hash IS NULL` in database

**Quick Fix SQL:**
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE phone = '+919876543210';

-- If exists but no password, you can manually set a test password
UPDATE profiles
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE phone = '+919876543210';
```

Then login with password: `test123`

---

### Issue 2: Multiple Profiles Created ❌
**Symptom:** Multiple rows with same phone

**Check SQL:**
```sql
SELECT COUNT(*), phone 
FROM profiles 
GROUP BY phone 
HAVING COUNT(*) > 1;
```

**Quick Fix:**
```sql
-- Delete duplicate profiles, keep the latest
DELETE FROM profiles
WHERE phone = '+919876543210'
AND id NOT IN (
  SELECT id FROM profiles
  WHERE phone = '+919876543210'
  ORDER BY created_at DESC
  LIMIT 1
);
```

---

### Issue 3: Phone Format Mismatch ❌
**Symptom:** Profile exists but not found by query

**Check SQL:**
```sql
SELECT DISTINCT 
  phone,
  LENGTH(phone) as length,
  phone LIKE '+91%' as has_plus_91
FROM profiles
WHERE phone IS NOT NULL;
```

**Look for:**
- Different phone formats ("+919876..." vs "9876...")
- Different column names ("phone" vs "phone_number")

---

## Temporary Workaround

While we debug, you can:

1. **Delete test profile:**
```sql
DELETE FROM profiles WHERE phone = '+919876543210';
```

2. **Register fresh** with a different number (or same after delete)

3. **Check it works** on second login

---

## What to Share

Please provide:

1. ✅ **Console logs** (the detailed ones we added)
2. ✅ **Database row** (screenshot or SQL result)
3. ✅ **What happened:**
   - Did it send OTP? (wrong)
   - Did it show password screen? (correct)

---

## ETA

Once you provide the logs, I can:
- Identify exact issue (5 min)
- Provide targeted fix (10 min)
- Test and verify (5 min)

**Total: ~20 minutes to fix**

---

**Please test now and share the console logs!** 🙏
