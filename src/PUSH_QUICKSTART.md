# Push Notifications - Quick Start

## 🚀 5-Minute Setup

### 1. Run Database Migration (2 minutes)

```sql
-- In Supabase SQL Editor (https://app.supabase.com)
-- Copy and paste from: /supabase/migrations/001_push_notifications.sql
-- Click "Run"
```

### 2. Deploy Edge Function (1 minute)

```bash
supabase functions deploy send-push-notification
```

### 3. Test It Works (2 minutes)

```javascript
// In browser console (logged in user required)
import('/services/pushClient.js').then(async (m) => {
  const result = await m.savePushToken('test_token_123', 'android');
  console.log('Saved:', result); // Should be true
});

// Verify in database
// SELECT * FROM push_tokens;
```

---

## ✅ What You Get

- ✅ Push tokens stored securely in Supabase
- ✅ Native Android/iOS bridge ready
- ✅ Edge function for sending notifications
- ✅ Type-safe TypeScript implementation
- ✅ Zero breaking changes to existing app

---

## 📱 How to Use from Native Code

### Android
```kotlin
webView.evaluateJavascript("""
    import('/services/pushClient.js').then(module => {
        module.savePushToken('$fcmToken', 'android');
    });
""", null)
```

### iOS
```swift
webView.evaluateJavaScript("""
    import('/services/pushClient.js').then(module => {
        module.savePushToken('\(apnsToken)', 'ios');
    });
""")
```

---

## 🔥 Send a Push Notification

### Via Edge Function
```javascript
const { data } = await supabase.functions.invoke('send-push-notification', {
  body: {
    user_id: 'target-user-uuid',
    title: 'Hello!',
    body: 'This is a push notification',
    data: { action: 'open_chat' }
  }
});
```

### Via curl
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "title": "Test",
    "body": "Hello from API"
  }'
```

---

## 📚 Full Documentation

- **Setup Guide:** `/PUSH_SETUP.md` (comprehensive)
- **API Reference:** `/PUSH_NOTIFICATIONS.md`
- **Implementation Details:** `/PUSH_IMPLEMENTATION_SUMMARY.md`

---

## 🐛 Troubleshooting

### "Token not saving"
→ Check if user is logged in (`getCurrentUser()`)

### "Database error"
→ Run the migration SQL first

### "Edge function not found"
→ Deploy with `supabase functions deploy send-push-notification`

---

**Status:** 🟢 Ready to use  
**Setup Time:** ~5 minutes  
**Breaking Changes:** None
