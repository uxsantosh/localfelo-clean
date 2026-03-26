-- =====================================================
-- ADD SHOP TIMINGS & ADDITIONAL FIELDS TO SHOPS TABLE
-- =====================================================
-- Migration to add working hours and shop image fields
-- Run this after shops_migration.sql

-- Add week_timings column (JSONB for flexibility)
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS week_timings JSONB DEFAULT NULL;

-- Add shop_image_url column (main display image, separate from logo)
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS shop_image_url TEXT DEFAULT NULL;

-- Add index for faster queries on shops with timings
CREATE INDEX IF NOT EXISTS idx_shops_week_timings 
ON shops USING gin(week_timings) 
WHERE week_timings IS NOT NULL;

-- Example week_timings structure:
-- [
--   { "day": "Monday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
--   { "day": "Tuesday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
--   { "day": "Wednesday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
--   { "day": "Thursday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
--   { "day": "Friday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
--   { "day": "Saturday", "isOpen": true, "openTime": "10:00", "closeTime": "16:00" },
--   { "day": "Sunday", "isOpen": false, "openTime": "", "closeTime": "" }
-- ]

-- =====================================================
-- HELPER FUNCTION: Check if shop is currently open
-- =====================================================

CREATE OR REPLACE FUNCTION is_shop_open_now(
  shop_week_timings JSONB,
  current_timezone TEXT DEFAULT 'Asia/Kolkata'
) RETURNS BOOLEAN AS $$
DECLARE
  current_day TEXT;
  time_now TIME;
  day_timing JSONB;
  is_open BOOLEAN;
  open_time TIME;
  close_time TIME;
BEGIN
  -- Return false if no timings set
  IF shop_week_timings IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current day name (e.g., 'Monday', 'Tuesday')
  current_day := to_char(now() AT TIME ZONE current_timezone, 'Day');
  current_day := TRIM(current_day);
  
  -- Get current time
  time_now := (now() AT TIME ZONE current_timezone)::TIME;
  
  -- Find today's timing
  FOR day_timing IN SELECT * FROM jsonb_array_elements(shop_week_timings)
  LOOP
    IF day_timing->>'day' = current_day THEN
      is_open := (day_timing->>'isOpen')::BOOLEAN;
      
      IF NOT is_open THEN
        RETURN FALSE;
      END IF;
      
      open_time := (day_timing->>'openTime')::TIME;
      close_time := (day_timing->>'closeTime')::TIME;
      
      -- Check if current time is between open and close
      RETURN time_now >= open_time AND time_now <= close_time;
    END IF;
  END LOOP;
  
  -- Default to false if day not found
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if columns were added
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'shops' AND column_name IN ('week_timings', 'shop_image_url');

-- Test is_shop_open_now function
-- SELECT shop_name, is_shop_open_now(week_timings) as is_open_now
-- FROM shops
-- WHERE week_timings IS NOT NULL;