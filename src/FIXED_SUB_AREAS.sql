-- =====================================================
-- SAFE SUB-AREAS INSERT - Uses Area Names Not IDs
-- This will work regardless of your area ID structure
-- =====================================================

-- BANGALORE SUB-AREAS
-- Using subqueries to find area IDs by name

-- Koramangala
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-koramangala-1st-block' as id,
  a.id as area_id,
  '1st Block' as name,
  'bangalore-koramangala-1st-block' as slug,
  12.9352 as latitude,
  77.6245 as longitude,
  'Forum Mall' as landmark
FROM areas a
INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Koramangala'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-koramangala-2nd-block',
  a.id, '2nd Block', 'bangalore-koramangala-2nd-block',
  12.9279, 77.6271, 'Jyoti Nivas College'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Koramangala'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-koramangala-3rd-block',
  a.id, '3rd Block', 'bangalore-koramangala-3rd-block',
  12.9271, 77.6227, '80 Feet Road'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Koramangala'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-koramangala-4th-block',
  a.id, '4th Block', 'bangalore-koramangala-4th-block',
  12.9363, 77.6278, 'Kormangala Club'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Koramangala'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-koramangala-5th-block',
  a.id, '5th Block', 'bangalore-koramangala-5th-block',
  12.9308, 77.6213, 'BDA Complex'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Koramangala'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-koramangala-6th-block',
  a.id, '6th Block', 'bangalore-koramangala-6th-block',
  12.9387, 77.6120, 'Koramangala Indoor Stadium'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Koramangala'
ON CONFLICT (id) DO NOTHING;

-- BTM Layout
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-btm-1st-stage',
  a.id, '1st Stage', 'bangalore-btm-1st-stage',
  12.9116, 77.6103, 'Udupi Garden'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'BTM Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-btm-2nd-stage',
  a.id, '2nd Stage', 'bangalore-btm-2nd-stage',
  12.9165, 77.6101, 'Madiwala Market'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'BTM Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-btm-29th-main',
  a.id, '29th Main Road', 'bangalore-btm-29th-main',
  12.9122, 77.6084, 'Udupi Garden'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'BTM Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-btm-30th-main',
  a.id, '30th Main Road', 'bangalore-btm-30th-main',
  12.9089, 77.6096, 'Forum Value Mall'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'BTM Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-btm-6th-main',
  a.id, '6th Main Road', 'bangalore-btm-6th-main',
  12.9178, 77.6124, 'Bank Colony'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'BTM Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-btm-16th-main',
  a.id, '16th Main Road', 'bangalore-btm-16th-main',
  12.9143, 77.6089, 'Silk Board'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'BTM Layout'
ON CONFLICT (id) DO NOTHING;

-- HSR Layout
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-hsr-sector-1',
  a.id, 'Sector 1', 'bangalore-hsr-sector-1',
  12.9116, 77.6388, '27th Main Road'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'HSR Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-hsr-sector-2',
  a.id, 'Sector 2', 'bangalore-hsr-sector-2',
  12.9080, 77.6470, 'Agara Lake'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'HSR Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-hsr-sector-3',
  a.id, 'Sector 3', 'bangalore-hsr-sector-3',
  12.9038, 77.6400, 'Souk'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'HSR Layout'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-hsr-sector-4',
  a.id, 'Sector 4', 'bangalore-hsr-sector-4',
  12.9094, 77.6415, 'HSR Club'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'HSR Layout'
ON CONFLICT (id) DO NOTHING;

-- Indiranagar
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-indiranagar-100ft',
  a.id, '100 Feet Road', 'bangalore-indiranagar-100ft',
  12.9716, 77.6393, 'Indiranagar Metro'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Indiranagar'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-indiranagar-12th-main',
  a.id, '12th Main Road', 'bangalore-indiranagar-12th-main',
  12.9782, 77.6383, 'Indiranagar Club'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Indiranagar'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-indiranagar-80ft',
  a.id, '80 Feet Road', 'bangalore-indiranagar-80ft',
  12.9741, 77.6432, 'Toit Brewpub'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Indiranagar'
ON CONFLICT (id) DO NOTHING;

-- Whitefield
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-whitefield-itpl',
  a.id, 'ITPL Main Road', 'bangalore-whitefield-itpl',
  12.9855, 77.7290, 'ITPL'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Whitefield'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'bangalore-whitefield-marathahalli',
  a.id, 'Marathahalli Bridge', 'bangalore-whitefield-marathahalli',
  12.9592, 77.7013, 'Innovative Multiplex'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Bangalore' AND a.name = 'Whitefield'
ON CONFLICT (id) DO NOTHING;

-- HYDERABAD SUB-AREAS

-- Hitech City
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'hyderabad-hitech-cyber-towers',
  a.id, 'Cyber Towers', 'hyderabad-hitech-cyber-towers',
  17.4478, 78.3801, 'Cyber Towers'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Hyderabad' AND a.name = 'Hitech City'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'hyderabad-hitech-mindspace',
  a.id, 'Mindspace', 'hyderabad-hitech-mindspace',
  17.4450, 78.3789, 'Mindspace IT Park'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Hyderabad' AND a.name = 'Hitech City'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'hyderabad-hitech-madhapur',
  a.id, 'Madhapur', 'hyderabad-hitech-madhapur',
  17.4484, 78.3908, 'Madhapur Circle'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Hyderabad' AND a.name = 'Hitech City'
ON CONFLICT (id) DO NOTHING;

-- Gachibowli
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'hyderabad-gachibowli-isb',
  a.id, 'ISB Road', 'hyderabad-gachibowli-isb',
  17.4239, 78.3329, 'ISB Campus'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Hyderabad' AND a.name = 'Gachibowli'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'hyderabad-gachibowli-financial',
  a.id, 'Financial District', 'hyderabad-gachibowli-financial',
  17.4102, 78.3420, 'Nanakramguda'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Hyderabad' AND a.name = 'Gachibowli'
ON CONFLICT (id) DO NOTHING;

-- MUMBAI SUB-AREAS

-- Andheri
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'mumbai-andheri-lokhandwala',
  a.id, 'Lokhandwala', 'mumbai-andheri-lokhandwala',
  19.1407, 72.8332, 'Lokhandwala Complex'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Mumbai' AND a.name = 'Andheri'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'mumbai-andheri-versova',
  a.id, 'Versova', 'mumbai-andheri-versova',
  19.1314, 72.8082, 'Versova Beach'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Mumbai' AND a.name = 'Andheri'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'mumbai-andheri-jb-nagar',
  a.id, 'JB Nagar', 'mumbai-andheri-jb-nagar',
  19.1024, 72.8697, 'Chakala Metro'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Mumbai' AND a.name = 'Andheri'
ON CONFLICT (id) DO NOTHING;

-- Bandra
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'mumbai-bandra-bkc',
  a.id, 'BKC', 'mumbai-bandra-bkc',
  19.0606, 72.8688, 'Bandra Kurla Complex'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Mumbai' AND a.name = 'Bandra'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'mumbai-bandra-linking-road',
  a.id, 'Linking Road', 'mumbai-bandra-linking-road',
  19.0552, 72.8265, 'Linking Road'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Mumbai' AND a.name = 'Bandra'
ON CONFLICT (id) DO NOTHING;

-- Powai
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'mumbai-powai-hiranandani',
  a.id, 'Hiranandani Gardens', 'mumbai-powai-hiranandani',
  19.1176, 72.9114, 'Galleria Mall'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Mumbai' AND a.name = 'Powai'
ON CONFLICT (id) DO NOTHING;

-- PUNE SUB-AREAS

-- Hinjewadi
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'pune-hinjewadi-phase-1',
  a.id, 'Phase 1', 'pune-hinjewadi-phase-1',
  18.5912, 73.7396, 'Infosys Hinjewadi'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Pune' AND a.name = 'Hinjewadi'
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'pune-hinjewadi-phase-2',
  a.id, 'Phase 2', 'pune-hinjewadi-phase-2',
  18.5838, 73.7274, 'TCS Phase 2'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Pune' AND a.name = 'Hinjewadi'
ON CONFLICT (id) DO NOTHING;

-- Koregaon Park
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'pune-koregaon-park-north-main',
  a.id, 'North Main Road', 'pune-koregaon-park-north-main',
  18.5433, 73.8938, 'German Bakery'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Pune' AND a.name = 'Koregaon Park'
ON CONFLICT (id) DO NOTHING;

-- CHENNAI SUB-AREAS

-- Anna Nagar
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'chennai-anna-nagar-2nd-avenue',
  a.id, '2nd Avenue', 'chennai-anna-nagar-2nd-avenue',
  18.0854, 80.2174, 'Anna Nagar'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Chennai' AND a.name = 'Anna Nagar'
ON CONFLICT (id) DO NOTHING;

-- T Nagar
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark)
SELECT 
  'chennai-t-nagar-ranganathan',
  a.id, 'Ranganathan Street', 'chennai-t-nagar-ranganathan',
  13.0418, 80.2341, 'Ranganathan Street'
FROM areas a INNER JOIN cities c ON a.city_id = c.id
WHERE c.name = 'Chennai' AND a.name = 'T Nagar'
ON CONFLICT (id) DO NOTHING;

-- Verification: Count sub-areas added
SELECT 
  c.name as city,
  a.name as area,
  COUNT(sa.id) as sub_area_count
FROM sub_areas sa
JOIN areas a ON sa.area_id = a.id
JOIN cities c ON a.city_id = c.id
GROUP BY c.name, a.name
ORDER BY c.name, a.name;

SELECT '✅ Sub-areas added successfully! Check counts above.' as status;
