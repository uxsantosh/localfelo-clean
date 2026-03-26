# 🔧 FIX: Database Status Constraint Errors

## ❌ **ERROR FIXED**

### **Problem:**
```
Failed to delete wish/task: {
  "code": "23514",
  "message": "new row for relation violates check constraint"
}
```

### **Root Cause:**
The database has CHECK constraints on the `wishes` and `tasks` tables that **DO NOT allow** `status = 'deleted'`. 

The services were trying to set `status = 'deleted'` during soft delete operations, which violated these constraints.

---

## 📋 **Database Constraints**

### **TASKS Table Status Constraint:**
```sql
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('open', 'negotiating', 'accepted', 'in_progress', 'completed', 'cancelled', 'closed'));
```

**Allowed status values:**
- ✅ `'open'`
- ✅ `'negotiating'`
- ✅ `'accepted'`
- ✅ `'in_progress'`
- ✅ `'completed'`
- ✅ `'cancelled'`
- ✅ `'closed'`
- ❌ `'deleted'` ← **NOT ALLOWED**

---

### **WISHES Table Status Constraint:**
```sql
ALTER TABLE wishes ADD CONSTRAINT wishes_status_check 
  CHECK (status IN ('open', 'negotiating', 'accepted', 'in_progress', 'completed', 'fulfilled', 'expired', 'cancelled'));
```

**Allowed status values:**
- ✅ `'open'`
- ✅ `'negotiating'`
- ✅ `'accepted'`
- ✅ `'in_progress'`
- ✅ `'completed'`
- ✅ `'fulfilled'`
- ✅ `'expired'`
- ✅ `'cancelled'`
- ❌ `'deleted'` ← **NOT ALLOWED**

---

## ✅ **FIXES APPLIED**

### **1. Wishes Service (`/services/wishes.ts`)**

**BEFORE (BROKEN):**
```javascript
export async function deleteWish(wishId: string) {
  const { error } = await supabase
    .from('wishes')
    .update({ 
      status: 'deleted',  // ❌ NOT ALLOWED by constraint
      is_hidden: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', wishId)
    .eq('owner_token', ownerToken);
}
```

**AFTER (FIXED):**
```javascript
export async function deleteWish(wishId: string) {
  const { error } = await supabase
    .from('wishes')
    .update({ 
      status: 'cancelled',  // ✅ ALLOWED by constraint
      is_hidden: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', wishId)
    .eq('owner_token', ownerToken);
}
```

---

### **2. Tasks Service (`/services/tasks.ts`)**

**BEFORE (BROKEN):**
```javascript
export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status: 'deleted',  // ❌ NOT ALLOWED by constraint
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .eq('owner_token', ownerToken);
}
```

**AFTER (FIXED):**
```javascript
export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status: 'closed',  // ✅ ALLOWED by constraint
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .eq('owner_token', ownerToken);
}
```

---

### **3. Listings Service (`/services/listings.js`)** ✅ **NEW FIX**

**BEFORE (ISSUE):**
```javascript
// getMyListings was returning ALL listings, including deleted ones
export async function getMyListings(clientToken) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_token', profile.id)
    .order('created_at', { ascending: false });
  // ❌ No filter for is_active - shows deleted listings!
}
```

**AFTER (FIXED):**
```javascript
// getMyListings now filters out deleted listings
export async function getMyListings(clientToken) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_token', profile.id)
    .eq('is_active', true)  // ✅ Only show active listings
    .order('created_at', { ascending: false });
}
```

**NOTE:** Listings don't use a `status` field. Instead, they use:
- `is_active: false` - Listing is soft-deleted
- `is_hidden: true` - Listing is hidden from public view

The delete operation was working correctly, but `getMyListings` was still returning deleted items.

---

## 🎯 **Why This Approach?**

### **Soft Delete Strategy:**
Instead of **hard deleting** (removing from database), we use **soft delete**:

1. ✅ Set `status` to an appropriate "closed" state
2. ✅ Set `is_hidden = true` (for wishes - hides from public view)
3. ✅ Keep data in database for history/audit trail
4. ✅ User can still view their deleted items in profile

### **Status Mapping:**

| Action | Tasks Status | Wishes Status |
|--------|-------------|---------------|
| **Delete** | `'closed'` | `'cancelled'` |
| **Cancel** | `'cancelled'` | `'cancelled'` |
| **Complete** | `'completed'` | `'completed'` or `'fulfilled'` |

---

## 🔍 **Impact Analysis**

### **What Changed:**
- ✅ Delete operations now use allowed status values
- ✅ Database constraints no longer violated
- ✅ Soft delete still works (items hidden from public view)
- ✅ Users can still see their deleted items in profile

### **What Didn't Change:**
- ✅ Ownership verification still intact
- ✅ `is_hidden` flag still used
- ✅ User experience unchanged
- ✅ Data retention unchanged

---

## 📊 **Testing Checklist**

- [x] Wishes delete operation works
- [x] Tasks delete operation works
- [x] No database constraint violations
- [x] Items hidden from public feed
- [x] Items still visible in user profile
- [x] Ownership verification working
- [x] Status filters working correctly

---

## 🚀 **Status:**

**✅ FIXED - Both Services Updated**

- `/services/wishes.ts` - Uses `'cancelled'` for delete
- `/services/tasks.ts` - Uses `'closed'` for delete
- Database constraints respected
- No more 23514 errors

---

**End of Fix**  
**Date:** March 6, 2026