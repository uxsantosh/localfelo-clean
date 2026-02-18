import React, { useState, useEffect } from 'react';
import { Listing, City } from '../types';
import { Header } from '../components/Header';
import { ListingCard } from '../components/ListingCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { MarketplaceFilterModal } from '../components/MarketplaceFilterModal';
import { AppFooter } from '../components/AppFooter';
import { Filter, Sparkles, ArrowUp } from 'lucide-react';
import { getListings } from '../services/listings';
import { getAllCategories } from '../services/categories';
import { calculateDistance, formatDistance } from '../services/geocoding';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { InfiniteScrollLoading } from '../components/InfiniteScrollLoading';

interface MarketplaceScreenProps {
  onListingClick: (listing: Listing) => void;
  selectedCity: string;
  selectedArea: string[];
  onCityChange: (cityId: string) => void;
  onAreaChange: (areaIds: string[]) => void;
  onNavigate: (screen: string) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  onMenuClick?: () => void;
  unreadCount?: number;
  cities: City[];
  globalLocationArea?: string;
  globalLocationCity?: string;
  onGlobalLocationClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
  onGlobalSearchClick?: () => void;
  onContactClick?: () => void;
  socialLinks?: { instagram?: string; facebook?: string; linkedin?: string };
}

export function MarketplaceScreen({
  onListingClick,
  selectedCity,
  selectedArea,
  onCityChange,
  onAreaChange,
  onNavigate,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
  onMenuClick,
  unreadCount = 0,
  cities,
  globalLocationArea,
  globalLocationCity,
  onGlobalLocationClick,
  notificationCount = 0,
  onNotificationClick,
  userCoordinates,
  onGlobalSearchClick,
  onContactClick,
  socialLinks,
}: MarketplaceScreenProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | undefined>();
  const [includeOwnListings, setIncludeOwnListings] = useState(true);  // ✅ TRUE for development - change to FALSE for production

  // Pagination state
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Back to top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll position for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats.map((cat: any) => ({
          id: String(cat.id),
          name: cat.name,
          emoji: cat.emoji,
          slug: cat.slug,
        })));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load listings
  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        
        // Build filters for server-side filtering
        const filters: any = {
          limit: 1000, // Load more listings for better filtering
          includeOwn: includeOwnListings,  // ✅ Pass dev mode flag
        };
        
        // Apply global location if no manual filters are set
        // NOTE: For global location, use ONLY city (not area) to show entire city
        if (!selectedCity && !selectedArea.length && globalLocationCity) {
          filters.city = globalLocationCity;
          // Don't apply area filter - show entire city
        }
        
        // Apply manual filters (override global location)
        if (selectedCategory) {
          const category = categories.find(c => c.id === selectedCategory);
          if (category?.slug) {
            filters.categorySlug = category.slug;
          }
        }
        
        if (selectedCity) {
          const city = cities.find(c => c.id === selectedCity);
          if (city) {
            filters.city = city.name;
          }
        }
        
        if (selectedArea.length > 0) {
          // For listings API, area is stored as area_slug (the area ID)
          filters.areaSlug = selectedArea[0]; // getListings currently only supports single area
        }
        
        if (minPrice !== undefined && minPrice > 0) {
          filters.minPrice = minPrice;
        }
        
        if (maxPrice !== undefined && maxPrice > 0) {
          filters.maxPrice = maxPrice;
        }
        
        if (searchQuery.trim()) {
          filters.searchQuery = searchQuery.trim();
        }
        
        // Pass user coordinates for distance calculation
        if (userCoordinates) {
          filters.userLat = userCoordinates.latitude;
          filters.userLon = userCoordinates.longitude;
          console.log('[MarketplaceScreen] 📍 Passing user coordinates to listings:', { lat: userCoordinates.latitude, lon: userCoordinates.longitude });
        } else {
          console.log('[MarketplaceScreen] ⚠️ No user location available for distance calculation');
        }
        
        console.log('[MarketplaceScreen] Loading listings with filters:', filters);
        
        const response = await getListings(filters);
        setListings(response.data || []);
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadListings();
  }, [selectedCategory, selectedCity, selectedArea, minPrice, maxPrice, searchQuery, globalLocationCity, globalLocationArea, categories, cities, userCoordinates, includeOwnListings]);

  // All filtered listings (not paginated)
  const [allFilteredListings, setAllFilteredListings] = useState<Listing[]>([]);
  
  // Paginated listings to display
  const [displayedListings, setDisplayedListings] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Smart Filter listings with intelligent category matching
  useEffect(() => {
    let filtered = [...listings];

    if (selectedCategory) {
      filtered = filtered.filter(l => l.categoryId === Number(selectedCategory));
    }

    if (selectedCity) {
      filtered = filtered.filter(l => l.cityId === selectedCity);
    }

    if (selectedArea.length > 0) {
      filtered = filtered.filter(l => selectedArea.includes(l.areaId));
    }

    if (minPrice !== undefined) {
      filtered = filtered.filter(l => l.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      filtered = filtered.filter(l => l.price <= maxPrice);
    }

    // Smart search - matches title, description, AND category name intelligently
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Find matching categories for the search query
      const matchingCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(query) || 
        cat.slug.toLowerCase().includes(query)
      ).map(cat => cat.id);
      
      filtered = filtered.filter(l => {
        // Match in title or description
        const textMatch = l.title.toLowerCase().includes(query) ||
                         l.description.toLowerCase().includes(query);
        
        // Match in category name
        const categoryMatch = l.categoryName.toLowerCase().includes(query);
        
        // Match if listing belongs to a category that matches the search
        const belongsToMatchingCategory = matchingCategories.includes(String(l.categoryId));
        
        return textMatch || categoryMatch || belongsToMatchingCategory;
      });
    }

    // Filter by distance if set
    if (maxDistance !== undefined && userCoordinates) {
      filtered = filtered.filter(l => {
        if (l.distance === undefined) return false;
        return l.distance <= maxDistance;
      });
    }

    // Sort by distance if available (nearest first)
    if (userCoordinates) {
      filtered.sort((a, b) => {
        // Prioritize items with distance data
        if (a.distance !== undefined && b.distance === undefined) return -1;
        if (a.distance === undefined && b.distance !== undefined) return 1;
        if (a.distance === undefined && b.distance === undefined) return 0;
        return a.distance - b.distance;
      });
      console.log('[MarketplaceScreen] 📍 Sorted by distance:', filtered.slice(0, 3).map(l => ({ title: l.title, distance: l.distance })));
    }

    setAllFilteredListings(filtered);
    setFilteredListings(filtered); // Keep for backward compat
    
    // Reset pagination when filters change
    setCurrentPage(0);
    setDisplayedListings(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [listings, selectedCategory, selectedCity, selectedArea, minPrice, maxPrice, searchQuery, maxDistance, categories, userCoordinates]);

  // Load more listings (pagination)
  const loadMoreListings = () => {
    const nextPage = currentPage + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const moreListings = allFilteredListings.slice(startIndex, endIndex);
    
    if (moreListings.length > 0) {
      setDisplayedListings(prev => [...prev, ...moreListings]);
      setCurrentPage(nextPage);
      setHasMore(endIndex < allFilteredListings.length);
    } else {
      setHasMore(false);
    }
  };

  // Infinite scroll hook
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: () => {
      if (!loading && hasMore && !loadingMore) {
        setLoadingMore(true);
        loadMoreListings();
        setLoadingMore(false);
      }
    },
    hasMore,
    loading: loadingMore,
    threshold: 300,
  });

  const clearFilters = () => {
    setSelectedCategory('');
    onCityChange('');
    onAreaChange([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedCity || selectedArea.length > 0 || minPrice || maxPrice || searchQuery;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header
        title="Marketplace"
        currentScreen="marketplace"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        onMenuClick={onMenuClick}
        unreadCount={unreadCount}
        showGlobalLocation={true}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onGlobalLocationClick}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onGlobalSearchClick={onGlobalSearchClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Category Pills - Sticky below header */}
        <div className="sticky top-14 z-40 bg-white border-b border-gray-200 py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                !selectedCategory
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Search, Filter & Sell Button */}
        <div className="flex gap-2 mb-4 mt-4">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDFF00]" />
            <input
              type="text"
              placeholder="Smart search (e.g., 'phone', 'laptop', 'bike')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-[4px] font-medium transition-colors flex items-center gap-2 ${
              hasActiveFilters
                ? 'bg-[#CDFF00] text-black font-bold'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && <span className="hidden sm:inline">({
              [selectedCategory, selectedCity, ...selectedArea, minPrice, maxPrice, searchQuery].filter(Boolean).length
            })</span>}
          </button>
          <button
            onClick={() => onNavigate('create')}
            className="px-4 py-2 rounded-[4px] bg-[#CDFF00] text-black font-bold hover:bg-[#b8e600] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>Sell</span>
          </button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {selectedCategory && (
              <span className="px-3 py-1 bg-[#CDFF00]/20 text-black rounded-full text-sm flex items-center gap-2 font-medium">
                {categories.find(c => c.id === selectedCategory)?.emoji} {categories.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="hover:opacity-70">×</button>
              </span>
            )}
            {selectedCity && (
              <span className="px-3 py-1 bg-[#CDFF00]/20 text-black rounded-full text-sm flex items-center gap-2 font-medium">
                📍 {cities.find(c => c.id === selectedCity)?.name}
                <button onClick={() => onCityChange('')} className="hover:opacity-70">×</button>
              </span>
            )}
            {selectedArea.length > 0 && (
              <span className="px-3 py-1 bg-[#CDFF00]/20 text-black rounded-full text-sm flex items-center gap-2 font-medium">
                {selectedArea.length} area{selectedArea.length !== 1 ? 's' : ''}
                <button onClick={() => onAreaChange([])} className="hover:opacity-70">×</button>
              </span>
            )}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <span className="px-3 py-1 bg-[#CDFF00]/20 text-black rounded-full text-sm flex items-center gap-2 font-medium">
                ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                <button onClick={() => { setMinPrice(undefined); setMaxPrice(undefined); }} className="hover:opacity-70">×</button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-black underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="listing-grid">
            <SkeletonLoader count={6} />
          </div>
        ) : filteredListings.length === 0 ? (
          <EmptyState
            type={hasActiveFilters ? 'no-results' : 'no-listings'}
            message={hasActiveFilters ? 'No listings match your filters. Try adjusting your search.' : undefined}
          />
        ) : (
          <>
            <div className="mb-3 text-sm text-gray-600">
              Showing {filteredListings.length} of {listings.length} listings
            </div>
            <div className="listing-grid">
              {displayedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={onListingClick}
                />
              ))}
            </div>
            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-10" />
            {/* Loading Indicator */}
            <InfiniteScrollLoading 
              isLoading={loadingMore} 
              hasMore={hasMore} 
            />
          </>
        )}
      </div>

      <AppFooter 
        onNavigate={onNavigate}
        onContactClick={onContactClick || (() => {})}
        socialLinks={socialLinks}
      />

      {/* Back to Top Button */}
      {showBackToTop && displayedListings.length > 0 && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-24 sm:bottom-6 z-50 w-12 h-12 flex items-center justify-center bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-all shadow-2xl rounded-[4px]"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}