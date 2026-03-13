You are updating an existing feature in the LocalFelo app called **Helper Ready Mode**.

The feature is already implemented, but two UX issues need to be fixed carefully **without modifying any existing working functionality**.

Do NOT refactor unrelated code.

Only improve the **copy clarity and state persistence behavior**.

---

PROBLEM 1 — COPY CONFUSION

The current text says:

"Available for nearby tasks"

This makes it sound like the user is **already available**, even before activation.

Update the copy so it clearly communicates that the user **can enable availability**.

Replace the inactive state copy with something like:

Primary text:
"Get nearby tasks instantly"

Subtext:
"Turn this on to receive alerts when someone posts a task nearby."

Keep the toggle / slider control unchanged.

---

PROBLEM 2 — ACTIVATED STATE IS NOT VISIBLE AFTER LEAVING SCREEN

When the user activates availability and navigates away from the Helper Ready screen, there is currently **no visible indicator that availability is still ON**.

This creates confusion.

Implement a **persistent minimized state indicator**.

---

MINIMIZED STATE BEHAVIOR

When the user activates availability:

The system enters **Helper Ready Mode**.

If the user leaves the screen using back navigation or switching tabs:

Show a small persistent status element.

Mobile:
Display a floating pill or compact banner.

Example:
"🟢 Ready for nearby tasks"

Web:
Display a small status bar or pill near the top of the page.

---

MINIMIZED STATE INTERACTION

Tapping or clicking the status pill should:

Reopen the **Helper Ready Mode screen**.

---

TURN OFF BEHAVIOR

Inside the Helper Ready Mode screen add a clear action:

"Stop receiving task alerts"

or

"Turn off availability"

When the user turns it off:

• Helper Ready Mode ends
• The minimized indicator disappears
• The UI returns to normal

---

STATE VISIBILITY RULES

OFF state:
User sees the activation UI.

ON state:
User sees a green "Ready for tasks" indicator somewhere in the UI even if they leave the screen.

---

IMPORTANT IMPLEMENTATION RULES

Do NOT:
• change existing task flows
• change task cards
• change task acceptance logic
• redesign current layouts

Only improve:
• activation copy
• visibility of the active state
• ability to reopen the active mode

---

DELIVERABLES REQUIRED

Provide:

1. All files modified or created
2. Updated code for those files
3. Any database changes if required
4. Supabase SQL queries if database changes are required
5. Instructions on where to place the updated files in the project so they can be copied into VS Code safely

Ensure the feature works **without breaking any existing functionality**.
