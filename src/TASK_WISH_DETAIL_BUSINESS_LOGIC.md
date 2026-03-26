# TASK & WISH DETAIL SCREEN - COMPLETE BUSINESS LOGIC

## Core Principles
1. **LocalFelo is mediator-only**: NO payments, NO delivery, NO financial involvement
2. **Users contact sellers directly** through chat ONLY
3. **Owner = Creator** (person who posted the task/wish)
4. **Helper = Acceptor** (person who accepts to help with task/wish)

## Database Schema Understanding

### TASKS TABLE
```sql
- id (uuid)
- title (text)
- description (text)
- status (text): 'open' | 'accepted' | 'in_progress' | 'completed' | 'closed'
- user_id (uuid) - CREATOR'S ID
- accepted_by (uuid) - HELPER'S ID (null if not accepted)
- helper_id (uuid) - Same as accepted_by
- helper_completed (boolean) - Helper confirmed completion
- creator_completed (boolean) - Creator confirmed completion
- created_at (timestamp)
- completed_at (timestamp)
- owner_token (text) - for ownership verification
```

### WISHES TABLE
```sql
- id (uuid)
- title (text)
- description (text)
- status (text): 'open' | 'accepted' | 'in_progress' | 'completed' | 'fulfilled'
- user_id (uuid) - CREATOR'S ID
- accepted_by (uuid) - HELPER'S ID (null if not accepted)
- helper_id (uuid) - Same as accepted_by
- helper_completed (boolean) - Helper confirmed completion
- creator_completed (boolean) - Creator confirmed completion
- created_at (timestamp)
- completed_at (timestamp)
- owner_token (text) - for ownership verification
```

## Button Flows for TASKS

### ROLE: TASK CREATOR (Owner)
```
STATUS: OPEN
├─ Buttons: [Edit] [Delete]
└─ Reason: Task not yet accepted, creator can modify or remove it

STATUS: ACCEPTED or IN_PROGRESS
├─ Buttons: [Chat with Helper] [Complete]
└─ Reason: Someone accepted, creator needs to coordinate and confirm completion
└─ NO Cancel button - once accepted, only helper can cancel
└─ NO Navigate button - creator doesn't need directions to their own task

STATUS: COMPLETED
├─ Buttons: None (read-only, maybe [View Chat History])
└─ Reason: Task is done, no more actions needed
```

### ROLE: TASK HELPER (Acceptor)
```
STATUS: OPEN (Before accepting)
├─ Buttons: [Negotiate] [Accept Task]
└─ Reason: Helper can chat first or directly accept

STATUS: ACCEPTED or IN_PROGRESS (After accepting)
├─ Buttons: [Chat] [Navigate] [Complete] [Cancel]
└─ Reason: Helper needs directions, can chat, confirm completion, or back out
└─ Cancel returns task to OPEN status for others

STATUS: COMPLETED
├─ Buttons: None (read-only)
└─ Reason: Task is done
```

### ROLE: OTHER USERS (Not creator, not helper)
```
STATUS: OPEN
├─ Buttons: [Negotiate] [Accept Task]
└─ Reason: Anyone can accept available tasks

STATUS: ACCEPTED or IN_PROGRESS
├─ Buttons: None (read-only)
└─ Message: "This task has been accepted by someone else"

STATUS: COMPLETED
├─ Buttons: None (read-only)
└─ Message: "This task is completed"
```

## Button Flows for WISHES

### ROLE: WISH CREATOR (Owner)
```
STATUS: OPEN
├─ Buttons: [Edit] [Delete]
└─ Reason: Wish not yet accepted, creator can modify or remove it

STATUS: ACCEPTED or IN_PROGRESS
├─ Buttons: [Chat with Helper] [Mark Fulfilled]
└─ Reason: Someone accepted to help, creator needs to coordinate
└─ NO Cancel button - once accepted, only helper can cancel
└─ NO Navigate button - creator doesn't go anywhere, helper comes to them

STATUS: COMPLETED/FULFILLED
├─ Buttons: None (read-only)
└─ Reason: Wish is fulfilled
```

### ROLE: WISH HELPER (Acceptor)
```
STATUS: OPEN (Before accepting)
├─ Buttons: [Chat] [Accept to Help]
└─ Reason: Helper can chat first or directly accept

STATUS: ACCEPTED or IN_PROGRESS (After accepting)
├─ Buttons: [Chat] [Navigate] [Mark Fulfilled] [Cancel]
└─ Reason: Helper needs directions, can chat, confirm fulfillment, or back out
└─ Navigate button goes to wish creator's location

STATUS: COMPLETED/FULFILLED
├─ Buttons: None (read-only)
└─ Reason: Wish is fulfilled
```

### ROLE: OTHER USERS (Not creator, not helper)
```
STATUS: OPEN
├─ Buttons: [Chat] [Accept to Help]
└─ Reason: Anyone can help with open wishes

STATUS: ACCEPTED or IN_PROGRESS
├─ Buttons: None (read-only)
└─ Message: "Someone is already helping with this wish"

STATUS: COMPLETED/FULFILLED
├─ Buttons: None (read-only)
└─ Message: "This wish has been fulfilled"
```

## Dual Completion System

Both Tasks and Wishes use a **dual confirmation** system:

1. **Helper completes first**: 
   - Clicks "Complete" → Sets `helper_completed = true`
   - Status stays as "accepted" or "in_progress"
   - Creator gets notification: "Helper marked this as complete. Please confirm."

2. **Creator confirms**:
   - Clicks "Complete" → Sets `creator_completed = true`
   - If BOTH `helper_completed` AND `creator_completed` are true:
     - Status changes to "completed" (tasks) or "fulfilled" (wishes)
     - `completed_at` timestamp is set
     - Both parties get confirmation notification

3. **Undo option**:
   - Either party can undo their completion BEFORE the other confirms
   - Once both confirm, no undo (task/wish is permanently completed)

## Important Implementation Notes

1. **User ID Resolution**: 
   - Always resolve token-based IDs to actual UUIDs before comparisons
   - Check both `currentUser.id` AND resolved UUID from profiles table

2. **Status Values**:
   - Tasks: `'open'`, `'accepted'`, `'in_progress'`, `'completed'`, `'closed'`
   - Wishes: `'open'`, `'accepted'`, `'in_progress'`, `'completed'`, `'fulfilled'`

3. **Navigation**:
   - Only helpers get Navigate button (they go TO the task/wish location)
   - Creators never need Navigate (it's their own location)

4. **Cancel Permissions**:
   - ONLY helper can cancel accepted tasks/wishes
   - Backend should enforce this rule
   - Creator can only delete while status = 'open'

5. **Chat Context**:
   - Helper + OPEN task → Chat creates conversation with creator
   - Helper + ACCEPTED task → Chat opens existing conversation
   - Creator + ACCEPTED task → Chat opens conversation with helper

## Backend Functions to Update

### tasks.ts / wishes.ts
```typescript
- acceptTask/acceptWish: Update status to 'accepted', set accepted_by and helper_id
- cancelTask/cancelWish: Only allow if user is helper, reset to 'open'
- deleteTask/deleteWish: Only allow if user is creator AND status is 'open'
- confirmCompletion: Set helper_completed or creator_completed, check both for final completion
```

## UI Components to Rebuild

1. **TaskDetailScreen.tsx** - Complete rebuild with proper role detection
2. **WishDetailScreen.tsx** - Complete rebuild with proper role detection
3. Ensure consistent header with location display
4. Ensure proper button ordering and styling
5. Show completion status alerts when partial completion exists
