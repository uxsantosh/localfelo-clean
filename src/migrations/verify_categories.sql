-- =====================================================
-- VERIFY CATEGORIES - Quick diagnostic script
-- Run this to check if all categories are set up correctly
-- =====================================================

-- 1. Check if categories table exists
SELECT 
  'Categories table exists' as status,
  COUNT(*) as total_categories
FROM categories;

-- 2. Check task categories specifically
SELECT 
  'Task categories' as category_type,
  COUNT(*) as count
FROM categories 
WHERE type = 'task';

-- 3. List all task categories (should show 301-309)
SELECT 
  id,
  name,
  slug,
  emoji,
  type,
  sort_order
FROM categories 
WHERE type = 'task'
ORDER BY id;

-- 4. Check if category '309' exists (the one we're using)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM categories WHERE id = '309')
    THEN '✅ Category 309 (Other Task) exists - Tasks should work!'
    ELSE '❌ Category 309 missing - Please run fix_task_categories.sql'
  END as category_309_status;

-- 5. Check for any existing tasks and their categories
SELECT 
  'Existing tasks' as info,
  COUNT(*) as task_count,
  COUNT(DISTINCT category_id) as unique_categories
FROM tasks;

-- 6. Show sample tasks with their categories (if any exist)
SELECT 
  t.id,
  t.title,
  t.category_id,
  c.name as category_name,
  t.status,
  t.created_at
FROM tasks t
LEFT JOIN categories c ON c.id = t.category_id
ORDER BY t.created_at DESC
LIMIT 5;

-- 7. Check for orphaned tasks (tasks with invalid category_id)
SELECT 
  COUNT(*) as orphaned_tasks
FROM tasks t
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.id = t.category_id
);
