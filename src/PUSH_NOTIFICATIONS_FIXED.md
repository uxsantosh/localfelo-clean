# ✅ Push Notifications System - All Fixed!

## Summary

Fixed all push notification code to match your **actual Supabase database schema**.

---

## 📊 Your Database Schema (Confirmed)

**Table Name:** `device_tokens`

**Columns:**
```sql
id              UUID PRIMARY KEY
user_id         UUID NOT NULL
device_token    TEXT NOT NULL    -- ⚠️ NOT "token"!
platform        TEXT NOT NULL
device_name     TEXT
device_model    TEXT
is_enabled      BOOLEAN
created_at      TIMESTAMPTZ
last_used_at    TIMESTAMPTZ
```

**Unique Constraint:** `device_token` column must be unique

---

## ✅ Files Updated

### 1. `/hooks/usePushNotifications.ts` ✅
**Status:** Already correct! Uses `device_tokens` table with proper schema.

**What it does:**
- Called automatically in App.tsx when user logs in
- Requests push notification permission
- Gets FCM token from Android/iOS
- Saves token to `device_tokens` table
- Handles session validation to ensure RLS passes

**Database insert:**
```typescript
{
  user_id: userId,
  device_token: token,
  platform: 'android' | 'ios' | 'web',
  device_name: deviceName,
  device_model: deviceModel,
  is_enabled: true,
  last_used_at: new Date().toISOString()
}
```

---

### 2. `/App.tsx` ✅
**Status:** Already calling the hook!

**Code:**
```typescript
import { usePushNotifications } from './hooks/usePushNotifications';

// Inside App component:
const pushStatus = usePushNotifications(user?.id);
```

This means tokens are being registered when users log in!

---

### 3. `/supabase/functions/send-push-notification/index.ts` ✅ FIXED
**Changes:**
- ❌ `from('push_tokens')` → ✅ `from('device_tokens')`
- ❌ `eq('is_active', true)` → ✅ `eq('is_enabled', true)`
- ❌ `token.token` → ✅ `token.device_token`

**What to do:**
Deploy this function to Supabase:
```bash
supabase functions deploy send-push-notification
```

---

### 4. `/services/pushClient.ts` ✅ FIXED
**Changes:**
- ❌ `from('push_tokens')` → ✅ `from('device_tokens')`
- ❌ `token: token.trim()` → ✅ `device_token: token.trim()`
- ❌ `is_active: true` → ✅ `is_enabled: true`
- ❌ `updated_at` → ✅ `last_used_at`

---

### 5. `/types/push.ts` ✅ FIXED
**Changes:**
Updated `PushToken` interface to match database:
```typescript
export interface PushToken {
  id: string;
  user_id: string;
  device_token: string;      // ✅ WAS "token"
  platform: PushPlatform;
  device_name?: string;      // ✅ ADDED
  device_model?: string;     // ✅ ADDED
  is_enabled: boolean;       // ✅ WAS "is_active"
  created_at: string;
  last_used_at?: string;     // ✅ WAS "updated_at"
}
```

---

### 6. `/scripts/verify-push-setup.js` ✅ FIXED
**Changes:**
- ❌ `from('push_tokens')` → ✅ `from('device_tokens')`
- Updated console logs to show correct table name

---

## 🔧 Supabase Setup Required

### 1. Verify RLS Policies Exist

Run this in Supabase SQL Editor to check:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'device_tokens'
ORDER BY cmd, policyname;
```

**You should see 4 policies:**
1. `Users can insert own device tokens` (INSERT)
2. `Users can read own device tokens` (SELECT)
3. `Users can update own device tokens` (UPDATE)
4. `Users can delete own device tokens` (DELETE)

### 2. If Policies Are Missing

Run this migration: `/database/migrations/fix_device_tokens_policies.sql`

It will create all necessary RLS policies.

---

## 📱 How Push Notifications Work Now

### Flow:

1. **User logs in** → `App.tsx` renders
2. **`usePushNotifications(user.id)` hook activates**
3. **Hook checks:** Is this a native platform? (Android/iOS)
4. **If yes:**
   - Requests push notification permission
   - Registers with FCM (Firebase Cloud Messaging)
   - Gets FCM token (e.g., `"cX7k9P2m..."`)
5. **Saves to database:**
   ```sql
   INSERT INTO device_tokens (user_id, device_token, platform, ...)
   VALUES ('uuid', 'fcm_token_here', 'android', ...)
   ON CONFLICT (device_token) DO UPDATE ...
   ```
6. **Token is now stored!** ✅

### Sending Notifications:

When someone accepts a task, the app calls:
```typescript
import { notifyUser } from './services/pushNotificationDispatcher';

notifyUser({
  userId: 'target-user-uuid',
  title: 'Task Accepted!',
  body: 'John accepted your task',
  data: {
    type: 'task',
    entity_id: 'task-uuid',
    action: 'accepted'
  }
});
```

This calls the Supabase Edge Function which:
1. Looks up user's tokens in `device_tokens` table
2. Sends push notification to FCM
3. FCM delivers to user's phone

---

## 🧪 Testing

### 1. Check if tokens are being saved

**In Android app:**

1. Log in as a user
2. Check browser console logs:
   ```
   [usePushNotifications] ✅ Token stored in device_tokens table
   ```

3. Verify in Supabase:
   ```sql
   SELECT * FROM device_tokens 
   WHERE user_id = 'your-user-uuid';
   ```

You should see a row with:
- `device_token`: Long FCM token string
- `platform`: `'android'`
- `is_enabled`: `true`

### 2. Test notification sending

**In Supabase SQL Editor:**

```sql
-- Get a test token
SELECT device_token, user_id FROM device_tokens LIMIT 1;
```

Then use the Edge Function (currently a stub) to test:
```typescript
// In browser console or React
const { data } = await supabase.functions.invoke('send-push-notification', {
  body: {
    user_id: 'your-user-uuid',
    title: 'Test Notification',
    body: 'This is a test',
    platform: 'android'
  }
});
console.log(data);
```

**Note:** The Edge Function is currently a STUB. It fetches tokens but doesn't actually send notifications yet. You need to implement FCM integration.

---

## 🚀 Next Steps

### 1. Deploy Edge Function ✅
```bash
cd supabase
supabase functions deploy send-push-notification
```

### 2. Verify Tokens Are Being Saved
- Log in on Android app
- Check `device_tokens` table in Supabase
- Should see new rows appear

### 3. Implement FCM in Edge Function (Future)

The Edge Function at `/supabase/functions/send-push-notification/index.ts` currently has stub code with FCM examples commented out. When ready:

1. Set up Firebase Admin SDK
2. Uncomment FCM code in the function
3. Add Firebase service account credentials to Supabase secrets
4. Test sending actual notifications

---

## 📝 Summary of Changes

| File | What Was Wrong | What's Fixed |
|------|----------------|--------------|
| `usePushNotifications.ts` | ✅ Already correct | No changes needed |
| `App.tsx` | ✅ Already calling hook | No changes needed |
| `send-push-notification/index.ts` | Used `push_tokens` table, wrong columns | Now uses `device_tokens` with correct schema |
| `pushClient.ts` | Used `push_tokens` table, wrong columns | Now uses `device_tokens` with correct schema |
| `types/push.ts` | Wrong column names in interface | Updated to match database exactly |
| `verify-push-setup.js` | Checked wrong table name | Now checks `device_tokens` |

---

## ✅ Checklist

- [x] Hook is being called in App.tsx
- [x] Hook uses correct table name (`device_tokens`)
- [x] Hook uses correct column names
- [x] Edge Function uses correct table name
- [x] Edge Function uses correct column names
- [x] TypeScript types match database schema
- [x] Verification script updated
- [ ] Deploy Edge Function to Supabase (YOU DO THIS)
- [ ] Verify RLS policies exist (YOU DO THIS)
- [ ] Test token saving on Android (YOU DO THIS)

---

## 🐛 Debugging

### If tokens aren't saving:

**Check logs in Android app:**
```
[usePushNotifications] Hook called with userId: abc12345...
[usePushNotifications] useEffect triggered
[usePushNotifications] Requesting permission...
[usePushNotifications] ✅ FCM token received: cX7k9P2m...
[usePushNotifications] Attempting upsert...
[usePushNotifications] ✅ Token stored in device_tokens table
```

**If you see errors:**

1. **"No active Supabase session found"**
   - User session expired, ask them to log out and log back in

2. **"permission denied" or RLS error**
   - Run `/database/migrations/fix_device_tokens_policies.sql`

3. **"No data returned from upsert"**
   - RLS SELECT policy missing
   - Run the migration above

4. **"onConflict column doesn't match"**
   - Should be fixed now (using `device_token` not `token`)

---

## 🎉 All Done!

Your push notification system is now:
- ✅ Using the correct database table
- ✅ Using the correct column names
- ✅ Being called automatically on login
- ✅ Ready to save tokens to the database

**Next:** Deploy the Edge Function and test on Android!
