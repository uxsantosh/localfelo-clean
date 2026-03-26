# OldCycle MVP Features - Implementation Guide

## 🎯 New Features Added

### 1. **Wish Anything** ✨
- Users can post wishes for items/services they're looking for
- Budget range (optional min/max)
- Category-based
- Contact via Phone/WhatsApp
- Location-based (Google Maps deep links)

### 2. **Service Tasks** 💼
- Users offer services with pricing
- Price + negotiation flag
- Category-based
- Contact via Phone/WhatsApp
- Location-based (Google Maps deep links)

### 3. **Location System** 📍
- Auto-detect on mobile devices
- Manual entry on desktop
- Google Maps deep links only (no SDK)
- Exact location shown only after contact acceptance
- Progressive disclosure

---

## 📁 Files Created

### **Database & Migrations**
- `/migrations/add_wishes_tasks_tables.sql` - Complete database schema for wishes and tasks

### **Services**
- `/services/wishes.ts` - Wishes CRUD operations
- `/services/tasks.ts` - Tasks CRUD operations
- `/services/locationHelper.ts` - Google Maps deep link helpers (NO SDK)

### **Types**
- Updated `/types/index.ts` - Added Wish, Task, LocationData interfaces

### **Constants**
- `/constants/taskCategories.ts` - Task and Wish specific categories

### **Components**
- `/components/WishCard.tsx` - Compact wish display card
- `/components/TaskCard.tsx` - Compact task display card

### **Screens**
- `/screens/CreateWishScreen.tsx` - Create a new wish
- `/screens/CreateTaskScreen.tsx` - Create a new service task

---

## 🔧 Integration Steps

### **Step 1: Run Database Migration**
```sql
-- In Supabase SQL Editor, run:
/migrations/add_wishes_tasks_tables.sql
```

This creates:
- `wishes` table
- `tasks` table
- `wish_reports` table
- `task_reports` table
- All necessary RLS policies
- Indexes for performance

### **Step 2: Update App.tsx**

Add new screens to the routing:

```typescript
// Add to Screen type
type Screen = 
  | 'home' 
  | 'create' 
  | 'profile' 
  | 'wishes'        // NEW
  | 'create-wish'   // NEW
  | 'tasks'         // NEW
  | 'create-task'   // NEW
  | ...existing screens

// Add to getScreenFromPath
const screenMap: Record<string, Screen> = {
  ...existing,
  '/wishes': 'wishes',
  '/create-wish': 'create-wish',
  '/tasks': 'tasks',
  '/create-task': 'create-task',
};

// Add to renderScreen() switch statement
case 'create-wish':
  return user ? (
    <CreateWishScreen
      onBack={() => navigateToScreen('home')}
      onSuccess={() => {
        navigateToScreen('home');
        toast.success('Wish created successfully! 🎉');
      }}
      onNavigate={(screen) => navigateToScreen(screen as Screen)}
      isLoggedIn={!!user}
      isAdmin={isAdmin}
      userDisplayName={user.name}
      unreadCount={unreadCount}
      cities={cities}
    />
  ) : null;

case 'create-task':
  return user ? (
    <CreateTaskScreen
      onBack={() => navigateToScreen('home')}
      onSuccess={() => {
        navigateToScreen('home');
        toast.success('Task posted successfully! 🎉');
      }}
      onNavigate={(screen) => navigateToScreen(screen as Screen)}
      isLoggedIn={!!user}
      isAdmin={isAdmin}
      userDisplayName={user.name}
      unreadCount={unreadCount}
      cities={cities}
    />
  ) : null;
```

### **Step 3: Add Quick Access to HomeScreen**

Add floating buttons or a section to access:
- "Post a Wish" → navigate to 'create-wish'
- "Offer Service" → navigate to 'create-task'
- "Browse Wishes" → navigate to 'wishes' (to be created)
- "Browse Tasks" → navigate to 'tasks' (to be created)

### **Step 4: Update Profile Screen**

Add tabs to show user's:
- My Listings (existing)
- My Wishes (new)
- My Tasks (new)

Use `getUserWishes()` and `getUserTasks()` from services.

### **Step 5: Admin Controls** (Optional for later)

Add to AdminScreen:
- Moderate wishes (hide inappropriate)
- Moderate tasks (hide inappropriate)
- View reports

---

## 🎨 UI/UX Principles Applied

✅ **Compact & Dense** - Small cards, tight spacing, readable text
✅ **Mobile-First** - Touch-friendly buttons, thumb-zone optimized
✅ **Progressive Disclosure** - Exact location only after contact
✅ **No Clutter** - Clean forms, minimal fields
✅ **Flat Design** - 4px border radius, no shadows
✅ **Orange Branding** - #FF6B35 primary color
✅ **Fast & Lightweight** - No heavy libraries, simple animations

---

## 📱 Location System Details

### Mobile (Auto-detect)
```typescript
// Automatically tries to get location
const location = await getCurrentLocation();
// Creates Google Maps deep link
const deepLink = createMapsDeepLink(lat, lng);
```

### Desktop (Manual)
```typescript
// User doesn't see location input
// City + Area selection is enough
// Exact coordinates are optional
```

### Deep Links
```typescript
// View on map
https://www.google.com/maps/search/?api=1&query=lat,lng

// Navigate to location
https://www.google.com/maps/dir/?api=1&destination=lat,lng
```

**No autocomplete, No SDK, No complex UI**

---

## 🔐 Authentication

Uses existing **soft-auth system**:
- `client_token` - Identifies creator
- `owner_token` - Allows edit/delete
- No changes needed to auth system
- Works exactly like listings

---

## 📊 Admin Features (To Implement)

### Moderate Content
```typescript
// Hide inappropriate wishes
await supabase
  .from('wishes')
  .update({ is_hidden: true })
  .eq('id', wishId);

// View reports
const { data } = await supabase
  .from('wish_reports')
  .select('*, wishes(*)')
  .order('created_at', { ascending: false });
```

---

## 🚀 Next Steps

1. ✅ Database migration completed
2. ✅ Services created
3. ✅ Components created
4. ✅ Screens created
5. ⏳ **Update App.tsx** with new routes
6. ⏳ **Update HomeScreen** with quick access
7. ⏳ **Update ProfileScreen** with wishes/tasks tabs
8. ⏳ **Create Browse Screens** for wishes and tasks
9. ⏳ **Add Admin Controls** for moderation

---

## 🎯 Success Metrics

After implementation, users should be able to:
- ✨ Post wishes for items they want
- 💼 Offer services they provide
- 📞 Contact each other via Phone/WhatsApp
- 📍 Share location automatically on mobile
- 🔍 Browse wishes and tasks by category/location
- ✏️ Manage their own wishes and tasks
- 🚨 Report inappropriate content

---

## ⚠️ Important Notes

1. **NO OTP** - Don't implement OTP yet (as per requirements)
2. **NO Google Maps SDK** - Only deep links
3. **NO Autocomplete** - Only category suggestions
4. **Mobile-first** - Everything should work on mobile first
5. **Flat Design** - 4px border radius, consistent orange branding
6. **Keep Marketplace Intact** - Don't modify existing listing functionality

---

## 🐛 Troubleshooting

### RLS Errors
If you get RLS permission errors, check:
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'wishes';
SELECT * FROM pg_policies WHERE tablename = 'tasks';
```

### Location Not Detecting
- Check browser permissions
- Only works on HTTPS
- Falls back to manual entry gracefully

### Deep Links Not Working
- Links should open Google Maps app on mobile
- Falls back to web on desktop
- No authentication needed

---

**🎉 Ready to integrate into the main app!**
