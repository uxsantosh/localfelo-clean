-- =====================================================
-- ADD SLUG COLUMN TO AREAS TABLE (IF MISSING)
-- =====================================================
-- This is needed for the 3-level location system
-- =====================================================

-- 1. Add slug column if it doesn't exist
ALTER TABLE areas ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Generate slug from name for existing areas
UPDATE areas 
SET slug = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(name, ' ', '-'),
      ',', ''
    ),
    '.', ''
  )
)
WHERE slug IS NULL OR slug = '';

-- 3. Make slug NOT NULL after populating
ALTER TABLE areas ALTER COLUMN slug SET NOT NULL;

-- 4. Add unique constraint on city_id + slug
ALTER TABLE areas DROP CONSTRAINT IF EXISTS areas_city_id_slug_key;
ALTER TABLE areas ADD CONSTRAINT areas_city_id_slug_key UNIQUE (city_id, slug);

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_areas_slug ON areas(slug);

-- 6. Verify
SELECT 
  id, 
  name, 
  slug,
  city_id
FROM areas
ORDER BY city_id, name
LIMIT 20;

-- =====================================================
-- Expected Output:
-- =====================================================
-- id              | name           | slug            | city_id
-- ----------------|----------------|-----------------|----------
-- area-andheri    | Andheri        | andheri         | city-1
-- area-btm-layout | BTM Layout     | btm-layout      | city-2
-- area-koramangala| Koramangala    | koramangala     | city-2
-- ...
