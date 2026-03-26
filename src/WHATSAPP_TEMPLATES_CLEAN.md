# WhatsApp Templates - Meta Compliant (No Emojis)

## Important Guidelines

**Meta REJECTS templates with:**
- ❌ Emojis or special characters
- ❌ Promotional language (unless Marketing category)
- ❌ URLs without variables
- ❌ Spelling/grammar errors
- ❌ ALL CAPS text
- ❌ Multiple exclamation marks!!!
- ❌ Misleading content

**Meta APPROVES templates with:**
- ✅ Clear, simple language
- ✅ Proper grammar and punctuation
- ✅ Relevant variable names
- ✅ Correct category selection
- ✅ Professional tone
- ✅ User value/benefit

---

## Template Format Rules

### **Variables:**
- Use double curly braces: `{{variable_name}}`
- Use descriptive names: `{{customer_name}}` not `{{1}}`
- Maximum 1024 characters total
- Maximum variables: Varies by category

### **Buttons (Optional):**
- Call to Action (CTA) buttons allowed
- URL buttons: Can have dynamic parameters
- Quick Reply buttons: Pre-defined responses

### **Categories:**
- **UTILITY:** OTP, account updates, transactions (free)
- **AUTHENTICATION:** OTP, verification codes (free)  
- **MARKETING:** Promotions, updates (requires opt-in, charged)

---

## LocalFelo Templates (8 Total)

### **Template 1: OTP Verification**

**Category:** AUTHENTICATION  
**Language:** English  
**Name:** `localfelo_otp_verification`

**Body:**
```
Hi {{customer_name}}, your LocalFelo verification code is {{otp_code}}. This code is valid for 10 minutes. Do not share this code with anyone.
```

**Variables:**
1. `customer_name` - User's first name
2. `otp_code` - 6-digit OTP

**Footer:** (Optional)
```
LocalFelo - Your Local Marketplace
```

**Buttons:** None

**Notes:**
- Keep under 10 minutes validity
- Mention security ("do not share")
- No emojis in OTP templates

---

### **Template 2: Task Request Received**

**Category:** MARKETING  
**Language:** English  
**Name:** `localfelo_task_request`

**Body:**
```
Hi {{helper_name}}, you have received a new task request for {{task_title}} in {{location}}. Budget: Rs {{budget}}. Check details in the app.
```

**Variables:**
1. `helper_name` - Helper's first name
2. `task_title` - Task title (max 50 chars)
3. `location` - City/area name
4. `budget` - Amount in rupees

**Footer:** (Optional)
```
LocalFelo - Connect Locally
```

**Buttons:** 
- CTA Button 1: "View Task" → URL: `https://localfelo.com/tasks/{{task_id}}`

**Notes:**
- Use "Rs" not "₹" symbol (safer for Meta)
- Keep task title short
- URL button helps with conversion

---

### **Template 3: Task Accepted**

**Category:** MARKETING  
**Language:** English  
**Name:** `localfelo_task_accepted`

**Body:**
```
Good news {{customer_name}}, {{helper_name}} has accepted your task request for {{task_title}}. You can now chat with them to coordinate the details.
```

**Variables:**
1. `customer_name` - Customer's first name
2. `helper_name` - Helper's first name
3. `task_title` - Task title (max 50 chars)

**Footer:** (Optional)
```
LocalFelo
```

**Buttons:**
- CTA Button 1: "Open Chat" → URL: `https://localfelo.com/chat/{{conversation_id}}`

**Notes:**
- Positive but professional tone
- Clear next action (chat)

---

### **Template 4: Task Completed**

**Category:** MARKETING  
**Language:** English  
**Name:** `localfelo_task_completed`

**Body:**
```
Hi {{customer_name}}, {{helper_name}} has marked your task {{task_title}} as completed. Please review and confirm completion in the app.
```

**Variables:**
1. `customer_name` - Customer's first name
2. `helper_name` - Helper's first name
3. `task_title` - Task title (max 50 chars)

**Footer:** (Optional)
```
LocalFelo
```

**Buttons:**
- CTA Button 1: "Review Task" → URL: `https://localfelo.com/tasks/{{task_id}}/review`

**Notes:**
- Calls for action (review)
- Professional confirmation request

---

### **Template 5: Listing Interest**

**Category:** MARKETING  
**Language:** English  
**Name:** `localfelo_listing_interest`

**Body:**
```
Hi {{seller_name}}, {{buyer_name}} has sent you a message about your listing {{listing_title}}. Check your messages to respond.
```

**Variables:**
1. `seller_name` - Seller's first name
2. `buyer_name` - Buyer's first name
3. `listing_title` - Listing title (max 50 chars)

**Footer:** (Optional)
```
LocalFelo
```

**Buttons:**
- CTA Button 1: "View Message" → URL: `https://localfelo.com/chat/{{conversation_id}}`

**Notes:**
- Simple notification
- Drives engagement back to app

---

### **Template 6: Wish Response Received**

**Category:** MARKETING  
**Language:** English  
**Name:** `localfelo_wish_response`

**Body:**
```
Hi {{customer_name}}, someone has responded to your wish for {{wish_title}}. View their response in the app to see if it matches what you are looking for.
```

**Variables:**
1. `customer_name` - Customer's first name
2. `wish_title` - Wish title (max 50 chars)

**Footer:** (Optional)
```
LocalFelo
```

**Buttons:**
- CTA Button 1: "View Response" → URL: `https://localfelo.com/wishes/{{wish_id}}/responses`

**Notes:**
- Professional tone
- Clear value proposition

---

### **Template 7: Wish Fulfilled**

**Category:** MARKETING  
**Language:** English  
**Name:** `localfelo_wish_fulfilled`

**Body:**
```
Great news {{customer_name}}, your wish for {{wish_title}} has been fulfilled by {{fulfiller_name}}. You can now start chatting to coordinate the next steps.
```

**Variables:**
1. `customer_name` - Customer's first name
2. `wish_title` - Wish title (max 50 chars)
3. `fulfiller_name` - Fulfiller's first name

**Footer:** (Optional)
```
LocalFelo
```

**Buttons:**
- CTA Button 1: "Start Chat" → URL: `https://localfelo.com/chat/{{conversation_id}}`

**Notes:**
- Celebratory but professional
- One exclamation allowed (not multiple!!!)

---

### **Template 8: Unread Message Reminder**

**Category:** MARKETING  
**Language:** English  
**Name:** `localfelo_unread_reminder`

**Body:**
```
Hi {{user_name}}, you have {{unread_count}} unread messages on LocalFelo. Check your inbox to stay updated with your conversations.
```

**Variables:**
1. `user_name` - User's first name
2. `unread_count` - Number of unread messages

**Footer:** (Optional)
```
LocalFelo
```

**Buttons:**
- CTA Button 1: "View Messages" → URL: `https://localfelo.com/chat`

**Notes:**
- Helpful reminder
- Not too pushy
- Clear value (stay updated)

---

## Template Creation Checklist

Before submitting each template to Meta:

### **Content Review:**
- [ ] NO emojis anywhere (header, body, footer, buttons)
- [ ] NO special characters (✓, ★, →, etc.)
- [ ] NO ALL CAPS (except brand name if applicable)
- [ ] NO multiple exclamation marks
- [ ] Proper grammar and spelling
- [ ] Clear, professional language
- [ ] Variables use descriptive names {{customer_name}} not {{1}}

### **Category Selection:**
- [ ] **AUTHENTICATION** - Only for OTP/verification codes
- [ ] **UTILITY** - Transactional updates, account changes
- [ ] **MARKETING** - Promotional, engagement, reminders
- [ ] Correct category chosen (affects pricing and approval)

### **Variable Validation:**
- [ ] All variables defined in template creation
- [ ] Variable names match what you'll send in API
- [ ] No more than recommended variables per category
- [ ] Variables use lowercase with underscores

### **Button Configuration:**
- [ ] URL buttons have proper domain
- [ ] Dynamic URL parameters defined correctly
- [ ] Button text is clear and action-oriented
- [ ] Maximum 2 buttons per template

### **Testing Plan:**
- [ ] Sample data ready for each variable
- [ ] Test numbers prepared (your own phone)
- [ ] Edge cases considered (long names, etc.)

---

## Meta Approval Tips

### **Fast Approval (Usually 1-4 hours):**
- Use simple, clear language
- Stick to template purpose
- No promotional language in AUTHENTICATION templates
- Proper grammar and spelling
- Generic enough to be reusable

### **Slow Approval (4-24 hours):**
- Complex templates
- Marketing category (more scrutiny)
- First few templates from new account

### **Common Rejections:**
- Emojis or special characters
- Spelling/grammar errors
- Misleading content
- Wrong category selection
- Too promotional in UTILITY/AUTHENTICATION
- Variable name issues

### **If Rejected:**
1. Read rejection reason carefully
2. Fix the specific issue mentioned
3. Resubmit (don't create new template)
4. Contact provider support if unclear

---

## Alternative Versions (If Needed)

### **Template 2 Alternative (Simpler):**

**Name:** `localfelo_task_request_simple`

**Body:**
```
Hi {{helper_name}}, new task request: {{task_title}} in {{location}}. Budget: Rs {{budget}}.
```

**Notes:** Shorter, might get faster approval

---

### **Template 5 Alternative (More Formal):**

**Name:** `localfelo_listing_interest_formal`

**Body:**
```
Hello {{seller_name}}, you have received an inquiry from {{buyer_name}} regarding your listing: {{listing_title}}. Please check your messages.
```

**Notes:** More formal tone, might be preferred in some regions

---

## Sample Data for Testing

When templates are approved, test with this data:

```json
{
  "customer_name": "Rahul",
  "helper_name": "Priya",
  "seller_name": "Amit",
  "buyer_name": "Neha",
  "task_title": "Home Cleaning",
  "listing_title": "iPhone 13 Pro",
  "wish_title": "Laptop Under 30000",
  "location": "Indiranagar, Bangalore",
  "budget": "500",
  "otp_code": "123456",
  "unread_count": "3",
  "task_id": "abc123",
  "conversation_id": "xyz789",
  "wish_id": "def456"
}
```

---

## Important Notes

### **Do NOT:**
- ❌ Use emojis (😊, 🎉, ✅, etc.)
- ❌ Use special symbols (★, ✓, →, •, etc.)
- ❌ Use rupee symbol (₹) - use "Rs" instead
- ❌ Use all caps (URGENT, IMPORTANT)
- ❌ Use multiple punctuation (!!!, ???)
- ❌ Use promotional words in AUTHENTICATION templates
- ❌ Include hardcoded URLs (always use buttons)
- ❌ Use slang or informal language

### **DO:**
- ✅ Use simple, clear English
- ✅ Use proper grammar and punctuation
- ✅ Use descriptive variable names
- ✅ Use "Rs" for rupees
- ✅ Keep it professional
- ✅ Make it genuinely helpful to user
- ✅ Use CTA buttons for links
- ✅ Test thoroughly before going live

---

## After Template Approval

Once all 8 templates are approved:

1. **Update Edge Function** with exact template names:
   ```typescript
   const TEMPLATE_NAMES = {
     otp: 'localfelo_otp_verification',
     taskRequest: 'localfelo_task_request',
     taskAccepted: 'localfelo_task_accepted',
     taskCompleted: 'localfelo_task_completed',
     listingInterest: 'localfelo_listing_interest',
     wishResponse: 'localfelo_wish_response',
     wishFulfilled: 'localfelo_wish_fulfilled',
     unreadReminder: 'localfelo_unread_reminder'
   };
   ```

2. **Test each template** in Admin Dashboard

3. **Monitor delivery rates** (should be 95%+)

4. **Watch for user feedback**

5. **Optimize based on performance**

---

## Template Naming Convention

**Follow this pattern:**
```
{app_name}_{purpose}_{optional_variant}
```

**Examples:**
- `localfelo_otp_verification`
- `localfelo_task_request`
- `localfelo_listing_interest`

**Rules:**
- Lowercase only
- Underscores, no spaces
- Descriptive and unique
- Max 512 characters (but keep short)

---

## Summary

**8 Clean Templates - No Emojis, Meta Compliant:**

1. ✅ OTP Verification (AUTHENTICATION)
2. ✅ Task Request (MARKETING)
3. ✅ Task Accepted (MARKETING)
4. ✅ Task Completed (MARKETING)
5. ✅ Listing Interest (MARKETING)
6. ✅ Wish Response (MARKETING)
7. ✅ Wish Fulfilled (MARKETING)
8. ✅ Unread Reminder (MARKETING)

**All templates:**
- Professional tone
- Clear language
- No emojis or special characters
- Proper grammar
- Descriptive variables
- CTA buttons where helpful

**Ready to submit to Meta after you get Production access!**
