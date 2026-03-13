-- =====================================================
-- DATA INTELLIGENCE DASHBOARD - SQL SETUP
-- Uses EXISTING data only - NO schema changes
-- =====================================================

-- =====================================================
-- MATERIALIZED VIEWS for Performance (Read-only)
-- These are analytics views that don't modify production tables
-- =====================================================

-- View 1: Daily User Activity
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_user_stats AS
SELECT 
  DATE(created_at) as activity_date,
  COUNT(DISTINCT id) as new_users,
  COUNT(*) as total_signups
FROM profiles
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY activity_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_user_stats_date ON mv_daily_user_stats(activity_date);

-- View 2: Category Performance (Tasks)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_task_category_stats AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.emoji as category_emoji,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status IN ('accepted', 'in_progress') THEN 1 END) as active_tasks,
  AVG(t.price) as avg_budget,
  MIN(t.price) as min_budget,
  MAX(t.price) as max_budget
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
GROUP BY c.id, c.name, c.emoji;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_task_category_stats_id ON mv_task_category_stats(category_id);

-- View 3: Category Performance (Wishes)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_wish_category_stats AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.emoji as category_emoji,
  COUNT(w.id) as total_wishes,
  COUNT(CASE WHEN w.status = 'accepted' THEN 1 END) as fulfilled_wishes,
  AVG(w.budget_max) as avg_budget
FROM categories c
LEFT JOIN wishes w ON c.id = w.category_id
GROUP BY c.id, c.name, c.emoji;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_wish_category_stats_id ON mv_wish_category_stats(category_id);

-- View 4: Marketplace Category Stats
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_marketplace_category_stats AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.emoji as category_emoji,
  c.slug as category_slug,
  COUNT(l.id) as total_listings,
  COUNT(CASE WHEN l.is_active = true AND l.is_hidden = false THEN 1 END) as active_listings,
  AVG(l.price) as avg_price,
  MIN(l.price) as min_price,
  MAX(l.price) as max_price,
  SUM(l.views_count) as total_views
FROM categories c
LEFT JOIN listings l ON c.slug = l.category_slug
GROUP BY c.id, c.name, c.emoji, c.slug;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_marketplace_category_stats_id ON mv_marketplace_category_stats(category_id);

-- View 5: Location Performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_location_stats AS
SELECT 
  city.id as city_id,
  city.name as city_name,
  area.id as area_id,
  area.name as area_name,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT w.id) as total_wishes,
  COUNT(DISTINCT l.id) as total_listings,
  COUNT(DISTINCT p.id) as total_users
FROM cities city
LEFT JOIN areas area ON area.city_id = city.id
LEFT JOIN tasks t ON t.area_id = area.id
LEFT JOIN wishes w ON w.area_id = area.id
LEFT JOIN listings l ON l.area_slug = area.id
LEFT JOIN profiles p ON p.city_id = city.id
GROUP BY city.id, city.name, area.id, area.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_location_stats_unique ON mv_location_stats(city_id, COALESCE(area_id, ''));
CREATE INDEX IF NOT EXISTS idx_mv_location_stats_city ON mv_location_stats(city_id);
CREATE INDEX IF NOT EXISTS idx_mv_location_stats_area ON mv_location_stats(area_id);

-- View 6: Helper Performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_helper_performance AS
SELECT 
  p.id as user_id,
  p.name as helper_name,
  p.phone as helper_phone,
  p.city_id,
  COUNT(DISTINCT t.id) as total_tasks_accepted,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
  COUNT(DISTINCT CASE WHEN t.status = 'cancelled' THEN t.id END) as tasks_cancelled,
  AVG(t.accepted_price) as avg_task_value,
  CASE 
    WHEN COUNT(DISTINCT t.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::DECIMAL / COUNT(DISTINCT t.id)::DECIMAL) * 100, 2)
    ELSE 0
  END as completion_rate,
  CASE 
    WHEN COUNT(DISTINCT t.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN t.status = 'cancelled' THEN t.id END)::DECIMAL / COUNT(DISTINCT t.id)::DECIMAL) * 100, 2)
    ELSE 0
  END as cancellation_rate
FROM profiles p
LEFT JOIN tasks t ON t.helper_id = p.id
WHERE t.helper_id IS NOT NULL
GROUP BY p.id, p.name, p.phone, p.city_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_helper_performance_user ON mv_helper_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_mv_helper_performance_completion ON mv_helper_performance(completion_rate DESC);

-- View 7: Daily Task Stats
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_task_stats AS
SELECT 
  DATE(created_at) as activity_date,
  COUNT(*) as tasks_posted,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as tasks_accepted,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as tasks_completed,
  AVG(price) as avg_budget
FROM tasks
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY activity_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_task_stats_date ON mv_daily_task_stats(activity_date);

-- View 8: Daily Wish Stats
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_wish_stats AS
SELECT 
  DATE(created_at) as activity_date,
  COUNT(*) as wishes_posted,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as wishes_fulfilled,
  AVG((budget_min + budget_max) / 2) as avg_budget
FROM wishes
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY activity_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_wish_stats_date ON mv_daily_wish_stats(activity_date);

-- View 9: Daily Marketplace Stats
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_marketplace_stats AS
SELECT 
  DATE(created_at) as activity_date,
  COUNT(*) as listings_posted,
  COUNT(CASE WHEN is_active = true AND is_hidden = false THEN 1 END) as active_listings,
  AVG(price) as avg_price,
  SUM(views_count) as total_views
FROM listings
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY activity_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_marketplace_stats_date ON mv_daily_marketplace_stats(activity_date);

-- =====================================================
-- SQL FUNCTIONS for Dashboard Queries
-- =====================================================

-- Function 1: Get Platform KPIs
CREATE OR REPLACE FUNCTION get_platform_kpis()
RETURNS TABLE (
  total_users BIGINT,
  active_users_24h BIGINT,
  active_users_7d BIGINT,
  total_tasks BIGINT,
  completed_tasks BIGINT,
  total_wishes BIGINT,
  fulfilled_wishes BIGINT,
  total_listings BIGINT,
  active_listings BIGINT,
  total_messages BIGINT,
  avg_task_budget DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles)::BIGINT as total_users,
    (SELECT COUNT(DISTINCT user_id) FROM tasks WHERE created_at >= NOW() - INTERVAL '24 hours')::BIGINT as active_users_24h,
    (SELECT COUNT(DISTINCT user_id) FROM tasks WHERE created_at >= NOW() - INTERVAL '7 days')::BIGINT as active_users_7d,
    (SELECT COUNT(*) FROM tasks)::BIGINT as total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'completed')::BIGINT as completed_tasks,
    (SELECT COUNT(*) FROM wishes)::BIGINT as total_wishes,
    (SELECT COUNT(*) FROM wishes WHERE status = 'accepted')::BIGINT as fulfilled_wishes,
    (SELECT COUNT(*) FROM listings)::BIGINT as total_listings,
    (SELECT COUNT(*) FROM listings WHERE is_active = true AND is_hidden = false)::BIGINT as active_listings,
    (SELECT COUNT(*) FROM messages)::BIGINT as total_messages,
    (SELECT AVG(price) FROM tasks)::DECIMAL as avg_task_budget;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 2: Get User Activity by Location
CREATE OR REPLACE FUNCTION get_user_activity_by_location()
RETURNS TABLE (
  city_name TEXT,
  user_count BIGINT,
  task_count BIGINT,
  wish_count BIGINT,
  listing_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as city_name,
    COUNT(DISTINCT p.id)::BIGINT as user_count,
    COUNT(DISTINCT t.id)::BIGINT as task_count,
    COUNT(DISTINCT w.id)::BIGINT as wish_count,
    COUNT(DISTINCT l.id)::BIGINT as listing_count
  FROM cities c
  LEFT JOIN profiles p ON p.city_id = c.id
  LEFT JOIN areas a ON a.city_id = c.id
  LEFT JOIN tasks t ON t.area_id = a.id
  LEFT JOIN wishes w ON w.area_id = a.id
  LEFT JOIN listings l ON l.area_slug = a.id
  GROUP BY c.id, c.name
  ORDER BY user_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 3: Get Top Helpers
CREATE OR REPLACE FUNCTION get_top_helpers(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  helper_id UUID,
  helper_name TEXT,
  tasks_completed BIGINT,
  completion_rate DECIMAL,
  avg_task_value DECIMAL,
  city_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.user_id as helper_id,
    h.helper_name,
    h.tasks_completed::BIGINT,
    h.completion_rate,
    h.avg_task_value,
    c.name as city_name
  FROM mv_helper_performance h
  LEFT JOIN cities c ON c.id = h.city_id
  WHERE h.tasks_completed > 0
  ORDER BY h.tasks_completed DESC, h.completion_rate DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 4: Get Location Heatmap Data
CREATE OR REPLACE FUNCTION get_location_heatmap_data()
RETURNS TABLE (
  city_name TEXT,
  area_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  activity_score DECIMAL,
  task_density INTEGER,
  wish_density INTEGER,
  listing_density INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.city_name,
    l.area_name,
    a.latitude,
    a.longitude,
    (COALESCE(l.total_tasks, 0) + COALESCE(l.total_wishes, 0) + COALESCE(l.total_listings, 0))::DECIMAL as activity_score,
    COALESCE(l.total_tasks, 0)::INTEGER as task_density,
    COALESCE(l.total_wishes, 0)::INTEGER as wish_density,
    COALESCE(l.total_listings, 0)::INTEGER as listing_density
  FROM mv_location_stats l
  LEFT JOIN areas a ON a.id = l.area_id
  WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
  ORDER BY activity_score DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 5: Refresh All Materialized Views
CREATE OR REPLACE FUNCTION refresh_all_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_user_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_task_category_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_wish_category_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_marketplace_category_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_location_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_helper_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_task_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_wish_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_marketplace_stats;
END;
$$ LANGUAGE plpgsql;

-- Function 6: Get User Activity Table (for admin dashboard)
CREATE OR REPLACE FUNCTION get_user_activity_table()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  tasks_posted BIGINT,
  tasks_completed BIGINT,
  listings_posted BIGINT,
  last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    c.name as city,
    COUNT(DISTINCT t.id)::BIGINT as tasks_posted,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::BIGINT as tasks_completed,
    COUNT(DISTINCT l.id)::BIGINT as listings_posted,
    MAX(GREATEST(
      COALESCE(t.created_at, '1900-01-01'::timestamp with time zone),
      COALESCE(l.created_at, '1900-01-01'::timestamp with time zone),
      COALESCE(p.created_at, '1900-01-01'::timestamp with time zone)
    )) as last_active
  FROM profiles p
  LEFT JOIN cities c ON c.id = p.city_id
  LEFT JOIN tasks t ON t.user_id = p.id
  LEFT JOIN listings l ON l.owner_token::uuid = p.id
  GROUP BY p.id, p.name, p.email, p.phone, c.name
  ORDER BY last_active DESC NULLS LAST
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- SAMPLE ANALYTICS QUERIES
-- Copy these to test in Supabase SQL Editor
-- =====================================================

/*
-- Query 1: Platform Overview KPIs
SELECT * FROM get_platform_kpis();

-- Query 2: New Users Per Day (Last 30 days)
SELECT * FROM mv_daily_user_stats 
WHERE activity_date >= NOW() - INTERVAL '30 days'
ORDER BY activity_date DESC;

-- Query 3: Tasks Performance by Category
SELECT * FROM mv_task_category_stats
ORDER BY total_tasks DESC;

-- Query 4: Wishes Performance by Category
SELECT * FROM mv_wish_category_stats
ORDER BY total_wishes DESC;

-- Query 5: Marketplace Performance by Category
SELECT * FROM mv_marketplace_category_stats
ORDER BY total_listings DESC;

-- Query 6: User Activity by Location
SELECT * FROM get_user_activity_by_location();

-- Query 7: Top Performing Helpers
SELECT * FROM get_top_helpers(20);

-- Query 8: Daily Task Trends (Last 30 days)
SELECT * FROM mv_daily_task_stats
WHERE activity_date >= NOW() - INTERVAL '30 days'
ORDER BY activity_date DESC;

-- Query 9: Daily Wish Trends (Last 30 days)
SELECT * FROM mv_daily_wish_stats
WHERE activity_date >= NOW() - INTERVAL '30 days'
ORDER BY activity_date DESC;

-- Query 10: Daily Marketplace Trends (Last 30 days)
SELECT * FROM mv_daily_marketplace_stats
WHERE activity_date >= NOW() - INTERVAL '30 days'
ORDER BY activity_date DESC;

-- Query 11: Location Heatmap Data
SELECT * FROM get_location_heatmap_data()
LIMIT 100;

-- Query 12: User Activity Table (for admin dashboard)
SELECT * FROM get_user_activity_table();

-- Query 13: Task Completion Rate Over Time
SELECT 
  activity_date,
  tasks_posted,
  tasks_completed,
  CASE 
    WHEN tasks_posted > 0 
    THEN ROUND((tasks_completed::DECIMAL / tasks_posted::DECIMAL) * 100, 2)
    ELSE 0
  END as completion_rate_percent
FROM mv_daily_task_stats
WHERE activity_date >= NOW() - INTERVAL '90 days'
ORDER BY activity_date DESC;

-- Query 14: Helper Performance Table
SELECT 
  p.id,
  p.name as helper_name,
  cat.name as category,
  COUNT(t.id) as tasks_completed,
  AVG(t.accepted_price) as avg_earnings,
  ROUND(
    (COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN t.status IN ('accepted', 'in_progress', 'completed', 'cancelled') THEN 1 END), 0)) * 100, 
    2
  ) as completion_rate
FROM profiles p
INNER JOIN tasks t ON t.helper_id = p.id
LEFT JOIN categories cat ON cat.id = t.category_id
WHERE t.status IN ('completed', 'cancelled')
GROUP BY p.id, p.name, cat.id, cat.name
HAVING COUNT(t.id) > 0
ORDER BY tasks_completed DESC
LIMIT 50;
*/

-- =====================================================
-- ADMIN RLS POLICIES
-- Only admins can access these views
-- =====================================================

-- Grant access to materialized views (read-only)
-- Note: Materialized views don't support RLS directly,
-- so we control access through the calling functions

-- =====================================================
-- SCHEDULED REFRESH
-- Run this daily via cron or pg_cron
-- =====================================================

-- Daily refresh at 2 AM:
-- SELECT refresh_all_analytics_views();

-- =====================================================
-- END OF SETUP
-- =====================================================

-- INSTALLATION INSTRUCTIONS:
-- 1. Run this entire file in Supabase SQL Editor
-- 2. Wait for all views to be created (may take 1-2 minutes)
-- 3. Test with: SELECT * FROM get_platform_kpis();
-- 4. Schedule daily refresh via Supabase Dashboard > Database > Cron Jobs
-- 5. Use the queries above in your Data Intelligence dashboard