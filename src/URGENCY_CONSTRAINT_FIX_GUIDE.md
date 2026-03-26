# 🔧 Fix: Wishes Urgency Constraint Error

## 🐛 Problem
When creating a wish, you're getting this error:
```
new row for relation "wishes" violates check constraint "wishes_urgency_check"
```

## 🎯 Root Cause
The database `wishes` table has a CHECK constraint on the `urgency` column, but it may not be properly configured or the migration wasn't applied correctly.

## ✅ Solution

### Step 1: Run SQL Fix in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run the SQL file: **`FIX_WISHES_URGENCY_CONSTRAINT.sql`**

This will:
- ✅ Drop any incorrect constraint
- ✅ Add the urgency column if missing
- ✅ Create the correct constraint: `urgency IN ('asap', 'today', 'flexible')`
- ✅ Set default values for existing NULL rows
- ✅ Verify the constraint is working

### Step 2: Code Updates (Already Done ✅)

The following files have been updated to fix the issue:

#### 1. **`/types/index.ts`** ✅
- Added `exactLocation?: string;` to `CreateWishData` interface
- Added `exactLocation?: string;` to `Wish` interface

These were missing fields that could cause issues with wish creation.

## 📋 What Was Fixed

### Database Schema
```sql
ALTER TABLE wishes 
ADD CONSTRAINT wishes_urgency_check 
CHECK (urgency IN ('asap', 'today', 'flexible'));
```

### TypeScript Types
```typescript
export interface CreateWishData {
  // ... existing fields
  urgency: 'asap' | 'today' | 'flexible';
  exactLocation?: string; // ✅ ADDED
}

export interface Wish {
  // ... existing fields
  urgency: 'asap' | 'today' | 'flexible';
  exactLocation?: string; // ✅ ADDED
}
```

## 🧪 Testing

After running the SQL fix, test wish creation:

1. Go to **"Post Wish"** screen
2. Fill in the form:
   - What you're looking for: "Looking for a laptop under 10k"
   - Urgency: Select any option (Flexible/Today/ASAP)
   - Budget: 10000
   - Location: Select city and area
3. Click **"Post Wish & Start Chat"**

Expected result: ✅ Wish should be created successfully!

## 🔍 Verify Database Constraint

To verify the constraint is correctly applied, run this in Supabase SQL Editor:

```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'wishes_urgency_check';
```

Expected output:
```
constraint_name: wishes_urgency_check
constraint_definition: CHECK ((urgency = ANY (ARRAY['asap'::text, 'today'::text, 'flexible'::text])))
```

## 📝 Summary

**Files Created:**
1. ✅ `/FIX_WISHES_URGENCY_CONSTRAINT.sql` - SQL fix to run in Supabase

**Files Updated:**
1. ✅ `/types/index.ts` - Added `exactLocation` to wish interfaces

**Action Required:**
1. 🎯 **Run the SQL file** in Supabase SQL Editor
2. ✅ Test wish creation

After running the SQL, the wish creation error should be completely resolved! 🎉
