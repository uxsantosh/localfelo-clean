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
import { Heart, Briefcase, MapPin, TrendingUp, ArrowRight } from 'lucide-react';
import { Wish, Task, Listing } from '../types';
import { getWishes } from '../services/wishes';
import { getTasks } from '../services/tasks';
import { getListings } from '../services/listings.js';
import { getCurrentUser } from '../services/auth';
import { getCitiesWithAreas } from '../services/locations';
import { toast } from 'sonner';

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
}: NewHomeScreenProps) {
  const [nearbyWishes, setNearbyWishes] = useState<Wish[]>([]);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [nearbyDeals, setNearbyDeals] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadNearbyContent();
  }, [userLocation]);

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
      console.log('[NewHomeScreen] Loaded wishes from ALL cities (sorted by distance):', wishesData.data?.length || 0);
      setNearbyWishes(wishesData.data?.slice(0, 10) || []); // Limit to 10

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
      console.log('[NewHomeScreen] Loaded tasks from ALL cities (sorted by distance):', tasksData.data?.length || 0);
      setNearbyTasks(tasksData.data?.slice(0, 10) || []); // Limit to 10

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* TOP BANNER - Primary Action */}
        <div className="relative bg-[#CDFF00] rounded-lg overflow-hidden p-4 md:p-6 mb-6">
          {/* Content */}
          <div className="relative z-10 max-w-[85%] md:max-w-[60%]">
            <h1 className="text-black font-bold text-[18px] md:text-[22px] leading-tight mb-3 md:mb-4">
              <span className="block md:hidden">Get help nearby.</span>
              <span className="block md:hidden whitespace-nowrap">Or help someone and earn locally.</span>
              <span className="hidden md:inline">Get help nearby. Or help someone and earn locally.</span>
            </h1>
            
            <div className="flex items-center gap-2 text-[12px] md:text-[13px] text-black mb-4 md:mb-5 min-h-[16px] md:min-h-[18px]">
              <span className="font-medium">Examples:</span>
              <div className="flex-1">
                <TypingAnimation 
                  texts={[
                    'Pick up grocery',
                    'Shift luggage tomorrow',
                    'Bring gas cylinder',
                    'Clean my car',
                    'Help with coding',
                    'Install washing machine'
                  ]}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={2500}
                />
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => onNavigate('tasks')}
                className="bg-black text-white px-4 md:px-5 py-2 md:py-2.5 rounded font-bold text-[12px] md:text-[13px] hover:bg-gray-800 transition-colors"
              >
                Find tasks
              </button>
              
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    onNavigate('login');
                  } else {
                    onNavigate('create-task');
                  }
                }}
                className="bg-white text-black px-4 md:px-5 py-2 md:py-2.5 rounded font-bold text-[12px] md:text-[13px] hover:bg-gray-100 transition-colors"
              >
                Create task
              </button>
            </div>
          </div>
          
          {/* Small Image - Bottom Right */}
          <img
            src="/home-banner.png"
            alt=""
            className="absolute bottom-0 right-0 md:right-8 h-[90px] w-auto md:h-[120px] object-contain pointer-events-none"
          />
        </div>

        {/* TASKS SECTION - Primary Content (Horizontal Scroll) */}
        {loading ? (
          <div className="space-y-3 mb-6">
            <h2 className="text-[17px] sm:text-xl font-bold text-heading px-1">Tasks near you, complete and earn</h2>
            <SkeletonLoader count={3} />
          </div>
        ) : nearbyTasks.length > 0 ? (
          <div className="space-y-4 mb-6">
            {/* First Row of Tasks */}
            <HorizontalScroll
              title="Tasks near you, complete and earn"
              onViewAll={() => onNavigate('tasks')}
              showViewAll={true}
            >
              {nearbyTasks.slice(0, 5).map((task) => (
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
            </HorizontalScroll>

            {/* Second Row of Tasks (if more than 5) */}
            {nearbyTasks.length > 5 && (
              <div className="overflow-x-auto scrollbar-hide -mx-3 sm:-mx-4 md:-mx-5 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
                <div className="flex gap-3 sm:gap-4">
                  {nearbyTasks.slice(5, 10).map((task) => (
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
            )}
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
              Post a task
            </button>
          </div>
        )}

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
                    texts={[
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
              Post a task
            </button>
          </div>
        )}
      </div>

      <AppFooter 
        onNavigate={onNavigate}
        onContactClick={onContactClick || (() => {})}
        socialLinks={socialLinks}
      />
    </div>
  );
}