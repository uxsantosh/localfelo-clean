-- Get complete list of ALL areas in database
-- This will help us create sub-areas for every single one

SELECT 
  c.name as city,
  a.id as area_id,
  a.name as area_name,
  a.city_id
FROM areas a
JOIN cities c ON a.city_id = c.id
ORDER BY c.name, a.name;

-- Export this to a file so we can work with it
