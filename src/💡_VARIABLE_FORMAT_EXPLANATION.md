# WhatsApp Template Variable Format Explained

## Your Question: `{{1}}` vs `{{customer_name}}`

**Great catch!** This is CRITICAL for WhatsApp to work properly.

---

## Two Variable Formats

### **Old Format (Positional):**
```
Template: Hi {{1}}, your code is {{2}}
API Call: ["Rahul", "123456"]
```

### **New Format (Named Variables):**
```
Template: Hi {{customer_name}}, your code is {{otp_code}}
API Call: {customer_name: "Rahul", otp_code: "123456"}
```

---

## ✅ What LocalFelo Uses

**LocalFelo uses NAMED VARIABLES format!**

### **Evidence from Code:**

**1. Type Definition (Line 11):**
```typescript
variables: Record<string, string>;
```
This means: `{key: "value"}` object, NOT `["value1", "value2"]` array

**2. Actual Usage (Line 68-71):**
```typescript
variables: {
  customer_name: params.taskCreatorName,
  helper_name: params.helperName,
  task_title: params.taskTitle
}
```

**3. Another Example (Line 196-198):**
```typescript
variables: {
  customer_name: params.userName,
  otp_code: params.otp
}
```

### **Conclusion:**

✅ **Templates MUST use:** `{{customer_name}}`, `{{otp_code}}`, etc.
❌ **NOT:** `{{1}}`, `{{2}}`, `{{3}}`, etc.

---

## Why Named Variables Are Better

### **Benefits:**

1. **Readable Code**
   - `customer_name: "Rahul"` ✅ Clear
   - Array index [0] = "Rahul" ❌ Confusing

2. **Maintainable**
   - Add new variable anywhere
   - No need to track position order

3. **Error Prevention**
   - Wrong variable = error message with name
   - Wrong position = silent wrong data

4. **Meta Recommended**
   - Modern WhatsApp API standard
   - Better approval rates

---

## How It Works

### **Step 1: Create Template in Meta/Interakt**
```
Body: Hi {{customer_name}}, your code is {{otp_code}}
Variables:
  - customer_name (TEXT)
  - otp_code (TEXT)
```

### **Step 2: Code Sends Data**
```typescript
await sendWhatsAppNotification({
  phoneNumber: "+919876543210",
  templateName: "otp_verification",
  variables: {
    customer_name: "Rahul",
    otp_code: "123456"
  }
});
```

### **Step 3: WhatsApp Replaces Variables**
```
Sent Message: "Hi Rahul, your code is 123456"
```

---

## LocalFelo Variable Mapping

### **Template 1: otp_verification**
```typescript
// Code sends:
{
  customer_name: "Rahul",
  otp_code: "123456"
}

// Template has:
Hi {{customer_name}}, your LocalFelo verification code is {{otp_code}}

// User receives:
Hi Rahul, your LocalFelo verification code is 123456
```

### **Template 3: task_accepted**
```typescript
// Code sends:
{
  customer_name: "Priya",
  helper_name: "Amit",
  task_title: "Home Cleaning"
}

// Template has:
Good news {{customer_name}}, {{helper_name}} has accepted your task request for {{task_title}}

// User receives:
Good news Priya, Amit has accepted your task request for Home Cleaning
```

### **Template 5: listing_interest**
```typescript
// Code sends:
{
  seller_name: "Rahul",
  buyer_name: "Neha",
  listing_title: "iPhone 13 Pro"
}

// Template has:
Hi {{seller_name}}, {{buyer_name}} has sent you a message about your listing {{listing_title}}

// User receives:
Hi Rahul, Neha has sent you a message about your listing iPhone 13 Pro
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Using Positional Variables

**Template:**
```
Hi {{1}}, your code is {{2}}
```

**Code:**
```typescript
variables: {
  customer_name: "Rahul",
  otp_code: "123456"
}
```

**Result:** ERROR! Template expects `{{1}}` but code sends `customer_name`

---

### ❌ WRONG: Mismatched Variable Names

**Template:**
```
Hi {{userName}}, your code is {{otpCode}}
```

**Code:**
```typescript
variables: {
  customer_name: "Rahul",  // Template expects "userName"
  otp_code: "123456"       // Template expects "otpCode"
}
```

**Result:** ERROR! Variable names don't match

---

### ✅ CORRECT: Exact Match

**Template:**
```
Hi {{customer_name}}, your code is {{otp_code}}
```

**Code:**
```typescript
variables: {
  customer_name: "Rahul",  // ✅ Matches template
  otp_code: "123456"       // ✅ Matches template
}
```

**Result:** SUCCESS! Message sent properly

---

## Variable Naming Rules

### **Best Practices:**

1. **Use snake_case**
   - ✅ `customer_name`, `otp_code`, `task_title`
   - ❌ `customerName`, `OTPCode`, `TaskTitle`

2. **Be descriptive**
   - ✅ `customer_name`, `helper_name`, `seller_name`
   - ❌ `name1`, `name2`, `name3`

3. **Match exactly (case-sensitive)**
   - Template: `{{customer_name}}`
   - Code: `customer_name: "Rahul"` ✅
   - Code: `Customer_Name: "Rahul"` ❌

4. **No special characters**
   - ✅ `customer_name`, `otp_code`
   - ❌ `customer-name`, `otp.code`, `customer name`

---

## Testing After Template Approval

### **Test Data:**
```typescript
const testData = {
  // OTP Template
  otp: {
    customer_name: "Rahul",
    otp_code: "123456"
  },
  
  // Task Accepted Template
  taskAccepted: {
    customer_name: "Priya",
    helper_name: "Amit",
    task_title: "Home Cleaning"
  },
  
  // Listing Interest Template
  listingInterest: {
    seller_name: "Rahul",
    buyer_name: "Neha",
    listing_title: "iPhone 13 Pro"
  },
  
  // Wish Response Template
  wishResponse: {
    customer_name: "Sarah",
    seller_name: "Vikram",
    wish_title: "Laptop Under 30000"
  },
  
  // Unread Reminder Template
  unreadReminder: {
    customer_name: "Amit",
    unread_count: "3",
    sender_name: "Priya"
  }
};
```

### **How to Test:**

1. Go to Admin Dashboard → WhatsApp Test tab
2. Select template (e.g., "otp_verification")
3. Code will automatically send correct variables
4. Check if message arrives properly formatted

---

## Debugging Variable Issues

### **If message doesn't arrive:**

1. **Check Template Name**
   - Code: `templateName: "otp_verification"`
   - Meta: Template name = `otp_verification`
   - Must match EXACTLY

2. **Check Variable Names**
   - Template: `{{customer_name}}`
   - Code: `customer_name: "Rahul"`
   - Must match EXACTLY (case-sensitive)

3. **Check All Variables Provided**
   - Template has 3 variables? Code must send 3
   - Missing variable = error

4. **Check Variable Types**
   - All variables should be strings
   - `unread_count: "3"` not `unread_count: 3`

---

## Summary

### **Your LocalFelo Code:**

✅ **Uses named variables:** `{customer_name: "Rahul"}`
✅ **NOT positional:** `["Rahul", "123456"]`

### **Your Templates Must Use:**

✅ **Named placeholders:** `{{customer_name}}`, `{{otp_code}}`
✅ **NOT positional:** `{{1}}`, `{{2}}`

### **Everything Already Matches!**

Your code in `/services/interaktWhatsApp.ts` is already perfect!

Just create templates with the exact variable names shown in `/🔥_FINAL_TEMPLATES.md` and you're good to go!

---

## Quick Reference

| What | Format | Example |
|------|--------|---------|
| **Template** | `{{variable_name}}` | `{{customer_name}}` |
| **Code** | `{variable_name: value}` | `{customer_name: "Rahul"}` |
| **Result** | Plain text | `Rahul` |

**They MUST match exactly for WhatsApp to work!**

---

**Bottom Line:** Your code is correct! Just use the templates from `/🔥_FINAL_TEMPLATES.md` and you're all set! 🎉
