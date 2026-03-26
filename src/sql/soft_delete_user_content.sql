-- =====================================================
-- SOFT DELETE USER CONTENT
-- When a user deletes their account, hide all their content
-- from public view but keep it in database for records
-- =====================================================

-- Function to soft delete all user content
CREATE OR REPLACE FUNCTION soft_delete_user_content(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  listings_count INTEGER;
  tasks_count INTEGER;
  wishes_count INTEGER;
BEGIN
  -- Soft delete all user's listings
  UPDATE listings
  SET 
    is_active = false,
    is_hidden = true,
    updated_at = NOW()
  WHERE owner_token IN (
    SELECT owner_token FROM profiles WHERE id = user_uuid
  );
  
  GET DIAGNOSTICS listings_count = ROW_COUNT;
  
  -- Soft delete all user's tasks
  UPDATE tasks
  SET 
    status = 'deleted',
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  GET DIAGNOSTICS tasks_count = ROW_COUNT;
  
  -- Soft delete all user's wishes
  UPDATE wishes
  SET 
    status = 'deleted',
    is_hidden = true,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  GET DIAGNOSTICS wishes_count = ROW_COUNT;
  
  -- Return summary
  RETURN json_build_object(
    'success', true,
    'listings_hidden', listings_count,
    'tasks_hidden', tasks_count,
    'wishes_hidden', wishes_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT soft_delete_user_content('user-uuid-here');
