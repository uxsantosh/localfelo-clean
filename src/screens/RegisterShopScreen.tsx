// =====================================================
// REGISTER SHOP SCREEN - 4-STEP FLOW (NO PRODUCTS)
// =====================================================
// Streamlined shop registration: Name → Categories → Location/Timings → Images/Contact
// Products can be added later via Manage Shops

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Upload, X, Check, Store, MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductCategorySelector } from '../components/ProductCategorySelector';
import { LocationSelector } from '../components/LocationSelector';
import { WeekTimingsEditor, DayTiming } from '../components/WeekTimingsEditor';
import { createShop } from '../services/shops';
import { uploadImage } from '../services/avatarUpload';
import { getCurrentUser } from '../services/authHelpers';
import { PRODUCT_CATEGORIES } from '../services/productCategories';
import { toast } from 'sonner@2.0.3';

interface RegisterShopScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  globalLat?: number;
  globalLng?: number;
  globalCity?: string;
  globalArea?: string;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-black mb-2">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
      />
    </div>
  );
}

export function RegisterShopScreen({ 
  onNavigate,
  globalLat,
  globalLng,
  globalCity,
  globalArea,
}: RegisterShopScreenProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Step 1: Shop Name
  const [shopName, setShopName] = useState('');

  // Step 2: Categories
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Step 3: Location & Timings
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [locationCity, setLocationCity] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [weekTimings, setWeekTimings] = useState<DayTiming[]>([]);

  // Step 4: Images & WhatsApp (Optional)
  const [logoUrl, setLogoUrl] = useState('');
  const [shopImages, setShopImages] = useState<string[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingShopImage, setUploadingShopImage] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Auto-fill WhatsApp from user's phone number
      if (currentUser.phone_number) {
        const phoneStr = String(currentUser.phone_number);
        // Remove +91 prefix if exists
        const cleaned = phoneStr.replace(/^\+91/, '').replace(/\D/g, '');
        if (cleaned.length === 10) {
          setWhatsappNumber(cleaned);
        }
      }
    } else {
      toast.error('Please login to register a shop');
      onNavigate('phone-auth');
    }
  }, [onNavigate]);

  useEffect(() => {
    if (globalLat && globalLng) {
      setLatitude(globalLat);
      setLongitude(globalLng);
      setLocationCity(globalCity || '');
      setLocationArea(globalArea || '');
      // ✅ NEW: Set a default address if available from global location
      if (globalArea && globalCity && !address) {
        setAddress(`${globalArea}, ${globalCity}`);
      }
    }
  }, [globalLat, globalLng, globalCity, globalArea]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (!file) return;

    setUploadingShopImage(true);
    try {
      const result = await uploadImage(file, user.id);
      if (result.success && result.url) {
        setShopImages(prev => [...prev, result.url]);
        toast.success('Shop image uploaded');
      } else {
        toast.error('Failed to upload shop image');
      }
    } catch (error) {
      toast.error('Failed to upload shop image');
    } finally {
      setUploadingShopImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!shopName.trim()) {
      toast.error('Enter shop name');
      return;
    }
    if (selectedCategoryIds.length === 0) {
      toast.error('Select at least one category');
      return;
    }
    if (!address.trim() || !latitude || !longitude) {
      toast.error('Complete location details');
      return;
    }

    setLoading(true);
    try {
      // Build categories array
      const categories: Array<{ category_id: string; subcategory_id?: string }> = [];
      
      // Add all selected subcategories
      selectedSubcategoryIds.forEach(subId => {
        const category = PRODUCT_CATEGORIES.find(c => 
          c.subcategories.some(s => s.id === subId)
        );
        if (category) {
          categories.push({
            category_id: category.id,
            subcategory_id: subId,
          });
        }
      });
      
      // Add main categories that don't have subcategories selected
      selectedCategoryIds.forEach(catId => {
        const category = PRODUCT_CATEGORIES.find(c => c.id === catId);
        const hasSubcategoriesSelected = category?.subcategories.some(s => 
          selectedSubcategoryIds.includes(s.id)
        );
        
        if (!hasSubcategoriesSelected) {
          categories.push({ category_id: catId });
        }
      });

      // Validate and format WhatsApp number (10 digits)
      let formattedWhatsApp = '';
      if (whatsappNumber) {
        const cleaned = whatsappNumber.replace(/\D/g, '');
        if (cleaned.length === 10) {
          formattedWhatsApp = `+91${cleaned}`;
        } else {
          toast.error('WhatsApp number must be 10 digits');
          setLoading(false);
          return;
        }
      }

      // Create shop with timings
      const shopResult = await createShop({
        shop_name: shopName,
        address,
        latitude,
        longitude,
        categories,
        logo_url: logoUrl || undefined,
        whatsapp_number: formattedWhatsApp || undefined,
        week_timings: weekTimings.length === 7 ? weekTimings : undefined,
        shop_images: shopImages.length > 0 ? shopImages : undefined,
      });

      if (!shopResult.success || !shopResult.shop_id) {
        throw new Error(shopResult.error || 'Failed to create shop');
      }

      // Show success banner
      setShowSuccessBanner(true);
      toast.success('Shop registered successfully!');
      
      // Auto-navigate after 5 seconds
      setTimeout(() => {
        onNavigate('shops');
      }, 5000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to register shop');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return shopName.trim().length > 0;
      case 2:
        return selectedCategoryIds.length > 0;
      case 3:
        return address.trim() && latitude && longitude;
      case 4:
        return true; // Step 4 is optional
      default:
        return false;
    }
  };

  const getSelectedCategoriesDisplay = () => {
    const mainCount = selectedCategoryIds.length;
    const subCount = selectedSubcategoryIds.length;
    
    if (mainCount === 0) return 'Tap to select categories';
    if (subCount > 0) return `${mainCount} categories, ${subCount} subcategories`;
    return `${mainCount} ${mainCount === 1 ? 'category' : 'categories'}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Success State with Banner
  if (showSuccessBanner) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28 sm:pb-8">
        <Header onNavigate={onNavigate} currentPage="shops" />

        <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-[#CDFF00] rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-black" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
              🎉 Congratulations!
            </h1>

            <p className="text-lg text-gray-700 mb-6">
              Your shop <strong>{shopName}</strong> has been registered successfully!
            </p>

            {/* Yellow Banner with Instructions */}
            <div className="bg-[#CDFF00] rounded-xl p-4 sm:p-6 mb-6 text-left">
              <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Next Steps
              </h3>
              <p className="text-sm text-black mb-3">
                To add products and update opening/closing timings:
              </p>
              <ol className="text-sm text-black space-y-1 list-decimal list-inside">
                <li>Go to <strong>Manage Shops</strong> from the Shops tab</li>
                <li>Click <strong>Edit</strong> on your shop</li>
                <li>Add products, update timings, and manage your shop details</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('shops')}
                className="flex-1 btn-primary"
              >
                View All Shops
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="flex-1 px-4 py-3 bg-white border-2 border-black text-black rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Manage My Shops
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Redirecting to Shops in 5 seconds...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-8">
      <Header onNavigate={onNavigate} currentPage="shops" />

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('shops')}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-3 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shops
        </button>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    s < step
                      ? 'bg-[#CDFF00] text-black'
                      : s === step
                      ? 'bg-black text-[#CDFF00]'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 w-12 sm:w-16 md:w-24 mx-1 sm:mx-2 transition-colors ${
                      s < step ? 'bg-[#CDFF00]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Shop Name</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">What's your shop called?</p>
              <InputField
                label="Shop Name"
                value={shopName}
                onChange={setShopName}
                placeholder="e.g., Ram Mobile Shop, Shyam Electronics"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Categories</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Select all product categories your shop sells
              </p>
              
              <button
                onClick={() => setShowCategorySelector(true)}
                className="w-full p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#CDFF00] hover:bg-[#CDFF00]/5 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-black mb-1">
                      {getSelectedCategoriesDisplay()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedCategoryIds.length > 0 ? 'Tap to modify' : 'Select categories and subcategories'}
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#CDFF00] transition-colors" />
                </div>
              </button>

              {/* Selected Categories Display */}
              {selectedCategoryIds.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedCategoryIds.map(catId => {
                    const category = PRODUCT_CATEGORIES.find(c => c.id === catId);
                    if (!category) return null;
                    
                    const selectedSubs = category.subcategories.filter(s => 
                      selectedSubcategoryIds.includes(s.id)
                    );

                    return (
                      <div key={catId} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-black flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span>{category.name}</span>
                        </div>
                        {selectedSubs.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {selectedSubs.map(sub => (
                              <span key={sub.id} className="px-2 py-1 bg-white text-gray-700 text-xs rounded-md">
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Location & Timings</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Where is your shop located and when is it open?
                </p>

                {/* Location */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowLocationSelector(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#CDFF00] hover:bg-[#CDFF00]/5 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 text-left">
                      <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-black mb-1">
                          {address || 'Tap to set location'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {locationArea && locationCity ? `${locationArea}, ${locationCity}` : 'Select your shop location'}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 px-3 py-1.5 bg-[#CDFF00] text-black text-sm font-bold rounded-lg">
                      Update
                    </div>
                  </button>
                </div>

                {/* Week Timings */}
                <WeekTimingsEditor
                  initialTimings={weekTimings}
                  onChange={setWeekTimings}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Images & Contact</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Add shop images and confirm your WhatsApp number (all optional)
              </p>

              {/* Shop Logo */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-black mb-2">Shop Logo</label>
                {logoUrl ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setLogoUrl('')}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#CDFF00] hover:bg-[#CDFF00]/5 transition-all">
                    {uploadingLogo ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-2">Upload</span>
                      </>
                    )}
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

              {/* Shop Images */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-black mb-2">
                  Shop Images <span className="text-xs text-gray-500 font-normal">(Up to 5 images)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {shopImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={url} alt={`Shop ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setShopImages(shopImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {shopImages.length < 5 && (
                    <label className="aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#CDFF00] hover:bg-[#CDFF00]/5 transition-all flex flex-col items-center justify-center">
                      {uploadingShopImage ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-2">Add Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleShopImageUpload}
                        className="hidden"
                        disabled={uploadingShopImage}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* WhatsApp Number */}
              <InputField
                label="WhatsApp Number"
                value={whatsappNumber}
                onChange={setWhatsappNumber}
                placeholder="10-digit number"
                type="tel"
              />
              <p className="text-xs text-gray-500 mt-1">
                {user?.phone_number && 'Auto-filled from your account. You can edit if different.'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-black rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Shop...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </main>

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <ProductCategorySelector
          selectedCategories={selectedCategoryIds}
          selectedSubcategories={selectedSubcategoryIds}
          onCategoryToggle={(categoryId) => {
            setSelectedCategoryIds(prev => 
              prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
            );
          }}
          onSubcategoryToggle={(categoryId, subcategoryId) => {
            // Toggle subcategory
            setSelectedSubcategoryIds(prev => 
              prev.includes(subcategoryId) 
                ? prev.filter(id => id !== subcategoryId)
                : [...prev, subcategoryId]
            );
            
            // Auto-select parent category if not selected
            if (!selectedCategoryIds.includes(categoryId)) {
              setSelectedCategoryIds(prev => [...prev, categoryId]);
            }
          }}
          onClose={() => setShowCategorySelector(false)}
        />
      )}

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          currentLocation={latitude && longitude ? {
            latitude,
            longitude,
            city: locationCity
          } : null}
          onLocationSelect={(data) => {
            setAddress(data.address);
            setLatitude(data.latitude);
            setLongitude(data.longitude);
            setLocationCity(data.city || '');
            setLocationArea(data.locality || data.address.split(',')[0] || '');
            setShowLocationSelector(false);
          }}
          onClose={() => setShowLocationSelector(false)}
        />
      )}
    </div>
  );
}