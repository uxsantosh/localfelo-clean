# 2Factor API Changes: SMS → WhatsApp OTP

## SEND OTP API CHANGE

### ❌ OLD (SMS)
```typescript
// Method: GET
// No request body

const otpUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/${phone}/AUTOGEN`;

const otpResponse = await fetch(otpUrl);
const otpData = await otpResponse.json();

// Response:
// {
//   "Status": "Success",
//   "Details": "<session-id>"
// }
```

### ✅ NEW (WhatsApp)
```typescript
// Method: POST
// Request body: { "From": phone }

const otpUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/ADDON_SERVICES/SEND/TSMS`;

const otpResponse = await fetch(otpUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    From: phone, // 10-digit phone number
  }),
});

const otpData = await otpResponse.json();

// Response (SAME):
// {
//   "Status": "Success",
//   "Details": "<session-id>"
// }
```

---

## VERIFY OTP API CHANGE

### ❌ OLD (SMS)
```typescript
// Method: GET
// Endpoint: /SMS/VERIFY/

const verifyUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/VERIFY/${sessionId}/${otp}`;

const verifyResponse = await fetch(verifyUrl);
const verifyData = await verifyResponse.json();

// Response:
// {
//   "Status": "Success",
//   "Details": "OTP matched"
// }
```

### ✅ NEW (WhatsApp)
```typescript
// Method: GET (same)
// Endpoint: /ADDON_SERVICES/VERIFY/

const verifyUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/ADDON_SERVICES/VERIFY/${sessionId}/${otp}`;

const verifyResponse = await fetch(verifyUrl);
const verifyData = await verifyResponse.json();

// Response (SAME):
// {
//   "Status": "Success",
//   "Details": "OTP matched"
// }
```

---

## SIDE-BY-SIDE COMPARISON

| Aspect | SMS OTP | WhatsApp OTP |
|--------|---------|--------------|
| **Send Endpoint** | `/SMS/{phone}/AUTOGEN` | `/ADDON_SERVICES/SEND/TSMS` |
| **Send Method** | GET | POST |
| **Send Body** | None | `{ "From": phone }` |
| **Verify Endpoint** | `/SMS/VERIFY/{sid}/{otp}` | `/ADDON_SERVICES/VERIFY/{sid}/{otp}` |
| **Verify Method** | GET | GET |
| **Response Format** | Same | Same |
| **Session ID** | Same | Same |
| **OTP Length** | 6 digits | 6 digits |
| **Expiry Time** | 10 minutes | 10 minutes |
| **Max Attempts** | 3 | 3 |

---

## RESPONSE STRUCTURE (UNCHANGED)

Both SMS and WhatsApp use the same response format:

### Success Response
```json
{
  "Status": "Success",
  "Details": "<session-id or success message>"
}
```

### Error Response
```json
{
  "Status": "Error",
  "Details": "<error message>"
}
```

---

## FRONTEND IMPACT: NONE

The Edge Functions maintain the same contract with frontend:

### Send OTP Request (Frontend → Edge Function)
```typescript
// UNCHANGED
POST /functions/v1/send-otp
{
  "phone": "9876543210"
}
```

### Send OTP Response (Edge Function → Frontend)
```typescript
// UNCHANGED
{
  "success": true,
  "sessionId": "session_...",
  "twoFactorSessionId": "...",
  "isNewUser": true,
  "message": "OTP sent successfully. Check your WhatsApp.", // Only this changed
  "expiresIn": 600
}
```

### Verify OTP Request (Frontend → Edge Function)
```typescript
// UNCHANGED
POST /functions/v1/verify-otp
{
  "sessionId": "session_...",
  "otp": "123456",
  "phone": "9876543210",
  "name": "Test User"
}
```

### Verify OTP Response (Edge Function → Frontend)
```typescript
// UNCHANGED
{
  "success": true,
  "isNewUser": true,
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

## WHAT CHANGES FOR USERS?

**Before (SMS):**
User receives 6-digit OTP via SMS text message

**After (WhatsApp):**
User receives 6-digit OTP via WhatsApp message

**Everything else:** IDENTICAL
- Same OTP format (6 digits)
- Same expiry time (10 minutes)
- Same max attempts (3)
- Same user experience in app
- Same error messages (client-side)
- Same success flows

---

## 2FACTOR ACCOUNT REQUIREMENTS

### For SMS OTP:
- Basic 2Factor account
- SMS credits

### For WhatsApp OTP:
- 2Factor account with WhatsApp addon enabled
- WhatsApp OTP credits

**Note:** Contact 2Factor support to enable WhatsApp OTP addon on your account.

---

## COST COMPARISON

Check current 2Factor pricing at https://2factor.in/pricing

Typically:
- SMS OTP: ~₹0.20 per OTP
- WhatsApp OTP: ~₹0.30-0.40 per OTP

*Prices may vary, check with 2Factor for latest rates.*

---

## TESTING BOTH APIS (for verification)

### Test SMS OTP (old)
```bash
# Send SMS OTP
curl "https://2factor.in/API/V1/YOUR-API-KEY/SMS/9876543210/AUTOGEN"

# Verify SMS OTP
curl "https://2factor.in/API/V1/YOUR-API-KEY/SMS/VERIFY/SESSION-ID/123456"
```

### Test WhatsApp OTP (new)
```bash
# Send WhatsApp OTP
curl -X POST "https://2factor.in/API/V1/YOUR-API-KEY/ADDON_SERVICES/SEND/TSMS" \
  -H "Content-Type: application/json" \
  -d '{"From":"9876543210"}'

# Verify WhatsApp OTP
curl "https://2factor.in/API/V1/YOUR-API-KEY/ADDON_SERVICES/VERIFY/SESSION-ID/123456"
```

---

## SUMMARY

### Changed
1. ✅ 2Factor API endpoint URLs
2. ✅ HTTP method for send (GET → POST)
3. ✅ Request body structure for send
4. ✅ User receives OTP via WhatsApp instead of SMS

### Unchanged
1. ✅ Response structures
2. ✅ Session ID handling
3. ✅ Edge Function names
4. ✅ Frontend API contracts
5. ✅ Database schema
6. ✅ Auth flows
7. ✅ User experience (except delivery channel)

**Migration Complexity:** ⭐ Minimal (2 endpoint changes only)
