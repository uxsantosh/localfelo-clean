
Add a scalable, provider-agnostic WhatsApp notification system to LocalFelo.

IMPORTANT:
- DO NOT integrate any specific WhatsApp API directly (Interakt, Twilio, etc.)
- DO NOT hardcode any API credentials
- Build a flexible system so provider can be added later via .env or Supabase
- System must work with existing in-app notifications

-------------------------------------

🎯 OBJECTIVE

- Enable WhatsApp notifications for key events
- Keep system provider-independent
- Allow future integration with any WhatsApp API
- Maintain clean architecture

-------------------------------------

🧠 CORE APPROACH

Create a centralized notification service:

- One function:
  → sendNotification()

This will handle:
- In-app notification
- WhatsApp notification (if enabled)

-------------------------------------

📦 STEP 1: CREATE NOTIFICATION SERVICE LAYER

Create a unified function:

sendNotification({
  userId,
  type,
  title,
  message,
  data,
  channels: ['in_app', 'whatsapp']
})

-------------------------------------

RULES:

- ALWAYS send in-app notification
- WhatsApp is optional channel

-------------------------------------

📦 STEP 2: WHATSAPP PROVIDER ABSTRACTION

Create a separate module:

sendWhatsAppMessage({
  phone,
  template,
  variables
})

-------------------------------------

IMPORTANT:

- This function should NOT contain real API logic yet
- Just create placeholder structure

-------------------------------------

📦 STEP 3: ENV CONFIG SUPPORT

Prepare for future integration:

.env variables:

- WHATSAPP_PROVIDER = "interakt" | "twilio" | "gupshup" | "none"
- WHATSAPP_API_URL
- WHATSAPP_API_KEY

-------------------------------------

LOGIC:

IF WHATSAPP_PROVIDER is set:

→ Call sendWhatsAppMessage()

ELSE:

→ Skip WhatsApp

-------------------------------------

📦 STEP 4: PHONE NUMBER REQUIREMENT

Ensure:

- Users have phone_number field
- Validate before sending WhatsApp

-------------------------------------

📦 STEP 5: DEFINE WHATSAPP TRIGGERS

Enable WhatsApp for:

-------------------------------------

1. TASK CREATED

To Professionals:

"You have a new task: {subcategory} near you"

-------------------------------------

2. WISH CREATED (PRODUCT)

To Shops:

"New customer looking for {subcategory} near you"

-------------------------------------

3. MATCH FOUND

To Users:

"🎯 Found {count} matches near you"

-------------------------------------

4. CHAT INITIATED

"New message received"

-------------------------------------

5. OFFER / RESPONSE

"You received a response to your request"

-------------------------------------

-------------------------------------

📦 STEP 6: TEMPLATE SYSTEM

Use template-based messaging:

Example:

template: "new_task"
variables:
- subcategory
- location

-------------------------------------

DO NOT hardcode messages in logic

-------------------------------------

📦 STEP 7: FAIL-SAFE

IF WhatsApp fails:

- DO NOT break system
- Log error
- Continue with in-app notification

-------------------------------------

📦 STEP 8: LOGGING

Log:

- WhatsApp triggered
- Success / failure
- Skipped due to missing config

-------------------------------------

📦 STEP 9: FUTURE SUPABASE INTEGRATION

Prepare for:

- Storing API keys in Supabase
- Reading config dynamically

-------------------------------------

⚠️ DO NOT

- Do NOT call Interakt directly
- Do NOT embed API URLs in business logic
- Do NOT block main flow if WhatsApp fails

-------------------------------------

🚀 FINAL GOAL

- Plug-and-play WhatsApp system
- Easy provider switch
- Clean architecture
- No rework needed later

-------------------------------------

💣 FINAL NOTE

Notifications = growth engine

WhatsApp = activation layer

This system should scale without rewrites
