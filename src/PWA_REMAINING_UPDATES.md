# PWA Implementation - Remaining Code Updates

## Status: CreateWishScreen and CreateTaskScreen are COMPLETE ✅

The following screens still need PWA integration. Apply these changes manually or use find/replace.

---

## 1. CreateListingScreen.tsx

### Add imports (at top of file):
```typescript
import { InstallPrompt } from '../components/InstallPrompt';
import { shouldShowInstallPrompt, markInstallPromptShownThisSession, markInstallPromptDismissed, trackPWAEvent } from '../utils/pwaHelpers';
```

### Add state variables (after other useState declarations):
```typescript
const [showInstallPrompt, setShowInstallPrompt] = useState(false);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
```

### Add after successful listing creation (after toast.success):
```typescript
// After: toast.success('Listing posted successfully!');
// Add this:

// Show install prompt after 400ms if conditions are met
if (shouldShowInstallPrompt()) {
  setTimeout(() => {
    setShowInstallPrompt(true);
    markInstallPromptShownThisSession();
    trackPWAEvent('prompt_shown', 'listing-posted');
  }, 400);
}
```

### Add before closing </div> of component:
```typescript
{showInstallPrompt && (
  <InstallPrompt
    show={showInstallPrompt}
    onClose={() => {
      setShowInstallPrompt(false);
      markInstallPromptDismissed();
      trackPWAEvent('install_dismissed', 'listing-posted');
    }}
    onInstall={async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          trackPWAEvent('install_accepted', 'listing-posted');
        }
        setDeferredPrompt(null);
      }
      setShowInstallPrompt(false);
    }}
    trigger="listing-posted"
  />
)}
```

---

## 2. App.tsx - Add /install Route

### Add import (at top with other screen imports):
```typescript
import { InstallPage } from './screens/InstallPage';
```

### Add to Screen type (around line 59):
```typescript
type Screen = 
  | 'home' 
  | 'marketplace'
  | 'create' 
  | 'profile' 
  | 'listing' 
  | 'edit'
  | 'chat'
  | 'admin'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'safety'
  | 'contact'
  | 'diagnostic'
  | 'notifications'
  | 'wishes'
  | 'create-wish'
  | 'wish-detail'
  | 'tasks'
  | 'create-task'
  | 'task-detail'
  | 'install';  // ADD THIS LINE
```

### Add to getScreenFromPath function (around line 100):
```typescript
const screenMap: Record<string, Screen> = {
  '/marketplace': 'marketplace',
  '/create': 'create',
  '/profile': 'profile',
  '/chat': 'chat',
  '/admin': 'admin',
  '/about': 'about',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/safety': 'safety',
  '/contact': 'contact',
  '/diagnostic': 'diagnostic',
  '/notifications': 'notifications',
  '/wishes': 'wishes',
  '/create-wish': 'create-wish',
  '/wish-detail': 'wish-detail',
  '/tasks': 'tasks',
  '/create-task': 'create-task',
  '/task-detail': 'task-detail',
  '/install': 'install',  // ADD THIS LINE
};
```

### Add screen rendering logic (find where other screens are rendered):
```typescript
{currentScreen === 'install' && (
  <InstallPage onNavigate={navigateTo} />
)}
```

---

## 3. Update User Display Names

Create a utility function first:

### Create `/utils/formatUserName.ts`:
```typescript
export function formatUserName(name: string | null | undefined): string {
  if (!name || name.trim() === '' || name === 'User') {
    return 'Local Resident';
  }
  
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

### Update WishDetailScreen.tsx:

**Find:**
```typescript
Posted by {wish.poster_name || 'User'}
```

**Replace with:**
```typescript
import { formatUserName } from '../utils/formatUserName';

// Then in JSX:
Posted by {formatUserName(wish.poster_name)}
<p className="text-xs text-gray-500 mt-1">Posted by a local user near you</p>
```

### Update TaskDetailScreen.tsx:

**Find:**
```typescript
Posted by {task.poster_name || 'User'}
```

**Replace with:**
```typescript
import { formatUserName } from '../utils/formatUserName';

// Then in JSX:
Posted by {formatUserName(task.poster_name)}
<p className="text-xs text-gray-500 mt-1">Posted by a local user near you</p>
```

### Update ListingDetailScreen.tsx:

**Find:**
```typescript
{listing.seller_name || 'User'}
```

**Replace with:**
```typescript
import { formatUserName } from '../utils/formatUserName';

// Then in JSX:
{formatUserName(listing.seller_name)}
<p className="text-xs text-gray-500 mt-1">Posted by a local user near you</p>
```

---

## 4. ChatScreen.tsx - First Chat Install Prompt

### Add imports:
```typescript
import { InstallPrompt } from '../components/InstallPrompt';
import { shouldShowInstallPrompt, markInstallPromptShownThisSession, markInstallPromptDismissed, trackPWAEvent } from '../utils/pwaHelpers';
```

### Add state:
```typescript
const [showInstallPrompt, setShowInstallPrompt] = useState(false);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
```

### Add useEffect for first-time chat detection:
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

### Add component before closing </div>:
```typescript
{showInstallPrompt && (
  <InstallPrompt
    show={showInstallPrompt}
    onClose={() => {
      setShowInstallPrompt(false);
      markInstallPromptDismissed();
      trackPWAEvent('install_dismissed', 'first-chat');
    }}
    onInstall={async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          trackPWAEvent('install_accepted', 'first-chat');
        }
        setDeferredPrompt(null);
      }
      setShowInstallPrompt(false);
    }}
    trigger="first-chat"
  />
)}
```

---

## 5. Create PWA Icons

You need to create two PNG icons:

### pwa-192x192.png (192x192px)
- Use LocalFelo logo (bright green leaf on black background)
- Square format
- Save in `/public` folder

### pwa-512x512.png (512x512px)
- Same design as 192px version
- Higher resolution
- Save in `/public` folder

**Design Requirements:**
- Maskable safe zone (10% padding from edges)
- Clear, recognizable logo
- Bright green (#CDFF00) and black colors

---

## Testing Checklist

After applying all changes:

1. **Run npm install** to get vite-plugin-pwa
2. **Test install prompts** - post a wish/task and verify prompt appears after 400ms
3. **Test dismissal** - dismiss prompt and verify it doesn't show again for 3 days
4. **Test analytics** - check localStorage for 'pwa_analytics' entries
5. **Test /install page** - navigate to /install route
6. **Test user names** - verify "Local Resident" or "FirstName L." format
7. **Build for production** - `npm run build`
8. **Test on mobile** - Deploy and test on real devices

---

## Final Steps

1. Apply all changes above
2. Create PWA icons and place in /public folder
3. Run `npm install`
4. Test locally with `npm run dev`
5. Build with `npm run build`
6. Test production build with `npm run preview`
7. Deploy and test on mobile devices

