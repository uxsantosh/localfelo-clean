-- OldCycle: Complete Indian Cities & Areas Database Seed
-- 
-- ⚠️ IMPORTANT: Run the migration script FIRST!
-- 1. First run: supabase-migration-fix-locations.sql
-- 2. Then run: this file (supabase-seed-cities-areas.sql)
--
-- This script populates all major Indian cities and areas

-- ========================================
-- CLEAR EXISTING DATA (Fresh Start)
-- ========================================
-- Safe to run multiple times - will clear and repopulate data
TRUNCATE TABLE areas CASCADE;
TRUNCATE TABLE cities CASCADE;

-- ========================================
-- STEP 1: INSERT CITIES
-- ========================================

INSERT INTO cities (id, name) VALUES
-- Tier 1 Cities (Metro)
('mumbai', 'Mumbai'),
('delhi', 'Delhi'),
('bangalore', 'Bangalore'),
('hyderabad', 'Hyderabad'),
('pune', 'Pune'),
('kolkata', 'Kolkata'),
('chennai', 'Chennai'),

-- Tier 2 Cities (Major)
('ahmedabad', 'Ahmedabad'),
('jaipur', 'Jaipur'),
('surat', 'Surat'),
('lucknow', 'Lucknow'),
('chandigarh', 'Chandigarh'),
('kochi', 'Kochi'),
('indore', 'Indore'),
('nagpur', 'Nagpur'),
('bhopal', 'Bhopal'),
('visakhapatnam', 'Visakhapatnam'),
('patna', 'Patna'),
('coimbatore', 'Coimbatore'),
('thiruvananthapuram', 'Thiruvananthapuram'),
('vadodara', 'Vadodara'),
('guwahati', 'Guwahati'),
('bhubaneswar', 'Bhubaneswar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ========================================
-- STEP 2: INSERT AREAS
-- ========================================

-- MUMBAI (30 areas)
INSERT INTO areas (id, city_id, name) VALUES
('mumbai-andheri-east', 'mumbai', 'Andheri East'),
('mumbai-andheri-west', 'mumbai', 'Andheri West'),
('mumbai-bandra-east', 'mumbai', 'Bandra East'),
('mumbai-bandra-west', 'mumbai', 'Bandra West'),
('mumbai-borivali-east', 'mumbai', 'Borivali East'),
('mumbai-borivali-west', 'mumbai', 'Borivali West'),
('mumbai-chembur', 'mumbai', 'Chembur'),
('mumbai-colaba', 'mumbai', 'Colaba'),
('mumbai-dadar', 'mumbai', 'Dadar'),
('mumbai-ghatkopar', 'mumbai', 'Ghatkopar'),
('mumbai-goregaon', 'mumbai', 'Goregaon'),
('mumbai-juhu', 'mumbai', 'Juhu'),
('mumbai-kandivali', 'mumbai', 'Kandivali'),
('mumbai-kurla', 'mumbai', 'Kurla'),
('mumbai-malad', 'mumbai', 'Malad'),
('mumbai-marine-lines', 'mumbai', 'Marine Lines'),
('mumbai-mulund', 'mumbai', 'Mulund'),
('mumbai-navi-mumbai', 'mumbai', 'Navi Mumbai'),
('mumbai-powai', 'mumbai', 'Powai'),
('mumbai-santa-cruz', 'mumbai', 'Santa Cruz'),
('mumbai-thane', 'mumbai', 'Thane'),
('mumbai-vasai', 'mumbai', 'Vasai'),
('mumbai-virar', 'mumbai', 'Virar'),
('mumbai-worli', 'mumbai', 'Worli'),
('mumbai-lower-parel', 'mumbai', 'Lower Parel'),
('mumbai-vile-parle', 'mumbai', 'Vile Parle'),
('mumbai-bhandup', 'mumbai', 'Bhandup'),
('mumbai-khar', 'mumbai', 'Khar'),
('mumbai-santacruz', 'mumbai', 'Santacruz'),
('mumbai-versova', 'mumbai', 'Versova')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- DELHI (30 areas)
INSERT INTO areas (id, city_id, name) VALUES
('delhi-connaught-place', 'delhi', 'Connaught Place'),
('delhi-saket', 'delhi', 'Saket'),
('delhi-dwarka', 'delhi', 'Dwarka'),
('delhi-rohini', 'delhi', 'Rohini'),
('delhi-lajpat-nagar', 'delhi', 'Lajpat Nagar'),
('delhi-karol-bagh', 'delhi', 'Karol Bagh'),
('delhi-vasant-kunj', 'delhi', 'Vasant Kunj'),
('delhi-mayur-vihar', 'delhi', 'Mayur Vihar'),
('delhi-janakpuri', 'delhi', 'Janakpuri'),
('delhi-pitampura', 'delhi', 'Pitampura'),
('delhi-south-extension', 'delhi', 'South Extension'),
('delhi-greater-kailash', 'delhi', 'Greater Kailash'),
('delhi-hauz-khas', 'delhi', 'Hauz Khas'),
('delhi-nehru-place', 'delhi', 'Nehru Place'),
('delhi-rajouri-garden', 'delhi', 'Rajouri Garden'),
('delhi-punjabi-bagh', 'delhi', 'Punjabi Bagh'),
('delhi-uttam-nagar', 'delhi', 'Uttam Nagar'),
('delhi-preet-vihar', 'delhi', 'Preet Vihar'),
('delhi-paschim-vihar', 'delhi', 'Paschim Vihar'),
('delhi-shahdara', 'delhi', 'Shahdara'),
('delhi-tilak-nagar', 'delhi', 'Tilak Nagar'),
('delhi-malviya-nagar', 'delhi', 'Malviya Nagar'),
('delhi-kalkaji', 'delhi', 'Kalkaji'),
('delhi-east-of-kailash', 'delhi', 'East of Kailash'),
('delhi-noida', 'delhi', 'Noida'),
('delhi-gurgaon', 'delhi', 'Gurgaon'),
('delhi-faridabad', 'delhi', 'Faridabad'),
('delhi-ghaziabad', 'delhi', 'Ghaziabad'),
('delhi-shalimar-bagh', 'delhi', 'Shalimar Bagh'),
('delhi-model-town', 'delhi', 'Model Town')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- BANGALORE (30 areas)
INSERT INTO areas (id, city_id, name) VALUES
('bangalore-koramangala', 'bangalore', 'Koramangala'),
('bangalore-whitefield', 'bangalore', 'Whitefield'),
('bangalore-indiranagar', 'bangalore', 'Indiranagar'),
('bangalore-hsr-layout', 'bangalore', 'HSR Layout'),
('bangalore-electronic-city', 'bangalore', 'Electronic City'),
('bangalore-btm-layout', 'bangalore', 'BTM Layout'),
('bangalore-jayanagar', 'bangalore', 'Jayanagar'),
('bangalore-marathahalli', 'bangalore', 'Marathahalli'),
('bangalore-bellandur', 'bangalore', 'Bellandur'),
('bangalore-sarjapur-road', 'bangalore', 'Sarjapur Road'),
('bangalore-hebbal', 'bangalore', 'Hebbal'),
('bangalore-yeshwanthpur', 'bangalore', 'Yeshwanthpur'),
('bangalore-malleshwaram', 'bangalore', 'Malleshwaram'),
('bangalore-rajajinagar', 'bangalore', 'Rajajinagar'),
('bangalore-jp-nagar', 'bangalore', 'JP Nagar'),
('bangalore-banashankari', 'bangalore', 'Banashankari'),
('bangalore-bannerghatta-road', 'bangalore', 'Bannerghatta Road'),
('bangalore-mg-road', 'bangalore', 'MG Road'),
('bangalore-brigade-road', 'bangalore', 'Brigade Road'),
('bangalore-yelahanka', 'bangalore', 'Yelahanka'),
('bangalore-nagarbhavi', 'bangalore', 'Nagarbhavi'),
('bangalore-vijayanagar', 'bangalore', 'Vijayanagar'),
('bangalore-rt-nagar', 'bangalore', 'RT Nagar'),
('bangalore-kr-puram', 'bangalore', 'KR Puram'),
('bangalore-kadugodi', 'bangalore', 'Kadugodi'),
('bangalore-cv-raman-nagar', 'bangalore', 'CV Raman Nagar'),
('bangalore-basavanagudi', 'bangalore', 'Basavanagudi'),
('bangalore-kammanahalli', 'bangalore', 'Kammanahalli'),
('bangalore-ramamurthy-nagar', 'bangalore', 'Ramamurthy Nagar'),
('bangalore-kengeri', 'bangalore', 'Kengeri')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- HYDERABAD (25 areas)
INSERT INTO areas (id, city_id, name) VALUES
('hyderabad-hitech-city', 'hyderabad', 'Hitech City'),
('hyderabad-gachibowli', 'hyderabad', 'Gachibowli'),
('hyderabad-banjara-hills', 'hyderabad', 'Banjara Hills'),
('hyderabad-madhapur', 'hyderabad', 'Madhapur'),
('hyderabad-kondapur', 'hyderabad', 'Kondapur'),
('hyderabad-kukatpally', 'hyderabad', 'Kukatpally'),
('hyderabad-secunderabad', 'hyderabad', 'Secunderabad'),
('hyderabad-begumpet', 'hyderabad', 'Begumpet'),
('hyderabad-jubilee-hills', 'hyderabad', 'Jubilee Hills'),
('hyderabad-ameerpet', 'hyderabad', 'Ameerpet'),
('hyderabad-miyapur', 'hyderabad', 'Miyapur'),
('hyderabad-lb-nagar', 'hyderabad', 'LB Nagar'),
('hyderabad-dilsukhnagar', 'hyderabad', 'Dilsukhnagar'),
('hyderabad-uppal', 'hyderabad', 'Uppal'),
('hyderabad-manikonda', 'hyderabad', 'Manikonda'),
('hyderabad-charminar', 'hyderabad', 'Charminar'),
('hyderabad-kompally', 'hyderabad', 'Kompally'),
('hyderabad-shamshabad', 'hyderabad', 'Shamshabad'),
('hyderabad-attapur', 'hyderabad', 'Attapur'),
('hyderabad-toli-chowki', 'hyderabad', 'Toli Chowki'),
('hyderabad-nizampet', 'hyderabad', 'Nizampet'),
('hyderabad-bachupally', 'hyderabad', 'Bachupally'),
('hyderabad-mehdipatnam', 'hyderabad', 'Mehdipatnam'),
('hyderabad-sainikpuri', 'hyderabad', 'Sainikpuri'),
('hyderabad-as-rao-nagar', 'hyderabad', 'AS Rao Nagar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- PUNE (25 areas)
INSERT INTO areas (id, city_id, name) VALUES
('pune-koregaon-park', 'pune', 'Koregaon Park'),
('pune-hinjewadi', 'pune', 'Hinjewadi'),
('pune-viman-nagar', 'pune', 'Viman Nagar'),
('pune-kothrud', 'pune', 'Kothrud'),
('pune-wakad', 'pune', 'Wakad'),
('pune-baner', 'pune', 'Baner'),
('pune-aundh', 'pune', 'Aundh'),
('pune-kharadi', 'pune', 'Kharadi'),
('pune-hadapsar', 'pune', 'Hadapsar'),
('pune-shivajinagar', 'pune', 'Shivajinagar'),
('pune-pimpri-chinchwad', 'pune', 'Pimpri Chinchwad'),
('pune-camp', 'pune', 'Camp'),
('pune-deccan', 'pune', 'Deccan'),
('pune-kalyani-nagar', 'pune', 'Kalyani Nagar'),
('pune-magarpatta', 'pune', 'Magarpatta'),
('pune-katraj', 'pune', 'Katraj'),
('pune-warje', 'pune', 'Warje'),
('pune-bavdhan', 'pune', 'Bavdhan'),
('pune-pashan', 'pune', 'Pashan'),
('pune-pimple-saudagar', 'pune', 'Pimple Saudagar'),
('pune-talegaon', 'pune', 'Talegaon'),
('pune-chakan', 'pune', 'Chakan'),
('pune-nigdi', 'pune', 'Nigdi'),
('pune-akurdi', 'pune', 'Akurdi'),
('pune-undri', 'pune', 'Undri')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- KOLKATA (25 areas)
INSERT INTO areas (id, city_id, name) VALUES
('kolkata-salt-lake', 'kolkata', 'Salt Lake'),
('kolkata-park-street', 'kolkata', 'Park Street'),
('kolkata-ballygunge', 'kolkata', 'Ballygunge'),
('kolkata-new-town', 'kolkata', 'New Town'),
('kolkata-rajarhat', 'kolkata', 'Rajarhat'),
('kolkata-howrah', 'kolkata', 'Howrah'),
('kolkata-jadavpur', 'kolkata', 'Jadavpur'),
('kolkata-behala', 'kolkata', 'Behala'),
('kolkata-dum-dum', 'kolkata', 'Dum Dum'),
('kolkata-alipore', 'kolkata', 'Alipore'),
('kolkata-kasba', 'kolkata', 'Kasba'),
('kolkata-gariahat', 'kolkata', 'Gariahat'),
('kolkata-tollygunge', 'kolkata', 'Tollygunge'),
('kolkata-new-alipore', 'kolkata', 'New Alipore'),
('kolkata-garia', 'kolkata', 'Garia'),
('kolkata-baranagar', 'kolkata', 'Baranagar'),
('kolkata-uttarpara', 'kolkata', 'Uttarpara'),
('kolkata-barasat', 'kolkata', 'Barasat'),
('kolkata-kalyani', 'kolkata', 'Kalyani'),
('kolkata-naihati', 'kolkata', 'Naihati'),
('kolkata-serampore', 'kolkata', 'Serampore'),
('kolkata-chandannagar', 'kolkata', 'Chandannagar'),
('kolkata-bally', 'kolkata', 'Bally'),
('kolkata-barrackpore', 'kolkata', 'Barrackpore'),
('kolkata-bansdroni', 'kolkata', 'Bansdroni')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- CHENNAI (25 areas)
INSERT INTO areas (id, city_id, name) VALUES
('chennai-anna-nagar', 'chennai', 'Anna Nagar'),
('chennai-t-nagar', 'chennai', 'T Nagar'),
('chennai-velachery', 'chennai', 'Velachery'),
('chennai-adyar', 'chennai', 'Adyar'),
('chennai-porur', 'chennai', 'Porur'),
('chennai-tambaram', 'chennai', 'Tambaram'),
('chennai-omr', 'chennai', 'OMR'),
('chennai-nungambakkam', 'chennai', 'Nungambakkam'),
('chennai-mylapore', 'chennai', 'Mylapore'),
('chennai-guindy', 'chennai', 'Guindy'),
('chennai-chrompet', 'chennai', 'Chrompet'),
('chennai-pallavaram', 'chennai', 'Pallavaram'),
('chennai-perungudi', 'chennai', 'Perungudi'),
('chennai-sholinganallur', 'chennai', 'Sholinganallur'),
('chennai-thoraipakkam', 'chennai', 'Thoraipakkam'),
('chennai-ambattur', 'chennai', 'Ambattur'),
('chennai-avadi', 'chennai', 'Avadi'),
('chennai-madhavaram', 'chennai', 'Madhavaram'),
('chennai-villivakkam', 'chennai', 'Villivakkam'),
('chennai-kk-nagar', 'chennai', 'KK Nagar'),
('chennai-vadapalani', 'chennai', 'Vadapalani'),
('chennai-saidapet', 'chennai', 'Saidapet'),
('chennai-nanganallur', 'chennai', 'Nanganallur'),
('chennai-medavakkam', 'chennai', 'Medavakkam'),
('chennai-perambur', 'chennai', 'Perambur')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- AHMEDABAD (20 areas)
INSERT INTO areas (id, city_id, name) VALUES
('ahmedabad-satellite', 'ahmedabad', 'Satellite'),
('ahmedabad-vastrapur', 'ahmedabad', 'Vastrapur'),
('ahmedabad-bodakdev', 'ahmedabad', 'Bodakdev'),
('ahmedabad-sg-highway', 'ahmedabad', 'SG Highway'),
('ahmedabad-maninagar', 'ahmedabad', 'Maninagar'),
('ahmedabad-naranpura', 'ahmedabad', 'Naranpura'),
('ahmedabad-cg-road', 'ahmedabad', 'CG Road'),
('ahmedabad-bopal', 'ahmedabad', 'Bopal'),
('ahmedabad-gota', 'ahmedabad', 'Gota'),
('ahmedabad-chandkheda', 'ahmedabad', 'Chandkheda'),
('ahmedabad-prahlad-nagar', 'ahmedabad', 'Prahlad Nagar'),
('ahmedabad-thaltej', 'ahmedabad', 'Thaltej'),
('ahmedabad-ashram-road', 'ahmedabad', 'Ashram Road'),
('ahmedabad-navrangpura', 'ahmedabad', 'Navrangpura'),
('ahmedabad-jodhpur', 'ahmedabad', 'Jodhpur'),
('ahmedabad-vejalpur', 'ahmedabad', 'Vejalpur'),
('ahmedabad-ambawadi', 'ahmedabad', 'Ambawadi'),
('ahmedabad-paldi', 'ahmedabad', 'Paldi'),
('ahmedabad-ghatlodiya', 'ahmedabad', 'Ghatlodiya'),
('ahmedabad-sabarmati', 'ahmedabad', 'Sabarmati')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- JAIPUR (20 areas)
INSERT INTO areas (id, city_id, name) VALUES
('jaipur-malviya-nagar', 'jaipur', 'Malviya Nagar'),
('jaipur-vaishali-nagar', 'jaipur', 'Vaishali Nagar'),
('jaipur-c-scheme', 'jaipur', 'C Scheme'),
('jaipur-raja-park', 'jaipur', 'Raja Park'),
('jaipur-mansarovar', 'jaipur', 'Mansarovar'),
('jaipur-jagatpura', 'jaipur', 'Jagatpura'),
('jaipur-tonk-road', 'jaipur', 'Tonk Road'),
('jaipur-civil-lines', 'jaipur', 'Civil Lines'),
('jaipur-mi-road', 'jaipur', 'MI Road'),
('jaipur-ajmer-road', 'jaipur', 'Ajmer Road'),
('jaipur-bani-park', 'jaipur', 'Bani Park'),
('jaipur-pratap-nagar', 'jaipur', 'Pratap Nagar'),
('jaipur-sindhi-camp', 'jaipur', 'Sindhi Camp'),
('jaipur-sitapura', 'jaipur', 'Sitapura'),
('jaipur-sanganer', 'jaipur', 'Sanganer'),
('jaipur-jhotwara', 'jaipur', 'Jhotwara'),
('jaipur-nirman-nagar', 'jaipur', 'Nirman Nagar'),
('jaipur-sodala', 'jaipur', 'Sodala'),
('jaipur-murlipura', 'jaipur', 'Murlipura'),
('jaipur-vidhyadhar-nagar', 'jaipur', 'Vidhyadhar Nagar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- SURAT (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('surat-adajan', 'surat', 'Adajan'),
('surat-vesu', 'surat', 'Vesu'),
('surat-pal', 'surat', 'Pal'),
('surat-piplod', 'surat', 'Piplod'),
('surat-citylight', 'surat', 'Citylight'),
('surat-parle-point', 'surat', 'Parle Point'),
('surat-varachha', 'surat', 'Varachha'),
('surat-katargam', 'surat', 'Katargam'),
('surat-athwa', 'surat', 'Athwa'),
('surat-udhna', 'surat', 'Udhna'),
('surat-rander', 'surat', 'Rander'),
('surat-majura-gate', 'surat', 'Majura Gate'),
('surat-nanpura', 'surat', 'Nanpura'),
('surat-magdalla', 'surat', 'Magdalla'),
('surat-dumas', 'surat', 'Dumas')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- LUCKNOW (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('lucknow-gomti-nagar', 'lucknow', 'Gomti Nagar'),
('lucknow-hazratganj', 'lucknow', 'Hazratganj'),
('lucknow-aliganj', 'lucknow', 'Aliganj'),
('lucknow-indira-nagar', 'lucknow', 'Indira Nagar'),
('lucknow-alambagh', 'lucknow', 'Alambagh'),
('lucknow-mahanagar', 'lucknow', 'Mahanagar'),
('lucknow-rajajipuram', 'lucknow', 'Rajajipuram'),
('lucknow-chowk', 'lucknow', 'Chowk'),
('lucknow-aminabad', 'lucknow', 'Aminabad'),
('lucknow-vikas-nagar', 'lucknow', 'Vikas Nagar'),
('lucknow-jankipuram', 'lucknow', 'Jankipuram'),
('lucknow-chinhat', 'lucknow', 'Chinhat'),
('lucknow-telibagh', 'lucknow', 'Telibagh'),
('lucknow-nirala-nagar', 'lucknow', 'Nirala Nagar'),
('lucknow-ashiyana', 'lucknow', 'Ashiyana')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- CHANDIGARH (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('chandigarh-sector-17', 'chandigarh', 'Sector 17'),
('chandigarh-sector-35', 'chandigarh', 'Sector 35'),
('chandigarh-sector-22', 'chandigarh', 'Sector 22'),
('chandigarh-sector-43', 'chandigarh', 'Sector 43'),
('chandigarh-sector-8', 'chandigarh', 'Sector 8'),
('chandigarh-panchkula', 'chandigarh', 'Panchkula'),
('chandigarh-mohali', 'chandigarh', 'Mohali'),
('chandigarh-zirakpur', 'chandigarh', 'Zirakpur'),
('chandigarh-sector-34', 'chandigarh', 'Sector 34'),
('chandigarh-sector-15', 'chandigarh', 'Sector 15'),
('chandigarh-sector-9', 'chandigarh', 'Sector 9'),
('chandigarh-sector-11', 'chandigarh', 'Sector 11'),
('chandigarh-sector-26', 'chandigarh', 'Sector 26'),
('chandigarh-sector-38', 'chandigarh', 'Sector 38'),
('chandigarh-sector-44', 'chandigarh', 'Sector 44')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- KOCHI (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('kochi-kakkanad', 'kochi', 'Kakkanad'),
('kochi-edappally', 'kochi', 'Edappally'),
('kochi-mg-road', 'kochi', 'MG Road'),
('kochi-fort-kochi', 'kochi', 'Fort Kochi'),
('kochi-palarivattom', 'kochi', 'Palarivattom'),
('kochi-kaloor', 'kochi', 'Kaloor'),
('kochi-thrippunithura', 'kochi', 'Thrippunithura'),
('kochi-vytilla', 'kochi', 'Vytilla'),
('kochi-kadavanthra', 'kochi', 'Kadavanthra'),
('kochi-ernakulam', 'kochi', 'Ernakulam'),
('kochi-marine-drive', 'kochi', 'Marine Drive'),
('kochi-vennala', 'kochi', 'Vennala'),
('kochi-aluva', 'kochi', 'Aluva'),
('kochi-thevara', 'kochi', 'Thevara'),
('kochi-panampilly-nagar', 'kochi', 'Panampilly Nagar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- INDORE (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('indore-vijay-nagar', 'indore', 'Vijay Nagar'),
('indore-mg-road', 'indore', 'MG Road'),
('indore-palasia', 'indore', 'Palasia'),
('indore-ab-road', 'indore', 'AB Road'),
('indore-rau', 'indore', 'Rau'),
('indore-nipania', 'indore', 'Nipania'),
('indore-bhawarkua', 'indore', 'Bhawarkua'),
('indore-sapna-sangeeta', 'indore', 'Sapna Sangeeta'),
('indore-scheme-54', 'indore', 'Scheme 54'),
('indore-scheme-78', 'indore', 'Scheme 78'),
('indore-annapurna', 'indore', 'Annapurna'),
('indore-rajendra-nagar', 'indore', 'Rajendra Nagar'),
('indore-geeta-bhawan', 'indore', 'Geeta Bhawan'),
('indore-kanadiya', 'indore', 'Kanadiya'),
('indore-aerodrome', 'indore', 'Aerodrome')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- NAGPUR (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('nagpur-dharampeth', 'nagpur', 'Dharampeth'),
('nagpur-sitabuldi', 'nagpur', 'Sitabuldi'),
('nagpur-sadar', 'nagpur', 'Sadar'),
('nagpur-wardha-road', 'nagpur', 'Wardha Road'),
('nagpur-ramdaspeth', 'nagpur', 'Ramdaspeth'),
('nagpur-civil-lines', 'nagpur', 'Civil Lines'),
('nagpur-manish-nagar', 'nagpur', 'Manish Nagar'),
('nagpur-pratap-nagar', 'nagpur', 'Pratap Nagar'),
('nagpur-shankar-nagar', 'nagpur', 'Shankar Nagar'),
('nagpur-bajaj-nagar', 'nagpur', 'Bajaj Nagar'),
('nagpur-dhantoli', 'nagpur', 'Dhantoli'),
('nagpur-jaripatka', 'nagpur', 'Jaripatka'),
('nagpur-koradi', 'nagpur', 'Koradi'),
('nagpur-kamptee', 'nagpur', 'Kamptee'),
('nagpur-trimurti-nagar', 'nagpur', 'Trimurti Nagar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- BHOPAL (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('bhopal-mp-nagar', 'bhopal', 'MP Nagar'),
('bhopal-arera-colony', 'bhopal', 'Arera Colony'),
('bhopal-kolar', 'bhopal', 'Kolar'),
('bhopal-hoshangabad-road', 'bhopal', 'Hoshangabad Road'),
('bhopal-bawadiya-kalan', 'bhopal', 'Bawadiya Kalan'),
('bhopal-govindpura', 'bhopal', 'Govindpura'),
('bhopal-ayodhya-nagar', 'bhopal', 'Ayodhya Nagar'),
('bhopal-shahpura', 'bhopal', 'Shahpura'),
('bhopal-chuna-bhatti', 'bhopal', 'Chuna Bhatti'),
('bhopal-berasia-road', 'bhopal', 'Berasia Road'),
('bhopal-jahangirabad', 'bhopal', 'Jahangirabad'),
('bhopal-bag-sewania', 'bhopal', 'Bag Sewania'),
('bhopal-bairagarh', 'bhopal', 'Bairagarh'),
('bhopal-habibganj', 'bhopal', 'Habibganj'),
('bhopal-koh-e-fiza', 'bhopal', 'Koh-e-Fiza')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- VISAKHAPATNAM (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('visakhapatnam-mvp-colony', 'visakhapatnam', 'MVP Colony'),
('visakhapatnam-dwaraka-nagar', 'visakhapatnam', 'Dwaraka Nagar'),
('visakhapatnam-gajuwaka', 'visakhapatnam', 'Gajuwaka'),
('visakhapatnam-madhurawada', 'visakhapatnam', 'Madhurawada'),
('visakhapatnam-rushikonda', 'visakhapatnam', 'Rushikonda'),
('visakhapatnam-nad-kotha-road', 'visakhapatnam', 'NAD Kotha Road'),
('visakhapatnam-siripuram', 'visakhapatnam', 'Siripuram'),
('visakhapatnam-seethammadhara', 'visakhapatnam', 'Seethammadhara'),
('visakhapatnam-beach-road', 'visakhapatnam', 'Beach Road'),
('visakhapatnam-waltair', 'visakhapatnam', 'Waltair'),
('visakhapatnam-anakapalle', 'visakhapatnam', 'Anakapalle'),
('visakhapatnam-pendurthi', 'visakhapatnam', 'Pendurthi'),
('visakhapatnam-kommadi', 'visakhapatnam', 'Kommadi'),
('visakhapatnam-yendada', 'visakhapatnam', 'Yendada'),
('visakhapatnam-vadlapudi', 'visakhapatnam', 'Vadlapudi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- PATNA (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('patna-boring-road', 'patna', 'Boring Road'),
('patna-kankarbagh', 'patna', 'Kankarbagh'),
('patna-patliputra', 'patna', 'Patliputra'),
('patna-rajendra-nagar', 'patna', 'Rajendra Nagar'),
('patna-fraser-road', 'patna', 'Fraser Road'),
('patna-bailey-road', 'patna', 'Bailey Road'),
('patna-mithapur', 'patna', 'Mithapur'),
('patna-kumhrar', 'patna', 'Kumhrar'),
('patna-anisabad', 'patna', 'Anisabad'),
('patna-danapur', 'patna', 'Danapur'),
('patna-digha', 'patna', 'Digha'),
('patna-budh-marg', 'patna', 'Budh Marg'),
('patna-ashok-rajpath', 'patna', 'Ashok Rajpath'),
('patna-sk-puri', 'patna', 'SK Puri'),
('patna-phulwari-sharif', 'patna', 'Phulwari Sharif')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- COIMBATORE (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('coimbatore-rs-puram', 'coimbatore', 'RS Puram'),
('coimbatore-gandhipuram', 'coimbatore', 'Gandhipuram'),
('coimbatore-saibaba-colony', 'coimbatore', 'Saibaba Colony'),
('coimbatore-peelamedu', 'coimbatore', 'Peelamedu'),
('coimbatore-vadavalli', 'coimbatore', 'Vadavalli'),
('coimbatore-singanallur', 'coimbatore', 'Singanallur'),
('coimbatore-ukkadam', 'coimbatore', 'Ukkadam'),
('coimbatore-town-hall', 'coimbatore', 'Town Hall'),
('coimbatore-race-course', 'coimbatore', 'Race Course'),
('coimbatore-ganapathy', 'coimbatore', 'Ganapathy'),
('coimbatore-podanur', 'coimbatore', 'Podanur'),
('coimbatore-thudiyalur', 'coimbatore', 'Thudiyalur'),
('coimbatore-kovaipudur', 'coimbatore', 'Kovaipudur'),
('coimbatore-kuniyamuthur', 'coimbatore', 'Kuniyamuthur'),
('coimbatore-kalapatti', 'coimbatore', 'Kalapatti')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- THIRUVANANTHAPURAM (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('thiruvananthapuram-pattom', 'thiruvananthapuram', 'Pattom'),
('thiruvananthapuram-vazhuthacaud', 'thiruvananthapuram', 'Vazhuthacaud'),
('thiruvananthapuram-kowdiar', 'thiruvananthapuram', 'Kowdiar'),
('thiruvananthapuram-sasthamangalam', 'thiruvananthapuram', 'Sasthamangalam'),
('thiruvananthapuram-medical-college', 'thiruvananthapuram', 'Medical College'),
('thiruvananthapuram-kesavadasapuram', 'thiruvananthapuram', 'Kesavadasapuram'),
('thiruvananthapuram-vattiyoorkavu', 'thiruvananthapuram', 'Vattiyoorkavu'),
('thiruvananthapuram-technopark', 'thiruvananthapuram', 'Technopark'),
('thiruvananthapuram-kazhakootam', 'thiruvananthapuram', 'Kazhakootam'),
('thiruvananthapuram-ulloor', 'thiruvananthapuram', 'Ulloor'),
('thiruvananthapuram-vellayambalam', 'thiruvananthapuram', 'Vellayambalam'),
('thiruvananthapuram-palayam', 'thiruvananthapuram', 'Palayam'),
('thiruvananthapuram-thampanoor', 'thiruvananthapuram', 'Thampanoor'),
('thiruvananthapuram-mannanthala', 'thiruvananthapuram', 'Mannanthala'),
('thiruvananthapuram-attingal', 'thiruvananthapuram', 'Attingal')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- VADODARA (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('vadodara-alkapuri', 'vadodara', 'Alkapuri'),
('vadodara-sayajigunj', 'vadodara', 'Sayajigunj'),
('vadodara-akota', 'vadodara', 'Akota'),
('vadodara-manjalpur', 'vadodara', 'Manjalpur'),
('vadodara-gotri', 'vadodara', 'Gotri'),
('vadodara-vasna', 'vadodara', 'Vasna'),
('vadodara-waghodia', 'vadodara', 'Waghodia'),
('vadodara-fatehgunj', 'vadodara', 'Fatehgunj'),
('vadodara-karelibaug', 'vadodara', 'Karelibaug'),
('vadodara-tandalja', 'vadodara', 'Tandalja'),
('vadodara-nizampura', 'vadodara', 'Nizampura'),
('vadodara-gorwa', 'vadodara', 'Gorwa'),
('vadodara-bhayli', 'vadodara', 'Bhayli'),
('vadodara-sama', 'vadodara', 'Sama'),
('vadodara-harni', 'vadodara', 'Harni')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- GUWAHATI (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('guwahati-paltan-bazaar', 'guwahati', 'Paltan Bazaar'),
('guwahati-zoo-road', 'guwahati', 'Zoo Road'),
('guwahati-christian-basti', 'guwahati', 'Christian Basti'),
('guwahati-ulubari', 'guwahati', 'Ulubari'),
('guwahati-geetanagar', 'guwahati', 'Geetanagar'),
('guwahati-guwahati-club', 'guwahati', 'Guwahati Club'),
('guwahati-beltola', 'guwahati', 'Beltola'),
('guwahati-six-mile', 'guwahati', 'Six Mile'),
('guwahati-dispur', 'guwahati', 'Dispur'),
('guwahati-khanapara', 'guwahati', 'Khanapara'),
('guwahati-ganeshguri', 'guwahati', 'Ganeshguri'),
('guwahati-kahilipara', 'guwahati', 'Kahilipara'),
('guwahati-basistha', 'guwahati', 'Basistha'),
('guwahati-adabari', 'guwahati', 'Adabari'),
('guwahati-hatigaon', 'guwahati', 'Hatigaon')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- BHUBANESWAR (15 areas)
INSERT INTO areas (id, city_id, name) VALUES
('bhubaneswar-patia', 'bhubaneswar', 'Patia'),
('bhubaneswar-khandagiri', 'bhubaneswar', 'Khandagiri'),
('bhubaneswar-jaydev-vihar', 'bhubaneswar', 'Jaydev Vihar'),
('bhubaneswar-saheed-nagar', 'bhubaneswar', 'Saheed Nagar'),
('bhubaneswar-baramunda', 'bhubaneswar', 'Baramunda'),
('bhubaneswar-nayapalli', 'bhubaneswar', 'Nayapalli'),
('bhubaneswar-chandrasekharpur', 'bhubaneswar', 'Chandrasekharpur'),
('bhubaneswar-rasulgarh', 'bhubaneswar', 'Rasulgarh'),
('bhubaneswar-sundarpada', 'bhubaneswar', 'Sundarpada'),
('bhubaneswar-old-town', 'bhubaneswar', 'Old Town'),
('bhubaneswar-laxmisagar', 'bhubaneswar', 'Laxmisagar'),
('bhubaneswar-kalinga-nagar', 'bhubaneswar', 'Kalinga Nagar'),
('bhubaneswar-infocity', 'bhubaneswar', 'Infocity'),
('bhubaneswar-irc-village', 'bhubaneswar', 'IRC Village'),
('bhubaneswar-dumduma', 'bhubaneswar', 'Dumduma')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Show cities with area counts
SELECT 
  c.name as city_name,
  COUNT(a.id) as area_count
FROM cities c
LEFT JOIN areas a ON c.id = a.city_id
GROUP BY c.id, c.name
ORDER BY area_count DESC;

-- Total counts
SELECT 
  (SELECT COUNT(*) FROM cities) as total_cities,
  (SELECT COUNT(*) FROM areas) as total_areas;

-- Sample areas
SELECT c.name as city, a.name as area, a.id as area_id
FROM areas a
JOIN cities c ON a.city_id = c.id
ORDER BY c.name, a.name
LIMIT 20;
