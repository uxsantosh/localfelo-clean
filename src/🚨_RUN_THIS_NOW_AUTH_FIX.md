# 🚨 RUN THIS NOW - Fix "Not authenticated" Error

## ❌ Current Error:
```
Failed to load conversations: Not authenticated
```

## 🔍 Root Cause:
The previous SQL fix created RLS policies that ONLY check `auth.uid()` (Supabase Auth), but **LocalFelo uses CLIENT TOKEN authentication**, not Supabase Auth!

The policies need to check BOTH:
- ✅ `auth.uid()` (for future Supabase Auth users)
- ✅ `client_token` (for current LocalFelo users) ← **THIS WAS MISSING!**

---

## ✅ Solution - Run This SQL

### 📋 COPY THIS ENTIRE BLOCK:

```sql
-- Fix admin function
DROP FUNCTION IF EXISTS get_user_activity_summary(TEXT);

CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_listings', (SELECT COUNT(*) FROM listings WHERE user_id = user_id_param),
    'total_tasks_created', (SELECT COUNT(*) FROM tasks WHERE user_id = user_id_param),
    'total_tasks_accepted', (SELECT COUNT(*) FROM tasks WHERE helper_id = user_id_param),
    'total_wishes', (SELECT COUNT(*) FROM wishes WHERE user_id = user_id_param),
    'total_reports_filed', (SELECT COUNT(*) FROM task_wish_reports WHERE reporter_id = user_id_param),
    'total_reports_against', (SELECT COUNT(*) FROM task_wish_reports WHERE reported_user_id = user_id_param),
    'total_conversations', (SELECT COUNT(*) FROM conversations WHERE buyer_id = user_id_param OR seller_id = user_id_param)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disable RLS
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop all old policies
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

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies with CLIENT TOKEN support
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR buyer_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    OR seller_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (
    buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR buyer_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    OR seller_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
  );

CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
      AND profiles.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.client_token = current_setting('request.headers', true)::json->>'x-client-token'
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR buyer_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
         OR seller_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR buyer_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
         OR seller_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    )
  );

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  USING (
    sender_id NOT IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    AND sender_id NOT IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    AND conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR buyer_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
         OR seller_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    )
  );

CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE (profiles.auth_user_id = auth.uid() OR profiles.client_token = current_setting('request.headers', true)::json->>'x-client-token')
      AND profiles.is_admin = true
    )
  );
```

---

## 🎯 How to Run:

1. **Open Supabase Dashboard**
2. **Click "SQL Editor"**
3. **Paste the SQL above**
4. **Click "Run"**

---

## ✅ What This Fixes:

### Before (Broken):
```sql
-- Only checks Supabase Auth
USING (
  buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
)
```
❌ This doesn't work for LocalFelo because we use client tokens!

### After (Fixed):
```sql
-- Checks BOTH Supabase Auth AND Client Token
USING (
  buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  OR buyer_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
  OR seller_id IN (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
)
```
✅ This works for BOTH auth methods!

---

## 🧪 Test After Running:

```bash
npm run dev
```

1. Login to your app
2. Go to Chat
3. ✅ Conversations should load!
4. ✅ Messages should send!
5. ✅ No "Not authenticated" error!

---

## 📝 Technical Details:

**LocalFelo Auth Flow:**
1. User logs in → Gets `client_token`
2. App sends `x-client-token` header with every request
3. RLS policies check: `profiles.client_token = header.x-client-token`

**The old SQL we ran was missing the client_token check!**

---

**Status:** Run this SQL immediately to fix authentication! 🚀
