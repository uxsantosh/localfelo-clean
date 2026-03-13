# 🚀 Quick Start - New MVP Features

## How to Access New Features

### 1. **Browse Wishes** ✨
Navigate to: `/wishes`

Or programmatically:
```typescript
navigateToScreen('wishes');
```

### 2. **Create a Wish** 
Navigate to: `/create-wish`

Or programmatically:
```typescript
navigateToScreen('create-wish');
```
**Requires: User must be logged in**

### 3. **Browse Tasks** 💼
Navigate to: `/tasks`

Or programmatically:
```typescript
navigateToScreen('tasks');
```

### 4. **Create a Task**
Navigate to: `/create-task`

Or programmatically:
```typescript
navigateToScreen('create-task');
```
**Requires: User must be logged in**

---

## 🏠 Suggested HomeScreen Integration

Add these quick access buttons to HomeScreen for better UX:

```tsx
// In HomeScreen.tsx, add this section after the banner/categories:

<div className="grid grid-cols-2 gap-3 mb-4">
  <button
    onClick={() => onNavigate?.('wishes')}
    className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-[4px] hover:border-primary transition-all"
  >
    <Sparkles className="w-6 h-6 text-primary" />
    <div className="text-center">
      <p className="text-sm font-medium">Wish Anything</p>
      <p className="text-xs text-muted">Looking for something?</p>
    </div>
  </button>

  <button
    onClick={() => onNavigate?.('tasks')}
    className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-[4px] hover:border-primary transition-all"
  >
    <Briefcase className="w-6 h-6 text-primary" />
    <div className="text-center">
      <p className="text-sm font-medium">Service Tasks</p>
      <p className="text-xs text-muted">Offer your services</p>
    </div>
  </button>
</div>
```

---

## 📊 API Usage Examples

### **Get All Wishes**
```typescript
import { getWishes } from './services/wishes';

const wishes = await getWishes({
  categoryId: '1', // optional
  cityId: '1', // optional
  areaId: '1-1', // optional
  searchQuery: 'iPhone', // optional
});
```

### **Create a Wish**
```typescript
import { createWish } from './services/wishes';
import { getCurrentUser } from './services/auth';

const user = getCurrentUser();
const result = await createWish(
  {
    title: 'Looking for iPhone 13 Pro',
    description: 'Good condition, with original box',
    categoryId: '1',
    budgetMin: 40000,
    budgetMax: 50000,
    phone: '9876543210',
    hasWhatsapp: true,
    whatsapp: '9876543210',
    cityId: '1',
    areaId: '1-1',
    exactLocation: 'https://www.google.com/maps/search/?api=1&query=19.0760,72.8777',
  },
  user.id
);

if (result.success) {
  toast.success('Wish created!');
}
```

### **Get All Tasks**
```typescript
import { getTasks } from './services/tasks';

const tasks = await getTasks({
  categoryId: '16', // Services category
  cityId: '1',
  searchQuery: 'laptop repair',
});
```

### **Create a Task**
```typescript
import { createTask } from './services/tasks';
import { getCurrentUser } from './services/auth';

const user = getCurrentUser();
const result = await createTask(
  {
    title: 'Laptop Repair & Maintenance',
    description: 'Expert laptop repair service. All brands.',
    categoryId: '16',
    price: 500,
    isNegotiable: true,
    phone: '9876543210',
    hasWhatsapp: true,
    cityId: '1',
    areaId: '1-1',
  },
  user.id
);

if (result.success) {
  toast.success('Task posted!');
}
```

---

## 🎨 UI Components Usage

### **WishCard Component**
```tsx
import { WishCard } from './components/WishCard';

<WishCard
  wish={wishObject}
  onClick={() => console.log('Wish clicked')}
  showActions={true}
/>
```

### **TaskCard Component**
```tsx
import { TaskCard } from './components/TaskCard';

<TaskCard
  task={taskObject}
  onClick={() => console.log('Task clicked')}
  showActions={true}
/>
```

---

## 📍 Location Helper Usage

### **Auto-detect Location (Mobile)**
```typescript
import { getCurrentLocation, createMapsDeepLink } from './services/locationHelper';

const location = await getCurrentLocation();
if (location) {
  const deepLink = createMapsDeepLink(location.latitude, location.longitude);
  console.log('Deep link:', deepLink);
}
```

### **Create Navigation Link**
```typescript
import { createNavigationLink } from './services/locationHelper';

const navLink = createNavigationLink(19.0760, 72.8777);
// Opens: https://www.google.com/maps/dir/?api=1&destination=19.0760,72.8777
window.open(navLink, '_blank');
```

### **Check if Mobile Device**
```typescript
import { isMobileDevice } from './services/locationHelper';

if (isMobileDevice()) {
  // Auto-detect location
} else {
  // Show manual location input
}
```

---

## 🔧 Testing URLs

After deployment, test these URLs directly:

**Browse Wishes:**
```
http://localhost:5173/wishes
https://yourapp.com/wishes
```

**Create Wish:**
```
http://localhost:5173/create-wish
https://yourapp.com/create-wish
```

**Browse Tasks:**
```
http://localhost:5173/tasks
https://yourapp.com/tasks
```

**Create Task:**
```
http://localhost:5173/create-task
https://yourapp.com/create-task
```

---

## 🚨 Error Handling

All services return consistent error objects:

```typescript
{
  success: boolean;
  error?: string;
  wishId?: string;  // or taskId
}
```

Example error handling:
```typescript
const result = await createWish(data, userId);

if (!result.success) {
  toast.error(result.error || 'Something went wrong');
} else {
  toast.success('Wish created!');
  navigateToScreen('home');
}
```

---

## 🎯 Common Use Cases

### **User wants to post a wish**
1. Click "Post Wish" button
2. If not logged in → Show login modal
3. Fill form (title, description, category, budget, location, contact)
4. Submit → Success toast → Navigate home

### **User wants to browse wishes**
1. Navigate to `/wishes`
2. Browse all wishes
3. Filter by category, city, area
4. Search by keyword
5. Click card to call or WhatsApp

### **User wants to offer a service**
1. Click "Post Service Task" button
2. If not logged in → Show login modal
3. Fill form (title, description, category, price, negotiable, location, contact)
4. Submit → Success toast → Navigate home

### **User wants to find services**
1. Navigate to `/tasks`
2. Browse all tasks
3. Filter by category, city, area
4. Search by keyword
5. Click card to call or WhatsApp

---

## 📱 Mobile-Specific Features

### **Location Auto-Detection**
- Works only on mobile devices
- Requires HTTPS
- User must grant permission
- Falls back gracefully if denied

### **Deep Link Behavior**
- **Mobile:** Opens Google Maps app
- **Desktop:** Opens Google Maps web
- **No authentication required**

---

## 🎉 Quick Commands

**Check if tables exist:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wishes', 'tasks');
```

**Count wishes:**
```sql
SELECT COUNT(*) FROM wishes WHERE is_hidden = false;
```

**Count tasks:**
```sql
SELECT COUNT(*) FROM tasks WHERE is_hidden = false;
```

**View recent wishes:**
```sql
SELECT * FROM wishes 
WHERE is_hidden = false 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ Checklist Before Go-Live

- [ ] Database migration completed
- [ ] Tables created (wishes, tasks)
- [ ] RLS policies active
- [ ] Can create wish via UI
- [ ] Can create task via UI
- [ ] Can browse wishes
- [ ] Can browse tasks
- [ ] Phone/WhatsApp buttons work
- [ ] Location detection works on mobile
- [ ] No console errors
- [ ] No TypeScript errors

---

**🎉 You're all set!**

The new MVP features are fully integrated and ready to use. Users can now post wishes, offer services, and connect directly via Phone/WhatsApp with automatic location sharing on mobile.
