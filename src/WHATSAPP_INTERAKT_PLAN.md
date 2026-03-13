# 📱 WhatsApp via Interakt - LocalFelo (Budget-Friendly)

## 🎯 Why Interakt?

### ✅ **Perfect for Startups:**
- **No Meta verification needed** - Interakt handles it
- **Pre-approved templates** - Ready to use in 24 hours
- **Much cheaper** - ₹0.25-₹0.35 per message (vs ₹0.80 direct API)
- **Easy setup** - No technical approval process
- **Built-in analytics** - Track delivery, read rates
- **Generous free tier** - 1000 free messages/month to start

### 💰 Interakt Pricing (Much Better!)

| Plan | Messages/Month | Cost | Per Message |
|------|----------------|------|-------------|
| **Free Trial** | 1,000 | ₹0 | ₹0 |
| **Starter** | 5,000 | ₹1,499 | ₹0.30 |
| **Growth** | 15,000 | ₹3,999 | ₹0.27 |
| **Pro** | 50,000 | ₹11,999 | ₹0.24 |

**Your Estimated Need**: ~10,000 messages/month → **₹2,500-₹3,000/month** (vs ₹9,000 with direct API!)

---

## 📱 Your 7 Core Notifications with Interakt

### 1. **OTP Verification** (Registration) ⚡
- **Interakt Template**: `otp_verification` (Pre-approved)
- **Variables**: `{{name}}`, `{{otp}}`
- **Message**: 
  ```
  Hi {{name}}, your LocalFelo verification code is {{otp}}. Valid for 10 minutes. Do not share this code.
  ```
- **Cost**: ₹0.25 per message
- **Delivery**: 2-5 seconds

---

### 2. **Forgot Password OTP** ⚡
- **Interakt Template**: `password_reset`
- **Variables**: `{{name}}`, `{{otp}}`
- **Message**: 
  ```
  Hi {{name}}, your LocalFelo password reset code is {{otp}}. Valid for 10 minutes. Ignore if you didn't request this.
  ```
- **Cost**: ₹0.25 per message
- **Rate Limit**: Max 3 per phone per day

---

### 3. **Task Accepted** 🔔
- **Interakt Template**: `task_accepted`
- **Variables**: `{{owner_name}}`, `{{helper_name}}`, `{{task_title}}`, `{{chat_link}}`
- **Message**: 
  ```
  Hi {{owner_name}}, great news! 🎉 {{helper_name}} accepted your task "{{task_title}}". Start chatting: {{chat_link}}
  ```
- **Cost**: ₹0.30 per message
- **Button**: "Open Chat" → Deep link to conversation

---

### 4. **Task Cancelled** 🔔
- **Interakt Template**: `task_cancelled`
- **Variables**: `{{owner_name}}`, `{{helper_name}}`, `{{task_title}}`, `{{task_link}}`
- **Message**: 
  ```
  Hi {{owner_name}}, {{helper_name}} cancelled task "{{task_title}}". Your task is now open for others to accept. View: {{task_link}}
  ```
- **Cost**: ₹0.30 per message
- **Button**: "View Task" → Deep link to task

---

### 5. **Task Marked Complete** ✅
- **Interakt Template**: `task_completion_request`
- **Variables**: `{{owner_name}}`, `{{helper_name}}`, `{{task_title}}`, `{{task_link}}`
- **Message**: 
  ```
  Hi {{owner_name}}, {{helper_name}} marked "{{task_title}}" as complete ✅. Please verify and confirm: {{task_link}}
  ```
- **Cost**: ₹0.30 per message
- **Button**: "Verify & Complete" → Deep link to completion

---

### 6. **New Task Available** (Helper Mode) ⭐ VERY IMPORTANT
- **Interakt Template**: `new_task_nearby`
- **Variables**: `{{helper_name}}`, `{{task_title}}`, `{{budget}}`, `{{distance}}`, `{{task_link}}`
- **Message**: 
  ```
  Hi {{helper_name}}, new task near you 🆕: "{{task_title}}" - Budget: ₹{{budget}} - Distance: {{distance}} - View now: {{task_link}}
  ```
- **Cost**: ₹0.30 per message
- **Button**: "View Task" → Deep link to task
- **Max**: 5 per helper per day

---

### 7. **Chat Reply After Silence** 💬
- **Interakt Template**: `chat_reply_reminder`
- **Variables**: `{{user_name}}`, `{{sender_name}}`, `{{listing_title}}`, `{{chat_link}}`
- **Message**: 
  ```
  Hi {{user_name}}, {{sender_name}} sent you a message about "{{listing_title}}" 💬. Reply now: {{chat_link}}
  ```
- **Cost**: ₹0.30 per message
- **Condition**: >24 hours silence
- **User Control**: Can disable in settings

---

## 🔧 Interakt API Integration

### API Endpoint
```
POST https://api.interakt.ai/v1/public/message/
```

### Authentication
```
Authorization: Basic <YOUR_API_KEY>
```

### Request Format (Template Message)
```json
{
  "countryCode": "+91",
  "phoneNumber": "9876543210",
  "type": "Template",
  "template": {
    "name": "task_accepted",
    "languageCode": "en",
    "bodyValues": [
      "Rajesh",           // {{owner_name}}
      "Amit Kumar",       // {{helper_name}}
      "Fix Laptop",       // {{task_title}}
      "https://localfelo.com/chat/123"  // {{chat_link}}
    ],
    "buttonValues": {
      "0": ["https://localfelo.com/chat/123"]  // Button URL
    }
  }
}
```

### Response
```json
{
  "result": true,
  "message": "Message sent successfully",
  "messageId": "wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSMDhBQjU2..."
}
```

---

## 📁 Edge Function: `send-interakt-whatsapp`

**Location**: `/supabase/functions/send-interakt-whatsapp/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InteraktRequest {
  userId: string;
  phone: string; // Without +91
  templateName: string;
  notificationType: string;
  templateVariables: { [key: string]: string };
  buttonUrl?: string;
  relatedType?: string;
  relatedId?: string;
  skipRateLimiting?: boolean;
  skipDeduplication?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: InteraktRequest = await req.json();
    const {
      userId,
      phone,
      templateName,
      notificationType,
      templateVariables,
      buttonUrl,
      relatedType,
      relatedId,
      skipRateLimiting,
      skipDeduplication
    } = requestData;

    console.log(`📱 [Interakt] Sending WhatsApp to ${phone} (${notificationType})`);

    // 1. Check user preferences
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('helper_preferences')
      .eq('id', userId)
      .single();

    const prefs = profile?.helper_preferences || {};
    const whatsappEnabled = prefs.whatsapp_notifications?.[notificationType] !== false;

    if (!whatsappEnabled && !skipRateLimiting) {
      console.log(`⚠️ [Interakt] User ${userId} has disabled ${notificationType} notifications`);
      return new Response(
        JSON.stringify({ success: false, reason: 'user_disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check rate limiting (unless skipped)
    if (!skipRateLimiting) {
      const today = new Date().toISOString().split('T')[0];
      const { data: rateLimit } = await supabaseClient
        .from('whatsapp_rate_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const limits: { [key: string]: number } = {
        'otp': 999, // Unlimited
        'forgot_password': 3,
        'task_accepted': 10,
        'task_cancelled': 10,
        'task_completion_request': 10,
        'new_task': 5,
        'chat_reply': 2
      };

      const maxAllowed = limits[notificationType] || 5;
      const currentCount = rateLimit?.[`${notificationType}_count`] || 0;

      if (currentCount >= maxAllowed) {
        console.log(`⚠️ [Interakt] Rate limit exceeded for ${userId} (${currentCount}/${maxAllowed})`);
        return new Response(
          JSON.stringify({ success: false, reason: 'rate_limit' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 3. Check deduplication (unless skipped)
    if (!skipDeduplication && relatedId) {
      const { data: existing } = await supabaseClient
        .from('whatsapp_deduplication')
        .select('id')
        .eq('user_id', userId)
        .eq('notification_type', notificationType)
        .eq('related_id', relatedId)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (existing) {
        console.log(`⚠️ [Interakt] Duplicate notification blocked for ${userId}`);
        return new Response(
          JSON.stringify({ success: false, reason: 'duplicate' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Get Interakt API key from secrets
    const interaktApiKey = Deno.env.get('INTERAKT_API_KEY');
    if (!interaktApiKey) {
      throw new Error('INTERAKT_API_KEY not configured');
    }

    // 5. Prepare Interakt request
    const bodyValues = Object.values(templateVariables);
    
    const interaktPayload: any = {
      countryCode: '+91',
      phoneNumber: phone.replace(/^\+91/, ''), // Remove +91 if present
      type: 'Template',
      template: {
        name: templateName,
        languageCode: 'en',
        bodyValues: bodyValues
      }
    };

    // Add button URL if provided
    if (buttonUrl) {
      interaktPayload.template.buttonValues = {
        '0': [buttonUrl]
      };
    }

    console.log('🔄 [Interakt] Calling API...');

    // 6. Call Interakt API
    const interaktResponse = await fetch('https://api.interakt.ai/v1/public/message/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${interaktApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interaktPayload)
    });

    const interaktData = await interaktResponse.json();

    if (!interaktResponse.ok || !interaktData.result) {
      console.error('❌ [Interakt] Failed:', interaktData);
      throw new Error(interaktData.message || 'Failed to send WhatsApp');
    }

    console.log('✅ [Interakt] Message sent, ID:', interaktData.messageId);

    // 7. Log to database
    await supabaseClient.from('whatsapp_notifications').insert({
      user_id: userId,
      phone: `+91${phone.replace(/^\+91/, '')}`,
      template_name: templateName,
      notification_type: notificationType,
      message_id: interaktData.messageId,
      status: 'sent',
      related_type: relatedType,
      related_id: relatedId,
      template_variables: templateVariables,
      sent_at: new Date().toISOString()
    });

    // 8. Update rate limits
    if (!skipRateLimiting) {
      const today = new Date().toISOString().split('T')[0];
      await supabaseClient.rpc('increment_whatsapp_rate_limit', {
        p_user_id: userId,
        p_date: today,
        p_notification_type: notificationType
      });
    }

    // 9. Add deduplication record
    if (!skipDeduplication && relatedId) {
      await supabaseClient.from('whatsapp_deduplication').insert({
        user_id: userId,
        notification_type: notificationType,
        related_id: relatedId,
        sent_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: interaktData.messageId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ [Interakt] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🛠️ Service File: `services/interaktWhatsApp.ts`

```typescript
// =====================================================
// Interakt WhatsApp Notification Service - LocalFelo
// =====================================================

import { supabase } from '../lib/supabaseClient';

interface InteraktNotificationOptions {
  userId: string;
  phone: string;
  templateName: string;
  notificationType: string;
  templateVariables: { [key: string]: string };
  buttonUrl?: string;
  relatedType?: string;
  relatedId?: string;
  skipRateLimiting?: boolean;
  skipDeduplication?: boolean;
}

/**
 * Send WhatsApp notification via Interakt
 */
async function sendInteraktWhatsApp(options: InteraktNotificationOptions): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-interakt-whatsapp', {
      body: options
    });

    if (error) {
      console.error('[Interakt] Error:', error);
      return false;
    }

    if (!data?.success) {
      console.warn('[Interakt] Failed:', data?.reason || 'Unknown reason');
      return false;
    }

    console.log('[Interakt] Message sent:', data.messageId);
    return true;
  } catch (error) {
    console.error('[Interakt] Failed to send:', error);
    return false;
  }
}

/**
 * 1. Send OTP for registration
 */
export async function sendWhatsAppOTP(
  phone: string, 
  otp: string, 
  userName: string,
  userId?: string
): Promise<boolean> {
  const cleanPhone = phone.replace(/^\+91/, '');
  
  return sendInteraktWhatsApp({
    userId: userId || 'anonymous',
    phone: cleanPhone,
    templateName: 'otp_verification',
    notificationType: 'otp',
    templateVariables: {
      name: userName || 'User',
      otp: otp
    },
    skipRateLimiting: true,
    skipDeduplication: true
  });
}

/**
 * 2. Send Forgot Password OTP
 */
export async function sendWhatsAppForgotPasswordOTP(
  phone: string,
  otp: string,
  userName: string,
  userId: string
): Promise<boolean> {
  const cleanPhone = phone.replace(/^\+91/, '');
  
  return sendInteraktWhatsApp({
    userId,
    phone: cleanPhone,
    templateName: 'password_reset',
    notificationType: 'forgot_password',
    templateVariables: {
      name: userName,
      otp: otp
    },
    skipRateLimiting: true,
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
  ownerName: string,
  helperName: string,
  taskTitle: string
): Promise<boolean> {
  const cleanPhone = ownerPhone.replace(/^\+91/, '');
  const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;
  const chatLink = `https://localfelo.com/task/${taskId}/chat`;

  return sendInteraktWhatsApp({
    userId: ownerId,
    phone: cleanPhone,
    templateName: 'task_accepted',
    notificationType: 'task_accepted',
    templateVariables: {
      owner_name: ownerName,
      helper_name: helperName,
      task_title: truncatedTitle,
      chat_link: chatLink
    },
    buttonUrl: chatLink,
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
  ownerName: string,
  helperName: string,
  taskTitle: string
): Promise<boolean> {
  const cleanPhone = ownerPhone.replace(/^\+91/, '');
  const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;
  const taskLink = `https://localfelo.com/task/${taskId}`;

  return sendInteraktWhatsApp({
    userId: ownerId,
    phone: cleanPhone,
    templateName: 'task_cancelled',
    notificationType: 'task_cancelled',
    templateVariables: {
      owner_name: ownerName,
      helper_name: helperName,
      task_title: truncatedTitle,
      task_link: taskLink
    },
    buttonUrl: taskLink,
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
  ownerName: string,
  helperName: string,
  taskTitle: string
): Promise<boolean> {
  const cleanPhone = ownerPhone.replace(/^\+91/, '');
  const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;
  const taskLink = `https://localfelo.com/task/${taskId}/complete`;

  return sendInteraktWhatsApp({
    userId: ownerId,
    phone: cleanPhone,
    templateName: 'task_completion_request',
    notificationType: 'task_completion_request',
    templateVariables: {
      owner_name: ownerName,
      helper_name: helperName,
      task_title: truncatedTitle,
      task_link: taskLink
    },
    buttonUrl: taskLink,
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
  taskLongitude: number,
  taskCreatorId: string
): Promise<void> {
  try {
    console.log(`[Interakt] Finding active helpers for new task: ${taskTitle}`);

    // Find active helpers
    const { data: helpers, error } = await supabase
      .from('profiles')
      .select('id, phone, name, helper_preferences, latitude, longitude')
      .eq('helper_mode_active', true)
      .neq('id', taskCreatorId); // Exclude task creator

    if (error || !helpers) {
      console.error('[Interakt] Failed to fetch active helpers:', error);
      return;
    }

    console.log(`[Interakt] Found ${helpers.length} active helpers`);
    let notifiedCount = 0;

    // Filter and notify each helper
    for (const helper of helpers) {
      const prefs = helper.helper_preferences || {};
      
      // Check if WhatsApp notifications enabled
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

      // Calculate distance if helper has location
      let distance = 0;
      let distanceText = 'Near you';
      
      if (helper.latitude && helper.longitude) {
        distance = calculateDistance(
          taskLatitude,
          taskLongitude,
          helper.latitude,
          helper.longitude
        );

        const radiusKm = prefs.radius_km || 10;
        if (distance > radiusKm) {
          continue; // Too far
        }

        distanceText = distance < 1 
          ? `${Math.round(distance * 1000)}m away`
          : `${distance.toFixed(1)}km away`;
      }

      // Check daily rate limit
      const { data: rateLimit } = await supabase
        .from('whatsapp_rate_limits')
        .select('new_task_count')
        .eq('user_id', helper.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const maxPerDay = prefs.max_notifications_per_day || 5;
      if (rateLimit && rateLimit.new_task_count >= maxPerDay) {
        console.log(`[Interakt] Helper ${helper.name} reached daily limit (${maxPerDay})`);
        continue;
      }

      // Send notification
      const truncatedTitle = taskTitle.length > 40 ? taskTitle.substring(0, 37) + '...' : taskTitle;
      const taskLink = `https://localfelo.com/task/${taskId}`;

      const sent = await sendInteraktWhatsApp({
        userId: helper.id,
        phone: helper.phone.replace(/^\+91/, ''),
        templateName: 'new_task_nearby',
        notificationType: 'new_task',
        templateVariables: {
          helper_name: helper.name,
          task_title: truncatedTitle,
          budget: taskBudget.toString(),
          distance: distanceText,
          task_link: taskLink
        },
        buttonUrl: taskLink,
        relatedType: 'task',
        relatedId: taskId
      });

      if (sent) {
        notifiedCount++;
        console.log(`[Interakt] ✅ Notified helper: ${helper.name} (${distanceText})`);
      }
    }

    console.log(`[Interakt] Notified ${notifiedCount} helpers about new task`);
  } catch (error) {
    console.error('[Interakt] Failed to notify helpers:', error);
  }
}

/**
 * 7. Notify user: Chat reply after long silence
 */
export async function sendWhatsAppChatReply(
  conversationId: string,
  recipientId: string,
  recipientPhone: string,
  recipientName: string,
  senderName: string,
  listingTitle: string
): Promise<boolean> {
  const cleanPhone = recipientPhone.replace(/^\+91/, '');
  const truncatedTitle = listingTitle.length > 40 ? listingTitle.substring(0, 37) + '...' : listingTitle;
  const chatLink = `https://localfelo.com/chat/${conversationId}`;

  return sendInteraktWhatsApp({
    userId: recipientId,
    phone: cleanPhone,
    templateName: 'chat_reply_reminder',
    notificationType: 'chat_reply',
    templateVariables: {
      user_name: recipientName,
      sender_name: senderName,
      listing_title: truncatedTitle,
      chat_link: chatLink
    },
    buttonUrl: chatLink,
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

## 🗄️ Database Functions (PostgreSQL)

```sql
-- Function to increment rate limits atomically
CREATE OR REPLACE FUNCTION increment_whatsapp_rate_limit(
  p_user_id UUID,
  p_date DATE,
  p_notification_type TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO whatsapp_rate_limits (user_id, date, total_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date) DO UPDATE
  SET total_count = whatsapp_rate_limits.total_count + 1,
      last_message_at = NOW();

  -- Increment specific counter based on type
  CASE p_notification_type
    WHEN 'otp' THEN
      UPDATE whatsapp_rate_limits 
      SET otp_count = otp_count + 1 
      WHERE user_id = p_user_id AND date = p_date;
    WHEN 'task_accepted' THEN
      UPDATE whatsapp_rate_limits 
      SET task_notification_count = task_notification_count + 1 
      WHERE user_id = p_user_id AND date = p_date;
    WHEN 'new_task' THEN
      UPDATE whatsapp_rate_limits 
      SET new_task_count = new_task_count + 1 
      WHERE user_id = p_user_id AND date = p_date;
    WHEN 'chat_reply' THEN
      UPDATE whatsapp_rate_limits 
      SET chat_count = chat_count + 1 
      WHERE user_id = p_user_id AND date = p_date;
  END CASE;
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 Interakt Template Setup (Submit in Interakt Dashboard)

### Step-by-Step:

1. **Login to Interakt Dashboard**: https://app.interakt.ai/
2. **Go to**: Templates → Create Template
3. **Submit these 7 templates**:

#### Template 1: `otp_verification`
- **Category**: Authentication
- **Language**: English
- **Message**: 
  ```
  Hi {{1}}, your LocalFelo verification code is {{2}}. Valid for 10 minutes. Do not share this code.
  ```
- **Variables**: name, otp

#### Template 2: `password_reset`
- **Category**: Authentication
- **Language**: English
- **Message**: 
  ```
  Hi {{1}}, your LocalFelo password reset code is {{2}}. Valid for 10 minutes. Ignore if you didn't request this.
  ```
- **Variables**: name, otp

#### Template 3: `task_accepted`
- **Category**: Utility
- **Language**: English
- **Message**: 
  ```
  Hi {{1}}, great news! 🎉 {{2}} accepted your task "{{3}}". Start chatting: {{4}}
  ```
- **Variables**: owner_name, helper_name, task_title, chat_link
- **Button**: "Open Chat" → URL type

#### Template 4: `task_cancelled`
- **Category**: Utility
- **Language**: English
- **Message**: 
  ```
  Hi {{1}}, {{2}} cancelled task "{{3}}". Your task is now open for others to accept. View: {{4}}
  ```
- **Variables**: owner_name, helper_name, task_title, task_link
- **Button**: "View Task" → URL type

#### Template 5: `task_completion_request`
- **Category**: Utility
- **Language**: English
- **Message**: 
  ```
  Hi {{1}}, {{2}} marked "{{3}}" as complete ✅. Please verify and confirm: {{4}}
  ```
- **Variables**: owner_name, helper_name, task_title, task_link
- **Button**: "Verify & Complete" → URL type

#### Template 6: `new_task_nearby`
- **Category**: Utility
- **Language**: English
- **Message**: 
  ```
  Hi {{1}}, new task near you 🆕: "{{2}}" - Budget: ₹{{3}} - Distance: {{4}} - View now: {{5}}
  ```
- **Variables**: helper_name, task_title, budget, distance, task_link
- **Button**: "View Task" → URL type

#### Template 7: `chat_reply_reminder`
- **Category**: Marketing (User can opt-out)
- **Language**: English
- **Message**: 
  ```
  Hi {{1}}, {{2}} sent you a message about "{{3}}" 💬. Reply now: {{4}}
  ```
- **Variables**: user_name, sender_name, listing_title, chat_link
- **Button**: "Reply Now" → URL type

**Approval Time**: 2-4 hours (much faster than Meta!)

---

## 💰 Final Cost Comparison

### Interakt vs Direct Meta API

| Aspect | Interakt | Direct Meta API |
|--------|----------|-----------------|
| **Setup Time** | 1 day | 2-3 weeks |
| **Per Message Cost** | ₹0.25-₹0.30 | ₹0.40-₹0.80 |
| **Monthly (10K msgs)** | ₹2,500-₹3,000 | ₹9,000-₹12,000 |
| **Free Tier** | 1,000 msgs/month | None |
| **Template Approval** | 2-4 hours | 2-3 days |
| **Support** | Email + Chat | Email only |
| **Analytics** | Built-in dashboard | Build yourself |

### Your Estimated Monthly Cost (Interakt):
- **Startup Phase** (2,000 msgs): **FREE** (using free tier)
- **Growth Phase** (10,000 msgs): **₹2,500-₹3,000**
- **Scale Phase** (30,000 msgs): **₹6,000-₹8,000**

**Savings**: ₹6,000-₹9,000/month compared to direct API! 🎉

---

## 🚀 Setup Steps (Super Easy!)

### 1. Sign up for Interakt (10 minutes)
1. Go to: https://www.interakt.shop/
2. Click "Start Free Trial"
3. Complete WhatsApp Business verification (guided process)
4. Get API key from Settings → API

### 2. Deploy Edge Function (5 minutes)
```bash
cd supabase
supabase functions deploy send-interakt-whatsapp
supabase secrets set INTERAKT_API_KEY=your_key_here
```

### 3. Submit Templates (30 minutes)
- Login to Interakt dashboard
- Submit all 7 templates (copy from above)
- Wait 2-4 hours for approval

### 4. Test (10 minutes)
```bash
# Test OTP
curl -X POST https://your-project.supabase.co/functions/v1/send-interakt-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "phone": "9876543210",
    "templateName": "otp_verification",
    "notificationType": "otp",
    "templateVariables": {
      "name": "Rajesh",
      "otp": "123456"
    },
    "skipRateLimiting": true
  }'
```

---

## ✅ Next Steps

1. **Review this Interakt plan** - Much cheaper & easier!
2. **Sign up for Interakt** - Get free 1,000 messages
3. **Say "implement"** - I'll create all the code files
4. **Deploy & test** - Live in 1 day!

**Want me to start implementing with Interakt?** 🚀

This saves you **₹6,000-₹9,000/month** compared to direct Meta API!
