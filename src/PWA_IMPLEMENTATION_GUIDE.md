# LocalFelo PWA Implementation Guide

## ✅ Completed Steps

### 1. Dependencies & Configuration
- ✅ Added `vite-plugin-pwa` to package.json
- ✅ Configured PWA manifest in vite.config.ts
- ✅ Added PWA meta tags to index.html

### 2. Core Components Created
- ✅ `/components/InstallPrompt.tsx` - Bottom-sheet install prompt
- ✅ `/components/NotificationPermissionPrompt.tsx` - Notification permission UI
- ✅ `/screens/InstallPage.tsx` - Dedicated /install page
- ✅ `/utils/pwaHelpers.ts` - PWA utilities and analytics

### 3. Partial Integration
- ✅ CreateWishScreen.tsx - Shows install prompt after wish posting

---

## 🔧 Remaining Implementation Steps

### Step 1: Create PWA Icons

Create two PNG icons from your LocalFelo logo:

1. **pwa-192x192.png** (192x192px)
2. **pwa-512x512.png** (512x512px)

Place them in the `/public` folder (create if it doesn't exist).

**Design Requirements:**
- Use the LocalFelo logo (bright green leaf on black background)
- Square format with proper padding
- Maskable safe zone (10% padding from edges)

---

### Step 2: Install Package

Run this command to install the PWA plugin:

```bash
npm install
```

---

### Step 3: Add Install Prompts to Remaining Screens

#### A. Create Task Screen (`/screens/CreateTaskScreen.tsx`)

Add after line 1 (imports):
```typescript
import { InstallPrompt } from '../components/InstallPrompt';
import { shouldShowInstallPrompt, markInstallPromptShownThisSession, markInstallPromptDismissed, trackPWAEvent } from '../utils/pwaHelpers';
```

Add to state variables:
```typescript
const [showInstallPrompt, setShowInstallPrompt] = useState(false);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
```

After successful task creation (find `toast.success` for task posted):
```typescript
// Show install prompt after 400ms if conditions are met
if (shouldShowInstallPrompt()) {
  setTimeout(() => {
    setShowInstallPrompt(true);
    markInstallPromptShownThisSession();
    trackPWAEvent('prompt_shown', 'task-posted');
  }, 400);
}
```

Add before closing `</div>` of the component:
```typescript
{showInstallPrompt && (
  <InstallPrompt
    show={showInstallPrompt}
    onClose={() => {
      setShowInstallPrompt(false);
      markInstallPromptDismissed();
      trackPWAEvent('install_dismissed', 'task-posted');
    }}
    onInstall={async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          trackPWAEvent('install_accepted', 'task-posted');
        }
        setDeferredPrompt(null);
      }
      setShowInstallPrompt(false);
    }}
    trigger="task-posted"
  />
)}
```

#### B. Create Listing Screen (`/screens/CreateListingScreen.tsx`)

Same pattern as above, but use:
- `trigger="listing-posted"`
- `trackPWAEvent('prompt_shown', 'listing-posted')`

#### C. Task Detail Screen (for Task Acceptance) (`/screens/TaskDetailScreen.tsx`)

Add install prompt after task acceptance logic.

Find the function that handles "Accept Task" button click, then add:

```typescript
// After successful task acceptance
if (shouldShowInstallPrompt()) {
  setTimeout(() => {
    setShowInstallPrompt(true);
    markInstallPromptShownThisSession();
    trackPWAEvent('prompt_shown', 'task-accepted');
  }, 400);
}
```

Use:
- `trigger="task-accepted"`
- `contextTitle="Task accepted 🎉"`

#### D. Chat Screen (First Chat Open) (`/screens/ChatScreen.tsx`)

Add logic to detect first-time chat opening:

```typescript
useEffect(() => {
  const hasOpenedChatBefore = localStorage.getItem('has_opened_chat');
  
  if (!hasOpenedChatBefore && shouldShowInstallPrompt()) {
    localStorage.setItem('has_opened_chat', 'true');
    
    setTimeout(() => {
      setShowInstallPrompt(true);
      markInstallPromptShownThisSession();
      trackPWAEvent('prompt_shown', 'first-chat');
    }, 1000); // Wait 1 second after chat opens
  }
}, []);
```

Use:
- `trigger="first-chat"`

---

### Step 4: Add /install Route

In `/App.tsx`, add to the screen type:

```typescript
type Screen = 
  | 'home' 
  | 'marketplace'
  // ... existing screens
  | 'install'; // ADD THIS
```

Add to `getScreenFromPath` function:

```typescript
const screenMap: Record<string, Screen> = {
  // ... existing routes
  '/install': 'install',
};
```

Add to screen rendering logic:

```typescript
{currentScreen === 'install' && (
  <InstallPage onNavigate={navigateTo} />
)}
```

Add import at top:

```typescript
import { InstallPage } from './screens/InstallPage';
```

---

### Step 5: Capture Install Prompt Event

In `/App.tsx`, add to the main App component:

```typescript
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  window.addEventListener('beforeinstallprompt', handler);

  return () => {
    window.removeEventListener('beforeinstallprompt', handler);
  };
}, []);
```

Then pass `deferredPrompt` down to screens that need it via props.

---

### Step 6: Notification Permission Flow

Add notification permission prompt AFTER app is installed and user receives first message.

In the chat notification logic (wherever you handle incoming messages), add:

```typescript
import { shouldAskNotificationPermission, requestNotificationPermission } from '../utils/pwaHelpers';
import { NotificationPermissionPrompt } from '../components/NotificationPermissionPrompt';

// When user receives first message or response
if (shouldAskNotificationPermission()) {
  setShowNotificationPermission(true);
}
```

Add state:
```typescript
const [showNotificationPermission, setShowNotificationPermission] = useState(false);
```

Add component:
```typescript
{showNotificationPermission && (
  <NotificationPermissionPrompt
    show={showNotificationPermission}
    onClose={() => setShowNotificationPermission(false)}
    onAllow={async () => {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      }
      setShowNotificationPermission(false);
    }}
  />
)}
```

---

### Step 7: Update User Display Names

Replace instances of generic "User" with first name + initial pattern.

Find in all detail screens (WishDetailScreen, TaskDetailScreen, ListingDetailScreen):

**BEFORE:**
```typescript
<p>Posted by User</p>
```

**AFTER:**
```typescript
<p>Posted by {formatUserName(poster.name) || 'Local Resident'}</p>
```

Add helper function:
```typescript
function formatUserName(name: string | null | undefined): string | null {
  if (!name) return null;
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0]; // Just first name
  }
  
  // First name + last initial
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
}
```

Add reassurance text:
```typescript
<p className="text-xs text-gray-500 mt-1">
  Posted by a local user near you
</p>
```

---

### Step 8: Build & Test

#### Development Testing:
```bash
npm run dev
```

- Test install prompts (may not work in dev mode - use production)
- Test analytics tracking (check localStorage)

#### Production Build:
```bash
npm run build
npm run preview
```

#### Testing on Mobile:
1. Deploy to your hosting (Vercel, Netlify, etc.)
2. Open on mobile browser (Chrome for Android, Safari for iOS)
3. Test install flow
4. Test notifications (Android only - iOS has limited PWA support)

---

## 📊 Analytics Tracking

View analytics in browser console:

```javascript
const events = JSON.parse(localStorage.getItem('pwa_analytics') || '[]');
console.table(events);
```

Tracked events:
- `prompt_shown` - Install prompt displayed
- `install_accepted` - User installed app
- `install_dismissed` - User dismissed install prompt
- `chat_opened_web` - Chat opened on web (not installed)
- `chat_opened_installed` - Chat opened in installed app

---

## 🎨 Design Requirements

### Install Prompt:
- Bottom-sheet modal (not full screen)
- Shows 300-500ms after success confirmation
- Maximum once per session
- If dismissed, don't show again for 3 days

### iOS Instructions:
- Show visual steps for Safari "Add to Home Screen"
- Use Share icon + Plus icon illustrations

### Android:
- Trigger native install prompt
- Seamless one-tap install

---

## 🚫 What NOT to Do

- ❌ Don't show install prompts on landing/home screen
- ❌ Don't show install prompts while browsing
- ❌ Don't use toast messages for install or permission requests
- ❌ Don't mention "PWA", "Play Store", or "App Store" in UI
- ❌ Don't block any user action
- ❌ Don't ask notification permission during install

---

## ✅ What to Do

- ✅ Only show install prompts at high-intent moments
- ✅ Always allow "Continue on web" option
- ✅ Ask notification permission AFTER install
- ✅ Track analytics events
- ✅ Use proper user names ("Ravi K." not "User")
- ✅ Add reassurance text ("Posted by a local user near you")

---

## 🐛 Troubleshooting

### Install prompt not showing?
- Check if app is already installed: `window.matchMedia('(display-mode: standalone)').matches`
- Check if dismissed recently: `localStorage.getItem('install_prompt_dismissed')`
- Check if shown this session: `sessionStorage.getItem('install_prompt_shown')`

### Notifications not working?
- iOS Safari has limited PWA notification support
- Android Chrome requires HTTPS
- Check permission status: `Notification.permission`

### Icons not showing?
- Ensure pwa-192x192.png and pwa-512x512.png are in /public folder
- Clear browser cache and rebuild

---

## 📱 Mobile Testing Checklist

### Android (Chrome):
- [ ] Install prompt appears after posting
- [ ] Native install prompt triggered
- [ ] App icon appears on home screen
- [ ] App opens in standalone mode
- [ ] Notifications work (after permission granted)
- [ ] Splash screen shows LocalFelo branding

### iOS (Safari):
- [ ] Custom install instructions appear
- [ ] Share button instructions clear
- [ ] App icon appears on home screen
- [ ] App opens in standalone mode
- [ ] Theme color applied to status bar

---

## 🚀 Next Steps

1. Create PWA icons (pwa-192x192.png, pwa-512x512.png)
2. Run `npm install`
3. Add install prompts to remaining screens (Task, Listing, Chat)
4. Add /install route to App.tsx
5. Implement notification permission flow
6. Update user display names across all screens
7. Build and test on mobile devices
8. Deploy and test in production

---

## 📚 Resources

- [PWA Install Prompts Best Practices](https://web.dev/install-criteria/)
- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Push Notifications](https://web.dev/push-notifications-overview/)

