Enhance the existing LocalFelo admin panel by adding a new analytics section that uses **existing application data only**. The application is already fully working with Tasks, Wishes, Marketplace, Chat, Notifications, and Admin Panel.

IMPORTANT RULES

1. Do NOT modify or break any existing functionality.
2. Do NOT rename or change existing tables.
3. Do NOT alter current APIs or queries.
4. First inspect the Supabase schema and reuse existing tables and fields.
5. Only create new tables if absolutely necessary and only after confirming the data does not already exist.
6. Prefer creating **views or analytics queries** instead of changing production tables.

The goal is to **analyze and use existing user activity data**.

---

SECTION 1 — DATA INTELLIGENCE DASHBOARD

Create a new admin tab called:

DATA INTELLIGENCE

This dashboard reads existing system data to display platform insights.

Top KPI cards:

• Total Users
• Active Users (24h / 7d)
• Tasks Posted
• Tasks Completed
• Wishes Posted
• Marketplace Listings
• Messages Sent
• Avg Task Budget

All metrics should be calculated from existing database tables.

---

SECTION 2 — USER ACTIVITY ANALYTICS

Analyze existing user activity.

Charts:

• New Users per Day
• Active Users by Location
• Tasks per User
• Wishes per User
• Marketplace Listings per User

Table:

User | Tasks Posted | Tasks Completed | Listings | Last Active

Use existing user and task data.

---

SECTION 3 — TASK ANALYTICS

Use the existing tasks table.

Display:

Charts:

• Tasks Posted per Day
• Task Completion Rate
• Average Acceptance Time
• Average Task Budget

Table:

Category | Tasks Posted | Completed | Avg Budget

If timestamps like accepted_at or completed_at exist, use them to calculate lifecycle metrics.

---

SECTION 4 — WISH ANALYTICS

Use existing wishes table.

Charts:

• Wishes Posted per Day
• Wish Fulfillment Rate
• Top Wish Categories

Table:

Category | Wishes Posted | Fulfilled

---

SECTION 5 — MARKETPLACE ANALYTICS

Use existing marketplace listings data.

Charts:

• Listings Posted per Day
• Top Categories
• Average Listing Price

Table:

Category | Listings | Avg Price | Active Listings

---

SECTION 6 — LOCATION DEMAND ANALYTICS

Using existing latitude and longitude fields:

Create heatmap showing:

• task density
• wish density
• marketplace activity

Use Leaflet with OpenStreetMap for visualization.

---

SECTION 7 — HELPER PERFORMANCE

Analyze provider performance from existing data.

Metrics:

• tasks completed
• average rating
• acceptance rate
• cancellation rate

Table:

Helper | Category | Tasks Completed | Rating | Completion Rate

Do not create new tables unless required.

---

SECTION 8 — SEARCH ANALYTICS (ONLY IF DATA EXISTS)

Check if search data already exists.

If search logs are available:

Display:

• most searched keywords
• search → task conversion rate

If search logs do not exist, suggest a **non-breaking logging method**.

---

SECTION 9 — TRUST & SAFETY INSIGHTS

Use existing reports or moderation data if available.

Charts:

• reports per day
• common report reasons

Table:

Reported User | Reports Count | Status

---

SECTION 10 — ADMIN ACTIVITY INSIGHTS

If admin logs exist:

Display recent actions:

• user bans
• task removals
• listing moderation

---

SUPABASE INTEGRATION

Before creating anything new:

1. Inspect the Supabase schema.
2. Identify existing tables for:
   users
   tasks
   wishes
   marketplace listings
   messages
   reports
3. Build analytics queries using existing data.

If additional data is required, suggest:

• safe SQL views
• aggregated queries
• optional analytics tables

Avoid schema changes unless absolutely necessary.

---

FINAL RESULT

A **Data Intelligence dashboard** that extracts insights from existing LocalFelo data without altering the current application.

The dashboard should provide insights about:

• user activity
• task demand
• wish demand
• marketplace usage
• helper performance
• geographic demand patterns

All analytics should run safely on the current Supabase database without impacting production functionality.
