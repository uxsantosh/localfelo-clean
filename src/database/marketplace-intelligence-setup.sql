-- =====================================================
-- Marketplace Intelligence - Database Setup
-- SQL queries to enable advanced analytics features
-- =====================================================

-- =====================================================
-- TABLE 1: Search Logs
-- Track user searches for intent signals
-- =====================================================

CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  search_keyword TEXT NOT NULL,
  category_clicked TEXT,
  task_posted_after BOOLEAN DEFAULT false,
  wish_posted_after BOOLEAN DEFAULT false,
  listing_posted_after BOOLEAN DEFAULT false,
  location TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for search_logs
CREATE INDEX IF NOT EXISTS idx_search_logs_user ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_keyword ON search_logs(search_keyword);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_location ON search_logs(location);

-- =====================================================
-- TABLE 2: User Activity Events
-- Track all user interactions for behavior analysis
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'listing_view', 'chat_open', 'task_view', etc.
  event_category TEXT, -- 'marketplace', 'wishes', 'tasks'
  event_data JSONB, -- Flexible storage for event-specific data
  session_id TEXT,
  device_info JSONB, -- Browser, OS, screen size
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_activity_events
CREATE INDEX IF NOT EXISTS idx_activity_events_user ON user_activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON user_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_category ON user_activity_events(event_category);
CREATE INDEX IF NOT EXISTS idx_activity_events_created ON user_activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_session ON user_activity_events(session_id);

-- =====================================================
-- TABLE 3: Task Analytics
-- Detailed task performance metrics
-- =====================================================

CREATE TABLE IF NOT EXISTS task_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Timing metrics
  time_to_first_response INTEGER, -- seconds
  time_to_acceptance INTEGER, -- seconds
  time_to_completion INTEGER, -- seconds
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  negotiation_count INTEGER DEFAULT 0,
  
  -- Quality metrics
  helper_quality_score DECIMAL(3,2), -- 0.00 to 5.00
  completion_quality DECIMAL(3,2), -- 0.00 to 5.00
  
  -- Behavioral data
  user_returned BOOLEAN DEFAULT false, -- Did user post another task?
  helper_returned BOOLEAN DEFAULT false, -- Did helper accept another task?
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for task_analytics
CREATE INDEX IF NOT EXISTS idx_task_analytics_task ON task_analytics(task_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_user ON task_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_created ON task_analytics(created_at DESC);

-- =====================================================
-- TABLE 4: Provider Metrics
-- Helper/provider performance tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS provider_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Performance metrics
  total_tasks_applied INTEGER DEFAULT 0,
  total_tasks_accepted INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  total_tasks_cancelled INTEGER DEFAULT 0,
  
  -- Quality metrics
  avg_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  quality_score DECIMAL(3,2) DEFAULT 0, -- Calculated score 0-100
  
  -- Speed metrics
  avg_response_time INTEGER, -- Average time to respond in seconds
  avg_completion_time INTEGER, -- Average time to complete in seconds
  
  -- Reliability metrics
  cancellation_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  completion_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  on_time_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  
  -- Financial metrics
  total_earnings DECIMAL(10,2) DEFAULT 0,
  avg_task_value DECIMAL(10,2) DEFAULT 0,
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for provider_metrics
CREATE INDEX IF NOT EXISTS idx_provider_metrics_user ON provider_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_metrics_quality ON provider_metrics(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_provider_metrics_rating ON provider_metrics(avg_rating DESC);

-- =====================================================
-- TABLE 5: Category Demand Stats
-- Aggregated demand statistics by category
-- =====================================================

CREATE TABLE IF NOT EXISTS category_demand_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id INTEGER, -- Changed to INTEGER to match actual database schema
  
  -- Demand metrics
  total_tasks INTEGER DEFAULT 0,
  total_wishes INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  
  -- Supply metrics
  available_helpers INTEGER DEFAULT 0,
  active_providers INTEGER DEFAULT 0,
  
  -- Pricing metrics
  avg_task_budget DECIMAL(10,2) DEFAULT 0,
  median_task_budget DECIMAL(10,2) DEFAULT 0,
  avg_listing_price DECIMAL(10,2) DEFAULT 0,
  
  -- Performance metrics
  task_acceptance_rate DECIMAL(5,2) DEFAULT 0,
  task_completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_time_to_accept INTEGER, -- seconds
  
  -- Demand gap
  demand_gap_severity TEXT, -- 'HIGH', 'MODERATE', 'LOW'
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for category_demand_stats
CREATE INDEX IF NOT EXISTS idx_category_demand_category ON category_demand_stats(category_id);
CREATE INDEX IF NOT EXISTS idx_category_demand_period ON category_demand_stats(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_category_demand_gap ON category_demand_stats(demand_gap_severity);

-- =====================================================
-- TABLE 6: Location Heatmap Data
-- Geospatial demand and supply data
-- =====================================================

CREATE TABLE IF NOT EXISTS location_heatmap_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  
  -- Density metrics
  task_density INTEGER DEFAULT 0,
  wish_density INTEGER DEFAULT 0,
  listing_density INTEGER DEFAULT 0,
  user_density INTEGER DEFAULT 0,
  
  -- Heat level
  heat_level TEXT, -- 'HIGH', 'MEDIUM', 'LOW'
  
  -- Coordinates (for map visualization)
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for location_heatmap_data
CREATE INDEX IF NOT EXISTS idx_location_heatmap_city ON location_heatmap_data(city_id);
CREATE INDEX IF NOT EXISTS idx_location_heatmap_area ON location_heatmap_data(area_id);
CREATE INDEX IF NOT EXISTS idx_location_heatmap_heat ON location_heatmap_data(heat_level);

-- =====================================================
-- TABLE 7: User Session Tracking
-- For cohort analysis and retention metrics
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  -- Session data
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- seconds
  
  -- Activity metrics
  pages_viewed INTEGER DEFAULT 0,
  listings_viewed INTEGER DEFAULT 0,
  tasks_viewed INTEGER DEFAULT 0,
  wishes_viewed INTEGER DEFAULT 0,
  chats_initiated INTEGER DEFAULT 0,
  
  -- Device info
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started ON user_sessions(started_at DESC);

-- =====================================================
-- TABLE 8: Fraud Detection Signals
-- Track suspicious activities
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Signal type
  signal_type TEXT NOT NULL, -- 'multiple_cancellations', 'duplicate_phone', 'fake_listing', etc.
  severity TEXT NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
  
  -- Details
  signal_data JSONB,
  description TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'confirmed', 'dismissed'
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fraud_signals
CREATE INDEX IF NOT EXISTS idx_fraud_signals_user ON fraud_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_type ON fraud_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_severity ON fraud_signals(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_status ON fraud_signals(status);

-- =====================================================
-- TABLE 9: Referral Tracking
-- Track viral growth and referrals
-- =====================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Referral details
  referral_code TEXT,
  referral_source TEXT, -- 'link', 'code', 'social'
  
  -- Conversion tracking
  converted BOOLEAN DEFAULT false,
  conversion_type TEXT, -- 'task_posted', 'listing_created', 'wish_posted'
  converted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_converted ON referrals(converted);

-- =====================================================
-- TABLE 10: Advertiser Campaigns
-- Track advertiser opportunities and campaigns
-- =====================================================

CREATE TABLE IF NOT EXISTS advertiser_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Campaign details
  campaign_name TEXT NOT NULL,
  advertiser_name TEXT NOT NULL,
  category_id INTEGER, -- Changed to INTEGER to match actual database schema
  
  -- Targeting
  target_cities TEXT[], -- Array of city IDs (TEXT type)
  target_areas TEXT[], -- Array of area IDs (TEXT type)
  
  -- Budget and performance
  budget DECIMAL(10,2),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  
  -- Dates
  start_date DATE,
  end_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for advertiser_campaigns
CREATE INDEX IF NOT EXISTS idx_advertiser_campaigns_category ON advertiser_campaigns(category_id);
CREATE INDEX IF NOT EXISTS idx_advertiser_campaigns_status ON advertiser_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_advertiser_campaigns_dates ON advertiser_campaigns(start_date, end_date);

-- =====================================================
-- MATERIALIZED VIEWS for Performance
-- Pre-computed analytics for faster queries
-- =====================================================

-- View 1: Category Performance Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_performance AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.emoji as category_emoji,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT w.id) as total_wishes,
  COUNT(DISTINCT l.id) as total_listings,
  AVG(t.price) as avg_task_price,
  COUNT(DISTINCT CASE WHEN t.status IN ('accepted', 'in_progress', 'completed') THEN t.id END) as accepted_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
LEFT JOIN wishes w ON c.id = w.category_id
LEFT JOIN listings l ON c.slug = l.category_slug -- FIX: listings uses category_slug, not category_id
GROUP BY c.id, c.name, c.emoji;

-- Index for materialized view
CREATE INDEX IF NOT EXISTS idx_mv_category_performance_id ON mv_category_performance(category_id);

-- View 2: Location Performance Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_location_performance AS
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
LEFT JOIN listings l ON l.area_slug = area.id -- FIX: listings uses area_slug VARCHAR, areas.id is TEXT (slug format)
LEFT JOIN profiles p ON p.city = city.name
GROUP BY city.id, city.name, area.id, area.name;

-- Index for materialized view
CREATE INDEX IF NOT EXISTS idx_mv_location_performance_city ON mv_location_performance(city_id);
CREATE INDEX IF NOT EXISTS idx_mv_location_performance_area ON mv_location_performance(area_id);

-- =====================================================
-- FUNCTIONS to Refresh Materialized Views
-- =====================================================

-- Function to refresh category performance
CREATE OR REPLACE FUNCTION refresh_category_performance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_performance;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh location performance
CREATE OR REPLACE FUNCTION refresh_location_performance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_location_performance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS for Automatic Quality Score Updates
-- =====================================================

-- Function to calculate provider quality score
CREATE OR REPLACE FUNCTION calculate_provider_quality_score(p_user_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  v_rating_score DECIMAL(3,2);
  v_completion_rate DECIMAL(3,2);
  v_response_score DECIMAL(3,2);
  v_cancellation_score DECIMAL(3,2);
  v_quality_score DECIMAL(3,2);
BEGIN
  SELECT 
    COALESCE(avg_rating / 5.0, 0) as rating_score,
    COALESCE(completion_rate / 100.0, 0) as completion_rate,
    CASE 
      WHEN avg_response_time <= 3600 THEN 1.0  -- Within 1 hour
      WHEN avg_response_time <= 7200 THEN 0.8  -- Within 2 hours
      WHEN avg_response_time <= 86400 THEN 0.6 -- Within 24 hours
      ELSE 0.3
    END as response_score,
    CASE 
      WHEN cancellation_rate <= 5 THEN 1.0
      WHEN cancellation_rate <= 10 THEN 0.7
      WHEN cancellation_rate <= 20 THEN 0.4
      ELSE 0.1
    END as cancellation_score
  INTO v_rating_score, v_completion_rate, v_response_score, v_cancellation_score
  FROM provider_metrics
  WHERE user_id = p_user_id;
  
  -- Weighted average: rating 40%, completion 30%, response 20%, cancellation 10%
  v_quality_score := (
    COALESCE(v_rating_score, 0) * 0.4 +
    COALESCE(v_completion_rate, 0) * 0.3 +
    COALESCE(v_response_score, 0) * 0.2 +
    COALESCE(v_cancellation_score, 0) * 0.1
  ) * 100;
  
  RETURN v_quality_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULED JOBS (Run these via cron or pg_cron)
-- =====================================================

-- Daily: Refresh materialized views
-- Run: SELECT refresh_category_performance();
-- Run: SELECT refresh_location_performance();

-- Daily: Update category demand stats
-- This should be run via a cron job or application scheduler

-- Weekly: Calculate provider quality scores
-- Run: UPDATE provider_metrics SET quality_score = calculate_provider_quality_score(user_id);

-- =====================================================
-- SAMPLE QUERIES for Intelligence Dashboard
-- =====================================================

-- Query 1: Demand Gap Analysis
/*
SELECT 
  c.name as category,
  COUNT(t.id) as task_requests,
  COUNT(DISTINCT tn.helper_id) as available_helpers,
  CASE 
    WHEN COUNT(t.id) - COUNT(DISTINCT tn.helper_id) > 50 THEN 'HIGH'
    WHEN COUNT(t.id) - COUNT(DISTINCT tn.helper_id) > 20 THEN 'MODERATE'
    ELSE 'LOW'
  END as demand_gap,
  AVG(t.price) as avg_budget,
  a.name || ', ' || city.name as location
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
LEFT JOIN task_negotiations tn ON t.id = tn.task_id
LEFT JOIN areas a ON t.area_id = a.id
LEFT JOIN cities city ON a.city_id = city.id
GROUP BY c.id, c.name, a.name, city.name
ORDER BY (COUNT(t.id) - COUNT(DISTINCT tn.helper_id)) DESC
LIMIT 10;
*/

-- Query 2: Top Performing Helpers
/*
SELECT 
  p.name as helper_name,
  pm.total_tasks_completed,
  pm.avg_rating,
  pm.quality_score,
  pm.completion_rate
FROM provider_metrics pm
JOIN profiles p ON pm.user_id = p.id
WHERE pm.total_tasks_completed > 0
ORDER BY pm.quality_score DESC
LIMIT 20;
*/

-- Query 3: Search Intent Analysis
/*
SELECT 
  search_keyword,
  COUNT(*) as search_count,
  COUNT(CASE WHEN task_posted_after THEN 1 END) as tasks_posted,
  ROUND(
    COUNT(CASE WHEN task_posted_after THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100, 
    2
  ) as conversion_rate
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY search_keyword
ORDER BY search_count DESC
LIMIT 20;
*/

-- =====================================================
-- PERMISSIONS
-- Grant necessary permissions for the analytics tables
-- =====================================================

-- Grant read access to authenticated users (if using RLS)
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;

-- Create policies for admin-only access
CREATE POLICY "Admin full access to search_logs" ON search_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admin full access to user_activity_events" ON user_activity_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admin full access to task_analytics" ON task_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- END OF SETUP
-- =====================================================

-- To implement these features:
-- 1. Run this SQL file in your Supabase SQL editor
-- 2. Set up cron jobs to refresh materialized views daily
-- 3. Implement frontend tracking to populate search_logs and user_activity_events
-- 4. Update application code to track task analytics and provider metrics
-- 5. The Marketplace Intelligence dashboard will automatically use this data