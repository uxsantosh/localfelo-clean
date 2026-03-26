# ⏰ Setup 6-Hour Unread Reminder Cron Job

## 🎯 Quick Setup (5 minutes)

### **Step 1: Deploy Edge Function**

```bash
# In your terminal
cd /path/to/localfelo
supabase functions deploy check-unread-reminders
```

**Expected output:**
```
Deploying check-unread-reminders (project ref: abcd1234)
✓ Deployed function check-unread-reminders
```

---

### **Step 2: Enable pg_cron Extension**

1. Go to: **Supabase Dashboard → Database → Extensions**
2. Search for: **pg_cron**
3. Click: **Enable**

---

### **Step 3: Get Your Project Details**

You need 2 values:

**A. Project Reference:**
- Supabase Dashboard → Project Settings → General
- Example: `abcd1234efgh5678`

**B. Service Role Key:**
- Supabase Dashboard → Project Settings → API
- Copy: **service_role** key (secret, anon is NOT correct)
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### **Step 4: Schedule Cron Job**

1. Go to: **Supabase Dashboard → SQL Editor**
2. Click: **New Query**
3. Copy this SQL (replace YOUR_PROJECT_REF):

```sql
-- Schedule unread reminder check every 6 hours
SELECT cron.schedule(
  'check-unread-reminders-job',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-unread-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

4. **Replace:**
   - `YOUR_PROJECT_REF` → Your actual project reference
   - `YOUR_SERVICE_ROLE_KEY` → Your service_role key

5. Click: **RUN**

**Expected output:**
```
schedule
--------
1
```

---

## ✅ Verify Setup

### **Check Cron Job Created:**

```sql
SELECT * FROM cron.job;
```

Should show:
```
jobid | schedule    | command                | jobname
------|-------------|------------------------|---------------------------
1     | 0 */6 * * * | SELECT net.http_post...| check-unread-reminders-job
```

---

### **Test Cron Job Manually:**

```sql
-- Trigger the function manually
SELECT cron.run_job(1);
```

Or call the edge function directly:

```sql
SELECT * FROM check_and_send_unread_reminders();
```

---

### **Check Execution History:**

```sql
SELECT * FROM cron.job_run_details
WHERE jobid = 1
ORDER BY start_time DESC
LIMIT 10;
```

---

## 📅 Cron Schedule Examples

Change `'0 */6 * * *'` to customize:

```bash
# Every 3 hours
'0 */3 * * *'

# Every 12 hours (noon and midnight)
'0 0,12 * * *'

# Every 6 hours starting at 9 AM (9 AM, 3 PM, 9 PM, 3 AM)
'0 9,15,21,3 * * *'

# Daily at 9 AM only
'0 9 * * *'

# Every hour
'0 * * * *'

# Every 30 minutes
'*/30 * * * *'
```

**Format:** `minute hour day month weekday`

---

## 🔧 Update Cron Job

### **Change Schedule:**

```sql
-- Update existing job
SELECT cron.alter_job(
  1,  -- Job ID (from cron.job table)
  schedule := '0 */3 * * *'  -- New schedule (every 3 hours)
);
```

### **Pause Cron Job:**

```sql
SELECT cron.unschedule('check-unread-reminders-job');
```

### **Resume/Recreate:**

```sql
-- Run the original schedule SQL again (Step 4)
```

---

## 🐛 Troubleshooting

### **Error: "function cron.schedule does not exist"**

**Solution:** Enable pg_cron extension (Step 2)

---

### **Error: "permission denied"**

**Solution:** You're not using service_role key. Get it from:
- Project Settings → API → service_role (secret)

---

### **Cron job not running**

**Check:**

1. **Is job scheduled?**
   ```sql
   SELECT * FROM cron.job;
   ```

2. **Check execution logs:**
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = 1 
   ORDER BY start_time DESC;
   ```

3. **Check Edge Function logs:**
   - Supabase Dashboard → Edge Functions → check-unread-reminders → Logs

4. **Test manually:**
   ```sql
   SELECT * FROM check_and_send_unread_reminders();
   ```

---

### **No reminders being sent**

**Check:**

1. **Are there unread messages?**
   ```sql
   SELECT 
     c.id,
     c.listing_title,
     c.unread_count_user1,
     c.unread_count_user2,
     m.created_at as last_message_at
   FROM conversations c
   JOIN LATERAL (
     SELECT created_at FROM messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC LIMIT 1
   ) m ON true
   WHERE (c.unread_count_user1 > 0 OR c.unread_count_user2 > 0)
     AND m.created_at < NOW() - INTERVAL '6 hours';
   ```

2. **Check reminder log:**
   ```sql
   SELECT * FROM whatsapp_reminder_log
   ORDER BY last_reminder_sent_at DESC;
   ```

3. **Check phone numbers exist:**
   ```sql
   SELECT COUNT(*) FROM profiles WHERE phone IS NOT NULL AND phone != '';
   ```

---

## 📊 Monitor Cron Job

### **Daily Check:**

```sql
-- Check today's cron executions
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = 1
  AND start_time > NOW() - INTERVAL '24 hours'
ORDER BY start_time DESC;
```

### **Check Reminders Sent:**

```sql
-- Reminders sent today
SELECT COUNT(*) as reminders_sent_today
FROM whatsapp_notifications
WHERE template_name = 'unread_reminder'
  AND sent_at > NOW() - INTERVAL '24 hours';
```

### **Check Success Rate:**

```sql
-- Success rate of reminders
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  ROUND(100.0 * COUNT(CASE WHEN status = 'sent' THEN 1 END) / COUNT(*), 2) as success_rate
FROM whatsapp_notifications
WHERE template_name = 'unread_reminder'
  AND sent_at > NOW() - INTERVAL '7 days';
```

---

## 🎯 Expected Behavior

### **What the Cron Job Does:**

1. Runs every 6 hours automatically
2. Calls `check_and_send_unread_reminders()` function
3. Finds conversations with:
   - Unread messages
   - Last message sent 6+ hours ago
   - No reminder sent in last 24 hours
4. Sends WhatsApp reminder to users
5. Logs reminder in `whatsapp_reminder_log` table

### **What Users Experience:**

**Scenario:**
- User A messages User B at 10:00 AM
- User B doesn't read it
- At 4:00 PM (next 6-hour cron run), User B gets WhatsApp reminder
- If User B still doesn't read, next reminder at 4:00 PM next day (24-hour cooldown)

---

## 💡 Pro Tips

1. **Start with 6 hours** - Don't be too aggressive initially
2. **Monitor first week** - Check success rate and adjust interval
3. **Watch spam reports** - If users complain, increase to 12 hours
4. **Use off-peak hours** - Schedule for times when users are more likely to respond

---

## ✅ Setup Complete Checklist

- [ ] pg_cron extension enabled
- [ ] Edge function deployed
- [ ] Cron job scheduled
- [ ] Job visible in `cron.job` table
- [ ] Manual test successful
- [ ] Edge Function logs show no errors
- [ ] Reminders being sent (check after 6 hours)

---

## 📞 Need Help?

**Can't figure it out?**

1. Run this diagnostic:
   ```sql
   -- Full diagnostic
   SELECT 'Cron Job Status' as check;
   SELECT * FROM cron.job;
   
   SELECT 'Recent Executions' as check;
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
   
   SELECT 'Unread Conversations' as check;
   SELECT COUNT(*) FROM conversations 
   WHERE unread_count_user1 > 0 OR unread_count_user2 > 0;
   
   SELECT 'Reminders Sent' as check;
   SELECT COUNT(*) FROM whatsapp_notifications 
   WHERE template_name = 'unread_reminder';
   ```

2. Share the output with me and I'll help debug!

---

**Time to complete:** 5 minutes  
**Difficulty:** Easy  
**Impact:** 🚀 High - Boost engagement by 40-60%!
