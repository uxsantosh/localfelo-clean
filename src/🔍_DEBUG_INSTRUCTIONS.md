# 🔍 DEBUG: Why Messages Don't Show in UI

## The Problem
- ✅ Messages ARE saved to database (we verified 3 messages exist)
- ✅ Notifications work (you can see them)
- ❌ Messages DON'T show in ChatWindow UI

## Root Cause Analysis

### Likely Issue: RLS Policy Blocking SELECT Queries

The messages table has an RLS policy that checks:
```sql
conversation_id IN (
  SELECT conversations.id FROM conversations 
  WHERE conversations.buyer_id = (current user's profile id)
     OR conversations.seller_id = (current user's profile id)
)
```

**This might fail if:**
1. The user's `client_token` in headers doesn't match their `profiles.client_token`
2. The conversation's `buyer_id` or `seller_id` doesn't match the user's `profiles.id`

## 🧪 Test Steps

### Step 1: Check Browser Console Logs
Open DevTools Console and look for:
```
📨 [ChatWindow] Loading messages for conversation: e70507fc-24d8-4937-a21c-4c3f50cbde7d
📨 [ChatWindow] Messages loaded: { count: 0, error: null, messages: [] }
```

If `count: 0`, the RLS policy is blocking the query!

### Step 2: Verify Conversation Ownership
Run this query in Supabase SQL Editor:

```sql
SELECT 
    id::text as conv_id,
    listing_title,
    buyer_id,
    seller_id
FROM conversations
WHERE id = 'e70507fc-24d8-4937-a21c-4c3f50cbde7d';
```

**Expected Result:**
```
conv_id: e70507fc-24d8-4937-a21c-4c3f50cbde7d
buyer_id: <some UUID>
seller_id: <some UUID>
```

### Step 3: Verify Your Profile ID
Run this in browser console:
```javascript
const user = JSON.parse(localStorage.getItem('localfelo_user'));
console.log('Your Profile ID:', user?.id);
```

**Check if your profile ID matches either `buyer_id` OR `seller_id` from Step 2!**

### Step 4: Check Client Token
```javascript
const clientToken = localStorage.getItem('localfelo_client_token');
console.log('Your Client Token:', clientToken);
```

Then run in SQL Editor:
```sql
SELECT id::text, display_name, client_token
FROM profiles
WHERE client_token = '<paste your token here>';
```

Verify this returns YOUR profile!

---

## 🎯 Expected Findings

**If messages don't show in UI:**
- Browser console will show `count: 0` 
- Your profile ID won't match buyer_id/seller_id in the conversation
- RLS is blocking the query

**Solution:** The conversation was created with wrong buyer_id/seller_id values!

---

## Share These Results:
1. Browser console log from ChatWindow
2. Result from Step 2 (conversation ownership)
3. Result from Step 3 (your profile ID)
