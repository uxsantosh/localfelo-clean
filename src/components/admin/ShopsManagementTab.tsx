// =====================================================
// ADMIN SHOPS MANAGEMENT TAB
// =====================================================
// Allows admin to view, edit, hide/show, and delete shops

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Store, Eye, EyeOff, Edit, Trash2, MapPin, Package, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

interface Shop {
  id: string;
  user_id: string;
  shop_name: string;
  address: string;
  latitude: number;
  longitude: number;
  logo_url: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    name: string;
    email: string;
    phone: string;
  };
  products_count?: number;
}

interface ShopsManagementTabProps {
  onNavigate?: (screen: string, data?: any, options?: any) => void;
}

export function ShopsManagementTab({ onNavigate }: ShopsManagementTabProps = {}) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [deleteModal, setDeleteModal] = useState<{ shopId: string; shopName: string } | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    filterShops();
  }, [shops, searchTerm, statusFilter]);

  const loadShops = async () => {
    setLoading(true);
    
    const { data: shopsData, error: shopsError } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (shopsError) {
      console.error('Error loading shops:', shopsError);
      toast.error('Failed to load shops');
      setLoading(false);
      return;
    }

    // Enrich each shop with profile data and product counts
    const shopsWithData = await Promise.all(
      (shopsData || []).map(async (shop) => {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', shop.user_id)
          .single();

        // Get product count
        const { count } = await supabase
          .from('shop_products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shop.id)
          .eq('is_active', true);

        return {
          ...shop,
          profiles: profile,
          products_count: count || 0,
        };
      })
    );

    setShops(shopsWithData);
    setLoading(false);
  };

  const filterShops = () => {
    let filtered = [...shops];

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(shop => shop.is_active);
    } else if (statusFilter === 'hidden') {
      filtered = filtered.filter(shop => !shop.is_active);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(shop =>
        shop.shop_name.toLowerCase().includes(term) ||
        shop.address.toLowerCase().includes(term) ||
        shop.profiles?.name?.toLowerCase().includes(term) ||
        shop.profiles?.email?.toLowerCase().includes(term)
      );
    }

    setFilteredShops(filtered);
  };

  const toggleShopStatus = async (shopId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('shops')
      .update({ is_active: !currentStatus })
      .eq('id', shopId);

    if (error) {
      console.error('Error updating shop status:', error);
      toast.error('Failed to update shop status');
      return;
    }

    toast.success(currentStatus ? 'Shop hidden' : 'Shop activated');
    loadShops();
  };

  const deleteShop = async (shopId: string) => {
    // Delete products first
    const { error: productsError } = await supabase
      .from('shop_products')
      .delete()
      .eq('shop_id', shopId);

    if (productsError) {
      console.error('Error deleting shop products:', productsError);
      toast.error('Failed to delete shop products');
      return;
    }

    // Delete categories
    const { error: categoriesError } = await supabase
      .from('shop_categories')
      .delete()
      .eq('shop_id', shopId);

    if (categoriesError) {
      console.error('Error deleting shop categories:', categoriesError);
      toast.error('Failed to delete shop categories');
      return;
    }

    // Delete shop
    const { error: shopError } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (shopError) {
      console.error('Error deleting shop:', shopError);
      toast.error('Failed to delete shop');
      return;
    }

    toast.success('Shop deleted successfully');
    setDeleteModal(null);
    loadShops();
  };

  const handleEditShop = (shopId: string) => {
    console.log('🏪 [ShopsManagementTab] Edit shop clicked:', shopId);
    if (onNavigate) {
      // Pass shopId as options (third parameter)
      onNavigate('admin-edit-shop', undefined, { shopId });
    } else {
      // Fallback: direct navigation
      console.log('⚠️ [ShopsManagementTab] No onNavigate, using direct navigation');
      window.location.href = `/admin-edit-shop/${shopId}`;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Shops Management</h2>
        <p className="text-gray-600">Manage all registered shops on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops, owners, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-black text-[#CDFF00]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({shops.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'active'
                  ? 'bg-black text-[#CDFF00]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({shops.filter(s => s.is_active).length})
            </button>
            <button
              onClick={() => setStatusFilter('hidden')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'hidden'
                  ? 'bg-black text-[#CDFF00]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hidden ({shops.filter(s => !s.is_active).length})
            </button>
          </div>
        </div>
      </div>

      {/* Shops List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shops...</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No shops found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
                shop.is_active ? 'border-transparent' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Shop Logo */}
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
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
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-black mb-1">{shop.shop_name}</h3>
                      {!shop.is_active && (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleShopStatus(shop.id, shop.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          shop.is_active
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={shop.is_active ? 'Hide shop' : 'Activate shop'}
                      >
                        {shop.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteModal({ shopId: shop.id, shopName: shop.shop_name })}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete shop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditShop(shop.id)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit shop"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* Owner */}
                    {shop.profiles && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {shop.profiles.name || shop.profiles.email}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </div>

                    {/* Products Count */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span>{shop.products_count || 0} products</span>
                    </div>

                    {/* WhatsApp */}
                    {shop.whatsapp_number && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{shop.whatsapp_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="mt-3 text-xs text-gray-500">
                    Registered {new Date(shop.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-black mb-4">Delete Shop</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteModal.shopName}</strong>? This will also delete all products and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteShop(deleteModal.shopId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}