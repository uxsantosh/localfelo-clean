import { useState, useEffect } from 'react';
import { Info, FileText, Phone, Shield as ShieldIcon } from 'lucide-react';
import { Toaster } from 'sonner';

// Services
import { getCurrentUser, getClientToken, checkIsAdmin, logout, loginWithClientToken } from './services/auth';
import { getCitiesWithAreas } from './services/locations';
import { getUnreadCount, subscribeToConversations, markAllMessagesAsRead, getOrCreateConversation } from './services/chat';
import { supabase } from './lib/supabaseClient';
import { getListingById } from './services/listings';
import { getAllCategories } from './services/categories';
import { createTestNotification } from './services/notifications'; // ✅ ADD THIS

// Hooks
import { useLocation } from './hooks/useLocation';
import { useNotifications } from './hooks/useNotifications';
import { usePushNotifications } from './hooks/usePushNotifications';

// Components
import { Modal } from './components/Modal';
import { PhoneAuthScreen } from './screens/PhoneAuthScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { NotificationPanel } from './components/NotificationPanel';
import { MobileMenuSheet } from './components/MobileMenuSheet';
import { ContactModal } from './components/ContactModal';
import { useSimpleNotifications, SimpleNotificationContainer } from './components/SimpleNotification';

// Screens
import { MarketplaceScreen } from './screens/MarketplaceScreen';
import { CreateListingScreen } from './screens/CreateListingScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ListingDetailScreen } from './screens/ListingDetailScreen';
import { EditListingScreen } from './screens/EditListingScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AdminScreen } from './screens/AdminScreen';
import { AboutPage } from './screens/AboutPage';
import { TermsPage } from './screens/TermsPage';
import { PrivacyPage } from './screens/PrivacyPage';
import { SafetyPage } from './screens/SafetyPage';
import { ContactPage } from './screens/ContactPage';
import { DiagnosticScreen } from './screens/DiagnosticScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProhibitedItemsPage } from './screens/ProhibitedItemsPage';
// NEW MVP FEATURES
import { WishesScreen } from './screens/WishesScreen';
import { CreateWishScreen } from './screens/CreateWishScreen';
import { WishDetailScreen } from './screens/WishDetailScreen';
import { TasksScreen } from './screens/TasksScreen';
import { CreateTaskScreen } from './screens/CreateTaskScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import { NewHomeScreen } from './screens/NewHomeScreen';

// Components (Notification Popup)
import { NotificationPopup } from './components/NotificationPopup';
import { LocationPromptBanner } from './components/LocationPromptBanner';
import { LocationSelector } from './components/LocationSelector';
import { IntroModal } from './components/IntroModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ActiveTaskBanner } from './components/ActiveTaskBanner';

// Types
import { User, Listing, City } from './types';

type Screen = 
  | 'home' 
  | 'marketplace'
  | 'create' 
  | 'profile' 
  | 'listing' 
  | 'edit'
  | 'chat'
  | 'admin'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'safety'
  | 'contact'
  | 'diagnostic'
  | 'notifications'
  | 'wishes'
  | 'create-wish'
  | 'wish-detail'
  | 'tasks'
  | 'create-task'
  | 'task-detail'
  | 'prohibited';

function getScreenFromPath(path: string): Screen {
  if (path === '/') return 'home'; // ✅ FIX: Show NewHomeScreen as default
  if (path.startsWith('/listing/')) return 'listing';
  if (path.startsWith('/edit-listing/')) return 'edit';
  const screenMap: Record<string, Screen> = {
    '/marketplace': 'marketplace',
    '/create': 'create',
    '/profile': 'profile',
    '/chat': 'chat',
    '/admin': 'admin',
    '/about': 'about',
    '/terms': 'terms',
    '/privacy': 'privacy',
    '/safety': 'safety',
    '/contact': 'contact',
    '/diagnostic': 'diagnostic',
    '/notifications': 'notifications',
    '/wishes': 'wishes',
    '/create-wish': 'create-wish',
    '/wish-detail': 'wish-detail',
    '/tasks': 'tasks',
    '/create-task': 'create-task',
    '/task-detail': 'task-detail',
    '/prohibited': 'prohibited',
  };
  return screenMap[path] || 'home'; // ✅ FIX: Default to home
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editTaskData, setEditTaskData] = useState<any | null>(null);
  const [editWishData, setEditWishData] = useState<any | null>(null); // NEW: For editing wishes
  const [activeTasksCount, setActiveTasksCount] = useState(0);
  
  // App download settings
  const [appDownloadEnabled, setAppDownloadEnabled] = useState(false);
  const [appDownloadUrl, setAppDownloadUrl] = useState('');
  
  // Intro modal state
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [hasCheckedIntro, setHasCheckedIntro] = useState(false);
  
  // Global search modal state
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  
  // Notification state
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  // Notification popup state
  const [activePopupNotification, setActivePopupNotification] = useState<any>(null);
  
  // Track shown broadcast notifications to avoid duplicates
  const [shownBroadcastIds, setShownBroadcastIds] = useState<string[]>([]);
  
  const [justCreatedContent, setJustCreatedContent] = useState(false); // Track if user just created listing/task/wish
  const [hasShownLocationModalThisSession, setHasShownLocationModalThisSession] = useState(false); // Track if location modal was shown in this session
  
  // Track shown popup notifications to avoid duplicates
  const [shownPopupIds, setShownPopupIds] = useState<string[]>([]);
  
  // Social links state
  const [socialLinks, setSocialLinks] = useState<{ instagram?: string; facebook?: string; linkedin?: string }>({});
  
  // Location state for HomeScreen
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState<string[]>([]);

  // Global location system - ONLY LocationSetupModal, no old LocationBottomSheet
  const [showLocationSetupModal, setShowLocationSetupModal] = useState(false);
  const { 
    location: globalLocation, 
    loading: locationLoading, 
    error: locationError,
    updateLocation: updateGlobalLocation,
    hasAttemptedLoad,
  } = useLocation(user?.id || null);
  
  // ✅ NEW: Track if we've ever shown the location modal (persisted across app closes)
  const [hasEverShownLocationModal, setHasEverShownLocationModal] = useState(() => {
    const stored = localStorage.getItem('localfelo_location_modal_shown');
    return stored === 'true';
  });

  // Use notifications hook
  const {
    notifications,
    unreadCount: notificationUnreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
  } = useNotifications(user?.id || null); // ✅ FIX: Use user.id instead of clientToken

  // Push notifications hook - safely handles registration for logged-in users
  // This never blocks rendering and gracefully handles errors
  const pushStatus = usePushNotifications(user?.id);

  // Simple notifications (replaces toast)
  const simpleNotify = useSimpleNotifications();

  // ✅ SET PROPER DOCUMENT TITLE BASED ON CURRENT SCREEN
  useEffect(() => {
    const titles: Record<Screen, string> = {
      'home': 'LocalFelo - Get Help Nearby | Post Tasks, Wishes & Local Marketplace',
      'marketplace': 'Local Marketplace Near You - Buy & Sell Locally | LocalFelo',
      'tasks': 'Available Tasks Near You - Find Local Gigs & Services | LocalFelo',
      'wishes': 'Wishes Near You - Post What You Need | LocalFelo',
      'create': 'Sell Item - Create Listing | LocalFelo',
      'create-task': 'Post Task | LocalFelo',
      'create-wish': 'Post Wish | LocalFelo',
      'profile': 'My Profile | LocalFelo',
      'chat': 'Messages | LocalFelo',
      'notifications': 'Notifications | LocalFelo',
      'admin': 'Admin Panel | LocalFelo',
      'about': 'About Us | LocalFelo',
      'terms': 'Terms of Service | LocalFelo',
      'privacy': 'Privacy Policy | LocalFelo',
      'safety': 'Safety Guidelines | LocalFelo',
      'contact': 'Contact Us | LocalFelo',
      'prohibited': 'Prohibited Items | LocalFelo',
      'listing': 'View Item | LocalFelo',
      'task-detail': 'Task Details | LocalFelo',
      'wish-detail': 'Wish Details | LocalFelo',
      'edit': 'Edit Listing | LocalFelo',
      'diagnostic': 'Diagnostics | LocalFelo',
    };

    document.title = titles[currentScreen] || 'LocalFelo - Get Help Nearby';
  }, [currentScreen]);

  // Location initialization - show setup modal for new users

  // Test notification function for development
  useEffect(() => {
    if (user?.id) {
      (window as any).testNotification = async () => {
        const result = await createTestNotification(user.id);
        console.log('Test notification result:', result);
        return result;
      };
      
      // Push notification status inspector
      (window as any).pushStatus = pushStatus;
    } else {
      (window as any).testNotification = undefined;
      (window as any).pushStatus = undefined;
    }
  }, [user?.id, pushStatus]);

  // Reset scroll to top when screen changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen]);

  // Test toast notification function for development
  useEffect(() => {
    (window as any).testToast = () => {
      console.log('🧪 Testing all toast types...');
      simpleNotify.success('✅ Success toast test!');
      setTimeout(() => simpleNotify.error('❌ Error toast test!'), 500);
      setTimeout(() => simpleNotify.info('ℹ️ Info toast test!'), 1000);
      setTimeout(() => simpleNotify.warning('⚠️ Warning toast test!'), 1500);
    };
  }, [simpleNotify]);

  // Listen for critical notifications and show popup
  useEffect(() => {
    if (!user || notifications.length === 0) return;

    // Check for new unread critical notifications
    const criticalTypes = ['task_accepted', 'task_cancelled', 'task_completion_request', 'task_completed'];
    const latestCritical = notifications.find(
      n => !n.is_read && criticalTypes.includes(n.type) && !shownPopupIds.includes(n.id)
    );

    if (latestCritical) {
      console.log('🔔 Showing popup for critical notification:', latestCritical);
      setActivePopupNotification(latestCritical);
      setShownPopupIds(prev => [...prev, latestCritical.id]);
    }

    // Show toast for broadcast notifications (info, promotion, alert)
    const broadcastTypes = ['broadcast', 'info', 'promotion', 'alert'];
    const latestBroadcast = notifications.find(
      n => !n.is_read && broadcastTypes.includes(n.type) && !shownBroadcastIds.includes(n.id)
    );

    if (latestBroadcast) {
      console.log('📢 Showing toast for broadcast notification:', latestBroadcast);
      simpleNotify.info(`${latestBroadcast.title}: ${latestBroadcast.message}`);
      setShownBroadcastIds(prev => [...prev, latestBroadcast.id]);
    }
  }, [notifications, user, simpleNotify, shownPopupIds, shownBroadcastIds]);

  // Clear shown notification IDs when user has no unread notifications
  useEffect(() => {
    const hasUnreadNotifications = notifications.some(n => !n.is_read);
    if (!hasUnreadNotifications && (shownPopupIds.length > 0 || shownBroadcastIds.length > 0)) {
      console.log('🧹 [App] No unread notifications - clearing shown notification tracking');
      setShownPopupIds([]);
      setShownBroadcastIds([]);
    }
  }, [notifications, shownPopupIds.length, shownBroadcastIds.length]);

  // Log location status
  useEffect(() => {
    if (globalLocation && globalLocation.latitude && globalLocation.longitude) {
      console.log('✅ [App] User location SET:', { 
        city: globalLocation.city,
        area: globalLocation.area,
        lat: globalLocation.latitude.toFixed(4), 
        lon: globalLocation.longitude.toFixed(4) 
      });
      console.log('🎯 [App] Distances will now be calculated for all items!');
    }
  }, [globalLocation]);

  const handleSaveLocation = async (location: any) => {
    await updateGlobalLocation(location);
    simpleNotify.success('Location updated! 📍');
    // ✅ Mark that we've shown the location modal (persist across app restarts)
    localStorage.setItem('localfelo_location_modal_shown', 'true');
    setHasEverShownLocationModal(true);
  };

  // ✅ SIMPLIFIED: Location modal shows ONCE on first app open, NEVER again
  // Even after login/register - we just use the already selected location
  useEffect(() => {
    // If we've shown modal before (localStorage flag), NEVER show again
    const hasShownBefore = localStorage.getItem('localfelo_location_modal_shown') === 'true';
    if (hasShownBefore) {
      console.log('✅ [App] Location modal already shown before - not showing again');
      setHasShownLocationModalThisSession(true);
      setHasEverShownLocationModal(true);
      return;
    }
    
    // ✅ NEW: Check if location is DEFAULT Bangalore (not user-selected)
    // If location is default, we should still show the modal
    const isDefaultLocation = globalLocation && 
      globalLocation.city === 'Bangalore' && 
      globalLocation.latitude === 12.9716 &&
      globalLocation.longitude === 77.5946 &&
      globalLocation.detectionMethod === 'manual';
    
    // If user has a REAL (non-default) location, mark as handled and don't show
    if (globalLocation && globalLocation.latitude && globalLocation.longitude && !isDefaultLocation) {
      console.log('✅ [App] Valid user-selected location detected - not showing modal');
      localStorage.setItem('localfelo_location_modal_shown', 'true');
      setHasShownLocationModalThisSession(true);
      setHasEverShownLocationModal(true);
      return;
    }
    
    // Check localStorage for saved location (guest or user)
    const savedGuestLocation = 
      localStorage.getItem('localfelo_guest_location') || 
      localStorage.getItem('oldcycle_guest_location');
    
    if (savedGuestLocation) {
      try {
        const locationData = JSON.parse(savedGuestLocation);
        // Only skip modal if saved location is NOT the default Bangalore
        const isSavedDefault = locationData.city === 'Bangalore' && 
          locationData.latitude === 12.9716 &&
          locationData.longitude === 77.5946;
        
        if (locationData.latitude && locationData.longitude && !isSavedDefault) {
          console.log('✅ [App] User-selected location found in localStorage - not showing modal');
          localStorage.setItem('localfelo_location_modal_shown', 'true');
          setHasShownLocationModalThisSession(true);
          setHasEverShownLocationModal(true);
          return;
        }
      } catch (err) {
        console.error('❌ [App] Failed to parse saved location:', err);
      }
    }
    
    // Only proceed if we've loaded location data
    if (!hasAttemptedLoad || locationLoading) {
      return;
    }
    
    // Don't show during intro or content creation
    if (!hasCheckedIntro || justCreatedContent) {
      console.log('⏸️ [App] Location modal waiting: hasCheckedIntro=', hasCheckedIntro, 'justCreatedContent=', justCreatedContent);
      return;
    }
    
    // Show modal ONLY if this is first time ever (no location, never shown)
    // OR if only default Bangalore location exists
    if (!hasShownLocationModalThisSession) {
      console.log('📍 [App] ✅ Intro complete! Now showing location setup modal');
      setShowLocationSetupModal(true);
      setHasShownLocationModalThisSession(true);
      localStorage.setItem('localfelo_location_modal_shown', 'true');
      setHasEverShownLocationModal(true);
    }
  }, [
    hasAttemptedLoad, 
    locationLoading, 
    globalLocation, 
    hasCheckedIntro, 
    justCreatedContent, 
    hasShownLocationModalThisSession,
    hasEverShownLocationModal
  ]);

  // Handle Supabase session and sync with OldCycle auth
  const handleSupabaseSession = async (session: any) => {
    console.log('🔄 [App] Syncing Supabase session with OldCycle auth...');
    
    try {
      // Get or create OldCycle profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ [App] Profile fetch error:', profileError);
        return;
      }
      
      let clientToken = profile?.client_token;
      let displayName = profile?.display_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
      
      // Check for guest location to migrate
      const savedGuestLocation = 
        localStorage.getItem('localfelo_guest_location') || 
        localStorage.getItem('oldcycle_guest_location');
      let guestLocationData = null;
      if (savedGuestLocation) {
        try {
          guestLocationData = JSON.parse(savedGuestLocation);
          console.log('📍 [App] Found guest location to migrate:', guestLocationData);
        } catch (err) {
          console.error('❌ [App] Failed to parse guest location:', err);
        }
      }
      
      // Create profile if doesn't exist
      if (!profile) {
        console.log('📝 [App] Creating new OldCycle profile...');
        const crypto = window.crypto || (window as any).msCrypto;
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        clientToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        // Include guest location in profile creation if available
        const profileData: any = {
          id: session.user.id,
          email: session.user.email,
          display_name: displayName,
          client_token: clientToken,
          // owner_token will be auto-generated by database
          created_at: new Date().toISOString(),
        };
        
        // Add location data if available
        if (guestLocationData) {
          profileData.city_id = guestLocationData.cityId;
          profileData.city = guestLocationData.city;
          profileData.area_id = guestLocationData.areaId;
          profileData.area = guestLocationData.area;
          profileData.latitude = guestLocationData.latitude;
          profileData.longitude = guestLocationData.longitude;
          profileData.location_updated_at = new Date().toISOString();
          console.log('📍 [App] Migrating guest location to new profile');
        }
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
        
        if (insertError) {
          console.error('❌ [App] Profile creation error:', insertError);
          return;
        }
        
        console.log('✅ [App] Profile created successfully');
        
        // Clear guest location after migration (flags already set above)
        if (guestLocationData) {
          localStorage.removeItem('localfelo_guest_location');
          localStorage.removeItem('oldcycle_guest_location');
          console.log('✅ [App] Guest location migrated and cleared from localStorage');
        }
      } else if (guestLocationData && (!profile.city || !profile.latitude || !profile.longitude)) {
        // Profile exists but has no location - migrate guest location
        console.log('📍 [App] Migrating guest location to existing profile');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            city_id: guestLocationData.cityId,
            city: guestLocationData.city,
            area_id: guestLocationData.areaId,
            area: guestLocationData.area,
            latitude: guestLocationData.latitude,
            longitude: guestLocationData.longitude,
            location_updated_at: new Date().toISOString(),
          })
          .eq('id', session.user.id);
        
        if (updateError) {
          console.error('❌ [App] Failed to migrate guest location:', updateError);
        } else {
          localStorage.removeItem('localfelo_guest_location');
          localStorage.removeItem('oldcycle_guest_location');
          console.log('✅ [App] Guest location migrated to existing profile and cleared');
        }
      } else if (guestLocationData) {
        // Had guest location but profile already has location - just clear guest data
        localStorage.removeItem('localfelo_guest_location');
        localStorage.removeItem('oldcycle_guest_location');
        console.log('✅ [App] Guest location cleared (profile already has location)');
        localStorage.removeItem('localfelo_guest_location');
        localStorage.removeItem('oldcycle_guest_location');
        setHasShownLocationModalThisSession(true);
        setHadValidLocationOnce(true);
        console.log('✅ [App] Guest location cleared (profile already has location)');
      }
      
      // Save to localStorage (OldCycle format)
      const oldCycleUser: User = {
        id: session.user.id,
        email: session.user.email!,
        name: displayName,
        phone: profile?.phone || '',
        whatsappSame: profile?.whatsapp_same ?? true,
        whatsappNumber: profile?.whatsapp_number || undefined,
        authUserId: session.user.id,
        clientToken: clientToken,
        profilePic: session.user.user_metadata?.avatar_url || profile?.avatar_url || undefined,
      };
      
      localStorage.setItem('oldcycle_user', JSON.stringify(oldCycleUser));
      localStorage.setItem('oldcycle_token', clientToken!);
      
      // Update React state
      setUser(oldCycleUser);
      
      // Check admin status
      const { checkIsAdmin } = await import('./services/auth');
      const isAdminUser = await checkIsAdmin();
      setIsAdmin(isAdminUser);
      
      console.log('✅ [App] OldCycle auth synced successfully');
      
      // Only show welcome notification if password setup is not needed
      const needsSetup = session.user.user_metadata?.needs_password_setup === true;
      if (!needsSetup) {
        simpleNotify.success(`Welcome back, ${displayName}! 🎉`);
      }
      
    } catch (error) {
      console.error('❌ [App] Session sync error:', error);
    }
  };

  // Initialize user from localStorage
  useEffect(() => {
    console.log('🚀 App initializing...');
    
    // Check for existing Supabase session first
    const checkSupabaseSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ Active Supabase session found');
        await handleSupabaseSession(session);
        return true;
      }
      return false;
    };
    
    // Then check localStorage as fallback
    const checkLocalStorage = () => {
      const savedUser = getCurrentUser();
      const savedToken = getClientToken();

      if (savedUser && savedToken) {
        console.log('✅ User found in localStorage:', savedUser.name);
        setUser(savedUser);
        
        checkIsAdmin().then(isAdminUser => {
          setIsAdmin(isAdminUser);
          if (isAdminUser) console.log('👑 Admin user detected');
        });
        return true;
      }
      console.log('ℹ️ No user in localStorage');
      return false;
    };
    
    // Try Supabase session first, then localStorage
    checkSupabaseSession().then(hasSession => {
      if (!hasSession) {
        checkLocalStorage();
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('screen') === 'diagnostic') {
      setCurrentScreen('diagnostic');
    }

    // Create a base entry to prevent app closure on mobile back button
    // This ensures there's always a history entry before the current one
    console.log('🛡️ Initializing history for mobile back button support');
    const currentPath = window.location.pathname;
    const currentScreenFromPath = getScreenFromPath(currentPath);
    
    // ✅ FIX: Set initial screen based on current URL path
    if (currentScreenFromPath !== 'home' || currentPath !== '/') {
      console.log('🔗 Setting initial screen from URL:', currentPath, '→', currentScreenFromPath);
      setCurrentScreen(currentScreenFromPath);
      
      // Handle special cases with ID parameters
      if (currentPath.startsWith('/listing/')) {
        const listingId = currentPath.split('/listing/')[1];
        if (listingId) {
          console.log('📦 Loading listing from URL:', listingId);
          getListingById(listingId).then(listing => {
            if (listing) setSelectedListing(listing);
          }).catch(err => console.error('Failed to load listing:', err));
        }
      }
      
      if (currentPath.startsWith('/edit-listing/')) {
        const listingId = currentPath.split('/edit-listing/')[1];
        if (listingId) {
          console.log('✏️ Loading edit listing from URL:', listingId);
          getListingById(listingId).then(listing => {
            if (listing) setSelectedListing(listing);
          }).catch(err => console.error('Failed to load listing:', err));
        }
      }
    }
    
    // Replace current state with base state
    window.history.replaceState({ screen: currentScreenFromPath, isBase: true, sentinel: true }, '', currentPath);

    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      const screen = getScreenFromPath(path);
      
      console.log('🔙 Back button pressed - Path:', path, 'Screen:', screen, 'State:', event.state);
      
      // Handle specific screens with ID params
      if (path.startsWith('/listing/')) {
        const listingId = path.split('/listing/')[1];
        if (listingId && event.state?.listingId) {
          console.log('📦 Loading listing from history:', listingId);
          // Load the listing
          getListingById(listingId).then(listing => {
            if (listing) {
              setSelectedListing(listing);
              setCurrentScreen('listing');
            } else {
              setCurrentScreen('home');
            }
          }).catch(() => {
            setCurrentScreen('home');
          });
          window.scrollTo(0, 0);
          return;
        }
      }
      
      if (path.startsWith('/edit-listing/')) {
        const listingId = path.split('/edit-listing/')[1];
        if (listingId && event.state?.listingId) {
          console.log('✏️ Loading edit listing from history:', listingId);
          // Load the listing for editing
          getListingById(listingId).then(listing => {
            if (listing) {
              setSelectedListing(listing);
              setCurrentScreen('edit');
            } else {
              setCurrentScreen('home');
            }
          }).catch(() => {
            setCurrentScreen('home');
          });
          window.scrollTo(0, 0);
          return;
        }
      }

      // Handle wish-detail
      if (screen === 'wish-detail' && event.state?.wishId) {
        console.log('💭 Loading wish from history:', event.state.wishId);
        setSelectedWishId(event.state.wishId);
        setCurrentScreen('wish-detail');
        window.scrollTo(0, 0);
        return;
      }

      // Handle task-detail
      if (screen === 'task-detail' && event.state?.taskId) {
        console.log('📋 Loading task from history:', event.state.taskId);
        setSelectedTaskId(event.state.taskId);
        setCurrentScreen('task-detail');
        window.scrollTo(0, 0);
        return;
      }

      // Handle chat with conversation
      if (screen === 'chat' && event.state?.conversationId) {
        console.log('💬 Loading chat from history:', event.state.conversationId);
        setChatConversationId(event.state.conversationId);
        setCurrentScreen('chat');
        window.scrollTo(0, 0);
        return;
      }
      
      // Default: navigate to the screen
      console.log('➡️ Navigating to screen:', screen);
      window.scrollTo(0, 0);
      setCurrentScreen(screen);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Listen for Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        await handleSupabaseSession(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('🔔 User signed out');
        setUser(null);
        setIsAdmin(false);
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('🔐 Password recovery event');
        simpleNotify.info('Please set your new password');
      }
    });
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Load cities
  useEffect(() => {
    async function loadCities() {
      console.log('🌆 Loading cities from Supabase...');
      setCitiesLoading(true);
      try {
        const citiesData = await getCitiesWithAreas();
        setCities(citiesData);
        console.log(`✅ Loaded ${citiesData.length} cities`);
      } catch (error) {
        console.error('❌ Failed to load cities:', error);
        simpleNotify.error('Failed to load locations. Please refresh the page.');
      } finally {
        setCitiesLoading(false);
      }
    }
    loadCities();
  }, []);

  // Load app download settings
  useEffect(() => {
    async function loadAppDownloadSettings() {
      try {
        console.log('🔄 [App] Loading app download settings...');
        const { data, error } = await supabase
          .from('site_settings')
          .select('enabled, app_download_url')
          .eq('id', 'app_download')
          .single();

        console.log('📱 [App] App download settings:', { data, error });

        if (data) {
          setAppDownloadEnabled(data.enabled || false);
          setAppDownloadUrl(data.app_download_url || '');
          console.log('✅ [App] App download settings loaded:', {
            enabled: data.enabled,
            url: data.app_download_url,
          });
        } else {
          console.log('⚠️ [App] No app download settings found');
        }
      } catch (error) {
        console.error('❌ [App] Error loading app download settings:', error);
      }
    }
    loadAppDownloadSettings();
  }, []);

  // Load social media links
  useEffect(() => {
    async function loadSocialLinks() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('instagram_url, facebook_url, linkedin_url')
          .eq('id', 'social_links')
          .single();

        if (data) {
          setSocialLinks({
            instagram: data.instagram_url || undefined,
            facebook: data.facebook_url || undefined,
            linkedin: data.linkedin_url || undefined,
          });
        }
      } catch (error) {
        console.error('Error loading social links:', error);
      }
    }
    loadSocialLinks();
  }, []);

  // Check for intro on app load
  useEffect(() => {
    const introSkipped = localStorage.getItem('localfelo_intro_skipped');
    console.log('👋 [App] Checking intro status:', { introSkipped });
    
    if (!introSkipped) {
      // First time user - show intro
      console.log('👋 [App] First time user - showing intro modal');
      setShowIntroModal(true);
    } else {
      // Returning user - skip intro
      console.log('✅ [App] Returning user - skipping intro');
      setHasCheckedIntro(true);
    }
  }, []);

  // Ensure home screen has proper history state
  useEffect(() => {
    if (currentScreen === 'home') {
      const state = window.history.state;
      // Only update if state is missing or incorrect
      if (!state || state.screen !== 'home') {
        console.log('🏠 Ensuring home screen has proper history state');
        window.history.replaceState({ screen: 'home', isBase: true, sentinel: true }, '', '/');
      }
    }
  }, [currentScreen]);

  // Fetch unread count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      console.log('🔔 [App] Fetching unread count...');
      const count = await getUnreadCount();
      console.log('🔔 [App] Unread count fetched:', count);
      setUnreadCount(count);
    };

    fetchUnreadCount();

    console.log('🔔 [App] Setting up real-time subscription for unread count...');
    const subscription = subscribeToConversations(() => {
      console.log('🔔 [App] 🚨 REAL-TIME CALLBACK FIRED! Refreshing unread count...');
      fetchUnreadCount();
    });

    // Aggressive polling fallback every 3 seconds when NOT in chat screen
    const pollingInterval = setInterval(() => {
      if (currentScreen !== 'chat') {
        console.log('🔄 [App] Polling unread count (fallback)...');
        fetchUnreadCount();
      }
    }, 3000);

    return () => {
      console.log('🔔 [App] Cleaning up unread count subscription...');
      subscription?.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [user, currentScreen]);

  // Fetch active tasks count
  useEffect(() => {
    if (!user) {
      setActiveTasksCount(0);
      return;
    }

    const fetchActiveTasksCount = async () => {
      try {
        const { getUserActiveTasks } = await import('./services/tasks');
        const activeTasks = await getUserActiveTasks(user.id);
        setActiveTasksCount(activeTasks.length);
        console.log('📊 [App] Active tasks count:', activeTasks.length);
      } catch (error) {
        console.error('❌ [App] Failed to fetch active tasks count:', error);
      }
    };

    fetchActiveTasksCount();

    // Subscribe to task changes
    const tasksSubscription = supabase
      .channel('active-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id},acceptedBy=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 [App] Task changed, refreshing active tasks count...', payload);
          fetchActiveTasksCount();
        }
      )
      .subscribe();

    // Polling fallback every 10 seconds
    const pollingInterval = setInterval(() => {
      fetchActiveTasksCount();
    }, 10000);

    return () => {
      tasksSubscription.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [user]);

  // Fetch listing from URL if selectedListing is null but we're on listing screen
  useEffect(() => {
    const fetchListingFromURL = async () => {
      if (currentScreen === 'listing' && !selectedListing && cities.length > 0) {
        const path = window.location.pathname;
        const match = path.match(/^\/listing\/(.+)$/);
        
        if (match && match[1]) {
          const listingId = match[1];
          
          // ✅ Validate listing ID before making API call
          if (!listingId || listingId === 'undefined' || listingId === 'null') {
            console.error('❌ [App] Invalid listing ID in URL:', listingId);
            setCurrentScreen('home');
            return;
          }
          
          console.log('📦 [App] Fetching listing from URL:', listingId);
          
          try {
            // Fetch categories
            const categoriesData = await getAllCategories();
            
            // Fetch listing
            const listingData = await getListingById(
              listingId,
              globalLocation?.latitude,
              globalLocation?.longitude
            );
            if (listingData) {
              console.log('✅ [App] Listing fetched successfully:', listingData);
              
              // Transform the raw listing data to match Listing interface
              const category = categoriesData.find((c: any) => c.slug === listingData.category_slug);
              const city = cities.find(c => c.name === listingData.city);
              const area = city && city.areas ? city.areas.find(a => a.slug === listingData.area_slug) : undefined;
              
              const transformedListing: Listing = {
                id: listingData.id,
                title: listingData.title,
                description: listingData.description,
                price: listingData.price,
                categoryId: category?.id || 0,
                categoryName: category?.name || 'Other',
                categoryEmoji: category?.emoji || '📦',
                cityId: city?.id || '',
                cityName: city?.name || '',
                areaId: area?.id || '',
                areaName: area?.name || '',
                images: listingData.images || [],
                phone: listingData.owner_phone,
                hasWhatsapp: listingData.whatsapp_enabled || false,
                whatsapp: listingData.whatsapp_number,
                userId: listingData.owner_token,
                userName: listingData.owner_name,
                createdAt: listingData.created_at,
                isHidden: !listingData.is_active,
                latitude: listingData.latitude,
                longitude: listingData.longitude,
                distance: listingData.distance,
              };
              
              setSelectedListing(transformedListing);
            } else {
              console.error('❌ [App] Listing not found');
              simpleNotify.error('Listing not found');
              navigateToScreen('home');
            }
          } catch (error) {
            console.error('❌ [App] Failed to fetch listing:', error);
            simpleNotify.error('Failed to load listing');
            navigateToScreen('home');
          }
        }
      }
    };
    
    fetchListingFromURL();
  }, [currentScreen, selectedListing, cities]);

  const handleLogin = async (clientToken: string) => {
    console.log('🔐 Logging in with client token...');
    
    try {
      // Login with client token
      const result = await loginWithClientToken(clientToken);
      
      if (result && result.user) {
        console.log('✅ Login successful:', result.user.name);
        setUser(result.user);
        
        // Check admin status
        const isAdminUser = await checkIsAdmin();
        setIsAdmin(isAdminUser);
        if (isAdminUser) console.log('👑 Admin user logged in');
        
        simpleNotify.success(`Welcome back, ${result.user.name}! 🎉`);
      } else {
        console.error('❌ Login failed: No user returned');
        simpleNotify.error('Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      simpleNotify.error(error?.message || 'Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsAdmin(false);
    setCurrentScreen('home');
    // Note: Location modal handled by localStorage check - won't show after logout/login if location was selected
    simpleNotify.success('Logged out successfully');
  };

  const navigateToScreen = (screen: Screen, listing?: Listing) => {
    // Redirect to login if trying to access profile/create/chat without being logged in
    if ((screen === 'profile' || screen === 'create' || screen === 'chat' || screen === 'create-wish' || screen === 'create-task') && !user) {
      setShowLoginModal(true);
      return;
    }

    if (screen === 'listing' && listing) {
      // ✅ Validate listing ID before creating URL
      if (!listing.id || listing.id === 'undefined' || listing.id === 'null' || listing.id === '' || typeof listing.id !== 'string') {
        console.error('❌ [App] Cannot navigate to listing with invalid ID:', listing.id, 'Title:', listing.title, 'Type:', typeof listing.id);
        setCurrentScreen('home');
        return;
      }
      setSelectedListing(listing);
      window.history.pushState({ screen, listingId: listing.id }, '', `/listing/${listing.id}`);
    } else if (screen === 'edit' && listing) {
      // ✅ Validate listing ID before creating URL
      if (!listing.id || listing.id === 'undefined' || listing.id === 'null' || listing.id === '' || typeof listing.id !== 'string') {
        console.error('❌ [App] Cannot navigate to edit with invalid ID:', listing.id, 'Title:', listing.title, 'Type:', typeof listing.id);
        setCurrentScreen('home');
        return;
      }
      setSelectedListing(listing);
      window.history.pushState({ screen, listingId: listing.id }, '', `/edit-listing/${listing.id}`);
    } else if (screen === 'wish-detail') {
      // Store wish ID in history state for back button navigation
      window.history.pushState({ screen, wishId: selectedWishId }, '', '/wish-detail');
    } else if (screen === 'task-detail') {
      // Store task ID in history state for back button navigation
      window.history.pushState({ screen, taskId: selectedTaskId }, '', '/task-detail');
    } else if (screen === 'chat') {
      // Store conversation ID in history state for back button navigation
      window.history.pushState({ screen, conversationId: chatConversationId }, '', '/chat');
    } else {
      const pathMap: Record<Screen, string> = {
        'home': '/',
        'marketplace': '/marketplace',
        'create': '/create',
        'profile': '/profile',
        'chat': '/chat',
        'admin': '/admin',
        'about': '/about',
        'terms': '/terms',
        'privacy': '/privacy',
        'safety': '/safety',
        'contact': '/contact',
        'diagnostic': '/diagnostic',
        'listing': '/',
        'edit': '/',
        'notifications': '/notifications',
        'wishes': '/wishes',
        'create-wish': '/create-wish',
        'wish-detail': '/wish-detail',
        'tasks': '/tasks',
        'create-task': '/create-task',
        'task-detail': '/task-detail',
      };
      window.history.pushState({ screen }, '', pathMap[screen] || '/');
    }
    
    // Reset scroll to top when navigating to any screen
    window.scrollTo(0, 0);
    
    setCurrentScreen(screen);
  };

  const handleTabChange = (tab: 'home' | 'create' | 'profile' | 'admin' | 'chat') => {
    if (tab === 'create' || tab === 'profile' || tab === 'chat') {
      if (!user) {
        setShowLoginModal(true);
        return;
      }
    }

    if (tab === 'admin' && !isAdmin) {
      simpleNotify.error('Admin access required');
      return;
    }

    navigateToScreen(tab);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <NewHomeScreen
            onNavigate={(screen: string, data?: any) => {
              console.log('[NewHomeScreen] Navigation:', screen, data);
              
              // Handle login
              if (screen === 'login') {
                setShowLoginModal(true);
                return;
              }
              
              // Handle navigation with data
              if (data) {
                if (data.wishId) {
                  console.log('🎯 App.tsx: Setting selectedWishId to:', data.wishId);
                  setSelectedWishId(data.wishId);
                  navigateToScreen('wish-detail');
                } else if (data.taskId) {
                  console.log('🎯 App.tsx: Setting selectedTaskId to:', data.taskId);
                  setSelectedTaskId(data.taskId);
                  navigateToScreen('task-detail');
                } else if (screen === 'chat' && data.conversationId) {
                  setChatConversationId(data.conversationId);
                  setTimeout(() => {
                    navigateToScreen('chat' as Screen);
                  }, 100);
                  return;
                } else if (typeof data === 'object' && 'id' in data && 'title' in data) {
                  // This is a listing object being passed
                  // ✅ Validate that the ID is not empty before navigating
                  if (data.id && data.id !== 'undefined' && data.id !== 'null') {
                    navigateToScreen('listing', data);
                  } else {
                    console.error('❌ [App] Listing object has invalid ID:', data?.id, 'Title:', data?.title, 'Type:', typeof data?.id);
                    navigateToScreen('home');
                  }
                } else if (screen === 'listing') {
                  // ❌ Trying to navigate to listing without valid data
                  console.error('❌ [App] Cannot navigate to listing - invalid data:', data);
                  navigateToScreen('home');
                } else {
                  navigateToScreen(screen as Screen);
                }
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            notificationCount={notificationUnreadCount}
            userLocation={globalLocation && globalLocation.latitude !== undefined && globalLocation.longitude !== undefined ? { 
              latitude: globalLocation.latitude, 
              longitude: globalLocation.longitude,
              area: globalLocation.area,
              city: globalLocation.city 
            } : null}
            onNotificationClick={() => setShowNotificationPanel(true)}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
            onContactClick={() => setShowContactModal(true)}
            socialLinks={socialLinks}
          />
        );

      case 'marketplace':
        return (
          <MarketplaceScreen
            onListingClick={(listing) => {
              // ✅ Validate listing has required properties before navigation
              if (listing?.id && listing?.title && typeof listing.id === 'string' && listing.id !== 'undefined' && listing.id !== 'null' && listing.id !== '') {
                navigateToScreen('listing', listing);
              } else {
                console.error('❌ [App] MarketplaceScreen - Invalid listing data:', 'ID:', listing?.id, 'Title:', listing?.title, 'Type:', typeof listing?.id);
                simpleNotify.error('Invalid listing data');
              }
            }}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
            onCityChange={(cityId) => setSelectedCity(cityId)}
            onAreaChange={(areaIds) => setSelectedArea(areaIds)}
            onNavigate={(screen: string, data?: any) => {
              // Handle navigation with data (e.g., conversationId for chat)
              if (data?.conversationId) {
                setChatConversationId(data.conversationId);
                navigateToScreen('chat');
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            cities={cities}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onGlobalLocationClick={() => setShowLocationSetupModal(true)}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            userCoordinates={globalLocation && globalLocation.latitude !== undefined && globalLocation.longitude !== undefined ? { 
              latitude: globalLocation.latitude, 
              longitude: globalLocation.longitude 
            } : null}
            onContactClick={() => setShowContactModal(true)}
            socialLinks={socialLinks}
          />
        );

      case 'create':
        return user ? (
          <CreateListingScreen
            onBack={() => navigateToScreen('home')}
            onSuccess={() => {
              setJustCreatedContent(true); // Prevent location modal
              setTimeout(() => setJustCreatedContent(false), 5000); // Reset after 5 seconds
              navigateToScreen('home');
              simpleNotify.success('Listing created successfully! 🎉');
            }}
            onNavigate={(screen: Screen) => navigateToScreen(screen)}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user.name}
            unreadCount={unreadCount}
            cities={cities}
          />
        ) : null;

      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onLogin={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onListingClick={(listing) => {
              // ✅ Validate listing has required properties before navigation
              if (listing?.id && listing?.title && typeof listing.id === 'string' && listing.id !== 'undefined' && listing.id !== 'null' && listing.id !== '') {
                navigateToScreen('listing', listing);
              } else {
                console.error('❌ [App] ProfileScreen - Invalid listing data:', 'ID:', listing?.id, 'Title:', listing?.title, 'Type:', typeof listing?.id);
                simpleNotify.error('Invalid listing data');
              }
            }}
            onEditListing={(listing) => {
              // ✅ Validate listing has required properties before edit navigation
              if (listing?.id && listing?.title && typeof listing.id === 'string' && listing.id !== 'undefined' && listing.id !== 'null' && listing.id !== '') {
                navigateToScreen('edit', listing);
              } else {
                console.error('❌ [App] ProfileScreen - Invalid edit listing data:', 'ID:', listing?.id, 'Title:', listing?.title, 'Type:', typeof listing?.id);
                simpleNotify.error('Invalid listing data');
              }
            }}
            onNavigate={(screen, data) => {
              console.log('[App.tsx] ProfileScreen onNavigate called:', { screen, data });
              // Handle wish edit data
              if (screen === 'create-wish' && data?.editMode && data?.wish) {
                console.log('[App.tsx] Setting editWishData:', data.wish);
                setEditWishData(data.wish);
                navigateToScreen('create-wish');
              }
              // Handle task edit data
              else if (screen === 'create-task' && data?.editMode && data?.task) {
                console.log('[App.tsx] Setting editTaskData:', data.task);
                setEditTaskData(data.task);
                navigateToScreen('create-task');
              }
              else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
          />
        );

      case 'listing':
        return selectedListing ? (
          <ListingDetailScreen
            listing={selectedListing}
            onBack={() => {
              setSelectedListing(null);
              window.history.back();
            }}
            isLoggedIn={!!user}
            onLoginRequired={() => setShowLoginModal(true)}
            onChatClick={async (listing) => {
              // Create or get conversation with this listing seller
              console.log('💬 Chat button clicked for listing:', listing.id);
              console.log('💬 Seller userId/owner_token:', listing.userId);
              
              // Check if listing has a valid seller ID
              if (!listing.userId) {
                console.error('❌ Listing has no userId');
                simpleNotify.error('Unable to chat. Seller information is missing.');
                return;
              }
              
              try {
                const { conversation, error } = await getOrCreateConversation(
                  listing.id,
                  listing.title,
                  listing.images[0], // First image
                  listing.price,
                  listing.userId, // This is owner_token
                  listing.userName,
                  undefined, // Seller avatar
                  'listing' // ✅ Pass listing type for proper conversation handling
                );
                
                if (error || !conversation) {
                  console.error('❌ Failed to create/get conversation:', error);
                  
                  // Show user-friendly error message
                  if (error && error.includes('cannot chat with yourself')) {
                    simpleNotify.error('You cannot chat about your own listing.');
                  } else if (error && error.includes('profile could not be found')) {
                    simpleNotify.error('This listing is no longer available for chat. The seller may have deleted their account.');
                  } else if (error && error.includes('Seller information is missing')) {
                    simpleNotify.error('Unable to chat. Seller information is missing.');
                  } else {
                    simpleNotify.error(error || 'Failed to open chat. Please try again.');
                  }
                  return;
                }
                
                console.log('✅ Conversation ready:', conversation.id);
                console.log('✅ Setting chatConversationId to:', conversation.id);
                
                // 🔥 IMPROVED: Set the conversation ID immediately
                setChatConversationId(conversation.id);
                
                // Wait 100ms for React state update, then navigate
                // ChatScreen will handle the conversation selection with its own retry logic
                console.log('⏳ Waiting 100ms for state update before navigating...');
                await new Promise(resolve => setTimeout(resolve, 100));
                
                console.log('✅ chatConversationId SET - now navigating to chat screen');
                console.log('✅ ChatScreen will auto-select the conversation with retry logic');
                navigateToScreen('chat');
              } catch (err) {
                console.error('❌ Exception in onChatClick:', err);
                simpleNotify.error('Failed to open chat. Please try again.');
              }
            }}
            currentUserId={user?.id}
          />
        ) : null;

      case 'edit':
        return selectedListing && user ? (
          <EditListingScreen
            listing={selectedListing}
            onBack={() => {
              setSelectedListing(null);
              window.history.back();
            }}
            onSuccess={() => {
              setSelectedListing(null);
              navigateToScreen('home');
              simpleNotify.success('Listing updated successfully!');
            }}
            onNavigate={(screen) => navigateToScreen(screen as Screen)}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user.name}
            cities={cities}
          />
        ) : null;

      case 'chat':
        return (
          <ChatScreen
            key={chatConversationId || 'chat-default'} // Force remount when conversation ID changes
            onBack={() => {
              // Clear the conversation ID when going back
              setChatConversationId(null);
              // On mobile, use browser back if available, otherwise go home
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigateToScreen('home');
              }
            }}
            initialConversationId={chatConversationId} // Pass the conversation ID to open directly
            onNavigate={(screen, data) => {
              // Handle navigation with data (listing object, wishId, taskId, etc.)
              console.log('🔥 [App.tsx] ChatScreen onNavigate:', { screen, data });
              
              if (screen === 'wishDetail' && data?.wishId) {
                setSelectedWishId(data.wishId);
                navigateToScreen('wish-detail');
              } else if (screen === 'taskDetail' && data?.taskId) {
                setSelectedTaskId(data.taskId);
                navigateToScreen('task-detail');
              } else if (screen === 'listingDetail' && data?.listingId) {
                // ✅ FIX: Fetch the listing by ID before navigating
                const fetchAndNavigate = async () => {
                  try {
                    const listingData = await getListingById(
                      data.listingId,
                      globalLocation?.latitude,
                      globalLocation?.longitude
                    );
                    if (listingData) {
                      const categoriesData = await getAllCategories();
                      const category = categoriesData.find((c: any) => c.slug === listingData.category_slug);
                      const city = cities.find(c => c.name === listingData.city);
                      const area = city?.areas?.find(a => a.slug === listingData.area_slug);
                      
                      const transformedListing: Listing = {
                        id: listingData.id,
                        title: listingData.title,
                        description: listingData.description,
                        price: listingData.price,
                        categoryId: category?.id || 0,
                        categoryName: category?.name || 'Other',
                        categoryEmoji: category?.emoji || '📦',
                        cityId: city?.id || '',
                        cityName: city?.name || '',
                        areaId: area?.id || '',
                        areaName: area?.name || '',
                        images: listingData.images || [],
                        phone: listingData.owner_phone,
                        hasWhatsapp: listingData.whatsapp_enabled || false,
                        whatsapp: listingData.whatsapp_number,
                        userId: listingData.owner_token,
                        userName: listingData.owner_name,
                        createdAt: listingData.created_at,
                        isHidden: !listingData.is_active,
                        latitude: listingData.latitude,
                        longitude: listingData.longitude,
                        distance: listingData.distance,
                      };
                      
                      navigateToScreen('listing', transformedListing);
                    } else {
                      simpleNotify.error('Listing not found');
                      navigateToScreen('home');
                    }
                  } catch (error) {
                    console.error('❌ [App] Failed to fetch listing:', error);
                    simpleNotify.error('Failed to load listing');
                    navigateToScreen('home');
                  }
                };
                fetchAndNavigate();
              } else if (screen === 'listing' && data && typeof data === 'object' && 'id' in data) {
                // Listing object passed - navigate to listing detail
                // ✅ Validate that the ID is not empty before navigating
                if (data.id && data.id !== 'undefined' && data.id !== 'null') {
                  navigateToScreen('listing', data);
                } else {
                  console.error('❌ [App] Listing object has invalid ID:', data?.id, 'Title:', data?.title, 'Type:', typeof data?.id);
                  navigateToScreen('home');
                }
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            onMenuClick={() => setShowMobileMenu(true)}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onGlobalLocationClick={() => setShowLocationSetupModal(true)}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
          />
        );

      case 'admin':
        return user && isAdmin ? (
          <AdminScreen
            onNavigate={(screen) => navigateToScreen(screen as Screen)}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user.name}
          />
        ) : null;

      case 'about':
        return <AboutPage onBack={() => navigateToScreen('home')} />;

      case 'terms':
        return <TermsPage onBack={() => navigateToScreen('home')} />;

      case 'privacy':
        return <PrivacyPage onBack={() => navigateToScreen('home')} />;

      case 'safety':
        return <SafetyPage onBack={() => navigateToScreen('home')} />;

      case 'prohibited':
        return <ProhibitedItemsPage onBack={() => navigateToScreen('home')} />;

      case 'contact':
        return <ContactPage onBack={() => navigateToScreen('home')} />;

      case 'diagnostic':
        return (
          <DiagnosticScreen
            onNavigate={(tab) => navigateToScreen(tab as Screen)}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            onNavigate={(screen, params) => {
              if (params) {
                if (params.taskId) {
                  setSelectedTaskId(params.taskId);
                  navigateToScreen('task-detail');
                } else if (params.wishId) {
                  setSelectedWishId(params.wishId);
                  navigateToScreen('wish-detail');
                } else if (params.conversationId) {
                  setChatConversationId(params.conversationId);
                  navigateToScreen('chat');
                } else {
                  navigateToScreen(screen as Screen);
                }
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            notificationCount={notificationUnreadCount}
          />
        );

      case 'wishes':
        return (
          <WishesScreen
            onNavigate={(screen: string, data?: any) => {
              // Handle navigation with data
              if (data) {
                if (data.wishId) {
                  setSelectedWishId(data.wishId);
                  navigateToScreen('wish-detail');
                } else if (data.taskId) {
                  setSelectedTaskId(data.taskId);
                  navigateToScreen('wish-detail');
                } else if (screen === 'chat' && data.conversationId) {
                  setChatConversationId(data.conversationId);
                  setTimeout(() => {
                    navigateToScreen('chat' as Screen);
                  }, 100);
                  return;
                }
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            cities={cities}
            onMenuClick={() => setShowMobileMenu(true)}
            showGlobalLocation={true}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onLocationClick={() => setShowLocationSetupModal(true)}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
            onLoginRequired={() => setShowLoginModal(true)}
            onContactClick={() => setShowContactModal(true)}
            socialLinks={socialLinks}
          />
        );

      case 'create-wish':
        return user ? (
          <CreateWishScreen
            onBack={() => navigateToScreen('home')}
            onSuccess={() => {
              setJustCreatedContent(true); // Prevent location modal
              setTimeout(() => setJustCreatedContent(false), 5000); // Reset after 5 seconds
              navigateToScreen('home');
              simpleNotify.success('Wish created successfully! 🎉');
            }}
            onNavigate={(screen, data) => {
              console.log('[App.tsx] CreateWishScreen onNavigate:', { screen, data });
              // Handle navigation with data
              if (data) {
                if (data.wishId) {
                  setSelectedWishId(data.wishId);
                  setEditWishData(null); // Clear edit data after successful update
                  navigateToScreen('wish-detail');
                } else if (data.taskId) {
                  setSelectedTaskId(data.taskId);
                  navigateToScreen('task-detail');
                } else if (screen === 'chat' && data.conversationId) {
                  setChatConversationId(data.conversationId);
                  setTimeout(() => {
                    navigateToScreen('chat' as Screen);
                  }, 100);
                  return;
                }
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user.name}
            unreadCount={unreadCount}
            cities={cities}
            editMode={!!editWishData}
            wishId={editWishData?.id}
            wish={editWishData}
          />
        ) : null;

      case 'wish-detail':
        return selectedWishId ? (
          <WishDetailScreen
            wishId={selectedWishId}
            onBack={() => {
              setSelectedWishId(null);
              navigateToScreen('home');
            }}
            onNavigate={(screen, data) => {
              if (screen === 'chat' && data?.conversationId) {
                setChatConversationId(data.conversationId);
                setTimeout(() => {
                  navigateToScreen('chat' as Screen);
                }, 100);
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            onLoginRequired={() => setShowLoginModal(true)}
            currentUserId={user?.id}
            showGlobalLocation={true}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
          />
        ) : null;

      case 'tasks':
        return (
          <TasksScreen
            user={user}
            onNavigate={(screen: string, data?: any) => {
              // Handle navigation with data
              if (data) {
                // Check editMode FIRST before taskId
                if (data.editMode && data.task) {
                  // Handle task edit data
                  setEditTaskData(data.task);
                  navigateToScreen('create-task');
                } else if (data.taskId) {
                  setSelectedTaskId(data.taskId);
                  navigateToScreen('task-detail');
                } else if (data.wishId) {
                  setSelectedWishId(data.wishId);
                  navigateToScreen('wish-detail');
                } else if (screen === 'chat' && data.conversationId) {
                  setChatConversationId(data.conversationId);
                  setTimeout(() => {
                    navigateToScreen('chat' as Screen);
                  }, 100);
                  return;
                }
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            cities={cities}
            showGlobalLocation={true}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
            onLoginRequired={() => setShowLoginModal(true)}
            onContactClick={() => setShowContactModal(true)}
            socialLinks={socialLinks}
          />
        );

      case 'create-task':
        return user ? (
          <CreateTaskScreen
            onBack={() => {
              setEditTaskData(null); // Clear edit data
              navigateToScreen('home');
            }}
            onSuccess={() => {
              setJustCreatedContent(true); // Prevent location modal
              setTimeout(() => setJustCreatedContent(false), 5000); // Reset after 5 seconds
              setEditTaskData(null); // Clear edit data
              navigateToScreen('home');
              simpleNotify.success(editTaskData ? 'Task updated successfully! 🎉' : 'Task created successfully!');
            }}
            onNavigate={(screen) => {
              setEditTaskData(null); // Clear edit data
              navigateToScreen(screen as Screen);
            }}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user.name}
            unreadCount={unreadCount}
            cities={cities}
            editMode={!!editTaskData}
            taskId={editTaskData?.id}
            task={editTaskData}
          />
        ) : null;

      case 'task-detail':
        return selectedTaskId ? (
          <TaskDetailScreen
            taskId={selectedTaskId}
            onBack={() => {
              setSelectedTaskId(null);
              navigateToScreen('home');
            }}
            onNavigate={(screen: string, data?: any) => {
              // Handle task edit data
              if (screen === 'create-task' && data?.editMode && data?.task) {
                setEditTaskData(data.task);
              }
              // Handle chat navigation with conversationId
              if (screen === 'chat' && data?.conversationId) {
                setChatConversationId(data.conversationId);
                setTimeout(() => {
                  navigateToScreen('chat' as Screen);
                }, 100);
                return;
              }
              navigateToScreen(screen as Screen);
            }}
            isLoggedIn={!!user}
            onLoginRequired={() => setShowLoginModal(true)}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            showGlobalLocation={true}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            unreadCount={unreadCount}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Render app content - allow guest users to browse */}
      {renderScreen()}

      {/* Bottom Navigation for primary tabs */}
      {['home', 'marketplace', 'wishes', 'tasks', 'chat', 'profile', 'create-wish', 'create-task'].includes(currentScreen) && (
        <BottomNavigation
          currentScreen={currentScreen as 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'profile'}
          onNavigate={(screen) => {
            if (screen === 'chat' && !user) {
              setShowLoginModal(true);
              return;
            }
            navigateToScreen(screen);
          }}
          unreadCount={notificationUnreadCount}
          chatUnreadCount={unreadCount}
          activeTasksCount={activeTasksCount}
          onMenuClick={() => setShowMobileMenu(true)}
        />
      )}

      {/* Mobile Menu Sheet */}
      <MobileMenuSheet
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        isLoggedIn={!!user}
        isAdmin={isAdmin}
        userDisplayName={user?.name}
        onNavigate={(screen) => navigateToScreen(screen as Screen)}
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotificationPanel(true)}
        notificationCount={notificationUnreadCount}
        onLocationClick={() => setShowLocationSetupModal(true)}
        locationText={globalLocation?.area && globalLocation?.city ? `${globalLocation.area}, ${globalLocation.city}` : undefined}
        onLoginClick={() => setShowLoginModal(true)}
        onContactClick={() => setShowContactModal(true)}
        appDownloadUrl={appDownloadUrl}
        appDownloadEnabled={appDownloadEnabled}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Auth Modal - Show when login required */}
      {showLoginModal && (
        <PhoneAuthScreen
          onSuccess={(user) => {
            // User data is already stored in localStorage by PhoneAuthScreen
            handleLogin(user.clientToken);
            setShowLoginModal(false);
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Location Selector - Hybrid GPS/Search System */}
      {showLocationSetupModal && (
        <LocationSelector
          onLocationSelect={async (location) => {
            // Map the new GPS-based location to our existing UserLocation format
            const selectedCity = cities.find(c => c.name.toLowerCase() === location.city.toLowerCase());
            
            // Extract meaningful area name from the address (first 2 parts for better context)
            // Priority: locality (neighborhood) > first 2 parts of address > city
            let areaName = location.locality;
            
            if (!areaName && location.address) {
              const parts = location.address.split(',').map(s => s.trim()).filter(Boolean);
              // Take first 2 parts for better context (e.g., "Canara Bank, Puttenahalli Main Road")
              if (parts.length >= 2) {
                areaName = `${parts[0]}, ${parts[1]}`;
              } else if (parts.length >= 1) {
                areaName = parts[0];
              }
            }
            
            if (!areaName) {
              areaName = location.city;
            }
            
            // Better city extraction from address if city is empty
            let cityName = location.city;
            if (!cityName || cityName.trim() === '') {
              // Try to extract from address
              // Address format: "Street, Area, City, State Pincode, Country"
              const parts = location.address.split(',').map(s => s.trim()).filter(Boolean);
              if (parts.length >= 3) {
                // City is usually the 3rd part (index 2)
                cityName = parts[2];
              } else if (parts.length >= 2) {
                // Fallback to 2nd part
                cityName = parts[1];
              }
              console.log('🔍 Extracted city from address:', cityName);
            }
            
            const locationData = {
              cityId: selectedCity?.id || null,
              city: cityName || location.locality || areaName, // Fallback chain
              areaId: location.locality || cityName,
              area: areaName,
              subAreaId: undefined,
              subArea: undefined,
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              locality: location.locality,
              state: location.state,
              pincode: location.pincode,
              detectionMethod: 'auto' as const,
            };
            
            console.log('📍 Saving location with:', { area: locationData.area, city: locationData.city });
            
            await updateGlobalLocation(locationData);
            setShowLocationSetupModal(false);
            
            if (globalLocation && globalLocation.latitude) {
              simpleNotify.success('Location updated! 📍');
            } else {
              simpleNotify.success('Location set! 📍 Now you can browse nearby items!');
            }
          }}
          onClose={() => {
            // Only allow closing if location is already set
            if (globalLocation && globalLocation.latitude) {
              setShowLocationSetupModal(false);
            }
          }}
          currentLocation={globalLocation && globalLocation.latitude ? {
            latitude: globalLocation.latitude,
            longitude: globalLocation.longitude,
            city: globalLocation.city,
          } : null}
          title={globalLocation && globalLocation.latitude ? 'Change Your Location' : 'Set Your Location'}
          description={globalLocation && globalLocation.latitude ? 
            'Update your location to see nearby items' : 
            'LocalFelo works better with your precise location'
          }
        />
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={notificationUnreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotif}
          onClose={() => setShowNotificationPanel(false)}
          onNotificationClick={(notification) => {
            setShowNotificationPanel(false);
            // Navigate based on notification type
            if (notification.action_url) {
              if (notification.related_type === 'task' && notification.related_id) {
                setSelectedTaskId(notification.related_id);
                navigateToScreen('task-detail');
              } else if (notification.related_type === 'wish' && notification.related_id) {
                setSelectedWishId(notification.related_id);
                navigateToScreen('wish-detail');
              } else if (notification.related_type === 'chat') {
                navigateToScreen('chat');
              }
            }
          }}
        />
      )}

      {/* Notification Popup */}
      {activePopupNotification && (
        <NotificationPopup
          notification={activePopupNotification}
          onClose={() => setActivePopupNotification(null)}
          onAction={(actionType) => {
            console.log('🔔 Popup action:', actionType, activePopupNotification);
            
            // Handle different actions
            if (actionType === 'chat' && activePopupNotification.related_id) {
              // Navigate to chat for this task
              setActivePopupNotification(null);
              setChatConversationId(activePopupNotification.related_id);
              navigateToScreen('chat');
            } else if (actionType === 'view' && activePopupNotification.related_id) {
              // Navigate to task detail
              setActivePopupNotification(null);
              setSelectedTaskId(activePopupNotification.related_id);
              navigateToScreen('task-detail');
            } else if (actionType === 'complete' && activePopupNotification.related_id) {
              // Navigate to task detail to complete
              setActivePopupNotification(null);
              setSelectedTaskId(activePopupNotification.related_id);
              navigateToScreen('task-detail');
            }
          }}
        />
      )}

      {/* Sonner Toaster - For toast.success/error/info calls */}
      <Toaster 
        position="top-right" 
        expand={true}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: '#000000',
            color: '#ffffff',
            border: '1px solid #333333',
          },
          className: 'sonner-toast',
        }}
      />

      {/* Simple Notifications Container */}
      <SimpleNotificationContainer
        notifications={simpleNotify.notifications}
        onRemove={simpleNotify.removeNotification}
      />

      {/* Intro Modal - Show on first app load */}
      {showIntroModal && (
        <IntroModal
          onComplete={() => {
            console.log('👋 [App] Intro completed - saving to localStorage');
            localStorage.setItem('localfelo_intro_skipped', 'true');
            setShowIntroModal(false);
            setHasCheckedIntro(true);
          }}
          onSkip={() => {
            console.log('⏭️ [App] Intro skipped - saving to localStorage');
            localStorage.setItem('localfelo_intro_skipped', 'true');
            setShowIntroModal(false);
            setHasCheckedIntro(true);
          }}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
        onNavigate={(screen, data) => {
          if (data) {
            if (screen === 'listing' && data.id) {
              // ✅ FIX: Pass the listing object to navigateToScreen
              // ✅ Validate that the ID is not empty before navigating
              if (data.id && data.id !== 'undefined' && data.id !== 'null' && data.id !== '') {
                navigateToScreen('listing', data);
              } else {
                console.error('❌ [App] GlobalSearch listing has invalid ID:', data?.id, 'Title:', data?.title, 'Type:', typeof data?.id);
                navigateToScreen('home');
              }
            } else if (screen === 'wish-detail' && data.wishId) {
              setSelectedWishId(data.wishId);
              navigateToScreen('wish-detail');
            } else if (screen === 'task-detail' && data.taskId) {
              setSelectedTaskId(data.taskId);
              navigateToScreen('task-detail');
            }
          } else {
            navigateToScreen(screen as Screen);
          }
        }}
        userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
      />

      {/* Active Task Banner - Shows when user has accepted tasks */}
      <ActiveTaskBanner
        onNavigate={(screen) => navigateToScreen(screen as Screen)}
        activeTasksCount={activeTasksCount}
      />

      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title="Menu"
      >
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowMenuModal(false);
              navigateToScreen('about');
            }}
            className="w-full p-3 text-left flex items-center gap-3 hover:bg-input rounded transition-all"
          >
            <Info className="w-5 h-5 text-primary" />
            <span className="text-body">About</span>
          </button>
          <button
            onClick={() => {
              setShowMenuModal(false);
              navigateToScreen('safety');
            }}
            className="w-full p-3 text-left flex items-center gap-3 hover:bg-input rounded transition-all"
          >
            <ShieldIcon className="w-5 h-5 text-primary" />
            <span className="text-body">Safety Guidelines</span>
          </button>
          <button
            onClick={() => {
              setShowMenuModal(false);
              navigateToScreen('terms');
            }}
            className="w-full p-3 text-left flex items-center gap-3 hover:bg-input rounded transition-all"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-body">Terms & Conditions</span>
          </button>
          <button
            onClick={() => {
              setShowMenuModal(false);
              navigateToScreen('privacy');
            }}
            className="w-full p-3 text-left flex items-center gap-3 hover:bg-input rounded transition-all"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-body">Privacy Policy</span>
          </button>
          <button
            onClick={() => {
              setShowMenuModal(false);
              navigateToScreen('contact');
            }}
            className="w-full p-3 text-left flex items-center gap-3 hover:bg-input rounded transition-all"
          >
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-body">Contact Us</span>
          </button>
        </div>
      </Modal>

    </div>
  );
}

// Debug functions
if (typeof window !== 'undefined') {
  (window as any).clearUnreadMessages = async () => {
    console.log('🧹 Clearing all unread messages...');
    const result = await markAllMessagesAsRead();
    if (result.success) {
      console.log(`✅ Successfully cleared ${result.count || 0} unread messages!`);
      console.log('🔄 Please refresh the page.');
    } else {
      console.error('❌ Error:', result.error);
    }
    return result;
  };
}