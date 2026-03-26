# 🔧 Cities Migration Troubleshooting Guide

## Common Errors & Solutions

### ❌ Error: "relation 'cities' does not exist"

**Cause:** The `cities` table hasn't been created yet.

**Solution:**
1. Make sure you're running the **COMPLETE** SQL script from `/supabase-seed-cities-areas.sql`
2. The script now includes `CREATE TABLE IF NOT EXISTS` statements at the top
3. Copy the **entire file** (not just part of it) and run it in Supabase SQL Editor

---

### ❌ Error: "relation 'areas' does not exist"

**Cause:** Same as above - the `areas` table hasn't been created yet.

**Solution:**
1. Run the complete SQL script which includes table creation
2. The script is safe to run multiple times

---

### ❌ Error: "column areas.city_name does not exist"

**Cause:** Old version of the SQL script using incorrect column names.

**Solution:**
✅ **FIXED!** The current SQL script uses the correct schema:
- `cities` table: `id`, `name`, `created_at`
- `areas` table: `id`, `city_id`, `name`, `created_at`

If you still see this error:
1. Check you're using the latest `/supabase-seed-cities-areas.sql`
2. The file should have `CREATE TABLE` statements at the top
3. Re-copy and re-run the script

---

### ❌ No cities showing in the app

**Possible Causes:**
1. SQL script hasn't been run yet
2. Supabase connection issue
3. Browser cache

**Solutions:**

**Step 1: Verify data in Supabase**
```sql
-- Run this in Supabase SQL Editor to check:
SELECT COUNT(*) FROM cities;
SELECT COUNT(*) FROM areas;
```
- Should return 23 cities and 400+ areas
- If 0, run the seed script again

**Step 2: Check browser console**
1. Open browser DevTools (F12)
2. Look for console messages:
   - Should see: `🌆 Loading cities from Supabase...`
   - Should see: `✅ Loaded 23 cities with XXX areas`
   - If you see errors, check Supabase credentials

**Step 3: Verify Supabase connection**
1. Check `/lib/supabaseClient.ts` has correct credentials
2. Make sure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

**Step 4: Clear cache and refresh**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Or clear browser cache completely

---

### ❌ Duplicate key errors when running script

**Cause:** Data already exists in the database.

**Solution:**
This is normal! The script uses `ON CONFLICT DO UPDATE` which safely updates existing data.

If you want to completely reset:
1. Uncomment these lines in the SQL script:
   ```sql
   TRUNCATE TABLE areas CASCADE;
   TRUNCATE TABLE cities CASCADE;
   ```
2. Run the script again

---

### ❌ Foreign key constraint errors

**Cause:** Trying to insert areas before cities exist.

**Solution:**
✅ The script is already ordered correctly:
1. First creates tables
2. Then inserts cities
3. Then inserts areas

Just run the complete script in order.

---

### ❌ Performance issues / Slow loading

**Cause:** Loading 400+ areas can take a moment on first load.

**Expected Behavior:**
- First load: ~1-2 seconds to fetch all data
- After first load: Instant (data cached in React state)

**If still slow:**
1. Check your internet connection
2. Check Supabase project region (use closest to your location)
3. Data is only fetched once per app session

---

## Verification Checklist

Run these checks to make sure everything is working:

### ✅ Database Check (Supabase SQL Editor)

```sql
-- Should return 23
SELECT COUNT(*) FROM cities;

-- Should return 400+
SELECT COUNT(*) FROM areas;

-- Should show cities with their area counts
SELECT 
  c.name as city,
  COUNT(a.id) as area_count
FROM cities c
LEFT JOIN areas a ON c.id = a.city_id
GROUP BY c.id, c.name
ORDER BY area_count DESC;
```

### ✅ App Check (Browser)

1. **Console Messages:**
   - `🌆 Loading cities from Supabase...`
   - `✅ Loaded 23 cities with XXX areas from Supabase`

2. **Location Selector:**
   - Click location icon in header
   - Should see all 23 cities
   - Selecting a city should show its areas

3. **Create Listing:**
   - Go to Create Listing
   - City dropdown should have 23+ cities
   - Selecting a city should populate area dropdown

4. **Filtering:**
   - On home screen, filter by city
   - Should work correctly

---

## Still Having Issues?

### Check the logs:

**Browser Console (F12):**
```
Look for red errors related to:
- Supabase
- Cities
- Areas
- Database queries
```

**Supabase Dashboard:**
1. Go to Database → Logs
2. Check for query errors
3. Verify tables exist in Table Editor

### Manual verification:

**Check table structure:**
```sql
-- Run in Supabase SQL Editor
\d cities
\d areas
```

Should show:
- `cities`: id (text), name (text), created_at (timestamp)
- `areas`: id (text), city_id (text), name (text), created_at (timestamp)

---

## Need to Start Fresh?

If you want to completely reset and start over:

```sql
-- ⚠️ WARNING: This deletes ALL city and area data!
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- Then run the complete seed script again
```

---

## Success Indicators

You'll know everything is working when:

1. ✅ SQL script runs without errors
2. ✅ Supabase shows 23 cities and 400+ areas in Table Editor
3. ✅ Browser console shows successful city load message
4. ✅ Location selector shows all cities
5. ✅ Create listing has populated dropdowns
6. ✅ Filtering by city/area works on home screen

---

**Questions?** Check the code in:
- `/services/locations.ts` - Data fetching logic
- `/App.tsx` - How cities are loaded on mount
- `/supabase-seed-cities-areas.sql` - The complete SQL script
