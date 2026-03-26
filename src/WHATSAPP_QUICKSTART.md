# 🚀 WhatsApp Notification System - Quick Start

## 📋 5-Minute Setup Guide

### Step 1: Choose Your Provider
```bash
# Option 1: No WhatsApp (Development)
VITE_WHATSAPP_PROVIDER=none

# Option 2: Interakt (Recommended)
VITE_WHATSAPP_PROVIDER=interakt
VITE_WHATSAPP_API_URL=https://api.interakt.ai/v1/public/track/events/
VITE_WHATSAPP_API_KEY=your-api-key

# Option 3: Twilio
VITE_WHATSAPP_PROVIDER=twilio
VITE_WHATSAPP_API_URL=https://api.twilio.com/...
VITE_WHATSAPP_API_KEY=your-auth-token

# Option 4: Gupshup
VITE_WHATSAPP_PROVIDER=gupshup
VITE_WHATSAPP_API_URL=https://api.gupshup.io/...
VITE_WHATSAPP_API_KEY=your-api-key
```

### Step 2: Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

### Step 3: Add Your Credentials
Edit `.env` and add your WhatsApp provider credentials.

### Step 4: Use in Your Code
```typescript
import { sendNotification, createTaskNotification } from './services/notificationService';

// Send a notification
const notification = createTaskNotification(
  userId: 'user-123',
  taskId: 'task-456',
  taskTitle: 'Plumbing work needed',
  subcategory: 'Plumbing',
  location: 'Andheri',
  includeWhatsApp: true  // Enable WhatsApp
);

await sendNotification(notification);
```

---

## 💡 Common Use Cases

### Use Case 1: Task Created
```typescript
import { createTaskNotification, sendNotification } from './services/notificationService';

const notification = createTaskNotification(
  professionalId,
  taskId,
  'Plumbing repair needed',
  'Plumbing',
  'Andheri',
  true  // Send via WhatsApp too
);

await sendNotification(notification);
```

### Use Case 2: Match Found
```typescript
import { createMatchNotification, sendNotification } from './services/notificationService';

const notification = createMatchNotification(
  userId,
  listingId,
  'iPhone 13 Pro',
  '45000',
  3,  // 3 matches found
  true
);

await sendNotification(notification);
```

### Use Case 3: New Message
```typescript
import { createChatNotification, sendNotification } from './services/notificationService';

const notification = createChatNotification(
  recipientId,
  conversationId,
  'Rahul Kumar',
  'Plumbing Task',
  true
);

await sendNotification(notification);
```

### Use Case 4: Batch Notifications
```typescript
import { sendBatchNotifications, createTaskNotification } from './services/notificationService';

const notifications = professionals.map(prof => 
  createTaskNotification(
    prof.id,
    taskId,
    taskTitle,
    subcategory,
    location,
    true
  )
);

await sendBatchNotifications(notifications);
```

---

## 🎯 WhatsApp Templates

Available templates (in `/config/whatsappTemplates.ts`):

| Template Key | Use Case | Variables |
|-------------|----------|-----------|
| `new_task` | Task created | subcategory, location |
| `new_wish_product` | Wish created | subcategory, location |
| `match_found` | Match found | count |
| `new_message` | Chat message | sender_name, subject |
| `new_offer` | Offer received | sender_name, subject |
| `wish_accepted` | Wish accepted | helper_name, wish_title |
| `task_response` | Task response | professional_name, task_title |
| `listing_match` | Listing match | listing_title, price |
| `shop_match` | Shop match | category |

---

## 🔧 Configuration Options

### Environment Variables
```bash
# Required
VITE_WHATSAPP_PROVIDER=interakt|twilio|gupshup|none

# Optional (only if provider enabled)
VITE_WHATSAPP_API_URL=https://...
VITE_WHATSAPP_API_KEY=your-key
```

### Notification Channels
```typescript
channels: ['in_app']              // In-app only (default)
channels: ['in_app', 'whatsapp']  // Both channels
channels: ['whatsapp']            // WhatsApp only (not recommended)
```

---

## 🧪 Testing

### Test 1: WhatsApp Disabled
```bash
# .env
VITE_WHATSAPP_PROVIDER=none
```
**Result:** Only in-app notifications sent

### Test 2: WhatsApp Enabled
```bash
# .env
VITE_WHATSAPP_PROVIDER=interakt
VITE_WHATSAPP_API_URL=https://api.interakt.ai/...
VITE_WHATSAPP_API_KEY=test-key
```
**Result:** Both in-app and WhatsApp (placeholder logged)

---

## 📱 Phone Number Requirements

Users must have a valid phone number in their profile:

```typescript
// Phone validation
✅ Valid: '9876543210'
✅ Valid: '+919876543210'
✅ Valid: '98765 43210'

❌ Invalid: '12345'
❌ Invalid: null
❌ Invalid: ''
```

---

## 🐛 Troubleshooting

### Issue: WhatsApp not sending
**Check:**
1. Is `VITE_WHATSAPP_PROVIDER` set?
2. Are API credentials correct?
3. Does user have valid phone number?
4. Check console logs for errors

### Issue: In-app not working
**Check:**
1. Is userId valid?
2. Does notifications table exist?
3. Check Supabase connection
4. Check console for errors

### Issue: Template not found
**Check:**
1. Is template key correct?
2. Is template defined in `/config/whatsappTemplates.ts`?
3. Check spelling and case

---

## 📚 Documentation

- **Full Documentation:** `/WHATSAPP_NOTIFICATION_SYSTEM.md`
- **Migration Guide:** `/NOTIFICATION_MIGRATION_GUIDE.md`
- **Templates:** `/config/whatsappTemplates.ts`

---

## ⚡ Quick Reference

```typescript
// Import
import { sendNotification, createTaskNotification } from './services/notificationService';

// Create notification
const notification = createTaskNotification(userId, taskId, title, subcategory, location, true);

// Send
await sendNotification(notification);

// Done! ✅
```

---

## 🎉 That's It!

You're ready to send WhatsApp notifications! 🚀

**Next Steps:**
1. Test with `VITE_WHATSAPP_PROVIDER=none` first
2. Add real credentials when ready
3. Monitor console logs
4. Collect user feedback

**Happy notifying!** 📱
