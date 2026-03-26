-- =====================================================
-- ADD FOREIGN KEY RELATIONSHIP FOR SHOPS
-- =====================================================
-- Optional: Adds foreign key constraint between shops and profiles
-- This improves query performance and data integrity

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shops_user_id_fkey'
    ) THEN
        ALTER TABLE shops
        ADD CONSTRAINT shops_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint shops_user_id_fkey created successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint shops_user_id_fkey already exists';
    END IF;
END $$;

-- Add index for faster joins
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);

COMMENT ON CONSTRAINT shops_user_id_fkey ON shops IS 'Ensures shop owner exists in profiles table';
