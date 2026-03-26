# 📱 WhatsApp Business API Integration Plan - LocalFelo

## 🎯 Core Objective
Send **smart, cost-effective WhatsApp notifications** for critical user activities only, maximizing user engagement while minimizing API costs.

---

## 💡 Smart Cost Optimization Strategy

### 1. **Message Prioritization (3-Tier System)**

#### 🔴 **TIER 1 - CRITICAL (Always Send WhatsApp)**
*These are business-critical and justify the cost*

1. **OTP Verification** (Registration & Forgot Password)
   - Template: `otp_verification`
   - Variables: `{{otp_code}}`, `{{app_name}}`
   - Why: Without this, users can't access the app
   - Cost impact: 1 message per login/registration attempt

2. **Task Accepted by Helper** 
   - Template: `task_accepted`
   - Variables: `{{helper_name}}`, `{{task_title}}`, `{{task_link}}`
   - Why: Owner needs to know someone will do the work
   - Cost impact: 1 message per task acceptance
   - **Deduplication**: Max 1 WhatsApp per task (even if multiple helpers accept)

3. **Task Cancelled by Helper**
   - Template: `task_cancelled`
   - Variables: `{{helper_name}}`, `{{task_title}}`, `{{task_link}}`
   - Why: Owner needs to find another helper urgently
   - Cost impact: 1 message per cancellation
   - **Deduplication**: Only if task was previously accepted

#### 🟡 **TIER 2 - IMPORTANT (Send with Smart Throttling)**
*Important but can be batched or delayed*

4. **Task Completion Request** (Helper marks as complete, needs owner confirmation)
   - Template: `task_completion_request`
   - Variables: `{{helper_name}}`, `{{task_title}}`, `{{task_link}}`
   - Why: Owner needs to verify work and confirm
   - Cost impact: 1 message per completion request
   - **Throttling**: Wait 30 mins before sending (in case helper marks multiple times)

5. **First Message in New Chat**
   - Template: `new_message_received`
   - Variables: `{{sender_name}}`, `{{listing_title}}`, `{{chat_link}}`
   - Why: Shows someone is interested in their listing/task/wish
   - Cost impact: 1 message per new conversation
   - **Deduplication**: Only for FIRST message in a conversation

6. **Task Completed (Both Confirmed)**
   - Template: `task_completed`
   - Variables: `{{task_title}}`, `{{helper_name}}`, `{{rating_link}}`
   - Why: Closure notification + prompt to rate
   - Cost impact: 2 messages (1 to owner, 1 to helper)

#### 🟢 **TIER 3 - NICE-TO-HAVE (Optional/User Preference)**
*Send only if user explicitly enabled*

7. **Reply After Long Silence** (>24 hours inactive chat)
   - Template: `chat_reply_reminder`
   - Variables: `{{sender_name}}`, `{{listing_title}}`, `{{chat_link}}`
   - Why: Re-engage dormant conversations
   - Cost impact: Variable (could be many)
   - **User Control**: User can disable this in settings
   - **Rate Limit**: Max 1 per conversation per day

8. **Price Drop / Budget Match** (Future feature)
   - Only if user opted-in to price alerts

---

## 📋 WhatsApp Message Templates (Need Pre-Approval)

### Template 1: OTP Verification
```
Your LocalFelo verification code is {{1}}. Valid for 10 minutes. Do not share this code with anyone.
```
- **Category**: Authentication
- **Language**: English, Hindi
- **Variables**: `{{1}}` = OTP code

### Template 2: Task Accepted
```
🎉 Great news! {{1}} has accepted your task "{{2}}". Start chatting: {{3}}
```
- **Category**: Account Update
- **Variables**: 
  - `{{1}}` = Helper name
  - `{{2}}` = Task title (max 50 chars)
  - `{{3}}` = Deep link to chat

### Template 3: Task Cancelled
```
⚠️ {{1}} cancelled the task "{{2}}". Your task is now open for others. View: {{3}}
```
- **Category**: Account Update
- **Variables**: 
  - `{{1}}` = Helper name
  - `{{2}}` = Task title
  - `{{3}}` = Deep link to task

### Template 4: Task Completion Request
```
✅ {{1}} marked "{{2}}" as complete. Please verify and confirm: {{3}}
```
- **Category**: Account Update
- **Variables**: 
  - `{{1}}` = Helper name
  - `{{2}}` = Task title
  - `{{3}}` = Deep link to task

### Template 5: New Message Received
```
💬 {{1}} sent you a message about "{{2}}". Reply now: {{3}}
```
- **Category**: Account Update
- **Variables**: 
  - `{{1}}` = Sender name
  - `{{2}}` = Listing/Task/Wish title
  - `{{3}}` = Deep link to chat

### Template 6: Task Completed
```
🎊 Task "{{1}}" completed with {{2}}! Rate your experience: {{3}}
```
- **Category**: Account Update
- **Variables**: 
  - `{{1}}` = Task title
  - `{{2}}` = Other party name
  - `{{3}}` = Deep link to rating

### Template 7: Chat Reply Reminder
```
📩 {{1}} replied to your chat about "{{2}}". Check message: {{3}}
```
- **Category**: Marketing (User can opt-out)
- **Variables**: 
  - `{{1}}` = Sender name
  - `{{2}}` = Listing title
  - `{{3}}` = Deep link to chat

---

## 🔧 Technical Implementation

### Architecture

```
User Action → Notification Service → WhatsApp Queue → WhatsApp Business API
                     ↓
              [Rate Limiter]
              [Deduplicator]
              [User Preferences]
                     ↓
              [Cost Logger]
```

### Database Schema Updates

```sql
-- Add WhatsApp notification preferences to profiles
ALTER TABLE profiles ADD COLUMN whatsapp_notifications JSONB DEFAULT '{
  "enabled": true,
  "tier1_critical": true,
  "tier2_important": true,
  "tier3_optional": false,
  "max_per_day": 10,
  "quiet_hours_start": null,
  "quiet_hours_end": null
}'::jsonb;

-- Add WhatsApp notification tracking table
CREATE TABLE whatsapp_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  template_name TEXT NOT NULL,
  message_id TEXT, -- WhatsApp Business API message ID
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, read, failed
  tier TEXT NOT NULL, -- tier1, tier2, tier3
  related_type TEXT, -- task, chat, wish, listing
  related_id UUID,
  cost_units INTEGER DEFAULT 1, -- Cost in API units
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_whatsapp_notifications_user_id ON whatsapp_notifications(user_id);
CREATE INDEX idx_whatsapp_notifications_status ON whatsapp_notifications(status);
CREATE INDEX idx_whatsapp_notifications_created_at ON whatsapp_notifications(created_at);

-- Add rate limiting table
CREATE TABLE whatsapp_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  tier1_count INTEGER DEFAULT 0,
  tier2_count INTEGER DEFAULT 0,
  tier3_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  UNIQUE(user_id, date)
);

-- Deduplication tracking (prevent duplicate notifications for same event)
CREATE TABLE whatsapp_deduplication (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- task_accepted, task_cancelled, etc.
  related_id UUID NOT NULL, -- task_id, conversation_id, etc.
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(user_id, event_type, related_id)
);

CREATE INDEX idx_whatsapp_dedup_expires ON whatsapp_deduplication(expires_at);
```

### Edge Function: `send-whatsapp-notification`

**Location**: `/supabase/functions/send-whatsapp-notification/index.ts`

```typescript
interface WhatsAppNotificationRequest {
  userId: string;
  phone: string;
  templateName: string;
  templateVariables: string[]; // Array of variables for template
  tier: 'tier1' | 'tier2' | 'tier3';
  relatedType?: string;
  relatedId?: string;
  skipRateLimiting?: boolean; // For critical OTP messages
}

// Flow:
// 1. Check user preferences
// 2. Check rate limits (unless skipRateLimiting = true)
// 3. Check deduplication
// 4. Send to WhatsApp Business API
// 5. Log to whatsapp_notifications table
// 6. Update rate_limits table
```

### Service File: `services/whatsappNotifications.ts`

```typescript
// Wrapper functions for each notification type

export async function sendWhatsAppOTP(phone: string, otp: string)
export async function sendWhatsAppTaskAccepted(taskId: string, ownerId: string, helperName: string)
export async function sendWhatsAppTaskCancelled(taskId: string, ownerId: string, helperName: string)
export async function sendWhatsAppTaskCompletionRequest(taskId: string, ownerId: string, helperName: string)
export async function sendWhatsAppNewMessage(conversationId: string, recipientId: string, senderName: string)
export async function sendWhatsAppTaskCompleted(taskId: string, userId: string, otherPartyName: string)
export async function sendWhatsAppChatReply(conversationId: string, recipientId: string, senderName: string)
```

---

## 💰 Cost Estimation & Optimization

### WhatsApp Business API Pricing (Approximate)
- **Authentication Templates** (OTP): ₹0.30 - ₹0.50 per message
- **Utility Templates** (Task updates): ₹0.50 - ₹1.00 per message
- **Marketing Templates** (Chat reminders): ₹1.00 - ₹2.00 per message
- **Session Messages** (within 24hr window): ₹0.30 - ₹0.50 per message

### Daily Cost Scenarios (1000 Active Users)

**Scenario 1: Conservative (Tier 1 Only)**
- 500 OTP messages/day × ₹0.40 = ₹200
- 50 task accepted × ₹0.80 = ₹40
- 10 task cancelled × ₹0.80 = ₹8
- **Daily Total**: ~₹250 (₹7,500/month)

**Scenario 2: Moderate (Tier 1 + Tier 2)**
- Tier 1: ₹250
- 30 completion requests × ₹0.80 = ₹24
- 100 first messages × ₹0.80 = ₹80
- 20 task completed × ₹0.80 = ₹16
- **Daily Total**: ~₹370 (₹11,100/month)

**Scenario 3: Maximum (All Tiers)**
- Tier 1 + 2: ₹370
- 200 chat reply reminders × ₹1.50 = ₹300
- **Daily Total**: ~₹670 (₹20,100/month)

### Cost Control Mechanisms

1. **Per-User Daily Limits**
   - Default: 10 WhatsApp messages/day per user
   - Critical (Tier 1): Unlimited
   - Important (Tier 2): Max 5/day
   - Optional (Tier 3): Max 2/day

2. **Global Daily Budget**
   - Set max spend: ₹500/day (₹15,000/month)
   - Once reached, queue Tier 3 messages for next day
   - Never block Tier 1 (critical)

3. **Batching Strategy**
   - Tier 2 messages: Wait 5 minutes, batch similar events
   - Tier 3 messages: Wait 30 minutes, send digest if multiple

4. **Smart Deduplication**
   - Same task accepted by multiple helpers → Send 1 WhatsApp only
   - Multiple messages in same conversation → Only first message gets WhatsApp
   - Task status changes rapidly → Wait 10 mins before sending

---

## 🔄 Integration Points in Existing Code

### 1. OTP Verification
**File**: `/supabase/functions/send-otp/index.ts`
- Change from 2Factor SMS to WhatsApp Business API
- Same verification flow, different delivery channel
- Keep 2Factor as fallback for non-WhatsApp users

### 2. Task Accepted
**File**: `/services/tasks.ts` (Line 1045)
```typescript
// After in-app notification (line 1045)
const { sendWhatsAppTaskAccepted } = await import('./whatsappNotifications');
sendWhatsAppTaskAccepted(taskId, updatedTask.userId, helperName).catch(err => 
  console.warn('[TaskService] WhatsApp notification failed:', err)
);
```

### 3. Task Cancelled
**File**: `/services/tasks.ts` (Line 1078+)
```typescript
// After sending in-app notification
const { sendWhatsAppTaskCancelled } = await import('./whatsappNotifications');
sendWhatsAppTaskCancelled(taskId, taskData.user_id, helperName).catch(err => 
  console.warn('[TaskService] WhatsApp notification failed:', err)
);
```

### 4. Task Completion Request
**File**: `/services/tasks.ts` (Search for task completion logic)
```typescript
// When helper marks task complete
const { sendWhatsAppTaskCompletionRequest } = await import('./whatsappNotifications');
sendWhatsAppTaskCompletionRequest(taskId, taskData.user_id, helperName).catch(err => 
  console.warn('[TaskService] WhatsApp notification failed:', err)
);
```

### 5. First Message in Chat
**File**: `/services/chat.ts` (Line 448)
```typescript
// After sending in-app notification
// Check if this is the first message in conversation
const { data: messageCount } = await supabase
  .from('messages')
  .select('id', { count: 'exact' })
  .eq('conversation_id', conversationId);

if (messageCount?.length === 1) { // Only 1 message = first message
  const { sendWhatsAppNewMessage } = await import('./whatsappNotifications');
  sendWhatsAppNewMessage(conversationId, recipientId, currentUser.name).catch(err => 
    console.warn('[ChatService] WhatsApp notification failed:', err)
  );
}
```

### 6. Chat Reply After Long Silence
**File**: `/services/chat.ts` (Line 448)
```typescript
// Check last message timestamp
const { data: lastMessage } = await supabase
  .from('messages')
  .select('created_at')
  .eq('conversation_id', conversationId)
  .neq('sender_id', userId) // Exclude current sender's messages
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

const hoursSinceLastReply = lastMessage 
  ? (Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60)
  : 999;

if (hoursSinceLastReply > 24) {
  const { sendWhatsAppChatReply } = await import('./whatsappNotifications');
  sendWhatsAppChatReply(conversationId, recipientId, currentUser.name).catch(err => 
    console.warn('[ChatService] WhatsApp notification failed:', err)
  );
}
```

---

## 🎨 User Settings UI

### Profile Settings → Notifications

```
WhatsApp Notifications
├─ 🟢 Enabled
│
├─ Critical Notifications (Always On)
│  ├─ ✓ OTP Verification
│  ├─ ✓ Task Accepted
│  └─ ✓ Task Cancelled
│
├─ Important Notifications
│  ├─ ✓ Task Completion Requests
│  ├─ ✓ New Messages
│  └─ ✓ Task Completed
│
└─ Optional Notifications
   ├─ ☐ Chat Reply Reminders
   └─ ☐ Price Alerts (Future)

Daily Limit: [10] messages per day
Quiet Hours: [22:00] to [08:00]
```

---

## 📊 Analytics & Monitoring

### Metrics to Track
1. **Delivery Rate** (sent vs delivered)
2. **Read Rate** (delivered vs read)
3. **Cost per notification type**
4. **User engagement** (click-through on deep links)
5. **Opt-out rate** (users disabling WhatsApp)
6. **Failed notifications** (incorrect numbers, blocked users)

### Dashboard Queries

```sql
-- Daily WhatsApp cost
SELECT 
  DATE(created_at) as date,
  tier,
  COUNT(*) as message_count,
  SUM(cost_units) as total_cost_units
FROM whatsapp_notifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), tier
ORDER BY date DESC;

-- Delivery success rate
SELECT 
  template_name,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  ROUND(100.0 * COUNT(CASE WHEN status = 'delivered' THEN 1 END) / COUNT(*), 2) as delivery_rate
FROM whatsapp_notifications
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY template_name;

-- Top users by WhatsApp notifications received
SELECT 
  p.name,
  p.phone,
  COUNT(*) as notification_count,
  MAX(wn.created_at) as last_notification
FROM whatsapp_notifications wn
JOIN profiles p ON wn.user_id = p.id
WHERE wn.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.phone
ORDER BY notification_count DESC
LIMIT 20;
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Apply for WhatsApp Business API account
- [ ] Submit templates for approval
- [ ] Set up database schema (tables above)
- [ ] Create edge function `send-whatsapp-notification`
- [ ] Create service file `whatsappNotifications.ts`

### Phase 2: Critical Notifications (Week 2)
- [ ] Implement Tier 1 notifications
  - [ ] OTP verification (replace SMS)
  - [ ] Task accepted
  - [ ] Task cancelled
- [ ] Test with real users (beta group)
- [ ] Monitor costs daily

### Phase 3: Important Notifications (Week 3)
- [ ] Implement Tier 2 notifications
  - [ ] Task completion request
  - [ ] First message in chat
  - [ ] Task completed
- [ ] Add rate limiting
- [ ] Add deduplication logic

### Phase 4: Optional & Polish (Week 4)
- [ ] Implement Tier 3 notifications
  - [ ] Chat reply reminders
- [ ] Build user settings UI
- [ ] Create admin analytics dashboard
- [ ] Add cost alerts (if exceeding budget)

---

## 🎯 Success Metrics

**After 1 Month:**
- ✅ 95%+ OTP delivery rate
- ✅ 80%+ WhatsApp message read rate
- ✅ <5% opt-out rate
- ✅ 30%+ increase in task acceptance response time
- ✅ 50%+ increase in chat response rate
- ✅ WhatsApp cost < ₹15,000/month

---

## 🔐 Security & Privacy

1. **Phone Number Validation**
   - Verify phone is valid WhatsApp number before sending
   - Handle users without WhatsApp gracefully (fallback to SMS)

2. **User Consent**
   - Users opt-in during registration
   - Clear opt-out mechanism in settings
   - Comply with WhatsApp Business Policy

3. **Rate Limiting**
   - Prevent spam/abuse
   - Respect user preferences
   - Never exceed daily limits

4. **Data Privacy**
   - Don't send sensitive data in WhatsApp messages
   - Use deep links to app for details
   - Log only metadata, not message content

---

## 📝 Next Steps

**Ready to implement?**

1. I'll create all the files (edge function, service, database migrations)
2. You'll need to:
   - Apply for WhatsApp Business API access
   - Get templates approved by Meta
   - Set up Supabase secrets for WhatsApp API credentials
3. We'll test in staging first before production

**Estimated Timeline**: 3-4 weeks from start to full rollout

**Want me to start coding?** Just say "yes" and I'll begin with Phase 1! 🚀
