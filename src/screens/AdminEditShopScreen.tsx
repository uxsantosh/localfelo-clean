// =====================================================
// ADMIN EDIT SHOP SCREEN - FULL MANAGEMENT
// =====================================================
// Comprehensive shop editing for admins - edit everything
// Shop info, logo, images, products, categories, timings, location

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Plus, Upload, X, Clock, MapPin, Image as ImageIcon, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LocationSelector } from '../components/LocationSelector';
import { ProductCategorySelector } from '../components/ProductCategorySelector';
import { WeekTimingsEditor, DayTiming } from '../components/WeekTimingsEditor';
import { getShopById, updateShop, addProduct, updateProduct, deleteProduct, type ShopWithProducts, type ShopProduct } from '../services/shops';
import { uploadImage } from '../services/avatarUpload';
import { getCurrentUser } from '../services/authHelpers';
import { toast } from 'sonner@2.0.3';

interface AdminEditShopScreenProps {
  onNavigate: (screen: string, data?: any, options?: any) => void;
  shopId: string;
  globalLat?: number;
  globalLng?: number;
  globalCity?: string;
  globalArea?: string;
}

interface ProductForm {
  id?: string;
  product_name: string;
  price: number;
  images: string[];
  category?: string | null;
}

export function AdminEditShopScreen({ 
  onNavigate, 
  shopId, 
  globalLat, 
  globalLng, 
  globalCity, 
  globalArea 
}: AdminEditShopScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shop, setShop] = useState<ShopWithProducts | null>(null);
  const [user, setUser] = useState<any>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'products' | 'timings' | 'categories'>('info');

  // Shop Info
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [locationCity, setLocationCity] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Images
  const [logoUrl, setLogoUrl] = useState('');
  const [shopImages, setShopImages] = useState<string[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingShopImage, setUploadingShopImage] = useState(false);

  // Categories
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Timings
  const [weekTimings, setWeekTimings] = useState<DayTiming[]>([]);

  // Products
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductForm | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]); // ✅ NEW: Track expanded categories

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Validate shopId before loading
    if (!shopId || shopId === 'undefined') {
      console.error('❌ [AdminEditShopScreen] Invalid shopId:', shopId);
      toast.error('Invalid shop ID');
      onNavigate('admin', undefined, { activeTab: 'shops' });
      return;
    }
    
    loadShop();
  }, [shopId]);

  const loadShop = async () => {
    // Double-check shopId validity
    if (!shopId || shopId === 'undefined') {
      console.error('❌ [AdminEditShopScreen] loadShop called with invalid shopId:', shopId);
      toast.error('Invalid shop ID');
      onNavigate('admin', undefined, { activeTab: 'shops' });
      return;
    }
    
    setLoading(true);
    console.log('🔍 [AdminEditShopScreen] Loading shop with ID:', shopId);
    const result = await getShopById(shopId);
    if (result.success && result.shop) {
      const s = result.shop;
      setShop(s);
      setShopName(s.shop_name);
      setAddress(s.address);
      setLatitude(s.latitude);
      setLongitude(s.longitude);
      setLogoUrl(s.logo_url || '');
      setShopImages(s.shop_images || []);
      setWhatsappNumber(s.whatsapp_number || '');
      setWeekTimings(s.week_timings || []);
      setProducts(s.products);
      
      // Extract categories
      const catIds = s.categories.map(c => c.category_id);
      const subCatIds = s.categories.map(c => c.subcategory_id).filter(Boolean) as string[];
      setSelectedCategoryIds(catIds);
      setSelectedSubcategoryIds(subCatIds);
      
      // Extract product categories
      const prodCats = [...new Set(s.products.map(p => p.category).filter(Boolean))] as string[];
      setProductCategories(prodCats);
    } else {
      toast.error('Shop not found');
      onNavigate('shops');
    }
    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingLogo(true);
    try {
      const result = await uploadImage(file, user.id);
      if (result.success && result.url) {
        setLogoUrl(result.url);
        toast.success('Logo uploaded');
      } else {
        toast.error('Failed to upload logo');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleShopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingShopImage(true);
    try {
      const result = await uploadImage(file, user.id);
      if (result.success && result.url) {
        setShopImages([...shopImages, result.url]);
        toast.success('Shop image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingShopImage(false);
    }
  };

  const handleRemoveShopImage = (index: number) => {
    setShopImages(shopImages.filter((_, i) => i !== index));
  };

  const handleSaveShop = async () => {
    if (!shopName.trim() || !address.trim() || !latitude || !longitude) {
      toast.error('Fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const result = await updateShop(shopId, {
        shop_name: shopName,
        address,
        latitude,
        longitude,
        logo_url: logoUrl,
        shop_images: shopImages, // ✅ Save shop images array
        whatsapp_number: whatsappNumber,
        week_timings: weekTimings,
      });

      if (result.success) {
        toast.success('Shop updated successfully');
        await loadShop();
      } else {
        toast.error(result.error || 'Failed to update shop');
      }
    } catch (error) {
      toast.error('Failed to update shop');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct({
      product_name: '',
      price: 0,
      images: [],
      category: null,
    });
    setShowProductForm(true);
  };

  const handleEditProduct = (product: ShopProduct) => {
    setEditingProduct({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      images: product.images,
      category: product.category || null,
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.product_name.trim() || editingProduct.price <= 0) {
      toast.error('Enter product name and price');
      return;
    }

    try {
      if (editingProduct.id) {
        // Update
        const result = await updateProduct(editingProduct.id, {
          product_name: editingProduct.product_name,
          price: editingProduct.price,
          images: editingProduct.images,
          category: editingProduct.category,
        });
        if (result.success) {
          toast.success('Product updated');
          setShowProductForm(false);
          await loadShop();
        } else {
          toast.error(result.error || 'Failed to update product');
        }
      } else {
        // Add
        const result = await addProduct({
          shop_id: shopId,
          product_name: editingProduct.product_name,
          price: editingProduct.price,
          images: editingProduct.images,
          category: editingProduct.category,
        });
        if (result.success) {
          toast.success('Product added');
          setShowProductForm(false);
          await loadShop();
        } else {
          toast.error(result.error || 'Failed to add product');
        }
      }
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return;

    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success('Product deleted');
        await loadShop();
      } else {
        toast.error(result.error || 'Failed to delete product');
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !editingProduct) return;
    if (editingProduct.images.length >= 2) {
      toast.error('Maximum 2 images allowed');
      return;
    }

    try {
      const result = await uploadImage(file, user.id);
      if (result.success && result.url) {
        setEditingProduct({
          ...editingProduct,
          images: [...editingProduct.images, result.url],
        });
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <Header
        currentScreen="admin"
        onNavigate={(screen) => onNavigate(screen)}
        isAdmin={true}
      />

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                console.log('🔙 [AdminEditShop] Navigating back to admin panel shops tab');
                onNavigate('admin', { activeTab: 'shops' });
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">Edit Shop (Admin)</h1>
              <p className="text-sm text-gray-600">{shopName}</p>
            </div>
          </div>
          <button
            onClick={handleSaveShop}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black text-[#CDFF00] rounded-xl font-semibold hover:bg-gray-900 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Shop'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {(['info', 'images', 'categories', 'timings', 'products'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg mb-4">Shop Information</h2>
            
            <div>
              <label className="block text-sm font-bold text-black mb-2">Shop Name *</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowLocationSelector(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors w-full justify-center"
            >
              <MapPin className="w-4 h-4" />
              Update Location on Map
            </button>

            {latitude && longitude && (
              <p className="text-sm text-gray-600">
                📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <div className="bg-white rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-4">Shop Logo</h2>
              {logoUrl ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setLogoUrl('')}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#CDFF00] transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-2">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              )}
            </div>

            <div>
              <h2 className="font-bold text-lg mb-4">Shop Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {shopImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt={`Shop ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveShopImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#CDFF00] transition-colors flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-2">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleShopImageUpload}
                    className="hidden"
                    disabled={uploadingShopImage}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Shop Categories</h2>
            <button
              onClick={() => setShowCategorySelector(true)}
              className="flex items-center gap-2 px-4 py-3 bg-black text-[#CDFF00] rounded-xl font-semibold hover:bg-gray-900"
            >
              <Plus className="w-4 h-4" />
              Manage Categories
            </button>
            {selectedCategoryIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategoryIds.map((catId) => (
                  <span key={catId} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    {catId}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TIMINGS TAB */}
        {activeTab === 'timings' && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Shop Timings</h2>
            <WeekTimingsEditor
              weekTimings={weekTimings}
              onChange={setWeekTimings}
            />
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Products ({products.length})</h2>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2 bg-black text-[#CDFF00] rounded-xl font-semibold hover:bg-gray-900"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            <div className="space-y-3">
              {(() => {
                // Group products by category
                const uncategorized = products.filter(p => !p.category);
                const categorized = products.filter(p => p.category);
                const categories = [...new Set(categorized.map(p => p.category))];
                
                const toggleCategory = (cat: string) => {
                  setExpandedCategories(prev => 
                    prev.includes(cat) ? prev.filter(c => c !== cat) : [cat]
                  );
                };

                return (
                  <>
                    {/* Uncategorized Products */}
                    {uncategorized.length > 0 && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleCategory('uncategorized')}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-gray-600" />
                            <div className="text-left">
                              <h3 className="text-sm font-bold text-black">Uncategorized</h3>
                              <p className="text-xs text-gray-600">{uncategorized.length} products</p>
                            </div>
                          </div>
                          {expandedCategories.includes('uncategorized') ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>

                        {expandedCategories.includes('uncategorized') && (
                          <div className="pl-4 space-y-2">
                            {uncategorized.map((product) => (
                              <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white">
                                {product.images[0] && (
                                  <img src={product.images[0]} alt={product.product_name} className="w-16 h-16 object-cover rounded-lg" />
                                )}
                                <div className="flex-1">
                                  <h3 className="font-bold">{product.product_name}</h3>
                                  <p className="text-sm text-gray-600">₹{product.price}</p>
                                </div>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Categorized Products */}
                    {categories.map((category) => {
                      const categoryProducts = products.filter(p => p.category === category);
                      return (
                        <div key={category} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category as string)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-black" />
                              <div className="text-left">
                                <h3 className="text-sm font-bold text-black">{category}</h3>
                                <p className="text-xs text-gray-600">{categoryProducts.length} products</p>
                              </div>
                            </div>
                            {expandedCategories.includes(category as string) ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>

                          {expandedCategories.includes(category as string) && (
                            <div className="pl-4 space-y-2">
                              {categoryProducts.map((product) => (
                                <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white">
                                  {product.images[0] && (
                                    <img src={product.images[0]} alt={product.product_name} className="w-16 h-16 object-cover rounded-lg" />
                                  )}
                                  <div className="flex-1">
                                    <h3 className="font-bold">{product.product_name}</h3>
                                    <p className="text-sm text-gray-600">₹{product.price}</p>
                                  </div>
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          onClose={() => setShowLocationSelector(false)}
          onLocationSelect={(location) => {
            setAddress(location.address);
            setLatitude(location.latitude);
            setLongitude(location.longitude);
            setLocationCity(location.city || '');
            setLocationArea(location.area || '');
            setShowLocationSelector(false);
          }}
          initialLocation={
            latitude && longitude
              ? { latitude, longitude, address, city: locationCity, area: locationArea }
              : undefined
          }
        />
      )}

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <ProductCategorySelector
          selectedCategoryIds={selectedCategoryIds}
          selectedSubcategoryIds={selectedSubcategoryIds}
          onSave={(catIds, subCatIds) => {
            setSelectedCategoryIds(catIds);
            setSelectedSubcategoryIds(subCatIds);
            setShowCategorySelector(false);
          }}
          onClose={() => setShowCategorySelector(false)}
        />
      )}

      {/* Product Form Modal */}
      {showProductForm && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="font-bold text-lg">
                {editingProduct.id ? 'Edit Product' : 'Add Product'}
              </h2>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Product Name *</label>
                <input
                  type="text"
                  value={editingProduct.product_name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, product_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CDFF00]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CDFF00]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Category</label>
                <select
                  value={editingProduct.category || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value || null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CDFF00]"
                >
                  <option value="">No category</option>
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Images (max 2)</label>
                <div className="grid grid-cols-2 gap-2">
                  {editingProduct.images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setEditingProduct({
                          ...editingProduct,
                          images: editingProduct.images.filter((_, i) => i !== idx),
                        })}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {editingProduct.images.length < 2 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#CDFF00] flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 px-4 py-3 bg-black text-[#CDFF00] rounded-xl font-semibold hover:bg-gray-900"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}