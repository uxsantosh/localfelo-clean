You already have access to the complete LocalFelo project, UI system, flows, Supabase backend, and codebase.
You understand the current architecture and navigation.

Your task is to upgrade the Home screen, Creator flow, and Helper Mode UX to make the app extremely simple and understandable for users across India while keeping the backend intelligent and scalable.

Important requirements:

• Do NOT redesign the entire app
• Do NOT break existing flows or database structures
• Reuse existing UI components and design system
• Keep navigation, authentication, and location systems unchanged
• Only improve task creation entry, helper mode flow, and nearby tasks presentation

You may think deeply and implement the best UX while respecting the existing architecture.

Product Concept

LocalFelo is a hyperlocal micro-job marketplace.

Users can:

• Post small paid jobs nearby (Creator)
• Accept and complete nearby jobs to earn (Helper)

Important rules:

• All jobs are paid
• Payments happen outside the app for now
• Jobs are hyperlocal
• Anyone should be able to post any type of job

The experience must feel like:

“Post a small job nearby and someone can help.”

UX Philosophy

The app has two main user modes

1️⃣ Creator Mode — user needs help
2️⃣ Helper Mode — user wants to earn

These flows must be clear and separate so users immediately understand what to do.

Home Screen (Creator First)

Improve the home screen while keeping the layout structure similar.

Replace the Create Task button with a smart search input that starts job creation.

Hero section:

Headline:

Get help nearby

Subtext:

Post a small job and someone nearby can help.

Primary input:

"What work do you need done?"

Examples under the input:

Bring groceries • Fix fan • Pickup parcel • Shift luggage

This search field should be the starting point of job creation.

When the user taps or types, open the job creation flow.

Smart Job Input Behavior

The search should behave like Google search.

Users can type anything.

Examples:

bring gas cylinder
need plumber
pickup parcel
clean balcony
shift bed

The system should show smart suggestions while typing.

Examples:

Bring Gas Cylinder
Install Gas Cylinder
Pickup Parcel

Matching should detect keywords anywhere in the sentence, not only exact phrases.

Examples that should match:

gas cylinder bring
need cylinder
lpg delivery

If no suggestions match, allow:

Post this job

Users must always be able to create custom jobs.

Quick Job Suggestions

Below the search input show popular jobs.

Examples:

Bring Groceries
Pickup Parcel
Fix Fan
Clean House
Move Furniture
Need Driver

Selecting one should auto fill the job input.

These suggestions should later be generated dynamically based on popular jobs in the database.

Job Creation Flow

Keep it extremely simple.

Step 1 — Job description
"What work do you need done?"

Step 2 — Payment
"How much will you pay?"

Quick options:

₹50
₹100
₹200
₹500
Custom

Message:

Payment will be made directly to the helper after the work is completed.

Step 3 — Time

Now
Today
Tomorrow
Schedule later

Step 4 — Confirm

Show summary card:

Job
Payment
Time
Location

Button:

Post Job

Goal: job posting should take under 10 seconds.

Helper Mode Entry

Home screen should also allow users to earn by helping nearby.

Add section:

Earn by helping nearby

Button:

Turn on Helper Mode

When activated, open the Helper Mode screen.

Helper Mode Screen

This screen should feel like a job dashboard.

Headline:

Find jobs near you

Subtext:

Choose what kind of work you want.

Helper Filters

Allow helpers to select simple filters.

Section:

What kind of work do you want?

Chips:

Delivery
Repairs
Cleaning
Moving
Driving
Any Work

Distance filter:

How far can you travel?

1 km
3 km
5 km
10 km

Effort filter:

Easy
Skilled
Heavy

Button:

Show Jobs

These preferences should help filter the nearby jobs feed.

Helper Job Feed

After filters are applied, show jobs nearby.

Each job card should display:

Job title
Payment (large and prominent)
Distance
Time

Example card:

Fix water pipe
₹1000

100 meters away
Needed today

Button:

Accept Job

Helpers should easily decide based on:

• money
• distance
• effort

Urgent Jobs

Allow creators to mark jobs as Urgent.

Urgent jobs should:

Appear higher in job feed
Notify nearby helpers

Badge example:

⚡ Urgent

Nearby Jobs on Home Screen

Below the hero section show:

Jobs near you

Display job cards similar to the helper feed.

This encourages browsing and marketplace activity.

Language Simplicity

Avoid technical terms such as:

Task
Category
Subcategory
Service

Use simple language:

Job
Work
Help

The app should feel understandable for users across India.

Backend Intelligence

Implement intelligent logic for:

• keyword detection in job descriptions
• suggestion ranking
• synonym matching
• popular job detection
• automatic job tagging

Jobs should be internally classified using intents such as:

Bring / Buy
Pickup / Drop
Fix / Install
Clean / Work
Move / Carry
Personal Help
Vehicle Help
Teaching / Skill
Event Help
Other

Users should not see these classifications, but they should help:

• job filtering
• search
• analytics

Database Safety

Do not break existing tables.

If needed:

Extend the system by adding optional fields or supporting tables.

Examples:

job_intents
job_keywords
job_popularity

Avoid destructive changes.

At the End

After implementing the UX improvements, provide:

• all required database migrations
• SQL queries for Supabase
• indexes for search optimization
• any new tables required

Ensure the solution works with existing LocalFelo data and architecture.

Final Goal

Make LocalFelo feel like:

“Search for a job you need done, post it quickly, and nearby helpers can complete it.”

The system should be:

• extremely simple for users
• intelligent behind the scenes
• scalable for a large hyperlocal job marketplace.