import { useState, useEffect, useRef } from 'react';
import { useLocation as useRouterLocation, useNavigate, BrowserRouter } from 'react-router';
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

// Utils
import { updateSEO, getSEOConfig } from './utils/seo';

// Hooks
import { useLocation } from './hooks/useLocation';
import { useNotifications } from './hooks/useNotifications';
import { usePushNotifications } from './hooks/usePushNotifications';

// Components
import { Modal } from './components/Modal';
import { PhoneAuthScreen } from './screens/PhoneAuthScreen';
import { AnimatedBottomNav } from './components/AnimatedBottomNav';
import { NotificationPanel } from './components/NotificationPanel';
import { MobileMenuSheet } from './components/MobileMenuSheet';
import { ContactModal } from './components/ContactModal';
import { useSimpleNotifications, SimpleNotificationContainer } from './components/SimpleNotification';
import { OfflineRibbon } from './components/OfflineRibbon';
import { TaskCreatedSuccessModal } from './components/TaskCreatedSuccessModal';
import { ActiveTasksModal } from './components/ActiveTasksModal';
import { UpdateNotification } from './components/UpdateNotification';

// Screens
import { MarketplaceScreen } from './screens/MarketplaceScreen';
import { CreateListingScreen } from './screens/CreateListingScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ListingDetailScreen } from './screens/ListingDetailScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AdminScreen } from './screens/AdminScreen';
import { AdminCategoryManagementScreen } from './screens/AdminCategoryManagementScreen';
import { AboutLocalFeloPage } from './screens/AboutLocalFeloPage';
import { HowItWorksPage } from './screens/HowItWorksPage';
import { TermsPage } from './screens/TermsPage';
import { PrivacyPage } from './screens/PrivacyPage';
import { SafetyPage } from './screens/SafetyPage';
import { DiagnosticScreen } from './screens/DiagnosticScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProhibitedItemsPage } from './screens/ProhibitedItemsPage';
import { FAQPage } from './screens/FAQPage';
// NEW MVP FEATURES
import { WishesScreen } from './screens/WishesScreen';
import { CreateWishScreen } from './screens/CreateWishScreen';
import { WishDetailScreen } from './screens/WishDetailScreen';
import { TasksScreen } from './screens/TasksScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import { CreateJobScreen } from './screens/CreateJobScreen';
import { CreateSmartTaskScreen } from './screens/CreateSmartTaskScreen';
import { HelperPreferencesScreen } from './screens/HelperPreferencesScreen';
import { NewHomeScreen } from './screens/NewHomeScreen';
import { HelperReadyModeScreen } from './screens/HelperReadyModeScreen';
import { HelperModeBadge } from './components/HelperModeBadge';
import { SimpleHelperModeScreen } from './screens/SimpleHelperModeScreen'; // ← NEW: 12 card-based categories
import { NewTasksScreen } from './screens/NewTasksScreen'; // ← NEW: Tasks screen with 12-category integration
import { UnifiedTasksScreen } from './screens/UnifiedTasksScreen'; // ← UNIFIED: One screen for both flows
import { CleanTasksScreen } from './screens/CleanTasksScreen'; // ← CLEAN: Better UI/UX design
import { PublicBrowseScreen } from './screens/PublicBrowseScreen'; // ← PUBLIC: Browse for non-logged-in users
// ✅ ROLE-BASED PROFESSIONALS SYSTEM
import { ProfessionalsRoleScreen } from './screens/ProfessionalsRoleScreen'; // ← NEW: Role-based professionals home
import { ProfessionalsListingRoleScreen } from './screens/ProfessionalsListingRoleScreen'; // ← NEW: Professionals by role
import { ProfessionalDetailScreen } from './screens/ProfessionalDetailScreen'; // ← Professional profile (updated for roles)
import { RegisterProfessionalRoleScreen } from './screens/RegisterProfessionalRoleScreen'; // ← NEW: Role-based registration
import { EditProfessionalRoleScreen } from './screens/EditProfessionalRoleScreen'; // ← NEW: Role-based edit
// ✅ SHOPS MODULE
import { ShopsScreen } from './screens/ShopsScreen';
import { ShopDetailsScreen } from './screens/ShopDetailsScreen';
import { RegisterShopScreen } from './screens/RegisterShopScreen';
import { EditShopScreen } from './screens/EditShopScreen';
import { ShopsCategoryScreen } from './screens/ShopsCategoryScreen';
import { AdminEditShopScreen } from './screens/AdminEditShopScreen';

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
  | 'admin-categories'
  | 'about'
  | 'how-it-works'
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
  | 'helper-tasks'
  | 'create-task'
  | 'create-job'
  | 'task-detail'
  | 'helper-ready-mode'
  | 'helper-preferences'
  | 'prohibited'
  | 'browse'
  | 'faq'
  | 'professionals'
  | 'professionals-listing'
  | 'professionals-listing-role'
  | 'professional-detail'
  | 'register-professional'
  | 'register-professional-role'
  | 'edit-professional'
  | 'shops'
  | 'shops-category'
  | 'shop-details'
  | 'register-shop'
  | 'edit-shop'
  | 'admin-edit-shop';

function getScreenFromPath(path: string): Screen {
  if (path === '/') return 'home'; // ✅ FIX: Show NewHomeScreen as default
  if (path.startsWith('/listing/')) return 'listing';
  if (path.startsWith('/edit-listing/')) return 'edit';
  if (path.startsWith('/wish-detail/')) return 'wish-detail';
  if (path.startsWith('/task-detail/')) return 'task-detail';
  if (path.startsWith('/professional/')) return 'professional-detail';
  if (path.startsWith('/edit-professional/')) return 'edit-professional';
  if (path.startsWith('/professionals/')) return 'professionals-listing';
  if (path.startsWith('/shop/')) return 'shop-details';
  if (path.startsWith('/edit-shop/')) return 'edit-shop';
  if (path.startsWith('/admin-edit-shop/')) return 'admin-edit-shop';
  if (path.startsWith('/shops/') && path !== '/shops') return 'shops-category';
  const screenMap: Record<string, Screen> = {
    '/marketplace': 'marketplace',
    '/create': 'create',
    '/profile': 'profile',
    '/chat': 'chat',
    '/admin': 'admin',
    '/admin/categories': 'admin-categories',
    '/about': 'about',
    '/how-it-works': 'how-it-works',
    '/terms': 'terms',
    '/privacy': 'privacy',
    '/safety': 'safety',
    '/contact': 'contact',
    '/diagnostic': 'diagnostic',
    '/notifications': 'notifications',
    '/wishes': 'wishes',
    '/create-wish': 'create-wish',
    '/tasks': 'tasks',
    '/helper-tasks': 'helper-tasks',
    '/create-task': 'create-task',
    '/create-job': 'create-job',
    '/helper-ready-mode': 'helper-ready-mode',
    '/helper-preferences': 'helper-preferences',
    '/prohibited': 'prohibited',
    '/browse': 'browse',
    '/faq': 'faq',
    '/professionals': 'professionals',
    '/register-professional': 'register-professional',
    '/shops': 'shops',
    '/register-shop': 'register-shop',
  };
  return screenMap[path] || 'home'; // ✅ FIX: Default to home
}

function AppContent() {
  
  // ✅ Prevent concurrent auth initialization
  const authInitializedRef = useRef(false);
  
  // Get current route information
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  
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
  const [selectedProfessionalSlug, setSelectedProfessionalSlug] = useState<string | null>(null);
  const [selectedEditProfessionalSlug, setSelectedEditProfessionalSlug] = useState<string | null>(null);
  const [selectedProfessionalsParams, setSelectedProfessionalsParams] = useState<{
    categoryId?: string; // Legacy support
    categoryName?: string; // Legacy support
    roleId?: string; // NEW: Role-based
    roleName?: string; // NEW: Role-based
    city: string;
  } | null>(null);
  const [selectedShopData, setSelectedShopData] = useState<{ shopId: string; slug: string } | null>(null); // For shop-details navigation
  const [editTaskData, setEditTaskData] = useState<any | null>(null);
  const [editWishData, setEditWishData] = useState<any | null>(null); // NEW: For editing wishes
  const [activeTasksCount, setActiveTasksCount] = useState(0);
  const [navigationData, setNavigationData] = useState<any>(null); // Store navigation data for passing between screens
  const [showTaskSuccessModal, setShowTaskSuccessModal] = useState(false); // Task creation success modal
  const [showActiveTasksModal, setShowActiveTasksModal] = useState(false); // Active tasks modal
  
  // Helper Ready Mode state
  const [helperIsAvailable, setHelperIsAvailable] = useState(false);
  const [helperPreferences, setHelperPreferences] = useState<{
    selected_categories: string[];
    selected_sub_skills: string[];
    max_distance: number;
    is_available: boolean;
  } | null>(null);
  
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
  
  // 🔍 EXTREME DEBUG: Log user state changes
  useEffect(() => {
    console.log('🔍🔍🔍 [App] USER STATE CHANGED:');
    console.log('   user:', user ? {
      id: user.id,
      name: user.name,
      phone: user.phone,
      clientToken: user.clientToken ? 'Present' : 'Missing'
    } : 'NULL');
    console.log('   pushStatus:', pushStatus);
  }, [user, pushStatus]);

  // Simple notifications (replaces toast)
  const simpleNotify = useSimpleNotifications();

  // ✅ URL SYNC - Keep screen state in sync with URL (for back button support)
  useEffect(() => {
    const path = routerLocation.pathname;
    const newScreen = getScreenFromPath(path);
    
    // STEP 1: Always update currentScreen to match URL (removed comparison to avoid stale closure)
    setCurrentScreen(newScreen);
    
    // STEP 2: Handle IDs based on screen type
    if (newScreen === 'task-detail' && path.startsWith('/task-detail/')) {
      const id = path.split('/task-detail/')[1]?.split('?')[0];
      if (id) {
        console.log('   📋 Setting selectedTaskId to:', id);
        setSelectedTaskId(id);
      }
    } else if (newScreen !== 'task-detail') {
      setSelectedTaskId(null);
    }
    
    if (newScreen === 'wish-detail' && path.startsWith('/wish-detail/')) {
      const id = path.split('/wish-detail/')[1]?.split('?')[0];
      if (id) {
        console.log('   💭 Setting selectedWishId to:', id);
        setSelectedWishId(id);
      }
    } else if (newScreen !== 'wish-detail') {
      setSelectedWishId(null);
    }
    
    if (newScreen !== 'listing' && newScreen !== 'edit') {
      setSelectedListing(null);
    }
    
    if (newScreen === 'professional-detail' && path.startsWith('/professional/')) {
      const slug = path.split('/professional/')[1]?.split('?')[0];
      if (slug) {
        console.log('   👔 Setting selectedProfessionalSlug to:', slug);
        setSelectedProfessionalSlug(slug);
      }
    } else if (newScreen !== 'professional-detail') {
      setSelectedProfessionalSlug(null);
    }
    
    if (newScreen === 'edit-professional' && path.startsWith('/edit-professional/')) {
      const slug = path.split('/edit-professional/')[1]?.split('?')[0];
      if (slug) {
        console.log('   ✏️ Setting selectedEditProfessionalSlug to:', slug);
        setSelectedEditProfessionalSlug(slug);
      }
    } else if (newScreen !== 'edit-professional') {
      setSelectedEditProfessionalSlug(null);
    }
    
    if (newScreen === 'professionals-listing' && path.startsWith('/professionals/')) {
      const parts = path.split('/professionals/')[1]?.split('/');
      if (parts && parts.length >= 2) {
        const identifier = parts[0]; // Can be roleId or categoryId
        const city = parts[1].split('?')[0];
        console.log('   👔 Setting selectedProfessionalsParams:', { identifier, city });
        // Store as roleId for role-based system, keep categoryId for backward compatibility
        setSelectedProfessionalsParams({ roleId: identifier, categoryId: identifier, categoryName: '', roleName: '', city });
      }
    } else if (newScreen !== 'professionals-listing') {
      setSelectedProfessionalsParams(null);
    }
    
    // ✅ Handle shop-details: Keep navigationData if it has shopId
    if (newScreen !== 'shop-details') {
      // Clear shop data when leaving shop-details
      if (selectedShopData) {
        setSelectedShopData(null);
      }
    }
  }, [routerLocation.pathname]);

  // ✅ ANDROID BACK BUTTON HANDLING - Only on native platforms
  useEffect(() => {
    // Early exit on web to avoid import errors
    if (typeof window === 'undefined' || !(window as any).Capacitor) {
      return;
    }

    let cleanup: (() => void) | null = null;

    // Lazy load the back button handler (only on native)
    import('./utils/androidBackButton')
      .then(({ setupAndroidBackButton }) => {
        return setupAndroidBackButton(
          currentScreen,
          chatConversationId,
          selectedListing,
          selectedWishId,
          selectedTaskId,
          setChatConversationId,
          setSelectedListing,
          setCurrentScreen,
          setSelectedWishId,
          setSelectedTaskId
        );
      })
      .then((cleanupFn) => {
        cleanup = cleanupFn;
      })
      .catch(() => {
        // Silently fail on web - expected behavior
      });

    // Cleanup
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [currentScreen, chatConversationId, selectedListing, selectedWishId, selectedTaskId]);

  // ✅ UPDATE ALL SEO META TAGS BASED ON CURRENT SCREEN (Dynamic SEO for Google Indexing)
  useEffect(() => {
    // Get SEO config for current screen with dynamic content
    const seoConfig = getSEOConfig(currentScreen, {
      // Pass IDs for detail pages
      listingId: selectedListing?.id,
      taskId: selectedTaskId || undefined,
      wishId: selectedWishId || undefined,
      // Pass dynamic content for better SEO
      listingTitle: selectedListing?.title,
      listingDescription: selectedListing?.description,
      listingImage: selectedListing?.images?.[0],
      // Task and wish details would be added here when available
      // You can fetch them in their respective screens and pass via state
    });

    // Update all SEO meta tags (title, description, OG tags, Twitter Cards, canonical URL)
    updateSEO(seoConfig);
  }, [currentScreen, selectedListing, selectedTaskId, selectedWishId]);

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
        avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || undefined, // ✅ ADD: Avatar URL
        gender: profile?.gender || undefined, // ✅ ADD: Gender
      };
      
      // 🔍 DEBUG: Log what we're syncing
      console.log('🔍 [APP AUTH SYNC] Profile from database:', profile);
      console.log('🔍 [APP AUTH SYNC] avatar_url from profile:', profile?.avatar_url);
      console.log('🔍 [APP AUTH SYNC] gender from profile:', profile?.gender);
      console.log('🔍 [APP AUTH SYNC] session.user.user_metadata:', session.user.user_metadata);
      console.log('🔍 [APP AUTH SYNC] oldCycleUser object:', oldCycleUser);
      
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

  // Load helper preferences from database
  const loadHelperPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('helper_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading helper preferences:', error);
        return;
      }

      if (data) {
        setHelperPreferences(data);
        setHelperIsAvailable(data.is_available || false);
      } else {
        // No preferences yet, set defaults
        setHelperPreferences(null);
        setHelperIsAvailable(false);
      }
    } catch (error) {
      console.error('Error loading helper preferences:', error);
    }
  };

  // Toggle helper mode - shared function for both screens
  const toggleHelperMode = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const newAvailability = !helperIsAvailable;
      
      if (helperPreferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('helper_preferences')
          .update({ 
            is_available: newAvailability,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;

        setHelperPreferences({
          ...helperPreferences,
          is_available: newAvailability
        });
        setHelperIsAvailable(newAvailability);
        
        const { toast } = await import('sonner');
        toast.success(newAvailability ? 'Helper mode ON' : 'Helper mode OFF');
      } else {
        // No preferences yet - need to set categories first
        // Navigate to tasks screen which will show category modal
        navigateToScreen('tasks');
      }
    } catch (error) {
      console.error('Error toggling helper mode:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to toggle helper mode');
    }
  };

  // Update helper preferences from child components
  const updateHelperPreferences = (newPreferences: any) => {
    setHelperPreferences(newPreferences);
    setHelperIsAvailable(newPreferences.is_available || false);
  };

  // Load helper preferences when user changes
  useEffect(() => {
    if (user?.id) {
      loadHelperPreferences(user.id);
    } else {
      setHelperPreferences(null);
      setHelperIsAvailable(false);
    }
  }, [user?.id]);

  // Initialize user from localStorage
  useEffect(() => {
    // ✅ Prevent concurrent initialization
    if (authInitializedRef.current) {
      console.log('⏭️ Auth already initialized, skipping...');
      return;
    }
    authInitializedRef.current = true;
    
    console.log('🚀 App initializing...');
    
    // Check for existing Supabase session first
    const checkSupabaseSession = async () => {
      // ✅ CRITICAL: Wait for Capacitor storage to be ready before checking session
      // On Android, Preferences storage needs time to initialize
      console.log('⏳ Waiting for storage to initialize...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Storage ready, checking for session...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ Active Supabase session found');
        await handleSupabaseSession(session);
        return true;
      }
      return false;
    };
    
    // Then check Capacitor storage as fallback (async)
    const checkLocalStorage = async () => {
      const savedUser = await getCurrentUser();
      const savedToken = await getClientToken();

      if (savedUser && savedToken) {
        console.log('✅ User found in storage:', savedUser.name);
        setUser(savedUser);
        
        const isAdminUser = await checkIsAdmin();
        setIsAdmin(isAdminUser);
        if (isAdminUser) console.log('👑 Admin user detected');
        return true;
      }
      console.log('ℹ️ No user in storage');
      return false;
    };
    
    // ✅ FIX: Check Supabase session FIRST, then storage fallback
    checkSupabaseSession().then(async hasSession => {
      if (!hasSession) {
        const hasLocalUser = await checkLocalStorage();
        if (!hasLocalUser) {
          console.log('👤 No session found - user is guest');
        }
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('screen') === 'diagnostic') {
      setCurrentScreen('diagnostic');
    }

    // Create a base entry to prevent app closure on mobile back button
    // This ensures there's always a history entry before the current one
    console.log('🛡️ Initializing history for mobile back button support');
    
    // ✅ FIX: Handle 404.html redirects from static hosting platforms
    // Check if we were redirected from 404.html (GitHub Pages, Cloudflare Pages, etc.)
    try {
      const redirectPath = sessionStorage.getItem('redirectPath');
      const redirectSearch = sessionStorage.getItem('redirectSearch');
      const redirectHash = sessionStorage.getItem('redirectHash');
      
      if (redirectPath && redirectPath !== '/') {
        console.log('🔄 Restoring path from 404 redirect:', redirectPath);
        
        // Clear the session storage
        sessionStorage.removeItem('redirectPath');
        sessionStorage.removeItem('redirectSearch');
        sessionStorage.removeItem('redirectHash');
        
        // Build the full URL
        const fullPath = redirectPath + (redirectSearch || '') + (redirectHash || '');
        
        // Replace the current URL without triggering a page reload
        window.history.replaceState(null, '', fullPath);
      }
    } catch (e) {
      console.error('Failed to restore redirect path:', e);
    }
    
    const currentPath = window.location.pathname;
    const currentScreenFromPath = getScreenFromPath(currentPath);
    
    // ✅ FIX: Set initial screen based on current URL path
    if (currentScreenFromPath !== 'home' || currentPath !== '/') {
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
      
      if (currentPath.startsWith('/task-detail/')) {
        const taskId = currentPath.split('/task-detail/')[1];
        if (taskId) {
          console.log('📋 Loading task from URL:', taskId);
          setSelectedTaskId(taskId);
        }
      }
      
      if (currentPath.startsWith('/wish-detail/')) {
        const wishId = currentPath.split('/wish-detail/')[1];
        if (wishId) {
          console.log('💭 Loading wish from URL:', wishId);
          setSelectedWishId(wishId);
        }
      }
      
      if (currentPath.startsWith('/professional/')) {
        const slug = currentPath.split('/professional/')[1];
        if (slug) {
          console.log('👔 Loading professional from URL:', slug);
          setSelectedProfessionalSlug(slug);
        }
      }
      
      if (currentPath.startsWith('/professionals/')) {
        const parts = currentPath.split('/professionals/')[1]?.split('/');
        if (parts && parts.length >= 2) {
          const identifier = parts[0]; // Can be roleId or categoryId
          const city = parts[1];
          console.log('👔 Loading professionals listing from URL:', { identifier, city });
          setSelectedProfessionalsParams({ roleId: identifier, categoryId: identifier, categoryName: '', roleName: '', city });
        }
      }
    }
    
    // Replace current state with base state
    // DISABLED: This was creating duplicate history entries and interfering with React Router
    // window.history.replaceState({ screen: currentScreenFromPath, isBase: true, sentinel: true }, '', currentPath);

    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      const screen = getScreenFromPath(path);
      
      console.log('🔙 [popstate] EVENT FIRED (back button OR state change)');
      console.log('   Current screen state:', currentScreen);
      console.log('   New path:', path);
      console.log('   New screen:', screen);
      console.log('   History state:', event.state);
      console.log('   ⚠️ This should ONLY fire on browser back/forward, not on navigate()!');
      
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

      // Handle wish-detail - only restore ID when navigating TO this screen
      if (screen === 'wish-detail' && event.state?.wishId) {
        console.log('💭 Loading wish from history:', event.state.wishId);
        setSelectedWishId(event.state.wishId);
        setCurrentScreen('wish-detail');
        window.scrollTo(0, 0);
        return;
      }

      // Handle task-detail - only restore ID when navigating TO this screen
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
      
      // Clear detail screen IDs when navigating to other screens
      if (screen !== 'task-detail') setSelectedTaskId(null);
      if (screen !== 'wish-detail') setSelectedWishId(null);
      if (screen !== 'listing') setSelectedListing(null);
      if (screen !== 'chat') setChatConversationId(null);
      
      setCurrentScreen(screen);
    };

    // 🔥 POPSTATE HANDLER PERMANENTLY DISABLED - useEffect-URL at line 283 handles URL sync
    // The popstate handler was causing duplicate history entries and conflicts
    console.log('✅ [MOUNT] Popstate handler is DISABLED - URL sync via useEffect only');
    // window.addEventListener('popstate', handlePopState);
    
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
      // window.removeEventListener('popstate', handlePopState);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = async () => {
      console.log('👤 Profile updated - reloading user from localStorage');
      const savedUser = await getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
        console.log('��� User reloaded:', savedUser.name, 'Avatar:', savedUser.avatar_url ? '✓' : '✗');
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
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

    const subscription = subscribeToConversations(() => {
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

  // Fetch and subscribe to helper availability status
  useEffect(() => {
    if (!user) {
      setHelperIsAvailable(false);
      return;
    }

    const fetchHelperStatus = async () => {
      try {
        const { getHelperStatus } = await import('./services/helper');
        const status = await getHelperStatus(user.id);
        setHelperIsAvailable(status?.isAvailable || false);
        console.log('📡 [App] Helper status:', status?.isAvailable ? 'Available' : 'Unavailable');
      } catch (error) {
        console.error('❌ [App] Failed to fetch helper status:', error);
      }
    };

    fetchHelperStatus();

    // Subscribe to profile changes for helper status
    const helperSubscription = supabase
      .channel('helper-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 [App] Helper status changed:', payload);
          const newStatus = payload.new as any;
          setHelperIsAvailable(newStatus.helper_available || false);
        }
      )
      .subscribe();

    return () => {
      helperSubscription.unsubscribe();
    };
  }, [user]);

  // Fetch listing from URL if selectedListing is null but we're on listing screen
  useEffect(() => {
    const fetchListingFromURL = async () => {
      const path = window.location.pathname;
      const match = path.match(/^\/listing\/(.+)$/);
      
      // Only fetch if:
      // 1. We're on a listing screen
      // 2. Either no listing is selected OR the selected listing ID doesn't match the URL
      // 3. Cities are loaded
      if (currentScreen === 'listing' && cities.length > 0 && match && match[1]) {
        const listingId = match[1];
        
        // ✅ Skip fetch if we already have this listing loaded
        if (selectedListing && selectedListing.id === listingId) {
          console.log('✅ [App] Listing already loaded, skipping fetch:', listingId);
          return;
        }
        
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
    };
    
    fetchListingFromURL();
  }, [currentScreen, selectedListing, cities]);

  const handleLogin = async (clientToken: string) => {
    console.log('🔐 [App] handleLogin called with clientToken:', clientToken ? clientToken.substring(0, 20) + '...' : 'NULL');
    
    try {
      // Login with client token
      const result = await loginWithClientToken(clientToken);
      
      if (result && result.user) {
        console.log('✅ [App] Login successful:', result.user.name);
        console.log('🔍🔍🔍 [App] About to call setUser with:', {
          id: result.user.id,
          name: result.user.name,
          phone: result.user.phone,
          clientToken: result.user.clientToken ? 'Present' : 'Missing'
        });
        
        setUser(result.user);
        
        console.log('🔍🔍🔍 [App] setUser called - user state should update on next render');
        
        // Check admin status
        const isAdminUser = await checkIsAdmin();
        setIsAdmin(isAdminUser);
        if (isAdminUser) console.log('👑 Admin user logged in');
        
        // ❌ REMOVED: Duplicate toast - PhoneAuthScreen already shows success message
        // simpleNotify.success(`Welcome back, ${result.user.name}! 🎉`);
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

  // ✅ CLEAN NAVIGATION - Simple one-way navigation (state → URL)
  const navigateToScreen = (screen: Screen, listingOrParams?: Listing | any, options?: { taskId?: string; wishId?: string; conversationId?: string; professionalSlug?: string; professionalsParams?: { categoryId?: string; categoryName?: string; roleId?: string; roleName?: string; city: string }; shopId?: string; slug?: string }) => {
    // Handle case where second param is actually params object (from professionals)
    let listing: Listing | undefined;
    let actualOptions = options;
    
    if (listingOrParams && !listingOrParams.id && (listingOrParams.roleId || listingOrParams.categoryId)) {
      // Second param is actually professionals params
      actualOptions = { ...actualOptions, professionalsParams: listingOrParams };
      listing = undefined;
    } else {
      listing = listingOrParams;
    }
    
    console.log(`📍 [State→URL] Navigate to "${screen}"`, actualOptions);
    
    // Redirect to login if trying to access profile/create/chat without being logged in
    if ((screen === 'profile' || screen === 'create' || screen === 'chat' || screen === 'create-wish' || screen === 'create-task' || screen === 'register-professional' || screen === 'register-professional-role') && !user) {
      setShowLoginModal(true);
      return;
    }

    // Special handling for contact - show modal instead of navigating
    if (screen === 'contact') {
      setShowContactModal(true);
      return;
    }

    // Handle screens with dynamic IDs
    if (screen === 'listing' && listing?.id) {
      // ✅ FIX: Set selectedListing IMMEDIATELY before navigation to prevent re-fetch
      setSelectedListing(listing);
      navigate(`/listing/${listing.id}`);
      return;
    }
    
    if (screen === 'edit' && listing?.id) {
      // ✅ FIX: Set selectedListing IMMEDIATELY before navigation
      setSelectedListing(listing);
      navigate(`/edit-listing/${listing.id}`);
      return;
    }
    
    if (screen === 'wish-detail') {
      const wishId = actualOptions?.wishId || selectedWishId;
      if (wishId) {
        navigate(`/wish-detail/${wishId}`);
        return;
      }
      // No ID? Go to wishes list
      navigate('/wishes');
      return;
    }
    
    if (screen === 'task-detail') {
      const taskId = actualOptions?.taskId || selectedTaskId;
      if (taskId) {
        navigate(`/task-detail/${taskId}`);
        return;
      }
      // No ID? Go to tasks list  
      navigate('/tasks');
      return;
    }
    
    if (screen === 'chat') {
      const convId = actualOptions?.conversationId || chatConversationId;
      if (convId) {
        setChatConversationId(convId);
      }
      navigate('/chat');
      return;
    }
    
    if (screen === 'professional-detail') {
      const slug = actualOptions?.professionalSlug || selectedProfessionalSlug;
      if (slug) {
        setSelectedProfessionalSlug(slug);
        navigate(`/professional/${slug}`);
        return;
      }
      navigate('/professionals');
      return;
    }
    
    if (screen === 'professionals-listing' || screen === 'professionals-listing-role') {
      if (actualOptions?.professionalsParams) {
        setSelectedProfessionalsParams(actualOptions.professionalsParams);
        const { roleId, categoryId, city } = actualOptions.professionalsParams;
        // Use roleId if available, otherwise fallback to categoryId for legacy support
        const identifier = roleId || categoryId;
        navigate(`/professionals/${identifier}/${city}`);
        return;
      }
      navigate('/professionals');
      return;
    }
    
    if (screen === 'register-professional' || screen === 'register-professional-role') {
      navigate('/register-professional');
      return;
    }
    
    if (screen === 'edit-professional') {
      const slug = actualOptions?.slug;
      if (slug) {
        setSelectedEditProfessionalSlug(slug);
        navigate(`/edit-professional/${slug}`);
        return;
      }
      navigate('/profile'); // No slug? Go to profile instead
      return;
    }
    
    // ✅ Handle shop-details navigation
    if (screen === 'shop-details') {
      const shopId = actualOptions?.shopId;
      const slug = actualOptions?.slug;
      console.log('🏪 [App] Navigating to shop-details with options:', { shopId, slug });
      if (shopId && slug) {
        // Save shop data to state so it persists across re-renders
        setSelectedShopData({ shopId, slug });
        navigate(`/shop/${slug}`);
        return;
      }
      console.warn('⚠️ [App] shop-details: Missing shopId or slug, redirecting to /shops');
      navigate('/shops');
      return;
    }
    
    // ✅ Handle edit-shop navigation
    if (screen === 'edit-shop') {
      const shopData = navigationData;
      if (shopData?.shopId) {
        navigate(`/edit-shop/${shopData.shopId}`);
        return;
      }
      navigate('/shops');
      return;
    }
    
    // ✅ Handle admin-edit-shop navigation
    if (screen === 'admin-edit-shop') {
      const shopData = actualOptions || navigationData;
      if (shopData?.shopId) {
        navigate(`/admin-edit-shop/${shopData.shopId}`);
        return;
      }
      console.warn('⚠️ [App] admin-edit-shop: Missing shopId, redirecting to /shops');
      navigate('/shops');
      return;
    }
    
    // ✅ Handle admin navigation with activeTab
    if (screen === 'admin') {
      const adminOptions = actualOptions || navigationData;
      if (adminOptions?.activeTab) {
        console.log('🔧 [App] Navigating to admin with activeTab:', adminOptions.activeTab);
        setNavigationData({ activeTab: adminOptions.activeTab });
      }
      navigate('/admin');
      return;
    }
    
    // Simple URL map for all other screens
    const routes: Record<Screen, string> = {
      'home': '/',
      'marketplace': '/marketplace',
      'create': '/create',
      'profile': '/profile',
      'chat': '/chat',
      'admin': '/admin',
      'admin-categories': '/admin/categories',
      'about': '/about',
      'how-it-works': '/how-it-works',
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
      'wish-detail': '/wishes',
      'tasks': '/tasks',
      'helper-tasks': '/helper-tasks',
      'create-task': '/create-task',
      'create-job': '/create-job',
      'task-detail': '/tasks',
      'helper-ready-mode': '/helper-ready-mode',
      'helper-preferences': '/helper-preferences',
      'prohibited': '/prohibited',
      'browse': '/browse',
      'faq': '/faq',
      'professionals': '/professionals',
      'professionals-listing': '/professionals',
      'professionals-listing-role': '/professionals',
      'professional-detail': '/professionals',
      'register-professional': '/register-professional',
      'register-professional-role': '/register-professional',
      'edit-professional': '/edit-professional',
      'shops': '/shops',
      'shops-category': '/shops',
      'shop-details': '/shops',
      'register-shop': '/register-shop',
      'edit-shop': '/shops',
      'admin-edit-shop': '/admin',
    };
    
    navigate(routes[screen] || '/');
    window.scrollTo(0, 0);
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
                  navigateToScreen('wish-detail', undefined, { wishId: data.wishId });
                } else if (data.taskId) {
                  console.log('🎯 App.tsx: Setting selectedTaskId to:', data.taskId);
                  navigateToScreen('task-detail', undefined, { taskId: data.taskId });
                } else if (screen === 'chat' && data.conversationId) {
                  navigateToScreen('chat', undefined, { conversationId: data.conversationId });
                  return;
                } else if (screen === 'create-task' && data.initialQuery) {
                  // Store navigation data for create-task screen
                  setNavigationData(data);
                  navigateToScreen('create-task');
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
            helperIsAvailable={helperIsAvailable}
            helperPreferences={helperPreferences}
            onHelperToggle={toggleHelperMode}
            onLoginRequired={() => setShowLoginModal(true)}
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
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
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
              // Don't show toast here - CreateListingScreen already shows it
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
                setSelectedListing(listing); // ✅ FIX: Set selected listing immediately
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
              // Handle wish detail navigation
              else if (screen === 'wish-detail' && data?.wishId) {
                console.log('[App.tsx] Navigating to wish detail:', data.wishId);
                navigateToScreen('wish-detail', undefined, { wishId: data.wishId });
              }
              // Handle task detail navigation
              else if (screen === 'task-detail' && data?.taskId) {
                console.log('[App.tsx] Navigating to task detail:', data.taskId);
                navigateToScreen('task-detail', undefined, { taskId: data.taskId });
              }
              // Handle edit professional navigation
              else if (screen === 'edit-professional' && data?.slug) {
                console.log('[App.tsx] Navigating to edit professional:', data.slug);
                navigateToScreen('edit-professional', undefined, { slug: data.slug });
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
              console.log('🔙 [App] ListingDetail back button - navigating to marketplace');
              navigateToScreen('marketplace');
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
          <CreateListingScreen
            listing={selectedListing}
            onBack={() => {
              setSelectedListing(null);
              navigateToScreen('profile');
            }}
            onSuccess={() => {
              setSelectedListing(null);
              navigateToScreen('profile');
            }}
            onNavigate={navigateToScreen}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user.name}
            unreadCount={unreadCount}
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
              // Navigate to home screen
              navigateToScreen('home');
            }}
            initialConversationId={chatConversationId} // Pass the conversation ID to open directly
            onNavigate={(screen, data) => {
              // Handle navigation with data (listing object, wishId, taskId, etc.)
              console.log('🔥 [App.tsx] ChatScreen onNavigate:', { screen, data });
              
              if (screen === 'wishDetail' && data?.wishId) {
                navigateToScreen('wish-detail', undefined, { wishId: data.wishId });
              } else if (screen === 'taskDetail' && data?.taskId) {
                navigateToScreen('task-detail', undefined, { taskId: data.taskId });
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
            onNavigate={(screen, data, options) => navigateToScreen(screen as Screen, data, options)}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user.name}
          />
        ) : null;

      case 'admin-categories':
        return user && isAdmin ? (
          <AdminCategoryManagementScreen
            onBack={() => navigateToScreen('admin')}
          />
        ) : null;

      case 'about':
        return (
          <AboutLocalFeloPage 
            onBack={() => navigateToScreen('home')} 
            onNavigate={navigateToScreen}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
          />
        );

      case 'how-it-works':
        return (
          <HowItWorksPage 
            onBack={() => navigateToScreen('home')} 
            onNavigate={navigateToScreen}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
          />
        );

      case 'terms':
        return <TermsPage onBack={() => navigateToScreen('home')} />;

      case 'privacy':
        return <PrivacyPage onBack={() => navigateToScreen('home')} />;

      case 'safety':
        return <SafetyPage onBack={() => navigateToScreen('home')} />;

      case 'prohibited':
        return <ProhibitedItemsPage onBack={() => navigateToScreen('home')} />;

      case 'faq':
        return (
          <FAQPage 
            onBack={() => navigateToScreen('home')} 
            onNavigate={navigateToScreen}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
          />
        );

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
                  navigateToScreen('task-detail', undefined, { taskId: params.taskId });
                } else if (params.wishId) {
                  navigateToScreen('wish-detail', undefined, { wishId: params.wishId });
                } else if (params.conversationId) {
                  navigateToScreen('chat', undefined, { conversationId: params.conversationId });
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
                  navigateToScreen('wish-detail', undefined, { wishId: data.wishId });
                } else if (data.taskId) {
                  navigateToScreen('task-detail', undefined, { taskId: data.taskId });
                } else if (screen === 'chat' && data.conversationId) {
                  navigateToScreen('chat', undefined, { conversationId: data.conversationId });
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
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
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
              // Don't show toast here - CreateWishScreen already shows it
            }}
            onNavigate={(screen, data) => {
              console.log('[App.tsx] CreateWishScreen onNavigate:', { screen, data });
              // Handle navigation with data
              if (data) {
                if (data.wishId) {
                  setEditWishData(null); // Clear edit data after successful update
                  navigateToScreen('wish-detail', undefined, { wishId: data.wishId });
                } else if (data.taskId) {
                  navigateToScreen('task-detail', undefined, { taskId: data.taskId });
                } else if (screen === 'chat' && data.conversationId) {
                  navigateToScreen('chat', undefined, { conversationId: data.conversationId });
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
              console.log('🔙 [App] WishDetail back button - navigating to wishes');
              navigateToScreen('wishes');
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
          <CleanTasksScreen
            user={user}
            onNavigate={(screen: string, data?: any) => {
              // Handle navigation with data
              if (data) {
                if (data.taskId) {
                  navigateToScreen('task-detail', undefined, { taskId: data.taskId });
                }
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            onMenuClick={() => setShowMobileMenu(true)}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
            onLoginRequired={() => setShowLoginModal(true)}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
            showCategorySelectionOnMount={false}
            helperPreferences={helperPreferences}
            onHelperPreferencesUpdate={updateHelperPreferences}
          />
        );

      case 'create-task':
        return user ? (
          <CreateSmartTaskScreen
            onBack={() => {
              setEditTaskData(null); // Clear edit data
              navigateToScreen('home');
            }}
            onSuccess={() => {
              setJustCreatedContent(true); // Prevent location modal
              setTimeout(() => setJustCreatedContent(false), 5000); // Reset after 5 seconds
              const isEditMode = !!editTaskData;
              setEditTaskData(null); // Clear edit data
              navigateToScreen('home');
              
              if (isEditMode) {
                // Just show toast for updates
                simpleNotify.success('Task updated successfully! 🎉');
              } else {
                // Show delightful modal for new tasks
                setShowTaskSuccessModal(true);
              }
            }}
            userId={user.id}
            userDisplayName={user.name}
            globalLocation={globalLocation}
            initialQuery={navigationData?.initialQuery}
            onLocationClick={() => {
              // Open location picker modal
              setShowLocationSetupModal(true);
            }}
            editMode={!!editTaskData}
            taskId={editTaskData?.id}
            task={editTaskData}
          />
        ) : null;

      case 'create-job':
        return user ? (
          <CreateJobScreen
            onBack={() => {
              navigateToScreen('home');
            }}
            onSuccess={() => {
              setJustCreatedContent(true); // Prevent location modal
              setTimeout(() => setJustCreatedContent(false), 5000); // Reset after 5 seconds
              navigateToScreen('home');
              // Don't show toast here - CreateJobScreen already shows it
            }}
            userDisplayName={user.name}
            globalLocation={globalLocation}
          />
        ) : null;



      case 'helper-preferences':
        // Redirect to tasks screen with category selection modal
        return (
          <CleanTasksScreen
            user={user}
            onNavigate={(screen: string, data?: any) => {
              if (data?.taskId) {
                navigateToScreen('task-detail', undefined, { taskId: data.taskId });
              } else {
                navigateToScreen(screen as Screen);
              }
            }}
            isLoggedIn={!!user}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            onMenuClick={() => setShowMobileMenu(true)}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
            onLoginRequired={() => setShowLoginModal(true)}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
            showCategorySelectionOnMount={true}
            helperPreferences={helperPreferences}
            onHelperPreferencesUpdate={updateHelperPreferences}
          />
        );

      case 'task-detail':
        return selectedTaskId ? (
          <TaskDetailScreen
            taskId={selectedTaskId}
            onBack={() => {
              console.log('🔙 [App] TaskDetail back button - navigating to tasks');
              navigateToScreen('tasks');
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

      case 'helper-tasks':
        return user ? (
          <NewTasksScreen
            userId={user.id}
            userCoordinates={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
            onBack={() => navigateToScreen('home')}
            onTaskClick={(taskId) => {
              navigateToScreen('task-detail', undefined, { taskId });
            }}
            onHelperModeToggle={() => {
              navigateToScreen('helper-preferences');
            }}
          />
        ) : null;

      case 'helper-ready-mode':
        return user ? (
          <HelperReadyModeScreen
            onBack={() => navigateToScreen('home')}
            onTaskClick={(task) => {
              navigateToScreen('task-detail', undefined, { taskId: task.id });
            }}
            onNavigate={(screen) => navigateToScreen(screen as Screen)}
            userId={user.id}
            userLocation={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
            onHelperStatusChange={(isAvailable) => setHelperIsAvailable(isAvailable)}
          />
        ) : null;

      case 'browse':
        // Public browsing for all users (logged in or not)
        return (
          <PublicBrowseScreen
            userLocation={globalLocation?.latitude && globalLocation?.longitude ? { latitude: globalLocation.latitude, longitude: globalLocation.longitude } : null}
            onTaskClick={(task) => {
              if (!user) {
                setShowLoginModal(true);
                return;
              }
              navigateToScreen('task-detail', undefined, { taskId: task.id });
            }}
            onWishClick={(wish) => {
              if (!user) {
                setShowLoginModal(true);
                return;
              }
              navigateToScreen('wish-detail', undefined, { wishId: wish.id });
            }}
            onListingClick={(listing) => {
              if (!user) {
                setShowLoginModal(true);
                return;
              }
              setSelectedListingId(listing.id);
              navigateToScreen('listing');
            }}
            onNavigate={(screen, params) => navigateToScreen(screen as Screen)}
          />
        );

      case 'professionals':
        return (
          <ProfessionalsRoleScreen
            onNavigate={navigateToScreen}
            userCity={globalLocation?.city}
            onBack={() => navigateToScreen('home')}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
            showGlobalLocation={true}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
          />
        );

      case 'professionals-listing':
      case 'professionals-listing-role':
        return selectedProfessionalsParams ? (
          <ProfessionalsListingRoleScreen
            roleId={selectedProfessionalsParams.roleId || selectedProfessionalsParams.categoryId}
            roleName={selectedProfessionalsParams.roleName || selectedProfessionalsParams.categoryName}
            city={selectedProfessionalsParams.city}
            userLat={globalLocation?.latitude}
            userLng={globalLocation?.longitude}
            onNavigate={navigateToScreen}
            onBack={() => navigateToScreen('professionals')}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
            showGlobalLocation={!!globalLocation}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onShowAuthModal={() => setShowAuthModal(true)}
          />
        ) : null;

      case 'professional-detail':
        return selectedProfessionalSlug ? (
          <ProfessionalDetailScreen
            slug={selectedProfessionalSlug}
            onBack={() => window.history.back()}
            onNavigate={navigateToScreen}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            userDisplayName={user?.name}
            unreadCount={unreadCount}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => setShowNotificationPanel(true)}
            onLocationClick={() => setShowLocationSetupModal(true)}
            onMenuClick={() => setShowMobileMenu(true)}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
            showGlobalLocation={!!globalLocation}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onShowAuthModal={() => setShowAuthModal(true)}
          />
        ) : null;

      case 'register-professional':
      case 'register-professional-role':
        return (
          <RegisterProfessionalRoleScreen
            onBack={() => navigateToScreen('professionals')}
            onSuccess={() => navigateToScreen('professionals')}
            globalCity={globalLocation?.city}
            globalArea={globalLocation?.area}
            globalSubArea={globalLocation?.subArea}
            globalLat={globalLocation?.latitude}
            globalLng={globalLocation?.longitude}
          />
        );

      case 'edit-professional':
        return (
          <EditProfessionalRoleScreen
            onBack={() => navigateToScreen('profile')}
            onSuccess={() => {
              navigateToScreen('profile');
            }}
            professionalSlug={selectedEditProfessionalSlug || undefined}
            globalCity={globalLocation?.city}
            globalArea={globalLocation?.area}
            globalSubArea={globalLocation?.subArea}
            globalLat={globalLocation?.latitude}
            globalLng={globalLocation?.longitude}
          />
        );

      case 'shops':
        return (
          <ShopsScreen
            user={user}
            onNavigate={(screen: any, data?: any) => {
              console.log('🏪 [App] ShopsScreen onNavigate called:', { screen, data });
              if (screen === 'login') {
                setShowLoginModal(true);
                return;
              }
              if (data) {
                console.log('🏪 [App] Setting navigationData:', data);
                setNavigationData(data);
              }
              console.log('🏪 [App] Calling navigateToScreen with data:', data);
              // Pass shop data through options parameter
              navigateToScreen(screen, undefined, data);
            }}
            unreadCount={unreadCount}
            notificationCount={notificationUnreadCount}
            onNotificationClick={() => {
              setShowNotificationPanel(!showNotificationPanel);
            }}
            globalLocationArea={globalLocation?.area}
            globalLocationCity={globalLocation?.city}
            onLocationClick={() => setShowLocationSetupModal(true)}
            userDisplayName={user?.name || user?.email || ''}
            onGlobalSearchClick={() => setShowGlobalSearchModal(true)}
          />
        );

      case 'shops-category':
        const categorySlug = window.location.pathname.replace('/shops/', '');
        return (
          <ShopsCategoryScreen
            categoryId={categorySlug}
            onNavigate={(screen: any, data?: any) => {
              if (screen === 'login') {
                setShowLoginModal(true);
                return;
              }
              if (data) {
                setNavigationData(data);
              }
              navigateToScreen(screen);
            }}
          />
        );

      case 'shop-details':
        // Get shopId from selectedShopData (persisted state) or navigationData (fresh navigation)
        const detailShopId = selectedShopData?.shopId || navigationData?.shopId || '';
        const detailShopSlug = selectedShopData?.slug || navigationData?.slug || '';
        console.log('🏪 [App] Rendering shop-details with shopId:', detailShopId, 'slug:', detailShopSlug);
        console.log('   selectedShopData:', selectedShopData);
        console.log('   navigationData:', navigationData);
        
        if (!detailShopId) {
          console.error('❌ [App] No shopId available for shop-details, redirecting to /shops');
          setTimeout(() => navigateToScreen('shops'), 0);
          return <LoadingSpinner />;
        }
        
        return (
          <ShopDetailsScreen
            shopId={detailShopId}
            slug={detailShopSlug}
            onNavigate={(screen: any, data?: any) => {
              if (screen === 'login') {
                setShowLoginModal(true);
                return;
              }
              if (data) {
                setNavigationData(data);
              }
              navigateToScreen(screen);
            }}
          />
        );

      case 'register-shop':
        return (
          <RegisterShopScreen
            onNavigate={(screen: any, data?: any) => {
              if (screen === 'login') {
                setShowLoginModal(true);
                return;
              }
              if (data) {
                setNavigationData(data);
              }
              navigateToScreen(screen);
            }}
            globalLat={globalLocation?.latitude}
            globalLng={globalLocation?.longitude}
            globalCity={globalLocation?.city}
            globalArea={globalLocation?.area}
          />
        );

      case 'edit-shop':
        const editShopId = window.location.pathname.split('/edit-shop/')[1] || navigationData?.shopId;
        return (
          <EditShopScreen
            shopId={editShopId}
            globalLat={globalLocation?.latitude}
            globalLng={globalLocation?.longitude}
            globalCity={selectedCity}
            globalArea={selectedArea}
            onNavigate={(screen: any, data?: any) => {
              if (screen === 'login') {
                setShowLoginModal(true);
                return;
              }
              if (data) {
                setNavigationData(data);
              }
              navigateToScreen(screen);
            }}
          />
        );

      case 'admin-edit-shop':
        const adminEditShopId = window.location.pathname.split('/admin-edit-shop/')[1] || navigationData?.shopId;
        console.log('🏪 [App] admin-edit-shop shopId:', adminEditShopId, 'from URL:', window.location.pathname);
        
        // Validate shopId - if invalid, redirect to admin shops tab
        if (!adminEditShopId || adminEditShopId === 'undefined') {
          console.error('❌ [App] admin-edit-shop: Invalid shopId, redirecting to admin');
          // Use useEffect-safe redirect
          setTimeout(() => {
            navigateToScreen('admin', undefined, { activeTab: 'shops' });
          }, 0);
          return null;
        }
        
        return (
          <AdminEditShopScreen
            shopId={adminEditShopId}
            globalLat={globalLocation?.latitude}
            globalLng={globalLocation?.longitude}
            globalCity={globalLocation?.city}
            globalArea={globalLocation?.area}
            onNavigate={(screen: any, data?: any, options?: any) => {
              if (screen === 'login') {
                setShowLoginModal(true);
                return;
              }
              if (data) {
                setNavigationData(data);
              }
              navigateToScreen(screen, data, options);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Helper Mode Badge - Shows at very top when helper is available, except on tasks screen */}
      {helperIsAvailable && currentScreen !== 'helper-tasks' && currentScreen !== 'helper-ready-mode' && currentScreen !== 'tasks' && (
        <div style={{ paddingTop: '36px' }}>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60 }}>
            <HelperModeBadge
              onViewTasks={() => navigateToScreen('tasks')}
              isMobile={window.innerWidth < 768}
            />
          </div>
        </div>
      )}

      {/* Render app content - allow guest users to browse */}
      {renderScreen()}

      {/* Bottom Navigation for primary tabs */}
      {(() => {
        const showFooter = ['home', 'marketplace', 'wishes', 'tasks', 'helper-tasks', 'chat', 'profile', 'create-wish', 'create-task', 'task-detail', 'wish-detail', 'listing'].includes(currentScreen);
        if (!showFooter) return null;
        
        // Map detail screens to their parent tabs
        let activeTab: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'profile';
        if (currentScreen === 'task-detail' || currentScreen === 'helper-tasks') {
          activeTab = 'tasks';
        } else if (currentScreen === 'wish-detail' || currentScreen === 'create-wish') {
          activeTab = 'wishes';
        } else if (currentScreen === 'listing') {
          activeTab = 'marketplace';
        } else if (currentScreen === 'create-task') {
          activeTab = 'tasks';
        } else if (currentScreen === 'professionals' || currentScreen === 'professionals-listing' || currentScreen === 'professional-detail' || currentScreen === 'register-professional') {
          activeTab = 'professionals';
        } else if (currentScreen === 'home' || currentScreen === 'marketplace' || currentScreen === 'wishes' || currentScreen === 'tasks' || currentScreen === 'chat' || currentScreen === 'profile') {
          activeTab = currentScreen;
        } else {
          activeTab = 'home'; // Default fallback
        }
        
        return (
          <AnimatedBottomNav
            currentScreen={activeTab}
            onNavigate={(screen) => {
              if (screen === 'chat' && !user) {
                setShowLoginModal(true);
                return;
              }
              navigateToScreen(screen);
            }}
            chatUnreadCount={unreadCount}
          />
        );
      })()}

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

      {/* Task Created Success Modal */}
      <TaskCreatedSuccessModal
        isOpen={showTaskSuccessModal}
        onClose={() => setShowTaskSuccessModal(false)}
        onViewChat={() => {
          setShowTaskSuccessModal(false);
          navigateToScreen('chat');
        }}
      />

      {/* Auth Modal - Show when login required */}
      {showLoginModal && (
        <PhoneAuthScreen
          onSuccess={async (user) => {
            console.log('🎉 [App] PhoneAuthScreen onSuccess called with user:', user);
            console.log('   User ID:', user?.id);
            console.log('   User name:', user?.name);
            console.log('   Client token:', user?.clientToken ? 'Present' : 'Missing');
            
            // User data is already stored in localStorage by PhoneAuthScreen
            // ✅ CRITICAL FIX: Wait for handleLogin to complete so user state is updated
            await handleLogin(user.clientToken);
            console.log('✅ [App] handleLogin complete, user state should be updated');
            
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
            
            // ✅ FIX: Extract detailed area from address (street/sub-area level, not just neighborhood)
            // Priority: First 2 address parts (street + sub-area) > locality > city
            let areaName = '';
            
            if (location.address) {
              const parts = location.address.split(',').map(s => s.trim()).filter(Boolean);
              // Take first 2 parts for specific location (e.g., "6th Cross, BTM 2nd Stage")
              if (parts.length >= 2) {
                areaName = `${parts[0]}, ${parts[1]}`;
                console.log('✅ Using detailed address parts as area:', areaName);
              } else if (parts.length >= 1) {
                areaName = parts[0];
                console.log('✅ Using first address part as area:', areaName);
              }
            }
            
            // Fallback to locality only if address parsing failed
            if (!areaName && location.locality) {
              areaName = location.locality;
              console.log('��� Using locality as fallback:', areaName);
            }
            
            if (!areaName) {
              areaName = location.city;
              console.log('✅ Using city as final fallback:', areaName);
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
            
            // ✅ FIX: If area equals city, use locality or first distinct part of address as area
            if (areaName && cityName && areaName.toLowerCase() === cityName.toLowerCase()) {
              console.log('⚠️ Area equals City, finding distinct area name...');
              
              // Try locality first
              if (location.locality && location.locality !== cityName) {
                areaName = location.locality;
                console.log('✅ Using locality as area:', areaName);
              } else if (location.address) {
                // Extract first distinct part from address as area
                const parts = location.address.split(',').map(s => s.trim()).filter(Boolean);
                for (const part of parts) {
                  const partLower = part.toLowerCase();
                  const cityLower = cityName.toLowerCase();
                  const stateLower = location.state?.toLowerCase() || '';
                  
                  if (partLower !== cityLower && 
                      partLower !== stateLower && 
                      partLower !== 'india' &&
                      part.length > 0) {
                    areaName = part;
                    console.log('✅ Using address part as area:', areaName);
                    break;
                  }
                }
              }
            }
            
            console.log('📍 Final location data:', {
              city: cityName,
              area: areaName,
              latitude: location.latitude,
              longitude: location.longitude
            });
            
            const locationData = {
              cityId: selectedCity?.id || null,
              city: cityName || location.locality || areaName, // Fallback chain
              areaId: null, // ✅ FIX: Always NULL for Google Maps locations (not from database dropdown)
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
            
            console.log('📍 [App] About to update global location with:', locationData);
            console.log('📍 [App] ✅ CRITICAL DEBUG - AREA VALUE:', {
              area: locationData.area,
              areaLength: locationData.area?.length,
              city: locationData.city,
              address: locationData.address,
              locality: locationData.locality
            });
            console.log('📍 [App] ✅ CRITICAL DEBUG - IDs (should be NULL for Google Maps):', {
              cityId: locationData.cityId,
              areaId: locationData.areaId,
              subAreaId: locationData.subAreaId
            });
            await updateGlobalLocation(locationData);
            console.log('✅ [App] Global location updated successfully!');
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
                navigateToScreen('task-detail', undefined, { taskId: notification.related_id });
              } else if (notification.related_type === 'wish' && notification.related_id) {
                navigateToScreen('wish-detail', undefined, { wishId: notification.related_id });
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

      {/* Offline/Online Internet Connection Ribbon */}
      <OfflineRibbon 
        onRefresh={() => {
          console.log('🔄 Refreshing app after reconnection...');
          window.location.reload();
        }}
      />

      {/* Sonner Toaster - For toast.success/error/info calls */}
      <Toaster 
        position={window.innerWidth < 768 ? 'top-center' : 'top-right'}
        expand={true}
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
              navigateToScreen('wish-detail', undefined, { wishId: data.wishId });
            } else if (screen === 'task-detail' && data.taskId) {
              navigateToScreen('task-detail', undefined, { taskId: data.taskId });
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
        onOpenModal={() => setShowActiveTasksModal(true)}
      />

      {/* Active Tasks Modal */}
      {user && (
        <ActiveTasksModal
          isOpen={showActiveTasksModal}
          onClose={() => setShowActiveTasksModal(false)}
          userId={user.id}
          onTaskClick={(taskId) => {
            navigateToScreen('task-detail', undefined, { taskId });
          }}
        />
      )}

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

      {/* Update Notification - Auto-checks for new versions */}
      <UpdateNotification />

    </div>
  );
}

// Wrapper component that provides Router context
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
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