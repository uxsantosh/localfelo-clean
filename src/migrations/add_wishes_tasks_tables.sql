-- =====================================================
-- OldCycle MVP Features - Wishes & Tasks Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. WISHES TABLE (Wish Anything Feature)
-- =====================================================
CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  city_id TEXT NOT NULL REFERENCES cities(id),
  area_id TEXT NOT NULL REFERENCES areas(id),
  budget_min NUMERIC,
  budget_max NUMERIC,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  has_whatsapp BOOLEAN DEFAULT true,
  user_id UUID NOT NULL,
  exact_location TEXT, -- Google Maps deep link
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_token TEXT NOT NULL, -- For soft-auth ownership verification
  client_token TEXT NOT NULL -- For identifying the creator
);

-- Indexes for wishes
CREATE INDEX IF NOT EXISTS idx_wishes_category ON wishes(category_id);
CREATE INDEX IF NOT EXISTS idx_wishes_city ON wishes(city_id);
CREATE INDEX IF NOT EXISTS idx_wishes_area ON wishes(area_id);
CREATE INDEX IF NOT EXISTS idx_wishes_user ON wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_owner_token ON wishes(owner_token);
CREATE INDEX IF NOT EXISTS idx_wishes_client_token ON wishes(client_token);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_hidden ON wishes(is_hidden) WHERE is_hidden = false;

-- =====================================================
-- 2. TASKS TABLE (Service Tasks with Price)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  city_id TEXT NOT NULL REFERENCES cities(id),
  area_id TEXT NOT NULL REFERENCES areas(id),
  price NUMERIC NOT NULL,
  is_negotiable BOOLEAN DEFAULT false,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  has_whatsapp BOOLEAN DEFAULT true,
  user_id UUID NOT NULL,
  exact_location TEXT, -- Google Maps deep link
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_token TEXT NOT NULL, -- For soft-auth ownership verification
  client_token TEXT NOT NULL -- For identifying the creator
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_city ON tasks(city_id);
CREATE INDEX IF NOT EXISTS idx_tasks_area ON tasks(area_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_token ON tasks(owner_token);
CREATE INDEX IF NOT EXISTS idx_tasks_client_token ON tasks(client_token);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_hidden ON tasks(is_hidden) WHERE is_hidden = false;

-- =====================================================
-- 3. RLS POLICIES FOR WISHES
-- =====================================================

-- Enable RLS
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-hidden wishes
CREATE POLICY "Anyone can view non-hidden wishes"
  ON wishes FOR SELECT
  USING (is_hidden = false);

-- Users can create wishes (soft-auth friendly)
CREATE POLICY "Anyone can create wishes"
  ON wishes FOR INSERT
  WITH CHECK (true);

-- Users can update their own wishes using owner_token
CREATE POLICY "Users can update own wishes"
  ON wishes FOR UPDATE
  USING (owner_token = current_setting('request.headers')::json->>'x-owner-token');

-- Users can delete their own wishes using owner_token
CREATE POLICY "Users can delete own wishes"
  ON wishes FOR DELETE
  USING (owner_token = current_setting('request.headers')::json->>'x-owner-token');

-- =====================================================
-- 4. RLS POLICIES FOR TASKS
-- =====================================================

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-hidden tasks
CREATE POLICY "Anyone can view non-hidden tasks"
  ON tasks FOR SELECT
  USING (is_hidden = false);

-- Users can create tasks (soft-auth friendly)
CREATE POLICY "Anyone can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

-- Users can update their own tasks using owner_token
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (owner_token = current_setting('request.headers')::json->>'x-owner-token');

-- Users can delete their own tasks using owner_token
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (owner_token = current_setting('request.headers')::json->>'x-owner-token');

-- =====================================================
-- 5. REPORTS TABLES FOR WISHES & TASKS
-- =====================================================

CREATE TABLE IF NOT EXISTS wish_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id UUID NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wish_reports_wish_id ON wish_reports(wish_id);
CREATE INDEX IF NOT EXISTS idx_task_reports_task_id ON task_reports(task_id);

-- Enable RLS for reports
ALTER TABLE wish_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can create reports
CREATE POLICY "Anyone can create wish reports"
  ON wish_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create task reports"
  ON task_reports FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Your wishes and tasks tables are ready!
-- You can now:
-- 1. Create wishes (users looking for items/services)
-- 2. Create tasks (users offering services)
-- 3. Report inappropriate content
-- 4. Use Google Maps deep links for locations
-- =====================================================
