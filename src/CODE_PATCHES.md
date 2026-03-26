# Code Patches - Ready to Apply

## File 1: `/App.tsx`

### Patch 1.1: Import NewHomeScreen
```typescript
// Add this import near line 42 (after other screen imports)
import { NewHomeScreen } from './screens/NewHomeScreen';
```

### Patch 1.2: Update home case in renderScreen() (around line 536)
```typescript
// REPLACE this:
case 'home':
  return (
    <HomeScreen
      user={user}
      // ... existing props
    />
  );

// WITH this:
case 'home':
  return (
    <NewHomeScreen
      onNavigate={(screen, data) => {
        console.log('[NewHomeScreen] Navigation:', screen, data);
        
        // Handle login
        if (screen === 'login') {
          setShowLoginModal(true);
          return;
        }
        
        // Handle navigation with data
        if (data) {
          if (data.wishId) {
            setSelectedWishId(data.wishId);
            navigateToScreen('wish-detail');
          } else if (data.taskId) {
            setSelectedTaskId(data.taskId);
            navigateToScreen('task-detail');
          } else if (data.listingId) {
            navigateToListing(data.listingId);
          } else if (data.conversationId) {
            setChatConversationId(data.conversationId);
            navigateToScreen('chat');
          } else {
            navigateToScreen(screen as Screen);
          }
        } else {
          navigateToScreen(screen as Screen);
        }
      }}
      isLoggedIn={!!user}
      isAdmin={isAdmin}
      userDisplayName={user?.name}
      unreadCount={unreadCount}
      notificationCount={notificationUnreadCount}
      userLocation={globalLocation || null}
      onNotificationClick={() => setShowNotificationPanel(true)}
    />
  );
```

### Patch 1.3: Keep marketplace case for now (it's separate from home)
```typescript
// Keep the existing marketplace case as-is
case 'marketplace':
  return (
    <MarketplaceScreen
      // ... existing props
    />
  );
```

---

## File 2: `/screens/WishesScreen.tsx`

### Patch 2.1: Add imports at top
```typescript
import { MapView } from '../components/MapView';
import { Map, List } from 'lucide-react';
```

### Patch 2.2: Add state variable (after existing useState declarations)
```typescript
const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
```

### Patch 2.3: Add view toggle buttons (after search/filter section, before wishes list)
```typescript
{/* View Mode Toggle */}
<div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold text-heading">
    {filteredWishes.length} Wish{filteredWishes.length !== 1 ? 'es' : ''}
  </h2>
  <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1">
    <button
      onClick={() => setViewMode('list')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
        viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-heading'
      }`}
    >
      <List className="w-4 h-4" />
      <span className="text-sm font-medium">List</span>
    </button>
    <button
      onClick={() => setViewMode('map')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
        viewMode === 'map' ? 'bg-primary text-white' : 'text-muted hover:text-heading'
      }`}
    >
      <Map className="w-4 h-4" />
      <span className="text-sm font-medium">Map</span>
    </button>
  </div>
</div>
```

### Patch 2.4: Replace wishes list section
```typescript
{/* REPLACE the existing wishes list div with this: */}
{viewMode === 'list' ? (
  <div className="space-y-3">
    {filteredWishes.map((wish) => (
      <WishCard
        key={wish.id}
        wish={wish}
        onClick={() => {
          setSelectedWishId(wish.id);
          onNavigate('wish-detail');
        }}
        onChatClick={
          isLoggedIn && user?.id !== wish.userId
            ? async () => {
                try {
                  const { conversation, error } = await getOrCreateConversation(
                    wish.id,
                    wish.title,
                    undefined,
                    wish.budgetMax || wish.budgetMin || 0,
                    wish.userId,
                    wish.userName,
                    wish.userAvatar
                  );
                  if (error || !conversation) {
                    toast.error('Failed to start chat');
                    return;
                  }
                  onNavigate('chat', { conversationId: conversation.id });
                } catch (err) {
                  console.error('Failed to create conversation:', err);
                  toast.error('Failed to start chat');
                }
              }
            : undefined
        }
        showChatButton={isLoggedIn && user?.id !== wish.userId}
      />
    ))}
  </div>
) : (
  <div className="h-[calc(100vh-350px)] min-h-[500px] rounded-lg overflow-hidden border border-border bg-white">
    <MapView
      markers={filteredWishes
        .filter(w => w.latitude && w.longitude)
        .map(w => ({
          id: w.id,
          latitude: w.latitude!,
          longitude: w.longitude!,
          title: w.title,
          price: w.budgetMax || w.budgetMin,
          type: 'wish' as const,
          categoryEmoji: w.categoryEmoji,
          status: w.status,
        }))}
      onMarkerClick={(wishId) => {
        setSelectedWishId(wishId);
        onNavigate('wish-detail');
      }}
    />
  </div>
)}
```

---

## File 3: `/screens/TasksScreen.tsx`

### Patch 3.1: Add imports at top
```typescript
import { MapView } from '../components/MapView';
import { Map, List } from 'lucide-react';
```

### Patch 3.2: Add state variable
```typescript
const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
```

### Patch 3.3: Add view toggle buttons
```typescript
{/* View Mode Toggle */}
<div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold text-heading">
    {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
  </h2>
  <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1">
    <button
      onClick={() => setViewMode('list')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
        viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-heading'
      }`}
    >
      <List className="w-4 h-4" />
      <span className="text-sm font-medium">List</span>
    </button>
    <button
      onClick={() => setViewMode('map')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
        viewMode === 'map' ? 'bg-primary text-white' : 'text-muted hover:text-heading'
      }`}
    >
      <Map className="w-4 h-4" />
      <span className="text-sm font-medium">Map</span>
    </button>
  </div>
</div>
```

### Patch 3.4: Replace tasks list section
```typescript
{/* REPLACE the existing tasks list div with this: */}
{viewMode === 'list' ? (
  <div className="space-y-3">
    {filteredTasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        onClick={() => {
          setSelectedTaskId(task.id);
          onNavigate('task-detail');
        }}
        onChatClick={
          isLoggedIn && user?.id !== task.userId
            ? async () => {
                try {
                  const { conversation, error } = await getOrCreateConversation(
                    task.id,
                    task.title,
                    task.price,
                    undefined,
                    task.userId,
                    task.userName,
                    task.userAvatar
                  );
                  if (error || !conversation) {
                    toast.error('Failed to start chat');
                    return;
                  }
                  onNavigate('chat', { conversationId: conversation.id });
                } catch (err) {
                  console.error('Failed to create conversation:', err);
                  toast.error('Failed to start chat');
                }
              }
            : undefined
        }
        showChatButton={isLoggedIn && user?.id !== task.userId}
      />
    ))}
  </div>
) : (
  <div className="h-[calc(100vh-350px)] min-h-[500px] rounded-lg overflow-hidden border border-border bg-white">
    <MapView
      markers={filteredTasks
        .filter(t => t.latitude && t.longitude)
        .map(t => ({
          id: t.id,
          latitude: t.latitude!,
          longitude: t.longitude!,
          title: t.title,
          price: t.price,
          type: 'task' as const,
          categoryEmoji: t.categoryEmoji,
          status: t.status,
        }))}
      onMarkerClick={(taskId) => {
        setSelectedTaskId(taskId);
        onNavigate('task-detail');
      }}
    />
  </div>
)}
```

---

## Summary of Changes

### Created Files:
1. ✅ `/screens/NewHomeScreen.tsx` - New landing page
2. ✅ `/components/AnimatedButton.tsx` - User edited
3. ✅ `/components/HorizontalScroll.tsx` - User edited
4. ✅ `/components/MapView.tsx` - User edited
5. ✅ `/styles/globals.css` - Updated with animations
6. ✅ `/INTEGRATION_GUIDE.md` - Complete guide
7. ✅ `/CODE_PATCHES.md` - This file

### Files to Update:
1. 🔧 `/App.tsx` - Add NewHomeScreen import and case
2. 🔧 `/screens/WishesScreen.tsx` - Add map view toggle
3. 🔧 `/screens/TasksScreen.tsx` - Add map view toggle

### Optional (for consistency):
4. 🔧 `/components/BottomNavigation.tsx` - Could rename first tab to "Home" instead of "Marketplace"

---

## Quick Apply Instructions

1. **Copy NewHomeScreen import to App.tsx line 42**
2. **Replace home case in App.tsx renderScreen() function**
3. **Add map view to WishesScreen.tsx** (4 patches)
4. **Add map view to TasksScreen.tsx** (4 patches)
5. **Test the application!**

All components are ready and TypeScript-safe!
