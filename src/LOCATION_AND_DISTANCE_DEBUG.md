# 📍 Location & Distance Debugging Guide

## Current Issues Identified

### 1. Location Not Showing in Header ❌
**Symptom:** Header shows "Select location" instead of actual location  
**Cause:** User hasn't set their location yet  
**Solution:** Click "Select location" → Detect Location OR manually select city/area

### 2. No Tasks Showing (0 tasks available) ❌
**Symptom:** "No Results Found" on Tasks Nearby tab  
**Possible Causes:**
- User created all tasks while logged in → `getTasks()` filters out user's own tasks
- No tasks exist in database
- All tasks have `is_hidden = true`

**Solution:** 
- Create tasks from a DIFFERENT account OR logout and create tasks
- Check database: `SELECT * FROM tasks WHERE is_hidden = false;`

### 3. Distance Not Showing on Cards ❌
**Symptom:** Cards don't show "3.5 km" distance  
**Required Conditions (ALL must be true):**
- ✅ Task must have `latitude` and `longitude` in database
- ✅ User must have set their location (click "Select location")
- ✅ User location must have coordinates
- ✅ Distance calculation must run in service

---

## How Location System Works

### Architecture Flow:
```
1. User clicks "Select location" button (header)
   ↓
2. Opens LocationBottomSheet component
   ↓
3. User can:
   - Click "Detect Location" (uses GPS)
   - OR manually select City + Area from dropdown
   ↓
4. Click "Save Location"
   ↓
5. Saves to `profiles` table:
   - city (TEXT)
   - area (TEXT)  
   - latitude (DECIMAL)
   - longitude (DECIMAL)
   - location_updated_at (TIMESTAMP)
   ↓
6. useLocation hook loads location on next render
   ↓
7. Location passed to all screens via globalLocation prop
   ↓
8. Header shows: "Area, City"
   ↓
9. Services use coordinates for distance calculation
```

### Database Schema (profiles table):
```sql
ALTER TABLE profiles ADD COLUMN city TEXT;
ALTER TABLE profiles ADD COLUMN area TEXT;
ALTER TABLE profiles ADD COLUMN street TEXT;
ALTER TABLE profiles ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE profiles ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE profiles ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;
```

---

## How Distance Calculation Works

### For Tasks:

**1. Task Creation (CreateTaskScreen.tsx)**
```javascript
// When user creates task, GPS coordinates are captured
const handleSubmit = async () => {
  const coords = await captureLocation(); // Gets GPS
  
  await createTask({
    // ... other fields
    latitude: coords.latitude,   // Stored in DB
    longitude: coords.longitude, // Stored in DB
  });
};
```

**2. Task Loading (tasks.ts service)**
```javascript
export async function getTasks(filters) {
  // Fetch tasks from DB
  const tasks = await supabase.from('tasks').select('*');
  
  // Calculate distance if user location provided
  tasks.map(task => {
    if (filters.userLat && filters.userLon && task.latitude && task.longitude) {
      task.distance = calculateDistance(
        filters.userLat,     // User's latitude
        filters.userLon,     // User's longitude  
        task.latitude,       // Task's latitude
        task.longitude       // Task's longitude
      );
    }
    return task;
  });
  
  // Sort by distance
  tasks.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
}
```

**3. TaskCard Display (TaskCard.tsx)**
```javascript
{task.distance && (
  <span className="text-primary font-medium whitespace-nowrap">
    {task.distance.toFixed(1)} km
  </span>
)}
```

### For Wishes (same pattern):
- WishCard.tsx displays distance
- wishes.ts calculates distance
- CreateWishScreen captures GPS coordinates

---

## Console Debugging (Check Browser Console)

### Expected Logs When Everything Works:

**On Page Load:**
```
🔍 [TasksScreen] Loading tasks with filters: { category: '', city: '', area: '', status: 'open', userCoords: { latitude: 19.0760, longitude: 72.8777 } }
📋 Fetched tasks from DB: 5 tasks
📊 Task distances: [
  { title: "Need plumber", distance: 2.3, userId: "xyz..." },
  { title: "Moving help", distance: 5.1, userId: "abc..." }
]
✅ [TasksScreen] Loaded tasks: 5 [...details]
```

**If Location Not Set:**
```
🔍 [TasksScreen] Loading tasks with filters: { ..., userCoords: null }
📋 Fetched tasks from DB: 5 tasks
📊 Task distances: [
  { title: "Need plumber", distance: undefined },
  { title: "Moving help", distance: undefined }
]
```

**If User Created All Tasks:**
```
📋 Fetched tasks from DB: 0 tasks  // All filtered out by user_id check
✅ [TasksScreen] Loaded tasks: 0 []
```

---

## Step-by-Step Testing Guide

### Test 1: Set Location
1. Open app as logged-in user
2. Click "Select location" in header
3. Click "Detect Location" button
4. Allow browser location permission
5. Wait for coordinates to appear
6. Select City and Area from dropdowns
7. Click "Save Location"
8. ✅ Header should now show: "Area Name, City Name"

### Test 2: Create Task with Location
1. Go to Tasks Nearby tab
2. Click "+ Post Task"  
3. Fill form (title, description, price, etc.)
4. **Location will be auto-captured** (check console for "✅ Location captured successfully")
5. Submit task
6. ✅ Task created with lat/lon coordinates

### Test 3: View Distance on Cards
**Prerequisites:**
- User location is set (Test 1 complete)
- Task has coordinates (Test 2 complete)
- Viewing task from DIFFERENT account (not creator)

**Steps:**
1. Go to Tasks Nearby tab
2. Look at task cards
3. ✅ Should see distance like "3.5 km" next to location

### Test 4: Check Database
```sql
-- Check if user location is saved
SELECT id, display_name, city, area, latitude, longitude 
FROM profiles 
WHERE id = 'YOUR_USER_ID';

-- Check if tasks have coordinates  
SELECT id, title, latitude, longitude, user_id, is_hidden
FROM tasks
WHERE is_hidden = false;

-- Check who created the tasks
SELECT t.id, t.title, t.user_id, p.display_name as creator
FROM tasks t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE t.is_hidden = false;
```

---

## Common Issues & Fixes

### Issue: "Select location" button doesn't update header
**Fix:**
1. Open browser DevTools → Application tab → Local Storage
2. Check if location is in database: Go to Supabase Dashboard → profiles table
3. If not saved, try setting location again
4. Hard refresh page (Ctrl+Shift+R)

### Issue: Tasks showing "0 tasks available"
**Fix:**
1. Check console: `📋 Fetched tasks from DB: X tasks`
2. If X > 0 but display shows 0 → User created all tasks → Logout and view
3. If X = 0 → No tasks in database → Create tasks from different account

### Issue: Distance not showing on cards
**Fix:**
1. Check console for `📊 Task distances: [...]`
2. If all distances are `undefined`:
   - Check if user location is set (`userCoords: { lat, lon }`)
   - Check if tasks have coordinates in database
3. If distance calculated but not showing:
   - Check TaskCard.tsx component (line 83-87)
   - Verify `task.distance` property exists

### Issue: Location permission denied
**Fix:**
1. Go to browser settings → Site permissions → Location
2. Allow location for your site
3. Clear localStorage item: `oldcycle_location_permission`
4. Try detecting location again

---

## Testing Checklist

### Before Reporting Bugs:
- [ ] Opened browser console (F12)
- [ ] Checked for console logs starting with 🔍 📋 📊 ✅
- [ ] Verified user location is set (header shows area/city)
- [ ] Checked database for task coordinates
- [ ] Confirmed viewing tasks from different account (not creator)
- [ ] Hard refreshed page (Ctrl+Shift+R)
- [ ] Checked Supabase profiles table for location data
- [ ] Verified browser location permission is granted

### Share These Details When Reporting:
1. Console log output (full text)
2. User ID from localStorage: `oldcycle_user`
3. Current location from profiles table (SQL query result)
4. Tasks from database (SQL query result)  
5. Browser and OS version
6. Whether logged in or logged out

---

## Quick Reference

### Key Files:
- `/hooks/useLocation.ts` - Location state management
- `/services/tasks.ts` - Distance calculation for tasks
- `/services/wishes.ts` - Distance calculation for wishes
- `/components/LocationBottomSheet.tsx` - Location selection UI
- `/components/TaskCard.tsx` - Distance display
- `/components/WishCard.tsx` - Distance display

### Key Database Tables:
- `profiles` - Stores user location (city, area, lat, lon)
- `tasks` - Stores task location (latitude, longitude)
- `wishes` - Stores wish location (latitude, longitude)

### Key Props Flow:
```
App.tsx
  ↓ globalLocation (from useLocation hook)
  ↓ userCoordinates prop
  ↓
TasksScreen
  ↓ userCoordinates in filters
  ↓
getAllTasks service
  ↓ userLat, userLon
  ↓
getTasks service
  ↓ calculateDistance()
  ↓
TaskCard
  ↓ task.distance
  ↓
Display: "3.5 km"
```

---

## Expected Behavior Summary

✅ **When location IS set:**
- Header shows: "Area, City"
- Tasks sorted by distance (closest first)
- Cards show: "3.5 km" (if task has coordinates)
- Blue info box: "Showing tasks near Area, City"

✅ **When location NOT set:**
- Header shows: "Select location"
- Tasks sorted by creation date (newest first)
- Cards don't show distance
- No location info box

✅ **When viewing own tasks:**
- Filtered out from "Tasks Nearby" view
- Visible in "Your Active Tasks" section (if accepted/in_progress)
- Visible in Profile → "My Tasks"

