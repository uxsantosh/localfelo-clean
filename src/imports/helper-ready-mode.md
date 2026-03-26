All current features, UI, database schema, and flows are working correctly.
Your task is to implement a "Helper Ready Mode" feature carefully without breaking or modifying any existing functionality.

Important constraints:
• Do NOT change or refactor existing screens or logic unless absolutely required.
• Do NOT break current flows for posting tasks, browsing tasks, task details, or accepting tasks.
• Reuse existing UI components wherever possible (task cards, filters, task detail navigation).
• The current tasks screen must remain unchanged.
• The new feature should integrate smoothly with the current UI.

FEATURE GOAL

Allow users who want to earn by completing tasks to activate an availability mode so they can quickly receive and accept nearby tasks.

This should feel like a "ready to take tasks" mode, similar to gig apps, but simple and clean.

HOME SCREEN CHANGES

Directly below the existing banner, add two elements:

Activity Indicator Line

Display a simple one-line activity message such as:

"Tasks are getting completed nearby today"

or

"12 tasks completed nearby today"

This number does not need to be perfectly accurate. It can change dynamically.

Keep this visually light and subtle so it does not dominate the screen.

Availability Slider

Add a slider or clear activation control with text like:

"Available for nearby tasks"

Subtext:
"Turn this on to get instant alerts when someone posts a task nearby."

When the user activates this:

• Enter Helper Ready Mode
• Open a dedicated screen for waiting or viewing nearby tasks.

HELPER READY MODE SCREEN

When availability is turned on, open a new screen.

At the top show a clear status:

"🟢 You are available for nearby tasks"

Below this the screen should behave in two states.

STATE A: TASKS AVAILABLE

If tasks exist nearby:

Show task cards immediately using the existing task card component.

Display a list of nearby tasks.

Each card should include:
• reward amount
• task title
• distance
• brief description

Clicking a card should open the existing task details screen.

Add simple filters at the top:

Nearest
Highest Reward
Newest

Reuse existing task sorting logic if possible.

STATE B: NO TASKS AVAILABLE

If there are no tasks nearby:

Display a simple radar-style waiting animation or scanning indicator.

Text example:

"Looking for nearby tasks..."

Subtext:

"We'll notify you instantly when someone posts a task nearby."

MINIMIZED MODE

If the user leaves this screen:

Show a small floating status pill:

"🟢 Available for tasks"

Tapping it should reopen the Helper Ready Mode screen.

TASK ACCEPTANCE

Do NOT modify the existing task acceptance flow.

When a user taps a task card:

Use the current task details page and current acceptance logic.

NOTIFICATIONS

When new tasks are created nearby:

Users in Helper Ready Mode should receive instant notifications.

IMPORTANT IMPLEMENTATION RULES

• Do not redesign existing pages.
• Do not duplicate existing task logic.
• Reuse components where possible.
• Keep UI clean and minimal.
• Maintain the existing design language of LocalFelo.

DELIVERABLES REQUIRED

After implementing the feature, provide:

A list of all files created or modified

The exact updated code for those files

Any required database changes

The Supabase SQL queries needed to apply database changes

Clear instructions on where to place each file in the project so it can be copied into VS Code safely.

The goal is to integrate this feature without breaking anything currently working in the app.