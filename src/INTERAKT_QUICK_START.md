# ⚡ Interakt WhatsApp - Quick Start Guide

Follow these simple steps to get WhatsApp notifications working.

---

## 🎯 Step 1: Get Interakt API Key (5 minutes)

1. **Login to Interakt Dashboard**
   - Go to: https://app.interakt.ai/
   - Login with your credentials

2. **Get API Key**
   - Click on **Settings** (gear icon in sidebar)
   - Go to **API** section
   - Copy your **Basic Auth Key**
   - It looks like: `YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo6`

3. **Note down the key** - You'll need it in Step 3

---

## 🎯 Step 2: Create WhatsApp Templates (15 minutes)

In Interakt Dashboard, go to **Templates** → **Create New Template**

Create these 9 templates:

### ✅ 1. task_accepted
**Template Name:** `task_accepted`
**Language:** English
**Category:** UTILITY

**Message:**
```
Hi {{1}}, 

Great news! {{2}} has accepted your task "{{3}}" for {{4}}.

You can now chat with them on LocalFelo to coordinate details.

- LocalFelo Team
```

**Variable Names:** customer_name, helper_name, task_title, task_price

---

### ✅ 2. task_cancelled
**Template Name:** `task_cancelled`

**Message:**
```
Hi {{1}},

The task "{{2}}" has been cancelled by {{3}}.

You can post a new task or browse other helpers on LocalFelo.

- LocalFelo Team
```

**Variable Names:** customer_name, task_title, cancelled_by

---

### ✅ 3. task_completed
**Template Name:** `task_completed`

**Message:**
```
Hi {{1}},

🎉 Your task "{{3}}" has been completed by {{2}}!

Payment: {{4}}

Please rate your experience on LocalFelo.

- LocalFelo Team
```

**Variable Names:** customer_name, helper_name, task_title, task_price

---

### ✅ 4. first_message
**Template Name:** `first_message`

**Message:**
```
Hi {{1}},

{{2}} sent you a message about your {{5}} "{{3}}":

"{{4}}"

Reply now on LocalFelo!

- LocalFelo Team
```

**Variable Names:** customer_name, sender_name, listing_title, message_preview, listing_type

---

### ✅ 5. message_after_gap
**Template Name:** `message_after_gap`

**Message:**
```
Hi {{1}},

{{2}} sent you a new message about "{{3}}":

"{{4}}"

Check your messages on LocalFelo!

- LocalFelo Team
```

**Variable Names:** customer_name, sender_name, listing_title, message_preview

---

### ✅ 6. otp_verification
**Template Name:** `otp_verification`

**Message:**
```
Hi {{1}},

Your LocalFelo verification code is: {{2}}

Valid for {{3}}.

Do not share this code with anyone.

- LocalFelo Team
```

**Variable Names:** customer_name, otp_code, validity

---

### ✅ 7. password_reset
**Template Name:** `password_reset`

**Message:**
```
Hi {{1}},

Your LocalFelo password reset code is: {{2}}

Valid for {{3}}.

If you didn't request this, please ignore this message.

- LocalFelo Team
```

**Variable Names:** customer_name, reset_code, validity

---

### ✅ 8. wish_first_message
**Template Name:** `wish_first_message`

**Message:**
```
Hi {{1}},

{{2}} responded to your wish "{{3}}":

"{{4}}"

Chat with them now on LocalFelo!

- LocalFelo Team
```

**Variable Names:** customer_name, sender_name, wish_title, message_preview

---

### ✅ 9. marketplace_first_message
**Template Name:** `marketplace_first_message`

**Message:**
```
Hi {{1}},

{{2}} is interested in your listing "{{3}}":

"{{4}}"

Reply to sell faster on LocalFelo!

- LocalFelo Team
```

**Variable Names:** seller_name, buyer_name, listing_title, message_preview

---

**⏳ Wait for approval:** Templates usually get approved within 1-24 hours.

---

## 🎯 Step 3: Configure Supabase (5 minutes)

### In Supabase Dashboard:

1. **Go to Project Settings**
   - Click your project
   - Go to **Settings** → **Edge Functions**

2. **Add Environment Variables**
   - Click **Add Secret**
   - Add these two secrets:

   **Secret 1:**
   - Name: `INTERAKT_API_KEY`
   - Value: `YOUR_INTERAKT_API_KEY_FROM_STEP_1`

   **Secret 2:**
   - Name: `INTERAKT_BASE_URL`
   - Value: `https://api.interakt.ai/v1`

3. **Save** the secrets

---

## 🎯 Step 4: Deploy Edge Function (2 minutes)

### In VS Code Terminal:

```bash
# Make sure you're in your project directory
cd /path/to/localfelo

# Deploy the edge function
npx supabase functions deploy send-whatsapp-notification

# Verify deployment
npx supabase functions list
```

You should see: ✅ `send-whatsapp-notification` in the list

---

## 🎯 Step 5: Run Database Migration (2 minutes)

### In Supabase Dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. **Copy** entire content from: `/migrations/INTERAKT_WHATSAPP_SETUP.sql`
4. **Paste** in SQL Editor
5. Click **RUN**

You should see: ✅ Success message

---

## 🎯 Step 6: Test It! (5 minutes)

### Test 1: Manual WhatsApp Send

In Supabase SQL Editor, run:

```sql
SELECT send_whatsapp_via_interakt(
  '91XXXXXXXXXX',  -- Replace with your phone number
  'otp_verification',
  '{"customer_name": "Test User", "otp_code": "123456", "validity": "10 minutes"}'::jsonb,
  NULL
);
```

**Expected:** You receive WhatsApp message on your phone within 30 seconds

---

### Test 2: Check Logs

```sql
SELECT * FROM whatsapp_notifications 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected:** You see your test notification with status 'pending' or 'sent'

---

### Test 3: Task Notification

1. Open LocalFelo app
2. Create a task
3. Accept it from another account
4. **Expected:** Task creator receives WhatsApp notification

---

## 🎯 Step 7: Monitor (Ongoing)

### Check Delivery Stats

In Supabase SQL Editor:

```sql
-- See all sent notifications
SELECT 
  template_name,
  status,
  COUNT(*) as count,
  MAX(sent_at) as last_sent
FROM whatsapp_notifications
GROUP BY template_name, status
ORDER BY last_sent DESC;
```

### Check Failed Notifications

```sql
SELECT * FROM whatsapp_notifications
WHERE status = 'failed'
ORDER BY sent_at DESC
LIMIT 10;
```

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Interakt API Key added to Supabase secrets
- [ ] All 9 templates approved in Interakt
- [ ] Edge function deployed (shows in list)
- [ ] Database migration executed successfully
- [ ] Test WhatsApp message received
- [ ] Logs show notifications in database
- [ ] At least one live task notification tested

---

## 🐛 Common Issues

### Issue: "INTERAKT_API_KEY not configured"

**Fix:** 
1. Go to Supabase → Settings → Edge Functions
2. Make sure `INTERAKT_API_KEY` secret is added
3. Redeploy edge function:
   ```bash
   npx supabase functions deploy send-whatsapp-notification
   ```

---

### Issue: "Template not found"

**Fix:**
1. Check template is **approved** in Interakt dashboard
2. Verify template name matches exactly (case-sensitive)
3. Wait 10 minutes after approval for sync

---

### Issue: Phone number format error

**Fix:**
- Phone should be: `919876543210` (no spaces, no +)
- Not: `+91 98765 43210` or `9876543210`

---

### Issue: Notifications not sending

**Fix:**
1. Check Edge Function logs:
   - Supabase → Edge Functions → send-whatsapp-notification → Logs

2. Check database logs:
   ```sql
   SELECT * FROM whatsapp_notifications 
   WHERE status = 'failed'
   ORDER BY created_at DESC;
   ```

3. Verify triggers are enabled:
   ```sql
   SELECT tgname, tgenabled 
   FROM pg_trigger 
   WHERE tgname LIKE 'trigger_%';
   ```

---

## 📊 Expected Results

After setup:

✅ **Task Accepted:** WhatsApp notification within 5 seconds
✅ **First Message:** WhatsApp notification within 5 seconds  
✅ **OTP:** WhatsApp notification within 10 seconds
✅ **Delivery Rate:** 95%+ (India)

---

## 💰 Cost Estimate

**Interakt Pricing:**
- ~₹0.35 - ₹1.00 per message
- For 100 users: ~₹2,000/month
- For 1000 users: ~₹20,000/month

---

## 🎉 You're Done!

Your WhatsApp notifications are now live! Users will receive:

✅ Task updates (accepted, cancelled, completed)
✅ Chat messages (first message, after 24h gap)
✅ OTP codes
✅ Password reset codes
✅ Wish & Marketplace messages

---

## 📞 Support

Stuck? Check:
1. Supabase Edge Function logs
2. Database `whatsapp_notifications` table
3. Interakt dashboard for delivery status

---

**Next:** Set up notification preferences in user settings to let users control which notifications they want to receive.
