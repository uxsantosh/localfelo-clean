# 📱 WhatsApp Business API Integration - LocalFelo (FINAL)

## 🎯 Core Notifications (7 Types Only)

### 1. **OTP Verification** (Registration) ⚡ CRITICAL
- **When**: User signs up with phone number
- **Template**: `otp_verification`
- **Variables**: `{{1}}` = OTP code
- **Message**: 
  ```
  Your LocalFelo verification code is {{1}}. Valid for 10 minutes. Do not share this code.
  ```
- **Cost**: ₹0.40 per message
- **Frequency**: 1 per registration attempt

---

### 2. **Forgot Password OTP** ⚡ CRITICAL
- **When**: User requests password reset
- **Template**: `password_reset_otp`
- **Variables**: `{{1}}` = OTP code
- **Message**: 
  ```
  Your LocalFelo password reset code is {{1}}. Valid for 10 minutes. If you didn't request this, ignore this message.
  ```
- **Cost**: ₹0.40 per message
- **Frequency**: 1 per reset attempt
- **Rate Limit**: Max 3 per phone number per day (prevent abuse)

---

### 3. **Task Accepted** (Owner notification) 🔔 HIGH PRIORITY
- **When**: Helper accepts task
- **To**: Task Owner
- **Template**: `task_accepted`
- **Variables**: 
  - `{{1}}` = Helper name
  - `{{2}}` = Task title (truncated to 40 chars)
  - `{{3}}` = Deep link to chat
- **Message**: 
  ```
  🎉 {{1}} accepted your task "{{2}}". Start chat: {{3}}
  ```
- **Cost**: ₹0.80 per message
- **Deduplication**: Only FIRST acceptance per task (if multiple helpers somehow accept, only notify once)

---

### 4. **Task Cancelled** (Owner notification) 🔔 HIGH PRIORITY
- **When**: Helper cancels accepted task
- **To**: Task Owner
- **Template**: `task_cancelled`
- **Variables**: 
  - `{{1}}` = Helper name
  - `{{2}}` = Task title (truncated to 40 chars)
  - `{{3}}` = Deep link to task
- **Message**: 
  ```
  ⚠️ {{1}} cancelled task "{{2}}". Your task is open again: {{3}}
  ```
- **Cost**: ₹0.80 per message
- **Condition**: Only if task status was previously "accepted" (not for open tasks)

---

### 5. **Task Marked Complete** (Owner confirmation needed) 🔔 HIGH PRIORITY
- **When**: Helper marks task as complete
- **To**: Task Owner
- **Template**: `task_completion_request`
- **Variables**: 
  - `{{1}}` = Helper name
  - `{{2}}` = Task title (truncated to 40 chars)
  - `{{3}}` = Deep link to task confirmation
- **Message**: 
  ```
  ✅ {{1}} completed "{{2}}". Please verify and confirm: {{3}}
  ```
- **Cost**: ₹0.80 per message
- **Throttling**: Wait 30 minutes (in case helper marks multiple times)

---

### 6. **New Tasks Available** (Helper mode) 🚀 VERY IMPORTANT
- **When**: New task posted matching helper's preferences
- **To**: Active Helpers
- **Template**: `new_task_available`
- **Variables**: 
  - `{{1}}` = Task title (truncated to 40 chars)
  - `{{2}}` = Budget amount
  - `{{3}}` = Distance (e.g., "2.5 km away")
  - `{{4}}` = Deep link to task
- **Message**: 
  ```
  🆕 New task near you: "{{1}}" - ₹{{2}} - {{3}} - View: {{4}}
  ```
- **Cost**: ₹0.80 per message
- **Smart Filtering**:
  - Only notify helpers in "active helper mode"
  - Match task category with helper's selected skills
  - Within helper's preferred radius (default 10km)
  - Exclude if helper is task creator
- **Rate Limiting**: 
  - Max 5 task notifications per helper per day
  - Batch if multiple tasks posted quickly (wait 5 mins, send digest)
- **User Control**: 
  - Helper can enable/disable
  - Set preferred categories
  - Set preferred radius (5km, 10km, 20km, 50km)
  - Set max budget range

---

### 7. **Chat Reply After Long Silence** 💬 MEDIUM PRIORITY
- **When**: New message in conversation after >24 hours of silence
- **To**: Recipient
- **Template**: `chat_reply_reminder`
- **Variables**: 
  - `{{1}}` = Sender name
  - `{{2}}` = Listing/Task/Wish title (truncated to 40 chars)
  - `{{3}}` = Deep link to chat
- **Message**: 
  ```
  💬 {{1}} replied about "{{2}}" after a while. Check: {{3}}
  ```
- **Cost**: ₹0.80 per message
- **Conditions**:
  - Last message in conversation was >24 hours ago
  - Last message was from the OTHER person (not the recipient)
  - Only if user hasn't disabled this in settings
- **Rate Limit**: Max 1 per conversation per day
- **Deduplication**: Don't send if user already got another WhatsApp in last 2 hours

---

## 📊 Simplified Cost Estimation

### Daily Cost Breakdown (1000 Active Users)

| Notification Type | Daily Volume | Cost per Msg | Daily Cost |
|-------------------|--------------|--------------|------------|
| OTP Verification | 300 | ₹0.40 | ₹120 |
| Forgot Password | 50 | ₹0.40 | ₹20 |
| Task Accepted | 40 | ₹0.80 | ₹32 |
| Task Cancelled | 8 | ₹0.80 | ₹6.40 |
| Task Completed | 25 | ₹0.80 | ₹20 |
| **New Tasks (Helper)** | **100** | **₹0.80** | **₹80** |
| Chat After Silence | 30 | ₹0.80 | ₹24 |
| **TOTAL** | **553** | | **₹302.40** |

### Monthly Cost: **₹9,000 - ₹10,000** (very reasonable!)

### Cost Control Mechanisms:
1. **Global Daily Budget**: ₹400/day (₹12,000/month max)
2. **Per-User Limits**: 
   - OTP: Unlimited (critical)
   - Task notifications: Max 5/day per user
   - Chat reminders: Max 2/day per user
3. **Helper Mode Limits**: Max 5 new task notifications per helper per day
4. **Batching**: If 3+ tasks posted quickly, send 1 digest instead of 3 messages

---

## 🔧 Database Schema Updates

```sql
-- Add helper mode preferences to profiles
ALTER TABLE profiles ADD COLUMN helper_mode_active BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN helper_preferences JSONB DEFAULT '{
  "active": false,
  "categories": [],
  "radius_km": 10,
  "min_budget": null,
  "max_budget": null,
  "max_notifications_per_day": 5,
  "whatsapp_notifications": {
    "new_tasks": true,
    "task_updates": true,
    "chat_reminders": true
  }
}'::jsonb;

-- WhatsApp notification tracking table
CREATE TABLE whatsapp_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  template_name TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- otp, task_accepted, new_task, etc.
  message_id TEXT, -- WhatsApp Business API message ID
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, read, failed
  related_type TEXT, -- task, chat, wish, listing
  related_id UUID,
  template_variables JSONB, -- Store variables used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_whatsapp_notifications_user_id ON whatsapp_notifications(user_id);
CREATE INDEX idx_whatsapp_notifications_status ON whatsapp_notifications(status);
CREATE INDEX idx_whatsapp_notifications_type ON whatsapp_notifications(notification_type);
CREATE INDEX idx_whatsapp_notifications_created_at ON whatsapp_notifications(created_at);

-- Rate limiting table (per user per day)
CREATE TABLE whatsapp_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  otp_count INTEGER DEFAULT 0,
  task_notification_count INTEGER DEFAULT 0,
  new_task_count INTEGER DEFAULT 0,
  chat_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_whatsapp_rate_limits_date ON whatsapp_rate_limits(date);

-- Deduplication table (prevent duplicate notifications)
CREATE TABLE whatsapp_deduplication (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- task_accepted, task_cancelled, etc.
  related_id UUID NOT NULL, -- task_id, conversation_id, etc.
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(user_id, notification_type, related_id)
);

CREATE INDEX idx_whatsapp_dedup_expires ON whatsapp_deduplication(expires_at);

-- Cleanup expired deduplication records (run daily)
CREATE OR REPLACE FUNCTION cleanup_whatsapp_deduplication()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_deduplication WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 📱 Edge Function: `send-whatsapp-notification`

**Location**: `/supabase/functions/send-whatsapp-notification/index.ts`

### Request Interface:
```typescript
interface WhatsAppNotificationRequest {
  userId: string;
  phone: string; // E.164 format: +919876543210
  templateName: string; // otp_verification, task_accepted, etc.
  notificationType: string; // For logging/analytics
  templateVariables: string[]; // Array of variables for template
  relatedType?: string; // task, chat, wish, listing
  relatedId?: string; // UUID
  skipRateLimiting?: boolean; // Only for OTP (critical)
  skipDeduplication?: boolean; // Only for OTP
}
```

### Flow:
1. ✅ Validate request (phone, template, variables)
2. ✅ Check user preferences (is WhatsApp enabled?)
3. ✅ Check rate limits (unless skipRateLimiting = true)
4. ✅ Check deduplication (unless skipDeduplication = true)
5. ✅ Call WhatsApp Business API
6. ✅ Log to `whatsapp_notifications` table
7. ✅ Update `whatsapp_rate_limits` table
8. ✅ Return success/failure

### WhatsApp Business API Call:
```typescript
// Using Meta's WhatsApp Business API
const whatsappApiUrl = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

const response = await fetch(whatsappApiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: phone, // +919876543210
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en' // or 'hi' for Hindi
      },
      components: [
        {
          type: 'body',
          parameters: templateVariables.map(value => ({
            type: 'text',
            text: value
          }))
        }
      ]
    }
  })
});
```

---

## 🛠️ Service File: `services/whatsappNotifications.ts`

```typescript
// =====================================================
// WhatsApp Notification Service - LocalFelo
// =====================================================

import { supabase } from '../lib/supabaseClient';

interface WhatsAppNotificationOptions {
  userId: string;
  phone: string;
  templateName: string;
  notificationType: string;
  templateVariables: string[];
  relatedType?: string;
  relatedId?: string;
  skipRateLimiting?: boolean;
  skipDeduplication?: boolean;
}

/**
 * Send WhatsApp notification via edge function
 */
async function sendWhatsAppNotification(options: WhatsAppNotificationOptions): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: options
    });

    if (error) {
      console.error('[WhatsApp] Error:', error);
      return false;
    }

    return data?.success || false;
  } catch (error) {
    console.error('[WhatsApp] Failed to send:', error);
    return false;
  }
}

/**
 * 1. Send OTP for registration
 */
export async function sendWhatsAppOTP(phone: string, otp: string, userId?: string): Promise<boolean> {
  return sendWhatsAppNotification({
    userId: userId || 'anonymous',
    phone: phone.startsWith('+') ? phone : `+91${phone}`,
    templateName: 'otp_verification',
    notificationType: 'otp',
    templateVariables: [otp],
    skipRateLimiting: true, // OTP is critical
    skipDeduplication: true
  });
}

/**
 * 2. Send Forgot Password OTP
 */
export async function sendWhatsAppForgotPasswordOTP(phone: string, otp: string, userId: string): Promise<boolean> {
  return sendWhatsAppNotification({
    userId,
    phone: phone.startsWith('+') ? phone : `+91${phone}`,
    templateName: 'password_reset_otp',
    notificationType: 'forgot_password',
    templateVariables: [otp],
    skipRateLimiting: true, // Critical
    skipDeduplication: false // Prevent abuse
  });
}

/**
 * 3. Notify owner: Task accepted by helper
 */
export async function sendWhatsAppTaskAccepted(
  taskId: string,
  ownerId: string,
  ownerPhone: string,
  helperName: string,
  taskTitle: string
): Promise<boolean> {
  const deepLink = `https://localfelo.com/task/${taskId}/chat`;
  const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;

  return sendWhatsAppNotification({
    userId: ownerId,
    phone: ownerPhone.startsWith('+') ? ownerPhone : `+91${ownerPhone}`,
    templateName: 'task_accepted',
    notificationType: 'task_accepted',
    templateVariables: [helperName, truncatedTitle, deepLink],
    relatedType: 'task',
    relatedId: taskId
  });
}

/**
 * 4. Notify owner: Task cancelled by helper
 */
export async function sendWhatsAppTaskCancelled(
  taskId: string,
  ownerId: string,
  ownerPhone: string,
  helperName: string,
  taskTitle: string
): Promise<boolean> {
  const deepLink = `https://localfelo.com/task/${taskId}`;
  const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;

  return sendWhatsAppNotification({
    userId: ownerId,
    phone: ownerPhone.startsWith('+') ? ownerPhone : `+91${ownerPhone}`,
    templateName: 'task_cancelled',
    notificationType: 'task_cancelled',
    templateVariables: [helperName, truncatedTitle, deepLink],
    relatedType: 'task',
    relatedId: taskId
  });
}

/**
 * 5. Notify owner: Task marked complete by helper
 */
export async function sendWhatsAppTaskCompletionRequest(
  taskId: string,
  ownerId: string,
  ownerPhone: string,
  helperName: string,
  taskTitle: string
): Promise<boolean> {
  const deepLink = `https://localfelo.com/task/${taskId}/complete`;
  const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;

  return sendWhatsAppNotification({
    userId: ownerId,
    phone: ownerPhone.startsWith('+') ? ownerPhone : `+91${ownerPhone}`,
    templateName: 'task_completion_request',
    notificationType: 'task_completion_request',
    templateVariables: [helperName, truncatedTitle, deepLink],
    relatedType: 'task',
    relatedId: taskId
  });
}

/**
 * 6. Notify active helpers: New task available (VERY IMPORTANT)
 */
export async function notifyHelpersNewTask(
  taskId: string,
  taskTitle: string,
  taskBudget: number,
  taskCategoryId: number,
  taskLatitude: number,
  taskLongitude: number
): Promise<void> {
  try {
    // Find active helpers matching criteria
    const { data: helpers, error } = await supabase
      .from('profiles')
      .select('id, phone, name, helper_preferences')
      .eq('helper_mode_active', true);

    if (error || !helpers) {
      console.error('[WhatsApp] Failed to fetch active helpers:', error);
      return;
    }

    console.log(`[WhatsApp] Found ${helpers.length} active helpers`);

    // Filter and notify each helper
    for (const helper of helpers) {
      const prefs = helper.helper_preferences || {};
      
      // Check if helper has WhatsApp notifications enabled
      if (!prefs.whatsapp_notifications?.new_tasks) {
        continue;
      }

      // Check category match
      const preferredCategories = prefs.categories || [];
      if (preferredCategories.length > 0 && !preferredCategories.includes(taskCategoryId)) {
        continue;
      }

      // Check budget range
      if (prefs.min_budget && taskBudget < prefs.min_budget) {
        continue;
      }
      if (prefs.max_budget && taskBudget > prefs.max_budget) {
        continue;
      }

      // Check distance (if helper has location)
      // For now, we'll use radius from preferences (default 10km)
      // In production, you'd calculate actual distance
      const radiusKm = prefs.radius_km || 10;

      // Check daily rate limit for new task notifications
      const { data: rateLimit } = await supabase
        .from('whatsapp_rate_limits')
        .select('new_task_count')
        .eq('user_id', helper.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const maxPerDay = prefs.max_notifications_per_day || 5;
      if (rateLimit && rateLimit.new_task_count >= maxPerDay) {
        console.log(`[WhatsApp] Helper ${helper.id} reached daily limit (${maxPerDay})`);
        continue;
      }

      // Calculate distance (simplified - using straight line)
      const distance = calculateDistance(
        taskLatitude,
        taskLongitude,
        0, 0 // Helper's location (you'll need to store this)
      );

      const distanceText = distance < 1 
        ? `${Math.round(distance * 1000)}m away`
        : `${distance.toFixed(1)}km away`;

      const deepLink = `https://localfelo.com/task/${taskId}`;
      const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;

      // Send WhatsApp notification
      await sendWhatsAppNotification({
        userId: helper.id,
        phone: helper.phone,
        templateName: 'new_task_available',
        notificationType: 'new_task',
        templateVariables: [
          truncatedTitle,
          taskBudget.toString(),
          distanceText,
          deepLink
        ],
        relatedType: 'task',
        relatedId: taskId
      });

      console.log(`[WhatsApp] Notified helper ${helper.name} about new task`);
    }
  } catch (error) {
    console.error('[WhatsApp] Failed to notify helpers:', error);
  }
}

/**
 * 7. Notify user: Chat reply after long silence
 */
export async function sendWhatsAppChatReply(
  conversationId: string,
  recipientId: string,
  recipientPhone: string,
  senderName: string,
  listingTitle: string
): Promise<boolean> {
  const deepLink = `https://localfelo.com/chat/${conversationId}`;
  const truncatedTitle = listingTitle.length > 40 ? listingTitle.substring(0, 37) + '...' : listingTitle;

  return sendWhatsAppNotification({
    userId: recipientId,
    phone: recipientPhone.startsWith('+') ? recipientPhone : `+91${recipientPhone}`,
    templateName: 'chat_reply_reminder',
    notificationType: 'chat_reply',
    templateVariables: [senderName, truncatedTitle, deepLink],
    relatedType: 'conversation',
    relatedId: conversationId
  });
}

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

---

## 🔌 Integration Points in Existing Code

### 1. **OTP Verification** 
**File**: `/supabase/functions/send-otp/index.ts` (Line 60)
```typescript
// REPLACE 2Factor SMS with WhatsApp
import { sendWhatsAppOTP } from '../../../services/whatsappNotifications.ts';

// Instead of calling 2Factor API
const success = await sendWhatsAppOTP(phone, generatedOTP);
```

### 2. **Task Accepted**
**File**: `/services/tasks.ts` (After line 1050)
```typescript
// After in-app notification sent
const { sendWhatsAppTaskAccepted } = await import('./whatsappNotifications');

// Get owner's phone
const { data: ownerProfile } = await supabase
  .from('profiles')
  .select('phone')
  .eq('id', updatedTask.userId)
  .single();

if (ownerProfile?.phone) {
  sendWhatsAppTaskAccepted(
    taskId,
    updatedTask.userId,
    ownerProfile.phone,
    helperName,
    updatedTask.title
  ).catch(err => console.warn('[WhatsApp] Failed:', err));
}
```

### 3. **Task Cancelled**
**File**: `/services/tasks.ts` (After line 1150)
```typescript
// After cancellation logic
const { sendWhatsAppTaskCancelled } = await import('./whatsappNotifications');

const { data: ownerProfile } = await supabase
  .from('profiles')
  .select('phone')
  .eq('id', taskData.user_id)
  .single();

if (ownerProfile?.phone) {
  sendWhatsAppTaskCancelled(
    taskId,
    taskData.user_id,
    ownerProfile.phone,
    helperName,
    taskData.title
  ).catch(err => console.warn('[WhatsApp] Failed:', err));
}
```

### 4. **Task Marked Complete**
**File**: `/services/tasks.ts` (Find completion request logic)
```typescript
const { sendWhatsAppTaskCompletionRequest } = await import('./whatsappNotifications');

const { data: ownerProfile } = await supabase
  .from('profiles')
  .select('phone')
  .eq('id', taskData.user_id)
  .single();

if (ownerProfile?.phone) {
  sendWhatsAppTaskCompletionRequest(
    taskId,
    taskData.user_id,
    ownerProfile.phone,
    helperName,
    taskData.title
  ).catch(err => console.warn('[WhatsApp] Failed:', err));
}
```

### 5. **New Task Available (Helper Mode)** ⭐ VERY IMPORTANT
**File**: `/services/tasks.ts` (After task creation - in createTask function)
```typescript
// After task is successfully created
const { notifyHelpersNewTask } = await import('./whatsappNotifications');

// Notify active helpers about new task (non-blocking)
notifyHelpersNewTask(
  result.taskId,
  taskData.title,
  taskData.budget,
  taskData.categoryId,
  taskData.latitude,
  taskData.longitude
).catch(err => console.warn('[WhatsApp] Failed to notify helpers:', err));
```

### 6. **Chat Reply After Long Silence**
**File**: `/services/chat.ts` (After line 448)
```typescript
// Check if this is a reply after long silence
const { data: lastMessage } = await supabase
  .from('messages')
  .select('created_at')
  .eq('conversation_id', conversationId)
  .neq('sender_id', userId) // Exclude current sender
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (lastMessage) {
  const hoursSinceLastReply = 
    (Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastReply > 24) {
    const { sendWhatsAppChatReply } = await import('./whatsappNotifications');
    
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('phone, helper_preferences')
      .eq('id', recipientId)
      .single();

    // Check if user has chat reminders enabled
    const chatRemindersEnabled = 
      recipientProfile?.helper_preferences?.whatsapp_notifications?.chat_reminders !== false;

    if (recipientProfile?.phone && chatRemindersEnabled) {
      sendWhatsAppChatReply(
        conversationId,
        recipientId,
        recipientProfile.phone,
        currentUser.name,
        conv.listing_title
      ).catch(err => console.warn('[WhatsApp] Failed:', err));
    }
  }
}
```

---

## 🎨 UI Updates Needed

### 1. **Helper Mode Settings** (New Screen/Section)

**Location**: Profile → Helper Mode

```
🔧 Helper Mode
├─ [ ON/OFF Toggle ] Active Helper Mode
│
├─ 📍 Service Radius
│  └─ [ 5km | 10km | 20km | 50km ]
│
├─ 🏷️ Service Categories (Select multiple)
│  ├─ ☑ Home Repair
│  ├─ ☑ Plumbing
│  ├─ ☐ Electrical
│  ├─ ☐ Cleaning
│  └─ ☐ Painting
│
├─ 💰 Budget Range
│  ├─ Min: [₹ 500]
│  └─ Max: [₹ 5000]
│
└─ 📱 WhatsApp Notifications
   ├─ ☑ New Tasks Near Me (Max 5/day)
   ├─ ☑ Task Updates
   └─ ☑ Chat Reminders
```

### 2. **Profile Settings → Notifications**

```
📱 WhatsApp Notifications

⚠️ Critical (Always On)
├─ ✓ OTP Verification
└─ ✓ Forgot Password

🔔 Task Updates
├─ ✓ Task Accepted
├─ ✓ Task Cancelled
└─ ✓ Task Completed

💬 Chat
└─ ☑ Reply Reminders (24hr silence)

🆕 Helper Mode (Configure in Helper Settings)
└─ ☑ New Tasks Near Me
```

---

## 📋 WhatsApp Message Templates (Submit to Meta)

### Template Submissions:

1. **otp_verification** (Category: AUTHENTICATION)
   ```
   Your LocalFelo verification code is {{1}}. Valid for 10 minutes. Do not share this code.
   ```

2. **password_reset_otp** (Category: AUTHENTICATION)
   ```
   Your LocalFelo password reset code is {{1}}. Valid for 10 minutes. If you didn't request this, ignore this message.
   ```

3. **task_accepted** (Category: ACCOUNT_UPDATE)
   ```
   🎉 {{1}} accepted your task "{{2}}". Start chat: {{3}}
   ```

4. **task_cancelled** (Category: ACCOUNT_UPDATE)
   ```
   ⚠️ {{1}} cancelled task "{{2}}". Your task is open again: {{3}}
   ```

5. **task_completion_request** (Category: ACCOUNT_UPDATE)
   ```
   ✅ {{1}} completed "{{2}}". Please verify and confirm: {{3}}
   ```

6. **new_task_available** (Category: ACCOUNT_UPDATE)
   ```
   🆕 New task near you: "{{1}}" - ₹{{2}} - {{3}} - View: {{4}}
   ```

7. **chat_reply_reminder** (Category: MARKETING - User can opt-out)
   ```
   💬 {{1}} replied about "{{2}}" after a while. Check: {{3}}
   ```

---

## 🚀 Implementation Phases

### ✅ Phase 1: Setup (Week 1)
- [ ] Apply for WhatsApp Business API account
- [ ] Submit 7 templates to Meta for approval (2-3 days)
- [ ] Create database tables (schema above)
- [ ] Create edge function `send-whatsapp-notification`
- [ ] Create service file `whatsappNotifications.ts`
- [ ] Test edge function with dummy data

### ✅ Phase 2: Critical Notifications (Week 2)
- [ ] Implement OTP via WhatsApp (replace SMS)
- [ ] Implement Forgot Password OTP
- [ ] Test with real phone numbers
- [ ] Monitor delivery rates

### ✅ Phase 3: Task Notifications (Week 2-3)
- [ ] Implement Task Accepted
- [ ] Implement Task Cancelled
- [ ] Implement Task Completion Request
- [ ] Add deduplication logic
- [ ] Test task flows end-to-end

### ✅ Phase 4: Helper Mode (Week 3) ⭐ VERY IMPORTANT
- [ ] Create Helper Mode UI (Profile → Helper Settings)
- [ ] Implement `notifyHelpersNewTask` function
- [ ] Add location-based filtering
- [ ] Add category matching
- [ ] Add budget range filtering
- [ ] Add rate limiting (max 5/day per helper)
- [ ] Test with multiple active helpers

### ✅ Phase 5: Chat Notifications (Week 4)
- [ ] Implement Chat Reply After Silence
- [ ] Add user preferences toggle
- [ ] Test conversation flows

### ✅ Phase 6: Polish & Monitor (Week 4)
- [ ] Create admin analytics dashboard
- [ ] Add cost monitoring alerts
- [ ] Optimize rate limiting
- [ ] A/B test message templates
- [ ] Gather user feedback

---

## 🎯 Success Metrics (After 1 Month)

| Metric | Target |
|--------|--------|
| OTP Delivery Rate | >95% |
| WhatsApp Message Read Rate | >80% |
| Helper Response Time | <30 min |
| Task Acceptance Rate | +40% |
| User Opt-Out Rate | <5% |
| Monthly WhatsApp Cost | <₹12,000 |
| Helper Mode Adoption | >30% of users |

---

## 💰 Final Cost Summary

**Conservative Estimate (1000 active users):**
- **Daily**: ₹300
- **Monthly**: ₹9,000
- **With 10% buffer**: ₹10,000/month

**This is VERY affordable** for a critical business feature! 🎉

---

## ✅ Next Steps

1. **Review this plan** - Any changes needed?
2. **Apply for WhatsApp Business API** - I'll help with application
3. **Say "implement"** - I'll create all the code files
4. **Test in staging** - Before going live

**Ready to start coding?** 🚀
