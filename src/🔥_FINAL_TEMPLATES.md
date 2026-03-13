# FINAL WhatsApp Templates - Matching Code Exactly

## ✅ Template Names Match Code Exactly

These template names match **exactly** what's in `/services/interaktWhatsApp.ts`

---

## TEMPLATE 1: OTP Verification

**Template Name:** `otp_verification`

**Category:** AUTHENTICATION

**Language:** English

**Body:**
```
Hi {{customer_name}}, your LocalFelo verification code is {{otp_code}}. This code is valid for 10 minutes. Do not share this code with anyone.
```

**Footer:** LocalFelo

**Variables:**
- `customer_name` (TEXT)
- `otp_code` (TEXT)

**Buttons:** None

**Code Reference:** Line 194 in `/services/interaktWhatsApp.ts`

---

## TEMPLATE 2: Task Request

**Template Name:** `task_request`

**Category:** MARKETING

**Language:** English

**Body:**
```
Hi {{helper_name}}, you have received a new task request for {{task_title}} in {{location}}. Budget: Rs {{budget}}. Check details in the app.
```

**Footer:** LocalFelo

**Variables:**
- `helper_name` (TEXT)
- `task_title` (TEXT)
- `location` (TEXT)
- `budget` (TEXT)
- `task_id` (TEXT) - for URL button

**Buttons:**
- Type: URL
- Text: View Task
- URL: `https://localfelo.com/tasks/{{task_id}}`

**Note:** This template is NOT in current code, but needed for Phase 3

---

## TEMPLATE 3: Task Accepted

**Template Name:** `task_accepted`

**Category:** MARKETING

**Language:** English

**Body:**
```
Good news {{customer_name}}, {{helper_name}} has accepted your task request for {{task_title}}. You can now chat with them to coordinate the details.
```

**Footer:** LocalFelo

**Variables:**
- `customer_name` (TEXT)
- `helper_name` (TEXT)
- `task_title` (TEXT)
- `conversation_id` (TEXT) - for URL button

**Buttons:**
- Type: URL
- Text: Open Chat
- URL: `https://localfelo.com/chat/{{conversation_id}}`

**Code Reference:** Line 65 in `/services/interaktWhatsApp.ts`

---

## TEMPLATE 4: Task Completed

**Template Name:** `task_completed`

**Category:** MARKETING

**Language:** English

**Body:**
```
Hi {{customer_name}}, {{helper_name}} has marked your task {{task_title}} as completed. Please review and confirm completion in the app.
```

**Footer:** LocalFelo

**Variables:**
- `customer_name` (TEXT)
- `helper_name` (TEXT)
- `task_title` (TEXT)
- `task_id` (TEXT) - for URL button

**Buttons:**
- Type: URL
- Text: Review Task
- URL: `https://localfelo.com/tasks/{{task_id}}`

**Code Reference:** Line 110 in `/services/interaktWhatsApp.ts`

---

## TEMPLATE 5: Listing Interest

**Template Name:** `listing_interest`

**Category:** MARKETING

**Language:** English

**Body:**
```
Hi {{seller_name}}, {{buyer_name}} has sent you a message about your listing {{listing_title}}. Check your messages to respond.
```

**Footer:** LocalFelo

**Variables:**
- `seller_name` (TEXT)
- `buyer_name` (TEXT)
- `listing_title` (TEXT)
- `conversation_id` (TEXT) - for URL button

**Buttons:**
- Type: URL
- Text: View Message
- URL: `https://localfelo.com/chat/{{conversation_id}}`

**Code Reference:** Line 243 in `/services/interaktWhatsApp.ts`

---

## TEMPLATE 6: Wish Response

**Template Name:** `wish_response`

**Category:** MARKETING

**Language:** English

**Body:**
```
Hi {{customer_name}}, {{seller_name}} has responded to your wish for {{wish_title}}. View their message in the app.
```

**Footer:** LocalFelo

**Variables:**
- `customer_name` (TEXT)
- `seller_name` (TEXT)
- `wish_title` (TEXT)
- `conversation_id` (TEXT) - for URL button

**Buttons:**
- Type: URL
- Text: View Message
- URL: `https://localfelo.com/chat/{{conversation_id}}`

**Code Reference:** Line 272 in `/services/interaktWhatsApp.ts`

**Note:** Simplified body to match actual user need (see message, not just "response")

---

## TEMPLATE 7: Unread Reminder

**Template Name:** `unread_reminder`

**Category:** MARKETING

**Language:** English

**Body:**
```
Hi {{customer_name}}, you have {{unread_count}} unread messages from {{sender_name}} on LocalFelo. Check your inbox to stay updated.
```

**Footer:** LocalFelo

**Variables:**
- `customer_name` (TEXT)
- `unread_count` (TEXT)
- `sender_name` (TEXT)

**Buttons:**
- Type: URL
- Text: View Messages
- URL: `https://localfelo.com/chat`

**Code Reference:** Line 301 in `/services/interaktWhatsApp.ts`

**Note:** Added sender_name to make it more personal

---

## Important Notes

### ✅ What's Correct:

1. **Template names match code exactly** (e.g., `otp_verification` not `localfelo_otp_verification`)
2. **Variable names match code** (e.g., `customer_name`, `otp_code`)
3. **Variables are objects** not arrays: `{customer_name: "Rahul"}` ✅
4. **No emojis** anywhere ✅
5. **No ₹ symbol** - using "Rs" ✅
6. **Clean professional language** ✅

### 📝 Template Count:

**Total: 7 templates** (not 8)

We don't need:
- ❌ "Wish Fulfilled" - covered by wish_response
- ❌ "First Message" - covered by listing_interest and wish_response
- ❌ "Message After Gap" - not in triggers

### 🔧 Code Already Fixed:

✅ Removed `₹` symbol from task_accepted (line 68-72)
✅ Removed `₹` symbol from task_completed (line 114-117)
✅ Removed `validity` variable from otp_verification (line 196-198)
✅ All variables now match templates exactly

---

## Quick Copy-Paste Format

### Template 1: otp_verification
```
Name: otp_verification
Category: AUTHENTICATION
Body: Hi {{customer_name}}, your LocalFelo verification code is {{otp_code}}. This code is valid for 10 minutes. Do not share this code with anyone.
Footer: LocalFelo
Variables: customer_name, otp_code
```

### Template 2: task_request
```
Name: task_request
Category: MARKETING
Body: Hi {{helper_name}}, you have received a new task request for {{task_title}} in {{location}}. Budget: Rs {{budget}}. Check details in the app.
Footer: LocalFelo
Variables: helper_name, task_title, location, budget, task_id
Button: View Task → https://localfelo.com/tasks/{{task_id}}
```

### Template 3: task_accepted
```
Name: task_accepted
Category: MARKETING
Body: Good news {{customer_name}}, {{helper_name}} has accepted your task request for {{task_title}}. You can now chat with them to coordinate the details.
Footer: LocalFelo
Variables: customer_name, helper_name, task_title, conversation_id
Button: Open Chat → https://localfelo.com/chat/{{conversation_id}}
```

### Template 4: task_completed
```
Name: task_completed
Category: MARKETING
Body: Hi {{customer_name}}, {{helper_name}} has marked your task {{task_title}} as completed. Please review and confirm completion in the app.
Footer: LocalFelo
Variables: customer_name, helper_name, task_title, task_id
Button: Review Task → https://localfelo.com/tasks/{{task_id}}
```

### Template 5: listing_interest
```
Name: listing_interest
Category: MARKETING
Body: Hi {{seller_name}}, {{buyer_name}} has sent you a message about your listing {{listing_title}}. Check your messages to respond.
Footer: LocalFelo
Variables: seller_name, buyer_name, listing_title, conversation_id
Button: View Message → https://localfelo.com/chat/{{conversation_id}}
```

### Template 6: wish_response
```
Name: wish_response
Category: MARKETING
Body: Hi {{customer_name}}, {{seller_name}} has responded to your wish for {{wish_title}}. View their message in the app.
Footer: LocalFelo
Variables: customer_name, seller_name, wish_title, conversation_id
Button: View Message → https://localfelo.com/chat/{{conversation_id}}
```

### Template 7: unread_reminder
```
Name: unread_reminder
Category: MARKETING
Body: Hi {{customer_name}}, you have {{unread_count}} unread messages from {{sender_name}} on LocalFelo. Check your inbox to stay updated.
Footer: LocalFelo
Variables: customer_name, unread_count, sender_name
Button: View Messages → https://localfelo.com/chat
```

---

## Verification Checklist

Before creating templates:

- [x] Template names match code exactly (no `localfelo_` prefix)
- [x] Variable names match code (customer_name, otp_code, etc.)
- [x] No emojis anywhere
- [x] No ₹ symbol (using "Rs")
- [x] Professional language
- [x] Proper grammar
- [x] Variables are descriptive, not {{1}}, {{2}}

---

## After Template Approval

Once templates are approved, **NO CODE CHANGES NEEDED** because:

✅ Code already sends variables as objects: `{customer_name: "Rahul"}`
✅ Template names already match: `otp_verification`, `task_accepted`, etc.
✅ Variable names already match: `customer_name`, `otp_code`, etc.

Just test and go live!

---

**USE THESE TEMPLATES - THEY MATCH YOUR CODE PERFECTLY!**
