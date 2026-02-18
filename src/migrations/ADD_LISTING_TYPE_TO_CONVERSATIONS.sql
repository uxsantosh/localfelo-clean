-- =====================================================
-- Add listingType column to conversations table
-- =====================================================
-- This migration adds the listingType field to properly categorize
-- conversations as 'listing', 'wish', or 'task'
-- Run this in Supabase SQL Editor FIRST
-- =====================================================

-- Step 1: Check current schema
-- Run this to see what data type listing_id currently is:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'conversations' AND column_name = 'listing_id';

-- Step 2: Add listingType column with default value 'listing'
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS listingType TEXT DEFAULT 'listing';

-- Step 3: Add check constraint to ensure valid values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'conversations_listingtype_check'
    ) THEN
        ALTER TABLE public.conversations
        ADD CONSTRAINT conversations_listingtype_check 
        CHECK (listingType IN ('listing', 'wish', 'task'));
    END IF;
END $$;

-- Step 4: Update existing conversations to set listingType
-- This handles both TEXT and UUID listing_id types
UPDATE public.conversations
SET listingType = CASE
  -- If listing_id is TEXT and has prefixes
  WHEN listing_id::text LIKE 'wish_%' THEN 'wish'
  WHEN listing_id::text LIKE 'task_%' THEN 'task'
  -- Otherwise it's a listing (or already a UUID)
  ELSE 'listing'
END
WHERE listingType = 'listing';

-- Step 5: Create index for faster filtering by listingType
CREATE INDEX IF NOT EXISTS idx_conversations_listingtype 
ON public.conversations(listingType);

-- Step 6: Verify the changes
-- Run this after the migration to check:
-- SELECT id, listing_id, listingType, created_at 
-- FROM conversations 
-- ORDER BY created_at DESC 
-- LIMIT 5;

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Now the conversations table can properly store and query by listing type
-- All new conversations created from code will have the correct listingType