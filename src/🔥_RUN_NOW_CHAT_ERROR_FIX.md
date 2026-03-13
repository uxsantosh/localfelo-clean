# 🔥 RUN THIS NOW - Fix Chat Error

## ❌ Current Error:
```
column c.user1_id does not exist
```

## ✅ This SQL will fix it!

---

## 📋 COPY THIS ENTIRE BLOCK AND RUN IN SUPABASE:

```sql
-- STEP 1: Disable RLS temporarily
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL old policies (force drop everything)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', r.policyname);
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', r.policyname);
    END LOOP;
END $$;

-- STEP 3: Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create correct policies with buyer_id/seller_id (NOT user1_id/user2_id)

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (
    buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  );

CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
         OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
         OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    )
  );

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  USING (
    sender_id != (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    AND conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
         OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    )
  );

CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
      AND profiles.is_admin = true
    )
  );
```

---

## 🎯 How to Run:

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click "SQL Editor"

2. **Paste and Run**
   - Copy the entire SQL block above
   - Paste into a new query
   - Click "Run" (or Ctrl+Enter)

3. **Expected Result:**
   ```
   Success. No rows returned
   ```

---

## ✅ What This Does:

1. **Temporarily disables RLS** - So we can clean everything
2. **Drops ALL old policies** - Including ones with wrong column names like:
   - ❌ `c.user_id` (doesn't exist)
   - ❌ `c.user1_id` (doesn't exist)  
   - ❌ `c.user2_id` (doesn't exist)
3. **Re-enables RLS** - Security back on
4. **Creates NEW correct policies** - Using actual columns:
   - ✅ `buyer_id`
   - ✅ `seller_id`

---

## 🧪 Test After Running:

1. Open your app
2. Go to any chat
3. Type and send a message
4. ✅ Should work without errors!

---

## 🔍 If It Still Fails:

Check your browser console for the exact error and share it with me.

---

**Status:** Ready to run! This will fix the "user1_id does not exist" error. 🚀
