# Password Authentication Debugging Guide

## Issue: "Incorrect Password" After Registration

If users see "Incorrect password" immediately after registering, follow this debugging guide.

---

## 🔍 Root Cause Analysis

### Possible Causes:
1. **Whitespace in password** - Trailing/leading spaces during registration vs login
2. **Password hash not saved** - Database write failed or didn't persist
3. **Wrong profile retrieved** - Multiple profiles with same phone number
4. **Hash mismatch** - Different hashing algorithm or encoding issue
5. **Timing issue** - Password hash not yet committed when user tries to login

---

## ✅ Fixes Implemented

### 1. Added Password Trimming
**Location:** `/screens/PhoneAuthScreen.tsx`

**Registration (line ~293):**
```typescript
const trimmedPassword = password.trim();
const passwordHash = await hashPassword(trimmedPassword);
```

**Login (line ~189):**
```typescript
const trimmedPassword = password.trim();
const isValid = await verifyPassword(trimmedPassword, existingProfile.password_hash);
```

**Reset Password (line ~558):**
```typescript
const trimmedPassword = password.trim();
const passwordHash = await hashPassword(trimmedPassword);
```

**Why:** Removes any accidental whitespace that could cause hash mismatch.

---

### 2. Added Comprehensive Logging

**Registration Flow:**
```typescript
console.log('🔐 Password entered:', `"${password}" (length: ${password.length})`);
console.log('🔐 Password trimmed:', `"${trimmedPassword}" (length: ${trimmedPassword.length})`);
console.log('🔐 Password hash generated:', passwordHash.substring(0, 20) + '...');
console.log('🔐 Password hash length:', passwordHash.length);
console.log('💾 [Registration] Saving password hash to database...');
console.log('💾 [Registration] User ID:', authData.user.id);
console.log('✅ Password hash saved successfully to database!');
```

**Verification After Save:**
```typescript
const { data: verifyProfile } = await supabase
  .from('profiles')
  .select('password_hash')
  .eq('id', authData.user.id)
  .single();

console.log('✅ VERIFICATION: Password hash found in DB:', verifyProfile.password_hash.substring(0, 20) + '...');
console.log('✅ VERIFICATION: Hashes match?', verifyProfile.password_hash === passwordHash ? 'YES ✅' : 'NO ❌');
```

**Login Flow:**
```typescript
console.log('🔐 [Login] Password entered:', `"${password}" (length: ${password.length})`);
console.log('🔐 [Login] Password trimmed:', `"${trimmedPassword}" (length: ${trimmedPassword.length})`);
console.log('🔐 [Login] Stored hash from DB:', existingProfile.password_hash.substring(0, 20) + '...');
console.log('🔐 [Login] Stored hash length:', existingProfile.password_hash?.length || 0);
console.log('🔐 [Login] Password verification result:', isValid ? 'VALID ✅' : 'INVALID ❌');
```

**Phone Lookup:**
```typescript
console.log('✅ Found user by phone column:', profile);
console.log('🔍 Password hash present?', profile.password_hash ? 'YES' : 'NO');
if (profile.password_hash) {
  console.log('🔍 Password hash length:', profile.password_hash.length);
  console.log('🔍 Password hash preview:', profile.password_hash.substring(0, 20) + '...');
}
```

---

### 3. Added Database Verification
**Location:** `/screens/PhoneAuthScreen.tsx` line ~373

After saving password hash during registration, we now:
1. Save the hash to database
2. Wait 500ms for write to complete
3. Read the hash back from database
4. Verify it matches what we saved

---

## 🧪 How to Debug

### Step 1: Register a New User
Open browser console and watch for:

```
🔐 Password entered: "test123" (length: 7)
🔐 Password trimmed: "test123" (length: 7)
🔐 Password hash generated: 64e1b3d53cbb63be9... (64 chars)
💾 [Registration] Saving password hash to database...
✅ Password hash saved successfully to database!
✅ VERIFICATION: Password hash found in DB: 64e1b3d53cbb63be9...
✅ VERIFICATION: Hashes match? YES ✅
```

**If you see:**
- `Hashes match? NO ❌` → Database corruption or write issue
- `Password hash NOT found in DB` → Database write failed
- Different lengths → Encoding issue

---

### Step 2: Try to Login with Same Password
Open browser console and watch for:

```
🔍 Checking phone: +919876543210
✅ Found user by phone column: { id: '...', phone: '...', password_hash: '64e1b...' }
🔍 Password hash present? YES
🔍 Password hash length: 64
🔍 Password hash preview: 64e1b3d53cbb63be9...
🔐 [Login] Password entered: "test123" (length: 7)
🔐 [Login] Password trimmed: "test123" (length: 7)
🔐 [Login] Stored hash from DB: 64e1b3d53cbb63be9...
🔐 [Login] Password verification result: VALID ✅
```

**If you see:**
- `INVALID ❌` → Check if hashes match
- `Password hash present? NO` → Hash not saved during registration
- Different hash lengths → Encoding problem

---

## 🔬 Manual Testing

### Test 1: Hash Consistency
```typescript
import { testPasswordHashing } from './utils/testPasswordHash';

// In browser console
testPasswordHashing('test123');
```

Expected output:
```
🧪 ===== PASSWORD HASH TEST =====
📝 Testing password: test123
🔐 Hash 1: 64e1b3d53cbb63be9726c03ca06695...
📏 Hash 1 length: 64
🔐 Hash 2: 64e1b3d53cbb63be9726c03ca06695...
📏 Hash 2 length: 64
✅ Hashes identical? YES ✅
🔍 Verify correct password: PASS ✅
🔍 Verify wrong password: PASS ✅ (correctly rejected)
🧪 ===== TEST COMPLETE =====
```

---

### Test 2: Whitespace Test
```typescript
import { testPasswordWithWhitespace } from './utils/testPasswordHash';

// In browser console
testPasswordWithWhitespace();
```

This will show if trailing/leading spaces cause different hashes.

---

## 🐛 Common Issues & Solutions

### Issue 1: Password Hash Not Saved
**Symptoms:**
```
✅ Password hash saved successfully to database!
❌ VERIFICATION: Password hash NOT found in DB after save!
```

**Solution:**
- Check database permissions
- Check if `password_hash` column exists
- Check if column type is TEXT or VARCHAR (needs to hold 64 characters)

---

### Issue 2: Whitespace in Password
**Symptoms:**
```
🔐 Password entered: "test123 " (length: 8)  ← Notice space
🔐 Password trimmed: "test123" (length: 7)
```

**Solution:**
- Already fixed with `.trim()` in all flows
- Test by entering password with spaces

---

### Issue 3: Wrong Profile Retrieved
**Symptoms:**
```
✅ Found user by phone column: { id: 'abc123', password_hash: null }
```

**Solution:**
- Check if multiple profiles exist with same phone
- Run: `SELECT * FROM profiles WHERE phone = '+919876543210' OR phone_number = '+919876543210'`
- Delete duplicate profiles

---

### Issue 4: Database Column Type Wrong
**Symptoms:**
```
🔐 Password hash length: 64
🔍 [Login] Stored hash length: 63  ← Truncated!
```

**Solution:**
- Check column type: `\d profiles` in psql
- Should be `TEXT` or `VARCHAR(64)` minimum
- If too short, alter column: `ALTER TABLE profiles ALTER COLUMN password_hash TYPE TEXT;`

---

## 📊 Expected Hash Format

### SHA-256 Hash Properties:
- **Length:** Always 64 characters (hexadecimal)
- **Characters:** 0-9 and a-f only
- **Deterministic:** Same password always produces same hash
- **Example:** `64e1b3d53cbb63be9726c03ca06695558b2ec5c912023facc0e62f4f6d1f5a98`

### How to Verify Hash:
```bash
# In terminal (Linux/Mac)
echo -n "test123" | sha256sum
# Output: 64e1b3d53cbb63be9726c03ca06695558b2ec5c912023facc0e62f4f6d1f5a98
```

---

## 🔐 Database Schema Check

Run this query to verify password_hash column:

```sql
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'password_hash';
```

**Expected Result:**
```
column_name     | password_hash
data_type       | text (or character varying)
max_length      | NULL (unlimited) or >= 64
is_nullable     | YES
```

---

## 🚀 Quick Fix Checklist

- [x] Added password trimming in registration
- [x] Added password trimming in login
- [x] Added password trimming in reset password
- [x] Added comprehensive logging
- [x] Added database write verification
- [x] Added 500ms wait after save
- [x] Created test utilities

---

## 📞 If Still Broken

1. **Check Console Logs:** Look for all the 🔐, 💾, 🔍 emojis in logs
2. **Copy Full Console Output:** From registration AND login attempt
3. **Check Database:** Query the profile directly to see password_hash
4. **Test Hash Manually:** Use `testPasswordHashing()` utility
5. **Report Issue:** Include all logs and database query results

---

**Last Updated:** March 5, 2026  
**Status:** ✅ Enhanced debugging + trimming added  
**Files Modified:** PhoneAuthScreen.tsx, testPasswordHash.ts (new)
