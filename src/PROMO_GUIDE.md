# 🎯 OldCycle Promotions & Notifications Guide

## 📍 Quick Start - Admin Panel (Recommended)

**All promo settings can now be managed directly from the Admin Panel!**

1. Login as admin
2. Go to Admin Panel
3. Click on **"Site Settings"** tab
4. Create, edit, or delete banners, greetings, and badges
5. Toggle them on/off instantly

No code changes needed! ✨

---

## 📍 Alternative - Code Config

All promo settings are also in **`/config/promos.ts`**. You can edit that file for advanced customization.

---

## 🎨 Available Components

### 1️⃣ **Top Banner** (Dismissible)
- Slim banner at the very top
- User can close it (stores in localStorage)
- Perfect for: Welcome messages, announcements, important updates

**Location**: Top of home screen, below header
**Dismissible**: Yes
**Shown**: Until user closes it

### 2️⃣ **Greeting Toast** (Auto-dismiss)
- Bottom-right notification
- Shows once per session
- Auto-dismisses after 5 seconds
- Perfect for: Personalized greetings, welcome messages

**Location**: Bottom-right corner
**Dismissible**: Yes (manual or auto after 5s)
**Shown**: Once per session

### 3️⃣ **Floating Badge** (Expandable)
- Small pulsing badge in corner
- Expands on click to show full message
- Perfect for: Special offers, new features, urgent promos

**Location**: Configurable (top/bottom, left/right)
**Dismissible**: Yes
**Shown**: Until user dismisses

### 4️⃣ **Ticker/Carousel** (Continuous)
- Horizontal scrolling text
- Displays multiple messages
- Perfect for: Multiple announcements, tips, features

**Location**: Below header (not currently active)
**Dismissible**: No
**Shown**: Always (if enabled)

---

## 🚀 How to Change Promotions

### Edit `/config/promos.ts`:

```typescript
export const promoConfig: PromoConfig = {
  banner: {
    enabled: true, // Set to false to hide
    message: 'Your message here!',
    emoji: '🎉',
    type: 'promo', // promo | info | success | announcement
    icon: 'sparkles', // sparkles | gift | megaphone | bell
    storageKey: 'banner-v1', // Change to show again
  },
  
  greeting: {
    enabled: true,
    customMessage: undefined, // Auto greeting or custom
  },
  
  floatingBadge: {
    enabled: false, // Enable when needed
    message: 'Special offer message',
    emoji: '🎁',
    position: 'bottom-right',
    icon: 'gift',
    storageKey: 'badge-v1',
  },
};
```

---

## 🎊 Seasonal Promotions

Pre-configured seasonal promos are available in `/config/promos.ts`:

- **Diwali Special** - `diwaliPromo`
- **New Year Special** - `newYearPromo`
- **Holi Special** - `holiPromo`

### To activate seasonal promo:

In `/screens/HomeScreen.tsx`, change:
```typescript
import { promoConfig } from '../config/promos';
```
to:
```typescript
import { diwaliPromo as promoConfig } from '../config/promos';
```

---

## 💡 Best Practices

### ✅ DO:
- Use banner for important one-time announcements
- Use greeting for personalized welcome messages
- Use floating badge for special limited-time offers
- Keep messages short and action-oriented
- Update `storageKey` when you want users to see banner/badge again

### ❌ DON'T:
- Show all components at once (too cluttered)
- Use long messages in banner (keep under 80 characters)
- Spam users with too many notifications
- Forget to disable old promotions

---

## 🎯 Recommended Combinations

### For New Users:
```typescript
Banner: enabled (welcome message)
Greeting: enabled (personalized)
Floating Badge: disabled
```

### For Promotions:
```typescript
Banner: enabled (main offer)
Greeting: disabled
Floating Badge: enabled (urgent offer)
```

### For Festivals:
```typescript
Banner: enabled (festival greeting)
Greeting: enabled (custom festival message)
Floating Badge: enabled (special deals)
```

### Minimal (Clean):
```typescript
Banner: disabled
Greeting: enabled (time-based only)
Floating Badge: disabled
```

---

## 🔄 How to Reset Promos for All Users

Change the `storageKey` in the config:

```typescript
storageKey: 'welcome-banner-v1' 
// Change to 'v2' to show banner again to everyone
storageKey: 'welcome-banner-v2'
```

---

## 🎨 Styling Options

### Banner Types:
- `promo` - Blue/Purple gradient (primary/accent)
- `info` - Cyan gradient (info colors)
- `success` - Green gradient (success colors)
- `announcement` - Amber gradient (warning colors)

### Banner Icons:
- `sparkles` - ✨ General excitement
- `gift` - 🎁 Offers/rewards
- `megaphone` - 📢 Announcements
- `bell` - 🔔 Notifications

### Badge Icons:
- `gift` - Best for offers
- `sparkles` - Best for new features
- `zap` - Best for urgent/limited time
- `party` - Best for celebrations

---

## 📱 Mobile Responsiveness

All components are fully responsive:
- Banner: Slim on mobile, adjusts text size
- Greeting: Positioned to not block content
- Badge: Positioned above bottom nav (bottom-24)

---

## 🔧 Advanced Customization

### Add Ticker (Optional):

1. Import in HomeScreen:
```typescript
import { PromoTicker } from '../components/PromoTicker';
```

2. Add below banner:
```typescript
{promoConfig.ticker.enabled && (
  <PromoTicker 
    messages={promoConfig.ticker.messages}
    speed={promoConfig.ticker.speed}
  />
)}
```

3. Enable in config:
```typescript
ticker: {
  enabled: true,
  messages: ['Message 1', 'Message 2', 'Message 3'],
  speed: 'medium',
}
```

---

## 📊 Performance

- Banner: Lightweight, CSS animations
- Greeting: Session storage, no DB calls
- Badge: Local storage only
- All components: Lazy rendered, no impact on initial load

---

## 🐛 Troubleshooting

**Banner not showing?**
- Check `enabled: true` in config
- User might have dismissed it (change `storageKey`)

**Greeting not showing?**
- Shows once per session (clear sessionStorage to test)
- Check `enabled: true` in config

**Badge not showing?**
- Check `enabled: true` in config
- User might have dismissed it (change `storageKey`)

---

## 📞 Quick Commands

```bash
# Clear all promo storage in browser console
localStorage.removeItem('welcome-banner-v1');
localStorage.removeItem('promo-badge-diwali-2024');
sessionStorage.removeItem('greeting-shown');

# Or clear all
localStorage.clear();
sessionStorage.clear();
```

---

Happy promoting! 🚀
