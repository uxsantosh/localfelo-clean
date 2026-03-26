# Fixes Required

## Issues to Fix:

### 1. ❌ Notifications Not Working
**Problem**: Notifications system still failing after RLS and constraint fixes
**Root Cause**: Need to verify database setup and check console errors

### 2. ❌ Chat Navigation on Mobile
**Problem**: Chat button takes user to conversations list instead of direct chat window
**Expected**: On mobile, clicking chat should open the specific conversation directly
**Expected Back Behavior**: User can press back to return to conversations list

### 3. ❌ Card Border Radius Not Applying
**Problem**: Listing cards for wishes and tasks don't have border radius
**Root Cause**: Inline global CSS `rounded-xl` class not being applied properly

---

## Files to Update:

### 1. `/FIX_NOTIFICATIONS_CONSTRAINTS.sql` ✅ CREATED
- Already created to fix check constraints

### 2. `/services/notifications.ts` ✅ UPDATED
- Already updated to use `related_type: null`

### 3. `/App.tsx`
- **Line 811-812**: Update chat navigation to pass `conversationId`
- **Current**:
  ```typescript
  setChatConversationId(conversation.id);
  navigateToScreen('chat');
  ```
- **Fix**: Pass conversationId so ChatScreen opens directly to that conversation

### 4. `/screens/WishesScreen.tsx`
- **Line 157-158**: Update chat navigation
- **Current**:
  ```typescript
  console.log('✅ Conversation ready:', conversation.id);
  onNavigate('chat');
  ```
- **Fix**: Pass conversationId to App.tsx

### 5. `/screens/TasksScreen.tsx`
- **Line ~403-410**: Update chat navigation after getOrCreateConversation
- **Fix**: Pass conversationId to navigate function

### 6. `/screens/WishDetailScreen.tsx`
- Update chat navigation to pass conversationId

### 7. `/screens/TaskDetailScreen.tsx`
- Update chat navigation to pass conversationId

### 8. `/screens/ChatScreen.tsx`
- **Current**: Shows conversation list by default
- **Fix**: If `selectedConversationId` prop is passed, open that conversation directly on mobile

### 9. `/components/TaskCard.tsx`
- **Line 48**: `className` uses `rounded-xl` but not applying
- **Fix**: Verify Tailwind class is working or use inline style

### 10. `/components/WishCard.tsx`
- **Line 39**: `className` uses `rounded-xl` but not applying
- **Fix**: Verify Tailwind class is working or use inline style

---

## Implementation Plan:

### Step 1: Fix Chat Navigation (Mobile-first)
1. Update `App.tsx` to accept and pass `conversationId` to ChatScreen
2. Update all screens (Wishes, Tasks, WishDetail, TaskDetail) to pass conversationId when navigating to chat
3. Update `ChatScreen` to check if conversationId is provided and open directly to that conversation on mobile

### Step 2: Fix Card Border Radius
1. Check if `rounded-xl` Tailwind class is working
2. If not, add inline styles with `border-radius: 16px` to TaskCard and WishCard

### Step 3: Debug Notifications
1. Check browser console for notification errors
2. Run `/FIX_NOTIFICATIONS_CONSTRAINTS.sql` in Supabase
3. Test broadcast notifications from admin panel
4. Provide error messages if still failing

---

## SQL Scripts to Run:
1. `/FIX_NOTIFICATIONS_CONSTRAINTS.sql` - Fix check constraints
2. `/FIX_NOTIFICATIONS_RLS.sql` - Fix RLS policies with proper type casting
