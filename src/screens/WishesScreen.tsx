// =====================================================
// Wishes Screen - Browse All Wishes with Chat Integration
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/Header';
import { WishCard } from '../components/WishCard';
import { ActiveWishCard } from '../components/ActiveWishCard';
import { SelectField } from '../components/SelectField';
import { EmptyState } from '../components/EmptyState';
import { LocationSelectorModal } from '../components/LocationSelectorModal';
import { ScrollableContainer } from '../components/ScrollableContainer';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { MapView } from '../components/MapView';
import { Modal } from '../components/Modal';
import { AppFooter } from '../components/AppFooter';
import { BackToTop } from '../components/BackToTop';
import { Plus, Sparkles, SlidersHorizontal, Search, X, List, Map, Heart, User as UserIcon, Loader2 } from 'lucide-react';
import { Wish, City } from '../types';
import { getWishes, getUserActiveWishes, getUserWishes } from '../services/wishes';
import { getWishCategories, Category } from '../services/categories';
import { getMainProductCategories, getProductSubcategories, ProductMainCategory, ProductSubcategory } from '../services/productCategories';
import { toast } from 'sonner';
import { getOrCreateConversation } from '../services/chat';
import { getCurrentUser } from '../services/auth';
import { calculateDistance, formatDistance } from '../services/geocoding';

interface WishesScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  unreadCount: number;
  cities: City[];
  onMenuClick: () => void;
  showGlobalLocation?: boolean;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onLocationClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
  onLoginRequired?: () => void;
  onContactClick?: () => void;
  socialLinks?: { instagram?: string; facebook?: string; linkedin?: string };
  onGlobalSearchClick?: () => void;
}

export function WishesScreen({
  onNavigate,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount,
  cities,
  onMenuClick,
  showGlobalLocation,
  globalLocationArea,
  globalLocationCity,
  onLocationClick,
  notificationCount,
  onNotificationClick,
  userCoordinates,
  onLoginRequired,
  onContactClick,
  socialLinks,
  onGlobalSearchClick,
}: WishesScreenProps) {
  const user = getCurrentUser();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [activeWishes, setActiveWishes] = useState<Wish[]>([]);
  const [myWishes, setMyWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMyWishes, setLoadingMyWishes] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | number | ''>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPostSheet, setShowPostSheet] = useState(false);
  const [showMyWishes, setShowMyWishes] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [distanceFilter, setDistanceFilter] = useState<string>(''); // Distance filter: '1', '5', '10', '25', ''
  const [totalCount, setTotalCount] = useState(0);

  // ✅ NEW: Product category state
  const [productCategories, setProductCategories] = useState<ProductMainCategory[]>([]);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('');
  const [productSubcategories, setProductSubcategories] = useState<ProductSubcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  const selectedCityData = cities.find(c => c.id === selectedCity);
  const observerTarget = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 20;

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getWishCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);

  // Load product categories
  useEffect(() => {
    const fetchProductCategories = async () => {
      try {
        const data = await getMainProductCategories();
        setProductCategories(data);
      } catch (error) {
        console.error('Failed to fetch product categories:', error);
        toast.error('Failed to fetch product categories');
      }
    };

    fetchProductCategories();
  }, []);

  // Load product subcategories when a product category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedProductCategory) {
        try {
          const data = await getProductSubcategories(selectedProductCategory);
          setProductSubcategories(data);
        } catch (error) {
          console.error('Failed to fetch subcategories:', error);
          toast.error('Failed to fetch subcategories');
        }
      } else {
        setProductSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedProductCategory]);

  // Load wishes - reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setWishes([]);
    loadWishes(1, true);
  }, [selectedCategory, selectedCity, selectedArea, searchQuery, userCoordinates, globalLocationCity, globalLocationArea, distanceFilter, selectedProductCategory, selectedSubcategory]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && viewMode === 'list') {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, viewMode]);

  const loadWishes = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // DO NOT filter by city/area - show ALL wishes from everywhere
      // Only apply category, search, and distance filters

      const filters: any = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      };

      if (selectedCategory) filters.categoryId = selectedCategory;
      // REMOVED: City and area filters - we show ALL wishes everywhere
      // if (effectiveCityId) filters.cityId = effectiveCityId;
      // if (effectiveAreaId) filters.areaId = effectiveAreaId;
      if (searchQuery.trim()) filters.searchQuery = searchQuery.trim();
      if (distanceFilter) filters.distance = distanceFilter;
      // ✅ NEW: Product subcategory filter
      if (selectedSubcategory) filters.subcategoryId = selectedSubcategory;

      console.log('🔍 [WishesScreen] Loading wishes from ALL cities with filters:', {
        ...filters,
        note: 'Showing all wishes everywhere, sorted by distance (nearest first)'
      });

      // Pass user coordinates for distance sorting
      if (userCoordinates) {
        filters.userLat = userCoordinates.latitude;
        filters.userLon = userCoordinates.longitude;
        console.log('✅ [WishesScreen] User coordinates AVAILABLE:', userCoordinates);
      } else {
        console.log('ℹ️ [WishesScreen] User coordinates NOT SET - distance will not show. Set location to see distances.');
      }

      const data = await getWishes(filters);

      if (isRefresh || pageNum === 1) {
        setWishes(data.wishes);
      } else {
        setWishes(prev => [...prev, ...data.wishes]);
      }

      setTotalCount(data.totalCount);
      setHasMore(wishes.length + data.wishes.length < data.totalCount);
    } catch (error) {
      console.error('Failed to load wishes:', error);
      toast.error('Failed to load wishes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadWishes(nextPage, false);
    }
  };

  const handleChatWithWisher = async (wish: Wish) => {
    if (!isLoggedIn) {
      toast.error('Please login to chat');
      if (onLoginRequired) onLoginRequired();
      return;
    }

    try {
      console.log('💬 Opening chat with wish:', wish.id);

      // Create conversation with the wish poster
      const { conversation, error } = await getOrCreateConversation(
        wish.id,
        wish.title,
        undefined, // No image for wishes
        wish.budgetMax || wish.budgetMin || 0,
        wish.userId, // Wish owner's user ID
        wish.userName,
        wish.userAvatar,
        'wish' // ✅ NEW: Pass listing type
      );

      if (error || !conversation) {
        console.error('❌ Failed to create conversation:', error);
        toast.error(error || 'Failed to open chat. Please try again.');
        return;
      }

      console.log('✅ Conversation ready:', conversation.id);
      // Navigate to chat screen with conversation ID
      onNavigate('chat', { conversationId: conversation.id });
    } catch (err) {
      console.error('❌ Exception opening chat:', err);
      toast.error('Failed to open chat. Please try again.');
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedArea('');
    setSearchQuery('');
    setDistanceFilter('');
    setSelectedProductCategory('');
    setSelectedSubcategory('');
  };

  const activeFilterCount = [selectedCategory, selectedCity, selectedArea, searchQuery, distanceFilter, selectedProductCategory, selectedSubcategory].filter(Boolean).length;

  useEffect(() => {
    const fetchActiveWishes = async () => {
      if (!isLoggedIn || !user?.id) return;
      try {
        const data = await getUserActiveWishes(user.id);
        setActiveWishes(data);
      } catch (error) {
        console.error('Failed to fetch active wishes:', error);
      }
    };

    fetchActiveWishes();
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    const fetchMyWishes = async () => {
      if (!isLoggedIn || !user?.id) return;
      setLoadingMyWishes(true);
      try {
        const data = await getUserWishes(user.id);
        setMyWishes(data);
      } catch (error) {
        console.error('Failed to fetch my wishes:', error);
      } finally {
        setLoadingMyWishes(false);
      }
    };

    fetchMyWishes();
  }, [isLoggedIn, user?.id]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header
        title="Wishes"
        currentScreen="wishes"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn || false}
        isAdmin={isAdmin || false}
        userDisplayName={userDisplayName}
        onMenuClick={onMenuClick}
        unreadCount={unreadCount}
        showGlobalLocation={true}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onLocationClick}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onGlobalSearchClick={onGlobalSearchClick}
      />

      {/* ✅ Consistent width container matching Header */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4">
        {/* Hero Banner */}
        <div className="bg-white border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#CDFF00' }}>
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </div>
                <h1 className="text-lg sm:text-xl m-0" style={{ fontWeight: '700' }}>
                  Wishes Near You
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 m-0">
                Post a wish and connect with people in your area
              </p>
            </div>

            {/* Right: Action Button */}
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  toast.error('Please login to post a wish');
                  if (onLoginRequired) onLoginRequired();
                  return;
                }
                onNavigate('create-wish');
              }}
              className="btn-primary flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 shrink-0"
              style={{ borderRadius: '6px', width: 'auto', minWidth: 'fit-content' }}
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap text-sm sm:text-base">Post Wish</span>
            </button>
          </div>
        </div>

        {/* Search and Filters in one row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Smart search wishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-black" />
              </button>
            )}
          </div>

          {/* My Wishes Button - Only show when logged in */}
          {isLoggedIn && user && (
            <button
              onClick={() => setShowMyWishes(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-[6px] shrink-0 hover:bg-gray-50 transition-colors text-sm"
            >
              <UserIcon className="w-4 h-4 text-black" />
              <span className="text-black whitespace-nowrap">My Wishes</span>
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-[6px] shrink-0 hover:bg-gray-50 transition-colors text-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-black" />
            <span className="hidden sm:inline text-black whitespace-nowrap">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Categories - Compact */}
        <div className="mb-3">
          <ScrollableContainer>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedProductCategory('');
                  setSelectedSubcategory('');
                }}
                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  !selectedProductCategory
                    ? 'bg-black text-white font-medium'
                    : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All
              </button>
              {productCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedProductCategory(cat.id);
                    setSelectedSubcategory('');
                  }}
                  className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedProductCategory === cat.id
                      ? 'bg-black text-white font-medium'
                      : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </ScrollableContainer>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-[6px] p-4 mb-3 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectField
                label="Distance"
                value={distanceFilter}
                onChange={(value) => setDistanceFilter(value)}
              >
                <option value="">Any Distance</option>
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </SelectField>

              <SelectField
                label="City"
                value={selectedCity}
                onChange={(value) => {
                  setSelectedCity(value);
                  setSelectedArea('');
                }}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </SelectField>

              {selectedCityData && (
                <SelectField
                  label="Area"
                  value={selectedArea}
                  onChange={(value) => setSelectedArea(value)}
                >
                  <option value="">All Areas</option>
                  {selectedCityData.areas?.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </SelectField>
              )}

              <SelectField
                label="Product Category"
                value={selectedProductCategory}
                onChange={(value) => {
                  setSelectedProductCategory(value);
                  setSelectedSubcategory('');
                }}
              >
                <option value="">All Categories</option>
                {productCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </SelectField>

              {selectedProductCategory && (
                <SelectField
                  label="Subcategory"
                  value={selectedSubcategory}
                  onChange={(value) => setSelectedSubcategory(value)}
                >
                  <option value="">All Subcategories</option>
                  {productSubcategories.map(subcat => (
                    <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                  ))}
                </SelectField>
              )}
            </div>
          </div>
        )}

        {/* Active Wishes Section - More Compact */}
        {isLoggedIn && activeWishes.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>✨</span>
              <span>Your Active Wishes</span>
              <span className="bg-[#CDFF00] text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                {activeWishes.length}
              </span>
            </h3>
            <div className="space-y-2">
              {activeWishes.map((wish) => (
                <ActiveWishCard
                  key={wish.id}
                  wish={wish}
                  onClick={() => {
                    // Navigate to wish detail screen with wishId data
                    onNavigate('wish-detail', { wishId: wish.id });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results Count - Compact */}
        {!loading && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">
              {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'} found
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Wishes Grid/List/Map */}
        {loading ? (
          <SkeletonLoader count={6} />
        ) : wishes.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No wishes found"
            description={activeFilterCount > 0
              ? "Try adjusting your filters to see more results"
              : isLoggedIn
                ? "No other users have posted wishes yet. Your own wishes appear in 'My Wishes' section above."
                : "No one is looking for anything in this area yet. Post your wish to get started!"}
            action={
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    toast.error('Please login to post a wish');
                    if (onLoginRequired) onLoginRequired();
                    return;
                  }
                  onNavigate('create-wish');
                }}
                className="btn-primary px-4 py-2 rounded-[4px] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Post Your Wish</span>
              </button>
            }
          />
        ) : (
          <>
            {viewMode === 'list' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {wishes.map(wish => (
                    <WishCard
                      key={wish.id}
                      wish={wish}
                      onClick={() => {
                        // Navigate to wish detail screen
                        onNavigate('wish-detail', { wishId: wish.id });
                      }}
                      onChatClick={handleChatWithWisher}
                    />
                  ))}
                </div>

                {/* Infinite scroll observer target */}
                <div ref={observerTarget} className="h-20 flex items-center justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading more wishes...</span>
                    </div>
                  )}
                  {!loadingMore && !hasMore && wishes.length > 0 && (
                    <p className="text-sm text-muted">No more wishes to load</p>
                  )}
                </div>
              </>
            )}
            {viewMode === 'map' && (() => {
              const mapMarkers = wishes
                .filter(wish => wish.latitude && wish.longitude)
                .map(wish => ({
                  id: wish.id,
                  latitude: wish.latitude!,
                  longitude: wish.longitude!,
                  title: wish.title,
                  price: wish.budgetMax || wish.budgetMin,
                  type: 'wish' as const,
                  categoryEmoji: categories.find(c => String(c.id) === String(wish.categoryId))?.emoji,
                  status: wish.status,
                }));
              
              console.log('🗺️ [WishesScreen] Map View - Total wishes:', wishes.length);
              console.log('🗺️ [WishesScreen] Wishes with coordinates:', mapMarkers.length);
              console.log('🗺️ [WishesScreen] User coordinates:', userCoordinates);
              console.log('🗺️ [WishesScreen] Sample markers:', mapMarkers.slice(0, 3));
              
              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative z-0" style={{ height: '500px' }}>
                  {mapMarkers.length === 0 && !userCoordinates ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <p className="text-lg font-semibold text-gray-700 mb-2">📍 No location data available</p>
                        <p className="text-sm text-gray-500">Wishes need location data to show on the map</p>
                      </div>
                    </div>
                  ) : (
                    <MapView
                      markers={mapMarkers}
                      onMarkerClick={(id) => {
                        // Navigate to wish detail page
                        onNavigate('wish-detail', { wishId: id });
                      }}
                      userLocation={userCoordinates}
                    />
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* BackToTop Button */}
      <BackToTop />

      {/* Floating View Mode Toggle - Rapido Style */}
      {wishes.length > 0 && (
        <div className="fixed right-4 bottom-24 sm:bottom-6 z-40 flex flex-col gap-2 shadow-2xl rounded-[4px] overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`w-12 h-12 flex items-center justify-center transition-all ${
              viewMode === 'list'
                ? 'bg-black text-white'
                : 'bg-white text-foreground border-b border-border'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`w-12 h-12 flex items-center justify-center transition-all ${
              viewMode === 'map'
                ? 'bg-black text-white'
                : 'bg-white text-foreground'
            }`}
            title="Map View"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* My Wishes Modal */}
      <Modal
        isOpen={showMyWishes}
        onClose={() => setShowMyWishes(false)}
        title="My Wishes"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {loadingMyWishes ? (
            <div className="space-y-3 p-4">
              <SkeletonLoader count={3} />
            </div>
          ) : myWishes.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No wishes yet"
              description="Start posting your wishes to find what you're looking for"
              action={
                <button
                  onClick={() => {
                    setShowMyWishes(false);
                    onNavigate('create-wish');
                  }}
                  className="btn-primary px-4 py-2 rounded-[4px] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Your First Wish</span>
                </button>
              }
            />
          ) : (
            <div className="space-y-2 p-4">
              {myWishes.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  onClick={() => {
                    setShowMyWishes(false);
                    onNavigate('wish-detail', { wishId: wish.id });
                  }}
                  onChatClick={() => {
                    setShowMyWishes(false);
                    handleChatWithWisher(wish);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Screen Footer */}
      <AppFooter
        onNavigate={onNavigate}
        onContactClick={onContactClick || (() => {})}
        socialLinks={socialLinks}
      />
    </div>
  );
}