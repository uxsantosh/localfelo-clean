# 📱 Interakt WhatsApp Templates - All 13 Templates for LocalFelo

## 🎯 Overview

This document contains **all 13 WhatsApp message templates** needed for LocalFelo's complete notification system.

**Phase 1 (Critical - 5 templates):** Already implemented with triggers  
**Phase 2 (Important - 8 templates):** Need to add code + create templates

---

## ✅ PHASE 1: Already Implemented (5 Templates)

These have database triggers and are ready to use once templates are approved.

---

### Template 1: `otp_verification`

**Category:** AUTHENTICATION  
**Button Type:** One Time Passcode → Copy Code  
**Validity:** 10 minutes

**Body:**
```
Hi {{1}},

Your LocalFelo verification code is: {{2}}

Valid for {{3}}.

Do not share this code with anyone.

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `123456`
- {{3}}: `10 minutes`

**Variables in Code:**
- `customer_name` ({{1}})
- `otp_code` ({{2}})
- `validity` ({{3}})

---

### Template 2: `task_accepted`

**Category:** UTILITY  
**Button Type:** None

**Body:**
```
Hi {{1}},

Great news! {{2}} has accepted your task "{{3}}" for {{4}}.

You can now chat with them on LocalFelo to coordinate details.

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Priya Sharma`
- {{3}}: `Clean my house`
- {{4}}: `₹500`

**Variables in Code:**
- `customer_name` ({{1}})
- `helper_name` ({{2}})
- `task_title` ({{3}})
- `task_price` ({{4}})

---

### Template 3: `task_cancelled`

**Category:** UTILITY  
**Button Type:** None

**Body:**
```
Hi {{1}},

The task "{{2}}" has been cancelled by {{3}}.

You can post a new task or browse other helpers on LocalFelo.

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Clean my house`
- {{3}}: `Priya Sharma`

**Variables in Code:**
- `customer_name` ({{1}})
- `task_title` ({{2}})
- `cancelled_by` ({{3}})

---

### Template 4: `task_completed`

**Category:** UTILITY  
**Button Type:** None

**Body:**
```
Hi {{1}},

Your task "{{3}}" has been completed by {{2}}!

Payment: {{4}}

Please rate your experience on LocalFelo.

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Priya Sharma`
- {{3}}: `Clean my house`
- {{4}}: `₹500`

**Variables in Code:**
- `customer_name` ({{1}})
- `helper_name` ({{2}})
- `task_title` ({{3}})
- `task_price` ({{4}})

---

### Template 5: `first_message`

**Category:** UTILITY  
**Button Type:** None

**Body:**
```
Hi {{1}},

{{2}} sent you a message about your {{5}} "{{3}}":

"{{4}}"

Reply now on LocalFelo!

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Priya Sharma`
- {{3}}: `Old sofa for sale`
- {{4}}: `Hello! Is this still available?`
- {{5}}: `listing`

**Variables in Code:**
- `customer_name` ({{1}})
- `sender_name` ({{2}})
- `listing_title` ({{3}})
- `message_preview` ({{4}})
- `listing_type` ({{5}}) - "listing", "task", or "wish"

---

## 🚀 PHASE 2: Need to Implement (8 Templates)

These templates need code implementation + Interakt template creation.

---

### Template 6: `listing_interest` ⚠️ NEW

**Category:** UTILITY  
**Button Type:** None

**When sent:** First message on a marketplace listing

**Body:**
```
Hi {{1}},

{{2}} is interested in your listing "{{3}}"!

They sent: "{{4}}"

Reply now on LocalFelo to close the deal!

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Priya Sharma`
- {{3}}: `iPhone 13 Pro Max`
- {{4}}: `What's your best price?`

**Variables in Code:**
- `seller_name` ({{1}})
- `buyer_name` ({{2}})
- `listing_title` ({{3}})
- `message_preview` ({{4}})

---

### Template 7: `wish_response` ⚠️ NEW

**Category:** UTILITY  
**Button Type:** None

**When sent:** First message on a wish

**Body:**
```
Hi {{1}},

Good news! {{2}} can fulfill your wish for "{{3}}".

Message: "{{4}}"

Check it out on LocalFelo now!

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Priya Sharma`
- {{3}}: `Looking for iPhone 13`
- {{4}}: `I have one in mint condition!`

**Variables in Code:**
- `customer_name` ({{1}})
- `seller_name` ({{2}})
- `wish_title` ({{3}})
- `message_preview` ({{4}})

---

### Template 8: `helper_applied` ⚠️ NEW

**Category:** UTILITY  
**Button Type:** None

**When sent:** Helper applies to a task (before accepting)

**Body:**
```
Hi {{1}},

{{2}} wants to help with your task "{{3}}"!

Offered price: {{4}}
Distance: {{5}}

View their profile and chat on LocalFelo!

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Priya Sharma`
- {{3}}: `Clean my house`
- {{4}}: `₹450`
- {{5}}: `2.5 km away`

**Variables in Code:**
- `customer_name` ({{1}})
- `helper_name` ({{2}})
- `task_title` ({{3}})
- `offered_price` ({{4}})
- `distance` ({{5}})

---

### Template 9: `unread_reminder` ⚠️ NEW

**Category:** UTILITY  
**Button Type:** None

**When sent:** 6 hours after last message (if unread)

**Body:**
```
Hi {{1}},

You have {{2}} unread message(s) on LocalFelo!

Latest from {{3}}: "{{4}}"

Don't miss out - reply now!

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `3`
- {{3}}: `Priya Sharma`
- {{4}}: `Are you still interested?`

**Variables in Code:**
- `customer_name` ({{1}})
- `unread_count` ({{2}})
- `sender_name` ({{3}})
- `message_preview` ({{4}})

---

### Template 10: `pending_helpers`

**Category:** UTILITY  
**Button Type:** None

**When sent:** 6 hours after task posted (if no helper accepted)

**Body:**
```
Hi {{1}},

You have {{2}} helper(s) waiting to help with "{{3}}"!

They're ready to start. Review and accept on LocalFelo now.

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `5`
- {{3}}: `Clean my house`

**Variables in Code:**
- `customer_name` ({{1}})
- `helper_count` ({{2}})
- `task_title` ({{3}})

---

### Template 11: `daily_summary`

**Category:** UTILITY  
**Button Type:** None

**When sent:** Daily at 6 PM (if user inactive for 24+ hours)

**Body:**
```
Hi {{1}},

Today's LocalFelo activity:
• {{2}} new messages
• {{3}} views on your listings
• {{4}} helpers nearby for your tasks

Open LocalFelo to stay connected!

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `5`
- {{3}}: `12`
- {{4}}: `8`

**Variables in Code:**
- `customer_name` ({{1}})
- `message_count` ({{2}})
- `view_count` ({{3}})
- `helper_count` ({{4}})

---

### Template 12: `task_deadline`

**Category:** UTILITY  
**Button Type:** None

**When sent:** 24 hours before task deadline

**Body:**
```
Hi {{1}},

Reminder: Your task "{{2}}" deadline is in {{3}}.

No helper yet? Increase your budget or adjust requirements on LocalFelo.

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`
- {{2}}: `Clean my house`
- {{3}}: `24 hours`

**Variables in Code:**
- `customer_name` ({{1}})
- `task_title` ({{2}})
- `time_remaining` ({{3}})

---

### Template 13: `account_verified`

**Category:** UTILITY  
**Button Type:** None

**When sent:** After successful phone verification

**Body:**
```
Hi {{1}},

Welcome to LocalFelo!

Your account is verified. Start exploring:
• Buy and sell locally
• Post wishes
• Find helpers nearby

Let's get started!

- LocalFelo Team
```

**Sample Values:**
- {{1}}: `Rajesh Kumar`

**Variables in Code:**
- `customer_name` ({{1}})

---

## 📊 Template Summary

| # | Template Name | Category | Priority | Status |
|---|---|---|---|---|
| 1 | `otp_verification` | AUTHENTICATION | Critical | ✅ Code Ready |
| 2 | `task_accepted` | UTILITY | Critical | ✅ Code Ready |
| 3 | `task_cancelled` | UTILITY | Critical | ✅ Code Ready |
| 4 | `task_completed` | UTILITY | Critical | ✅ Code Ready |
| 5 | `first_message` | UTILITY | Critical | ✅ Code Ready |
| 6 | `listing_interest` | UTILITY | High | ⏳ Need Code |
| 7 | `wish_response` | UTILITY | High | ⏳ Need Code |
| 8 | `helper_applied` | UTILITY | High | ⏳ Need Code |
| 9 | `unread_reminder` | UTILITY | High | ⏳ Need Code |
| 10 | `pending_helpers` | UTILITY | Medium | ⏳ Need Code |
| 11 | `daily_summary` | UTILITY | Medium | ⏳ Need Code |
| 12 | `task_deadline` | UTILITY | Low | ⏳ Need Code |
| 13 | `account_verified` | UTILITY | Low | ⏳ Need Code |

---

## 🎯 Implementation Priority

### **Do Now (Phase 1):**
1. Create Templates 1-5 in Interakt Dashboard
2. Wait for approval
3. Test with database triggers

### **Do Next (Phase 2A - Critical):**
4. Create Templates 6-9 in Interakt Dashboard
5. Implement code for these 4 templates
6. Add background job for 6-hour reminders

### **Do Later (Phase 2B - Nice to Have):**
7. Create Templates 10-13
8. Implement code
9. Add scheduling system

---

## 🔧 Code Implementation Status

### ✅ Already Implemented:
- `/services/interaktWhatsApp.ts` - Service functions for templates 1-5
- `/supabase/functions/send-whatsapp-notification/index.ts` - Edge function
- `/migrations/INTERAKT_WHATSAPP_SETUP_CLEAN.sql` - Database triggers for templates 2-5
- `/services/authPhone.ts` - OTP integration for template 1

### ⏳ Need to Implement:
- Add functions for templates 6-13 to `interaktWhatsApp.ts`
- Create background job for 6-hour inactivity checks
- Add template 6-7 triggers to chat system
- Add template 8 trigger to task application system
- Create cron job for templates 9-13

---

## 📝 Variable Mapping Reference

All templates use this structure in Interakt:
- `{{1}}` = First variable (usually customer_name)
- `{{2}}` = Second variable
- `{{3}}` = Third variable
- etc.

In code, we pass variables as:
```typescript
{
  customer_name: "Rajesh Kumar",  // Becomes {{1}}
  helper_name: "Priya Sharma",    // Becomes {{2}}
  task_title: "Clean house"       // Becomes {{3}}
}
```

Interakt automatically maps object values to {{1}}, {{2}}, {{3}} in the order they appear in the object.

---

## ✅ Next Steps

1. **Wait for Interakt account approval**
2. **Create Templates 1-5 first** (Phase 1)
3. **Test Phase 1 templates** with real users
4. **Create Templates 6-9** (Phase 2A - Critical)
5. **Implement code for Templates 6-9**
6. **Test Phase 2A**
7. **Create Templates 10-13** (Phase 2B - Optional)
8. **Implement code for Templates 10-13**

---

**Total Templates:** 13  
**Already Coded:** 5  
**Need to Code:** 8  
**Estimated Time to Implement Remaining:** 2-3 hours

---

Good luck! 🚀
