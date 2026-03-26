# ⚡ Quick Fix: Conversations Not Showing to Receiver

## Problem
Seller doesn't see conversations in their chat list (but buyer does).

## Why?
Conversations were using `owner_token` instead of `profile.id` for seller_id.

## Fix (3 steps)

### 1. ✅ Code Updated
The code in `/services/chat.ts` is already fixed! It now looks up the seller's `profile.id` from their `owner_token`.

### 2. 🗄️ Fix Old Conversations
Run this in **Supabase SQL Editor**:

```sql
-- Fix seller_id in existing conversations (with type casting!)
UPDATE conversations c
SET seller_id = p.id::text
FROM profiles p
WHERE c.seller_id = p.owner_token::text;

-- Fix buyer_id if needed (with type casting!)
UPDATE conversations c
SET buyer_id = p.id::text
FROM profiles p
WHERE c.buyer_id = p.owner_token::text;

-- Verify
SELECT 
  id, listing_title, buyer_id, seller_id
FROM conversations;
```

### 3. 🧪 Test
1. Hard refresh browser (Ctrl+Shift+R)
2. Login as seller
3. Check chat list
4. ✅ Should see conversations now!

## What Changed?

**Before:**
```
buyer_id: "abc-123" (profile.id) ✅
seller_id: "xyz-789" (owner_token) ❌
```

**After:**
```
buyer_id: "abc-123" (profile.id) ✅
seller_id: "def-456" (profile.id) ✅
```

Now both can query using their `profile.id`! 🎉

## Need More Help?

See detailed guides:
- `CHAT_FIX_RECEIVER_ISSUE.md` - Full explanation
- `FIX_EXISTING_CONVERSATIONS.sql` - Complete SQL fix
- `CHAT_DIAGNOSTIC_SCRIPT.js` - Debug tool

---

**That's it! Conversations will now show to both buyers and sellers.** ✅
