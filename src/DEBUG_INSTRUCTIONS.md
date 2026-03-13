# 🐛 Debug Instructions - Session Storage Issue

## The Problem
Push notifications aren't saving device tokens because the session isn't available when the hook runs.

## How to Debug with Chrome DevTools

### 1. Connect Your Phone to Chrome
1. Connect your Android phone to your computer via USB
2. Enable USB Debugging on your phone
3. Open Chrome and go to: `chrome://inspect`
4. You should see your device and the LocalFelo app
5. Click "inspect" to open DevTools

### 2. Watch the Console Logs

After login, look for these log messages in order:

#### ✅ **GOOD - Storage Adapter Working:**
```
🔍 [CapacitorStorage] GET: sb-<project>-auth-token
✅ [CapacitorStorage] GET Result: sb-...-auth-token → Found (1234 chars)
```

#### ❌ **BAD - Storage Adapter NOT Working:**
```
🔍 [CapacitorStorage] GET: sb-<project>-auth-token
❌ [CapacitorStorage] GET Result: sb-...-auth-token → Not found
```

### 3. What Each Log Means

| Log Message | Meaning |
|-------------|---------|
| `🔍 [CapacitorStorage] GET:` | Supabase is trying to READ session from storage |
| `💾 [CapacitorStorage] SET:` | Supabase is trying to SAVE session to storage |
| `✅ → Found` | Session data WAS in storage ✅ |
| `❌ → Not found` | Session data NOT in storage ❌ |
| `[usePushNotifications] Session Found!` | Push hook has access to session ✅ |
| `[usePushNotifications] No session found` | Push hook DOESN'T have session ❌ |

### 4. Screenshot What You See

Take screenshots of the console output showing:

1. **During Login** - Look for `SET:` operations
2. **After Login** - Look for `GET:` operations  
3. **Push Notification Logs** - Session found or not found

## Expected Flow (WORKING)

```
1. User logs in
   💾 [CapacitorStorage] SET: sb-xxx-auth-token (2456 chars)
   ✅ [CapacitorStorage] SET Complete: sb-xxx-auth-token

2. App restarts / Page reloads
   🔍 [CapacitorStorage] GET: sb-xxx-auth-token
   ✅ [CapacitorStorage] GET Result: → Found (2456 chars)

3. Push hook runs
   [usePushNotifications] Waiting for storage to initialize...
   [usePushNotifications] ✅ Session already exists, starting registration
```

## Current Flow (BROKEN)

```
1. User logs in
   (No SET logs?? Session not being saved!)

2. App restarts / Page reloads
   🔍 [CapacitorStorage] GET: sb-xxx-auth-token
   ❌ [CapacitorStorage] GET Result: → Not found

3. Push hook runs
   [usePushNotifications] Waiting for storage to initialize...
   [usePushNotifications] ❌ No session found after storage init
```

## Questions to Answer

1. **Do you see ANY CapacitorStorage logs at all?**
   - YES → Storage adapter is being used ✅
   - NO → Storage adapter is NOT being used ❌

2. **Do you see SET logs during login?**
   - YES → Session is being saved ✅
   - NO → Session is NOT being saved ❌

3. **Do you see GET logs after app restart?**
   - YES with "Found" → Session persists ✅
   - YES with "Not found" → Session doesn't persist ❌
   - NO → Storage adapter not being used ❌

## Next Steps Based on Results

### If NO storage logs at all
→ Capacitor storage adapter isn't being used
→ Need to check if `Capacitor.isNativePlatform()` returns true

### If SET logs missing during login
→ Session is being saved to localStorage instead of Preferences
→ Need to force storage adapter initialization earlier

### If GET returns "Not found"
→ Session is being saved but not persisting
→ Might be a Capacitor Preferences issue

---

Send me screenshots of the console and I'll help you fix it! 🚀
