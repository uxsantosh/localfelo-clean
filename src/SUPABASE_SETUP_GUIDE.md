# 🚀 Supabase Setup Guide - Task Completion System

## Quick Setup Steps

### Step 1: Add Database Columns (REQUIRED)

Open **Supabase Dashboard** → Your Project → **SQL Editor** → **New Query**

Paste and run this:

```sql
-- Add completion tracking fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creator_completed BOOLEAN DEFAULT false;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS helper_completed BOOLEAN DEFAULT false;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add helpful comments
COMMENT ON COLUMN tasks.creator_completed IS 'Task creator confirmed completion';
COMMENT ON COLUMN tasks.helper_completed IS 'Helper confirmed completion';
COMMENT ON COLUMN tasks.updated_at IS 'Last update timestamp';

-- Create auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at_trigger ON tasks;
CREATE TRIGGER tasks_updated_at_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_updated_at();
```

✅ Click **Run** button

---

### Step 2: Update RLS Policies (REQUIRED)

Still in SQL Editor, run this:

```sql
-- Drop policy if it exists, then create new one
DROP POLICY IF EXISTS "Participants can update completion status" ON tasks;
DROP POLICY IF EXISTS "Users can read task completion status" ON tasks;

-- Allow users to read completion status
CREATE POLICY "Users can read task completion status"
ON tasks
FOR SELECT
USING (true);

-- Allow task participants to update completion status
CREATE POLICY "Participants can update completion status"
ON tasks
FOR UPDATE
USING (
  auth.uid() = user_id OR auth.uid() = helper_id
)
WITH CHECK (
  auth.uid() = user_id OR auth.uid() = helper_id
);
```

✅ Click **Run** button

---

### Step 3: Add Notification Fields (OPTIONAL but RECOMMENDED)

If you have a `notifications` table, add these fields:

```sql
-- Add action URL and label for notification buttons
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS action_url TEXT;

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS action_label TEXT;

COMMENT ON COLUMN notifications.action_url IS 'Deep link URL for notification action';
COMMENT ON COLUMN notifications.action_label IS 'Text for action button';
```

✅ Click **Run** button

---

### Step 4: Verify Setup

Run this query to verify the new columns exist:

```sql
-- Check tasks table structure
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN ('creator_completed', 'helper_completed', 'updated_at');
```

You should see 3 rows returned.

---

## Testing the System

### Test 1: Create Completion Confirmation

```sql
-- Simulate helper marking task complete
UPDATE tasks
SET helper_completed = true
WHERE id = 'your-task-id-here';

-- Check status
SELECT 
  id,
  title,
  status,
  creator_completed,
  helper_completed,
  updated_at
FROM tasks
WHERE id = 'your-task-id-here';
```

Expected: `helper_completed = true`, `status` still 'in_progress'

### Test 2: Complete Task (Both Confirm)

```sql
-- Simulate creator also marking complete
UPDATE tasks
SET 
  creator_completed = true,
  status = 'completed',
  completed_at = NOW()
WHERE id = 'your-task-id-here'
AND helper_completed = true;

-- Check final status
SELECT 
  id,
  title,
  status,
  creator_completed,
  helper_completed,
  completed_at
FROM tasks
WHERE id = 'your-task-id-here';
```

Expected: Both `true`, `status = 'completed'`, `completed_at` set

### Test 3: Undo Completion

```sql
-- Undo helper's completion (before both confirmed)
UPDATE tasks
SET helper_completed = false
WHERE id = 'your-task-id-here'
AND status != 'completed';

-- Verify
SELECT creator_completed, helper_completed, status
FROM tasks
WHERE id = 'your-task-id-here';
```

Expected: `helper_completed = false`, still 'in_progress'

---

## Notification Setup (OPTIONAL)

### Option A: Using Supabase Realtime (Simple)

Already supported! The app listens to database changes:

```typescript
// No additional setup needed - uses existing Supabase Realtime
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, payload => {
    // Show notification to user
    showNotification(payload.new);
  })
  .subscribe();
```

### Option B: Push Notifications (Advanced)

For mobile push notifications, you'll need:

1. **Store Push Tokens** - Add field to profiles:
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS push_token TEXT;
```

2. **Create Edge Function** - See `/supabase/functions/send-push/`

3. **Configure FCM/APNs** - Add credentials to Supabase Edge Functions

---

## Rollback (If Needed)

If you need to remove the changes:

```sql
-- Remove columns
ALTER TABLE tasks
DROP COLUMN IF EXISTS creator_completed;

ALTER TABLE tasks
DROP COLUMN IF EXISTS helper_completed;

ALTER TABLE tasks
DROP COLUMN IF EXISTS updated_at;

-- Remove trigger
DROP TRIGGER IF EXISTS tasks_updated_at_trigger ON tasks;
DROP FUNCTION IF EXISTS update_tasks_updated_at();
```

---

## Common Issues & Solutions

### Issue 1: "Column already exists"

**Solution:** Ignore the error or use `IF NOT EXISTS` (already in scripts above)

### Issue 2: "Permission denied"

**Solution:** Make sure you're logged in as admin/owner in Supabase dashboard

### Issue 3: "RLS policy conflicts"

**Solution:** Check existing policies with:
```sql
SELECT * FROM pg_policies WHERE tablename = 'tasks';
```

Drop conflicting policies and recreate

### Issue 4: "Trigger not firing"

**Solution:** Verify trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'tasks_updated_at_trigger';
```

Recreate if missing

---

## Data Migration (If Tasks Already Exist)

If you have existing tasks, initialize the new fields:

```sql
-- Set all existing tasks to false for completion flags
UPDATE tasks
SET 
  creator_completed = false,
  helper_completed = false,
  updated_at = COALESCE(updated_at, created_at)
WHERE creator_completed IS NULL
   OR helper_completed IS NULL;
```

For completed tasks, mark both as confirmed:

```sql
-- For tasks already completed, mark both parties as confirmed
UPDATE tasks
SET 
  creator_completed = true,
  helper_completed = true
WHERE status = 'completed'
  AND completed_at IS NOT NULL;
```

---

## Verification Checklist

Before going live, verify:

- [ ] New columns exist in `tasks` table
- [ ] Default values are set correctly (false)
- [ ] RLS policies allow updates for participants
- [ ] Trigger updates `updated_at` on every change
- [ ] Notifications table has action fields (if using)
- [ ] Test completion flow works end-to-end
- [ ] Test undo flow works correctly
- [ ] Test error cases (undo after both confirm)

---

## Production Monitoring

### Useful Queries

**See pending confirmations:**
```sql
SELECT 
  id,
  title,
  user_id,
  helper_id,
  creator_completed,
  helper_completed,
  status,
  updated_at
FROM tasks
WHERE status IN ('accepted', 'in_progress')
  AND (creator_completed = true OR helper_completed = true)
  AND NOT (creator_completed = true AND helper_completed = true)
ORDER BY updated_at DESC;
```

**See completed tasks today:**
```sql
SELECT 
  id,
  title,
  completed_at,
  creator_completed,
  helper_completed
FROM tasks
WHERE status = 'completed'
  AND completed_at >= CURRENT_DATE
ORDER BY completed_at DESC;
```

**See stalled completions (waiting >24h):**
```sql
SELECT 
  id,
  title,
  user_id,
  helper_id,
  creator_completed,
  helper_completed,
  updated_at,
  NOW() - updated_at AS pending_duration
FROM tasks
WHERE status IN ('accepted', 'in_progress')
  AND (creator_completed = true OR helper_completed = true)
  AND NOT (creator_completed = true AND helper_completed = true)
  AND updated_at < NOW() - INTERVAL '24 hours'
ORDER BY updated_at ASC;
```

---

## ✅ Setup Complete!

Once you've run all the SQL commands above, the system is ready to use. The app code is already implemented and will work automatically with the new database fields.

**Next Steps:**
1. Run the SQL migrations (Step 1 & 2 above) ✅
2. Test with a sample task ✅
3. Deploy to production ✅

That's it! The two-party completion system is now active.