# 🔧 Fix: Ratings RLS Error

## Error Message
```
Failed to submit rating: {
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy for table \"ratings\""
}
```

## Root Cause
The `ratings` table has **Row Level Security (RLS)** enabled, but the RLS policies are either:
- ❌ Missing
- ❌ Incorrectly configured
- ❌ Have type mismatches (UUID vs TEXT)
- ❌ Missing table grants

## Quick Fix (3 Steps)

### Step 1: Diagnose the Issue
1. Open **Supabase Dashboard** → **SQL Editor**
2. Run `/DIAGNOSE_RATINGS_ISSUE.sql`
3. Review the output to see what's wrong

### Step 2: Apply the Fix
1. Open **Supabase Dashboard** → **SQL Editor**
2. Run `/FIX_RATINGS_COMPLETE.sql`
3. Wait for "Success" message

### Step 3: Verify
1. Check the verification output shows:
   - ✅ RLS enabled = `true`
   - ✅ 4 policies created
   - ✅ Current user authenticated (shows UUID)
2. Go back to your app
3. Complete a task and submit a rating
4. Should work without errors! 🎉

## Files Included

### 1. `/DIAGNOSE_RATINGS_ISSUE.sql`
- **What it does:** Runs diagnostics to identify the exact problem
- **When to use:** Run this FIRST to understand what's broken
- **Output:** Shows table structure, policies, permissions, and test results

### 2. `/FIX_RATINGS_COMPLETE.sql`
- **What it does:** Fixes ALL possible RLS issues
- **When to use:** Run this after diagnosis (or directly if you're confident)
- **What it fixes:**
  - ✅ Drops old/broken policies
  - ✅ Creates 4 new policies (SELECT, INSERT, UPDATE, DELETE)
  - ✅ Grants proper permissions to `authenticated` role
  - ✅ Adds verification queries

### 3. `/FIX_RATINGS_RLS.sql` (Alternative)
- **What it does:** Simpler fix with type casting
- **When to use:** If the complete fix seems too aggressive
- **Difference:** Uses explicit type casting (UUID::TEXT)

## What the Fix Does

### Policies Created

1. **SELECT Policy** (`ratings_select_policy`)
   - **Who:** Everyone (authenticated + anonymous)
   - **What:** Can view all ratings
   - **Why:** Ratings are public information

2. **INSERT Policy** (`ratings_insert_policy`)
   - **Who:** Authenticated users only
   - **What:** Can insert ratings where they are the rater
   - **Check:** `auth.uid() = rater_user_id`

3. **UPDATE Policy** (`ratings_update_policy`)
   - **Who:** No one
   - **What:** Cannot update ratings
   - **Why:** Ratings are immutable once created

4. **DELETE Policy** (`ratings_delete_policy`)
   - **Who:** Rating creator only
   - **What:** Can delete own ratings within 24 hours
   - **Why:** Allow corrections for mistakes

### Permissions Granted
```sql
GRANT ALL ON ratings TO authenticated;
GRANT ALL ON ratings TO anon;
GRANT ALL ON ratings TO service_role;
```

## Testing After Fix

### Test 1: Submit a Rating
1. Complete a task in the app
2. Click "Rate Helper" or "Rate Task Owner"
3. Select stars and add comment
4. Click "Submit Rating"
5. Should show: "Rating submitted successfully!" ✅

### Test 2: Verify in Database
```sql
SELECT * FROM ratings ORDER BY created_at DESC LIMIT 5;
```
Should show your newly submitted ratings.

### Test 3: Check Policies Work
```sql
-- This should return 4 rows
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'ratings';
```

## Troubleshooting

### Still Getting RLS Error?

**Problem:** `auth.uid()` might be NULL

**Check:**
```sql
SELECT auth.uid();
```

**If NULL:** You're not properly authenticated
- Log out and log back in
- Clear browser cache
- Check Supabase Auth settings

---

**Problem:** User ID mismatch

**Check:**
```sql
-- See what you're trying to insert
-- Add this to your app code temporarily:
console.log('Rater ID:', raterUserId);
console.log('Auth UID:', supabase.auth.getUser());
```

**Fix:** Make sure `raterUserId` matches the logged-in user's ID

---

**Problem:** Policies not loading

**Check:**
```sql
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'ratings';
```

**If 0:** Policies didn't create
- Run `/FIX_RATINGS_COMPLETE.sql` again
- Check for error messages in SQL Editor

---

### Nuclear Option (Last Resort)

If nothing works, temporarily disable RLS for testing:

```sql
-- DANGER: Only for testing!
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
```

Try submitting a rating. If it works, the problem is definitely in the policies.

Then re-enable:
```sql
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
```

And run `/FIX_RATINGS_COMPLETE.sql` again.

## How Ratings Work

### User Flow
1. **Task completed** → Status = "completed"
2. **Both parties can rate:**
   - Task owner rates helper (rating_type: "helper")
   - Helper rates task owner (rating_type: "task_owner")
3. **Rating submitted** → Inserted into `ratings` table
4. **Averages calculated** → Updated in `profiles` table
   - `helper_rating_avg` / `helper_rating_count`
   - `task_owner_rating_avg` / `task_owner_rating_count`

### Database Schema
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL,           -- Which task
  rated_user_id UUID NOT NULL,     -- Who is being rated
  rater_user_id UUID NOT NULL,     -- Who is giving the rating
  rating_type TEXT NOT NULL,       -- 'helper' or 'task_owner'
  rating INTEGER NOT NULL,         -- 1-5 stars
  comment TEXT,                    -- Optional feedback
  created_at TIMESTAMPTZ,
  UNIQUE(task_id, rated_user_id, rater_user_id, rating_type)
);
```

### RLS Logic
- **SELECT:** Anyone can view ratings (public)
- **INSERT:** Only if you're the rater (`auth.uid() = rater_user_id`)
- **UPDATE:** Never (immutable)
- **DELETE:** Only your own ratings, within 24 hours

## Expected Outcome

After running the fix:

✅ Users can submit ratings without RLS errors
✅ Ratings appear in the database
✅ Profile averages update correctly
✅ Users can see ratings on profiles
✅ Duplicate ratings are prevented (UNIQUE constraint)

## Additional Resources

- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **RLS Policy Examples:** https://supabase.com/docs/guides/database/postgres/row-level-security
- **Auth UID in Policies:** https://supabase.com/docs/guides/auth/managing-user-data

## Need More Help?

If you're still stuck:

1. Run `/DIAGNOSE_RATINGS_ISSUE.sql` and share the output
2. Check browser console for detailed error messages
3. Verify you're logged in (`auth.uid()` returns UUID)
4. Check that the `ratings` table exists
5. Make sure you ran the migration: `/database_migrations/avatar_and_rating_system.sql`
