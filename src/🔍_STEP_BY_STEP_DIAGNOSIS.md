# 🔍 STEP-BY-STEP CHAT DIAGNOSIS

Run each query **ONE AT A TIME** and share the result.

---

## QUERY 1: Check RLS Status

```sql
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('conversations', 'messages');
```

**Share result:** Is `rls_enabled` true or false for `messages` table?

---

## QUERY 2: Check RLS Policies

```sql
SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename;
```

**Share result:** How many rows? What are the policy names?

---

## QUERY 3: Check Messages Table Structure

```sql
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
```

**Share result:** What is the `data_type` of `sender_id` column?

---

## QUERY 4: Count Messages

```sql
SELECT COUNT(*) as total_messages FROM messages;
```

**Share result:** How many messages exist?

---

## QUERY 5: Check Recent Messages (MOST IMPORTANT!)

```sql
SELECT 
    id,
    sender_id,
    sender_name,
    LEFT(content, 50) as content_preview,
    read,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 5;
```

**Share result:** Do you see messages? What do they look like?

---

## QUERY 6: Check Realtime

```sql
SELECT 
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('conversations', 'messages');
```

**Share result:** Is `messages` listed?

---

## Start with QUERY 1 and work your way down!

Share each result as you go. 🔍
