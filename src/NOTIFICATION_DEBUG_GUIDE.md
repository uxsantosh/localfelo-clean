# 🔔 Notification System Debug Guide

## ✅ Files Updated

### 1. **Database Migration**
- **File**: `/migrations/create_notifications_system.sql`
- **Status**: ✅ Updated with missing notification types (`task_completion_request`, `new_nearby_listing`)

### 2. **Frontend Components**
- **File**: `/App.tsx` - Main app with popup notifications and test button
- **File**: `/hooks/useNotifications.ts` - Real-time notification hook with debug logging
- **File**: `/hooks/useLocation.ts` - Location hook (fixed TypeScript export issues)
- **File**: `/components/MobileMenuSheet.tsx` - Navigation to notifications screen

---

## 🚀 Quick Start: Testing Notifications

### Step 1: Run the SQL Migration
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `/migrations/create_notifications_system.sql`
4. Paste and click **Run**
5. You should see: `✅ Notifications system created/updated successfully!`

### Step 2: Test in the App
1. Login to OldCycle
2. Look for the purple **"🔔 Test Notification"** button at the bottom-left
3. Click it - you should see a success toast
4. Open browser console (F12) to see debug logs
5. The notification bell icon should show a badge with count "1"

### Step 3: Check Console Logs
You should see logs in this order:
```
🔔 [useNotifications] Effect triggered, userId: <your-user-id>
🔔 [useNotifications] Loading notifications for user: <your-user-id>
🔔 [useNotifications] Fetching notifications...
🔔 [useNotifications] Setting up real-time subscription for user: <your-user-id>
```

After clicking test button:
```
🔔 [useNotifications] 🎉 NEW NOTIFICATION RECEIVED: {notification object}
🔔 Showing popup for critical notification: {notification object}
```

---

## 🐛 Common Issues

### Issue: "Failed to create notification - check console"
**Solution**: The `notifications` table doesn't exist yet. Run the SQL migration (Step 1 above).

### Issue: No console logs appear
**Solution**: Make sure you're logged in. The notification system only works with authenticated users.

### Issue: Notifications created but popup doesn't show
**Possible causes**:
1. Check if `NotificationPopup` component is imported in App.tsx
2. Check if notification type is in the critical types list: `['task_accepted', 'task_cancelled', 'task_completion_request', 'task_completed']`
3. Look for JavaScript errors in console

### Issue: TypeScript errors about `useLocation`
**Solution**: The file was rewritten. Restart your TypeScript server:
- VS Code: Press `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- Or restart your development server

---

## 📊 How to Test Task Notifications

Once the basic system works:

1. **Create a Task** (go to Tasks tab → Create Task)
2. **Login with a second user** (use incognito/different browser)
3. **Accept the task** as the second user
4. **Switch back to first user** - you should see a notification popup!

---

## 🔍 Debugging Checklist

- [ ] SQL migration run successfully
- [ ] Logged in to the app
- [ ] Test button visible (purple, bottom-left)
- [ ] Clicking test button shows success toast
- [ ] Console shows notification logs
- [ ] Bell icon shows unread count badge
- [ ] Clicking bell shows notifications screen
- [ ] Popup appears for critical notifications

---

## 📝 Database Schema

The `notifications` table has:
- `id` - UUID primary key
- `user_id` - References profiles(client_token)
- `type` - Notification type (see types below)
- `title` - Notification title
- `message` - Notification message
- `related_id` - ID of related task/wish/listing
- `related_type` - Type of related entity
- `action_url` - Where to navigate on click
- `is_read` - Read status
- `metadata` - Extra JSON data
- `created_at` - Timestamp
- `read_at` - When marked as read

### Notification Types:
- `task_accepted` - Task was accepted
- `task_rejected` - Task was rejected
- `task_started` - Task started
- `task_completed` - Task completed
- `task_cancelled` - Task cancelled
- `task_completion_request` - One party marked task as complete
- `wish_accepted` - Wish was accepted
- `wish_fulfilled` - Wish was fulfilled
- `wish_cancelled` - Wish was cancelled
- `counter_offer` - Counter offer received
- `new_nearby_task` - New task in your area
- `new_nearby_wish` - New wish in your area
- `new_nearby_listing` - New listing in your area
- `chat_message` - New chat message

---

## 🎯 Next Steps

After confirming the system works:
1. Remove the test button from `/App.tsx` (search for "DEBUG: Test Notification Button")
2. Test with real task lifecycle events
3. Test with multiple users
4. Verify notification popups appear correctly
5. Check notification screen shows full history

---

**Need Help?** Check the console logs first - they contain detailed debugging information!
