# ⚠️ Push Notifications - Missing Events Analysis

**Date:** February 16, 2026  
**Status:** Partial implementation - Many events not yet wired

---

## ❌ **What I Implemented (3 events only)**

| Event | Status | File | Function |
|-------|--------|------|----------|
| Task Accepted | ✅ Done | `tasks.ts` | `acceptTask()` |
| Task Cancelled | ✅ Done | `tasks.ts` | `cancelTask()` |
| Chat Message | ✅ Done | `chat.ts` | `sendMessage()` |

---

## ⚠️ **What I MISSED (11+ events!)**

### 🔴 **TASK Events (5 missing)**

| Event | In-App Notification Exists? | Currently Wired for Push? | Urgency |
|-------|----------------------------|---------------------------|---------|
| **Task Offer Received** | ✅ Yes | ❌ **NO** | 🔴 HIGH |
| **Task Completion Requested** | ✅ Yes | ❌ **NO** | 🔴 HIGH |
| **Task Completed (Confirmed)** | ✅ Yes | ❌ **NO** | 🟡 MEDIUM |
| **Task Rejected** | ❓ Unknown | ❌ **NO** | 🟡 MEDIUM |
| **Task Status Changed** | ❓ Unknown | ❌ **NO** | 🟢 LOW |

#### **Details:**

**1. Task Offer Received**
```typescript
// Location: Where helpers make price offers on tasks
// Function: sendTaskOfferNotification()
// Recipient: Task Creator
// Data: { type: 'task', action: 'offer', offer_amount, helper_name }
```

**2. Task Completion Requested**
```typescript
// Location: When helper marks task as complete
// Function: sendTaskCompletionRequestNotification()
// Recipient: Task Creator
// Data: { type: 'task', action: 'completion_request', helper_name }
```

**3. Task Completed**
```typescript
// Location: When creator confirms task completion
// Function: sendTaskCompletedNotification()
// Recipient: Helper
// Data: { type: 'task', action: 'completed', owner_name }
```

---

### 🟠 **WISH Events (4 missing)**

| Event | In-App Notification Exists? | Currently Wired for Push? | Urgency |
|-------|----------------------------|---------------------------|---------|
| **Wish Offer Received** | ✅ Yes (Called in `wishes.ts`) | ❌ **NO** | 🔴 HIGH |
| **Wish Offer Accepted** | ✅ Yes | ❌ **NO** | 🔴 HIGH |
| **Wish Status Changed** | ✅ Yes | ❌ **NO** | 🟡 MEDIUM |
| **Wish Cancelled** | ❓ Unknown | ❌ **NO** | 🟢 LOW |

#### **Details:**

**1. Wish Offer Received**
```typescript
// Location: /services/wishes.ts line 557
// Already calls: sendWishOfferNotification()
// Recipient: Wish Creator
// Data: { type: 'wish', action: 'offer', helper_name }
// STATUS: In-app ✅, Push ❌
```

**2. Wish Offer Accepted**
```typescript
// Location: When wish creator accepts an offer
// Function: sendWishOfferAcceptedNotification()
// Recipient: Helper
// Data: { type: 'wish', action: 'accepted', owner_name }
```

**3. Wish Status Changed**
```typescript
// Location: /services/wishes.ts updateWishStatus()
// Function: sendWishStatusChangeNotification()
// Recipient: Wish Creator or Helper
// Data: { type: 'wish', action: 'status_changed', new_status }
```

---

### 🟡 **MARKETPLACE/LISTING Events (2 missing)**

| Event | In-App Notification Exists? | Currently Wired for Push? | Urgency |
|-------|----------------------------|---------------------------|---------|
| **Listing Inquiry** | ✅ Yes | ❌ **NO** | 🟡 MEDIUM |
| **Listing Sold/Inactive** | ❓ Unknown | ❌ **NO** | 🟢 LOW |

#### **Details:**

**1. Listing Inquiry**
```typescript
// Location: When someone asks about a listing via chat
// Function: sendListingInquiryNotification()
// Recipient: Listing Owner
// Data: { type: 'marketplace', action: 'inquiry', buyer_name }
// NOTE: May overlap with chat notifications
```

---

### 🟣 **BROADCAST/ADMIN Events (1 missing)**

| Event | In-App Notification Exists? | Currently Wired for Push? | Urgency |
|-------|----------------------------|---------------------------|---------|
| **Admin Broadcast** | ✅ Yes (Called in admin panel) | ❌ **NO** | 🟡 MEDIUM |

#### **Details:**

**1. Admin Broadcast**
```typescript
// Location: /components/admin/BroadcastTab.tsx
// Already calls: sendBroadcastNotification()
// Recipients: All users or selected users
// Data: { type: 'system', action: 'broadcast', message_type }
// STATUS: In-app ✅, Push ❌
```

---

## 📊 **Summary Statistics**

| Category | In-App Notifications | Push Notifications | Missing Push |
|----------|---------------------|-------------------|--------------|
| **Tasks** | 8 events | 2 events | 6 missing |
| **Wishes** | 4 events | 0 events | 4 missing |
| **Chat** | 1 event | 1 event | ✅ Done |
| **Marketplace** | 2 events | 0 events | 2 missing |
| **Admin** | 1 event | 0 events | 1 missing |
| **TOTAL** | **16 events** | **3 events** | **13 missing (81%)** |

---

## 🔍 **Where These Functions Are Called**

### ✅ **Already Calling In-App Notifications:**

1. **`/services/tasks.ts`**
   - `acceptTask()` → `sendTaskAcceptedNotification()` ✅ + Push ✅
   - `cancelTask()` → `sendTaskCancelledNotification()` ✅ + Push ✅

2. **`/services/wishes.ts`**
   - `acceptWish()` (line 557) → `sendWishOfferNotification()` ✅ + Push ❌
   - `updateWishStatus()` → `sendWishStatusChangeNotification()` ✅ + Push ❌

3. **`/services/chat.ts`**
   - `sendMessage()` → `sendChatMessageNotification()` ✅ + Push ✅

4. **`/components/admin/BroadcastTab.tsx`**
   - `handleSendBroadcast()` → `sendBroadcastNotification()` ✅ + Push ❌

### ❓ **Need to Find Where These Are Called:**

- `sendTaskCompletionRequestNotification()` - Where is task completion requested?
- `sendTaskCompletedNotification()` - Where is task completion confirmed?
- `sendTaskOfferNotification()` - Where are task offers made?
- `sendWishOfferAcceptedNotification()` - Where are wish offers accepted?
- `sendListingInquiryNotification()` - Is this used? (may be redundant with chat)

---

## 🎯 **Recommended Next Steps**

### **Priority 1: HIGH URGENCY (Critical User Actions)**

Add push notifications to:

1. ✅ **Wish Offer Received** - `/services/wishes.ts::acceptWish()` line 557
   - User posted a wish, someone wants to help → MUST notify!

2. ✅ **Task Completion Requested** - Find where helpers mark tasks complete
   - Helper finished work, wants payment → Creator MUST be notified!

3. ✅ **Task Completed Confirmed** - Find where creators confirm completion
   - Payment confirmed → Helper wants to know!

4. ✅ **Wish Offer Accepted** - Find where wish creators accept offers
   - Someone accepted help offer → Helper MUST know!

5. ✅ **Admin Broadcasts** - `/components/admin/BroadcastTab.tsx`
   - System announcements → All users should receive push!

### **Priority 2: MEDIUM URGENCY**

6. Wish Status Changes - `/services/wishes.ts::updateWishStatus()`
7. Task Offers - Find where task offers are made
8. Listing Inquiries - May overlap with chat (verify if needed)

### **Priority 3: LOW URGENCY**

9. Task status changes (other than accept/cancel/complete)
10. Wish cancellations
11. Listing sold/inactive notifications

---

## 🛠️ **How to Fix This**

### **Step 1: Find Missing Function Calls**

Search codebase for where these events happen:

```bash
# Task completion request
grep -r "completion.*request\|mark.*complete" /services/tasks.ts

# Task offer
grep -r "offer.*task\|task.*offer" /services/

# Wish offer accepted
grep -r "accept.*offer\|offer.*accept" /services/wishes.ts
```

### **Step 2: Add Push Notifications**

For each missing event, add after the in-app notification:

```typescript
// After in-app notification
const { notifyTaskUpdate } = await import('./pushNotificationDispatcher');
notifyTaskUpdate({
  recipientId: recipientUserId,
  taskId: taskId,
  action: 'completion_request', // or 'offer', 'completed', etc.
  title: 'Title Here',
  body: 'Body here',
  senderId: currentUserId,
}).catch(err => console.warn('[Service] Push notification failed:', err));
```

### **Step 3: Update Dispatcher (if needed)**

Add convenience functions for new event types:

```typescript
// In pushNotificationDispatcher.ts
export function notifyWishOffer(params: {
  recipientId: string;
  wishId: string;
  helperName: string;
  wishTitle: string;
}): Promise<void> {
  return notifyUser({
    userId: params.recipientId,
    title: 'Someone Can Help! 🎉',
    body: `${params.helperName} wants to help with "${params.wishTitle}"`,
    data: {
      type: 'wish',
      entity_id: params.wishId,
      action: 'offer',
    },
  });
}
```

---

## 📝 **Exact Locations to Update**

### 1. `/services/wishes.ts` - Line 557 (Wish Offer)
```typescript
// CURRENT (line 557-568):
try {
  const { sendWishOfferNotification } = await import('./notifications');
  await sendWishOfferNotification(...);
  console.log('✅ Wish offer notification sent to wish owner');
} catch (notifError) {
  console.error('⚠️ Failed to send wish offer notification:', notifError);
}

// ADD AFTER:
const { notifyWishUpdate } = await import('./pushNotificationDispatcher');
notifyWishUpdate({
  recipientId: wish.userId,
  wishId: wishId,
  action: 'offer',
  title: 'Someone Can Help! 🎉',
  body: `${currentUser.name} wants to help with "${wish.title}"`,
}).catch(err => console.warn('[WishService] Push notification failed:', err));
```

### 2. `/services/wishes.ts` - updateWishStatus() (Wish Status Change)
```typescript
// Find where sendWishStatusChangeNotification() is called
// Add push notification after in-app notification
```

### 3. `/components/admin/BroadcastTab.tsx` - Line 87 (Admin Broadcast)
```typescript
// CURRENT (line 87-95):
const result = await sendBroadcastNotification({
  recipients: recipientMode === 'all' ? 'all' : selectedUserIds,
  title: title.trim(),
  message: message.trim(),
  type: type as 'info' | 'promotion' | 'alert',
  link: link.trim() || undefined,
});

// ADD AFTER (if result.success):
if (result.success && result.count && result.count > 0) {
  const { notifyMultipleUsers } = await import('../../services/pushNotificationDispatcher');
  
  // Get user IDs (all or selected)
  let targetUserIds: string[] = [];
  if (recipientMode === 'all') {
    const { data: allUsers } = await supabase.from('profiles').select('id');
    targetUserIds = allUsers?.map(u => u.id) || [];
  } else {
    targetUserIds = selectedUserIds;
  }
  
  notifyMultipleUsers({
    userIds: targetUserIds,
    title: title.trim(),
    body: message.trim(),
    data: {
      type: 'system',
      entity_id: 'broadcast',
      action: 'broadcast',
    },
  }).catch(err => console.warn('[BroadcastTab] Push notification failed:', err));
}
```

---

## ✅ **Quick Checklist for Complete Implementation**

### Must-Have (High Priority):
- [ ] Wish Offer Received (`wishes.ts` line 557)
- [ ] Task Completion Requested (find location)
- [ ] Task Completed Confirmed (find location)
- [ ] Wish Offer Accepted (find location)
- [ ] Admin Broadcasts (`BroadcastTab.tsx`)

### Should-Have (Medium Priority):
- [ ] Wish Status Changes (`updateWishStatus()`)
- [ ] Task Offers (find location)

### Nice-to-Have (Low Priority):
- [ ] Listing Inquiries (verify if needed)
- [ ] Other status changes

---

## 🎯 **Impact Assessment**

**Current Coverage:** 3/16 events (19%)  
**Critical Coverage:** 2/5 high-priority events (40%)  

**User Experience Impact:**
- 🔴 **Critical:** Users will miss important offers, completion requests
- 🟠 **High:** Reduced engagement due to missed notifications
- 🟡 **Medium:** Incomplete feature parity with in-app notifications

---

**Status:** ⚠️ Partial Implementation  
**Next Action:** Wire up missing high-priority events  
**Estimated Work:** ~2-3 hours to complete all events

**Last Updated:** February 16, 2026
