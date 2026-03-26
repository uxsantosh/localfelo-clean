// =====================================================
// SHOP MANAGEMENT CARD - Profile Screen Component
// =====================================================
// Shows user's shops in profile with quick actions

import { useState, useEffect } from 'react';
import { Store, Edit, Eye, Plus, Package } from 'lucide-react';
import { getUserShops, type ShopWithCategories } from '../services/shops';
import { LoadingSpinner } from './LoadingSpinner';

interface ShopManagementCardProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function ShopManagementCard({ onNavigate }: ShopManagementCardProps) {
  const [shops, setShops] = useState<ShopWithCategories[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    const result = await getUserShops();
    if (result.success && result.shops) {
      setShops(result.shops);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-[#CDFF00]" />
          <h2 className="text-xl font-bold text-black">My Shops</h2>
        </div>
        <button
          onClick={() => onNavigate('register-shop')}
          className="flex items-center gap-2 px-4 py-2 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Shop
        </button>
      </div>

      {shops.length > 0 ? (
        <div className="space-y-4">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Shop Logo */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#CDFF00]/20 to-[#B8E600]/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {shop.logo_url ? (
                    <img
                      src={shop.logo_url}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* Shop Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black mb-1">{shop.shop_name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                    {shop.address}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shop.categories.slice(0, 2).map((cat, idx) => (
                      <span
                        key={`${cat.category_id}-${idx}`}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {cat.category_id.split('-').join(' ')}
                      </span>
                    ))}
                    {shop.categories.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{shop.categories.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const slug = shop.shop_name.toLowerCase().replace(/\s+/g, '-');
                      onNavigate('shop-details', { shopId: shop.id, slug });
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="View Shop"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onNavigate('edit-shop', { shopId: shop.id })}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Shop"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    shop.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {shop.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">No shops yet</h3>
          <p className="text-gray-600 mb-6">
            Register your shop to start getting leads from customers
          </p>
          <button
            onClick={() => onNavigate('register-shop')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-[#CDFF00] rounded-xl hover:bg-gray-900 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Register Your Shop
          </button>
        </div>
      )}
    </div>
  );
}
