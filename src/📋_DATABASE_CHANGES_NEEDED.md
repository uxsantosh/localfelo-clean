# 🗄️ DATABASE CHANGES NEEDED FOR TASK MATCHING

## Required Changes in Supabase

### 1. **Add `detected_category` column to `tasks` table**

This column stores the AI-detected category for better matching between tasks and helpers.

```sql
-- Add detected_category column
ALTER TABLE tasks 
ADD COLUMN detected_category TEXT;

-- Add index for faster lookups
CREATE INDEX idx_tasks_detected_category ON tasks(detected_category);

-- Add comment
COMMENT ON COLUMN tasks.detected_category IS 'AI-detected category for smart matching (Cooking, Cleaning, Delivery, etc.)';
```

### 2. **Add `helper_categories` column to `users` table**

This column stores the helper's selected skills/categories as a JSON array.

```sql
-- Add helper_categories column (JSON array)
ALTER TABLE users 
ADD COLUMN helper_categories JSONB DEFAULT '[]'::jsonb;

-- Add index for faster lookups
CREATE INDEX idx_users_helper_categories ON users USING GIN (helper_categories);

-- Add comment
COMMENT ON COLUMN users.helper_categories IS 'Array of category names the user can help with (e.g., ["Cooking", "Cleaning"])';
```

### 3. **Add `helper_mode_enabled` column to `users` table**

This boolean indicates if the user wants to receive notifications for matching tasks.

```sql
-- Add helper_mode_enabled column
ALTER TABLE users 
ADD COLUMN helper_mode_enabled BOOLEAN DEFAULT false;

-- Add index for faster filtering
CREATE INDEX idx_users_helper_mode ON users(helper_mode_enabled) WHERE helper_mode_enabled = true;

-- Add comment
COMMENT ON COLUMN users.helper_mode_enabled IS 'Whether user wants to receive notifications for matching tasks';
```

### 4. **Add `max_distance_km` column to `users` table**

Stores the helper's maximum distance preference.

```sql
-- Add max_distance_km column
ALTER TABLE users 
ADD COLUMN max_distance_km INTEGER DEFAULT 10;

-- Add check constraint
ALTER TABLE users 
ADD CONSTRAINT max_distance_valid CHECK (max_distance_km > 0 AND max_distance_km <= 100);

-- Add comment
COMMENT ON COLUMN users.max_distance_km IS 'Maximum distance (km) helper is willing to travel for tasks';
```

---

## Category Alignment

### Task Creation Categories (19 total)
Stored in: `/services/taskCategories.ts`

1. 🍳 Cooking
2. 🧹 Cleaning
3. 🚚 Delivery
4. 💻 Tech Help
5. 📚 Teaching
6. 📦 Moving
7. 🚗 Driving
8. 🔧 Fixing
9. 📷 Photography
10. 🐕 Pet Care
11. 👶 Babysitting
12. 🪴 Gardening
13. 💄 Beauty Services
14. 🔨 Installation
15. 🎯 Mentoring
16. 🎉 Event Help
17. 🏃 Errands
18. 🧺 Laundry
19. ✨ Other

### Helper Preferences Categories (19 total)
Stored in: `/constants/helperCategories.ts`

**EXACTLY THE SAME** as task creation categories for perfect matching!

---

## How Matching Works

### 1. **Task Creation**
- User types task description
- AI detects category after 3 words
- Category stored in `tasks.detected_category`

### 2. **Helper Setup**
- User selects categories they can help with
- Categories stored in `users.helper_categories`
- Distance preference stored in `users.max_distance_km`

### 3. **Smart Matching**
```
Task: "Need help cleaning house" → Detected: "Cleaning"
Helper has: ["Cleaning", "Cooking"] → MATCH! ✅

Task: "Fix my laptop wifi" → Detected: "Tech Help"  
Helper has: ["Cooking", "Delivery"] → NO MATCH ❌
```

### 4. **Location Matching**
```
Task Location: (lat, lng)
Helper Location: (lat, lng)
Distance = Haversine formula

If distance <= helper.max_distance_km → SHOW TASK ✅
Else → HIDE TASK ❌
```

---

## Implementation Status

### ✅ Completed
- [x] Task categories aligned with helper categories
- [x] Auto-detection after 3 words
- [x] Manual category override
- [x] Category picker modal
- [x] Matching service (`/services/taskMatching.ts`)
- [x] Helper empty state component
- [x] Task creation saves `detected_category`

### ⏳ Pending (Database Changes Required)
- [ ] Run SQL migration to add columns
- [ ] Update RLS policies for new columns
- [ ] Test matching logic with real data
- [ ] Add helper setup screen (if not exists)
- [ ] Update TasksScreen to show only matching tasks for helpers
- [ ] Add notifications for matching tasks

---

## Testing After Migration

1. **Create a task:**
   - Type "Need help cleaning my house"
   - Verify category detected as "Cleaning"
   - Verify `detected_category` saved in database

2. **Setup as helper:**
   - Select categories: "Cleaning", "Cooking"
   - Set distance: 10 km
   - Enable helper mode

3. **View tasks as helper:**
   - Should only see tasks matching selected categories
   - Should only see tasks within distance range
   - Empty state if no matches

4. **Get notifications:**
   - When new task posted matching your skills
   - When within your distance range
   - Only if helper_mode_enabled = true

---

## Next Steps

1. **Run SQL migration in Supabase** (copy SQL from above)
2. **Update RLS policies** (if needed)
3. **Test the matching logic**
4. **Complete Part 2 implementation** (TasksScreen updates)
5. **Add helper setup UI** (category selection screen)
