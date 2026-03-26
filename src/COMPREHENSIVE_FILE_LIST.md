# 📋 COMPREHENSIVE FILE LIST - OldCycle Complete Update

## ✅ COPY THESE FILES FROM FIGMA MAKE TO YOUR LOCAL:

### 1. Core Accessibility Fixes (6 files):
```
/styles/globals.css
/components/PasswordSetupModal.tsx
/components/ChatWindow.tsx
/components/ListingCard.tsx
/components/HorizontalScroll.tsx
/screens/NewHomeScreen.tsx
```

### 2. New Components Created (4 files):
```
/components/EditProfileModal.tsx
/components/ChangePasswordModal.tsx
/components/BroadcastNotificationForm.tsx
/services/notifications.ts
```

### 3. Screens To Update (3 files):
```
/screens/WishesScreen.tsx (needs "My Wishes" modal - see below)
/screens/ProfileScreen.tsx (needs wishlist, edit, password - see below)
/screens/AdminScreen.tsx (needs complete redesign - see below)
```

---

## 🔧 MANUAL UPDATES NEEDED:

### WishesScreen.tsx - Add "My Wishes" Modal

Since WishesScreen already shows "Active Wishes" inline, you can add a "My Wishes" button to the header row that opens a modal (like TasksScreen does).

**Add near line 234-240 (next to "Post Wish" button):**

```tsx
{isLoggedIn && (
  <button
    onClick={() => setShowMyWishes(true)}
    className="px-3 py-2 rounded-xl bg-white border border-gray-200 flex items-center gap-2 text-sm hover:bg-gray-50"
  >
    <UserIcon className="w-4 h-4" />
    <span className="hidden sm:inline">My Wishes</span>
  </button>
)}
```

**Add state at top:**
```tsx
const [showMyWishes, setShowMyWishes] = useState(false);
const [myWishes, setMyWishes] = useState<Wish[]>([]);
const [loadingMyWishes, setLoadingMyWishes] = useState(false);
```

**Add useEffect to load my wishes:**
```tsx
useEffect(() => {
  const loadMyWishes = async () => {
    if (!isLoggedIn || !user?.id) return;
    setLoadingMyWishes(true);
    try {
      const data = await getUserWishes(user.id);
      setMyWishes(data);
    } catch (error) {
      console.error('Failed to load my wishes:', error);
    } finally {
      setLoadingMyWishes(false);
    }
  };
  loadMyWishes();
}, [isLoggedIn, user?.id]);
```

**Add modal at the end (before closing div):**
```tsx
<Modal
  isOpen={showMyWishes}
  onClose={() => setShowMyWishes(false)}
  title="My Wishes"
>
  <div className="max-h-[70vh] overflow-y-auto">
    {loadingMyWishes ? (
      <SkeletonLoader count={3} />
    ) : myWishes.length === 0 ? (
      <EmptyState
        icon={Heart}
        title="No wishes yet"
        description="Post your first wish to get started"
      />
    ) : (
      <div className="space-y-3">
        {myWishes.map(wish => (
          <WishCard
            key={wish.id}
            wish={wish}
            onClick={() => {
              setShowMyWishes(false);
              onNavigate('wish-detail', { wishId: wish.id });
            }}
          />
        ))}
      </div>
    )}
  </div>
</Modal>
```

---

### ProfileScreen.tsx - Add Wishlist, Edit Profile, Change Password

**Add imports at top:**
```tsx
import { EditProfileModal } from '../components/EditProfileModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ListingCard } from '../components/ListingCard';
import { getWishlistItems } from '../services/wishlist';
```

**Add states:**
```tsx
const [showEditProfile, setShowEditProfile] = useState(false);
const [showChangePassword, setShowChangePassword] = useState(false);
const [wishlistItems, setWishlistItems] = useState<Listing[]>([]);
```

**Add new tab type:**
```tsx
type TabType = 'listings' | 'wishes' | 'tasks' | 'wishlist';
```

**Add function to load wishlist:**
```tsx
const loadWishlist = async () => {
  if (!user) return;
  try {
    const items = await getWishlistItems();
    setWishlistItems(items);
  } catch (error) {
    console.error('Error loading wishlist:', error);
  }
};

// Add to loadUserData function:
else if (activeTab === 'wishlist') {
  await loadWishlist();
}
```

**Add action buttons after user avatar section:**
```tsx
<div className="flex gap-2 mt-4">
  <button
    onClick={() => setShowEditProfile(true)}
    className="btn-outline flex-1 flex items-center justify-center gap-2"
  >
    <Edit2 className="w-4 h-4" />
    Edit Profile
  </button>
  <button
    onClick={() => setShowChangePassword(true)}
    className="btn-outline flex-1 flex items-center justify-center gap-2"
  >
    <Lock className="w-4 h-4" />
    Change Password
  </button>
</div>
```

**Add wishlist tab button:**
```tsx
<button
  onClick={() => setActiveTab('wishlist')}
  className={/* same styling as other tabs */}
>
  <Heart className="w-5 h-5" />
  <span>Wishlist</span>
  {wishlistItems.length > 0 && (
    <span className="badge">{wishlistItems.length}</span>
  )}
</button>
```

**Add wishlist content section:**
```tsx
{activeTab === 'wishlist' && (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
    {wishlistItems.length === 0 ? (
      <EmptyState
        icon={Heart}
        title="No saved items"
        description="Items you favorite will appear here"
      />
    ) : (
      wishlistItems.map(listing => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onClick={onListingClick}
          onWishlistChange={loadWishlist}
        />
      ))
    )}
  </div>
)}
```

**Add modals at the end:**
```tsx
<EditProfileModal
  isOpen={showEditProfile}
  onClose={() => setShowEditProfile(false)}
  onSuccess={() => {
    // Reload profile
    window.location.reload();
  }}
  currentName={user?.name || ''}
  currentAvatar={user?.avatar}
/>

<ChangePasswordModal
  isOpen={showChangePassword}
  onClose={() => setShowChangePassword(false)}
  onSuccess={() => {
    // Password changed successfully
  }}
/>
```

---

### AdminScreen.tsx - Complete Redesign

**Replace entire file with:**

```tsx
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { BroadcastNotificationForm } from '../components/BroadcastNotificationForm';
import { Shield, Users, Package, Heart, Briefcase, Bell, BarChart, Settings } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface AdminScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  onMenuClick: () => void;
}

type AdminTabType = 'overview' | 'users' | 'content' | 'notifications' | 'settings';

export function AdminScreen({
  onNavigate,
  onBack,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount,
  onMenuClick,
}: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalWishes: 0,
    totalTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [users, listings, wishes, tasks] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('wishes').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalListings: listings.count || 0,
        totalWishes: wishes.count || 0,
        totalTasks: tasks.count || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted mb-4">You don't have permission to access this page.</p>
          <button onClick={onBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        title="Admin Panel"
        currentScreen="admin"
        showBack
        onBack={onBack}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        onMenuClick={onMenuClick}
      />

      <div className="px-3 py-4 sm:px-4 sm:py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your OldCycle platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'content'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-600">Total Users</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">{stats.totalListings}</p>
                    <p className="text-xs text-gray-600">Listings</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">{stats.totalWishes}</p>
                    <p className="text-xs text-gray-600">Wishes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">{stats.totalTasks}</p>
                    <p className="text-xs text-gray-600">Tasks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold mb-3 text-black">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="btn-primary p-3 text-sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Send Notification
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="btn-outline p-3 text-sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Users
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <BroadcastNotificationForm
              onSuccess={() => {
                toast.success('Notification sent successfully!');
              }}
            />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold mb-3 text-black">User Management</h3>
            <p className="text-sm text-gray-600">
              User management features coming soon...
            </p>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold mb-3 text-black">Content Moderation</h3>
            <p className="text-sm text-gray-600">
              Content moderation features coming soon...
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold mb-3 text-black">System Settings</h3>
            <p className="text-sm text-gray-600">
              System settings features coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📝 SUMMARY:

### Files to Copy Directly (10 files):
1-6. Core accessibility fixes
7-10. New components

### Files to Update Manually (3 files):
11. WishesScreen.tsx - Add "My Wishes" modal
12. ProfileScreen.tsx - Add wishlist tab, edit/password modals
13. AdminScreen.tsx - Replace entire file with new code above

**TOTAL: 13 FILES TO UPDATE**

---

## 🚀 DEPLOYMENT ORDER:

1. Copy 10 files first (accessibility + new components)
2. Update 3 screens (WishesScreen, ProfileScreen, AdminScreen)
3. Hard refresh browser
4. Test all features

Done! ✨
