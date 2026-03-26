# 🎯 Interakt WhatsApp Notification System - Complete Action Plan

## 📋 Current Status

### ✅ Completed
1. **Service Layer Created:** `/services/interaktWhatsApp.ts`
2. **Edge Function Created:** `/supabase/functions/send-whatsapp-notification/index.ts`
3. **Edge Function Deployed:** ✅ (per your background)
4. **Interakt API Secrets Added:** ✅ (per your background)
5. **Database Migration SQL Ready:** `/migrations/INTERAKT_WHATSAPP_SETUP_CLEAN.sql`
6. **OTP Integration:** WhatsApp OTP in `/services/authPhone.ts`
7. **All 13 Templates Documented:** `/INTERAKT_ALL_13_TEMPLATES.md`

### ⏳ Pending
1. **Run Database Migration** in Supabase SQL Editor
2. **Create WhatsApp Templates** in Interakt Dashboard
3. **Wait for Template Approval** (1-24 hours)
4. **Implement Phase 2 Code** (Templates 6-13)

---

## 🚀 What You Need to Do RIGHT NOW

### **Step 1: Run Database Migration (2 minutes)**

1. Open Supabase Dashboard → Your Project → **SQL Editor**
2. Copy the **entire contents** of `/migrations/INTERAKT_WHATSAPP_SETUP_CLEAN.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. Should see: ✅ **"Success. No rows returned"**

**This creates:**
- `whatsapp_notifications` table
- Database triggers for automatic notifications
- Helper functions for sending WhatsApp messages

---

### **Step 2: Wait for Interakt Account Approval**

**Current Issue:** Your Interakt account doesn't have permission to create templates yet.

**What to do:**
1. **Contact Interakt Support:**
   - Email: support@interakt.ai
   - Or live chat in Interakt Dashboard
   - Message: "I'm getting 'This WhatsApp Business account does not have permission to create message template' error. Please enable template creation permissions for my account."

2. **Wait for approval** (1-24 hours typically)

3. **Check Meta Business Verification:**
   - Go to: https://business.facebook.com/
   - Ensure your Business Manager is verified
   - Complete any pending verification steps

---

## 📱 Phase 1: Create Critical Templates (5 Templates)

**Do this AFTER Interakt approves your account.**

### **Template 1: `otp_verification`**
- **Template Name:** `otp_verification`
- **Category:** AUTHENTICATION
- **Button Type:** One Time Passcode → Copy Code
- **Validity:** 10 minutes
- **Body:**
```
Hi {{1}},

Your LocalFelo verification code is: {{2}}

Valid for {{3}}.

Do not share this code with anyone.

- LocalFelo Team
```
- **Sample Values:** Name: `Rajesh Kumar`, OTP: `123456`, Validity: `10 minutes`

---

### **Template 2: `task_accepted`**
- **Template Name:** `task_accepted`
- **Category:** UTILITY
- **Button Type:** None
- **Body:**
```
Hi {{1}},

Great news! {{2}} has accepted your task "{{3}}" for {{4}}.

You can now chat with them on LocalFelo to coordinate details.

- LocalFelo Team
```
- **Sample Values:** `Rajesh Kumar`, `Priya Sharma`, `Clean my house`, `₹500`

---

### **Template 3: `task_cancelled`**
- **Template Name:** `task_cancelled`
- **Category:** UTILITY
- **Button Type:** None
- **Body:**
```
Hi {{1}},

The task "{{2}}" has been cancelled by {{3}}.

You can post a new task or browse other helpers on LocalFelo.

- LocalFelo Team
```
- **Sample Values:** `Rajesh Kumar`, `Clean my house`, `Priya Sharma`

---

### **Template 4: `task_completed`**
- **Template Name:** `task_completed`
- **Category:** UTILITY
- **Button Type:** None
- **Body:**
```
Hi {{1}},

Your task "{{3}}" has been completed by {{2}}!

Payment: {{4}}

Please rate your experience on LocalFelo.

- LocalFelo Team
```
- **Sample Values:** `Rajesh Kumar`, `Priya Sharma`, `Clean my house`, `₹500`

---

### **Template 5: `first_message`**
- **Template Name:** `first_message`
- **Category:** UTILITY
- **Button Type:** None
- **Body:**
```
Hi {{1}},

{{2}} sent you a message about your {{5}} "{{3}}":

"{{4}}"

Reply now on LocalFelo!

- LocalFelo Team
```
- **Sample Values:** `Rajesh Kumar`, `Priya Sharma`, `Old sofa`, `Is this available?`, `listing`

---

## 🔔 Phase 2A: Critical Notifications (4 Templates)

**Create these AFTER Phase 1 templates are approved and working.**

### **Template 6: `listing_interest`**
- **When:** First message on marketplace listing
- **Body:**
```
Hi {{1}},

{{2}} is interested in your listing "{{3}}"!

They sent: "{{4}}"

Reply now on LocalFelo to close the deal!

- LocalFelo Team
```
- **Sample:** `Rajesh Kumar`, `Priya Sharma`, `iPhone 13`, `Best price?`

---

### **Template 7: `wish_response`**
- **When:** First message on wish
- **Body:**
```
Hi {{1}},

Good news! {{2}} can fulfill your wish for "{{3}}".

Message: "{{4}}"

Check it out on LocalFelo now!

- LocalFelo Team
```
- **Sample:** `Rajesh Kumar`, `Priya Sharma`, `iPhone 13`, `I have one!`

---

### **Template 8: `helper_applied`**
- **When:** Helper applies to task
- **Body:**
```
Hi {{1}},

{{2}} wants to help with your task "{{3}}"!

Offered price: {{4}}
Distance: {{5}}

View their profile and chat on LocalFelo!

- LocalFelo Team
```
- **Sample:** `Rajesh Kumar`, `Priya Sharma`, `Clean house`, `₹450`, `2.5 km`

---

### **Template 9: `unread_reminder`**
- **When:** 6 hours after unread messages
- **Body:**
```
Hi {{1}},

You have {{2}} unread message(s) on LocalFelo!

Latest from {{3}}: "{{4}}"

Don't miss out - reply now!

- LocalFelo Team
```
- **Sample:** `Rajesh Kumar`, `3`, `Priya Sharma`, `Still interested?`

---

## 📊 Phase 2B: Optional Enhancements (4 Templates)

**Create these LATER if you want advanced features.**

### **Template 10: `pending_helpers`**
- **When:** 6 hours after task posted (no acceptance)
- **Body:**
```
Hi {{1}},

You have {{2}} helper(s) waiting to help with "{{3}}"!

They're ready to start. Review and accept on LocalFelo now.

- LocalFelo Team
```

---

### **Template 11: `daily_summary`**
- **When:** Daily at 6 PM (if inactive 24h)
- **Body:**
```
Hi {{1}},

Today's LocalFelo activity:
• {{2}} new messages
• {{3}} views on your listings
• {{4}} helpers nearby for your tasks

Open LocalFelo to stay connected!

- LocalFelo Team
```

---

### **Template 12: `task_deadline`**
- **When:** 24h before deadline
- **Body:**
```
Hi {{1}},

Reminder: Your task "{{2}}" deadline is in {{3}}.

No helper yet? Increase your budget or adjust requirements on LocalFelo.

- LocalFelo Team
```

---

### **Template 13: `account_verified`**
- **When:** After phone verification
- **Body:**
```
Hi {{1}},

Welcome to LocalFelo!

Your account is verified. Start exploring:
• Buy and sell locally
• Post wishes
• Find helpers nearby

Let's get started!

- LocalFelo Team
```

---

## 🔧 Code Implementation Required

### **Phase 2A Code (Need to Implement):**

1. **Add to `/services/interaktWhatsApp.ts`:**
   - `notifyListingInterest()` - Template 6
   - `notifyWishResponse()` - Template 7
   - `notifyHelperApplied()` - Template 8
   - `notifyUnreadReminder()` - Template 9

2. **Create Background Job Service:**
   - File: `/services/reminderJob.ts`
   - Function to check unread messages every 6 hours
   - Function to check pending helpers every 6 hours

3. **Add Supabase Cron Job:**
   - Use Supabase Edge Function with cron trigger
   - Run every 6 hours
   - Check for unread messages > 6 hours
   - Send reminder notifications

---

## ⏱️ Timeline Estimate

| Phase | Task | Time Required | Waiting Time |
|---|---|---|---|
| **Phase 0** | Run database migration | 2 min | - |
| **Phase 1** | Wait for Interakt approval | - | 1-24 hours |
| **Phase 1** | Create 5 templates | 15 min | - |
| **Phase 1** | Wait for template approval | - | 1-24 hours |
| **Phase 1** | Test notifications | 10 min | - |
| **Phase 2A** | Create 4 templates | 10 min | - |
| **Phase 2A** | Implement code | 2 hours | - |
| **Phase 2A** | Test | 20 min | - |
| **Phase 2B** | Optional enhancements | 3 hours | - |

**Total Active Time:** ~4 hours  
**Total Waiting Time:** 2-48 hours (approval periods)

---

## ✅ Success Checklist

### **Phase 0: Setup** ✅
- [ ] Run database migration SQL
- [ ] Verify `whatsapp_notifications` table created
- [ ] Check triggers are created

### **Phase 1: Core Notifications**
- [ ] Interakt account approved
- [ ] Created 5 templates in Interakt
- [ ] All 5 templates approved by WhatsApp
- [ ] Test OTP notification
- [ ] Test task accepted notification
- [ ] Test first message notification
- [ ] Verify logs in `whatsapp_notifications` table

### **Phase 2A: Critical Reminders**
- [ ] Created 4 additional templates
- [ ] Templates approved
- [ ] Code implemented for listing interest
- [ ] Code implemented for wish response
- [ ] Code implemented for helper applied
- [ ] Code implemented for 6-hour reminder
- [ ] Background job scheduled
- [ ] Test all Phase 2A notifications

### **Phase 2B: Optional** (Later)
- [ ] Created remaining 4 templates
- [ ] Code implemented
- [ ] Daily summary working
- [ ] Task deadline reminders working

---

## 🐛 Troubleshooting

### **Issue: Cannot create templates in Interakt**
**Solution:** Contact Interakt support to enable permissions

### **Issue: SQL migration error**
**Solution:** Use `/migrations/INTERAKT_WHATSAPP_SETUP_CLEAN.sql` (no decorative comments)

### **Issue: Templates stuck in pending**
**Solution:** Wait 24-48 hours. WhatsApp manually reviews templates.

### **Issue: Notifications not sending**
**Solution:** 
1. Check Supabase Edge Function logs
2. Check `whatsapp_notifications` table for errors
3. Verify Interakt API key is correct
4. Check phone number format (should be 10 digits)

---

## 📞 Support Resources

- **Interakt Support:** support@interakt.ai
- **Interakt Dashboard:** https://app.interakt.ai/
- **Meta Business Manager:** https://business.facebook.com/
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## 🎉 What Happens After Setup

Once everything is approved and working:

1. **Automatic Notifications:**
   - Task accepted → User gets WhatsApp
   - Task cancelled → User gets WhatsApp
   - Task completed → User gets WhatsApp
   - First message → Recipient gets WhatsApp

2. **OTP via WhatsApp:**
   - User signs up → Gets OTP on SMS + WhatsApp
   - Double delivery ensures better success rate

3. **6-Hour Reminders:**
   - Unread messages → Reminder after 6 hours
   - Pending helpers → Reminder after 6 hours

4. **Better Engagement:**
   - 95% open rate on WhatsApp
   - Faster response times
   - Higher user retention

---

## 📝 Next Actions for You

**RIGHT NOW:**
1. ✅ Run database migration SQL (2 min)
2. ⏳ Contact Interakt support for account approval
3. ⏳ Wait for approval (1-24 hours)

**AFTER APPROVAL:**
4. Create 5 Phase 1 templates (15 min)
5. Wait for template approval (1-24 hours)
6. Test notifications (10 min)

**LATER:**
7. Create Phase 2A templates (10 min)
8. I'll implement the code (2 hours)
9. Test everything (20 min)

---

**Current Priority:** Run the database migration now, then wait for Interakt approval.

Let me know when you've run the migration and I'll help you verify it! 🚀
