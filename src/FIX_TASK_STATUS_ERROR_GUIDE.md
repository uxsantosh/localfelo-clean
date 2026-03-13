# Fix: Task Status Update Error

## Problem
When updating task status (especially to `in_progress`), you're getting this error:
```
❌ record "v_helper_profile" is not assigned yet
Code: 55000
```

## Root Cause
There's a database trigger function that tries to access a record variable `v_helper_profile` before it's been initialized. This happens when:
- A helper starts a task (status changes to 'in_progress')
- The notification trigger tries to fetch helper profile data but hasn't assigned it properly

## Solution
Run the SQL script `/FIX_TASK_STATUS_TRIGGER_ERROR.sql` in your Supabase SQL Editor.

### What the fix does:
1. **Removes problematic triggers** - Drops any old/broken task notification triggers
2. **Creates corrected functions** with proper null checking:
   - `trigger_task_acceptance_notification()` - For when task is accepted
   - `notify_task_started()` - For when task starts (in_progress status)
3. **Uses COALESCE** to handle null values safely
4. **Separates triggers** - Each status change has its own trigger to prevent conflicts

### Key improvements:
✅ Proper null checking before accessing profile data
✅ Uses `COALESCE` to provide fallback values
✅ Checks both `accepted_by` and `helper_id` fields
✅ Only creates notifications when we have valid user IDs
✅ Separate triggers for different status changes (cleaner, less error-prone)

## How to Apply

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Fix
1. Copy the entire contents of `/FIX_TASK_STATUS_TRIGGER_ERROR.sql`
2. Paste into the SQL Editor
3. Click "Run" or press Cmd/Ctrl + Enter

### Step 3: Verify
The script includes verification queries at the end. You should see:
- 2 triggers listed: `task_acceptance_notification_trigger` and `task_started_notification_trigger`
- 2 functions listed: `trigger_task_acceptance_notification` and `notify_task_started`

## Test
After running the fix, try these actions in your app:
1. ✅ Helper accepts a task (status: open → accepted)
2. ✅ Helper starts a task (status: accepted → in_progress)
3. ✅ Creator marks task complete
4. ✅ Helper confirms completion

All status updates should work without errors!

## What Changed
**Before:** Single trigger tried to handle all status changes and had uninitialized variables
**After:** Separate triggers for each status with proper null safety and fallback values
