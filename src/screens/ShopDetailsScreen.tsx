// =====================================================
// SHOP DETAILS SCREEN - 2026 UI REDESIGN
// =====================================================
// Clean, tight design with Google Maps, compact carousel, clickable product images

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, MessageCircle, Package, ExternalLink, Clock, Navigation, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getShopById, type ShopWithProducts } from '../services/shops';
import { PRODUCT_CATEGORIES } from '../services/productCategories';
import { getCurrentUser } from '../services/authHelpers';
import { toast } from 'sonner';

interface ShopDetailsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  shopId: string;
  slug?: string;
}

// Helper function to check if shop is currently open
function isShopOpenNow(weekTimings: any[] | null): { isOpen: boolean; status: string } {
  if (!weekTimings || weekTimings.length !== 7) {
    return { isOpen: false, status: 'Hours not set' };
  }

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

  const todayTiming = weekTimings.find((t: any) => t.day === currentDay);
  
  if (!todayTiming || !todayTiming.isOpen) {
    return { isOpen: false, status: 'Closed today' };
  }

  // Parse open and close times
  const [openHour, openMin] = todayTiming.openTime.split(':').map(Number);
  const [closeHour, closeMin] = todayTiming.closeTime.split(':').map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  if (currentTime >= openMinutes && currentTime <= closeMinutes) {
    return { isOpen: true, status: `Open until ${todayTiming.closeTime}` };
  } else if (currentTime < openMinutes) {
    return { isOpen: false, status: `Opens at ${todayTiming.openTime}` };
  } else {
    return { isOpen: false, status: `Closed (opens tomorrow)` };
  }
}

export function ShopDetailsScreen({ onNavigate, shopId, slug }: ShopDetailsScreenProps) {
  const [shop, setShop] = useState<ShopWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showWorkingHours, setShowWorkingHours] = useState(false); // ✅ Working hours collapse state
  const [expandedProductCategories, setExpandedProductCategories] = useState<string[]>([]); // ✅ Product categories collapse state

  useEffect(() => {
    checkAuth();
    loadShop();
  }, [shopId]);

  const checkAuth = async () => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);
  };

  const loadShop = async () => {
    setLoading(true);
    const result = await getShopById(shopId);
    if (result.success && result.shop) {
      setShop(result.shop);
      // ✅ Auto-expand all product categories on load
      const categories = [...new Set(result.shop.products.map(p => p.category || 'Uncategorized'))];
      setExpandedProductCategories(categories);
    } else {
      toast.error('Shop not found');
      onNavigate('shops');
    }
    setLoading(false);
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      onNavigate('login', { returnTo: 'shop-details', returnData: { shopId, slug } });
      return;
    }
    onNavigate('chat', { recipientId: shop?.user_id });
  };

  const handleWhatsApp = () => {
    if (!isAuthenticated) {
      onNavigate('login', { returnTo: 'shop-details', returnData: { shopId, slug } });
      return;
    }
    if (!shop?.whatsapp_number) {
      toast.error('WhatsApp number not available');
      return;
    }
    const message = encodeURIComponent(`Hi, I'm interested in your shop "${shop.shop_name}" on LocalFelo`);
    window.open(`https://wa.me/${shop.whatsapp_number}?text=${message}`, '_blank');
  };

  const handleNavigate = () => {
    if (!shop) return;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
    window.open(googleMapsUrl, '_blank');
  };

  const openImageModal = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const allImages = shop ? [
    ...(shop.logo_url ? [shop.logo_url] : []),
    ...(shop.shop_image_url ? [shop.shop_image_url] : []),
    ...(shop.gallery_images || [])
  ] : [];

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(allImages[newIndex]);
    } else {
      const newIndex = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(allImages[newIndex]);
    }
  };

  // Group products by category
  const groupedProducts = shop?.products.reduce((acc, product) => {
    const categoryKey = product.category || 'Uncategorized';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(product);
    return acc;
  }, {} as Record<string, typeof shop.products>) || {};

  const sortedCategoryKeys = Object.keys(groupedProducts).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

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

  const shopStatus = isShopOpenNow(shop.week_timings);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      <Header onNavigate={onNavigate} currentScreen="shops" />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('shops')}
          className="flex items-center gap-2 text-black mb-3 transition-colors hover:opacity-70 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shops
        </button>

        {/* Shop Header - Compact */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Compact Image Carousel */}
            {allImages.length > 0 && (
              <div className="flex-shrink-0 w-full sm:w-32 md:w-40">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={allImages[0]}
                    alt={shop.shop_name}
                    onClick={() => openImageModal(allImages[0], 0)}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  />
                </div>
                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
                    {allImages.slice(1, 4).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => openImageModal(img, idx + 1)}
                        className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-200 hover:border-[#CDFF00] transition-colors"
                      >
                        <img src={img} alt={`${idx + 2}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {allImages.length > 4 && (
                      <button
                        onClick={() => openImageModal(allImages[4], 4)}
                        className="w-10 h-10 rounded bg-gray-900/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      >
                        +{allImages.length - 4}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Shop Info - Tight Spacing */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">{shop.shop_name}</h1>

              {/* Open/Closed Status */}
              {shop.week_timings && (
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${shopStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${shopStatus.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                    {shopStatus.status}
                  </span>
                </div>
              )}

              {/* Location - Compact with Navigate Button */}
              <div className="flex items-start gap-2 mb-3 p-2.5 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-2">{shop.address}</p>
                </div>
                <button
                  onClick={handleNavigate}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#CDFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors text-xs font-bold flex-shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Navigate</span>
                </button>
              </div>

              {/* Categories - Compact */}
              {shop.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {shop.categories.slice(0, 3).map((cat, idx) => {
                    const category = PRODUCT_CATEGORIES.find(c => c.id === cat.category_id);
                    return (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                      >
                        {category?.emoji} {category?.name}
                      </span>
                    );
                  })}
                  {shop.categories.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      +{shop.categories.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Contact Buttons - Compact */}
              <div className="flex gap-2">
                <button
                  onClick={handleChat}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors font-bold text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                {shop.whatsapp_number && (
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors font-bold text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours - Collapsible with Arrows */}
        {shop.week_timings && shop.week_timings.length === 7 && (
          <div className="bg-white rounded-xl shadow-sm mb-4">
            <button
              onClick={() => setShowWorkingHours(!showWorkingHours)}
              className="w-full cursor-pointer px-4 py-3 font-bold text-black flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Working Hours
              </div>
              {showWorkingHours ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {showWorkingHours && (
              <div className="px-4 pb-3 space-y-1.5">
                {shop.week_timings.map((timing: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">{timing.day}</span>
                    {timing.isOpen ? (
                      <span className="text-gray-600">
                        {timing.openTime} - {timing.closeTime}
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products - Collapsible Categories with Arrows */}
        {shop.products.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black px-1 mb-4">Products ({shop.products.length})</h2>
            
            {sortedCategoryKeys.map((categoryKey) => {
              const isExpanded = expandedProductCategories.includes(categoryKey);
              const toggleCategory = () => {
                setExpandedProductCategories(prev =>
                  prev.includes(categoryKey)
                    ? prev.filter(c => c !== categoryKey)
                    : [...prev, categoryKey]
                );
              };

              return (
                <div key={categoryKey} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Category Header - Collapsible */}
                  <button
                    onClick={toggleCategory}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      <h3 className="text-base font-bold text-black">
                        {categoryKey} ({groupedProducts[categoryKey].length})
                      </h3>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {/* Products Grid */}
                  {isExpanded && (
                    <div className="p-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                        {groupedProducts[categoryKey].map((product) => (
                          <div
                            key={product.id}
                            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                          >
                            {/* Compact Product Image */}
                            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.product_name}
                                  onClick={() => openImageModal(product.images[0], allImages.length)}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {/* Product Info - Minimal */}
                            <div className="p-2">
                              <p className="text-xs font-bold text-black line-clamp-2 mb-1">
                                {product.product_name}
                              </p>
                              <p className="text-sm font-bold text-green-600">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No products listed yet</p>
          </div>
        )}
      </main>

      {/* Full-Screen Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}