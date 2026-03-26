Only improve the Helper Mode skill selection and filtering logic
• Keep compatibility with the current task auto-classification system

Problem to Fix

Currently the helper onboarding shows categories like:

Students
Parents / Homemakers
IT / Office Workers
Quick Money Seekers
Creatives

These do not help with task matching and create confusion.

Instead, helpers must select types of tasks they can do.

The platform already detects task intent from the description automatically, so helper skills should match those intents.

Updated Helper Mode Flow

Helper Mode should follow this structure:

1️⃣ Helper turns ON availability
2️⃣ Helper selects task types they can do
3️⃣ Helper optionally selects sub-skills
4️⃣ Helper sets distance preference
5️⃣ Show relevant nearby tasks

Screen Copy

Replace:

“Select your skills to start earning money”

With:

What tasks can you help with?
Choose the tasks you are comfortable doing.

Main Skill Categories

These categories should be shown as simple cards with icons.

Helpers can select multiple categories.

1. Carry or Move Things

Help lifting, shifting, or carrying items.

Sub-skills:

Carry luggage
Help shifting items
Move items inside house
Carry heavy objects
Load or unload items
Help move furniture
Move boxes or packages

2. Bring or Deliver Something

Going somewhere to collect or deliver something.

Sub-skills:

Pick up item
Deliver item
Collect documents
Drop item to someone
Return item to store
Bring something from nearby place

3. Fix Something

Small repairs or adjustments.

Sub-skills:

Fix electrical switch or fan
Fix tap or water leak
Fix door lock or handle
Repair appliance
Adjust furniture
General small repairs

4. Set Up or Install Something

Help assembling or setting up items.

Sub-skills:

Assemble furniture
Install curtain rod or shelf
Mount TV or device
Setup internet router
Setup computer or laptop
Install appliance

5. Drive or Transport

Help with driving or vehicle related tasks.

Sub-skills:

Driver for few hours
Driver for one day
Transport items
Pickup or drop someone
Vehicle cleaning help
Fuel or battery help

6. Computer or Mobile Help

Technology support tasks.

Sub-skills:

Coding help
Laptop help
Mobile help
Software installation
Internet / WiFi help
Printer setup
Data transfer help

7. Teach or Guide

Helping someone learn or improve something.

Sub-skills:

Teach skill
Interview preparation
Career guidance
Study help
Resume or portfolio review
Coding guidance

8. Help for Some Time

Temporary assistance.

Sub-skills:

Helper for few hours
Event helper
House organizing help
General assistance
Accompany someone
Hospital assistance

9. Go Somewhere and Do Something

Tasks that involve visiting a place.

Sub-skills:

Submit documents
Collect documents
Stand in queue
Visit office and bring info
Pick something from location

10. Clean or Arrange Things

Basic cleaning or organizing help.

Sub-skills:

Room cleaning
Kitchen cleaning
Organize items
Help arrange storage
Basic house cleaning

11. Pet Help

For pet related help.

Sub-skills:

Dog walking
Pet sitting
Pet feeding
Pet grooming help

12. Other Tasks

Catch-all category.

Sub-skills:

General help
Anything else

Distance Preference

Add a simple distance selector:

How far can you travel?

Options:

1 km
3 km
5 km
10 km

Matching Logic

Helper skills should be mapped with the task intent classification already implemented.

Example:

Task description:

“Need help carrying luggage from bus stand”

Detected intent:

Carry or Move Things

Notify helpers who selected:

Carry or Move Things → Carry luggage

Example:

Task description:

“Need help debugging Python code”

Detected intent:

Computer or Mobile Help → Coding help

Notify helpers with that skill.

Notification Logic

To prevent spam:

Only notify helpers when:

distance match
main category match
sub-skill match

Optional scoring:

distance score
skill match score
helper activity score

UX Improvements

• Replace dropdowns with card selection UI
• Allow multiple selections
• Show selected skill count
• Allow helpers to edit skills anytime
• Keep skill selection simple and readable

Final Goal

The helper should understand the setup in less than 15 seconds.

The system should still support any possible task, including uncommon requests like:

carry luggage from bus stand
help with coding task
collect document from office
driver for one day
mentor for interview

while keeping the UX simple.