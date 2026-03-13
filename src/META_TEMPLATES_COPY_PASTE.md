# Copy-Paste Templates for Meta

## How to Use

1. Go to your WhatsApp provider (Interakt/Aisensy)
2. Navigate to Templates section
3. Click "Create Template"
4. Copy-paste the information below for each template

---

## Template 1: OTP Verification

**Template Name:** `localfelo_otp_verification`

**Category:** AUTHENTICATION

**Language:** English

**Header:** None

**Body:**
```
Hi {{customer_name}}, your LocalFelo verification code is {{otp_code}}. This code is valid for 10 minutes. Do not share this code with anyone.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** None

**Variables:**
1. `customer_name` - TEXT
2. `otp_code` - TEXT

---

## Template 2: Task Request

**Template Name:** `localfelo_task_request`

**Category:** MARKETING

**Language:** English

**Header:** None

**Body:**
```
Hi {{helper_name}}, you have received a new task request for {{task_title}} in {{location}}. Budget: Rs {{budget}}. Check details in the app.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** 
- Button Type: URL
- Button Text: View Task
- URL: `https://localfelo.com/tasks/{{task_id}}`

**Variables:**
1. `helper_name` - TEXT
2. `task_title` - TEXT
3. `location` - TEXT
4. `budget` - TEXT
5. `task_id` - TEXT (for URL button)

---

## Template 3: Task Accepted

**Template Name:** `localfelo_task_accepted`

**Category:** MARKETING

**Language:** English

**Header:** None

**Body:**
```
Good news {{customer_name}}, {{helper_name}} has accepted your task request for {{task_title}}. You can now chat with them to coordinate the details.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** 
- Button Type: URL
- Button Text: Open Chat
- URL: `https://localfelo.com/chat/{{conversation_id}}`

**Variables:**
1. `customer_name` - TEXT
2. `helper_name` - TEXT
3. `task_title` - TEXT
4. `conversation_id` - TEXT (for URL button)

---

## Template 4: Task Completed

**Template Name:** `localfelo_task_completed`

**Category:** MARKETING

**Language:** English

**Header:** None

**Body:**
```
Hi {{customer_name}}, {{helper_name}} has marked your task {{task_title}} as completed. Please review and confirm completion in the app.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** 
- Button Type: URL
- Button Text: Review Task
- URL: `https://localfelo.com/tasks/{{task_id}}`

**Variables:**
1. `customer_name` - TEXT
2. `helper_name` - TEXT
3. `task_title` - TEXT
4. `task_id` - TEXT (for URL button)

---

## Template 5: Listing Interest

**Template Name:** `localfelo_listing_interest`

**Category:** MARKETING

**Language:** English

**Header:** None

**Body:**
```
Hi {{seller_name}}, {{buyer_name}} has sent you a message about your listing {{listing_title}}. Check your messages to respond.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** 
- Button Type: URL
- Button Text: View Message
- URL: `https://localfelo.com/chat/{{conversation_id}}`

**Variables:**
1. `seller_name` - TEXT
2. `buyer_name` - TEXT
3. `listing_title` - TEXT
4. `conversation_id` - TEXT (for URL button)

---

## Template 6: Wish Response

**Template Name:** `localfelo_wish_response`

**Category:** MARKETING

**Language:** English

**Header:** None

**Body:**
```
Hi {{customer_name}}, someone has responded to your wish for {{wish_title}}. View their response in the app to see if it matches what you are looking for.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** 
- Button Type: URL
- Button Text: View Response
- URL: `https://localfelo.com/wishes/{{wish_id}}`

**Variables:**
1. `customer_name` - TEXT
2. `wish_title` - TEXT
3. `wish_id` - TEXT (for URL button)

---

## Template 7: Wish Fulfilled

**Template Name:** `localfelo_wish_fulfilled`

**Category:** MARKETING

**Language:** English

**Header:** None

**Body:**
```
Great news {{customer_name}}, your wish for {{wish_title}} has been fulfilled by {{fulfiller_name}}. You can now start chatting to coordinate the next steps.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** 
- Button Type: URL
- Button Text: Start Chat
- URL: `https://localfelo.com/chat/{{conversation_id}}`

**Variables:**
1. `customer_name` - TEXT
2. `wish_title` - TEXT
3. `fulfiller_name` - TEXT
4. `conversation_id` - TEXT (for URL button)

---

## Template 8: Unread Reminder

**Template Name:** `localfelo_unread_reminder`

**Category:** MARKETING

**Language:** English

**Header:** None

**Body:**
```
Hi {{user_name}}, you have {{unread_count}} unread messages on LocalFelo. Check your inbox to stay updated with your conversations.
```

**Footer:** 
```
LocalFelo
```

**Buttons:** 
- Button Type: URL
- Button Text: View Messages
- URL: `https://localfelo.com/chat`

**Variables:**
1. `user_name` - TEXT
2. `unread_count` - TEXT

---

## Important Notes

### Before Creating Templates:

1. **Replace Domain:** If you have your own domain, replace `localfelo.com` with your actual domain
2. **URL Structure:** Make sure URLs match your app's routing structure
3. **No Emojis:** Double-check no emojis were accidentally added
4. **No Symbols:** Don't use ₹, use "Rs" instead

### During Template Creation:

1. **Category Selection:**
   - Template 1 → AUTHENTICATION (free)
   - Templates 2-8 → MARKETING (requires opt-in)

2. **Variable Configuration:**
   - All variables are type: TEXT
   - Variable names must match exactly (case-sensitive)
   - URL button variables are separate from body variables

3. **Button Setup:**
   - If adding URL buttons, mark variables as "URL parameters"
   - Example: In URL `https://localfelo.com/tasks/{{task_id}}`, the `task_id` is a URL parameter

### After Submission:

1. **Approval Time:** 1-24 hours per template
2. **Status Check:** Check template status regularly
3. **Rejection:** If rejected, read reason carefully and fix the specific issue mentioned

---

## Simplified Versions (If Complex Ones Get Rejected)

If any template gets rejected, try these simpler versions:

### Alternative Template 2 (Simpler):

**Body:**
```
Hi {{helper_name}}, new task: {{task_title}} in {{location}}. Budget: Rs {{budget}}.
```

### Alternative Template 5 (Simpler):

**Body:**
```
Hi {{seller_name}}, {{buyer_name}} messaged about {{listing_title}}. Check your messages.
```

---

## Quick Reference

| Template | Category | Variables | Button |
|----------|----------|-----------|--------|
| OTP Verification | AUTHENTICATION | 2 | No |
| Task Request | MARKETING | 5 | Yes |
| Task Accepted | MARKETING | 4 | Yes |
| Task Completed | MARKETING | 4 | Yes |
| Listing Interest | MARKETING | 4 | Yes |
| Wish Response | MARKETING | 3 | Yes |
| Wish Fulfilled | MARKETING | 4 | Yes |
| Unread Reminder | MARKETING | 2 | Yes |

---

## Template Creation Order

**Recommended order:**

1. Start with **Template 1 (OTP)** - Simplest, AUTHENTICATION category
2. Then **Template 8 (Unread)** - Simpler MARKETING template
3. Then create Templates 2-7

This helps you understand the approval process with simpler templates first.

---

## Testing After Approval

Once approved, test with these sample values:

```json
{
  "customer_name": "Rahul",
  "helper_name": "Priya",
  "seller_name": "Amit",
  "buyer_name": "Neha",
  "fulfiller_name": "Vikram",
  "user_name": "Sarah",
  "task_title": "Home Cleaning",
  "listing_title": "iPhone 13 Pro",
  "wish_title": "Laptop Under 30000",
  "location": "Indiranagar",
  "budget": "500",
  "otp_code": "123456",
  "unread_count": "3",
  "task_id": "abc123",
  "conversation_id": "xyz789",
  "wish_id": "def456"
}
```

---

**Ready to create! Copy each template above and paste into your WhatsApp provider's template creation interface.**
