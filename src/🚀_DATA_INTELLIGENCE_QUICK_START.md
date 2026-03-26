# 🚀 Data Intelligence Dashboard - Quick Start Guide

## ✅ Installation (3 Simple Steps)

### **Step 1: Run SQL File**
1. Open **Supabase Dashboard** → **SQL Editor**
2. Create new query
3. Copy **ENTIRE** file: `/database/data-intelligence-setup-clean.sql`
4. Click **RUN**
5. Wait 1-2 minutes for success message

### **Step 2: Verify Installation**
Run this test query in SQL Editor:
```sql
SELECT * FROM get_platform_kpis();
```

✅ **Expected:** 1 row showing all platform metrics

### **Step 3: Access Dashboard**
1. Login to LocalFelo as admin (uxsantosh@gmail.com)
2. Go to **Admin Panel**
3. Click **"Data Analytics"** tab (last tab on the right)
4. ✅ **Done!** Dashboard will load with charts and tables

---

## 📊 What You'll See

### **8 KPI Cards** (Top Section)
- Total Users
- Active Users (24h/7d)
- Tasks Posted/Completed
- Wishes Posted/Fulfilled  
- Marketplace Listings
- Messages Sent
- Average Task Budget

### **7 Analytics Sections**
1. **User Activity** - New users per day chart
2. **Task Analytics** - Charts + category performance table
3. **Wish Analytics** - Charts + category performance table
4. **Marketplace Analytics** - Price trends + category stats
5. **Location Analytics** - Top 20 locations by activity
6. **Helper Performance** - Top 20 helpers by tasks completed
7. **User Activity Table** - Coming soon (optional)

---

## 🔄 Refresh Analytics Data

### **Manual Refresh**
Click the **"Refresh Data"** button in the dashboard (top right)

### **Auto Refresh (Recommended)**
Set up daily refresh at 2 AM:

1. **Supabase Dashboard** → **Database** → **Cron Jobs**
2. Click **"Create a new Cron Job"**
3. Settings:
   - **Name:** `Daily Analytics Refresh`
   - **Schedule:** `0 2 * * *`
   - **SQL:** `SELECT refresh_all_analytics_views();`
4. Click **Save**

---

## 🐛 Troubleshooting

### **Error: "cannot refresh materialized view concurrently"**
✅ **Solution:** Use the clean SQL file `/database/data-intelligence-setup-clean.sql` which drops and recreates all views with unique indexes.

### **No Data Showing**
1. Check if you have data in your database (profiles, tasks, wishes, listings)
2. Try manual refresh button
3. Check browser console for errors

### **Slow Loading**
- Materialized views should be fast (pre-computed)
- Click "Refresh Data" to update views
- Check if indexes exist

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `/database/data-intelligence-setup-clean.sql` | **RUN THIS** - Clean installation |
| `/components/admin/DataIntelligenceTab.tsx` | Dashboard UI (already integrated) |
| `/screens/AdminScreen.tsx` | Admin panel (already integrated) |
| `/database/DATA_INTELLIGENCE_README.md` | Full documentation |
| `/DATA_INTELLIGENCE_COMPLETE_SUMMARY.md` | Complete summary |

---

## 🎯 Quick Test Queries

After installation, test these in SQL Editor:

```sql
-- Test 1: Platform KPIs
SELECT * FROM get_platform_kpis();

-- Test 2: Daily User Growth
SELECT * FROM mv_daily_user_stats ORDER BY activity_date DESC LIMIT 30;

-- Test 3: Top Task Categories
SELECT * FROM mv_task_category_stats ORDER BY total_tasks DESC LIMIT 10;

-- Test 4: Top Helpers
SELECT * FROM get_top_helpers(10);

-- Test 5: Location Heatmap
SELECT * FROM get_location_heatmap_data() LIMIT 20;
```

---

## ✨ What's Different from Marketplace Intelligence?

| Feature | Marketplace Intelligence | Data Intelligence |
|---------|-------------------------|-------------------|
| **Purpose** | Business strategy & monetization opportunities | Real-time operational analytics |
| **Focus** | Supply/demand gaps, advertiser potential | Platform-wide user activity |
| **Data** | Predictive & future-focused | Historical & current |
| **Sections** | 12 sections | 7 sections |
| **Tables Created** | 10 new tables | 0 tables (views only) |

**Both are complementary!**

---

## 🎉 Success Checklist

- [ ] SQL file ran without errors
- [ ] Test query returns platform KPIs
- [ ] "Data Analytics" tab visible in Admin Panel
- [ ] Dashboard loads with KPI cards
- [ ] Charts display correctly
- [ ] Tables show data
- [ ] Refresh button works

---

## 📞 Need Help?

Check the full documentation: `/database/DATA_INTELLIGENCE_README.md`

---

**🚀 You're all set! Enjoy your Data Intelligence Dashboard!**
