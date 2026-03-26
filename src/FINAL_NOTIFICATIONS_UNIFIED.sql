-- =====================================================
-- SECTION 1: Add New Columns to Notifications Table
-- =====================================================

-- Add related_type column (which module: listing, wish, task, professional)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_type') THEN
    ALTER TABLE notifications ADD COLUMN related_type TEXT;
    RAISE NOTICE '✅ Added related_type column to notifications';
  ELSE
    RAISE NOTICE 'ℹ️ Column related_type already exists';
  END IF;
END $$;

-- Add related_id column (ID of the item in that module)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_id') THEN
    ALTER TABLE notifications ADD COLUMN related_id TEXT;
    RAISE NOTICE '✅ Added related_id column to notifications';
  ELSE
    RAISE NOTICE 'ℹ️ Column related_id already exists';
  END IF;
END $$;

-- Add action_label column (for button text)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_label') THEN
    ALTER TABLE notifications ADD COLUMN action_label TEXT;
    RAISE NOTICE '✅ Added action_label column to notifications';
  ELSE
    RAISE NOTICE 'ℹ️ Column action_label already exists';
  END IF;
END $$;

-- Add metadata column (for additional data as JSONB)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
    ALTER TABLE notifications ADD COLUMN metadata JSONB;
    RAISE NOTICE '✅ Added metadata column to notifications';
  ELSE
    RAISE NOTICE 'ℹ️ Column metadata already exists';
  END IF;
END $$;

-- =====================================================
-- SECTION 2: Migrate Existing Notification Data
-- =====================================================

-- Update existing notifications to populate related_type and related_id based on their type
DO $$
BEGIN
  -- For listing notifications
  UPDATE notifications 
  SET related_type = 'listing'
  WHERE type IN ('listing_message', 'listing_offer', 'listing_sold', 'listing_status_change', 'new_listing')
    AND related_type IS NULL;
  
  -- For wish notifications  
  UPDATE notifications
  SET related_type = 'wish'
  WHERE type IN ('wish_message', 'wish_offer', 'wish_fulfilled', 'wish_status_change', 'new_wish')
    AND related_type IS NULL;
  
  -- For task notifications
  UPDATE notifications
  SET related_type = 'task'
  WHERE type IN ('task_message', 'task_offer', 'task_accepted', 'task_completed', 'task_status_change', 'new_task')
    AND related_type IS NULL;
  
  -- For professional notifications
  UPDATE notifications
  SET related_type = 'professional'
  WHERE type IN ('professional_new_task', 'professional_new_wish', 'professional_match', 'new_professional')
    AND related_type IS NULL;
  
  -- For chat/message notifications (keep as NULL or 'chat')
  UPDATE notifications
  SET related_type = 'chat'
  WHERE type IN ('message', 'chat_message', 'new_message')
    AND related_type IS NULL;
  
  -- For system notifications
  UPDATE notifications
  SET related_type = 'system'
  WHERE type IN ('system', 'admin_broadcast', 'welcome')
    AND related_type IS NULL;
  
  RAISE NOTICE '✅ Migrated existing notification data to new schema';
END $$;

-- =====================================================
-- SECTION 3: Add Constraints (FLEXIBLE - allows any type)
-- =====================================================

-- Drop existing constraint if it exists (we'll make it more flexible)
DO $$
BEGIN
  -- Drop old constraint if exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'notifications_type_check' 
             AND table_name = 'notifications') THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
    RAISE NOTICE '✅ Dropped old notifications_type_check constraint (will not re-add - too restrictive)';
  ELSE
    RAISE NOTICE 'ℹ��� No notifications_type_check constraint found';
  END IF;
  
  -- NOTE: We're NOT adding the constraint back because:
  -- 1. Your database may have custom notification types we don't know about
  -- 2. The constraint is too restrictive and prevents flexibility
  -- 3. Application-level validation is better for this use case
  
  RAISE NOTICE '✅ Notifications table constraints updated (flexible mode)';
END $$;

-- =====================================================
-- SECTION 4: Create Notification Details View
-- =====================================================

-- Create view that enriches notifications with item details
CREATE OR REPLACE VIEW notification_details AS
SELECT 
  n.id,
  n.user_id,
  n.title,
  n.message,
  n.body,
  n.type,
  n.notification_type,
  n.related_type,
  n.related_id,
  n.action_url,
  n.action_label,
  n.is_read,
  n.status,
  n.created_at,
  n.sent_at,
  n.data,
  n.metadata,
  -- Add item-specific details based on related_type
  CASE 
    WHEN n.related_type = 'listing' THEN (
      SELECT jsonb_build_object(
        'item_title', l.title,
        'item_price', l.price,
        'item_city', l.city
      )
      FROM listings l
      WHERE l.id::text = n.related_id
    )
    WHEN n.related_type = 'wish' THEN (
      SELECT jsonb_build_object(
        'item_title', w.title,
        'item_budget_min', w.budget_min,
        'item_budget_max', w.budget_max,
        'item_city', c.name,
        'item_urgency', w.urgency
      )
      FROM wishes w
      LEFT JOIN cities c ON c.id = w.city_id
      WHERE w.id::text = n.related_id
    )
    WHEN n.related_type = 'task' THEN (
      SELECT jsonb_build_object(
        'item_title', t.title,
        'item_price', t.price,
        'item_city', c.name,
        'item_status', t.status
      )
      FROM tasks t
      LEFT JOIN cities c ON c.id = t.city_id
      WHERE t.id::text = n.related_id
    )
    WHEN n.related_type = 'professional' THEN (
      SELECT jsonb_build_object(
        'item_title', p.title,
        'item_name', p.name,
        'item_role', r.name,
        'item_city', p.city
      )
      FROM professionals p
      LEFT JOIN roles r ON r.id = p.role_id
      WHERE p.id::text = n.related_id
    )
    ELSE NULL
  END as item_details
FROM notifications n;

-- =====================================================
-- SECTION 5: Create Helper Functions
-- =====================================================

-- Function to get unread notifications count by module for a user
CREATE OR REPLACE FUNCTION get_unread_notifications_by_module(p_user_id TEXT)
RETURNS TABLE (
  module TEXT,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(related_type, 'system') as module,
    COUNT(*) as unread_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false
  GROUP BY related_type
  ORDER BY unread_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 6: Create Indexes for Performance
-- =====================================================

-- Index for filtering notifications by related items
CREATE INDEX IF NOT EXISTS idx_notifications_related 
ON notifications(related_type, related_id);

-- Index for user's unread notifications by module
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_module 
ON notifications(user_id, is_read, related_type) 
WHERE is_read = false;

-- Index for notification routing (type + related)
CREATE INDEX IF NOT EXISTS idx_notifications_routing 
ON notifications(type, related_type, related_id);

-- =====================================================
-- SECTION 7: Add RLS Policies
-- =====================================================

-- Enable RLS on notifications table (if not already enabled)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY IF NOT EXISTS "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid()::text = user_id);

-- Policy: System can insert notifications for any user
CREATE POLICY IF NOT EXISTS "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '✅ ✅ ✅ NOTIFICATIONS MIGRATION COMPLETE! ✅ ✅ ✅';
  RAISE NOTICE 'ℹ️ Added columns: related_type, related_id, action_label, metadata';
  RAISE NOTICE 'ℹ️ Created view: notification_details';
  RAISE NOTICE 'ℹ️ Created function: get_unread_notifications_by_module';
  RAISE NOTICE 'ℹ️ Created indexes for performance';
  RAISE NOTICE 'ℹ️ Added RLS policies for security';
END $$;