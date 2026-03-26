You already have full access to the LocalFelo project, UI system, flows, Supabase backend, and codebase.
You understand the architecture of this project.

Your task is to upgrade the Task feature (creator flow + helper flow) to make it extremely easy to use while making the backend intelligent and scalable.

Important instructions:

• Do NOT redesign the whole app
• Do NOT break existing architecture or flows
• Reuse existing components wherever possible
• Maintain compatibility with existing navigation and database
• Improve only task creation, task discovery, and task intelligence

You may think deeply and implement the best UX and backend logic while respecting the existing system.

Product Concept

LocalFelo is a hyperlocal paid task marketplace.

Users post small paid jobs nearby.
Helpers accept those jobs and complete them.

Important product rules:

• All tasks are paid tasks
• Payment currently happens outside the app
• Tasks are hyperlocal
• Anyone should be able to post any kind of task

The system must feel like:

"Post a small job nearby and someone helps you."

Primary UX Goals

Task posting should take under 10 seconds.

The UI must be:

• extremely simple
• understandable by anyone in India
• usable even by non-technical users
• flexible enough to allow any kind of task

But the backend should be smart and structured.

Task Creation Flow (Creator Flow)

Simplify the posting process.

Target flow:

Task description

Payment

Time

Confirm

Do not add unnecessary steps.

Step 1 — Task Description (Smart Input)

Main input field:

"What work do you need done?"

Placeholder examples:

Bring groceries
Fix fan
Pickup parcel
Shift luggage
Clean house

Users should be able to write anything freely.

Example inputs:

bring gas cylinder
need someone to stand in queue
pickup parcel
clean balcony
teach excel

Smart Suggestion System

While typing, show live suggestions.

The suggestion engine must detect keywords anywhere in the input.

Example:

User types:

gas cylinder bring

Suggestions:

Bring Gas Cylinder
Install Gas Cylinder

User types:

parcel

Suggestions:

Pickup Parcel
Drop Parcel

Word order must not matter.

Example matches:

bring gas cylinder
gas cylinder bring
need cylinder
lpg delivery

All should match Bring Gas Cylinder.

Keyword Synonym Detection

Support different wording.

Example synonyms:

Bring
deliver
get
pickup

Gas cylinder

gas
cylinder
lpg
gas bottle

Parcel

parcel
package
courier

Suggestions should update live while typing.

Maximum 3–5 suggestions.

If nothing matches:

Show option:

"Post this task"

Never block custom tasks.

Quick Tasks (Fast Posting)

Below the input show popular quick tasks.

Examples:

Bring Groceries
Pickup Parcel
Need Electrician
Shift Luggage
Clean House
Need Driver
Bring Medicine
Move Furniture
Fix Fan
Car Wash

Selecting one auto fills the input.

Step 2 — Payment

Title:

"How much will you pay?"

Quick amount options:

₹50
₹100
₹200
₹500
Custom amount

Message below:

Payment will be made directly to the helper after work is completed.

Step 3 — Time

Options:

Now
Today
Tomorrow
Schedule later

Step 4 — Confirm

Show summary card:

Task
Payment
Time
Location

Button:

Post Task

Helper Experience (Task Discovery)

Helpers should see a clean task feed.

Each task card should show:

Task title
Payment
Distance
Time

Example:

Bring Gas Cylinder
₹150
1.2 km away
Needed now

Actions:

Accept Task
View Details

Helper Filters

Keep filtering minimal.

Distance

1 km
3 km
5 km

Payment

₹50+
₹100+
₹300+

Effort

Easy
Medium
Hard

Time

Now
Today

Task Details Screen

Display:

Task description
Payment
Distance
Time
Location

Creator profile should show:

Name
Rating
Completed tasks
Phone verified

Actions:

Accept Task
Message Creator

Smart Task Intelligence (Backend)

Even though users write tasks freely, tasks should be automatically classified.

Use intent detection.

Primary intents:

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

Each task can have internal metadata:

intent
category
effort level
skill required
weight

Example:

User text:

bring gas cylinder

System classification:

intent: bring
category: household
effort: medium

Internal Category Structure

Maintain categories internally for analytics and filtering.

Suggested categories:

Household Help
Delivery & Errands
Repairs & Installation
Cleaning & Maintenance
Moving & Carrying
Personal Assistance
Vehicle Services
Child & Elder Care
Education & Skills
Events & Photography
Outdoor & Property Work
Office & Business Help
Emergency Help
Other Tasks

Users should not be forced to select categories.

Self Learning Task System

Every custom task should be stored.

If many users post similar tasks, automatically add them to suggestions.

Example:

assemble furniture

Later becomes a suggestion.

The system should learn over time.

Urgent Task Feature

Allow creator to mark a task as:

Urgent

Urgent tasks:

Notify nearby helpers
Appear higher in feed

Language Simplicity

Avoid technical terms like:

Category
Subcategory

Use:

Common jobs
Popular tasks

All copy should be simple English understandable across India.

Architecture Safety

Do NOT break:

existing authentication
existing location system
existing navigation
existing UI design system

Reuse current components wherever possible.

Only improve:

task creation flow
task discovery flow
task suggestion system

Backend Intelligence

Implement smart backend logic for:

keyword matching
synonym detection
suggestion ranking
task intent detection
task popularity tracking

Ensure search works even when users type imperfect or mixed phrases.

Database Changes

At the end of the implementation, provide all required database changes including:

• new tables
• new fields
• indexes
• migrations
• Supabase SQL queries

The goal is to extend the system without breaking existing data.

If possible:

• reuse existing task table
• add optional fields
• avoid destructive changes

Provide migration scripts for:

task_intents
task_keywords
task_suggestions
task_popularity tracking

Implementation Instructions

Think carefully before implementing.

Your goal is to:

• keep the UI extremely simple
• keep the UX extremely fast
• build a smart backend intelligence layer

Try to reuse as much of the existing system as possible.

Minimize breaking changes.

Improve the task system so LocalFelo can scale into a large hyperlocal micro-task marketplace.