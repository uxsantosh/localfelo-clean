-- Check what's currently in your areas table
SELECT * FROM areas ORDER BY city_id, id;

-- Count by city
SELECT city_id, COUNT(*) as area_count 
FROM areas 
GROUP BY city_id 
ORDER BY city_id;
