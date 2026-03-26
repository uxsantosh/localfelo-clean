# 🎨 Admin Site Settings Guide

## 🚀 Quick Access

1. Login to OldCycle as an admin
2. Navigate to **Admin Panel** (admin icon in header)
3. Click on **"Site Settings"** tab
4. Manage all promotions and announcements!

---

## 📢 Setting Types

### 1️⃣ **Banner**
- Appears at the top of the home screen
- Users can dismiss it
- Perfect for: Welcome messages, announcements, important updates

**Example Use Cases:**
- Welcome new users
- Announce new features
- Seasonal greetings (Diwali, New Year, etc.)
- Important updates or maintenance notices

### 2️⃣ **Greeting**
- Shows as a toast notification (bottom-right)
- Appears once per session
- Auto-dismisses after 5 seconds
- Perfect for: Personalized greetings, welcome messages

**Example Use Cases:**
- Time-based greetings (Good Morning, Good Afternoon)
- Welcome back messages
- Quick tips or features

### 3️⃣ **Floating Badge**
- Small pulsing badge in a corner
- Expands when clicked
- Perfect for: Special offers, limited-time promos, new features

**Example Use Cases:**
- Flash sales or special offers
- New feature announcements
- Urgent promotions
- Holiday specials

### 4️⃣ **Ticker** (Optional)
- Horizontal scrolling text
- Displays multiple messages
- Currently not displayed but ready to use

---

## ✏️ How to Create a New Setting

1. Click **"Add Setting"** button
2. Fill in the form:

### Required Fields:
- **ID**: Unique identifier (e.g., `diwali-banner-2024`)
- **Type**: Banner, Greeting, Floating Badge, or Ticker
- **Message**: The text to display

### Optional Fields:
- **Emoji**: Add an emoji (e.g., 🎉, 🎁, 🪔)
- **Icon**: Choose an icon style
  - ✨ Sparkles - General excitement
  - 🎁 Gift - Offers/rewards
  - 📢 Megaphone - Announcements
  - 🔔 Bell - Notifications
  - 🎊 Party - Celebrations
  - ⚡ Zap - Urgent/limited time

- **Style** (Banner only):
  - Promo (Blue/Purple) - For promotions
  - Info (Cyan) - For information
  - Success (Green) - For positive messages
  - Announcement (Amber) - For important announcements

- **Storage Key**: Controls dismissal tracking
  - Change this value to show the banner/badge again to all users
  - Example: `welcome-v1` → `welcome-v2`

- **Priority**: Higher numbers show first (useful when multiple banners)

- **Enabled**: Toggle to show/hide without deleting

3. Click **"Save"**

---

## 🎯 Common Scenarios

### Scenario 1: Welcome New Users
```
Type: Banner
Message: Welcome to OldCycle! 🎉 Buy & Sell locally with zero commission!
Emoji: 🚀
Style: Promo
Icon: Sparkles
Storage Key: welcome-banner-v1
Priority: 1
Enabled: ✓
```

### Scenario 2: Festival Greeting (Diwali)
```
Type: Banner
Message: Happy Diwali! 🪔 Celebrate by buying & selling locally on OldCycle!
Emoji: 🪔
Style: Success
Icon: Sparkles
Storage Key: diwali-2024
Priority: 2
Enabled: ✓
```

### Scenario 3: Limited Time Offer
```
Type: Floating Badge
Message: Special Diwali Sale! Get 20% off on featured listings until Nov 15!
Emoji: 🎁
Icon: Gift
Position: bottom-right
Storage Key: diwali-sale-2024
Priority: 1
Enabled: ✓
```

### Scenario 4: New Feature Announcement
```
Type: Banner
Message: New Feature! 💬 Chat directly with sellers using our new chat feature!
Emoji: 💬
Style: Info
Icon: Bell
Storage Key: chat-feature-launch
Priority: 1
Enabled: ✓
```

---

## 🔄 How to Update Existing Settings

1. Find the setting in the list
2. Click the **Edit** (pencil) icon
3. Modify the fields
4. Click **"Save"**

---

## 👁️ Toggle Visibility

- Click the **Eye** icon to quickly enable/disable a setting
- Green Eye = Enabled (visible to users)
- Gray Eye = Disabled (hidden from users)

This is useful when you want to temporarily hide something without deleting it!

---

## 🗑️ Delete a Setting

1. Click the **Trash** icon
2. Confirm deletion
3. Setting is permanently removed

**Note:** Deleted settings cannot be recovered!

---

## 🎨 Best Practices

### ✅ DO:
- Keep messages short and clear (under 80 characters for banners)
- Use emojis to make messages more engaging
- Update storage keys when you want users to see dismissed banners again
- Test on mobile view (most users are on mobile)
- Use priority to control which banner shows first
- Disable old promotions instead of deleting (keep history)

### ❌ DON'T:
- Show too many banners at once (max 1-2 recommended)
- Use very long messages
- Forget to set expiry/disable after promotion ends
- Use sensitive or misleading information
- Spam users with too many notifications

---

## 📅 Seasonal Template Ideas

### Diwali (October/November)
```
Banner: Happy Diwali! 🪔 Celebrate with great local deals!
Greeting: Wishing you a bright and prosperous Diwali! ✨
Badge: Diwali Sale - Up to 50% off on electronics!
```

### New Year (December/January)
```
Banner: Happy New Year 2025! 🎊 Start fresh with OldCycle!
Greeting: Welcome to 2025! New year, new deals! 🎉
```

### Holi (March)
```
Banner: Happy Holi! 🎨 Add colors to your home with local deals!
Greeting: Celebrate Holi with amazing offers near you! 🌈
```

### Independence Day (August 15)
```
Banner: Happy Independence Day! 🇮🇳 Support local, buy local!
Greeting: Celebrating 78 years of independence! 🇮🇳
```

### Republic Day (January 26)
```
Banner: Happy Republic Day! 🇮🇳 Proud to serve local communities!
```

---

## 🔧 Advanced Tips

### Show Banner Again to All Users
Change the **Storage Key** field:
- Before: `welcome-banner-v1`
- After: `welcome-banner-v2`

This resets dismissal tracking!

### Multiple Banners
Set different **Priority** values:
- Important announcement: Priority 10
- Regular promo: Priority 5
- Welcome message: Priority 1

Higher priority shows first.

### Time-Sensitive Promos
1. Create the setting
2. Enable it when promotion starts
3. Disable it when promotion ends
4. Keep for reference without deleting

### Greeting Messages
Leave the message **empty** for auto time-based greetings:
- Good Morning (5 AM - 12 PM)
- Good Afternoon (12 PM - 5 PM)
- Good Evening (5 PM - 9 PM)
- Good Night (9 PM - 5 AM)

Or set a custom message for special occasions!

---

## 📊 Monitoring

Currently, settings are shown to all users when enabled. Future updates may include:
- View count tracking
- Dismissal rate analytics
- Click-through tracking (for floating badges)
- A/B testing different messages

---

## 🆘 Troubleshooting

**Banner not showing?**
- Check if "Enabled" is checked
- Users might have dismissed it (change storage key)
- Check if there's a banner with higher priority

**Users still seeing old banner?**
- Change the storage key to a new value
- Ask users to clear browser cache

**Badge stuck in wrong position?**
- Edit the setting
- Change "Position" to your preferred corner
- Save changes

**Need help?**
Contact your development team with:
- Screenshot of the issue
- Setting ID
- What you expected vs what happened

---

## 🚀 Next Steps

After setting up your promotions:
1. Test on different devices (mobile, tablet, desktop)
2. Check how it looks on different screen sizes
3. Monitor user engagement
4. Update messages regularly to keep content fresh
5. Disable expired promotions

---

Happy promoting! 🎉

**Remember:** Keep it simple, clear, and user-friendly!
