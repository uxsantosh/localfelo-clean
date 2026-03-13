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
import { Heart, Briefcase, MapPin, TrendingUp, ArrowRight, Plus, Search, Lightbulb, IndianRupee, ChevronLeft, ChevronRight, Tag, Edit2 } from 'lucide-react';
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
        status: 'open',
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-5">
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
                  {/* Glowing border effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#CDFF00] via-yellow-300 to-[#CDFF00] rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 blur-sm transition-all duration-500"></div>
                  
                  {/* Main Input Container */}
                  <div className="relative bg-white rounded-2xl border-2 border-gray-300 group-hover:border-[#CDFF00] group-focus-within:border-[#CDFF00] transition-all duration-300 overflow-hidden shadow-sm">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#CDFF00]/0 via-[#CDFF00]/5 to-[#CDFF00]/0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Animated "Type here" indicator - shows when empty */}
                    {!jobSearchQuery && (
                      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 opacity-0 group-hover:opacity-40 group-focus-within:opacity-40 transition-opacity duration-300">
                        <div className="w-0.5 h-5 bg-black animate-pulse"></div>
                        <span className="text-gray-400 text-sm font-medium animate-pulse">Start typing...</span>
                      </div>
                    )}
                    
                    {/* Textarea */}
                    <textarea
                      value={jobSearchQuery}
                      onChange={(e) => handleJobSearchChange(e.target.value)}
                      onFocus={() => {
                        if (!isLoggedIn) {
                          onNavigate('login');
                        }
                      }}
                      placeholder="Describe your task in detail... Be specific about what you need"
                      className="relative w-full p-4 md:p-4 pb-14 md:pb-14 bg-transparent text-black placeholder-gray-400 group-hover:placeholder-transparent group-focus-within:placeholder-transparent text-base md:text-base resize-none focus:outline-none leading-relaxed min-h-[140px] md:min-h-[100px]"
                      rows={4}
                      maxLength={500}
                    />

                    {/* Character count and Continue button - INSIDE textarea at bottom */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-white/90 backdrop-blur-sm py-2 px-3 rounded-lg">
                      <span className="text-xs text-gray-500 font-medium">
                        {jobSearchQuery.length}/500
                      </span>
                      
                      {/* Small Continue button - always visible, changes color based on state */}
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
                        className={`px-4 md:px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                          jobSearchQuery.trim().length >= 10
                            ? 'bg-[#CDFF00] text-black hover:bg-[#CDFF00]/90 shadow-md hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                        title={jobSearchQuery.trim().length < 10 ? 'Please enter at least 10 characters' : 'Continue to next step'}
                      >
                        <span>Continue</span>
                        <svg className={`w-4 h-4 transform transition-transform ${jobSearchQuery.trim().length >= 10 ? 'group-hover:translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Animated corner accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#CDFF00]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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
              className="bg-black text-white px-5 md:px-6 py-2.5 md:py-4 rounded-xl font-bold text-sm md:text-base hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>{helperIsAvailable ? 'Turn off helper mode' : 'Activate helper mode'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JOBS NEAR YOU SECTION */}
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
                className="flex overflow-x-auto scrollbar-hide pb-2 gap-4 -mx-3 sm:-mx-4 md:-mx-5 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8"
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
            <div className="text-center py-8 bg-white rounded-lg border border-border mb-6">
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

        {/* WISH INTRODUCTION CARD - Secondary, Soft */}
        <div className="bg-white rounded-lg border border-border p-4 sm:p-5 mb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-[32px] sm:text-[40px] shrink-0">💭</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] sm:text-[18px] font-bold text-heading mb-2">
                Looking for something specific?
              </h3>
              <div className="flex items-start gap-1.5 text-[14px] sm:text-[15px] text-body mb-4 h-[48px] sm:h-[50px]">
                <span className="font-medium whitespace-nowrap">Examples:</span>
                <div className="flex-1 overflow-hidden">
                  <TypingAnimation 
                    phrases={[
                      'Looking for maths teacher',
                      'Looking for bike under ₹50,000',
                      'Looking for iPhone 14 under ₹30,000',
                      'Looking for wedding photographer',
                      'Looking for guitar trainer',
                      'Looking for office space for rent',
                      'Looking for laptop under ₹25,000',
                      'Looking for gym trainer nearby',
                      'Looking for interior designer',
                      'Looking for second-hand car under ₹2 lakh'
                    ]}
                    typingSpeed={50}
                    deletingSpeed={30}
                    pauseDuration={2500}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      onNavigate('create-wish');
                    } else {
                      toast.error('Please log in to create a wish');
                      onNavigate('create-wish');
                    }
                  }}
                  className="bg-black text-white px-5 py-2.5 rounded-md font-bold text-[13px] sm:text-[14px] hover:bg-gray-800 transition-all border border-black"
                >
                  Post a wish
                </button>
                <button
                  onClick={() => onNavigate('wishes')}
                  className="bg-transparent text-gray-600 px-5 py-2.5 rounded-md font-medium text-[13px] sm:text-[14px] hover:text-black transition-all"
                >
                  Explore wishes
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