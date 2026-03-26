// =====================================================
// SHOPS LISTING SCREEN
// =====================================================
// Main page showing all nearby shops with filters
// Updated: 2025-03-23 - Elegant banner, search bar, modern 2026 UI

import { useState, useEffect, useMemo } from 'react';
import { Plus, MapPin, Package, ChevronDown, Search } from 'lucide-react';
import { ShopCard } from '../components/ShopCard';
import { ShopManagementModal } from '../components/ShopManagementModal';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllShops, type ShopWithCategories } from '../services/shops';
import { PRODUCT_CATEGORIES } from '../services/productCategories';
import { User } from '../types';

interface ShopsScreenProps {
  user: User | null;
  onNavigate: (screen: string, data?: any) => void;
  unreadCount?: number;
  notificationCount?: number;
  onNotificationClick?: () => void;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onLocationClick?: () => void;
  onGlobalSearchClick?: () => void;
}

export function ShopsScreen({ 
  user, 
  onNavigate,
  unreadCount,
  notificationCount,
  onNotificationClick,
  globalLocationArea,
  globalLocationCity,
  onLocationClick,
  onGlobalSearchClick
}: ShopsScreenProps) {
  const [shops, setShops] = useState<ShopWithCategories[]>([]);
  const [filteredShops, setFilteredShops] = useState<ShopWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    loadShops();
  }, [userLocation]);

  const loadShops = async () => {
    setLoading(true);
    const result = await getAllShops({
      user_latitude: userLocation?.latitude,
      user_longitude: userLocation?.longitude,
    });
    if (result.success && result.shops) {
      setShops(result.shops);
      setFilteredShops(result.shops);
    }
    setLoading(false);
  };

  // Filter shops by category and search
  useEffect(() => {
    let filtered = shops;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(shop =>
        shop.categories.some(cat => cat.category_id === selectedCategory)
      );
    }

    // Filter by search query (shop name or products)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.shop_name.toLowerCase().includes(query)
      );
    }

    setFilteredShops(filtered);
  }, [shops, selectedCategory, searchQuery]);

  const handleShopClick = (shop: ShopWithCategories) => {
    console.log('🏪 [ShopsScreen] handleShopClick called with shop:', shop);
    console.log('🏪 [ShopsScreen] Shop ID:', shop?.id);
    console.log('🏪 [ShopsScreen] Shop name:', shop?.shop_name);
    const slugName = shop.shop_name.toLowerCase().replace(/\s+/g, '-');
    console.log('🏪 [ShopsScreen] Navigating to shop-details with data:', { shopId: shop.id, slug: slugName });
    onNavigate('shop-details', { shopId: shop.id, slug: slugName });
  };

  const handleRegisterShop = () => {
    console.log('🏪 [ShopsScreen] handleRegisterShop clicked');
    console.log('🏪 [ShopsScreen] Current user state:', user);
    console.log('🏪 [ShopsScreen] Checking localStorage directly...');
    const lsUser = localStorage.getItem('oldcycle_user');
    const lsToken = localStorage.getItem('oldcycle_token');
    console.log('🏪 [ShopsScreen] localStorage oldcycle_user:', lsUser ? 'EXISTS' : 'NULL');
    console.log('🏪 [ShopsScreen] localStorage oldcycle_token:', lsToken ? 'EXISTS' : 'NULL');
    
    if (!user) {
      console.log('❌ [ShopsScreen] No user - navigating to login');
      onNavigate('login', { returnTo: 'register-shop' });
      return;
    }
    console.log('✅ [ShopsScreen] User exists - navigating to register-shop');
    onNavigate('register-shop');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      <Header 
        onNavigate={onNavigate}
        currentScreen="shops"
        isLoggedIn={!!user}
        isAdmin={false}
        userDisplayName={user?.display_name}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        showGlobalLocation={true}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onLocationClick}
        onGlobalSearchClick={onGlobalSearchClick}
      />

      {/* ✅ Full-width banner with consistent inner padding matching Header */}
      <div className="sticky top-14 sm:top-[5.5rem] z-10 bg-gradient-to-br from-[#CDFF00] via-[#B8E600] to-[#A3CC00] shadow-lg border-b-2 border-black/10">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-5">
          {/* Mobile: Stack layout | Desktop: Horizontal layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-black mb-0.5">
                Discover nearby shops & products
              </h2>
              <p className="text-xs sm:text-sm text-black/70 hidden sm:block">
                Find local businesses and their products in your area
              </p>
            </div>
            <div className="flex gap-2">
              {user && (
                <button
                  onClick={() => setShowManageModal(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white/20 backdrop-blur-sm text-black rounded-xl hover:bg-white/30 transition-all font-bold text-sm whitespace-nowrap border border-black/10"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden lg:inline">Manage Shops</span>
                  <span className="lg:hidden">Manage</span>
                </button>
              )}
              <button
                onClick={handleRegisterShop}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-black text-[#CDFF00] rounded-xl hover:bg-gray-900 transition-all shadow-lg font-bold text-sm whitespace-nowrap hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Register Shop</span>
                <span className="sm:hidden">Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Main content with consistent padding matching Header */}
      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4">
        {/* Search & Filter Row - Compact, Modern */}
        <div className="flex gap-3 mb-4">
          {/* Search Bar - Left */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops or products..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Category Dropdown - Right */}
          <div className="relative w-48 sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-9 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent appearance-none cursor-pointer hover:border-gray-300 transition-colors font-medium"
            >
              <option value="">All categories</option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredShops.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600 font-medium">
              {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} found
              {selectedCategory && ' in this category'}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-6">
              {filteredShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onClick={() => handleShopClick(shop)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Package className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">No shops found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `No shops match "${searchQuery}". Try a different search.`
                : selectedCategory
                ? 'No shops in this category. Try another category.'
                : 'Be the first to register a shop in your area'}
            </p>
            {!searchQuery && !selectedCategory && (
              <button
                onClick={handleRegisterShop}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-[#CDFF00] rounded-xl hover:bg-gray-900 transition-colors font-bold"
              >
                <Plus className="w-5 h-5" />
                Register Shop
              </button>
            )}
          </div>
        )}
      </main>

      {/* Manage Shops Modal */}
      {showManageModal && (
        <ShopManagementModal
          onClose={() => setShowManageModal(false)}
          onEdit={(shopId) => {
            // Edit will be handled through navigation
          }}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}