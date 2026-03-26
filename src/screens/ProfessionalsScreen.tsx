import { useEffect, useState } from 'react';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { ProfessionalCategoryCard } from '../components/ProfessionalCategoryCard';
import { SERVICE_CATEGORIES } from '../services/serviceCategories';
import { Header } from '../components/Header';

interface ProfessionalsScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  userCity?: string;
  onBack?: () => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onLocationClick?: () => void;
  onMenuClick?: () => void;
  onGlobalSearchClick?: () => void;
  showGlobalLocation?: boolean;
  globalLocationArea?: string;
  globalLocationCity?: string;
}

export function ProfessionalsScreen({ 
  onNavigate, 
  userCity, 
  onBack,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
  unreadCount = 0,
  notificationCount = 0,
  onNotificationClick,
  onLocationClick,
  onMenuClick,
  onGlobalSearchClick,
  showGlobalLocation = true,
  globalLocationArea,
  globalLocationCity,
}: ProfessionalsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // All categories are now visible - no need to hide any
  const visibleCategories = SERVICE_CATEGORIES;
  
  const [filteredCategories, setFilteredCategories] = useState(visibleCategories);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter categories based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(visibleCategories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = visibleCategories.filter((category) => {
      // Match category name
      if (category.name.toLowerCase().includes(query)) return true;
      
      // Match subcategories
      if (category.subcategories?.some(sub => sub.name.toLowerCase().includes(query))) return true;
      
      // Match description
      if (category.description?.toLowerCase().includes(query)) return true;
      
      return false;
    });

    setFilteredCategories(filtered);
  }, [searchQuery]);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // Navigate to professionals listing page
    onNavigate('professionals-listing', undefined, {
      professionalsParams: {
        categoryId,
        categoryName,
        city: userCity || 'bangalore',
      }
    });
  };

  const handleRegisterClick = () => {
    onNavigate('register-professional');
  };

  const handleTopNavNavigate = (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'professionals') => {
    onNavigate(screen);
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8">
      {/* Main Global Header */}
      <Header
        currentScreen="professionals"
        onNavigate={(screen) => onNavigate(screen)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onLocationClick={onLocationClick}
        onMenuClick={onMenuClick}
        onGlobalSearchClick={onGlobalSearchClick}
        showGlobalLocation={showGlobalLocation}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
      />

      {/* Search Bar & Register Button Combined - Sticky */}
      <div className="sticky top-14 md:top-[calc(3.5rem)] z-20 bg-white border-b border-gray-200">
        {/* Mobile: Stack vertically */}
        <div className="md:hidden px-4 py-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for services, professionals..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleRegisterClick}
            className="w-full px-4 py-2.5 bg-black text-[#CDFF00] rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register as Professional
          </button>
        </div>

        {/* Desktop: Single row */}
        <div className="hidden md:block px-4 py-3">
          <div className="max-w-[1400px] mx-auto flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services, professionals..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleRegisterClick}
              className="px-4 py-2.5 bg-black text-[#CDFF00] rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Register as Professional
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6">
        {filteredCategories.length > 0 ? (
          <>
            {searchQuery && (
              <p className="text-sm text-gray-600 mb-4">
                Found {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredCategories.map((category) => (
                <ProfessionalCategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category.id.toString(), category.name)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
            <p className="text-sm text-gray-600">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-8 mb-8">
        <div className="bg-[#CDFF00] rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-black mb-2">
            Are you a professional?
          </h2>
          <p className="text-sm text-black mb-4 max-w-2xl">
            Register your profile and get discovered by thousands of potential customers in your area. 
            Connect directly with clients, set your own rates.
          </p>
          <button
            onClick={handleRegisterClick}
            className="px-6 py-3 bg-black text-[#CDFF00] rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            Register as Professional →
          </button>
        </div>
      </div>
    </div>
  );
}