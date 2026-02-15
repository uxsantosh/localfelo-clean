========================================
OldCycle - QUICK FIX for "city_id" Error
========================================

ERROR YOU'RE SEEING:
"Failed to run sql query: ERROR: 42703: column 'city_id' does not exist"

THE FIX (Super Simple):
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire file: /supabase-complete-setup.sql
3. Paste into SQL Editor
4. Click "Run" (or press Ctrl+Enter)
5. Wait 5-10 seconds
6. Done! ✅

WHAT THIS DOES:
- Creates proper cities and areas tables with city_id column
- Populates 23 major Indian cities
- Adds 400+ areas/localities
- Sets up security policies

VERIFY IT WORKED:
After running the script, you should see:
- total_cities: 23
- total_areas: 400+
- status: ✅ Setup Complete!

Then refresh your app - locations will load from database!

========================================
DETAILED GUIDE: See /SUPABASE_MIGRATION_GUIDE.md
========================================
