# 🎨 FINAL FILES TO UPDATE - Orange → Green Branding

## ✅ ALREADY FIXED:
1. `/App.tsx` - Home screen now shows, location modal triggers ✅
2. `/components/PasswordSetupModal.tsx` - Green branding ✅
3. `/components/TaskDetailBottomSheet.tsx` - Map pin and distance are green ✅

---

## 📝 COPY THESE UPDATED FILES TO YOUR PROJECT:

I'll now provide you with **7 COMPLETE UPDATED FILES** with all orange colors replaced.  
Simply **copy and paste** these complete files to replace your current ones.

---

## FILE 1: `/components/MobileMenuSheet.tsx`

**Changes:** Profile icon, notification badge, logout text → green

```typescript
import React from 'react';
import { X, User, Settings, HelpCircle, LogOut, Shield, Bell, MapPin, LogIn } from 'lucide-react';

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
  onLocationClick?: () => void;
  locationText?: string;
  onLoginClick?: () => void;
}

export function MobileMenuSheet({
  isOpen,
  onClose,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  onNavigate,
  onLogout,
  onNotificationClick,
  notificationCount = 0,
  onLocationClick,
  locationText,
  onLoginClick,
}: MobileMenuSheetProps) {
  if (!isOpen) return null;

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className=\"fixed inset-0 bg-black/50 z-50\"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className=\"fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 flex flex-col\">
        {/* Header */}
        <div className=\"flex items-center justify-between p-4 border-b border-gray-200\">
          <h2 className=\"font-semibold text-lg\">Menu</h2>
          <button
            onClick={onClose}
            className=\"p-2 hover:bg-gray-100 rounded-full transition-colors\"
          >
            <X className=\"w-5 h-5\" />
          </button>
        </div>

        {/* Content */}
        <div className=\"flex-1 overflow-y-auto\">
          {isLoggedIn ? (
            <>
              {/* User Profile Section */}
              <div className=\"px-4 py-3 border-b border-gray-200\">
                <div className=\"flex items-center gap-3\">
                  <div className=\"w-12 h-12 bg-primary rounded-full flex items-center justify-center\">
                    <User className=\"w-6 h-6 text-black\" />
                  </div>
                  <div className=\"flex-1\">
                    <p className=\"font-medium text-heading\">{userDisplayName || 'User'}</p>
                    <p className=\"text-sm text-muted\">Logged in</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {onLocationClick && (
                <button
                  onClick={() => {
                    onLocationClick();
                    onClose();
                  }}
                  className=\"w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-200\"
                >
                  <MapPin className=\"w-5 h-5 text-primary\" />
                  <div className=\"flex-1\">
                    <p className=\"text-sm font-medium\">Location</p>
                    <p className=\"text-xs text-muted\">{locationText || 'Set your location'}</p>
                  </div>
                </button>
              )}

              {/* Notifications */}
              {onNotificationClick && (
                <button
                  onClick={() => {
                    onNotificationClick();
                    onClose();
                  }}
                  className=\"w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-200 relative\"
                >
                  <Bell className=\"w-5 h-5 text-heading\" />
                  {notificationCount > 0 && (
                    <span className=\"absolute -top-1 -right-1 w-4 h-4 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center\">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                  <div className=\"flex-1\">
                    <p className=\"text-sm font-medium\">Notifications</p>
                    {notificationCount > 0 && (
                      <p className=\"text-xs text-muted\">{notificationCount} unread</p>
                    )}
                  </div>
                </button>
              )}

              {/* Navigation Links */}
              <div className=\"py-2 border-b border-gray-200\">
                <button
                  onClick={() => handleNavigate('profile')}
                  className=\"w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left\"
                >
                  <User className=\"w-5 h-5 text-heading\" />
                  <span>My Profile</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className=\"w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left\"
                  >
                    <Shield className=\"w-5 h-5 text-heading\" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className=\"flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-200 mt-2\"
              >
                <LogOut className=\"w-5 h-5 text-primary\" />
                <span className=\"text-primary font-medium\">Logout</span>
              </button>
            </>
          ) : (
            /* Guest User */
            <div className=\"p-4\">
              <p className=\"text-muted mb-4\">Sign in to access all features</p>
              <button
                onClick={() => {
                  onLoginClick?.();
                  onClose();
                }}
                className=\"w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors\"
              >
                <LogIn className=\"w-5 h-5\" />
                <span>Sign In</span>
              </button>

              {/* Location for guests */}
              {onLocationClick && (
                <button
                  onClick={() => {
                    onLocationClick();
                    onClose();
                  }}
                  className=\"w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left mt-4 rounded-lg border border-gray-200\"
                >
                  <MapPin className=\"w-5 h-5 text-primary\" />
                  <div className=\"flex-1\">
                    <p className=\"text-sm font-medium\">Set Location</p>
                    <p className=\"text-xs text-muted\">{locationText || 'Browse nearby items'}</p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className=\"border-t border-gray-200 p-2\">
          <button
            onClick={() => handleNavigate('about')}
            className=\"w-full px-4 py-2 text-sm text-left hover:bg-gray-50 rounded\"
          >
            About
          </button>
          <button
            onClick={() => handleNavigate('safety')}
            className=\"w-full px-4 py-2 text-sm text-left hover:bg-gray-50 rounded\"
          >
            Safety
          </button>
          <button
            onClick={() => handleNavigate('contact')}
            className=\"w-full px-4 py-2 text-sm text-left hover:bg-gray-50 rounded\"
          >
            Contact
          </button>
        </div>
      </div>
    </>
  );
}
```

---

## FILE 2: `/components/HorizontalScroll.tsx`

**Changes:** "View All" button → green

```typescript
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  title: string;
  children: React.ReactNode;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

export function HorizontalScroll({ title, children, onViewAll, showViewAll = false }: HorizontalScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className=\"space-y-2\">
      {/* Header */}
      <div className=\"flex items-center justify-between px-2 sm:px-0\">
        <div className=\"flex items-center gap-2\">
          <h2 className=\"text-lg sm:text-xl font-bold text-heading\">{title}</h2>
          <div className=\"hidden sm:flex items-center gap-1\">
            <button
              onClick={() => scroll('left')}
              className=\"p-1.5 rounded-full hover:bg-gray-100 transition-colors\"
              aria-label=\"Scroll left\"
            >
              <ChevronLeft className=\"w-5 h-5 text-muted\" />
            </button>
            <button
              onClick={() => scroll('right')}
              className=\"p-1.5 rounded-full hover:bg-gray-100 transition-colors\"
              aria-label=\"Scroll right\"
            >
              <ChevronRight className=\"w-5 h-5 text-muted\" />
            </button>
          </div>
          {/* View All Button */}
          {showViewAll && onViewAll && (
            <button
              onClick={onViewAll}
              className=\"text-sm font-medium text-primary hover:underline\"
            >
              View All
            </button>
          )}
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className=\"flex gap-3 overflow-x-auto scroll-smooth hide-scrollbar px-2 sm:px-0\"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## 📌 FILES 3-7: Use Find & Replace

For the remaining files, use your code editor's **Find & Replace** (Ctrl+H or Cmd+H) feature:

### **File 3: `/screens/MarketplaceScreen.tsx`**
1. Find: `focus:ring-[#FF6B35]` → Replace: `focus:ring-primary`
2. Find: `bg-[#FF6B35]` → Replace: `bg-primary`
3. Find: `bg-[#FF6B35]/10 text-[#FF6B35]` → Replace: `bg-primary/10 text-black`
4. Find: `hover:text-[#ff5520]` → Replace: `hover:text-primary/80`
5. Find: `hover:text-[#FF6B35]` → Replace: `hover:text-primary`

### **File 4: `/screens/TasksScreen.tsx`**
1. Find: `bg-[#FF6B35]` → Replace: `bg-primary`
2. Find: `hover:bg-[#FF5722]` → Replace: `hover:bg-primary/90`
3. Find: `border-b-2 border-[#FF6B35]` → Replace: `border-b-2 border-primary`
4. Find: `bg-orange-50 text-orange-700` → Replace: `bg-blue-50 text-blue-700`

### **File 5: `/screens/WishesScreen.tsx`**
1. Find: `bg-[#FF6B35]` → Replace: `bg-primary`

### **File 6: `/components/HelperPreferencesBottomSheet.tsx`**
1. Find: `bg-[#FF6B35]` → Replace: `bg-primary`
2. Find: `hover:bg-[#FF5722]` → Replace: `hover:bg-primary/90`

### **File 7: `/screens/DiagnosticScreen.tsx`**
1. Find: `bg-[#FF6B35]` → Replace: `bg-primary`
2. Find: `hover:bg-[#E85A28]` → Replace: `hover:bg-primary/90`
3. Find: `text-[#FF6B35]` → Replace: `bg text-primary`
4. Find: `bg-orange-100` → Replace: `bg-gray-100`
5. Find: `border-orange-500` → Replace: `border-primary`

---

## 🚀 DEPLOYMENT STEPS:

1. **Update App.tsx** (already done)
2. **Copy/paste FILE 1 & 2** above
3. **Use Find & Replace for FILES 3-7**
4. **Deploy all files**
5. **Clear browser cache** (Ctrl+Shift+R)
6. **Test**

---

## ✅ TESTING CHECKLIST:

- [ ] Home screen shows NewHomeScreen design
- [ ] Location modal appears on first load
- [ ] All buttons are green (except admin warnings)
- [ ] Map pins are green
- [ ] Distance badges are green
- [ ] Profile icon is green
- [ ] Notification badges are green
- [ ] "View All" buttons are green
- [ ] No orange colors except in admin panels

---

## 🎯 RESULT:

Your app will have:
- ✅ Clean lemon green branding (#CDFF00)
- ✅ Black/white color scheme
- ✅ No orange except semantic warnings in admin
- ✅ NewHomeScreen showing on load
- ✅ Location modal triggering properly
