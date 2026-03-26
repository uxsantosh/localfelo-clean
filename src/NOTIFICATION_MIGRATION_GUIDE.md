# 📋 Notification Migration Guide

## Converting Old Notification Code to New Unified Service

This guide shows how to update existing notification code to use the new unified notification service with WhatsApp support.

---

## ❌ OLD WAY (Before)

### Example 1: Task Notification (Old)
```typescript
// OLD: Direct Supabase insert
const { error: notifError } = await supabase
  .from('notifications')
  .insert({
    user_id: professionalId,
    title: 'New Task Available',
    message: `New task: ${taskTitle}`,
    type: 'task',
    related_id: taskId,
    related_type: 'task',
    action_url: `/tasks/${taskId}`,
    is_read: false,
  });

// Separate WhatsApp call (if exists)
if (professional.whatsapp) {
  await sendWhatsAppNotification({
    phoneNumber: professional.whatsapp,
    templateName: 'new_task',
    variables: { ... }
  });
}
```

### Example 2: Wish Match Notification (Old)
```typescript
// OLD: Direct insert
const notifications = matchingWishes.map(wish => ({
  user_id: wish.user_id,
  title: '🎯 Perfect Match Found!',
  message: `"${listing.title}" - ₹${listing.price} matches your wish!`,
  type: 'listing',
  related_type: 'listing',
  related_id: listing.id,
  action_url: `/listing/${listing.id}`,
  is_read: false,
}));

const { error: notifError } = await supabase
  .from('notifications')
  .insert(notifications);
```

---

## ✅ NEW WAY (After)

### Example 1: Task Notification (New)
```typescript
import { sendNotification, createTaskNotification } from './services/notificationService';

// ✅ NEW: Single function, handles both in-app and WhatsApp
const notification = createTaskNotification(
  professionalId,
  taskId,
  taskTitle,
  subcategory,
  location,
  true  // includeWhatsApp
);

await sendNotification(notification);
```

### Example 2: Wish Match Notification (New)
```typescript
import { sendBatchNotifications, createMatchNotification } from './services/notificationService';

// ✅ NEW: Batch send with WhatsApp support
const notifications = matchingWishes.map(wish => 
  createMatchNotification(
    wish.user_id,
    listing.id,
    listing.title,
    listing.price.toString(),
    1,  // matchCount
    true  // includeWhatsApp
  )
);

await sendBatchNotifications(notifications);
```

---

## 🔄 Step-by-Step Migration

### Step 1: Import the New Service
```typescript
// Add to top of file
import { 
  sendNotification, 
  createTaskNotification,
  createWishNotification,
  createMatchNotification,
  createChatNotification,
  createOfferNotification
} from './services/notificationService';
```

### Step 2: Replace Direct Supabase Inserts

**Before:**
```typescript
const { error } = await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    title: 'Title',
    message: 'Message',
    type: 'task',
    // ... other fields
  });
```

**After:**
```typescript
await sendNotification({
  userId: userId,
  type: 'task',
  title: 'Title',
  message: 'Message',
  data: {
    relatedId: taskId,
    relatedType: 'task',
    actionUrl: `/tasks/${taskId}`,
    whatsappTemplate: 'new_task',
    whatsappVariables: {
      subcategory: 'Plumbing',
      location: 'Andheri'
    }
  },
  channels: ['in_app', 'whatsapp']
});
```

### Step 3: Use Helper Functions

**For common notification types, use the helpers:**

```typescript
// Task notification
const notification = createTaskNotification(
  userId, taskId, title, subcategory, location, includeWhatsApp
);

// Wish notification
const notification = createWishNotification(
  userId, wishId, title, subcategory, location, includeWhatsApp
);

// Match notification
const notification = createMatchNotification(
  userId, listingId, title, price, count, includeWhatsApp
);

// Chat notification
const notification = createChatNotification(
  userId, conversationId, senderName, subject, includeWhatsApp
);

// Offer notification
const notification = createOfferNotification(
  userId, offerId, senderName, subject, includeWhatsApp
);
```

### Step 4: Remove Old WhatsApp Code

**Delete:**
```typescript
// ❌ Remove this
const { sendWhatsAppNotification } = await import('./interaktWhatsApp');
if (user.whatsapp) {
  sendWhatsAppNotification({ ... });
}
```

**The new service handles it automatically!**

---

## 📝 Migration Patterns

### Pattern 1: Single Notification
```typescript
// OLD
const { error } = await supabase.from('notifications').insert({...});

// NEW
await sendNotification({...});
```

### Pattern 2: Batch Notifications
```typescript
// OLD
const notifications = users.map(u => ({...}));
const { error } = await supabase.from('notifications').insert(notifications);

// NEW
const notifications = users.map(u => createTaskNotification(...));
await sendBatchNotifications(notifications);
```

### Pattern 3: With WhatsApp
```typescript
// OLD
await supabase.from('notifications').insert({...});
if (whatsapp) await sendWhatsAppNotification({...});

// NEW
await sendNotification({
  ...
  channels: ['in_app', 'whatsapp']
});
```

### Pattern 4: Error Handling
```typescript
// OLD
if (error) {
  console.error('Failed:', error);
  throw error;
}

// NEW
const result = await sendNotification({...});
if (!result.success) {
  console.error('Failed:', result.error);
  // Don't throw - notification service handles failures gracefully
}
```

---

## 🎯 Benefits of Migration

### Before Migration:
- ❌ Separate in-app and WhatsApp code
- ❌ Duplicate logic across files
- ❌ Manual phone validation
- ❌ Hardcoded messages
- ❌ No fail-safe mechanism
- ❌ Inconsistent error handling

### After Migration:
- ✅ Unified notification service
- ✅ Single source of truth
- ✅ Automatic phone validation
- ✅ Template-based messages
- ✅ Fail-safe by default
- ✅ Consistent error handling
- ✅ Easy to enable/disable WhatsApp
- ✅ Provider-agnostic

---

## 🔍 Files to Update

### High Priority (Update First)
1. `/services/wishes.ts` - notifyMatchingProvidersForWish()
2. `/services/wishes.ts` - notifyMatchingShopsForWish()
3. `/services/listings.js` - sendWishMatchNotifications()
4. `/services/tasks.ts` - Task notification functions

### Medium Priority
5. `/services/chat.ts` - Chat notifications
6. `/services/professionals.ts` - Professional notifications
7. `/services/shops.ts` - Shop notifications

### Low Priority (Custom Notifications)
8. Any custom notification code in screens
9. Admin notification functions

---

## ⚠️ Important Notes

### DO:
- ✅ Use helper functions when possible
- ✅ Set `includeWhatsApp` based on importance
- ✅ Add WhatsApp templates for new notification types
- ✅ Test with `VITE_WHATSAPP_PROVIDER=none` first
- ✅ Log migration progress

### DON'T:
- ❌ Remove old code until tested
- ❌ Enable WhatsApp for all notifications immediately
- ❌ Hardcode phone numbers
- ❌ Skip error handling
- ❌ Forget to update batch operations

---

## 📊 Migration Checklist

```markdown
- [ ] Import notification service
- [ ] Replace single notifications with sendNotification()
- [ ] Replace batch notifications with sendBatchNotifications()
- [ ] Remove old WhatsApp import code
- [ ] Add WhatsApp template variables
- [ ] Test with WhatsApp disabled
- [ ] Test with WhatsApp enabled
- [ ] Update error handling
- [ ] Remove console.log debugging (use service logs)
- [ ] Document any custom templates added
```

---

## 🧪 Testing After Migration

### Test 1: In-App Only
```bash
# .env
VITE_WHATSAPP_PROVIDER=none
```

**Expected:**
- ✅ In-app notifications work
- ✅ No WhatsApp attempts
- ✅ No errors

### Test 2: WhatsApp Enabled
```bash
# .env
VITE_WHATSAPP_PROVIDER=interakt
VITE_WHATSAPP_API_URL=...
VITE_WHATSAPP_API_KEY=...
```

**Expected:**
- ✅ In-app notifications work
- ✅ WhatsApp attempts logged
- ✅ No breaking errors

### Test 3: Invalid Phone
**Setup:**
- User with invalid phone number

**Expected:**
- ✅ In-app notification sent
- ✅ WhatsApp skipped with log
- ✅ No errors

---

## 🎉 Migration Complete!

Once migration is complete, you'll have:

- ✅ Cleaner codebase
- ✅ Consistent notification handling
- ✅ WhatsApp support ready to activate
- ✅ Better error handling
- ✅ Easier to maintain and extend

**Happy migrating!** 🚀
