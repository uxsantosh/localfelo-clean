# OTP Send Locations - Code Reference

## 📍 Exact Locations Where `sendOTP()` is Called

### ✅ Location 1: New User Registration
**File:** `/screens/PhoneAuthScreen.tsx`  
**Line:** ~122  
**Function:** `handlePhoneContinue()`  
**Condition:** Phone number NOT found in database

```typescript
// Line 119-127
} else {
  // NEW USER → Send OTP for verification (ONLY place for new registration OTP)
  console.log('🆕 New user - sending OTP for registration');
  const result = await sendOTP(formatted.clean);
  setOtpSessionId(result.sessionId);
  setIsNewUser(true);
  setStep('verify-otp');
  setLoading(false);
  toast.success('OTP sent via WhatsApp! Please check your messages.');
}
```

**When it triggers:**
- User enters phone number
- Phone NOT found in `profiles` table
- User has never registered before

---

### ✅ Location 2: Forgot Password Flow
**File:** `/screens/PhoneAuthScreen.tsx`  
**Line:** ~460  
**Function:** `handleForgotPassword()`  
**Condition:** User clicks "Forgot Password?" link

```typescript
// Line 457-469
const handleForgotPassword = async () => {
  setError('');
  setLoading(true);

  try {
    const formatted = formatPhone(phone);
    const result = await sendOTP(formatted.clean);
    setOtpSessionId(result.sessionId);
    setStep('forgot-password-otp');
    setLoading(false);
    toast.success('OTP sent via WhatsApp! Please check your messages.');
  } catch (err: any) {
    setError(err.message || 'Failed to send OTP');
    setLoading(false);
  }
};
```

**When it triggers:**
- User is on password entry screen
- User clicks "Forgot Password?" link
- Applies to any user (new, returning, or legacy)

---

### ✅ Location 3: OTP Resend (During Verification)
**File:** `/screens/PhoneAuthScreen.tsx`  
**Line:** ~168  
**Function:** `handleOTPResend()`  
**Condition:** User clicks "Resend OTP" during verification

```typescript
// Line 166-171
const handleOTPResend = async () => {
  const formatted = formatPhone(phone);
  const result = await sendOTP(formatted.clean);
  setOtpSessionId(result.sessionId);
  toast.success('New OTP sent!');
};
```

**When it triggers:**
- User is on OTP verification screen
- OTP expired or not received
- User clicks "Resend OTP" button
- **Note:** This is a helper function for locations 1 & 2 above

---

## ❌ Locations Where OTP is NO LONGER Sent

### ❌ Removed Location 1: Legacy User (OLD CODE)
**File:** `/screens/PhoneAuthScreen.tsx`  
**Line:** ~110-121 (REMOVED in current version)  
**Previous behavior:** Send OTP to legacy users without passwords

**OLD CODE (Removed):**
```typescript
} else if (profile && !profile.password_hash) {
  // LEGACY USER without password → Send OTP to set password
  console.log('⚠️ Legacy user without password - sending OTP');
  setExistingProfile(profile);
  setIsNewUser(false);
  
  // Send OTP ← THIS WAS REMOVED
  const result = await sendOTP(formatted.clean);
  setOtpSessionId(result.sessionId);
  setStep('verify-otp');
  setLoading(false);
  toast.success('OTP sent! Check your SMS.');
}
```

**NEW CODE (Current):**
```typescript
} else if (profile && !profile.password_hash) {
  // LEGACY USER without password → Show password screen with "Forgot Password" option
  // NO OTP sent - they must use "Forgot Password" flow to set password
  console.log('⚠️ Legacy user without password - showing password screen with forgot password option');
  setExistingProfile(profile);
  setIsNewUser(false);
  setStep('enter-password');
  setError('Your account needs a password. Please use "Forgot Password" to set one.');
  setLoading(false);
  // ← NO sendOTP() call here anymore!
}
```

**Why removed:**
- Legacy users should explicitly use "Forgot Password" flow
- Prevents unsolicited OTP messages
- Makes flow more predictable

---

## 📊 Summary Table

| Location | File | Line | Function | Scenario | OTP Sent? |
|----------|------|------|----------|----------|-----------|
| 1 | PhoneAuthScreen.tsx | ~122 | handlePhoneContinue() | New user registration | ✅ YES |
| 2 | PhoneAuthScreen.tsx | ~460 | handleForgotPassword() | Forgot password | ✅ YES |
| 3 | PhoneAuthScreen.tsx | ~168 | handleOTPResend() | Resend during verification | ✅ YES |
| 4 | PhoneAuthScreen.tsx | ~104-109 | handlePhoneContinue() | Returning user login | ❌ NO |
| 5 | PhoneAuthScreen.tsx | ~110-118 | handlePhoneContinue() | Legacy user (no pwd) | ❌ NO (Changed) |

---

## 🔍 How to Verify OTP Sends

### Method 1: Check Console Logs
When `sendOTP()` is called, you'll see:
```
📞 Sending OTP via WhatsApp to: +91 98765 43210
🎯 OTP Purpose: New registration or forgot password flow only
```

### Method 2: Check Toast Messages
When OTP is sent, user sees:
```
✅ "OTP sent via WhatsApp! Please check your messages."
```

### Method 3: Check Network Tab
Look for API call to:
```
POST /functions/v1/send-otp
Body: { phone: "9876543210" }
```

---

## 🧪 Test Commands

### Test New User (Should send OTP):
```bash
# Phone: 9999999999 (not in database)
# Expected: OTP sent ✅
```

### Test Returning User (Should NOT send OTP):
```bash
# Phone: 9876543210 (in database, has password)
# Expected: NO OTP, show password screen ✅
```

### Test Forgot Password (Should send OTP):
```bash
# Any phone number
# Click "Forgot Password?"
# Expected: OTP sent ✅
```

---

## 📝 Edge Function Called

### Function Name: `send-otp`
**Location:** Supabase Edge Functions  
**Endpoint:** `/functions/v1/send-otp`  
**Method:** POST

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_abc123...",
  "isNewUser": true,
  "expiresIn": 600
}
```

---

## 🔐 Security Checks

Each `sendOTP()` call:
1. ✅ Validates phone format (10 digits)
2. ✅ Formats to +91 prefix
3. ✅ Creates session ID for verification
4. ✅ Sets 10-minute expiration
5. ✅ Sends via WhatsApp (2Factor API)
6. ✅ Logs purpose for auditing

---

## 📱 WhatsApp Message Format

When OTP is sent, user receives:
```
Your OTP for LocalFelo is: 123456
Valid for 10 minutes.
Do not share this code with anyone.
```

---

## 🎯 Quick Reference

**Want to find where OTP is sent?**
```bash
# Search codebase
grep -r "sendOTP" /screens
grep -r "send-otp" /services
```

**Want to add logging?**
```typescript
// Before sendOTP call
console.log('🔍 About to send OTP for:', scenario);
const result = await sendOTP(phone);
console.log('✅ OTP sent, sessionId:', result.sessionId);
```

---

**Last Updated:** March 5, 2026  
**Maintained By:** LocalFelo Dev Team  
**Total OTP Send Locations:** 3 (New User, Forgot Password, Resend)
