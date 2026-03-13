# 🚀 Interakt WhatsApp Integration - Complete Setup Guide

This guide will help you set up WhatsApp notifications via Interakt for LocalFelo.

---

## 📋 Prerequisites

1. ✅ Interakt account with API access
2. ✅ Interakt API Key (Basic Auth)
3. ✅ Supabase project access
4. ✅ VS Code with your project open

---

## 🎯 Features Covered

### Task Notifications
- ✅ Task Accepted
- ✅ Task Cancelled
- ✅ Task Completed

### Chat Notifications
- ✅ First message on any listing
- ✅ Message after 24+ hour gap
- ✅ Wish first message
- ✅ Marketplace first message

### Auth Notifications
- ✅ OTP verification
- ✅ Password reset

---

## 📝 Step 1: Create Interakt Templates

Go to your Interakt dashboard and create these templates:

### Template 1: `task_accepted`
```
Hi {{1}}, 

Great news! {{2}} has accepted your task "{{3}}" for {{4}}.

You can now chat with them on LocalFelo to coordinate details.

- LocalFelo Team
```
**Variables**: customer_name, helper_name, task_title, task_price

---

### Template 2: `task_cancelled`
```
Hi {{1}},

The task "{{2}}" has been cancelled by {{3}}.

You can post a new task or browse other helpers on LocalFelo.

- LocalFelo Team
```
**Variables**: customer_name, task_title, cancelled_by

---

### Template 3: `task_completed`
```
Hi {{1}},

🎉 Your task "{{3}}" has been completed by {{2}}!

Payment: {{4}}

Please rate your experience on LocalFelo.

- LocalFelo Team
```
**Variables**: customer_name, helper_name, task_title, task_price

---

### Template 4: `first_message`
```
Hi {{1}},

{{2}} sent you a message about your {{5}} "{{3}}":

"{{4}}"

Reply now on LocalFelo!

- LocalFelo Team
```
**Variables**: customer_name, sender_name, listing_title, message_preview, listing_type

---

### Template 5: `message_after_gap`
```
Hi {{1}},

{{2}} sent you a new message about "{{3}}":

"{{4}}"

Check your messages on LocalFelo!

- LocalFelo Team
```
**Variables**: customer_name, sender_name, listing_title, message_preview

---

### Template 6: `otp_verification`
```
Hi {{1}},

Your LocalFelo verification code is: {{2}}

Valid for {{3}}.

Do not share this code with anyone.

- LocalFelo Team
```
**Variables**: customer_name, otp_code, validity

---

### Template 7: `password_reset`
```
Hi {{1}},

Your LocalFelo password reset code is: {{2}}

Valid for {{3}}.

If you didn't request this, please ignore this message.

- LocalFelo Team
```
**Variables**: customer_name, reset_code, validity

---

### Template 8: `wish_first_message`
```
Hi {{1}},

{{2}} responded to your wish "{{3}}":

"{{4}}"

Chat with them now on LocalFelo!

- LocalFelo Team
```
**Variables**: customer_name, sender_name, wish_title, message_preview

---

### Template 9: `marketplace_first_message`
```
Hi {{1}},

{{2}} is interested in your listing "{{3}}":

"{{4}}"

Reply to sell faster on LocalFelo!

- LocalFelo Team
```
**Variables**: seller_name, buyer_name, listing_title, message_preview

---

## 🔧 Step 2: Configure Supabase Edge Function

### 2.1 Set Environment Variables in Supabase

1. Go to **Supabase Dashboard** → **Settings** → **Edge Functions**
2. Add these environment variables:

```bash
INTERAKT_API_KEY=your_interakt_api_key_here
INTERAKT_BASE_URL=https://api.interakt.ai/v1
```

**How to get your Interakt API Key:**
1. Login to Interakt Dashboard
2. Go to **Settings** → **API**
3. Copy your **Basic Auth Key** (it should look like a base64 encoded string)

---

### 2.2 Deploy Edge Function

Open your terminal in VS Code and run:

```bash
# Login to Supabase CLI (if not already logged in)
npx supabase login

# Link your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Deploy the edge function
npx supabase functions deploy send-whatsapp-notification
```

**Verify deployment:**
```bash
npx supabase functions list
```

You should see `send-whatsapp-notification` in the list.

---

## 🗄️ Step 3: Run Database Migration

### 3.1 In Supabase SQL Editor

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire content from `/migrations/INTERAKT_WHATSAPP_SETUP.sql`
4. Click **Run** to execute

**What this does:**
- ✅ Creates `whatsapp_notifications` table for logging
- ✅ Sets up RLS policies
- ✅ Creates helper functions
- ✅ Creates database triggers for automatic notifications:
  - Task accepted/cancelled/completed
  - First chat messages
  - Messages after long gaps

---

## 💻 Step 4: Update Frontend Code

### 4.1 Update Auth Service for OTP

Open `/services/authPhone.ts` and add WhatsApp notification:

```typescript
import { sendWhatsAppOTP } from './interaktWhatsApp';

// Find the sendOTP function and add after SMS is sent:
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    // ... existing SMS OTP code ...
    
    // Also send WhatsApp OTP
    const userName = 'User'; // Get from profile if available
    await sendWhatsAppOTP({
      phoneNumber: phoneNumber,
      userName: userName,
      otp: otpCode
    });
    
    return { success: true };
  } catch (error) {
    // ... error handling ...
  }
}
```

### 4.2 Update Password Reset

Open `/screens/ProfileScreen.tsx` or wherever password reset is handled:

```typescript
import { sendPasswordResetWhatsApp } from '../services/interaktWhatsApp';

// In password reset function:
const handlePasswordReset = async () => {
  // Generate reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Send WhatsApp notification
  await sendPasswordResetWhatsApp({
    phoneNumber: userPhone,
    userName: userName,
    resetCode: resetCode,
    userId: userId
  });
};
```

---

## 🧪 Step 5: Testing

### Test 1: Task Accepted Notification

1. Create a task in the app
2. Accept the task from another account
3. Check the task creator's WhatsApp for notification

**SQL Test:**
```sql
-- Manually trigger notification
SELECT send_whatsapp_via_interakt(
  '919876543210',
  'task_accepted',
  '{"customer_name": "Test User", "helper_name": "Helper", "task_title": "Test Task", "task_price": "₹500"}'::jsonb,
  NULL
);

-- Check logs
SELECT * FROM whatsapp_notifications ORDER BY created_at DESC LIMIT 5;
```

---

### Test 2: First Message Notification

1. Send first message in a chat
2. Check recipient's WhatsApp

**Check trigger:**
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_first_chat_message';
```

---

### Test 3: Task Completed Notification

1. Mark task as completed from both sides
2. Check task creator's WhatsApp

---

## 📊 Step 6: Monitor Notifications

### View All Sent Notifications

```sql
SELECT 
  phone_number,
  template_name,
  status,
  variables,
  sent_at,
  error_message
FROM whatsapp_notifications
ORDER BY sent_at DESC
LIMIT 20;
```

### Check Failed Notifications

```sql
SELECT * FROM whatsapp_notifications
WHERE status = 'failed'
ORDER BY sent_at DESC;
```

### Statistics

```sql
SELECT 
  template_name,
  status,
  COUNT(*) as count
FROM whatsapp_notifications
GROUP BY template_name, status
ORDER BY template_name, status;
```

---

## 🔍 Debugging

### Enable Verbose Logging

In Edge Function, check Supabase logs:
1. Go to **Supabase Dashboard** → **Edge Functions** → **send-whatsapp-notification**
2. Click **Logs** to see real-time execution logs

### Common Issues

#### Issue 1: "INTERAKT_API_KEY not configured"
**Solution:** Make sure you added the environment variable in Supabase Edge Functions settings.

#### Issue 2: Phone number format error
**Solution:** Phone numbers should be in format `919876543210` (country code + number, no spaces or special characters).

#### Issue 3: Template not found
**Solution:** Verify template name in Interakt dashboard matches exactly (case-sensitive).

#### Issue 4: Notifications not triggering
**Solution:** Check if triggers are enabled:
```sql
SELECT tgname, tgenabled FROM pg_trigger 
WHERE tgname LIKE 'trigger_%';
```

---

## 🎨 Optional: Custom Templates

You can create custom templates in Interakt and use them:

```typescript
import { sendWhatsAppNotification } from '../services/interaktWhatsApp';

await sendWhatsAppNotification({
  phoneNumber: '919876543210',
  templateName: 'your_custom_template',
  variables: {
    var1: 'value1',
    var2: 'value2'
  },
  userId: userId
});
```

---

## 📱 Step 7: Phone Number Collection

Make sure users have phone numbers in their profiles:

### Update Profile Creation

In `/services/auth.ts` or profile setup:

```typescript
// Ensure phone is saved to profile
await supabase
  .from('profiles')
  .update({ phone: phoneNumber })
  .eq('id', userId);
```

---

## ✅ Verification Checklist

- [ ] Interakt API Key added to Supabase environment variables
- [ ] All 9 templates created in Interakt dashboard
- [ ] Edge function deployed successfully
- [ ] Database migration executed without errors
- [ ] Tested task accepted notification
- [ ] Tested first message notification
- [ ] Tested OTP notification
- [ ] Checked `whatsapp_notifications` table for logs
- [ ] All users have phone numbers in profiles

---

## 🚀 Go Live

Once everything is tested:

1. **Remove test notifications** (if any)
2. **Monitor the first 24 hours** closely
3. **Check Interakt dashboard** for delivery rates
4. **Review user feedback** on notification quality

---

## 💰 Cost Estimation

**Interakt Pricing** (approximate):
- Template messages: ₹0.35 - ₹1.00 per message
- Delivery rate: ~95% in India

**Monthly estimate for 1000 active users:**
- ~20 notifications per user = 20,000 messages
- Cost: ₹7,000 - ₹20,000 per month

---

## 🆘 Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Check `whatsapp_notifications` table for errors
3. Verify Interakt dashboard for API quota
4. Check phone number format

---

## 🎯 Next Steps

After successful setup:

1. **Add notification preferences** - Let users choose which notifications they want
2. **Add delivery tracking** - Update status when Interakt sends delivery webhooks
3. **Add rate limiting** - Prevent spam notifications
4. **Add A/B testing** - Test different message templates

---

**You're all set! 🎉**

Users will now receive WhatsApp notifications for all major events in LocalFelo.
