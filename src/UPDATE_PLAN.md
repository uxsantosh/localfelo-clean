# 🔥 OldCycle Major Update Plan

## ✅ Completed:
1. `/types/index.ts` - Added `creatorCompleted` and `helperCompleted` fields to Task interface

---

## 📂 Files to Update (in order):

### **1. Service Layer - Core Logic**

#### `/services/tasks.ts`
**Changes needed:**
- ✅ Update `completeTask()` function:
  - Track which user is marking complete (creator vs helper)
  - Only close task when BOTH have marked complete
  - Send notification to other party when one marks complete
  - Update `creatorCompleted` or `helperCompleted` field
- ✅ Add `editTask()` function:
  - Allow creator to edit task details
  - Validate permissions (only creator can edit)
  - Update database with new values
- ✅ Update database schema to include completion tracking fields

#### `/services/wishes.ts`
**Changes needed:**
- ✅ Add `editWish()` function:
  - Allow creator to edit wish details
  - Validate permissions (only creator can edit)
  - Update database with new values

#### `/services/listings.ts`
**Changes needed:**
- ✅ Add `editListing()` function:
  - Allow creator to edit listing details
  - Validate permissions (only creator can edit)
  - Update database with new values

#### `/services/notifications.ts`
**Changes needed:**
- ✅ Add `sendCompletionRequestNotification()`:
  - Trigger when one party marks task complete
  - Notify other party to mark complete
- ✅ Add `sendNewListingNotification()`:
  - Trigger when new listing/wish/task posted
  - Notify users in same city
  - Filter by user preferences
- ✅ Add `sendTaskAcceptedNotification()`:
  - Notify creator when task is accepted
- ✅ Add `sendTaskCompletedNotification()`:
  - Notify both parties when task is fully completed

---

### **2. Screen Updates - UI/UX**

#### `/screens/TaskDetailScreen.tsx`
**Changes needed:**
- ✅ Update Complete button logic:
  - Show completion status for both parties
  - Display "Waiting for [other party] to mark complete" when one completes
  - Trigger notification when marking complete
- ✅ Add Edit button for creator:
  - Show pencil icon next to title when creator is viewing
  - Only show before task is accepted
  - Navigate to CreateTaskScreen with edit mode
- ✅ Visual indicators:
  - Show checkmarks for who has completed
  - "✅ You marked as complete" 
  - "⏳ Waiting for [name] to mark complete"

#### `/screens/WishDetailScreen.tsx`
**Changes needed:**
- ✅ Add Edit button for creator:
  - Show pencil icon next to title
  - Navigate to CreateWishScreen with edit mode
- ✅ Similar completion tracking if wishes have acceptance flow

#### `/screens/ProfileScreen.tsx`
**Changes needed:**
- ✅ Real-time updates for all 3 listing types:
  - Marketplace listings: Refresh after edit/delete
  - Wishes: Refresh after edit/delete
  - Tasks: Refresh after edit/delete
- ✅ Add refresh mechanism:
  - Use `useEffect` with dependencies
  - Reload data when returning from edit screens
  - Show loading states during refresh
- ✅ History and actions tracking:
  - Show edit history
  - Show status changes
  - Show completion status

#### `/screens/ChatScreen.tsx`
**Changes needed:**
- ✅ Fix mobile input field:
  - Add proper padding-bottom to avoid bottom nav overlap
  - Use `pb-20` or similar on input container
- ✅ Make header sticky:
  - Use `position: sticky` with `top-0` and `z-index`
  - Keep header visible while scrolling messages
- ✅ Fix UI breaking:
  - Check message overflow
  - Fix layout in mobile view
  - Ensure proper spacing

#### `/screens/CreateTaskScreen.tsx`
**Changes needed:**
- ✅ Add edit mode support:
  - Accept `taskId` prop for edit mode
  - Load existing task data when editing
  - Change title to "Edit Task" when editing
  - Update button text to "Update Task"
  - Call `editTask()` instead of `createTask()` when editing

#### `/screens/CreateWishScreen.tsx`
**Changes needed:**
- ✅ Add edit mode support:
  - Accept `wishId` prop for edit mode
  - Load existing wish data when editing
  - Change title to "Edit Wish"
  - Update button text to "Update Wish"
  - Call `editWish()` instead of `createWish()` when editing

#### `/screens/CreateListingScreen.tsx`
**Changes needed:**
- ✅ Add edit mode support:
  - Accept `listingId` prop for edit mode
  - Load existing listing data when editing
  - Change title to "Edit Listing"
  - Update button text to "Update Listing"
  - Call `editListing()` instead of `createListing()` when editing

---

### **3. Navigation Updates**

#### `/App.tsx`
**Changes needed:**
- ✅ Update routing to support edit mode:
  - Handle `createTask` screen with optional `taskId` param
  - Handle `createWish` screen with optional `wishId` param
  - Handle `createListing` screen with optional `listingId` param

---

## 🎯 Feature Details:

### **Dual Completion System:**
```typescript
// Task completion tracking
creatorCompleted: boolean  // Creator marked as complete
helperCompleted: boolean   // Helper marked as complete

// Status logic:
if (creatorCompleted && helperCompleted) {
  status = 'completed'
  completedAt = new Date()
  // Send both parties completion notification
} else if (creatorCompleted || helperCompleted) {
  // Send notification to other party
  // Show "Waiting for [name] to mark complete"
}
```

### **Edit Flow:**
```
1. User views their task/wish/listing
2. Sees "Edit" button (pencil icon)
3. Clicks Edit → Navigate to Create screen with edit mode
4. Pre-fill all fields with existing data
5. User makes changes
6. Click "Update [Type]" button
7. Validate & save changes
8. Navigate back to detail page
9. Profile screen auto-refreshes with updated data
```

### **Notification System:**
```
Event: Task Accepted
→ Notify creator: "[Helper name] accepted your task"

Event: One party marks complete
→ Notify other party: "[Name] marked task as complete. Please confirm completion."
→ Show popup in app
→ Show banner notification

Event: Both mark complete
→ Notify both: "Task completed! ✅"

Event: New listing in city
→ Notify all users in same city (immediate)
→ Filter by user preferences
```

---

## 🎨 UI/UX Details:

### **TaskDetailScreen Completion UI:**
```
┌────────────────────────────────────┐
│  Deal Status                       │
│  ✅ You marked as complete         │
│  ⏳ Waiting for John to confirm    │
│                                    │
│  [Mark Complete] (disabled)        │
└────────────────────────────────────┘
```

### **Chat Screen Mobile Fix:**
```css
/* Header */
position: sticky
top: 0
z-index: 50
background: white

/* Messages Container */
padding-bottom: 140px (to avoid bottom nav)

/* Input Container */
position: fixed
bottom: 60px (above bottom nav)
left: 0
right: 0
```

### **Edit Button UI:**
```
┌────────────────────────────────────┐
│  [←] Task Details        [✏️ Edit] │
├────────────────────────────────────┤
│  🔧 Plumbing                       │
│  Fix Kitchen Sink                  │
│  ₹500                              │
└────────────────────────────────────┘
```

---

## ⚠️ Important Notes:

1. **Database Schema**: Need to add columns in Supabase:
   - `tasks` table: `creator_completed`, `helper_completed`
   
2. **Permissions**: Always validate:
   - Only creator can edit
   - Only involved parties can mark complete
   
3. **Real-time Updates**: Use Supabase real-time subscriptions for ProfileScreen

4. **Notifications**: 
   - In-app notifications (immediate)
   - Push notifications (for mobile apps)
   - Email notifications (for important events)

5. **Mobile First**: Always test on mobile view first for chat fixes

---

## 🚀 Implementation Order:

1. ✅ Update types (DONE)
2. Update service functions (tasks, wishes, listings, notifications)
3. Update TaskDetailScreen (completion + edit)
4. Update WishDetailScreen (edit)
5. Update ProfileScreen (real-time updates)
6. Update ChatScreen (mobile fixes)
7. Update Create screens (edit mode)
8. Update App.tsx (routing)
9. Test all flows end-to-end
10. Deploy to production

---

## ✅ Testing Checklist:

- [ ] Dual completion: Creator marks → Helper gets notification
- [ ] Dual completion: Helper marks → Creator gets notification
- [ ] Dual completion: Both mark → Task closes, both get notification
- [ ] Edit task: Creator can edit before acceptance
- [ ] Edit wish: Creator can edit anytime
- [ ] Edit listing: Creator can edit anytime
- [ ] Profile refresh: Delete updates list immediately
- [ ] Profile refresh: Edit updates list immediately
- [ ] Chat mobile: Input not hidden by bottom nav
- [ ] Chat mobile: Header stays sticky
- [ ] New listing: Users in city get notified
- [ ] Task accept: Creator gets notified

