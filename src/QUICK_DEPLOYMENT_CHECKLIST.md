# ⚡ QUICK DEPLOYMENT CHECKLIST - OTP System

## 🚀 5-MINUTE DEPLOYMENT

### 1️⃣ DATABASE (2 minutes)
```bash
# Open Supabase Dashboard → SQL Editor
# Copy /migrations/CREATE_OTP_SYSTEM.sql
# Paste and Run
```

✅ Verify: Table `otp_verifications` created

---

### 2️⃣ SET SECRET (30 seconds)
```bash
npx supabase secrets set TWOFACTOR_API_KEY=your_2factor_api_key
```

✅ Verify: `npx supabase secrets list` shows TWOFACTOR_API_KEY

---

### 3️⃣ DEPLOY EDGE FUNCTIONS (1 minute)
```bash
npx supabase functions deploy send-otp
npx supabase functions deploy verify-otp
```

✅ Verify: Both functions deployed successfully

---

### 4️⃣ TEST OTP FLOW (2 minutes)
1. Send OTP to your phone
2. Receive SMS
3. Verify OTP
4. Check user created in profiles table

✅ Verify: User logged in successfully

---

### 5️⃣ VERIFY SMS NOTIFICATIONS STILL WORK
1. Test chat message → SMS sent ✅
2. Test task accepted → SMS sent ✅

---

## 📂 FILES REFERENCE

### Created Files:
- `/migrations/CREATE_OTP_SYSTEM.sql` - Database migration
- `/supabase/functions/send-otp/index.ts` - Send OTP edge function
- `/supabase/functions/verify-otp/index.ts` - Verify OTP edge function
- `/services/authPhone.ts` - Frontend service
- `/COMPLETE_OTP_SYSTEM_DEPLOYMENT.md` - Full guide
- `/QUICK_DEPLOYMENT_CHECKLIST.md` - This file

### Don't Touch:
- ❌ `/supabase/functions/send-sms-notification/` - Existing SMS notifications
- ❌ `/migrations/ADD_SMS_NOTIFICATIONS_SYSTEM.sql` - Existing migration
- ❌ `/services/smsNotifications.ts` - Existing service

---

## 🧪 TEST COMMANDS

### Test send-otp:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"phone":"9876543210"}'
```

### Test verify-otp:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"sessionId":"session_xxx","otp":"123456","phone":"9876543210","name":"Test User"}'
```

### Check database:
```sql
SELECT * FROM otp_verifications ORDER BY created_at DESC LIMIT 5;
```

---

## 🐛 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| "API key not configured" | Run: `npx supabase secrets set TWOFACTOR_API_KEY=your_key` |
| "Failed to send OTP" | Check 2Factor balance and API key |
| "Table not found" | Run migration: `/migrations/CREATE_OTP_SYSTEM.sql` |
| "Function not found" | Deploy: `npx supabase functions deploy send-otp` |

---

## ✅ SUCCESS CHECKLIST

- [ ] Database table created
- [ ] Secret configured
- [ ] send-otp deployed
- [ ] verify-otp deployed
- [ ] OTP received via SMS
- [ ] OTP verified successfully
- [ ] User created/logged in
- [ ] SMS notifications still working

---

## 📞 INTEGRATION EXAMPLE

```typescript
import { sendOTP, verifyOTP } from './services/authPhone';

// Step 1: Send OTP
const { sessionId, isNewUser } = await sendOTP('9876543210');

// Step 2: Verify OTP
const result = await verifyOTP(sessionId, '123456', '9876543210', 'John Doe');

// Step 3: User is logged in
console.log(result.user); // User data
console.log(result.isNewUser); // true/false
```

---

**🎉 DEPLOYMENT COMPLETE!**

Full documentation: `/COMPLETE_OTP_SYSTEM_DEPLOYMENT.md`
