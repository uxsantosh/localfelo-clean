# Debug Steps: Row Not Inserted

## Current Status
- ✅ Session verification added
- ❌ Row still not being inserted into device_tokens

## Step 1: Run Diagnostic Queries

1. Open Supabase SQL Editor
2. Run queries from `/DIAGNOSE_DEVICE_TOKENS.sql`
3. Copy ALL output and provide it

**Critical information needed:**
- [ ] Table schema (column names, types, nullable)
- [ ] UNIQUE constraints (especially on device_token)
- [ ] RLS policies (INSERT and UPDATE)
- [ ] Is RLS enabled?

---

## Step 2: Check Android Console Logs

Build and run the Android app, then filter logs for `usePushNotifications`:

```bash
adb logcat | grep "usePushNotifications"
```

**Look for these specific logs:**

### ✅ Success Path:
```
[usePushNotifications] Storing push token in database
[usePushNotifications] ✅ Session verified, auth.uid() is set
[usePushNotifications] ✅ Token stored in device_tokens table: { platform: 'android', rowId: '...', isEnabled: true }
```

### ❌ Failure Paths:

**No session:**
```
[usePushNotifications] No active Supabase session: <error>
```

**Session mismatch:**
```
[usePushNotifications] Session user mismatch: { sessionUserId: '...', providedUserId: '...' }
```

**Database error:**
```
[usePushNotifications] Database error: {
  message: '...',
  details: '...',
  hint: '...',
  code: '...'
}
```

**No data returned:**
```
[usePushNotifications] No data returned from upsert - row may not have been inserted/updated
```

---

## Step 3: Identify the Exact Failure Point

Based on logs, determine which case applies:

### Case A: No Session Error
**Log:** `No active Supabase session`

**Cause:** Supabase session still not loaded

**Next step:** Check if `supabase.auth.onAuthStateChange` is firing

---

### Case B: Session Mismatch
**Log:** `Session user mismatch`

**Cause:** React state userId ≠ Supabase session userId

**Next step:** Check localStorage vs Supabase auth state

---

### Case C: Database Error with Details
**Log:** `Database error: { message: '...', details: '...', ... }`

**Cause:** RLS policy, constraint, or schema issue

**Next step:** Provide the FULL error object

**Common errors:**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `new row violates row level security policy` | RLS policy failing | Check if UPDATE policy exists |
| `duplicate key value violates unique constraint` | Token already exists | Expected (upsert should handle) |
| `null value in column violates not-null constraint` | Missing required column | Add missing column to insert |
| `column "..." does not exist` | Wrong column name | Fix column name in code |

---

### Case D: No Error, But No Data Returned
**Log:** `No data returned from upsert`

**Cause:** Silent failure - row not inserted, no error thrown

**Possible reasons:**
1. RLS policy blocks SELECT (can't return data)
2. Upsert with onConflict behaving unexpectedly
3. Wrong table name (no error because RLS blocks even seeing the table)

**Next step:** Check if SELECT policy exists

---

## Step 4: Common Fixes Based on Diagnosis

### Fix 1: Missing UPDATE Policy
If error is still RLS-related, the issue might be:
- INSERT policy exists ✅
- UPDATE policy missing ❌
- Upsert triggers UPDATE path when token exists → RLS blocks

**Solution:** Add UPDATE policy:
```sql
CREATE POLICY "Users can update own tokens"
  ON device_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### Fix 2: Missing SELECT Policy
If no data returned but no error:

**Solution:** Add SELECT policy:
```sql
CREATE POLICY "Users can read own tokens"
  ON device_tokens
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

### Fix 3: Wrong onConflict Column
If UNIQUE constraint is not on `device_token`:

**Check schema:** Query 3 in DIAGNOSE_DEVICE_TOKENS.sql

**If constraint is on different column:**
```typescript
// Change this:
onConflict: 'device_token'

// To whatever column has UNIQUE constraint:
onConflict: 'id'  // or
onConflict: 'user_id,platform'  // composite
```

---

### Fix 4: Missing NOT NULL Columns
If error mentions "null value in column":

**Check schema:** Query 1 in DIAGNOSE_DEVICE_TOKENS.sql

**Look for columns where:**
- `is_nullable = 'NO'`
- Column not in our insert object

**Add missing columns to insert:**
```typescript
{
  user_id: userId,
  device_token: token,
  platform: platform,
  // Add any other NOT NULL columns here
}
```

---

## Step 5: Provide Debug Output

Please provide:

1. **Full console log output** from Android (especially the error object)
2. **Results from SQL queries** in DIAGNOSE_DEVICE_TOKENS.sql
3. **Current behavior:**
   - Does session verification pass?
   - What specific error appears (if any)?
   - Does "No data returned" log appear?

---

## Quick Test: Bypass RLS Temporarily

**WARNING:** Only for debugging, revert immediately after

```sql
-- In Supabase SQL Editor:
ALTER TABLE device_tokens DISABLE ROW LEVEL SECURITY;

-- Try insert from app
-- Check if row appears in table

-- IMMEDIATELY re-enable:
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
```

**If this works:**
- Confirms RLS is the issue
- Check which policy is missing (INSERT vs UPDATE vs SELECT)

**If this doesn't work:**
- RLS is NOT the issue
- Check constraints, column names, data types

---

## Expected Fix

Most likely causes (in order of probability):

1. **Missing UPDATE policy** (70% chance)
   - Upsert uses UPDATE when token exists
   - No UPDATE policy → RLS blocks

2. **Missing SELECT policy** (20% chance)
   - `.select()` can't return data
   - Silent failure

3. **Wrong onConflict column** (5% chance)
   - Column name doesn't match UNIQUE constraint

4. **Schema mismatch** (5% chance)
   - Column names wrong
   - Missing NOT NULL columns

---

## Next Steps

1. Run DIAGNOSE_DEVICE_TOKENS.sql
2. Provide complete output
3. Run Android app and copy FULL console error
4. I'll provide exact fix based on actual error
