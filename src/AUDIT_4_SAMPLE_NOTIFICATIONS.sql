-- ================================================================
-- COMPREHENSIVE AUDIT: Sample Notifications Data
-- ================================================================
-- Shows what actual notification records look like
-- ================================================================

-- Get recent notifications to see data structure
SELECT 
  id,
  user_id,
  title,
  body,
  message,
  notification_type,
  type,
  data,
  related_id,
  related_type,
  status,
  is_read,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 20;
