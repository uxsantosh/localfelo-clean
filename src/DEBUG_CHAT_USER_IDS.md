# 🔍 Debug: Chat User ID Mismatch

## The Problem

Conversations aren't showing up for receivers. This is likely because:

1. **Sender creates conversation** with their `userId` (profile.id UUID)
2. **Receiver queries conversations** with their `userId` (profile.id UUID)
3. **IDs don't match** what's stored in the database

## Quick Debug Steps

### Step 1: Check What's in the Database

Run this in Supabase SQL Editor:

```sql
-- See all conversations with their buyer and seller IDs
SELECT 
  id,
  listing_title,
  buyer_id,
  buyer_name,
  seller_id,
  seller_name,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 10;

-- See all messages with their sender IDs
SELECT 
  id,
  conversation_id,
  sender_id,
  sender_name,
  content,
  created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- Are `buyer_id` and `seller_id` UUIDs or text strings?
- Do they match profile IDs from the `profiles` table?

### Step 2: Check Profile IDs

```sql
-- Get your profile IDs
SELECT 
  id,
  name,
  email,
  phone,
  client_token
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
```

**Compare:**
- Does your `profile.id` match what's in `conversations.buyer_id` or `seller_id`?

### Step 3: Check What getUserId() Returns

In your browser console on OldCycle:

```javascript
// Get current user
const user = JSON.parse(localStorage.getItem('oldcycle_user'));
console.log('Current user:', user);
console.log('User ID:', user.id);
console.log('Client Token:', user.clientToken);
console.log('Auth User ID:', user.authUserId);

// Check what conversations show up
const conversations = await fetch('YOUR_SUPABASE_URL/rest/v1/conversations?select=*', {
  headers: {
    'apikey': 'YOUR_SUPABASE_ANON_KEY',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
  }
}).then(r => r.json());

console.log('All conversations:', conversations);
```

## Likely Issue

The `buyer_id` and `seller_id` in conversations table are **TEXT** type, but should contain **UUID strings** from `profiles.id`.

When you:
1. Create a conversation → stores `user.id` (UUID) as TEXT ✅
2. Query conversations → filters by `user.id` (UUID) as TEXT ✅

**BUT** - if user.id is undefined or not being set properly, that's the issue!

## Check User Object

In chat.ts line 43-47:
```typescript
function getUserId(): string | null {
  const user = getCurrentUser();
  return user?.id ? String(user.id) : null;
}
```

**Is `user.id` actually set?**

Check in browser console:
```javascript
const user = JSON.parse(localStorage.getItem('oldcycle_user'));
console.log('user.id exists?', !!user.id);
console.log('user.id value:', user.id);
```

## If user.id is Missing

The issue is in how the user object is created during authentication. Check:

1. **Google Auth** (`completeGoogleRegistration` in auth.ts line 319-329):
   - Sets `id: insertedProfile.id` ✅

2. **Soft Auth** (`registerSoftUser` in auth.ts line 482-490):
   - Sets `id: insertedProfile.id` ✅

Both should set the `id` field properly.

## Quick Fix Test

To test if this is the issue, try this in browser console:

```javascript
// Manually check and fix user object
const user = JSON.parse(localStorage.getItem('oldcycle_user'));

if (!user.id) {
  console.error('❌ user.id is missing!');
  console.log('User object:', user);
  
  // You need to re-login to fix this
  alert('Please logout and login again to fix chat');
} else {
  console.log('✅ user.id exists:', user.id);
}
```

## Next Steps

1. **Run the SQL queries** above to see what's actually in the database
2. **Check the browser console** to see if user.id exists
3. **Compare the IDs** - do they match?
4. **Report back** with the results and I'll provide the exact fix!
