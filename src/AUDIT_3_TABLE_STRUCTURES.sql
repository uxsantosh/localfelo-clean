-- ================================================================
-- COMPREHENSIVE AUDIT: All Tables Structure
-- ================================================================
-- Shows column structure for key tables
-- ================================================================

-- Tasks table structure
SELECT 
  'TASKS TABLE' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
ORDER BY ordinal_position;

-- Wishes table structure
SELECT 
  'WISHES TABLE' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'wishes'
ORDER BY ordinal_position;

-- Listings table structure
SELECT 
  'LISTINGS TABLE' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'listings'
ORDER BY ordinal_position;

-- Chats table structure
SELECT 
  'CHATS TABLE' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chats'
ORDER BY ordinal_position;

-- Chat messages table structure
SELECT 
  'CHAT_MESSAGES TABLE' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- Push tokens table structure
SELECT 
  'PUSH_TOKENS TABLE' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'push_tokens'
ORDER BY ordinal_position;

-- Device tokens table structure (Edge Function uses this?)
SELECT 
  'DEVICE_TOKENS TABLE' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'device_tokens'
ORDER BY ordinal_position;
