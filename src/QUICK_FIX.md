# ⚡ QUICK FIX - Task Creation Error

## The Problem
❌ **Error when creating task:** "violates foreign key constraint tasks_category_id_fkey"

## The Solution (3 Steps)

### Step 1: Run This SQL in Supabase
Open Supabase Dashboard → SQL Editor → Run this:

```sql
INSERT INTO categories (id, name, slug, emoji, type, sort_order) VALUES
('301', 'Delivery / Pickup', 'delivery-pickup', '📦', 'task', 1),
('302', 'Moving / Lifting', 'moving-lifting', '🏋️', 'task', 2),
('303', 'Repairs & Maintenance', 'repairs-maintenance', '🔧', 'task', 3),
('304', 'Cleaning', 'cleaning', '🧹', 'task', 4),
('305', 'Tech Help', 'tech-help', '💻', 'task', 5),
('306', 'Cooking', 'cooking', '🍳', 'task', 6),
('307', 'Office Errands', 'office-errands', '📋', 'task', 7),
('308', 'Personal Help', 'personal-help', '🤝', 'task', 8),
('309', 'Other Task', 'task-other', '📌', 'task', 9)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  slug = EXCLUDED.slug,
  type = EXCLUDED.type,
  sort_order = EXCLUDED.sort_order;
```

### Step 2: Verify It Worked
Run this SQL to verify:

```sql
SELECT id, name, emoji, type FROM categories WHERE type = 'task' ORDER BY id;
```

You should see 9 task categories (301-309).

### Step 3: Test Task Creation
1. Refresh your app
2. Go to Tasks → Post Task
3. Fill in details and submit
4. ✅ Should work!

---

## What Was Fixed?

1. ✅ **CreateTaskScreen.tsx** - Changed categoryId from `1` → `309`
2. ✅ **tasks.ts** - Added String() conversion for database compatibility
3. ✅ **Database** - Migration adds all task categories (301-309)

---

## Done! 🎉

Tasks should now create successfully. All tasks use category **309 (Other Task)** by default.
