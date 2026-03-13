# Password Authentication - Quick Testing Reference

## 🎯 Test Scenario: Register → Login

### Expected Flow:
```
1. Register new user with password "test123"
   ✅ OTP sent
   ✅ OTP verified
   ✅ Name + password entered
   ✅ Account created
   ✅ Logged in automatically

2. Logout

3. Login with same phone + password "test123"
   ✅ Phone found in DB
   ✅ Password screen shown (NO OTP)
   ✅ Password entered: "test123"
   ✅ Password verified
   ✅ Logged in successfully
```

---

## 🔍 Console Logs to Watch

### During Registration:
```
✅ OTP sent via WhatsApp! Please check your messages.
✅ OTP verified successfully
🔐 Password entered: "test123" (length: 7)
🔐 Password hash generated: 64e1b3d53c... (length: 64)
💾 [Registration] Saving password hash to database...
✅ Password hash saved successfully to database!
✅ VERIFICATION: Hashes match? YES ✅
🎉 Account created successfully!
```

### During Login:
```
🔍 Checking phone: +919876543210
✅ Found user by phone column
🔍 Password hash present? YES
🔐 [Login] Password entered: "test123" (length: 7)
🔐 [Login] Stored hash from DB: 64e1b3d53c...
🔐 [Login] Password verification result: VALID ✅
✅ Supabase session created successfully!
Welcome back!
```

---

## ❌ Error Scenarios

### Scenario 1: Hash Not Saved
```
💾 [Registration] Saving password hash to database...
❌ Failed to add password to profile: [error details]
```
**Fix:** Check database permissions and column exists

---

### Scenario 2: Hash Not Found
```
🔍 Checking phone: +919876543210
✅ Found user by phone column
🔍 Password hash present? NO
```
**Fix:** Hash wasn't saved during registration - check logs

---

### Scenario 3: Wrong Password
```
🔐 [Login] Password entered: "test456" (length: 7)
🔐 [Login] Password verification result: INVALID ❌
Incorrect password
```
**Expected:** This is correct behavior for wrong password

---

### Scenario 4: Whitespace Issue
```
🔐 Password entered: "test123 " (length: 8)  ← Space!
🔐 Password trimmed: "test123" (length: 7)   ← Fixed!
```
**Status:** Auto-fixed by trim() function

---

## 🧪 Manual Tests

### Test 1: Basic Registration & Login
```
Phone: 9999999999 (not in DB)
Password: test123
Expected: ✅ Register → ✅ Login
```

### Test 2: Password with Spaces
```
Phone: 8888888888 (not in DB)
Password: " test123 " (with spaces)
Expected: ✅ Register → ✅ Login (trimmed)
```

### Test 3: Wrong Password
```
Phone: 9999999999 (in DB)
Password: wrong123
Expected: ❌ "Incorrect password"
```

### Test 4: Case Sensitive
```
Register: "Test123"
Login: "test123"
Expected: ❌ "Incorrect password" (case matters)
```

---

## 🔧 Debugging Commands

### Check if Hash Saved:
```sql
SELECT id, phone, 
       password_hash IS NOT NULL as has_password,
       LENGTH(password_hash) as hash_length
FROM profiles
WHERE phone = '+919876543210';
```

### Expected Result:
```
id          | abc-123-def
phone       | +919876543210
has_password| true
hash_length | 64
```

### Get Full Hash:
```sql
SELECT password_hash 
FROM profiles 
WHERE phone = '+919876543210';
```

### Count Profiles with Same Phone:
```sql
SELECT COUNT(*) 
FROM profiles 
WHERE phone = '+919876543210' OR phone_number = '+919876543210';
```
**Expected:** 1 (should not have duplicates)

---

## 📊 Hash Verification

### Generate Hash Manually:
```javascript
// In browser console
import { hashPassword } from './utils/passwordHash';
const hash = await hashPassword('test123');
console.log(hash);
// Output: 64e1b3d53cbb63be9726c03ca06695558b2ec5c912023facc0e62f4f6d1f5a98
```

### Verify Hash Matches:
```javascript
import { verifyPassword } from './utils/passwordHash';
const isValid = await verifyPassword('test123', 'stored_hash_from_db');
console.log(isValid); // Should be true
```

---

## 🎯 Quick Diagnosis

| Symptom | Likely Cause | Check |
|---------|--------------|-------|
| "Incorrect password" on first login | Hash not saved | Console logs during registration |
| "Incorrect password" always | Wrong password or whitespace | Try exact password used in registration |
| No password screen shown | Profile not found | Check phone number format in DB |
| Hash length not 64 | Database column too short | Check column type in schema |
| Multiple profiles found | Duplicate accounts | Query DB for phone number |

---

## ✅ Success Indicators

### Registration Success:
- [x] OTP sent and verified
- [x] Password hash logged (64 chars)
- [x] Hash saved to database
- [x] Verification shows hash matches
- [x] User logged in automatically

### Login Success:
- [x] Phone found in database
- [x] Password hash present in profile
- [x] Hash length = 64
- [x] Password verification = VALID ✅
- [x] User logged in successfully

---

## 🚨 Red Flags

- ❌ Hash length != 64
- ❌ Hash present? NO (after registration)
- ❌ Verification: Hashes match? NO
- ❌ Multiple profiles with same phone
- ❌ Password includes whitespace
- ❌ Console errors during hash save

---

## 📱 Testing on Mobile App

### Android (Capacitor):
```bash
# View logs
npx cap run android --livereload

# Filter for password logs
adb logcat | grep "🔐"
```

### Watch for:
- Session persistence logs
- Password hash logs
- Storage writes

---

## 🔄 Test Flow Diagram

```
┌──────────────────┐
│ Enter Phone      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ New User?        │
└────────┬─────────┘
         │
         ▼ YES
┌──────────────────┐
│ Send OTP         │ ← OTP SENT ✅
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Verify OTP       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Enter Name +     │
│ Password         │ ← Hash password with trim()
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Save Hash to DB  │ ← Check logs here!
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Verify Hash      │ ← Must match!
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Logged In ✅     │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ LOGOUT           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Enter Phone      │ ← Same phone
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Found in DB ✅   │ ← NO OTP
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Enter Password   │ ← Same password
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Verify Hash      │ ← Trim + compare
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Logged In ✅     │
└──────────────────┘
```

---

**Last Updated:** March 5, 2026  
**Quick Reference Version:** 1.0  
**Print This:** Keep handy for testing!
