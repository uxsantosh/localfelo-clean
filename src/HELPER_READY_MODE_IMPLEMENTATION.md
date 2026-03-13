# Helper Ready Mode - Implementation Guide

## Overview
This document provides the complete implementation for the Helper Ready Mode feature as specified in `/imports/helper-ready-mode.md`.

---

## ✅ COMPLETED FILES

### 1. `/services/helper.ts` - CREATED ✅
Helper service for managing availability status.

### 2. `/components/RadarAnimation.tsx` - CREATED ✅
Animated radar for "waiting for tasks" state.

### 3. `/components/FloatingAvailabilityPill.tsx` - CREATED ✅
Floating status pill when minimized.

### 4. `/screens/HelperReadyModeScreen.tsx` - CREATED ✅
Main helper ready mode screen with task list.

---

## 🔧 REQUIRED MODIFICATIONS

### 5. Database Schema Changes

Run this SQL in Supabase SQL Editor:

```sql
-- Add helper availability columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS helper_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS helper_available_since TIMESTAMP WITH TIME ZONE;

-- Add index for querying available helpers
CREATE INDEX IF NOT EXISTS idx_profiles_helper_available 
ON profiles(helper_available) 
WHERE helper_available = TRUE;

-- Add comment
COMMENT ON COLUMN profiles.helper_available IS 'Whether user is currently available as a helper for tasks';
COMMENT ON COLUMN profiles.helper_available_since IS 'Timestamp when helper mode was last activated';
```

---

### 6. Update `/screens/NewHomeScreen.tsx`

**STEP 1: Add imports (line 11)**

```typescript
import { Activity, TrendingUp } from 'lucide-react';
import { getTodayCompletionCount, toggleHelperAvailability, getHelperStatus } from '../services/helper';
```

**STEP 2: Add state (around line 55, after existing state)**

```typescript
const [helperAvailable, setHelperAvailable] = useState(false);
const [todayCompletions, setTodayCompletions] = useState(0);
```

**STEP 3: Update useEffect (around line 61)**

```typescript
useEffect(() => {
  loadNearbyContent();
  
  // Load helper status and activity if logged in
  if (isLoggedIn && currentUser?.id) {
    loadHelperStatus();
  }
  
  // Load today's completion count
  if (userLocation) {
    loadTodayCompletions();
  }
}, [userLocation, isLoggedIn, currentUser?.id]);
```

**STEP 4: Add helper functions (after loadNearbyContent function)**

```typescript
const loadHelperStatus = async () => {
  if (!currentUser?.id) return;
  
  const status = await getHelperStatus(currentUser.id);
  if (status) {
    setHelperAvailable(status.isAvailable);
  }
};

const loadTodayCompletions = async () => {
  if (!userLocation) return;
  
  const count = await getTodayCompletionCount(
    userLocation.latitude,
    userLocation.longitude
  );
  setTodayCompletions(count);
};

const handleToggleAvailability = async () => {
  if (!isLoggedIn) {
    toast.error('Please log in to become available as a helper');
    return;
  }
  
  if (!currentUser?.id) return;
  
  const newStatus = !helperAvailable;
  const success = await toggleHelperAvailability(currentUser.id, newStatus);
  
  if (success) {
    setHelperAvailable(newStatus);
    
    if (newStatus) {
      // Open Helper Ready Mode screen
      onNavigate('helper-ready-mode');
    } else {
      toast.success('You are now unavailable as a helper');
    }
  } else {
    toast.error('Failed to update availability');
  }
};
```

**STEP 5: Add UI elements after banner (insert after line 216, right after the banner closing </div>)**

```tsx
{/* Activity Indicator Line */}
<div className="flex items-center gap-2 px-4 py-2 mb-3">
  <Activity className="w-4 h-4 text-[#666666]" />
  <p className="text-sm text-[#666666]">
    {todayCompletions > 0 
      ? `${todayCompletions} tasks completed nearby today`
      : 'Tasks are getting completed nearby today'}
  </p>
</div>

{/* Availability Slider */}
{isLoggedIn && (
  <div 
    onClick={handleToggleAvailability}
    className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-6 cursor-pointer hover:border-[#CDFF00] transition-colors"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${helperAvailable ? 'bg-[#CDFF00]' : 'bg-[#E5E5E5]'}`} />
          <h3 className="font-semibold text-black">Available for nearby tasks</h3>
        </div>
        <p className="text-sm text-[#666666]">
          Turn this on to get instant alerts when someone posts a task nearby.
        </p>
      </div>
      <div className={`ml-4 w-12 h-6 rounded-full transition-colors ${helperAvailable ? 'bg-[#CDFF00]' : 'bg-[#E5E5E5]'} relative`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${helperAvailable ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  </div>
)}
```

---

### 7. Update `/App.tsx`

**STEP 1: Add helper-ready-mode to Screen type (around line 85)**

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
  | 'prohibited'
  | 'helper-ready-mode'; // NEW
```

**STEP 2: Add to screenMap (around line 110)**

```typescript
'/helper-ready-mode': 'helper-ready-mode',
```

**STEP 3: Import components (around line 51)**

```typescript
import { HelperReadyModeScreen } from './screens/HelperReadyModeScreen';
import { FloatingAvailabilityPill } from './components/FloatingAvailabilityPill';
```

**STEP 4: Add state for floating pill (around line 135)**

```typescript
const [showFloatingPill, setShowFloatingPill] = useState(false);
```

**STEP 5: Add effect to manage floating pill (around line 290)**

```typescript
// Show floating pill when user is available but not on helper-ready-mode screen
useEffect(() => {
  const checkHelperStatus = async () => {
    if (!user?.id) {
      setShowFloatingPill(false);
      return;
    }
    
    const { getHelperStatus } = await import('./services/helper');
    const status = await getHelperStatus(user.id);
    
    const isAvailable = status?.isAvailable || false;
    const isOnHelperScreen = currentScreen === 'helper-ready-mode';
    
    setShowFloatingPill(isAvailable && !isOnHelperScreen);
  };
  
  checkHelperStatus();
}, [user?.id, currentScreen]);
```

**STEP 6: Add case in renderScreen (around line 1500, add before default case)**

```typescript
case 'helper-ready-mode':
  return (
    <HelperReadyModeScreen
      onBack={() => {
        // Disable helper mode when going back
        if (user?.id) {
          import('./services/helper').then(({ toggleHelperAvailability }) => {
            toggleHelperAvailability(user.id, false);
          });
        }
        setCurrentScreen('home');
      }}
      onTaskClick={(task) => {
        setSelectedTaskId(task.id);
        setCurrentScreen('task-detail');
      }}
      userId={user?.id || ''}
      userLocation={globalLocation}
    />
  );
```

**STEP 7: Add floating pill before closing main div (around line 1700, before </div>)**

```tsx
{/* Floating Availability Pill */}
{showFloatingPill && (
  <FloatingAvailabilityPill
    onClick={() => setCurrentScreen('helper-ready-mode')}
  />
)}
```

**STEP 8: Update document titles (around line 230)**

```typescript
'helper-ready-mode': 'Helper Mode - Available for Tasks | LocalFelo',
```

---

## 📝 TESTING CHECKLIST

After implementing:

1. ✅ Login and check home screen shows activity indicator
2. ✅ Toggle availability slider - should open Helper Ready Mode screen
3. ✅ Verify Helper Ready Mode shows:
   - Green status bar at top
   - Nearby tasks with filters (Nearest/Highest Reward/Newest)
   - OR radar animation if no tasks
4. ✅ Click a task card - should open TaskDetailScreen
5. ✅ Press back - should disable helper mode and return to home
6. ✅ Navigate away from Helper Ready Mode - should show floating green pill
7. ✅ Click floating pill - should return to Helper Ready Mode
8. ✅ Verify database columns exist in profiles table

---

## 🚨 IMPORTANT NOTES

1. **Do NOT modify existing TaskDetailScreen, TasksScreen, or task acceptance logic**
2. **Reuse existing TaskCard component** - already created in HelperReadyModeScreen.tsx
3. **Keep UI minimal and clean** - matches LocalFelo design language
4. **Database migration is required** - run SQL before testing
5. **Feature is opt-in** - only logged-in users see the availability toggle

---

## 📦 FILES SUMMARY

### Created (4 files)
- `/services/helper.ts`
- `/components/RadarAnimation.tsx`
- `/components/FloatingAvailabilityPill.tsx`
- `/screens/HelperReadyModeScreen.tsx`

### Modified (2 files)
- `/screens/NewHomeScreen.tsx` - Add activity indicator + availability slider
- `/App.tsx` - Add helper-ready-mode screen + floating pill

### Database
- Add 2 columns to `profiles` table

---

## 🎯 FEATURE FLOW

1. User logs in → sees activity indicator on home screen
2. User toggles "Available for nearby tasks" → opens Helper Ready Mode screen
3. **If tasks exist:** Shows filtered list of nearby tasks
4. **If no tasks:** Shows radar animation with "Looking for nearby tasks..."
5. User clicks task → opens existing TaskDetailScreen
6. User navigates away → floating green pill appears
7. User clicks pill → returns to Helper Ready Mode
8. User presses back on Helper Ready Mode → disables availability, returns to home

---

This implementation maintains all existing functionality while cleanly integrating the new Helper Ready Mode feature.
