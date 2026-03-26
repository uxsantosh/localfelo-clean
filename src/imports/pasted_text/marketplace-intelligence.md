Create an additional admin tab called **“Marketplace Intelligence”** inside the LocalFelo admin panel. This tab focuses on deeper insights and predictive analytics for Tasks, Wishes, and Marketplace activity.

Do not modify existing functionality. This tab only reads analytics data and visualizes it.

---

SECTION 1 — DEMAND vs SUPPLY GAP

Purpose: Identify services where demand is higher than available helpers.

Table:

Category | Task Requests | Available Helpers | Demand Gap | Avg Budget | Location

Example:

Cleaning | 180 | 25 | HIGH | ₹350 | Whitefield
Guitar Classes | 60 | 8 | HIGH | ₹600 | Marathahalli

Charts:

• Categories with highest demand gap
• Locations with most unmet Tasks

Highlight rows:

red = severe shortage
yellow = moderate shortage

---

SECTION 2 — TASK MATCH SUCCESS RATE

Metrics:

Tasks Posted
Tasks Accepted
Tasks Completed
Tasks Expired

Charts:

• Task Acceptance Rate
• Task Completion Rate
• Average Time to Accept Task

Table:

Category | Acceptance Rate | Completion Rate | Avg Accept Time

---

SECTION 3 — USER INTENT SIGNALS

Track early signals that show what users want.

Table:

search_keyword | category_clicked | tasks_posted_after_search | location

Charts:

• Most searched services
• Search → Task conversion rate
• Trending services this week

---

SECTION 4 — LOCATION DEMAND HEATMAP

Map showing:

• task density
• wish density
• marketplace listing density

Layers toggle:

Tasks
Wishes
Marketplace

Heatmap colors:

green = balanced
orange = medium demand
red = high demand

---

SECTION 5 — PROVIDER / HELPER QUALITY INDEX

Calculate a **Helper Quality Score** based on:

rating
completion rate
response speed
cancellation rate

Formula example:

quality_score = (rating * 0.4) + (completion_rate * 0.3) + (response_speed_score * 0.2) + (low_cancellation_score * 0.1)

Table:

Helper | Category | Tasks Completed | Quality Score | Avg Rating

Chart:

• Top Helpers

---

SECTION 6 — TASK PRICE INTELLIGENCE

Purpose: understand pricing trends.

Charts:

• Avg Task Budget by Category
• Price Distribution
• Budget vs Completion Rate

Table:

Category | Avg Budget | Median Budget | Completion %

---

SECTION 7 — USER GROWTH COHORTS

Track retention.

Charts:

• Users retained after 7 days
• Users retained after 30 days
• Task posting frequency

Table:

Signup Week | Active After 7 Days | Active After 30 Days

---

SECTION 8 — MARKETPLACE PERFORMANCE

Metrics:

Total Listings
Active Listings
Listings Sold / Closed

Charts:

• Top Selling Categories
• Avg Listing Price
• Views → Chat → Sale funnel

Table:

Category | Listings | Views | Chats | Conversion %

---

SECTION 9 — TRUST & FRAUD SIGNALS

Detect suspicious behavior.

Table:

User | Suspicious Activity | Flags

Examples:

• too many task cancellations
• repeated phone numbers
• fake listings
• rating manipulation

Charts:

• Fraud signals trend

---

SECTION 10 — GROWTH SIGNALS

Track virality.

Metrics:

• referral users
• tasks per user
• wishes per user
• marketplace listings per user

Charts:

• viral growth factor
• user activity distribution

---

SECTION 11 — ADVERTISER OPPORTUNITY INSIGHTS

This section prepares data for advertisers.

Table:

Category | Monthly Searches | Tasks Posted | Avg Budget | Market Opportunity

Example:

AC Repair | 1200 | 80 | ₹700 | HIGH
Bike Repair | 600 | 150 | ₹300 | MEDIUM

Charts:

• advertiser demand opportunities
• high-value categories

---

SECTION 12 — AI / ML TRAINING DATA SUMMARY

Show counts of collected data signals.

Metrics:

Total Searches Logged
Total Category Clicks
Task Acceptance Time Records
Location Demand Signals
User Interaction Events

Charts:

• Data volume for AI training
• Behavioral data growth

---

SUPABASE REQUIREMENTS

If required fields or tables do not exist, request SQL queries to create them.

Tables that may be required:

search_logs
user_activity_events
task_analytics
provider_metrics
category_demand_stats
advertiser_campaigns

All analytics queries should use aggregated views or materialized views for performance.

---

FINAL RESULT

A **Marketplace Intelligence dashboard** that gives strategic insights about:

Tasks
Wishes
Marketplace listings
User behavior
Demand gaps
Provider performance
Pricing intelligence
Fraud signals
Advertiser opportunities
AI training datasets

This system should prepare LocalFelo for future:

AI task matching
smart provider ranking
dynamic pricing
automated advertiser marketplace
