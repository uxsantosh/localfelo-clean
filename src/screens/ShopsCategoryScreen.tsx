// =====================================================
// SHOPS CATEGORY SCREEN - SEO OPTIMIZED
// =====================================================
// Category-specific shop listing for SEO
// Updated: 2025-03-23 - Fixed imports

import { useState, useEffect } from 'react';
import { ArrowLeft, Store } from 'lucide-react';
import { ShopCard } from '../components/ShopCard';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getShopsByCategory, type ShopWithCategories } from '../services/shops';
import { PRODUCT_CATEGORIES } from '../services/productCategories';

interface ShopsCategoryScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  categoryId: string;
}

export function ShopsCategoryScreen({ onNavigate, categoryId }: ShopsCategoryScreenProps) {
  const [shops, setShops] = useState<ShopWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId);

  useEffect(() => {
    loadShops();
    
    // SEO
    if (category) {
      document.title = `${category.name} Shops Near You - LocalFelo`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Find local ${category.name} shops and businesses in your area. Browse products and contact shops directly on LocalFelo.`);
      }
    }
  }, [categoryId, userLocation]);

  const loadShops = async () => {
    setLoading(true);
    const result = await getShopsByCategory(categoryId);
    if (result.success && result.shops) {
      // Calculate distances if location available
      let shopsWithDistance = result.shops;
      if (userLocation) {
        shopsWithDistance = result.shops.map(shop => ({
          ...shop,
          distance_km: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            shop.latitude,
            shop.longitude
          ),
        })).sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
      }
      setShops(shopsWithDistance);
    }
    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  };

  const handleShopClick = (shop: ShopWithCategories) => {
    const slugName = shop.shop_name.toLowerCase().replace(/\s+/g, '-');
    onNavigate('shop-details', { shopId: shop.id, slug: slugName });
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={onNavigate} currentPage="shops" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-black mb-4">Category not found</h1>
            <button
              onClick={() => onNavigate('shops')}
              className="text-[#CDFF00] hover:underline"
            >
              Back to all shops
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="shops" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('shops')}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to All Shops
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            {category.emoji} {category.name} Shops
          </h1>
          <p className="text-gray-600">
            Find local {category.name.toLowerCase()} shops and businesses near you
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : shops.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {shops.length} {shops.length === 1 ? 'shop' : 'shops'} found
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {shops.map((shop) => (
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
              <Store className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              No {category.name.toLowerCase()} shops found
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to register a {category.name.toLowerCase()} shop in your area
            </p>
            <button
              onClick={() => onNavigate('register-shop')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-[#CDFF00] rounded-xl hover:bg-gray-900 transition-colors font-medium"
            >
              Register Shop
            </button>
          </div>
        )}
      </main>
    </div>
  );
}