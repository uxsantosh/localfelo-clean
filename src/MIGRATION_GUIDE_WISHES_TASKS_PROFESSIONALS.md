# 🔄 Complete Migration Guide: Wishes, Tasks & Professionals Unification

## 📋 Overview

This migration adds **role-based categorization** to the Wishes and Tasks modules to match the Professionals module's simplified user experience. Users will see simple roles (like "Electrician", "Plumber") while the backend maintains the existing 25-category system with subcategories.

---

## 🎯 What This Migration Does

### 1. **Wishes Module Enhancement**
- ✅ Adds `role_id` (UUID) - Maps to simplified roles like "Electrician"
- ✅ Adds `subcategory_id` (TEXT) - Single subcategory support
- ✅ Adds `subcategory_ids` (TEXT[]) - Multiple subcategories (same as professionals)
- ✅ Keeps `category_id` (INTEGER) - Existing wish categories (201-210) for backward compatibility
- ✅ Adds `helper_category` (TEXT) - AI-detected category from text analysis
- ✅ Adds `intent_type` (TEXT) - AI-detected intent (buy/rent/service)

### 2. **Tasks Module Enhancement**
- ✅ Adds `role_id` (UUID) - Maps to simplified roles like "Plumber"
- ✅ Adds `subcategory_ids` (TEXT[]) - Multiple subcategories (same as professionals)
- ✅ Keeps `category_id` (INTEGER) - Existing task categories (301-309) for backward compatibility
- ✅ Keeps `subcategory` (TEXT) - Legacy field for backward compatibility
- ✅ Adds `helper_category` (TEXT) - AI-detected category
- ✅ Adds `intent_type` (TEXT) - AI-detected intent

### 3. **Unified Notification System**
- ✅ Ensures `related_type` field properly routes to module (listing/wish/task/professional)
- ✅ Ensures `related_id` field properly links to specific item
- ✅ Adds helper view for enriched notification details
- ✅ Adds helper functions for unread counts by module
- ✅ Adds RLS policies for security
- ✅ Optimized indexes for fast queries

---

## 🗂️ Current Schema State (Before Migration)

### Wishes Table
```sql
category_id      INTEGER       -- Wish categories (201-210)
city_id          TEXT
area_id          TEXT
user_id          UUID
status           VARCHAR
urgency          TEXT
budget_min       INTEGER
budget_max       INTEGER
```

### Tasks Table
```sql
category_id      INTEGER       -- Task categories (301-309)
subcategory      TEXT          -- Legacy text field
detected_category TEXT         -- AI-detected
city_id          TEXT
area_id          TEXT
user_id          UUID
status           VARCHAR
price            INTEGER
```

### Professionals Table
```sql
role_id          UUID          -- Simplified role (NEW system)
category_id      TEXT          -- Backend category mapping
subcategory_id   TEXT          -- Single subcategory
subcategory_ids  TEXT[]        -- Multiple subcategories
city             TEXT
area             TEXT
user_id          UUID
```

---

## 🎨 Schema After Migration

### Wishes Table (Updated)
```sql
-- User-facing fields
role_id          UUID          -- NEW: Simplified role selection
subcategory_ids  TEXT[]        -- NEW: Multiple subcategories
subcategory_id   TEXT          -- NEW: Single subcategory

-- Backend mapping fields
category_id      INTEGER       -- KEPT: Original wish category (backward compat)
helper_category  TEXT          -- NEW: AI-detected helper category
intent_type      TEXT          -- NEW: AI-detected intent

-- Existing fields unchanged
city_id, area_id, user_id, status, urgency, budget_min, budget_max, etc.
```

### Tasks Table (Updated)
```sql
-- User-facing fields
role_id          UUID          -- NEW: Simplified role selection
subcategory_ids  TEXT[]        -- NEW: Multiple subcategories

-- Backend mapping fields
category_id      INTEGER       -- KEPT: Original task category (backward compat)
subcategory      TEXT          -- KEPT: Legacy subcategory field
helper_category  TEXT          -- NEW: AI-detected helper category
intent_type      TEXT          -- NEW: AI-detected intent

-- Existing fields unchanged
detected_category, city_id, area_id, user_id, status, price, etc.
```

### Notifications Table (Updated)
```sql
-- Routing fields
related_type     TEXT          -- Module: listing/wish/task/professional
related_id       TEXT          -- Item UUID

-- Notification fields
user_id          UUID
title            TEXT
message          TEXT
body             TEXT
type             TEXT          -- Notification type
notification_type TEXT
action_url       TEXT
action_label     TEXT          -- NEW: Action button text
metadata         JSONB         -- NEW: Additional data

-- Status fields
is_read          BOOLEAN
status           TEXT
created_at       TIMESTAMPTZ
sent_at          TIMESTAMPTZ
```

---

## 🔧 Migration Steps

### Step 1: Run the Role Support Migration

```bash
# In Supabase SQL Editor, run:
/FINAL_MIGRATION_WISHES_TASKS_ROLES.sql
```

This will:
- Add `role_id`, `subcategory_id`, `subcategory_ids` to wishes and tasks
- Add `helper_category`, `intent_type` fields for AI categorization
- Create all necessary indexes
- Keep backward compatibility with existing category_id fields

### Step 2: Run the Notifications Migration

```bash
# In Supabase SQL Editor, run:
/FINAL_NOTIFICATIONS_UNIFIED.sql
```

This will:
- Ensure notifications table has all required fields
- Create helper view for enriched notifications
- Create helper functions for unread counts
- Add RLS policies for security
- Create optimized indexes

### Step 3: Verify the Migration

```sql
-- Check wishes table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wishes' 
  AND column_name IN ('role_id', 'subcategory_id', 'subcategory_ids', 'category_id')
ORDER BY column_name;

-- Check tasks table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name IN ('role_id', 'subcategory_ids', 'category_id')
ORDER BY column_name;

-- Check notifications
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
  AND column_name IN ('related_type', 'related_id', 'action_label', 'metadata')
ORDER BY column_name;
```

---

## 📊 How the Role Mapping Works

### Example: User Creates a Wish for an Electrician

1. **User sees**: Simple role picker showing "Electrician ⚡"
2. **User selects services**: 
   - Wiring Installation
   - Switch Repair
   - MCB Installation

3. **Frontend sends to backend**:
```typescript
{
  role_id: "uuid-of-electrician-role",
  subcategory_ids: ["wiring-install", "switch-repair", "mcb-install"]
}
```

4. **Backend maps to categories**:
```sql
-- Query role_subcategories table
SELECT category_id, subcategory_id 
FROM role_subcategories 
WHERE role_id = 'uuid-of-electrician-role'
  AND subcategory_id IN ('wiring-install', 'switch-repair', 'mcb-install')

-- Results:
-- category_id: "home-services", subcategory_id: "wiring-install"
-- category_id: "home-services", subcategory_id: "switch-repair"
-- category_id: "home-services", subcategory_id: "mcb-install"
```

5. **Wish is stored with both**:
```sql
role_id: uuid-of-electrician-role         -- For UI display
subcategory_ids: ["wiring-install", ...]  -- For matching
category_id: 206                          -- Original wish category (backward compat)
```

6. **Professional matching**:
```sql
-- Find professionals who offer these services
SELECT * FROM professionals
WHERE role_id = 'uuid-of-electrician-role'
  AND subcategory_ids && ARRAY['wiring-install', 'switch-repair', 'mcb-install']
  AND city = 'bangalore'
```

---

## 🔔 Notification System Usage

### Creating Notifications for Wishes

```typescript
// When someone offers to fulfill a wish
await supabase.from('notifications').insert({
  user_id: wish.user_id,
  title: 'Someone Can Help! 🎉',
  message: `${helper.name} wants to help with "${wish.title}"`,
  type: 'wish_offer',
  related_type: 'wish',      // ← Routes to Wishes module
  related_id: wish.id,       // ← Links to specific wish
  action_url: `/wishes/${wish.id}`,
  action_label: 'View Offer',
  is_read: false
});
```

### Creating Notifications for Tasks

```typescript
// When someone accepts a task
await supabase.from('notifications').insert({
  user_id: task.user_id,
  title: 'Task Accepted! ✅',
  message: `${helper.name} accepted your task "${task.title}"`,
  type: 'task_accepted',
  related_type: 'task',      // ← Routes to Tasks module
  related_id: task.id,       // ← Links to specific task
  action_url: `/tasks/${task.id}`,
  action_label: 'View Task',
  is_read: false
});
```

### Querying Notifications by Module

```sql
-- Get unread wish notifications
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
  AND related_type = 'wish'
  AND is_read = false
ORDER BY created_at DESC;

-- Get unread count by module using helper function
SELECT * FROM get_unread_notifications_by_module('user-uuid');
-- Returns: [
--   { module: 'wish', unread_count: 3 },
--   { module: 'task', unread_count: 5 },
--   { module: 'listing', unread_count: 2 }
-- ]
```

---

## 🎨 Frontend Integration Points

### 1. Create Wish Screen (needs update)

**Current**: Uses simple category dropdown (201-210)
**After**: Use role picker + service selection (matching professionals)

```typescript
// File: /screens/CreateWishScreen.tsx
import { getRoles } from '../services/roles';
import { getSubcategoriesForRole } from '../services/subcategories';

// Show role picker (Electrician, Plumber, etc.)
const roles = await getRoles();

// When role selected, show services
const services = await getSubcategoriesForRole(selectedRoleId);

// On submit, send both
await createWish({
  title,
  description,
  role_id: selectedRoleId,
  subcategory_ids: selectedServiceIds,
  category_id: 206, // Keep for backward compat (e.g., "Find Help")
  city_id,
  area_id,
  budget_min,
  budget_max
});
```

### 2. Create Task Screen (needs update)

**Current**: Uses category dropdown (301-309)
**After**: Use role picker + service selection (matching professionals)

```typescript
// File: /screens/CreateTaskScreen.tsx
import { getRoles } from '../services/roles';
import { getSubcategoriesForRole } from '../services/subcategories';

// Similar to wishes - show role picker + services
const roles = await getRoles();
const services = await getSubcategoriesForRole(selectedRoleId);

// On submit
await createTask({
  title,
  description,
  role_id: selectedRoleId,
  subcategory_ids: selectedServiceIds,
  category_id: 303, // Keep for backward compat (e.g., "Repairs & Maintenance")
  price,
  time_window
});
```

### 3. Notification Routing (needs update)

```typescript
// File: /services/notifications.ts
function handleNotificationClick(notification: Notification) {
  const { related_type, related_id } = notification;
  
  switch (related_type) {
    case 'wish':
      navigate(`/wishes/${related_id}`);
      break;
    case 'task':
      navigate(`/tasks/${related_id}`);
      break;
    case 'listing':
      navigate(`/listing/${related_id}`);
      break;
    case 'professional':
      navigate(`/professionals/${related_id}`);
      break;
    case 'conversation':
      navigate(`/chat/${related_id}`);
      break;
  }
}
```

---

## 🧪 Testing Checklist

### After Migration

- [ ] Run both SQL migration files successfully
- [ ] Verify wishes table has new columns (role_id, subcategory_ids)
- [ ] Verify tasks table has new columns (role_id, subcategory_ids)
- [ ] Verify notifications table has related_type and related_id
- [ ] Check that existing wishes/tasks still display correctly
- [ ] Check that existing notifications still work

### Frontend Updates Needed

- [ ] Update CreateWishScreen to use role picker (like professionals)
- [ ] Update CreateTaskScreen to use role picker (like professionals)
- [ ] Update wish creation service to send role_id + subcategory_ids
- [ ] Update task creation service to send role_id + subcategory_ids
- [ ] Update notification click handler to route by related_type
- [ ] Test professional matching works with new fields

---

## 🐛 Troubleshooting

### Issue: Foreign key constraint error on role_id

**Solution**: Ensure roles table is populated with data
```sql
SELECT * FROM roles WHERE is_active = true;
-- Should return roles like Electrician, Plumber, etc.
```

### Issue: Notifications not routing correctly

**Solution**: Check related_type values
```sql
SELECT DISTINCT related_type FROM notifications;
-- Should show: listing, wish, task, professional, conversation, system
```

### Issue: Can't find matching professionals

**Solution**: Check role_subcategories mapping
```sql
SELECT r.name, rs.category_id, rs.subcategory_id
FROM role_subcategories rs
JOIN roles r ON r.id = rs.role_id
WHERE r.name = 'Electrician';
-- Should return multiple category/subcategory mappings
```

---

## 📚 Related Files

- `/supabase/migrations/20260322_create_roles_tables.sql` - Creates roles and role_subcategories tables
- `/services/roles.ts` - Role management service
- `/services/subcategories.ts` - Subcategory service
- `/services/wishes.ts` - Wishes service (needs update)
- `/services/tasks.ts` - Tasks service (needs update)
- `/services/notifications.ts` - Notifications service (needs update)
- `/screens/CreateWishScreen.tsx` - Create wish UI (needs update)
- `/screens/CreateTaskScreen.tsx` - Create task UI (needs update)

---

## ✅ Success Criteria

After this migration, you should have:

1. **Unified Role System**: Wishes, Tasks, and Professionals all use the same role picker UI
2. **Service Selection**: All three modules support multiple service selection via subcategory_ids
3. **Backend Mapping**: Roles map to existing 25 categories + subcategories via role_subcategories table
4. **Backward Compatibility**: Existing category_id fields preserved for old data
5. **Unified Notifications**: One notification system works across all modules with proper routing
6. **Professional Matching**: Professionals can be notified about matching wishes and tasks based on their role and services

---

## 🚀 Next Steps

After running these migrations:

1. Update CreateWishScreen to use role picker (copy from RegisterProfessionalScreen)
2. Update CreateTaskScreen to use role picker (copy from RegisterProfessionalScreen)
3. Update wish creation service to send role_id + subcategory_ids
4. Update task creation service to send role_id + subcategory_ids
5. Test notification routing with related_type field
6. Test professional matching with new wish/task role fields

---

**Need Help?** 
Check the schema with:
```sql
\d wishes
\d tasks
\d notifications
\d professionals
\d roles
\d role_subcategories
```
