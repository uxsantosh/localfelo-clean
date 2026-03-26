# 🚀 WHATSAPP OTP MIGRATION - QUICK REFERENCE

## ✅ FILES MODIFIED (2 files only)

1. `/supabase/functions/send-otp/index.ts`
2. `/supabase/functions/verify-otp/index.ts`

---

## 📝 WHAT CHANGED

### send-otp/index.ts
```diff
- SMS Endpoint (GET):
- https://2factor.in/API/V1/{KEY}/SMS/{phone}/AUTOGEN

+ WhatsApp Endpoint (POST):
+ https://2factor.in/API/V1/{KEY}/ADDON_SERVICES/SEND/TSMS
+ Body: { "From": phone }

- Message: "Check your SMS"
+ Message: "Check your WhatsApp"
```

### verify-otp/index.ts
```diff
- SMS Verify Endpoint:
- /SMS/VERIFY/{sessionId}/{otp}

+ WhatsApp Verify Endpoint:
+ /ADDON_SERVICES/VERIFY/{sessionId}/{otp}
```

---

## 🚀 DEPLOY NOW

```bash
# Deploy both functions
npx supabase functions deploy send-otp
npx supabase functions deploy verify-otp

# Verify deployment
npx supabase functions list
```

---

## ✅ NO CHANGES NEEDED FOR:

- ❌ Frontend code
- ❌ UI/UX
- ❌ Database schema
- ❌ Environment variables
- ❌ API contracts
- ❌ Auth flows
- ❌ Supabase config

---

## 🧪 TEST IMMEDIATELY AFTER DEPLOY

### 1. Test Send OTP
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/send-otp \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone":"YOUR-TEST-NUMBER"}'
```

**Expected:** WhatsApp OTP received

### 2. Test Verify OTP
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/verify-otp \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-FROM-ABOVE",
    "otp": "OTP-FROM-WHATSAPP",
    "phone": "YOUR-TEST-NUMBER",
    "name": "Test User"
  }'
```

**Expected:** Success response with tokens

### 3. Test Full Flow in App
- [ ] New user signup (phone → WhatsApp OTP → verify → set password)
- [ ] Existing user login (phone + password, no OTP)
- [ ] Forgot password (phone → WhatsApp OTP → verify → reset password)

---

## ⚠️ IMPORTANT: 2FACTOR ACCOUNT REQUIREMENT

**Your 2Factor account MUST have WhatsApp OTP addon enabled.**

Check: Login to https://2factor.in/dashboard and verify "WhatsApp OTP" is active.

If not enabled, contact 2Factor support: support@2factor.in

---

## 🐛 TROUBLESHOOTING

### WhatsApp OTP not received?
1. Check 2Factor dashboard - is WhatsApp addon active?
2. Is phone number registered on WhatsApp?
3. Check Edge Function logs: `npx supabase functions logs send-otp`

### Verification failing?
1. Check session ID matches between send and verify
2. OTP expires in 10 minutes - request new if expired
3. Max 3 attempts - request new OTP if exceeded
4. Check Edge Function logs: `npx supabase functions logs verify-otp`

---

## 🔄 ROLLBACK (if needed)

If issues arise, rollback takes < 5 minutes:

**send-otp/index.ts (line 60-61):**
```typescript
// Change this:
const otpUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/ADDON_SERVICES/SEND/TSMS`;

// Back to this:
const otpUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/${phone}/AUTOGEN`;

// And change method from POST to GET, remove body
```

**verify-otp/index.ts (line 94):**
```typescript
// Change this:
const verifyUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/ADDON_SERVICES/VERIFY/${sessionId}/${otp}`;

// Back to this:
const verifyUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/VERIFY/${sessionId}/${otp}`;
```

Then redeploy both functions.

---

## ✅ CONFIRMATION CHECKLIST

Before considering migration complete:

- [ ] Both Edge Functions deployed successfully
- [ ] Test phone receives WhatsApp OTP
- [ ] OTP verification works
- [ ] New user signup flow works
- [ ] Existing user login works (phone + password)
- [ ] Forgot password flow works
- [ ] Frontend shows no errors
- [ ] Supabase logs show successful auth
- [ ] No breaking changes observed

---

## 📊 MONITORING (First 24 Hours)

Watch these metrics:
1. OTP delivery rate (2Factor dashboard)
2. Verification success rate (Supabase logs)
3. User complaints/support tickets
4. Edge Function error rates

---

## 📚 FULL DOCUMENTATION

See `/SMS_TO_WHATSAPP_OTP_MIGRATION.md` for complete details.

---

**Migration Status:** ✅ READY TO DEPLOY

**Estimated Deployment Time:** 5 minutes  
**Risk Level:** Low  
**Rollback Time:** < 5 minutes  
**Downtime:** None
