// =====================================================
// EDIT SHOP SCREEN
// =====================================================
// Edit shop details and manage products with category organization
// Same UX as RegisterShopScreen - uses LocationSelector instead of raw lat/lng

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Plus, Upload, X, FolderPlus, Edit2, MapPin, Folder, Move } from 'lucide-react';
import { Header } from '../components/Header';
import { InputField } from '../components/InputField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LocationSelector } from '../components/LocationSelector';
import { getShopById, updateShop, addProduct, updateProduct, deleteProduct, type ShopWithProducts, type ShopProduct } from '../services/shops';
import { uploadImage } from '../services/avatarUpload';
import { toast } from 'sonner';

interface EditShopScreenProps {
  onNavigate: (screen: string, data?: any) => void;
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

export function EditShopScreen({ onNavigate, shopId, globalLat, globalLng, globalCity, globalArea }: EditShopScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shop, setShop] = useState<ShopWithProducts | null>(null);

  // Form state
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [locationCity, setLocationCity] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [shopImages, setShopImages] = useState<string[]>([]); // ✅ NEW: Shop images
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingShopImage, setUploadingShopImage] = useState(false); // ✅ NEW
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Product management
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductForm | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // ✅ NEW: Product category management
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryOld, setEditingCategoryOld] = useState('');
  const [editingCategoryNew, setEditingCategoryNew] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    loadShop();
  }, [shopId]);

  const loadShop = async () => {
    setLoading(true);
    const result = await getShopById(shopId);
    if (result.success && result.shop) {
      const s = result.shop;
      setShop(s);
      setShopName(s.shop_name);
      setAddress(s.address);
      setLatitude(s.latitude);
      setLongitude(s.longitude);
      setLogoUrl(s.logo_url || '');
      setShopImages(s.shop_images || []); // ✅ NEW: Set shop images
      setWhatsappNumber(s.whatsapp_number || '');
      setProducts(s.products);
      
      // Extract unique categories from products
      const categories = [...new Set(s.products.map(p => p.category).filter(Boolean))] as string[];
      setProductCategories(categories);
    } else {
      toast.error('Shop not found');
      onNavigate('shops');
    }
    setLoading(false);
  };

  const handleSaveShop = async () => {
    if (!shopName.trim() || !address.trim() || !latitude || !longitude) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const result = await updateShop(shopId, {
        shop_name: shopName,
        address,
        latitude,
        longitude,
        logo_url: logoUrl || undefined,
        shop_images: shopImages || undefined, // ✅ NEW: Update shop images
        whatsapp_number: whatsappNumber || undefined,
      });

      if (result.success) {
        toast.success('Shop updated successfully');
      } else {
        toast.error(result.error || 'Failed to update shop');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shop');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const result = await uploadImage(file);
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
    if (!file) return;
    if (shopImages.length >= 3) {
      toast.error('Maximum 3 images per shop');
      return;
    }

    setUploadingShopImage(true);
    try {
      const result = await uploadImage(file);
      if (result.success && result.url) {
        setShopImages([...shopImages, result.url]);
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingShopImage(false);
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (editingProduct.images.length >= 2) {
      toast.error('Maximum 2 images per product');
      return;
    }

    try {
      const result = await uploadImage(file);
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

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.product_name.trim()) {
      toast.error('Enter product name');
      return;
    }
    if (editingProduct.price <= 0) {
      toast.error('Enter valid price');
      return;
    }

    try {
      if (editingProduct.id) {
        // Update existing
        const result = await updateProduct(editingProduct.id, {
          product_name: editingProduct.product_name,
          price: editingProduct.price,
          images: editingProduct.images,
          category: editingProduct.category || null,
        });
        if (result.success) {
          toast.success('Product updated');
          loadShop();
        } else {
          toast.error(result.error || 'Failed to update product');
        }
      } else {
        // Add new
        const result = await addProduct({
          shop_id: shopId,
          product_name: editingProduct.product_name,
          price: editingProduct.price,
          images: editingProduct.images,
          category: editingProduct.category || null,
        });
        if (result.success) {
          toast.success('Product added');
          loadShop();
        } else {
          toast.error(result.error || 'Failed to add product');
        }
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return;

    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success('Product deleted');
        loadShop();
      } else {
        toast.error(result.error || 'Failed to delete product');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  // ✅ NEW: Category management functions
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Enter category name');
      return;
    }
    if (productCategories.includes(newCategoryName.trim())) {
      toast.error('Category already exists');
      return;
    }
    setProductCategories([...productCategories, newCategoryName.trim()]);
    setNewCategoryName('');
    toast.success('Category added');
  };

  const handleRenameCategory = async () => {
    if (!editingCategoryNew.trim()) {
      toast.error('Enter new category name');
      return;
    }
    if (productCategories.includes(editingCategoryNew.trim()) && editingCategoryNew !== editingCategoryOld) {
      toast.error('Category name already exists');
      return;
    }

    // Update all products with this category
    const productsToUpdate = products.filter(p => p.category === editingCategoryOld);
    
    try {
      for (const product of productsToUpdate) {
        await updateProduct(product.id, {
          category: editingCategoryNew.trim(),
        });
      }
      
      // Update local state
      setProductCategories(
        productCategories.map(c => c === editingCategoryOld ? editingCategoryNew.trim() : c)
      );
      setEditingCategoryOld('');
      setEditingCategoryNew('');
      toast.success('Category renamed');
      loadShop();
    } catch (error) {
      toast.error('Failed to rename category');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Delete category "${categoryName}"? Products will be moved to "Uncategorized".`)) return;

    // Update all products with this category to null
    const productsToUpdate = products.filter(p => p.category === categoryName);
    
    try {
      for (const product of productsToUpdate) {
        await updateProduct(product.id, {
          category: null,
        });
      }
      
      // Update local state
      setProductCategories(productCategories.filter(c => c !== categoryName));
      toast.success('Category deleted');
      loadShop();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleMoveProduct = async (productId: string, newCategory: string | null) => {
    try {
      const result = await updateProduct(productId, {
        category: newCategory,
      });
      if (result.success) {
        toast.success('Product moved');
        loadShop();
      } else {
        toast.error('Failed to move product');
      }
    } catch (error) {
      toast.error('Failed to move product');
    }
  };

  // Get products grouped by category
  const getProductsByCategory = () => {
    const grouped: { [key: string]: ShopProduct[] } = {
      'Uncategorized': products.filter(p => !p.category),
    };
    
    productCategories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat);
    });
    
    return grouped;
  };

  // Filter products based on selected category
  const getFilteredProducts = () => {
    if (selectedCategoryFilter === null) {
      return products; // Show all
    }
    if (selectedCategoryFilter === 'Uncategorized') {
      return products.filter(p => !p.category);
    }
    return products.filter(p => p.category === selectedCategoryFilter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  const productsByCategory = getProductsByCategory();
  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="shops" />

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          initialLat={latitude || globalLat || 0}
          initialLng={longitude || globalLng || 0}
          onSelect={(lat, lng, city, area) => {
            setLatitude(lat);
            setLongitude(lng);
            setLocationCity(city);
            setLocationArea(area);
            setShowLocationSelector(false);
            toast.success('Location updated');
          }}
          onCancel={() => setShowLocationSelector(false)}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Manage Categories</h3>
                <button
                  onClick={() => setShowCategoryManager(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Add New Category */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors font-medium text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {productCategories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No categories yet</p>
              ) : (
                productCategories.map((cat) => (
                  <div key={cat} className="border border-gray-200 rounded-lg p-3">
                    {editingCategoryOld === cat ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingCategoryNew}
                          onChange={(e) => setEditingCategoryNew(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleRenameCategory}
                            className="flex-1 px-3 py-1.5 bg-[#CDFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategoryOld('');
                              setEditingCategoryNew('');
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-black">{cat}</div>
                          <div className="text-xs text-gray-500">
                            {productsByCategory[cat]?.length || 0} products
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCategoryOld(cat);
                              setEditingCategoryNew(cat);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-3 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Profile
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">Edit Shop</h1>

        {/* Shop Details Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">Shop Details</h2>
          
          <div className="space-y-4">
            <InputField
              label="Shop Name"
              value={shopName}
              onChange={setShopName}
              placeholder="e.g., Ram Mobile Shop"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Address *
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full address with landmarks"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              />
            </div>

            {/* Location Preview with Selector Button (same as RegisterShopScreen) */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#CDFF00] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-black">
                    {locationArea && locationCity
                      ? `${locationArea}, ${locationCity}`
                      : latitude && longitude
                      ? 'Location set'
                      : 'No location set'}
                  </div>
                  {address && (
                    <div className="text-xs text-gray-500 mt-1">{address}</div>
                  )}
                </div>
                <button
                  onClick={() => setShowLocationSelector(true)}
                  className="px-4 py-2 bg-[#CDFF00] text-black text-sm rounded-lg hover:bg-[#B8E600] transition-colors font-medium"
                >
                  {latitude && longitude ? 'Update Location' : 'Set Location'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Logo
              </label>
              {logoUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setLogoUrl('')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#CDFF00] transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploadingLogo ? 'Uploading...' : 'Click to upload logo'}
                    </p>
                  </div>
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Images (Max 3)
              </label>
              <div className="flex gap-3">
                {shopImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full rounded object-cover" />
                    <button
                      onClick={() =>
                        setShopImages(
                          shopImages.filter((_, i) => i !== idx),
                        )
                      }
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {shopImages.length < 3 && (
                  <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-[#CDFF00] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleShopImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-gray-400" />
                  </label>
                )}
              </div>
            </div>

            <InputField
              label="WhatsApp Number (with country code)"
              value={whatsappNumber}
              onChange={setWhatsappNumber}
              placeholder="e.g., 919876543210"
            />

            <button
              onClick={handleSaveShop}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-[#CDFF00] rounded-xl hover:bg-gray-900 transition-colors font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Shop Details'}
            </button>
          </div>
        </div>

        {/* Products Management with Categories */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Products</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCategoryManager(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FolderPlus className="w-5 h-5" />
                Manage Categories
              </button>
              <button
                onClick={() => {
                  setEditingProduct({ product_name: '', price: 0, images: [], category: selectedCategoryFilter });
                  setShowProductForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {productCategories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategoryFilter === null
                    ? 'bg-[#CDFF00] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('Uncategorized')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategoryFilter === 'Uncategorized'
                    ? 'bg-[#CDFF00] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Uncategorized ({productsByCategory['Uncategorized']?.length || 0})
              </button>
              {productCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategoryFilter === cat
                      ? 'bg-[#CDFF00] text-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat} ({productsByCategory[cat]?.length || 0})
                </button>
              ))}
            </div>
          )}

          {/* Product Form */}
          {showProductForm && editingProduct && (
            <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="font-bold text-black mb-4">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <div className="space-y-4">
                <InputField
                  label="Product Name"
                  value={editingProduct.product_name}
                  onChange={(value) =>
                    setEditingProduct({ ...editingProduct, product_name: value })
                  }
                  placeholder="e.g., iPhone 14"
                />
                <InputField
                  label="Price (₹)"
                  type="number"
                  value={editingProduct.price.toString()}
                  onChange={(value) =>
                    setEditingProduct({ ...editingProduct, price: parseFloat(value) || 0 })
                  }
                  placeholder="e.g., 50000"
                />
                
                {/* Category Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category (Optional)
                  </label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value || null })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                  >
                    <option value="">Uncategorized</option>
                    {productCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images (Max 2)
                  </label>
                  <div className="flex gap-3">
                    {editingProduct.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20">
                        <img src={img} alt="" className="w-full h-full rounded object-cover" />
                        <button
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              images: editingProduct.images.filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {editingProduct.images.length < 2 && (
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-[#CDFF00] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="hidden"
                        />
                        <Upload className="w-6 h-6 text-gray-400" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProduct}
                    className="flex-1 px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors font-medium"
                  >
                    {editingProduct.id ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products List */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-3">
                    {product.category && (
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {product.category}
                      </div>
                    )}
                    <h3 className="font-bold text-black text-sm mb-1 line-clamp-2">
                      {product.product_name}
                    </h3>
                    <p className="text-lg font-bold text-black mb-3">
                      ₹{product.price.toLocaleString()}
                    </p>
                    
                    {/* Move to Category Dropdown */}
                    {productCategories.length > 0 && (
                      <div className="mb-2">
                        <select
                          value={product.category || ''}
                          onChange={(e) => handleMoveProduct(product.id, e.target.value || null)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded hover:border-[#CDFF00] focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                          title="Move to category"
                        >
                          <option value="">Uncategorized</option>
                          {productCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct({
                            id: product.id,
                            product_name: product.product_name,
                            price: product.price,
                            images: product.images || [],
                            category: product.category,
                          });
                          setShowProductForm(true);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-black rounded hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              {selectedCategoryFilter
                ? `No products in "${selectedCategoryFilter}"`
                : 'No products yet. Add your first product above.'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}