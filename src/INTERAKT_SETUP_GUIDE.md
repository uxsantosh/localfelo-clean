# 🚀 Interakt WhatsApp Setup & Testing Guide for LocalFelo

Complete step-by-step guide to set up Interakt templates and test WhatsApp notifications.

---

## 📋 **PART 1: Create Templates in Interakt**

### **Step 1: Access Interakt Dashboard**

1. Go to [Interakt Dashboard](https://app.interakt.ai/)
2. Log in with your credentials
3. Navigate to **"Templates"** section (left sidebar)

---

### **Step 2: Create Template #1 - OTP Verification** ⭐ START HERE

This is the simplest template - perfect for testing!

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `otp_verification` |
| **Category** | `AUTHENTICATION` |
| **Language** | `English` |
| **Header** | None |
| **Body** | See below ⬇️ |
| **Footer** | None |
| **Buttons** | None |

#### **Body Text:**

```
Hello {{1}}! 👋

Your LocalFelo OTP is: *{{2}}*

This code is valid for 10 minutes. Do not share it with anyone.

- LocalFelo Team
```

#### **Variables:**
- `{{1}}` = customer_name
- `{{2}}` = otp_code

#### **Sample Values (for approval):**
- {{1}} = `Rahul Kumar`
- {{2}} = `123456`

**👉 Click "Submit for Approval"** (Meta reviews in 1-24 hours)

---

### **Step 3: Create Template #2 - New Task Request**

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `new_task_request` |
| **Category** | `MARKETING` |
| **Language** | `English` |

#### **Body Text:**

```
Hi {{1}}! 🔔

New task request in your area:

*{{2}}*
Category: {{3}}
Budget: ₹{{4}}
Distance: {{5}}

Check LocalFelo app to accept this task!
```

#### **Variables:**
- `{{1}}` = helper_name
- `{{2}}` = task_title
- `{{3}}` = category_name
- `{{4}}` = budget_amount
- `{{5}}` = distance_km

#### **Sample Values:**
- {{1}} = `Priya Sharma`
- {{2}} = `Fix WiFi router issue`
- {{3}} = `Tech Help`
- {{4}} = `500`
- {{5}} = `2.5 km`

---

### **Step 4: Create Template #3 - Task Accepted**

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `task_accepted` |
| **Category** | `MARKETING` |
| **Language** | `English` |

#### **Body Text:**

```
Great news {{1}}! 🎉

{{2}} accepted your task: *{{3}}*

They'll contact you soon. Check the chat in LocalFelo app!
```

#### **Variables:**
- `{{1}}` = customer_name
- `{{2}}` = helper_name
- `{{3}}` = task_title

#### **Sample Values:**
- {{1}} = `Amit Verma`
- {{2}} = `Rohan Tech`
- {{3}} = `Laptop repair needed`

---

### **Step 5: Create Template #4 - Listing Interest** 💬

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `listing_interest` |
| **Category** | `MARKETING` |
| **Language** | `English` |

#### **Body Text:**

```
Hi {{1}}! 💬

{{2}} is interested in your listing: *{{3}}*

They sent you a message. Reply now in LocalFelo chat!
```

#### **Variables:**
- `{{1}}` = seller_name
- `{{2}}` = buyer_name
- `{{3}}` = listing_title

#### **Sample Values:**
- {{1}} = `Kavita Singh`
- {{2}} = `Rajesh Kumar`
- {{3}} = `iPhone 12 - Mint Condition`

---

### **Step 6: Create Template #5 - Wish Response** 💡

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `wish_response` |
| **Category** | `MARKETING` |
| **Language** | `English` |

#### **Body Text:**

```
Exciting news {{1}}! ✨

{{2}} can help with your wish: *{{3}}*

Check your LocalFelo chat to discuss details!
```

#### **Variables:**
- `{{1}}` = wisher_name
- `{{2}}` = responder_name
- `{{3}}` = wish_title

#### **Sample Values:**
- {{1}} = `Ananya Patel`
- {{2}} = `Deepak Electronics`
- {{3}} = `Looking for gaming laptop under 60k`

---

### **Step 7: Create Template #6 - Wish Fulfilled** ✅

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `wish_fulfilled` |
| **Category** | `MARKETING` |
| **Language** | `English` |

#### **Body Text:**

```
Congratulations {{1}}! 🎉

Your wish *{{2}}* has been marked as fulfilled!

We hope you found what you were looking for on LocalFelo!
```

#### **Variables:**
- `{{1}}` = customer_name
- `{{2}}` = wish_title

#### **Sample Values:**
- {{1}} = `Sanjay Gupta`
- {{2}} = `Need a good plumber in HSR Layout`

---

### **Step 8: Create Template #7 - Unread Reminder** 🔔

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `unread_reminder` |
| **Category** | `MARKETING` |
| **Language** | `English` |

#### **Body Text:**

```
Hey {{1}}! 📬

You have {{2}} unread message(s) from {{3}}:

"{{4}}..."

Reply now in LocalFelo app!
```

#### **Variables:**
- `{{1}}` = customer_name
- `{{2}}` = unread_count
- `{{3}}` = sender_name
- `{{4}}` = message_preview

#### **Sample Values:**
- {{1}} = `Meera Shah`
- {{2}} = `3`
- {{3}} = `Vikram Electronics`
- {{4}} = `Hi, is this still available? I'm very interested...`

---

### **Step 9: Create Template #8 - New Wish Response** 🆕

#### **Template Configuration:**

| Field | Value |
|-------|-------|
| **Template Name** | `new_wish_response` |
| **Category** | `MARKETING` |
| **Language** | `English` |

#### **Body Text:**

```
Hi {{1}}! 💬

{{2}} responded to your wish: *{{3}}*

They want to help! Check the chat in LocalFelo.
```

#### **Variables:**
- `{{1}}` = customer_name
- `{{2}}` = responder_name
- `{{3}}` = wish_title

#### **Sample Values:**
- {{1}} = `Pooja Reddy`
- {{2}} = `Tech Solutions`
- {{3}} = `Need iPhone screen repair`

---

## 🔑 **PART 2: Get API Credentials**

1. In Interakt Dashboard, go to **Settings** → **API Settings**
2. Copy your **API Key**
3. Copy your **Campaign ID** (if available)

---

## 🗄️ **PART 3: Store Credentials in Supabase**

### **Option A: Using Supabase Dashboard (Recommended)**

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add these secrets:

```
INTERAKT_API_KEY = your_api_key_from_interakt
INTERAKT_BASE_URL = https://api.interakt.ai/v1
```

### **Option B: Using Supabase CLI**

```bash
supabase secrets set INTERAKT_API_KEY=your_api_key_from_interakt
supabase secrets set INTERAKT_BASE_URL=https://api.interakt.ai/v1
```

---

## 🧪 **PART 4: Test Your First WhatsApp Message!**

### **Step 1: Wait for Template Approval**

- Check your email for Meta approval (1-24 hours)
- Status shows "APPROVED" in Interakt dashboard ✅

### **Step 2: Create Test Edge Function**

I'll create a test function for you below this guide!

### **Step 3: Test from Browser Console**

Once Edge Function is deployed, you can test like this:

```javascript
// In your LocalFelo app, open browser console (F12)

// Test OTP notification
const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
  body: {
    phoneNumber: '+919876543210', // YOUR TEST PHONE NUMBER
    templateName: 'otp_verification',
    variables: {
      customer_name: 'Rahul',
      otp_code: '123456'
    }
  }
});

console.log('Result:', data, error);
```

### **Step 4: Test Task Notification**

```javascript
// Test task request notification
const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
  body: {
    phoneNumber: '+919876543210', // YOUR TEST PHONE NUMBER
    templateName: 'new_task_request',
    variables: {
      helper_name: 'Priya',
      task_title: 'Fix WiFi router',
      category_name: 'Tech Help',
      budget_amount: '500',
      distance_km: '2.5 km'
    }
  }
});

console.log('Result:', data, error);
```

---

## ✅ **PART 5: Verify Everything Works**

### **Checklist:**

- [ ] All 8 templates created in Interakt
- [ ] All templates APPROVED by Meta
- [ ] API credentials added to Supabase secrets
- [ ] Edge Function deployed
- [ ] Test message received on WhatsApp ✅

---

## 🐛 **Troubleshooting**

### **Error: "Template not found"**
- ✅ Check template name matches exactly (case-sensitive)
- ✅ Ensure template is APPROVED (not pending)

### **Error: "Invalid phone number"**
- ✅ Use format: `+91XXXXXXXXXX` (with country code)
- ✅ No spaces, dashes, or parentheses

### **Error: "Authentication failed"**
- ✅ Check API key is correct
- ✅ Ensure secrets are set in Supabase

### **No message received**
- ✅ Check your phone is registered in Interakt sandbox (during testing)
- ✅ Verify phone number is correct
- ✅ Check Interakt dashboard logs

---

## 📞 **Test Phone Numbers**

During Interakt sandbox testing, you need to add test phone numbers:

1. Go to Interakt Dashboard → **Settings** → **Test Numbers**
2. Add your phone number
3. Verify it with OTP
4. Now you can receive test messages!

**Note:** In production, you can send to any phone number!

---

## 🚀 **Next Steps**

Once first test works:

1. ✅ Test all 8 templates
2. Deploy Edge Function for 6-hour reminder cron job
3. Set up database triggers (already done!)
4. Go live! 🎉

---

## 📝 **Template Summary**

| # | Template Name | Category | When It's Sent |
|---|---------------|----------|----------------|
| 1 | `otp_verification` | AUTH | User logs in/signs up |
| 2 | `new_task_request` | MARKETING | Helper gets nearby task |
| 3 | `task_accepted` | MARKETING | Someone accepts your task |
| 4 | `listing_interest` | MARKETING | First message on your listing |
| 5 | `wish_response` | MARKETING | Someone offers to fulfill wish |
| 6 | `wish_fulfilled` | MARKETING | Your wish marked fulfilled |
| 7 | `unread_reminder` | MARKETING | Unread messages after 6 hours |
| 8 | `new_wish_response` | MARKETING | Someone responds to wish |

---

## 🎯 **Priority Order for Testing**

**Start with these 3:**

1. ✅ `otp_verification` (simplest, always works)
2. ✅ `listing_interest` (marketplace core feature)
3. ✅ `new_task_request` (task system core feature)

**Then add:**

4. `task_accepted`
5. `wish_response`
6. `wish_fulfilled`
7. `unread_reminder`
8. `new_wish_response`

---

Ready to start! Create the OTP template first and let me know when it's approved! 🚀
