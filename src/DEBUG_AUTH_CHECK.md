# 🔍 Auth Registration Bug - Debug Guide

## Issue
User registers 3 times with same number, but system keeps sending OTP and asking for name/password instead of showing password login.

## Expected Flow
1. **First time (New User):** Phone → OTP → Name + Password → Login ✅
2. **Second time (Returning):** Phone → Password → Login ✅
3. **Forgot Password:** Phone → OTP → Reset Password ✅

## Current Bug
User keeps going through: Phone → OTP → Name + Password (wrong!)

---

## Debug Steps

### Step 1: Check Browser Console
When you enter phone number and click continue, check console for:

```
🔍 Checking phone: +919876543210
✅ Found user by phone column: {profile object}
📋 Profile check result: {
  exists: true/false,
  hasPassword: true/false,
  phone: "+919876543210",
  allFields: [...]
}
```

**What to look for:**
- Is `exists` true or false?
- Is `hasPassword` true or false?
- Are `allFields` showing all profile data?

### Step 2: Check Database Directly
Open Supabase Dashboard → Table Editor → `profiles` table

Find your phone number row and check:
- [ ] Does the row exist?
- [ ] Is `password_hash` column filled (not null)?
- [ ] Is `phone` column = `+919876543210`?
- [ ] Is `client_token` filled?
- [ ] Is `name` filled?

### Step 3: Check for Duplicate Rows
Run this SQL in Supabase SQL Editor:

```sql
SELECT 
  id,
  phone,
  name,
  password_hash IS NOT NULL as has_password,
  client_token,
  created_at
FROM profiles
WHERE phone = '+919876543210' -- Replace with your test number
ORDER BY created_at DESC;
```

**Look for:**
- Multiple rows with same phone? (BAD - should be unique)
- Any row with `has_password = false`? (BAD - password not saved)
- Any row with null name? (BAD - profile incomplete)

---

## Possible Root Causes

### Cause 1: Profile Created Without Password ❌
**Symptom:** Row exists but `password_hash` is NULL

**Why:** Insert failed partially or password hashing failed

**Fix:** Check line 301-318 in PhoneAuthScreen.tsx

### Cause 2: Phone Format Mismatch ❌
**Symptom:** Profile check returns null but row exists

**Examples:**
- Stored: `9876543210` (no +91)
- Checking: `+919876543210` (with +91)

**Fix:** Ensure consistent format everywhere

### Cause 3: Database Constraint Issue ❌
**Symptom:** Insert appears to succeed but row not created

**Why:** Foreign key or unique constraint violation

**Fix:** Check Supabase logs for errors

### Cause 4: Multiple Profiles Created ❌
**Symptom:** New profile created each time instead of finding existing

**Why:** Phone number stored in different column or format

**Fix:** Add UNIQUE constraint on phone column

---

## Quick Fix Test

### Test 1: Force Password Screen
Add this temporary debug code at line 109:

```typescript
// TEMP DEBUG - Force password screen
console.log('🔍 DEBUG - Profile:', profile);
console.log('🔍 DEBUG - Password Hash:', profile?.password_hash);
if (profile) {
  console.log('✅ FORCING PASSWORD SCREEN FOR TESTING');
  setExistingProfile(profile);
  setIsNewUser(false);
  setStep('enter-password');
  setLoading(false);
  return;
}
```

**Result:**
- If password screen shows → Profile exists but check failing
- If still OTP → Profile not being found

### Test 2: Check Actual Database Query
Add this at line 71:

```typescript
console.log('🔍 Querying profiles with phone:', dbPhone);
const { data: debugData, error: debugError } = await supabase
  .from('profiles')
  .select('*')
  .eq('phone', dbPhone);
  
console.log('🔍 DEBUG Query Result:', {
  count: debugData?.length || 0,
  data: debugData,
  error: debugError
});
```

---

## SQL Queries to Run

### 1. Check All Profiles
```sql
SELECT 
  id,
  phone,
  phone_number,
  name,
  password_hash IS NOT NULL as has_password,
  LENGTH(password_hash) as hash_length,
  client_token IS NOT NULL as has_token,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;
```

### 2. Check for Duplicate Phones
```sql
SELECT 
  phone,
  COUNT(*) as count
FROM profiles
WHERE phone IS NOT NULL
GROUP BY phone
HAVING COUNT(*) > 1;
```

### 3. Check Phone Formats
```sql
SELECT DISTINCT
  phone,
  LENGTH(phone) as phone_length,
  phone LIKE '+91%' as has_country_code
FROM profiles
WHERE phone IS NOT NULL;
```

### 4. Find Incomplete Profiles
```sql
SELECT 
  id,
  phone,
  name,
  password_hash IS NULL as missing_password,
  client_token IS NULL as missing_token,
  created_at
FROM profiles
WHERE password_hash IS NULL OR client_token IS NULL
ORDER BY created_at DESC;
```

---

## Expected Database State

### After Registration (Correct)
```
id: "550e8400-e29b-41d4-a716-446655440000"
phone: "+919876543210"
name: "John Doe"
password_hash: "$2a$10$abcdef..." (60+ chars)
client_token: "token_1234567890_abc123"
owner_token: "token_1234567890_xyz789"
created_at: "2024-02-11T10:30:00Z"
```

### After Registration (Wrong)
```
❌ phone: "9876543210" (missing +91)
❌ password_hash: NULL (not saved)
❌ client_token: NULL (not saved)
❌ Multiple rows with same phone
```

---

## Immediate Action Plan

### 1. Add Console Logging (5 min)
Update PhoneAuthScreen.tsx line 102-107 with more detailed logging

### 2. Test Registration (2 min)
1. Open browser console (F12)
2. Try to login with your test number
3. Copy all console logs
4. Share the logs

### 3. Check Database (3 min)
1. Open Supabase Dashboard
2. Go to profiles table
3. Find your phone number
4. Check if row exists and has password_hash

### 4. Run SQL Queries (5 min)
Copy the SQL queries above and run in Supabase SQL Editor

---

## What I Need From You

Please provide:

1. **Browser Console Logs** when you enter phone and click continue
2. **Screenshot** of profiles table row for your test phone
3. **Result** of SQL query: 
   ```sql
   SELECT * FROM profiles WHERE phone LIKE '%[your_number]%';
   ```

---

## Temporary Workaround

If you need to test other features while we debug:

### Option 1: Manual Database Fix
```sql
-- Update your profile with a test password
UPDATE profiles
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' -- "test123"
WHERE phone = '+919876543210';
```

Then login with password: `test123`

### Option 2: Clear and Re-register
```sql
-- Delete your test profile
DELETE FROM profiles WHERE phone = '+919876543210';
```

Then register fresh.

---

**Status:** Investigating  
**Priority:** HIGH (Critical auth bug)  
**Next Step:** Need console logs + database state
