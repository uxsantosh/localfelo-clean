# 🚀 COMPLETE OTP AUTHENTICATION SYSTEM - DEPLOYMENT GUIDE

**Project:** LocalFelo - Indian Hyperlocal Marketplace  
**Date:** February 11, 2026  
**Status:** ✅ READY FOR DEPLOYMENT

---

## 📋 OVERVIEW

This guide implements **REAL phone OTP authentication** using 2Factor API, replacing the mock implementation while keeping the existing SMS notification system intact.

### What's Included:
1. ✅ Database migration (`otp_verifications` table)
2. ✅ Edge function: `send-otp` (send OTP via 2Factor)
3. ✅ Edge function: `verify-otp` (verify OTP and create/login user)
4. ✅ Frontend service: `/services/authPhone.ts` (replaces mock)
5. ✅ Deployment checklist and testing guide

### What's NOT Touched:
- ❌ **send-sms-notification** edge function (KEEP AS IS)
- ❌ **sms_notifications** table (KEEP AS IS)
- ❌ SMS notification triggers (chat, tasks) (KEEP AS IS)

---

## 🎯 ARCHITECTURE

### 2Factor API - Two Separate Services:

#### 1. **OTP API** (Authentication - NEW)
```
Endpoints:
- Send OTP: GET /API/V1/{apikey}/SMS/{phone}/AUTOGEN
- Verify OTP: GET /API/V1/{apikey}/SMS/VERIFY/{session_id}/{otp}

Purpose: User authentication (login/signup)
Used by: send-otp, verify-otp edge functions
Storage: otp_verifications table
```

#### 2. **Transactional SMS API** (Notifications - EXISTING)
```
Endpoint: POST /API/V1/{apikey}/ADDON_SERVICES/SEND/TSMS

Purpose: Post-action notifications (chat, tasks)
Used by: send-sms-notification edge function
Storage: sms_notifications table
```

---

## 📦 FILES CREATED

### Database
```
✅ /migrations/CREATE_OTP_SYSTEM.sql
   - Creates otp_verifications table
   - Adds indexes for performance
   - Includes cleanup function
   - Enables RLS (service role only)
```

### Edge Functions
```
✅ /supabase/functions/send-otp/index.ts
   - Sends OTP via 2Factor AUTOGEN API
   - Stores session in otp_verifications
   - Returns sessionId and isNewUser flag
   - Expires after 10 minutes

✅ /supabase/functions/verify-otp/index.ts
   - Verifies OTP with 2Factor
   - Creates new user or logs in existing
   - Generates Supabase auth session
   - Returns user data and tokens
   - Max 3 attempts per OTP
```

### Frontend Services
```
✅ /services/authPhone.ts
   - sendOTP(phone) - Sends OTP
   - verifyOTP(sessionId, otp, phone, name) - Verifies OTP
   - validatePhone(phone) - Validates format
   - formatPhone(phone) - Formats for display
   - getCurrentUser() - Gets current user
   - logout() - Logs out user
```

---

## 🔧 DEPLOYMENT STEPS

### STEP 1: Database Setup ✅

Run the migration in Supabase SQL Editor:

```bash
# 1. Open Supabase Dashboard
# 2. Go to: SQL Editor → New Query
# 3. Copy contents of: /migrations/CREATE_OTP_SYSTEM.sql
# 4. Click "Run"
```

**Verify table created:**
```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'otp_verifications'
ORDER BY ordinal_position;
```

**Expected output:**
```
table_name           | column_name              | data_type
---------------------|--------------------------|---------------------------
otp_verifications    | id                       | uuid
otp_verifications    | phone                    | character varying
otp_verifications    | session_id               | character varying
otp_verifications    | otp_hash                 | text
otp_verifications    | two_factor_session_id    | text
otp_verifications    | created_at               | timestamp with time zone
otp_verifications    | expires_at               | timestamp with time zone
otp_verifications    | verified                 | boolean
otp_verifications    | attempts                 | integer
otp_verifications    | max_attempts             | integer
```

---

### STEP 2: Configure 2Factor API Key ✅

```bash
# Set the 2Factor API key in Supabase secrets
# (Use the SAME key for both OTP and SMS notifications)

npx supabase secrets set TWOFACTOR_API_KEY=your_2factor_api_key_here
```

**To verify:**
```bash
npx supabase secrets list
```

Expected output:
```
TWOFACTOR_API_KEY=***************
SUPABASE_URL=***************
SUPABASE_SERVICE_ROLE_KEY=***************
```

---

### STEP 3: Deploy Edge Functions ✅

#### Deploy send-otp:
```bash
npx supabase functions deploy send-otp
```

**Expected output:**
```
✓ Deployed send-otp to https://your-project.supabase.co/functions/v1/send-otp
```

#### Deploy verify-otp:
```bash
npx supabase functions deploy verify-otp
```

**Expected output:**
```
✓ Deployed verify-otp to https://your-project.supabase.co/functions/v1/verify-otp
```

#### Verify send-sms-notification (Don't redeploy):
```bash
# Just check it exists - DON'T TOUCH IT
npx supabase functions list
```

**Expected output:**
```
send-otp                ✓ deployed
verify-otp              ✓ deployed
send-sms-notification   ✓ deployed  <-- Should already exist
send-push-notification  ✓ deployed  (optional)
```

---

### STEP 4: Update Frontend Code ✅

The frontend service `/services/authPhone.ts` has been created. Now you need to integrate it into your auth screens.

#### Integration Points:

**Option 1: Use in AuthScreen.tsx** (if adding OTP option to existing auth)
```typescript
import { sendOTP, verifyOTP } from '../services/authPhone';

// When user enters phone and clicks "Continue"
const sessionData = await sendOTP(phone);
// Store sessionData.sessionId for verification

// When user enters OTP
const result = await verifyOTP(sessionId, otp, phone, name);
// result.user contains user data
// result.isNewUser tells if it's a new user
```

**Option 2: Separate Phone Auth Screen** (recommended)
Create a new screen specifically for phone OTP authentication that uses:
- `sendOTP()` → Shows OTPVerificationScreen
- `verifyOTP()` → Logs in user

---

### STEP 5: Test OTP Flow ✅

#### Test New User Signup:
1. Enter phone number: `9876543210`
2. Click "Send OTP"
3. Check your SMS for OTP code
4. Enter OTP code
5. Enter your name (for new users)
6. Click "Verify"
7. ✅ Expected: User created in profiles table, logged in

#### Test Existing User Login:
1. Enter same phone number: `9876543210`
2. Click "Send OTP"
3. Check SMS for OTP
4. Enter OTP code
5. Click "Verify"
6. ✅ Expected: Logged in immediately (no name required)

#### Test Error Cases:
- Invalid phone: Should show "Invalid phone number format"
- Wrong OTP: Should show "Invalid OTP. 2 attempts remaining"
- Expired OTP (wait 10 minutes): Should show "OTP has expired"
- Max attempts (enter wrong OTP 3 times): Should show "Too many incorrect attempts"

---

### STEP 6: Verify SMS Notifications Still Work ✅

**Test these existing features to ensure nothing broke:**

#### Test Chat Message SMS:
1. User A creates a listing
2. User B starts a chat (first message)
3. ✅ Expected: User A receives SMS notification

#### Test Task Accepted SMS:
1. User A creates a task
2. User B accepts it
3. ✅ Expected: User A receives SMS notification

#### Test Task Cancelled SMS:
1. User cancels an accepted task
2. ✅ Expected: Other party receives SMS notification

#### Test Task Completed SMS:
1. Both parties confirm task completion
2. ✅ Expected: Both receive SMS notifications

---

## 🧪 TESTING GUIDE

### Manual Testing Checklist:

#### Database:
- [ ] `otp_verifications` table created
- [ ] Indexes created (phone, session_id, two_factor_session_id)
- [ ] RLS enabled
- [ ] `cleanup_expired_otps()` function exists

#### Edge Functions:
- [ ] `send-otp` deployed successfully
- [ ] `verify-otp` deployed successfully
- [ ] `send-sms-notification` still exists (not touched)
- [ ] `TWOFACTOR_API_KEY` secret set

#### OTP Authentication Flow:
- [ ] Send OTP to new user → OTP received via SMS
- [ ] Verify OTP for new user → User created, logged in
- [ ] Send OTP to existing user → OTP received
- [ ] Verify OTP for existing user → Logged in
- [ ] Invalid phone number → Error shown
- [ ] Wrong OTP → Attempts counter increments
- [ ] Max attempts exceeded → Session deleted
- [ ] Expired OTP → Session deleted

#### SMS Notifications (Existing):
- [ ] First chat message → SMS sent
- [ ] Task accepted → SMS sent
- [ ] Task cancelled → SMS sent
- [ ] Task completed → SMS sent

---

## 🔍 DEBUGGING

### Check OTP Sessions:
```sql
-- View active OTP sessions
SELECT * FROM otp_verifications
ORDER BY created_at DESC
LIMIT 10;

-- Count sessions by phone
SELECT phone, COUNT(*) 
FROM otp_verifications 
GROUP BY phone;

-- Find expired sessions
SELECT * FROM otp_verifications
WHERE expires_at < NOW();
```

### Check Edge Function Logs:
```bash
# View send-otp logs
npx supabase functions logs send-otp

# View verify-otp logs
npx supabase functions logs verify-otp
```

### Test Edge Functions Directly:

#### Test send-otp:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"phone":"9876543210"}'
```

Expected response:
```json
{
  "success": true,
  "sessionId": "session_1234567890_abc123",
  "twoFactorSessionId": "12345678-1234-1234-1234-123456789012",
  "isNewUser": true,
  "message": "OTP sent successfully. Check your SMS.",
  "expiresIn": 600
}
```

#### Test verify-otp:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "sessionId": "session_1234567890_abc123",
    "otp": "123456",
    "phone": "9876543210",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "isNewUser": true,
  "user": {
    "id": "uuid-here",
    "phone": "+919876543210",
    "name": "Test User",
    "clientToken": "token_xxx"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "xxx"
}
```

---

## 🚨 TROUBLESHOOTING

### Issue: "TWOFACTOR_API_KEY not configured"
**Solution:** Set the secret:
```bash
npx supabase secrets set TWOFACTOR_API_KEY=your_key
```

### Issue: "Failed to send OTP"
**Possible causes:**
1. Invalid 2Factor API key
2. Insufficient balance in 2Factor account
3. Invalid phone number format

**Check:**
```bash
# Test 2Factor API directly
curl "https://2factor.in/API/V1/YOUR_API_KEY/SMS/9876543210/AUTOGEN"
```

### Issue: "Invalid or expired OTP session"
**Possible causes:**
1. Session expired (10 minutes)
2. Session already used
3. Max attempts exceeded

**Fix:** Request new OTP

### Issue: "OTP verifications table not found"
**Solution:** Run the migration:
```sql
-- Copy and run /migrations/CREATE_OTP_SYSTEM.sql
```

### Issue: SMS notifications stopped working
**Possible causes:**
1. Accidentally modified send-sms-notification function
2. Database triggers removed
3. API key changed

**Check:**
```bash
# Verify send-sms-notification still exists
npx supabase functions list

# Check database triggers
SELECT * FROM information_schema.triggers 
WHERE event_object_table IN ('conversations', 'tasks');
```

---

## 📊 DATABASE SCHEMA

### otp_verifications Table:
```sql
Column                  | Type                        | Nullable
------------------------|-----------------------------|---------
id                      | uuid                        | NOT NULL
phone                   | varchar(20)                 | NOT NULL
session_id              | varchar(100)                | NOT NULL
otp_hash                | text                        | NULL
two_factor_session_id   | text                        | NULL
created_at              | timestamp with time zone    | NOT NULL
expires_at              | timestamp with time zone    | NOT NULL
verified                | boolean                     | NOT NULL
attempts                | integer                     | NOT NULL
max_attempts            | integer                     | NOT NULL

Indexes:
- idx_otp_phone (phone)
- idx_otp_session_id (session_id) UNIQUE
- idx_otp_two_factor_session (two_factor_session_id)
- idx_otp_expires_at (expires_at)

RLS: ENABLED (service role only)
```

---

## ✅ SUCCESS CRITERIA

After deployment, verify:

1. ✅ Database:
   - otp_verifications table exists
   - All indexes created
   - RLS enabled

2. ✅ Edge Functions:
   - send-otp deployed
   - verify-otp deployed
   - send-sms-notification untouched

3. ✅ Authentication:
   - New users can sign up via OTP
   - Existing users can log in via OTP
   - Sessions expire after 10 minutes
   - Max 3 attempts enforced

4. ✅ SMS Notifications (Unchanged):
   - Chat messages trigger SMS
   - Task actions trigger SMS
   - All existing triggers work

---

## 🎉 DEPLOYMENT COMPLETE!

Once all steps are completed and tested:

1. ✅ Real OTP authentication working
2. ✅ 2Factor API integration complete
3. ✅ Database schema created
4. ✅ Edge functions deployed
5. ✅ Frontend service ready
6. ✅ Existing SMS notifications preserved

**LocalFelo now has enterprise-grade phone OTP authentication! 🚀**

---

## 📞 SUPPORT

If you encounter issues:

1. Check edge function logs: `npx supabase functions logs [function-name]`
2. Verify database table: `SELECT * FROM otp_verifications LIMIT 5;`
3. Test 2Factor API directly: Check balance and API status
4. Review this guide's troubleshooting section

---

## 🔜 OPTIONAL ENHANCEMENTS

### Rate Limiting:
Add rate limiting to prevent OTP spam:
```sql
-- Limit 3 OTP requests per phone per hour
SELECT COUNT(*) FROM otp_verifications 
WHERE phone = '+919876543210' 
AND created_at > NOW() - INTERVAL '1 hour';
```

### Analytics:
Track OTP success rate:
```sql
-- OTP verification success rate
SELECT 
  COUNT(*) FILTER (WHERE verified = true) as successful,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE verified = true) / COUNT(*), 2) as success_rate
FROM otp_verifications
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Auto-cleanup Cron Job:
```sql
-- Run cleanup function daily
SELECT cron.schedule(
  'cleanup-expired-otps',
  '0 0 * * *', -- Daily at midnight
  $$SELECT cleanup_expired_otps()$$
);
```

---

**END OF DEPLOYMENT GUIDE**
