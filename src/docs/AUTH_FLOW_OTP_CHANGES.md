# Authentication Flow - OTP Usage Documentation

## Updated: March 5, 2026

## Overview
LocalFelo now uses OTP (via WhatsApp) **ONLY** for:
1. ✅ **New user registration**
2. ✅ **Forgot password flow**

OTP is **NO LONGER sent** for:
- ❌ Returning users logging in
- ❌ Legacy users without passwords (they must use forgot password)

---

## Flow Diagrams

### 1️⃣ NEW USER REGISTRATION
```
User enters phone → Check if phone exists in DB → Phone NOT found
                                                ↓
                                    📱 SEND OTP via WhatsApp
                                                ↓
                                    User verifies OTP
                                                ↓
                                    User enters name + password
                                                ↓
                                    Account created → Logged in
```

### 2️⃣ RETURNING USER LOGIN (with password)
```
User enters phone → Check if phone exists in DB → Phone found + has password_hash
                                                ↓
                                    🔒 Show password entry screen
                                    ❌ NO OTP SENT
                                                ↓
                                    User enters password
                                                ↓
                                    Password verified → Logged in
```

### 3️⃣ LEGACY USER (account exists but no password)
```
User enters phone → Check if phone exists in DB → Phone found + NO password_hash
                                                ↓
                                    🔒 Show password entry screen
                                    ❌ NO OTP SENT
                                                ↓
                                    Show error: "Your account needs a password.
                                                 Please use 'Forgot Password' to set one."
                                                ↓
                                    User clicks "Forgot Password"
                                                ↓
                                    📱 SEND OTP via WhatsApp (Forgot Password Flow)
```

### 4️⃣ FORGOT PASSWORD FLOW
```
User on password screen → Clicks "Forgot Password?" link
                                    ↓
                        📱 SEND OTP via WhatsApp
                                    ↓
                        User verifies OTP
                                    ↓
                        User sets new password
                                    ↓
                        Password updated → Logged in
```

---

## Code Changes Made

### File: `/screens/PhoneAuthScreen.tsx`

#### Change 1: Legacy User Handling (Lines 110-121)
**Before:**
```typescript
else if (profile && !profile.password_hash) {
  // LEGACY USER without password → Send OTP to set password
  console.log('⚠️ Legacy user without password - sending OTP');
  const result = await sendOTP(formatted.clean);
  setOtpSessionId(result.sessionId);
  setStep('verify-otp');
  toast.success('OTP sent! Check your SMS.');
}
```

**After:**
```typescript
else if (profile && !profile.password_hash) {
  // LEGACY USER without password → Show password screen with "Forgot Password" option
  // NO OTP sent - they must use "Forgot Password" flow to set password
  console.log('⚠️ Legacy user without password - showing password screen with forgot password option');
  setExistingProfile(profile);
  setIsNewUser(false);
  setStep('enter-password');
  setError('Your account needs a password. Please use "Forgot Password" to set one.');
  setLoading(false);
}
```

#### Change 2: Updated Toast Messages
- New registration: `'OTP sent via WhatsApp! Please check your messages.'`
- Forgot password: `'OTP sent via WhatsApp! Please check your messages.'`

### File: `/services/authPhone.ts`

#### Change 1: Enhanced Logging (Line 56-57)
**Added:**
```typescript
console.log('📞 Sending OTP via WhatsApp to:', formatted.display);
console.log('🎯 OTP Purpose: New registration or forgot password flow only');
```

---

## Testing Checklist

### ✅ Test Case 1: New User Registration
1. Enter a phone number that doesn't exist in the database
2. ✅ Verify OTP is sent via WhatsApp
3. Enter OTP code
4. ✅ Verify OTP is validated successfully
5. Enter name and password
6. ✅ Verify account is created and user is logged in

### ✅ Test Case 2: Returning User Login
1. Enter a phone number that exists with a password
2. ❌ Verify NO OTP is sent
3. ✅ Verify password entry screen is shown immediately
4. Enter correct password
5. ✅ Verify user is logged in

### ✅ Test Case 3: Returning User - Wrong Password
1. Enter a phone number that exists with a password
2. ❌ Verify NO OTP is sent
3. Enter incorrect password
4. ✅ Verify error message: "Incorrect password"
5. ✅ Verify "Forgot Password?" link is available

### ✅ Test Case 4: Legacy User (No Password)
1. Enter a phone number that exists WITHOUT a password
2. ❌ Verify NO OTP is sent
3. ✅ Verify password entry screen is shown
4. ✅ Verify error message: "Your account needs a password. Please use 'Forgot Password' to set one."
5. Click "Forgot Password?" link
6. ✅ Verify OTP is NOW sent via WhatsApp (entering forgot password flow)

### ✅ Test Case 5: Forgot Password Flow
1. Enter a phone number and click "Forgot Password?" link
2. ✅ Verify OTP is sent via WhatsApp
3. Enter OTP code
4. ✅ Verify OTP is validated successfully
5. Enter new password and confirm
6. ✅ Verify password is updated and user is logged in

---

## Edge Function Behavior

### `send-otp` Edge Function
- Called ONLY in 2 places:
  1. New user registration (after phone not found in DB)
  2. Forgot password flow (explicit user action)

### `verify-otp` Edge Function
- Called ONLY in 2 places:
  1. New user registration (after OTP sent)
  2. Forgot password flow (after OTP sent)

---

## Benefits of This Change

1. **Better UX**: Returning users can log in faster without waiting for OTP
2. **Reduced SMS/WhatsApp costs**: OTP only sent when necessary
3. **Security**: Still maintains OTP verification for:
   - New account creation (prevents fake registrations)
   - Password reset (proves phone ownership)
4. **Standard flow**: Matches common authentication patterns (like Gmail, Facebook, etc.)

---

## Database Requirements

For this flow to work correctly, the `profiles` table must have:
- ✅ `phone` or `phone_number` column (for phone lookup)
- ✅ `password_hash` column (to check if user has password)
- ✅ `client_token` column (for session management)

---

## Notes

- WhatsApp OTP uses 2Factor API via edge functions
- OTP expiration: 10 minutes (600 seconds)
- Password minimum length: 6 characters
- Phone format: 10 digits (Indian numbers with +91 prefix in DB)
