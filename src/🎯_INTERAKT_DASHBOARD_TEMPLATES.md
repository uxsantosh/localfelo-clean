# Create Templates in Interakt Dashboard (Not Meta!)

## 🚨 Important: Don't Use Meta Directly!

**Problem:** Meta gives permission error when creating templates

**Solution:** Create templates in **Interakt Dashboard** instead!

---

## ✅ **Why Use Interakt Dashboard?**

| Method | Interakt Dashboard | Meta Directly |
|--------|-------------------|---------------|
| **Permission Issues** | ✅ No issues | ❌ Often blocked |
| **Approval Process** | ✅ Interakt → Meta | ❌ Complex |
| **Interface** | ✅ User-friendly | ⚠️ Technical |
| **Support** | ✅ Interakt helps | ❌ Self-service |
| **Recommended** | ✅ YES | ❌ NO |

---

## 📍 **How to Access Interakt Template Creator**

### **Step 1: Login to Interakt**
```
URL: https://app.interakt.ai/
Email: [Your email]
Password: [Your password]
```

### **Step 2: Navigate to Templates**
```
Dashboard → Left Sidebar → "Templates" → Click "Create Template"
```

### **Step 3: Start Creating**
You'll see a form similar to Meta's interface

---

## 📝 **Template 1: OTP Verification (AUTHENTICATION)**

### **In Interakt Dashboard:**

**Template Information:**
- Template Name: `otp_verification`
- Category: **AUTHENTICATION**
- Language: English

**Template Type:**
- Select: **One-time password (OTP)**

**Message Content:**
- **Note:** For AUTHENTICATION templates, Interakt may also restrict editing
- If you can customize:
  ```
  Hi {{1}}, your LocalFelo verification code is {{2}}. Valid for 10 minutes.
  ```
- If you cannot customize:
  - Accept Meta's default format
  - Template will be: `{{1}} is your verification code. For your security, do not share this code.`

**Variables:**
- Interakt will auto-configure for OTP type
- Usually just needs the code itself

**Button Type:**
- Copy Code (OTP type) - Interakt configures this

**Submit:**
- Click "Submit" or "Send for Approval"
- Interakt sends to Meta
- Track approval status in same dashboard

---

## 📝 **Template 2: Task Accepted (MARKETING)**

### **In Interakt Dashboard:**

**Template Information:**
- Template Name: `task_accepted`
- Category: **MARKETING** or **UTILITY** (depending on Interakt's options)
- Language: English

**Header:**
- Type: None (skip this section)

**Body:**
```
Good news {{1}}, {{2}} has accepted your task request for {{3}}. You can now chat with them to coordinate the details.
```

**Variable Mapping:**
- {{1}} = customer_name
- {{2}} = helper_name
- {{3}} = task_title

**Footer:**
- Type: Text
- Content: `LocalFelo`

**Buttons:**
- Type: Call to Action
- Action: Visit Website
- Button Text: `Open Chat`
- URL: `https://localfelo.com/chat`
  - (Note: Some providers don't support variables in URLs in their dashboard)
  - If variable support: `https://localfelo.com/chat/{{4}}`
  - {{4}} = conversation_id

**Submit for Approval**

---

## 📝 **Template 3: Listing Interest (MARKETING)**

**Template Information:**
- Template Name: `listing_interest`
- Category: **MARKETING**
- Language: English

**Body:**
```
Hi {{1}}, {{2}} has sent you a message about your listing {{3}}. Check your messages to respond.
```

**Variables:**
- {{1}} = seller_name
- {{2}} = buyer_name
- {{3}} = listing_title

**Footer:** LocalFelo

**Button:**
- Text: `View Message`
- URL: `https://localfelo.com/chat`

---

## 📝 **Template 4: Wish Response (MARKETING)**

**Template Information:**
- Template Name: `wish_response`
- Category: **MARKETING**
- Language: English

**Body:**
```
Hi {{1}}, {{2}} has responded to your wish for {{3}}. View their message in the app.
```

**Variables:**
- {{1}} = customer_name
- {{2}} = seller_name
- {{3}} = wish_title

**Footer:** LocalFelo

**Button:**
- Text: `View Message`
- URL: `https://localfelo.com/chat`

---

## 📝 **Template 5: Task Completed (MARKETING)**

**Template Information:**
- Template Name: `task_completed`
- Category: **MARKETING**
- Language: English

**Body:**
```
Hi {{1}}, {{2}} has marked your task {{3}} as completed. Please review and confirm completion in the app.
```

**Variables:**
- {{1}} = customer_name
- {{2}} = helper_name
- {{3}} = task_title

**Footer:** LocalFelo

**Button:**
- Text: `Review Task`
- URL: `https://localfelo.com/tasks`

---

## 📝 **Template 6: Unread Reminder (MARKETING)**

**Template Information:**
- Template Name: `unread_reminder`
- Category: **MARKETING**
- Language: English

**Body:**
```
Hi {{1}}, you have {{2}} unread messages from {{3}} on LocalFelo. Check your inbox to stay updated.
```

**Variables:**
- {{1}} = customer_name
- {{2}} = unread_count
- {{3}} = sender_name

**Footer:** LocalFelo

**Button:**
- Text: `View Messages`
- URL: `https://localfelo.com/chat`

---

## ⚠️ **Important: Variable Format in Interakt**

### **Interakt may use POSITIONAL variables:**

Instead of:
```
{{customer_name}}, {{helper_name}}, {{task_title}}
```

Interakt might require:
```
{{1}}, {{2}}, {{3}}
```

**This is NORMAL!** Here's how it works:

### **In Template (Interakt Dashboard):**
```
Good news {{1}}, {{2}} has accepted your task {{3}}.
```

### **In Your Code:**
You can send EITHER format:

**Option A: Named (works with most providers):**
```typescript
variables: {
  customer_name: "Rahul",
  helper_name: "Amit",
  task_title: "Home Cleaning"
}
```

**Option B: Positional (if Interakt requires):**
```typescript
variables: {
  '1': "Rahul",
  '2': "Amit",
  '3': "Home Cleaning"
}
```

### **We'll Update Code If Needed**

Once you create a template and see how Interakt formats it, let me know and I'll update the code to match!

---

## 🔍 **After Creating Template**

### **Check Template Status:**

1. Go to Templates section in Interakt
2. You'll see status:
   - ⏳ **Pending** - Submitted to Meta, waiting
   - ✅ **Approved** - Ready to use!
   - ❌ **Rejected** - Needs changes

### **If Rejected:**

1. Click on template to see rejection reason
2. Common issues:
   - Spelling/grammar
   - Too promotional language
   - Missing required elements
3. Edit and resubmit

### **If Approved:**

1. Test immediately in Interakt dashboard
2. Note the exact template name (copy it)
3. Test with your code
4. Go live!

---

## 🎯 **Testing Templates in Interakt**

Most providers have a "Test Template" feature:

1. Select approved template
2. Fill in sample variables
3. Enter your test phone number
4. Send test message
5. Verify delivery on your phone

**Example Test Data:**
```
Template: task_accepted
Variables:
  {{1}}: "Rahul"
  {{2}}: "Amit"
  {{3}}: "Home Cleaning"
Phone: +91XXXXXXXXXX
```

---

## 📊 **Template Approval Timeline**

| Template Type | Typical Approval Time |
|---------------|----------------------|
| **AUTHENTICATION (OTP)** | 1-4 hours |
| **MARKETING (simple)** | 4-12 hours |
| **MARKETING (complex)** | 12-24 hours |
| **With issues** | Rejected in 4-8 hours |

**Best Practice:**
- Create all templates in one session
- They'll be reviewed in parallel
- Usually all approved within 24 hours

---

## ⚡ **Quick Start Checklist**

- [ ] Login to Interakt Dashboard (not Meta)
- [ ] Navigate to Templates section
- [ ] Create Template 1: `otp_verification` (AUTHENTICATION)
- [ ] Create Template 2: `task_accepted` (MARKETING)
- [ ] Create Template 3: `listing_interest` (MARKETING)
- [ ] Create Template 4: `wish_response` (MARKETING)
- [ ] Create Template 5: `task_completed` (MARKETING)
- [ ] Create Template 6: `unread_reminder` (MARKETING)
- [ ] Submit all for approval
- [ ] Wait for approval (check email/dashboard)
- [ ] Test each approved template
- [ ] Update code if needed (positional vs named variables)
- [ ] Deploy and go live!

---

## 🆘 **If You Still Have Issues**

### **Issue 1: Can't Find Templates Section**
- Try: Settings → WhatsApp → Templates
- Or: Contact Interakt support chat

### **Issue 2: Category Options Different**
- Interakt might use: UTILITY instead of MARKETING
- Choose closest match
- Contact support if unsure

### **Issue 3: Button URLs Not Working**
- Some providers limit URL buttons
- Alternative: Use plain template without button
- Add "Visit localfelo.com/chat" in body text

### **Issue 4: Variables Not Clear**
- Screenshot the template form
- Share with me
- I'll help map variables correctly

---

## 💬 **Interakt Support Contact**

**If you need help:**
- **Email:** support@interakt.shop
- **Dashboard:** Look for chat icon (bottom right)
- **Response Time:** Usually 4-12 hours
- **Phone:** Check dashboard for support number

**What to ask:**
"I need to create WhatsApp message templates for my app. I'm getting a permission error in Meta. Should I create templates here in Interakt Dashboard instead?"

---

## ✅ **Summary**

1. ❌ **DON'T** create templates in Meta directly (permission error)
2. ✅ **DO** create templates in Interakt Dashboard
3. ✅ Interakt submits to Meta for approval
4. ✅ Track approval status in Interakt
5. ✅ Test in Interakt dashboard first
6. ✅ Then use with your code

**Next Step:** Login to Interakt → Templates → Create Template!

---

**Create templates in Interakt Dashboard, not Meta! This solves your permission error!** 🚀
