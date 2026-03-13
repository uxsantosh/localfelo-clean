# ✅ Interakt WhatsApp - Action Checklist

**Use this checklist to implement WhatsApp notifications step by step.**

---

## 📋 Pre-Implementation (5 minutes)

- [ ] I have an Interakt account (sign up at https://app.interakt.ai/)
- [ ] I have access to Supabase dashboard
- [ ] I have VS Code open with LocalFelo project
- [ ] I have read INTERAKT_QUICK_START.md

---

## 🔑 Step 1: Get Interakt API Key (5 minutes)

- [ ] Login to Interakt Dashboard (https://app.interakt.ai/)
- [ ] Go to Settings → API
- [ ] Copy "Basic Auth Key"
- [ ] Save API key in a safe place (you'll need it in Step 5)

**My API Key:** `________________________________` (fill this in)

---

## 📝 Step 2: Create WhatsApp Templates (15 minutes)

In Interakt Dashboard → Templates → Create New Template

### Core Templates (Must Have):

- [ ] **Template 1:** `task_accepted` (Task accepted notification)
- [ ] **Template 2:** `task_cancelled` (Task cancelled notification)  
- [ ] **Template 3:** `task_completed` (Task completed notification)
- [ ] **Template 4:** `first_message` (First chat message)
- [ ] **Template 5:** `otp_verification` (OTP codes)

### Optional Templates (Recommended):

- [ ] **Template 6:** `message_after_gap` (Message after 24h gap)
- [ ] **Template 7:** `password_reset` (Password reset codes)
- [ ] **Template 8:** `wish_first_message` (Wish responses)
- [ ] **Template 9:** `marketplace_first_message` (Marketplace interest)

**Template Text:** Copy from `INTERAKT_QUICK_START.md` (has exact text for all templates)

**Status:**
- [ ] All templates submitted
- [ ] Waiting for approval (check status in Interakt dashboard)
- [ ] All templates approved ✅

**Expected Wait Time:** 1-24 hours for approval

---

## 💻 Step 3: Deploy Edge Function (2 minutes)

**In VS Code Terminal:**

```bash
# Make sure you're in the right directory
cd /path/to/localfelo

# Deploy edge function
npx supabase functions deploy send-whatsapp-notification
```

**Verification:**
```bash
npx supabase functions list
```

- [ ] Edge function deployed successfully
- [ ] Function appears in list: `send-whatsapp-notification`

**Screenshot:** (Optional - take screenshot of successful deployment)

---

## 🗄️ Step 4: Run Database Migration (2 minutes)

**In Supabase Dashboard:**

1. Go to **SQL Editor**
2. Click **New Query**
3. Open file: `/migrations/INTERAKT_WHATSAPP_SETUP.sql` in VS Code
4. Copy ALL content
5. Paste in Supabase SQL Editor
6. Click **RUN**

**Checklist:**
- [ ] SQL executed without errors
- [ ] Success message shown
- [ ] Table `whatsapp_notifications` created

**Verify table exists:**
```sql
SELECT * FROM whatsapp_notifications LIMIT 1;
```

- [ ] Table exists and accessible

---

## 🔧 Step 5: Configure Supabase Environment Variables (1 minute)

**In Supabase Dashboard:**

1. Go to **Settings** → **Edge Functions**
2. Click **Add Secret**

**Add these 2 secrets:**

### Secret 1:
- Name: `INTERAKT_API_KEY`
- Value: `[YOUR API KEY FROM STEP 1]`

- [ ] Secret 1 added

### Secret 2:
- Name: `INTERAKT_BASE_URL`
- Value: `https://api.interakt.ai/v1`

- [ ] Secret 2 added

**After adding both:**
- [ ] Both secrets visible in Edge Functions settings
- [ ] Saved successfully

---

## 🧪 Step 6: Test WhatsApp Notifications (10 minutes)

### Test 1: Manual SQL Test

**In Supabase SQL Editor, run:**

```sql
SELECT send_whatsapp_via_interakt(
  '91XXXXXXXXXX',  -- ⚠️ REPLACE with YOUR phone number (10 digits after 91)
  'otp_verification',
  '{"customer_name": "Test User", "otp_code": "123456", "validity": "10 minutes"}'::jsonb,
  NULL
);
```

**Results:**
- [ ] Command executed successfully
- [ ] WhatsApp notification received on my phone within 30 seconds
- [ ] Message matches the template

**If failed, check:**
- [ ] Phone number format is correct (91XXXXXXXXXX - no spaces)
- [ ] Template is approved in Interakt
- [ ] API key is correct

---

### Test 2: Check Notification Logs

**Run this SQL:**

```sql
SELECT 
  phone_number,
  template_name,
  status,
  sent_at
FROM whatsapp_notifications 
ORDER BY created_at DESC 
LIMIT 5;
```

**Results:**
- [ ] My test notification appears in results
- [ ] Status is 'pending' or 'sent'
- [ ] Timestamp is recent

---

### Test 3: Check Edge Function Logs

**In Supabase Dashboard:**

1. Go to **Edge Functions** → **send-whatsapp-notification**
2. Click **Logs**

**Results:**
- [ ] Logs show recent execution
- [ ] No errors in logs
- [ ] Interakt API response visible

---

### Test 4: Live Task Notification

**In LocalFelo App:**

1. Create a new task
2. Accept it from another account
3. Check task creator's WhatsApp

**Results:**
- [ ] WhatsApp notification received
- [ ] Message shows task details correctly
- [ ] Helper name appears correctly

---

## 📊 Step 7: Verify Database Triggers (2 minutes)

**Check triggers are enabled:**

```sql
SELECT 
  tgname, 
  tgenabled,
  tgrelid::regclass AS table_name
FROM pg_trigger 
WHERE tgname LIKE 'trigger_%'
ORDER BY tgname;
```

**Expected Results:**
- [ ] `trigger_task_accepted` - Enabled
- [ ] `trigger_task_cancelled` - Enabled
- [ ] `trigger_task_completed` - Enabled
- [ ] `trigger_first_chat_message` - Enabled

**All triggers enabled:** ✅

---

## 🎯 Step 8: Production Readiness Check (5 minutes)

### Configuration Check:

- [ ] Interakt API key is production key (not test)
- [ ] All templates approved for production use
- [ ] Phone numbers in profiles table are validated
- [ ] Edge function deployed to production environment

### Functionality Check:

- [ ] Task accepted notifications working
- [ ] Chat message notifications working
- [ ] OTP notifications working (if using phone auth)
- [ ] All notification logs appear in database

### Performance Check:

```sql
-- Check last 24 hours of notifications
SELECT 
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM whatsapp_notifications
WHERE sent_at > NOW() - INTERVAL '24 hours';
```

**Results:**
- [ ] Total notifications: _____ 
- [ ] Sent successfully: _____ 
- [ ] Failed: _____ 
- [ ] Success rate: _____% (should be >90%)

---

## 📱 Step 9: User Testing (10 minutes)

**Test with 3-5 real users:**

- [ ] User 1 received task notifications ✅
- [ ] User 2 received chat notifications ✅
- [ ] User 3 received OTP via WhatsApp ✅
- [ ] User 4 tested full flow (create task → accept → complete) ✅
- [ ] User 5 feedback collected ✅

**User Feedback:**
- Positive: _________________________________
- Issues: _________________________________
- Suggestions: _________________________________

---

## 📈 Step 10: Monitoring Setup (5 minutes)

### Daily Monitoring SQL (bookmark this):

```sql
-- Daily stats
SELECT 
  DATE(sent_at) as date,
  template_name,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'sent') as delivered
FROM whatsapp_notifications
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at), template_name
ORDER BY date DESC, count DESC;
```

**Setup:**
- [ ] Bookmarked monitoring queries
- [ ] Added calendar reminder to check stats weekly
- [ ] Set up Interakt dashboard access for team

---

## 🎉 Step 11: Go Live!

**Final Pre-Launch Checklist:**

- [ ] All templates approved
- [ ] Edge function deployed
- [ ] Database migration complete
- [ ] Environment variables set
- [ ] All tests passed
- [ ] User testing successful
- [ ] Monitoring in place
- [ ] Team trained on troubleshooting

**Go-Live Date:** ________________

**Go-Live Time:** ________________

---

## 📊 Post-Launch Monitoring (First Week)

### Day 1:
- [ ] Check notification logs
- [ ] Verify delivery rate >90%
- [ ] No critical errors
- [ ] User feedback positive

### Day 3:
- [ ] Review 72-hour stats
- [ ] Check Interakt usage/quota
- [ ] Review failed notifications
- [ ] Optimize if needed

### Day 7:
- [ ] Week 1 complete statistics
- [ ] Cost analysis vs estimate
- [ ] User satisfaction survey
- [ ] Performance optimization plan

**Week 1 Stats:**
- Total sent: _______
- Delivery rate: _______%
- Cost: ₹_______
- User satisfaction: _______/10

---

## 🔧 Troubleshooting (If Issues Occur)

### Issue Checklist:

- [ ] Check Edge Function logs (Supabase → Edge Functions → Logs)
- [ ] Check `whatsapp_notifications` table for errors
- [ ] Verify Interakt API quota not exceeded
- [ ] Verify templates still approved
- [ ] Check phone number format in database
- [ ] Verify environment variables still set

**Common Fixes:**
- Template not found → Check approval status
- Phone format error → Update to 91XXXXXXXXXX format
- API error → Verify API key is correct
- No notifications → Check triggers enabled

---

## ✅ Success Criteria

**Implementation is successful when:**

- [ ] ✅ All 5 core templates working
- [ ] ✅ Task notifications auto-send within 5 seconds
- [ ] ✅ Chat notifications auto-send within 5 seconds
- [ ] ✅ OTP delivered via WhatsApp
- [ ] ✅ Delivery rate >90%
- [ ] ✅ No critical errors in 24 hours
- [ ] ✅ Positive user feedback
- [ ] ✅ Cost within budget

---

## 🎯 Next Steps (Optional)

**Phase 2 Features:**

- [ ] Add notification preferences (user settings)
- [ ] Set up delivery webhooks from Interakt
- [ ] Add rate limiting (max notifications per user)
- [ ] Create admin dashboard for stats
- [ ] A/B test template variations
- [ ] Add rich media to templates
- [ ] Implement smart batching

---

## 📞 Support Resources

**If stuck:**
1. Read: `INTERAKT_QUICK_START.md`
2. Check: Supabase Edge Function logs
3. Query: `SELECT * FROM whatsapp_notifications WHERE status = 'failed'`
4. Review: Interakt dashboard delivery reports

**Contact:**
- Interakt Support: support@interakt.ai
- Supabase Support: Via dashboard
- LocalFelo Dev Team: [your contact]

---

## 🎉 Completion

**I have completed all steps:** 

- [ ] ✅ Templates created and approved
- [ ] ✅ Edge function deployed
- [ ] ✅ Database migration done
- [ ] ✅ Environment variables set
- [ ] ✅ All tests passed
- [ ] ✅ Live users tested
- [ ] ✅ Monitoring active

**Completed by:** ________________

**Date:** ________________

**Status:** 🟢 LIVE AND OPERATIONAL

---

**Congratulations! WhatsApp notifications are now live! 🎉📱**

Users will receive instant WhatsApp notifications for all major events in LocalFelo.
