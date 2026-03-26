import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { AnimatedButton } from '../components/AnimatedButton';
import { HorizontalScroll } from '../components/HorizontalScroll';
import { WishCard } from '../components/WishCard';
import { TaskCard } from '../components/TaskCard';
import { ListingCard } from '../components/ListingCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { TypingAnimation } from '../components/TypingAnimation';
import { AppFooter } from '../components/AppFooter';
import { HelperAvailabilitySlider } from '../components/HelperAvailabilitySlider';
import { HelperModeBadge } from '../components/HelperModeBadge';
import { HelperAvailabilityConfirmDialog } from '../components/HelperAvailabilityConfirmDialog';
import { SmartJobInput } from '../components/SmartJobInput';
import { QuickJobButtons } from '../components/QuickJobButtons';
import { SmartTaskInputModal } from '../components/SmartTaskInputModal';
import { Heart, Briefcase, MapPin, TrendingUp, ArrowRight, Plus, Search, Lightbulb, IndianRupee, ChevronLeft, ChevronRight, Tag, Edit2, ToggleLeft, ToggleRight, Store, Users, ShoppingBag } from 'lucide-react';
import { Wish, Task, Listing } from '../types';
import { getWishes } from '../services/wishes';
import { getTasks } from '../services/tasks';
import { getListings } from '../services/listings.js';
import { getCurrentUser } from '../services/auth';
import { getCitiesWithAreas } from '../services/locations';
import { categorizeTask, getCategoryEmoji, getAllTaskCategories } from '../services/taskCategories';
import { toast } from 'sonner';
import { getTodayCompletionCount, toggleHelperAvailability, getHelperStatus } from '../services/helper';
import { JobSuggestion } from '../services/jobSuggestions';
import { supabase } from '../lib/supabaseClient';

interface NewHomeScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  notificationCount?: number;
  userLocation?: { latitude: number; longitude: number; area?: string; city?: string } | null;
  onNotificationClick?: () => void;
  onLocationClick?: () => void;
  onMenuClick?: () => void;
  onGlobalSearchClick?: () => void;
  onContactClick?: () => void;
  socialLinks?: { instagram?: string; facebook?: string; linkedin?: string };
  helperIsAvailable?: boolean;
  helperPreferences?: {
    selected_categories: string[];
    selected_sub_skills: string[];
    max_distance: number;
    is_available: boolean;
  } | null;
  onHelperToggle?: () => void;
  onLoginRequired?: () => void;
}

export function NewHomeScreen({
  onNavigate,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount = 0,
  notificationCount = 0,
  userLocation,
  onNotificationClick,
  onLocationClick,
  onMenuClick,
  onGlobalSearchClick,
  onContactClick,
  socialLinks,
  helperIsAvailable = false,
  helperPreferences,
  onHelperToggle,
  onLoginRequired,
}: NewHomeScreenProps) {
  const [nearbyWishes, setNearbyWishes] = useState<Wish[]>([]);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [nearbyDeals, setNearbyDeals] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperStatus, setHelperStatus] = useState<'available' | 'unavailable'>('unavailable');
  const [todayCompletionCount, setTodayCompletionCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showHelperOffDialog, setShowHelperOffDialog] = useState(false);
  const [showTaskInputModal, setShowTaskInputModal] = useState(false);
  const tasksScrollRef = React.useRef<HTMLDivElement>(null);
  
  // Fetch current user when login state changes
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      console.log('[NewHomeScreen] Current user updated:', { userId: user?.id, isLoggedIn });
    };
    
    fetchUser();
  }, [isLoggedIn]);

  useEffect(() => {
    loadNearbyContent();
  }, [userLocation]);

  // Fetch helper status and completion count when user logs in
  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      console.log('[NewHomeScreen] User logged in, fetching helper status');
      fetchHelperStatus();
      fetchTodayCompletionCount();
    }
  }, [isLoggedIn, currentUser?.id]);

  // Detect mobile/desktop on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadNearbyContent = async () => {
    setLoading(true);
    try {
      console.log('[NewHomeScreen] Loading nearby content with user location:', {
        lat: userLocation?.latitude,
        lon: userLocation?.longitude,
        city: userLocation?.city,
        area: userLocation?.area,
        note: 'Filtering by city if location set, otherwise showing all content'
      });

      // Get cities data once
      const cities = await getCitiesWithAreas();

      // Load wishes - filter by city if user has location
      const wishesFilters: any = {
        status: 'open',
      };
      // Don't filter by city - show all wishes from everywhere
      // Just pass coordinates for distance calculation and sorting (nearest first)
      
      // Pass user coordinates for distance calculation and sorting
      if (userLocation) {
        wishesFilters.userLat = userLocation.latitude;
        wishesFilters.userLon = userLocation.longitude;
        console.log('[NewHomeScreen] 📍 Passing user coordinates to wishes:', { lat: userLocation.latitude, lon: userLocation.longitude });
      } else {
        console.log('[NewHomeScreen] ⚠️ No user location available for distance calculation');
      }
      
      const wishesData = await getWishes(wishesFilters);
      console.log('[NewHomeScreen] Loaded wishes from ALL cities (sorted by distance):', wishesData.wishes?.length || 0);
      setNearbyWishes(wishesData.wishes?.slice(0, 10) || []); // Limit to 10

      // Load tasks - filter by city if user has location
      const tasksFilters: any = {
        // ✅ REMOVED: status filter - getTasks() now handles this automatically
        // It shows: NULL, open, negotiating, accepted, in_progress
        // Hides: completed, closed
      };
      
      // Don't filter by city - show all tasks from everywhere
      // Just pass coordinates for distance calculation and sorting (nearest first)
      
      if (userLocation) {
        tasksFilters.userLat = userLocation.latitude;
        tasksFilters.userLon = userLocation.longitude;
      }
      
      const tasksData = await getTasks(tasksFilters);
      console.log('[NewHomeScreen] Loaded tasks from ALL cities (sorted by distance):', tasksData.tasks?.length || 0);
      setNearbyTasks(tasksData.tasks?.slice(0, 10) || []); // Limit to 10

      // Load marketplace listings
      const listingsFilters: any = {
        limit: 10,
      };
      
      // Don't filter by city - show all listings
      // Just pass coordinates for distance calculation and sorting (nearest first)
      
      // Pass user coordinates for distance calculation and sorting
      if (userLocation) {
        listingsFilters.userLat = userLocation.latitude;
        listingsFilters.userLon = userLocation.longitude;
      }
      
      const dealsResponse = await getListings(listingsFilters);
      console.log('[NewHomeScreen] Loaded deals:', dealsResponse.data?.length);
      setNearbyDeals(dealsResponse.data || []);
    } catch (error) {
      // Silent graceful failure - already setting empty arrays
    } finally {
      setLoading(false);
    }
  };

  const fetchHelperStatus = async () => {
    if (!currentUser?.id) return;
    try {
      const status = await getHelperStatus(currentUser.id);
      if (status) {
        setHelperStatus(status.isAvailable ? 'available' : 'unavailable');
      }
    } catch (error) {
      console.error('Error fetching helper status:', error);
    }
  };

  const fetchTodayCompletionCount = async () => {
    try {
      // Use user location if available, otherwise use default coordinates
      const lat = userLocation?.latitude || 0;
      const lon = userLocation?.longitude || 0;
      
      const count = await getTodayCompletionCount(lat, lon);
      setTodayCompletionCount(count);
    } catch (error) {
      console.error('Error fetching today\'s completion count:', error);
      // Set a default count even if there's an error
      setTodayCompletionCount(8);
    }
  };

  const handleHelperToggle = async () => {
    if (!currentUser) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        toast.error('Please log in to enable helper mode');
      }
      return;
    }

    // If helper mode is OFF, navigate to tasks screen to select categories
    // If helper mode is ON, ask for confirmation before turning it OFF
    if (!helperIsAvailable) {
      console.log('[NewHomeScreen] Helper mode OFF - navigating to tasks screen to activate');
      onNavigate('helper-preferences');
    } else {
      // Ask for confirmation before turning off helper mode
      setShowHelperOffDialog(true);
    }
  };

  const confirmHelperOff = async () => {
    console.log('[NewHomeScreen] Helper mode ON - user confirmed, turning it OFF');
    if (onHelperToggle) {
      onHelperToggle();
      // Don't show toast here - onHelperToggle already shows it in App.tsx
    }
    setShowHelperOffDialog(false);
  };

  const cancelHelperOff = () => {
    console.log('[NewHomeScreen] Helper mode OFF cancelled by user');
    setShowHelperOffDialog(false);
  };

  // Handle task search suggestion selection
  const handleJobSuggestionSelect = (suggestion: JobSuggestion) => {
    if (!isLoggedIn) {
      toast.error('Please log in to post a task');
      onNavigate('login');
      return;
    }
    // Navigate to create task screen with pre-filled query
    onNavigate('create-task', { initialQuery: suggestion.title });
  };

  // Handle quick task selection
  const handleQuickJobSelect = (job: JobSuggestion) => {
    if (!isLoggedIn) {
      toast.error('Please log in to post a task');
      onNavigate('login');
      return;
    }
    // Navigate to create task screen with pre-filled query
    onNavigate('create-task', { initialQuery: job.title });
  };

  // Scroll handler for tasks
  const scrollTasks = (direction: 'left' | 'right') => {
    if (tasksScrollRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = direction === 'left' 
        ? tasksScrollRef.current.scrollLeft - scrollAmount
        : tasksScrollRef.current.scrollLeft + scrollAmount;
      
      tasksScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // ✅ SIMPLE: No auto-detection, just manual category selection
  const handleJobSearchChange = (value: string) => {
    setJobSearchQuery(value);
    // No auto-detection - user will select category manually
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header
        title="LocalFelo"
        currentScreen="home"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onLocationClick={onLocationClick}
        onMenuClick={onMenuClick}
        onGlobalSearchClick={onGlobalSearchClick}
        showGlobalLocation={true}
        globalLocationArea={userLocation?.area}
        globalLocationCity={userLocation?.city}
      />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-3 md:py-5">
        {/* HERO SECTION - Task Creation */}
        <div className="md:bg-gradient-to-br md:from-white md:via-[#CDFF00]/5 md:to-white md:rounded-2xl md:border-2 md:border-gray-200 md:p-0 mb-4 md:mb-5 md:shadow-lg md:hover:shadow-2xl md:transition-all md:duration-500 md:overflow-hidden md:relative">
          <div className="max-w-3xl mx-auto md:mx-0 md:max-w-none">
            <div className="md:flex md:items-stretch">
              {/* Left Content - 70% width on desktop */}
              <div className="md:w-[70%] md:p-6 md:pr-8">
                {/* Animated Header */}
                <div className="text-center md:text-left mb-2 md:mb-3">
                  <div className="inline-block mb-1 md:mb-2">
                    <h1 className="text-2xl md:text-4xl font-black text-black">
                      What help do you need?
                    </h1>
                  </div>
                </div>
                
                {/* Typing Animation Examples - Above Input */}
                <div className="mb-3 md:mb-3 flex items-center justify-center md:justify-start gap-2 text-sm md:text-base min-h-[28px]">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                    <TypingAnimation
                      phrases={[
                        'Need help with luggage from bus stop',
                        'Bring food from home to office',
                        'Clean my house this weekend',
                        'Looking for pest control',
                        'Need a plumber to fix leaking tap',
                        'Looking for Java developer for a project',
                        'Need someone to walk my dog',
                        'Pick up groceries from market',
                        'Need AC repair urgently',
                        'Looking for a carpenter',
                        'Deliver documents to office',
                        'Need bike repair',
                        'Looking for tutor for mathematics',
                        'Need beautician at home',
                        'Help me move furniture',
                      ]}
                      typingSpeed={40}
                      deletingSpeed={25}
                      pauseDuration={1500}
                      className="text-gray-500 italic"
                    />
                  </div>
                </div>

                {/* Stunning Animated Textarea */}
                <div className="relative group">
                  {/* Animated gradient glow border wrapper */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#CDFF00] via-blue-500 to-[#CDFF00] rounded-xl opacity-0 group-hover:opacity-60 group-focus-within:opacity-75 blur-lg transition-all duration-500 animate-gradient-x"></div>
                  
                  {/* Inner animated border */}
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-[#CDFF00]/30 via-blue-400/30 to-[#CDFF00]/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                  
                  {/* Animated "Type here" indicator - shows when empty */}
                  {!jobSearchQuery && (
                    <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 opacity-0 group-hover:opacity-40 group-focus-within:opacity-40 transition-opacity duration-300 z-10">
                      <div className="w-0.5 h-5 bg-gradient-to-b from-[#CDFF00] to-blue-500 animate-pulse"></div>
                      <span className="text-gray-400 text-sm font-medium animate-pulse">Start typing...</span>
                    </div>
                  )}
                  
                  {/* Textarea with enhanced styling */}
                  <textarea
                    value={jobSearchQuery}
                    onChange={(e) => handleJobSearchChange(e.target.value)}
                    onFocus={() => {
                      if (!isLoggedIn) {
                        onNavigate('login');
                      }
                    }}
                    placeholder="Describe your task in detail... Be specific about what you need"
                    className="relative w-full p-4 md:p-4 pb-16 md:pb-16 bg-white text-black placeholder-gray-400 group-hover:placeholder-transparent group-focus-within:placeholder-transparent text-base md:text-base resize-none leading-relaxed min-h-[180px] md:min-h-[100px] border-2 border-gray-300 rounded-xl focus:border-[#CDFF00] focus:outline-none focus:shadow-[0_0_30px_rgba(205,255,0,0.3)] transition-all duration-300 backdrop-blur-sm"
                    rows={4}
                    maxLength={500}
                  />

                  {/* Character count and Continue button - INSIDE textarea at bottom */}
                  <div className="absolute bottom-5 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                      {jobSearchQuery.length}/500
                    </span>
                    
                    {/* Continue button with enhanced styling */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isLoggedIn) {
                          onNavigate('login');
                        } else {
                          onNavigate('create-task', { 
                            initialQuery: jobSearchQuery,
                          });
                        }
                      }}
                      disabled={jobSearchQuery.trim().length < 10}
                      className={jobSearchQuery.trim().length >= 10 
                        ? 'px-6 md:px-6 py-3 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all flex items-center gap-2 bg-gradient-to-r from-[#CDFF00] to-[#b8e600] text-black hover:shadow-[0_0_20px_rgba(205,255,0,0.6)] shadow-md hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700'
                        : 'px-6 md:px-6 py-3 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all flex items-center gap-2 bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      }
                      title={jobSearchQuery.trim().length < 10 ? 'Please enter at least 10 characters' : 'Continue to next step'}
                    >
                      <span>Continue</span>
                      <svg className={jobSearchQuery.trim().length >= 10 ? 'w-4 h-4 md:w-5 md:h-5 transform transition-transform group-hover:translate-x-1' : 'w-4 h-4 md:w-5 md:h-5 transform transition-transform'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Image - Hidden on mobile, visible on web - 30% width */}
              <div className="hidden md:flex md:w-[30%] items-end justify-center pt-4 pr-4 pb-0">
                <img 
                  src="/helper-image.png"
                  alt="Helper services"
                  className="w-full h-auto object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* EARN BY HELPING SECTION */}
        <div className="bg-gradient-to-br from-[#CDFF00] to-[#b8e600] rounded-2xl p-5 md:p-7 mb-4 md:mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <IndianRupee className="w-5 h-5 md:w-7 md:h-7 text-black" />
                <h2 className="text-lg md:text-2xl font-black text-black">
                  Help others & earn money
                </h2>
              </div>
              <p className="text-sm md:text-base text-black/80 font-medium">
                Activate helper mode to see relevant tasks near you
              </p>
            </div>
            <button
              onClick={handleHelperToggle}
              className={`px-5 md:px-6 py-2.5 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                helperIsAvailable 
                  ? 'bg-red-100 text-black hover:bg-red-200' 
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {helperIsAvailable ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span>Turn off helper mode</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span>Activate helper mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* TASKS NEAR YOU SECTION */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-bold">Tasks near you</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('tasks')}
                className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="hidden md:flex items-center gap-1 ml-2">
                <button
                  onClick={() => scrollTasks('left')}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => scrollTasks('right')}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* TASKS SECTION - Primary Content (Horizontal Scroll) */}
          {loading ? (
            <div className="space-y-3">
              <SkeletonLoader count={3} />
            </div>
          ) : nearbyTasks.length > 0 ? (
            <div className="space-y-4">
              {/* First Row of Tasks */}
              <div
                ref={tasksScrollRef}
                className="flex overflow-x-auto scrollbar-hide pb-2 gap-4"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {nearbyTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex-shrink-0 w-72 sm:w-80"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onNavigate('task-detail', { taskId: task.id })}
                      currentUserId={currentUser?.id}
                      onChatClick={
                        isLoggedIn && currentUser?.id !== task.userId
                          ? async () => {
                              const { getOrCreateConversation } = await import('../services/chat');
                              const { conversation, error } = await getOrCreateConversation(
                                task.id,
                                task.title,
                                undefined,
                                task.price,
                                task.userId,
                                task.userName,
                                task.userAvatar,
                                'task' // ✅ NEW: Pass listing type
                              );
                              if (error) {
                                toast.error(error);
                                return;
                              }
                              if (conversation) {
                                onNavigate('chat', { conversationId: conversation.id });
                              }
                            }
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-300 mb-6">
              <Briefcase className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-body text-sm mb-4">No tasks available in your area yet</p>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    onNavigate('login');
                  } else {
                    onNavigate('create-task');
                  }
                }}
                className="bg-[#CDFF00] text-black px-6 py-2.5 rounded-md font-bold text-sm hover:bg-[#CDFF00]/90 transition-all"
              >
                Post a Task
              </button>
            </div>
          )}
        </div>

        {/* MODULE CARDS - Discover All Features */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Explore LocalFelo</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            
            {/* Tasks Module */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CDFF00] hover:shadow-md transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#CDFF00] rounded-xl mb-3">
                  <Briefcase className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-sm font-bold text-black mb-2">Tasks</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Get help or help others & earn money nearby</p>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-xs font-semibold text-black hover:text-gray-700 flex items-center gap-1"
                >
                  <span>Browse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Wishes Module */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CDFF00] hover:shadow-md transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#CDFF00] rounded-xl mb-3">
                  <Heart className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-sm font-bold text-black mb-2">Wishes</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Post what you need, sellers will reach you</p>
                <button
                  onClick={() => onNavigate('wishes')}
                  className="text-xs font-semibold text-black hover:text-gray-700 flex items-center gap-1"
                >
                  <span>Browse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Buy & Sell Module */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CDFF00] hover:shadow-md transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#CDFF00] rounded-xl mb-3">
                  <ShoppingBag className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-sm font-bold text-black mb-2">Buy & Sell</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Browse local deals & sell anything nearby</p>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="text-xs font-semibold text-black hover:text-gray-700 flex items-center gap-1"
                >
                  <span>Browse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Professionals Module */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CDFF00] hover:shadow-md transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#CDFF00] rounded-xl mb-3">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-sm font-bold text-black mb-2">Professionals</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Find verified professionals & services</p>
                <button
                  onClick={() => onNavigate('professionals')}
                  className="text-xs font-semibold text-black hover:text-gray-700 flex items-center gap-1"
                >
                  <span>Browse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Shops Module */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#CDFF00] hover:shadow-md transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#CDFF00] rounded-xl mb-3">
                  <Store className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-sm font-bold text-black mb-2">Shops</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Discover local shops & their products</p>
                <button
                  onClick={() => onNavigate('shops')}
                  className="text-xs font-semibold text-black hover:text-gray-700 flex items-center gap-1"
                >
                  <span>Browse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Empty State (only if no tasks) */}
        {!loading && nearbyTasks.length === 0 && nearbyWishes.length === 0 && nearbyDeals.length === 0 && (
          <div className="text-center py-12 mb-6">
            <TrendingUp className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No nearby content yet</h3>
            <p className="text-body mb-6">
              Be the first to post a task in your area!
            </p>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  onNavigate('login');
                } else {
                  onNavigate('create-task');
                }
              }}
              className="bg-[#CDFF00] text-black px-6 py-3 rounded-md font-bold hover:bg-[#CDFF00]/90 transition-all"
            >
              Post a Task
            </button>
          </div>
        )}
      </div>

      <AppFooter 
        onNavigate={onNavigate}
        onContactClick={onContactClick}
      />

      {/* Helper Mode OFF Confirmation Dialog */}
      {showHelperOffDialog && (
        <HelperAvailabilityConfirmDialog
          isOpen={showHelperOffDialog}
          isActivating={false}
          onConfirm={confirmHelperOff}
          onCancel={cancelHelperOff}
        />
      )}
    </div>
  );
}