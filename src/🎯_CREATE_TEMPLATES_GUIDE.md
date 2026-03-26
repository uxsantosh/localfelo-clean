# 🎯 Step-by-Step: Create Templates in Meta

## 🚨 Critical Info First

**You discovered:** Meta AUTHENTICATION templates cannot be customized!

**Solution:** Use Meta's default format for OTP, custom format for everything else.

---

## TEMPLATE 1: OTP (AUTHENTICATION - Meta's Default)

### **Step-by-Step:**

1. **WhatsApp Manager** → **Create template**

2. **Set up template:**
   - Category: **AUTHENTICATION** ⚠️
   - Select type: **One-time passcode**
   - Click "Continue"

3. **Template name and language:**
   - Name: `otp_verification`
   - Language: English
   - Click "Continue"

4. **Code delivery setup:**
   - Select: **Copy code** (recommended)
   - This allows users to copy-paste the OTP

5. **Content:**
   - You'll see: "Content for authentication message templates can't be edited"
   - Preview shows: `{{1}} is your verification code. For your security, do not share this code.`
   - ✅ Check "Add security recommendation"
   - ✅ Check "Add expiry time for the code"

6. **Message validity period:**
   - Set custom validity: **YES**
   - Validity period: **10 minutes**

7. **Submit:**
   - Click "Submit"
   - Wait for approval (1-4 hours typically)

### **What You Get:**

**Message format (FIXED by Meta):**
```
123456 is your verification code. For your security, do not share this code.
```

**Variable:** Just `{{1}}` (the OTP code)

**Code sends:** `{'1': '123456'}`

---

## TEMPLATE 2: Task Request (MARKETING - Custom)

### **Step-by-Step:**

1. **WhatsApp Manager** → **Create template**

2. **Set up template:**
   - Category: **MARKETING** ⚠️
   - Click "Continue"

3. **Template name and language:**
   - Name: `task_request`
   - Language: English

4. **Header:**
   - Type: None (leave empty)

5. **Body:**
   Click "Add body text" and paste:
   ```
   Hi {{helper_name}}, you have received a new task request for {{task_title}} in {{location}}. Budget: Rs {{budget}}. Check details in the app.
   ```

6. **Footer:**
   - Add footer text: `LocalFelo`

7. **Buttons:**
   - Click "Add button"
   - Type: **Call to action**
   - Button type: **Visit website**
   - Button text: `View Task`
   - Website URL: `https://localfelo.com/tasks/{{task_id}}`
   - When adding {{task_id}}, select "Add variable"

8. **Variables:**
   Define each variable:
   - `helper_name` - Type: TEXT
   - `task_title` - Type: TEXT
   - `location` - Type: TEXT
   - `budget` - Type: TEXT
   - `task_id` - Type: TEXT (URL parameter)

9. **Submit:**
   - Click "Submit"
   - Wait for approval (1-24 hours)

---

## TEMPLATE 3: Task Accepted (MARKETING)

**Same steps as Template 2, but with:**

- Name: `task_accepted`
- Body:
  ```
  Good news {{customer_name}}, {{helper_name}} has accepted your task request for {{task_title}}. You can now chat with them to coordinate the details.
  ```
- Button text: `Open Chat`
- URL: `https://localfelo.com/chat/{{conversation_id}}`
- Variables: customer_name, helper_name, task_title, conversation_id

---

## TEMPLATE 4: Task Completed (MARKETING)

**Same steps as Template 2, but with:**

- Name: `task_completed`
- Body:
  ```
  Hi {{customer_name}}, {{helper_name}} has marked your task {{task_title}} as completed. Please review and confirm completion in the app.
  ```
- Button text: `Review Task`
- URL: `https://localfelo.com/tasks/{{task_id}}`
- Variables: customer_name, helper_name, task_title, task_id

---

## TEMPLATE 5: Listing Interest (MARKETING)

**Same steps as Template 2, but with:**

- Name: `listing_interest`
- Body:
  ```
  Hi {{seller_name}}, {{buyer_name}} has sent you a message about your listing {{listing_title}}. Check your messages to respond.
  ```
- Button text: `View Message`
- URL: `https://localfelo.com/chat/{{conversation_id}}`
- Variables: seller_name, buyer_name, listing_title, conversation_id

---

## TEMPLATE 6: Wish Response (MARKETING)

**Same steps as Template 2, but with:**

- Name: `wish_response`
- Body:
  ```
  Hi {{customer_name}}, {{seller_name}} has responded to your wish for {{wish_title}}. View their message in the app.
  ```
- Button text: `View Message`
- URL: `https://localfelo.com/chat/{{conversation_id}}`
- Variables: customer_name, seller_name, wish_title, conversation_id

---

## TEMPLATE 7: Unread Reminder (MARKETING)

**Same steps as Template 2, but with:**

- Name: `unread_reminder`
- Body:
  ```
  Hi {{customer_name}}, you have {{unread_count}} unread messages from {{sender_name}} on LocalFelo. Check your inbox to stay updated.
  ```
- Button text: `View Messages`
- URL: `https://localfelo.com/chat`
- Variables: customer_name, unread_count, sender_name

---

## ⚠️ Common Mistakes to Avoid

### **1. Wrong Category**
- ❌ Using MARKETING for OTP → Will cost money
- ❌ Using AUTHENTICATION for notifications → Can't customize
- ✅ AUTHENTICATION for OTP only, MARKETING for everything else

### **2. Trying to Edit AUTHENTICATION Content**
- ❌ Trying to change "{{1}} is your verification code..."
- ✅ Accept Meta's fixed format for AUTHENTICATION

### **3. Wrong Variable Format**
- ❌ Using {{1}}, {{2}} in MARKETING templates
- ✅ Use {{customer_name}}, {{task_title}} in MARKETING

### **4. Wrong Variable Format for OTP**
- ❌ Using {{customer_name}}, {{otp_code}} in AUTHENTICATION
- ✅ Use {{1}} only (Meta's fixed format)

### **5. Adding Emojis**
- ❌ "Hi {{name}} 😊, you have a new task!"
- ✅ "Hi {{name}}, you have a new task."

### **6. Using ₹ Symbol**
- ❌ "Budget: ₹{{budget}}"
- ✅ "Budget: Rs {{budget}}"

### **7. Mismatched Template Names**
- ❌ Template name: `task-accepted` (code expects `task_accepted`)
- ✅ Template name: `task_accepted` (matches code)

### **8. Mismatched Variable Names**
- ❌ Template: {{customerName}} (code sends customer_name)
- ✅ Template: {{customer_name}} (matches code)

---

## 📋 Approval Checklist

**Before submitting each template:**

- [ ] Template name matches code exactly (e.g., `otp_verification`, `task_accepted`)
- [ ] Category correct (AUTHENTICATION for OTP, MARKETING for rest)
- [ ] No emojis anywhere
- [ ] Using "Rs" not "₹"
- [ ] Variable names in snake_case (customer_name not customerName)
- [ ] All variables defined with type TEXT
- [ ] Footer is "LocalFelo"
- [ ] Button URLs are correct (with variables if needed)
- [ ] No spelling/grammar errors
- [ ] Body text copied exactly from guide

---

## ⏰ Timeline

| Template | Category | Typical Approval Time |
|----------|----------|----------------------|
| 1. OTP Verification | AUTHENTICATION | 1-4 hours |
| 2. Task Request | MARKETING | 4-24 hours |
| 3. Task Accepted | MARKETING | 4-24 hours |
| 4. Task Completed | MARKETING | 4-24 hours |
| 5. Listing Interest | MARKETING | 4-24 hours |
| 6. Wish Response | MARKETING | 4-24 hours |
| 7. Unread Reminder | MARKETING | 4-24 hours |

**Total time:** 1-3 days for all templates

---

## 🎯 Recommended Order

**Create in this order:**

1. **OTP Verification** (AUTHENTICATION)
   - Fastest approval
   - Most critical (needed for login)
   - Test the approval process

2. **Task Accepted** (MARKETING)
   - Simple format
   - High-value notification
   - Test MARKETING approval

3. **Listing Interest** (MARKETING)
   - Simple format
   - High engagement

4. **Wish Response** (MARKETING)
   - Similar to listing interest

5. **Task Completed** (MARKETING)
   - Task flow completion

6. **Unread Reminder** (MARKETING)
   - Engagement driver

7. **Task Request** (MARKETING)
   - Most variables
   - Save for last (most complex)

---

## ✅ After All Templates Approved

1. **No code changes needed!**
   - OTP code already updated to use `{'1': code}`
   - All other code already uses named variables

2. **Test in Admin Dashboard:**
   - Admin → WhatsApp Test tab
   - Test each notification type
   - Verify delivery

3. **Deploy database migrations:**
   - Run in Supabase SQL Editor
   - First: `/migrations/INTERAKT_WHATSAPP_SETUP_CLEAN.sql`
   - Then: `/migrations/INTERAKT_ENHANCED_TRIGGERS.sql`

4. **Add secrets to Supabase:**
   - `INTERAKT_API_KEY`
   - `INTERAKT_BASE_URL`

5. **Go live!** 🚀

---

## 📞 If Templates Get Rejected

### **Common rejection reasons:**

1. **Spelling/grammar errors** → Fix and resubmit
2. **Emojis** → Remove and resubmit
3. **Special characters** → Remove ₹, use Rs
4. **Too promotional** → Make more informational
5. **Variable name issues** → Use descriptive names

### **How to fix:**

1. Read rejection reason carefully
2. Fix the specific issue mentioned
3. Resubmit (don't create new template)
4. If unclear, contact provider support

---

## 💰 Cost Reminder

| Template | Category | Cost |
|----------|----------|------|
| OTP Verification | AUTHENTICATION | FREE |
| All others | MARKETING | ~₹0.25-0.50 per conversation |

**With Aisensy free tier:**
- First 1,000 conversations/month: FREE
- After that: ~₹0.25-0.50 each

**Estimated monthly cost for 2,000 users:**
- OTP: FREE (AUTHENTICATION)
- Other notifications: ~₹250-500 (MARKETING)

---

## 🎊 Summary

**7 Templates Total:**
1. ✅ OTP (AUTHENTICATION) - Meta's fixed format, FREE
2-7. ✅ All others (MARKETING) - Custom format, small cost

**Code Status:**
- ✅ OTP code updated to use positional variable
- ✅ All other code already uses named variables
- ✅ No other changes needed!

**Next Steps:**
1. Create templates in order listed above
2. Wait for approvals (1-3 days total)
3. Test in Admin Dashboard
4. Go live!

---

**You're ready to create templates! Start with OTP (Template 1) first!** 🚀
