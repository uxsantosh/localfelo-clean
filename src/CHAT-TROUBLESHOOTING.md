# OldCycle Chat Troubleshooting Guide

## Issue: Messages not appearing in real-time

### Step 1: Run SQL Diagnostics

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste `/supabase-simple-test.sql`
3. Run it
4. **Share the output** - especially the "replica_identity_status" column

### Step 2: Check Browser Console

Open browser console (F12) and look for:

**GOOD SIGNS ✅:**
- `✅ Successfully subscribed to messages channel`
- `📨 New message INSERT received:` (when someone sends a message)
- `Subscription status: SUBSCRIBED`

**BAD SIGNS ❌:**
- `CHANNEL_ERROR` - RLS policies blocking
- `TIMED_OUT` - Connection issue
- `CLOSED` - Subscription died

### Step 3: Test Realtime Properly

**IMPORTANT:** You MUST test with 2 different users!

#### Option A: Two Browsers
1. Chrome (normal): Login as User A
2. Firefox/Incognito: Login as User B
3. User B sends message to User A
4. Check if User A sees it instantly (without refresh)

#### Option B: Two Devices
1. Desktop: Login as User A
2. Phone: Login as User B
3. Start a conversation about a listing
4. Send messages back and forth

### Step 4: Check What's Happening

Open console on BOTH browsers and watch for:

**Sender Side (User B):**
```
📤 [ChatWindow] Sending message: "..."
✅ [ChatWindow] Message sent successfully: {id}
```

**Receiver Side (User A):**
```
📨 [ChatWindow] Received new message via subscription: {id}
✅ [ChatWindow] Adding new message to state: {id}
📊 [ChatWindow] Messages state updated. Count: X
```

If you see the subscription log on receiver side, Realtime is working!
If you DON'T see it, run the SQL checks below.

### Step 5: Common Issues

#### Issue: Testing with same user in two tabs
**Symptom:** You send a message and it appears instantly in the same tab, but not in other tab
**Fix:** Use TWO DIFFERENT accounts (see Step 3)

#### Issue: RLS policies blocking
**Symptom:** Console shows `CHANNEL_ERROR` or no subscription logs
**Fix:** Run `/supabase-rls-fix-v2.sql` again

#### Issue: Replica identity not set to FULL
**Symptom:** Subscription succeeds but no INSERT events received
**Fix:**
```sql
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
```

#### Issue: Messages in state but not rendering
**Symptom:** Console shows "Messages state updated. Count: 19" but UI is empty
**Fix:** This is a rendering issue. Check:
1. Is the messages container visible? (check height, overflow)
2. Are there CSS conflicts hiding the messages?
3. Is the `currentUserId` correct for determining message alignment?

### Step 6: Nuclear Option (if nothing works)

Run `/supabase-disable-rls.sql` to completely disable RLS for testing.

⚠️ **WARNING:** This disables security. Only use for testing!

After confirming it works, re-enable RLS with proper policies using `/supabase-rls-fix-v2.sql`

---

## Quick Diagnostic Checklist

- [ ] Ran `/supabase-simple-test.sql` and replica_identity = "full"
- [ ] Ran `/supabase-final-cleanup.sql` to remove duplicate policies
- [ ] Browser console shows "SUBSCRIBED" status
- [ ] Testing with TWO DIFFERENT user accounts (not same user in two tabs)
- [ ] Both users are in the same conversation (about the same listing)
- [ ] Console on receiver side shows "📨 New message INSERT received"
- [ ] Console on receiver side shows "Messages state updated. Count: X"

If all checked and still not working, share:
1. Screenshot of SQL test output
2. Screenshot of browser console from BOTH users
3. Confirmation you're using different accounts
