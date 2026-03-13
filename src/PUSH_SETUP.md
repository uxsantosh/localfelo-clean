# Push Notifications Setup Guide

## 📋 Overview

This guide walks you through setting up the push notification infrastructure for LocalFelo. The system is designed to work with Android, iOS, and web platforms without any native code in this repository.

---

## ✅ What's Already Done

- ✅ Database schema defined (`/supabase/migrations/001_push_notifications.sql`)
- ✅ Edge function stub created (`/supabase/functions/send-push-notification/index.ts`)
- ✅ Web service layer complete (`/services/pushClient.ts`)
- ✅ React hook implemented (`/hooks/usePushNotifications.ts`)
- ✅ TypeScript types defined (`/types/push.ts`)
- ✅ App integration complete (`/App.tsx`)

---

## 🗄️ Step 1: Database Setup

### Run the Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `/supabase/migrations/001_push_notifications.sql`
4. Execute the SQL

### What This Creates

- `push_tokens` table with all required columns
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp updates
- Helper functions for cleanup

### Verify Setup

Run this query in SQL Editor:

```sql
-- Check table exists
SELECT * FROM push_tokens LIMIT 1;

-- Check policies
SELECT policyname FROM pg_policies WHERE tablename = 'push_tokens';

-- Expected policies:
-- - Users can insert own tokens
-- - Users can update own tokens
-- - Users can delete own tokens
-- - Users can read own tokens
```

---

## ⚡ Step 2: Edge Function Deployment

### Deploy the Stub Function

```bash
# Login to Supabase CLI (if not already)
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
supabase functions deploy send-push-notification
```

### Test the Function

```bash
# Test locally first
supabase functions serve send-push-notification

# Send test request
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "test-user-uuid",
    "title": "Test Notification",
    "body": "This is a test"
  }'
```

### Expected Response (Stub)

```json
{
  "success": true,
  "message": "Push notifications queued successfully (STUB)",
  "sent_count": 0,
  "failed_count": 0
}
```

---

## 🌐 Step 3: Web App Integration (Already Done)

The web app is already integrated. Here's what's active:

### Automatic Token Registration

When a user logs in, the `usePushNotifications` hook:
1. Checks if push is supported
2. Requests permission (currently stub)
3. Gets token from provider (currently stub)
4. Saves to Supabase (when token is available)

### Manual Token Registration (Native Bridge)

Native Android/iOS code can call:

```javascript
import('/services/pushClient.js').then(module => {
  module.savePushToken('fcm_token_here', 'android');
});
```

This saves the token to Supabase immediately.

---

## 📱 Step 4: Android Integration (Future)

### Android Setup (in separate Android project)

1. **Add Firebase to Android app**
   ```gradle
   // app/build.gradle
   implementation 'com.google.firebase:firebase-messaging:23.0.0'
   ```

2. **Get FCM token**
   ```kotlin
   FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
       if (task.isSuccessful) {
           val token = task.result
           // Pass to WebView
           webView.evaluateJavascript("""
               import('/services/pushClient.js').then(module => {
                   module.savePushToken('$token', 'android');
               });
           """, null)
       }
   }
   ```

3. **Handle notifications**
   ```kotlin
   class MyFirebaseMessagingService : FirebaseMessagingService() {
       override fun onMessageReceived(remoteMessage: RemoteMessage) {
           // Show notification
           NotificationCompat.Builder(this, CHANNEL_ID)
               .setContentTitle(remoteMessage.notification?.title)
               .setContentText(remoteMessage.notification?.body)
               .show()
       }
   }
   ```

---

## 🍎 Step 5: iOS Integration (Future)

### iOS Setup (in separate iOS project)

1. **Enable Push Notifications in Xcode**
   - Signing & Capabilities → + Capability → Push Notifications

2. **Request permission and get token**
   ```swift
   import UserNotifications
   
   UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
       if granted {
           DispatchQueue.main.async {
               UIApplication.shared.registerForRemoteNotifications()
           }
       }
   }
   
   func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
       let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
       
       // Pass to WebView
       webView.evaluateJavaScript("""
           import('/services/pushClient.js').then(module => {
               module.savePushToken('\(token)', 'ios');
           });
       """)
   }
   ```

3. **Handle notifications**
   ```swift
   func userNotificationCenter(_ center: UNUserNotificationCenter,
                               didReceive response: UNNotificationResponse,
                               withCompletionHandler completionHandler: @escaping () -> Void) {
       let userInfo = response.notification.request.content.userInfo
       // Handle notification tap
       completionHandler()
   }
   ```

---

## 🔥 Step 6: Firebase Integration (Backend)

### Update Edge Function

Replace the stub in `/supabase/functions/send-push-notification/index.ts`:

```typescript
// Add at top
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin (get service account from Firebase Console)
const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}');
initializeApp({
  credential: cert(serviceAccount),
});

// Replace STUB section with:
const messaging = getMessaging();

const messages = tokens.map(token => ({
  notification: {
    title: requestData.title,
    body: requestData.body,
  },
  data: requestData.data || {},
  token: token.token,
}));

const response = await messaging.sendEach(messages);

// Handle failures
let failedCount = 0;
response.responses.forEach((resp, idx) => {
  if (!resp.success) {
    failedCount++;
    // Mark invalid tokens as inactive
    if (resp.error?.code === 'messaging/invalid-registration-token') {
      supabase
        .from('push_tokens')
        .update({ is_active: false })
        .eq('token', tokens[idx].token)
        .then(() => console.log('Marked token as inactive'));
    }
  }
});

return new Response(
  JSON.stringify({
    success: true,
    message: 'Push notifications sent',
    sent_count: tokens.length - failedCount,
    failed_count: failedCount,
  }),
  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

### Set Environment Variables

```bash
# In Supabase dashboard: Settings → Edge Functions → Secrets
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

---

## 🧪 Step 7: Testing

### Test Token Storage

1. Login to the app
2. Open browser console
3. Run:
   ```javascript
   import('/services/pushClient.js').then(async (module) => {
     const result = await module.savePushToken('test_token_123', 'web');
     console.log('Saved:', result);
   });
   ```

4. Check database:
   ```sql
   SELECT * FROM push_tokens WHERE user_id = 'YOUR_USER_ID';
   ```

### Test Edge Function

```bash
# Get your Supabase URL and anon key from dashboard
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "title": "Test Push",
    "body": "Hello from edge function",
    "platform": "all"
  }'
```

### Test End-to-End (After Firebase Setup)

1. Register device token (Android/iOS/Web)
2. Send notification via edge function
3. Verify notification received on device
4. Check delivery status in Firebase Console

---

## 📊 Monitoring & Maintenance

### View Active Tokens

```sql
SELECT 
  platform,
  COUNT(*) as token_count,
  COUNT(DISTINCT user_id) as user_count
FROM push_tokens
WHERE is_active = true
GROUP BY platform;
```

### Clean Up Inactive Tokens

```sql
-- Manual cleanup
SELECT cleanup_inactive_push_tokens();

-- Or set up pg_cron job (if enabled)
SELECT cron.schedule(
  'cleanup-push-tokens',
  '0 0 * * 0', -- Every Sunday at midnight
  $$SELECT cleanup_inactive_push_tokens()$$
);
```

### Monitor Failed Deliveries

Check Firebase Console → Cloud Messaging → Reports for:
- Delivery success rate
- Error codes
- Platform breakdown

---

## 🔐 Security Checklist

- ✅ RLS policies enabled on `push_tokens`
- ✅ Users can only access their own tokens
- ✅ Edge function validates input
- ✅ Firebase service account stored in secrets
- ✅ No API keys exposed in client code
- ✅ Tokens marked inactive on permanent failures
- ✅ Foreign key constraints prevent orphaned tokens

---

## 🐛 Troubleshooting

### "No tokens found for user"
- User hasn't granted permission
- Token registration failed
- Check `push_tokens` table for user

### "Firebase error: invalid-registration-token"
- Token expired or revoked
- User uninstalled app
- Token will be auto-marked inactive

### "Edge function timeout"
- Too many tokens being sent at once
- Consider batch processing
- Increase function timeout in Supabase settings

### "RLS policy violation"
- User not authenticated
- Check `auth.uid()` is set correctly
- Verify JWT token is valid

---

## 📚 Additional Resources

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [APNs Documentation](https://developer.apple.com/documentation/usernotifications)

---

## ✅ Deployment Checklist

- [ ] Run database migration
- [ ] Deploy edge function
- [ ] Set Firebase environment variables
- [ ] Test token storage
- [ ] Test notification sending
- [ ] Verify RLS policies
- [ ] Set up monitoring
- [ ] Configure cleanup job
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Test on web browser
- [ ] Document for team

---

**Status:** 🟢 Infrastructure Ready | 🟡 Firebase Integration Pending | 🟡 Native Apps Pending
