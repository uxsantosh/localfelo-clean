// =====================================================
// SHOP MANAGEMENT MODAL - MANAGE ALL YOUR SHOPS
// =====================================================
// Modal for shop owners to view, edit, and delete their shops

import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Store } from 'lucide-react';
import { ShopWithCategories, getUserShops, deleteShop } from '../services/shops';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from 'sonner';

interface ShopManagementModalProps {
  onClose: () => void;
  onEdit: (shopId: string) => void;
  onNavigate: (screen: string, data?: any) => void;
}

export function ShopManagementModal({ onClose, onEdit, onNavigate }: ShopManagementModalProps) {
  const [shops, setShops] = useState<ShopWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (shopId: string, shopName: string) => {
    if (!confirm(`Are you sure you want to delete "${shopName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(shopId);
    const result = await deleteShop(shopId);
    
    if (result.success) {
      toast.success('Shop deleted successfully');
      setShops(shops.filter(s => s.id !== shopId));
    } else {
      toast.error(result.error || 'Failed to delete shop');
    }
    setDeletingId(null);
  };

  const handleEdit = (shopId: string) => {
    console.log('🔧 [ShopManagementModal] handleEdit called with shopId:', shopId);
    // ✅ FIX: Close modal first, then navigate
    onClose();
    // Use requestAnimationFrame to ensure modal is closed before navigation
    requestAnimationFrame(() => {
      console.log('🔧 [ShopManagementModal] Navigating to edit-shop...');
      onNavigate('edit-shop', { shopId });
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Manage Your Shops</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Shops Yet</h3>
              <p className="text-gray-500 mb-6">You haven't registered any shops yet.</p>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('register-shop');
                }}
                className="px-6 py-2.5 bg-black text-[#CDFF00] rounded-xl hover:bg-gray-900 transition-colors font-bold"
              >
                Register Your First Shop
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  {/* Shop Image/Logo */}
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    {shop.shop_image_url || shop.logo_url ? (
                      <img
                        src={shop.shop_image_url || shop.logo_url || ''}
                        alt={shop.shop_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-base mb-1 truncate">
                      {shop.shop_name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{shop.address}</p>
                    {shop.products_count !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {shop.products_count} {shop.products_count === 1 ? 'product' : 'products'}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(shop.id)}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Edit shop"
                    >
                      <Edit2 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(shop.id, shop.shop_name)}
                      disabled={deletingId === shop.id}
                      className="p-2 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete shop"
                    >
                      {deletingId === shop.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}