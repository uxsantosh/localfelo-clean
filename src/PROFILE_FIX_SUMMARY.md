# 🔧 Profile Listing Fix - Summary

## Problem Fixed
Users couldn't see their listings after logout and re-login because profile queries weren't consistent.

## Root Cause
When fetching profiles from the database, if there were multiple profiles with the same phone number or client_token, the queries would return inconsistent results between:
- Login (getting client_token)
- Creating listings (getting owner_token)
- Viewing profile (getting owner_token to fetch listings)

## Solution Applied
Added `.order('created_at', { ascending: true }).limit(1)` to ALL profile queries to ensure we ALWAYS get the oldest (first) profile.

## Files Changed

### 1. `/services/auth.ts` (Line 44-45)
**Already fixed in previous session**
```typescript
.order('created_at', { ascending: true })
.limit(1); // Always get only the OLDEST profile
```

### 2. `/services/listings.js` (3 locations)

#### Location 1: `getMyListings()` function (Line ~320-327)
```javascript
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('owner_token')
  .eq('client_token', clientToken)
  .order('created_at', { ascending: true })  // ✅ NEW
  .limit(1)                                   // ✅ NEW
  .single();
```

#### Location 2: `createListing()` function (Line ~195-203)
```javascript
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('owner_token, name, phone')
  .eq('client_token', clientToken)
  .order('created_at', { ascending: true })  // ✅ NEW
  .limit(1)                                   // ✅ NEW
  .single();
```

#### Location 3: `deleteListing()` function (Line ~401-408)
```javascript
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('owner_token')
  .eq('client_token', clientToken)
  .order('created_at', { ascending: true })  // ✅ NEW
  .limit(1)                                   // ✅ NEW
  .single();
```

## How It Works Now

### Login Flow:
1. User enters phone: `+91 9876543210`
2. Query finds profile(s) with that phone
3. **Gets OLDEST profile** (first one created)
4. Returns `client_token` from that profile
5. Saves to localStorage

### Create Listing Flow:
1. Get `client_token` from localStorage
2. Query profiles table by `client_token`
3. **Gets OLDEST profile** (same one as login!)
4. Use `owner_token` from that profile
5. Create listing with that `owner_token`

### View Profile Flow:
1. Get `client_token` from localStorage
2. Query profiles table by `client_token`
3. **Gets OLDEST profile** (same one again!)
4. Use `owner_token` to fetch listings
5. ✅ Shows all listings!

## Testing Instructions

1. **Clear old data** (if you have duplicate profiles):
   - Go to Supabase Dashboard → Table Editor → `profiles`
   - For each phone number with duplicates, delete newer profiles (keep oldest)

2. **Test the fix**:
   ```
   Step 1: Login with phone number
   Step 2: Create 2-3 listings
   Step 3: Check Profile → See listings ✅
   Step 4: Logout
   Step 5: Login with SAME phone number
   Step 6: Check Profile → Still see listings! ✅
   ```

3. **Debug if needed**:
   - Open browser console (F12)
   - Check for logs starting with 🔍, 📞, ✅, ❌
   - Should see: "Got owner_token from profile"
   - Should see: "Found X listing(s)"

## Why This Fix Works

**Before Fix:**
- Login query: Get profile by phone → might get profile #2
- Create listing: Get profile by client_token → uses profile #2's owner_token
- Logout & Login again: Get profile by phone → might get profile #1 (different!)
- View profile: Get profile by client_token → uses profile #1's owner_token
- **Result:** Listings created with profile #2's owner_token, but viewing with profile #1's owner_token = NO LISTINGS SHOWN ❌

**After Fix:**
- Login query: Get OLDEST profile by phone → always profile #1
- Create listing: Get OLDEST profile by client_token → always profile #1
- View profile: Get OLDEST profile by client_token → always profile #1
- **Result:** Everything uses profile #1's owner_token = LISTINGS SHOW UP ✅

## Prevention

To prevent duplicate profiles in the future, you should add a UNIQUE constraint to the `profiles` table:

```sql
-- In Supabase SQL Editor:
ALTER TABLE profiles ADD CONSTRAINT unique_phone UNIQUE (phone);
ALTER TABLE profiles ADD CONSTRAINT unique_client_token UNIQUE (client_token);
```

This will ensure only ONE profile per phone number and ONE profile per client_token.
