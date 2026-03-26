// =====================================================
// Create Wish Screen - 3-STEP WIZARD
// Step 1: Description & Category | Step 2: Budget & Timeline | Step 3: Location & Address
// =====================================================

import { ArrowLeft, Sparkles, Calendar, MapPin, AlertCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react'; // ✅ ADD: useState and useEffect imports
import { Header } from '../components/Header';
import { LocationSelector } from '../components/LocationSelector';
import { DateTimeSelector, dateTimeSelectorToTimeWindow, timeWindowToDateTimeSelector } from '../components/DateTimeSelector';
import { MarketplaceCategorySelector } from '../components/MarketplaceCategorySelector'; // ✅ FIX: Use single-select version
import { Stepper } from '../components/Stepper';
import { createWish, editWish } from '../services/wishes';
import { createWishChatThread } from '../services/chat';
import { getCurrentUser } from '../services/auth';
import { City, Wish } from '../types';
import { getWishCategories, Category } from '../services/categories';
import { useLocation, UserLocation } from '../hooks/useLocation';
import { fireConfetti } from '../utils/confetti';
import { validateTaskContent } from '../services/contentModeration';
import { PRODUCT_CATEGORIES } from '../services/productCategories'; // ✅ FIX: Import instead of require

// Helper function to sanitize location IDs (convert invalid IDs to null)
const sanitizeLocationId = (id: string | null | undefined): string | null => {
  // If empty or undefined, return null
  if (!id || id === 'auto-detected' || id === 'undefined' || id === 'null') {
    return null;
  }
  
  // Check if it's a valid UUID format (8-4-4-4-12 characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    // Not a valid UUID, return null instead of invalid string
    return null;
  }
  
  return id;
};

interface CreateWishScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  unreadCount: number;
  cities: City[];
  editMode?: boolean;
  wishId?: string;
  wish?: Wish;
}

export function CreateWishScreen({
  onBack,
  onSuccess,
  onNavigate,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount,
  cities,
  editMode,
  wishId,
  wish,
}: CreateWishScreenProps) {
  const [user, setUser] = useState<any>(null);
  
  // ✅ STEP STATE
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // ✅ Load user asynchronously on mount
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);
  
  const { location: globalLocation, updateLocation } = useLocation(user?.id || null);
  
  const [loading, setLoading] = useState(false);
  const [wishText, setWishText] = useState(wish?.description || '');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false); // ✅ ADD: Modal state
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentErrors, setContentErrors] = useState<string[]>([]);
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);
  
  // Main fields
  const [budget, setBudget] = useState(wish?.budgetMax ? String(wish.budgetMax) : wish?.budgetMin ? String(wish.budgetMin) : '');
  const [dateTimeValue, setDateTimeValue] = useState<{
    option: 'anytime' | 'today' | 'custom';
    customDate?: string;
    time?: string;
    timeOption?: 'anytime' | 'specific';
  }>({ option: 'anytime' });
  
  // Optional fields
  const [selectedCategory, setSelectedCategory] = useState<string | number>(wish?.categoryId || '');
  const [userAddress, setUserAddress] = useState(wish?.address || ''); // User's specific address input

  // ✅ NEW: Product category fields (for buy/rent wishes)
  const [productCategoryId, setProductCategoryId] = useState<string>('');
  const [productSubcategoryId, setProductSubcategoryId] = useState<string>('');
  const [productName, setProductName] = useState<string>('');

  // Real-time content validation for wish text
  const handleWishTextChange = (value: string) => {
    setWishText(value);
    
    if (value.trim().length > 10) {
      const validation = validateTaskContent(value, '');
      setContentErrors(validation.errors);
      setContentWarnings(validation.warnings);
    } else {
      setContentErrors([]);
      setContentWarnings([]);
    }
  };

  // ✅ NEW: Handle product category selection
  const handleProductCategorySelect = (categoryId: string, subcategoryId?: string, customProductName?: string) => {
    setProductCategoryId(categoryId);
    setProductSubcategoryId(subcategoryId || '');
    setProductName(customProductName || '');
  };

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getWishCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Initialize form with wish data when in edit mode
  useEffect(() => {
    if (editMode && wish) {
      setWishText(wish.description || '');
      setBudget(wish.budget?.toString() || '');
      setUserAddress(wish.address || '');
      setDateTimeValue(timeWindowToDateTimeSelector(wish.timeWindow));
      setSelectedCategory(wish.categoryId?.toString() || '');
      
      // ✅ Load product category data if available
      if (wish.subcategoryId) {
        // Extract category ID from subcategory ID
        setProductSubcategoryId(wish.subcategoryId);
        // You might need to load the parent category ID here
      }
      if (wish.productName) {
        setProductName(wish.productName);
      }
      
      // Only update if global location is not already set or is different
      if (!globalLocation?.latitude || !globalLocation?.longitude) {
        const locationData: UserLocation = {
          cityId: null,
          city: wish.city || '',
          areaId: wish.area || wish.city,
          area: wish.area || wish.city,
          latitude: wish.latitude,
          longitude: wish.longitude,
          address: wish.address || '',
          locality: wish.area,
          state: '',
          pincode: '',
        };
        updateLocation(locationData);
        console.log('📍 [CreateWishScreen] Initialized location from wish data:', locationData);
      }
    }
  }, [editMode, wish]);

  // AI Suggestions
  const getSuggestedCategory = () => {
    const text = wishText.toLowerCase();
    if (text.includes('buy') || text.includes('purchase')) return 'buy-something';
    if (text.includes('rent') || text.includes('lease')) return 'rent-something';
    if (text.includes('used') || text.includes('second hand')) return 'find-used';
    if (text.includes('service') || text.includes('professional')) return 'find-service';
    if (text.includes('help') || text.includes('need someone')) return 'find-help';
    if (text.includes('deal') || text.includes('cheap')) return 'find-deal';
    return null;
  };

  const getSuggestedBudget = () => {
    const text = wishText.toLowerCase();
    if (text.includes('bike') || text.includes('scooter')) return '50000';
    if (text.includes('car')) return '300000';
    if (text.includes('phone') || text.includes('mobile')) return '20000';
    if (text.includes('laptop')) return '40000';
    if (text.includes('furniture')) return '15000';
    return '';
  };

  const applyAISuggestions = () => {
    const suggestedCat = getSuggestedCategory();
    const suggestedBudget = getSuggestedBudget();
    
    if (suggestedCat && !selectedCategory) {
      setSelectedCategory(String(suggestedCat));
      toast.success('Category suggested!');
    }
    if (suggestedBudget && !budget) {
      setBudget(suggestedBudget);
      toast.success('Budget suggested!');
    }
  };

  const handleLocationSave = async (newLocation: UserLocation) => {
    await updateLocation(newLocation);
    setShowLocationSelector(false);
  };

  // ✅ STEP VALIDATION
  const canProceedToStep2 = () => {
    if (!wishText.trim()) {
      toast.error('Please tell us what you are looking for');
      return false;
    }
    if (contentErrors.length > 0) {
      toast.error('Please fix content errors before continuing');
      return false;
    }
    if (!productSubcategoryId) {
      toast.error('Please select a product category');
      return false;
    }
    return true;
  };

  const canProceedToStep3 = () => {
    // Budget and date/time are optional
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2 && canProceedToStep3()) {
      setCurrentStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final Validation
    if (!wishText.trim()) {
      toast.error('Please tell us what you are looking for');
      setCurrentStep(1);
      return;
    }

    if (!productSubcategoryId) {
      toast.error('Please select a product category');
      setCurrentStep(1);
      return;
    }

    if (!globalLocation || !globalLocation.latitude || !globalLocation.longitude) {
      toast.error('Please set your location first');
      setCurrentStep(3);
      return;
    }

    if (!user) {
      toast.error('Please login to post a wish');
      return;
    }

    setLoading(true);

    try {
      const lines = wishText.trim().split('\n');
      const title = lines[0].slice(0, 50);
      const description = lines.length > 1 ? lines.slice(1).join('\n').trim() : wishText.trim();

      const wishLatitude = globalLocation.latitude;
      const wishLongitude = globalLocation.longitude;

      // Validate content
      const contentValidationResult = validateTaskContent(title, description);
      if (!contentValidationResult.isValid) {
        const errorMessage = contentValidationResult.errors.join(', ');
        throw new Error(errorMessage || 'Content validation failed');
      }

      if (editMode && wishId) {
        const result = await editWish(wishId, {
          title,
          description,
          categoryId: selectedCategory ? (typeof selectedCategory === 'number' ? selectedCategory : parseInt(selectedCategory as string)) : undefined,
          categoryIds: productCategoryId ? [productCategoryId] : undefined, // ✅ NEW: Array format
          subcategoryIds: productSubcategoryId ? [productSubcategoryId] : undefined, // ✅ NEW: Array format
          budgetMin: budget ? parseFloat(budget) : undefined,
          budgetMax: budget ? parseFloat(budget) : undefined,
          urgency: 'flexible',
          latitude: wishLatitude,
          longitude: wishLongitude,
          address: userAddress.trim(),
          phone: '',
          whatsapp: '',
          hasWhatsapp: false,
          subcategoryId: productSubcategoryId || undefined,
          productName: productName || undefined,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to update wish');
        }

        toast.success('Wish updated successfully!');
        onNavigate('wish-detail', { wishId });
      } else {
        const result = await createWish({
          title,
          description,
          categoryId: selectedCategory ? (typeof selectedCategory === 'number' ? selectedCategory : parseInt(selectedCategory as string)) : (categories[0]?.id || 1),
          categoryIds: productCategoryId ? [productCategoryId] : undefined, // ✅ NEW: Array format for precise matching
          subcategoryIds: productSubcategoryId ? [productSubcategoryId] : undefined, // ✅ NEW: Array format for precise matching
          cityId: sanitizeLocationId(globalLocation.cityId),
          areaId: sanitizeLocationId(globalLocation.areaId),
          cityName: globalLocation.city,
          areaName: globalLocation.area || globalLocation.city,
          budgetMin: budget ? parseFloat(budget) : undefined,
          budgetMax: budget ? parseFloat(budget) : undefined,
          urgency: 'flexible',
          latitude: wishLatitude,
          longitude: wishLongitude,
          address: userAddress.trim(),
          phone: '',
          whatsapp: '',
          hasWhatsapp: false,
          subcategoryId: productSubcategoryId || undefined,
          productName: productName || undefined,
        });

        if (!result.success || !result.wishId) {
          throw new Error(result.error || 'Failed to create wish');
        }

        const chatResult = await createWishChatThread(
          result.wishId,
          title,
          user.id,
          user.name || 'User'
        );

        if (chatResult.error) {
          console.warn('Failed to create chat thread:', chatResult.error);
        }

        toast.success('Wish posted! Chat is ready for responses.');
        fireConfetti();
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to create wish:', error);
      toast.error(error.message || 'Failed to create wish');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Budget' },
    { number: 3, label: 'Location' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={editMode ? "Edit Wish" : "Wish Anything"}
        currentScreen="create"
        showBack={true}
        onBack={onBack}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        showGlobalLocation={true}
        globalLocationArea={globalLocation?.area}
        globalLocationCity={globalLocation?.city}
        onLocationClick={() => setShowLocationSelector(true)}
      />

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Content Area with bottom padding for sticky buttons */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Description & Category */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Main Input */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-semibold mb-3 text-black">
                  <Sparkles className="w-4 h-4 inline mr-1 text-[#CDFF00]" />
                  What are you looking for? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={wishText}
                  onChange={(e) => handleWishTextChange(e.target.value)}
                  placeholder="looking for a laptop under 10k"
                  className={`w-full p-3 border rounded-[6px] focus:outline-none focus:ring-2 transition-colors ${
                    contentErrors.length > 0 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:ring-[#CDFF00]/20'
                  }`}
                  rows={5}
                  disabled={loading}
                />
                
                {/* Content Errors */}
                {contentErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-700 mb-1">Inappropriate Content Detected</p>
                        {contentErrors.map((error, idx) => (
                          <p key={idx} className="text-xs text-red-600 mb-1">• {error}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Warnings */}
                {contentWarnings.length > 0 && contentErrors.length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        {contentWarnings.map((warning, idx) => (
                          <p key={idx} className="text-xs text-yellow-700">• {warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {wishText.length > 20 && !selectedCategory && contentErrors.length === 0 && (
                  <button
                    type="button"
                    onClick={applyAISuggestions}
                    className="mt-2 text-sm text-black hover:text-gray-700 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3 text-[#CDFF00]" />
                    Get AI suggestions
                  </button>
                )}
              </div>

              {/* Product Category Selector */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-semibold mb-3 text-black">
                  📦 Product Category <span className="text-red-500">*</span>
                </label>
                
                {/* Category Selection Button */}
                <button
                  type="button"
                  onClick={() => setShowCategorySelector(true)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${ 
                    productSubcategoryId 
                      ? 'border-[#CDFF00] bg-[#CDFF00]/10' 
                      : 'border-gray-200 hover:border-[#CDFF00]'
                  }`}
                >
                  {productSubcategoryId ? (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-bold text-black">
                          {(() => {
                            // Find the selected category and subcategory names
                            const category = PRODUCT_CATEGORIES.find((c: any) => c.id === productCategoryId);
                            const subcategory = category?.subcategories.find((s: any) => s.id === productSubcategoryId);
                            return category && subcategory ? `${category.emoji} ${category.name} → ${subcategory.name}` : 'Selected';
                          })()}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tap to select category</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 mt-2">
                  💡 Select the category that best matches what you're looking for
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Budget & Timeline */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* When do you need it */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <DateTimeSelector
                  value={dateTimeValue}
                  onChange={setDateTimeValue}
                  disabled={loading}
                />
              </div>

              {/* Budget */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-semibold mb-3 text-black">Budget (Optional)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="10000"
                  className="w-full p-3 border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#CDFF00]/20"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Leave blank for flexible budget
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Location & Address */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-semibold mb-3 text-black">
                  <MapPin className="w-4 h-4 inline mr-1 text-[#CDFF00]" />
                  Location <span className="text-red-500">*</span>
                </label>
                
                {/* Global Location Display (Read-Only, Clickable) */}
                {globalLocation && globalLocation.latitude && globalLocation.longitude ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowLocationSelector(true)}
                      className="w-full p-4 bg-white border-2 border-gray-200 hover:border-[#CDFF00] transition-colors text-left flex items-start justify-between gap-3 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-[#CDFF00] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-bold text-black">
                            {globalLocation.area}, {globalLocation.city}
                          </p>
                        </div>
                        {globalLocation.address && (
                          <p className="text-xs text-gray-600 truncate font-medium">
                            {globalLocation.address}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    </button>
                    <p className="text-xs text-gray-500 font-medium">
                      Tap to change your location
                    </p>

                    {/* Full Address Input */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-black">
                        Full Address (Optional)
                      </label>
                      <textarea
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        placeholder="Building name, floor, street details...&#10;&#10;E.g., Shop #12, 2nd Floor, 8th Cross, 29th Main Road&#10;Above Cafe Coffee Day"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#CDFF00] transition-colors resize-none rounded-lg text-sm"
                        rows={5}
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-2 font-medium">
                        Add specific details like building name, floor, nearby landmarks
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-sm font-bold text-red-600 mb-2">
                      ⚠️ Location Not Set
                    </p>
                    <p className="text-xs text-red-600 mb-3 font-medium">
                      Please set your location from the header first.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowLocationSelector(true)}
                      className="w-full py-2.5 px-4 bg-[#CDFF00] text-black font-bold hover:bg-[#b8e600] transition-colors rounded-lg text-sm"
                    >
                      Set Location Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Sticky Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            {/* Previous Button */}
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-bold text-black hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
            )}

            {/* Next/Submit Button */}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[#CDFF00] rounded-lg text-sm font-bold text-black hover:bg-[#b8e600] disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !wishText.trim() || !productSubcategoryId || !globalLocation?.latitude}
                className="flex-1 px-4 py-3 bg-[#CDFF00] rounded-lg text-sm font-bold text-black hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading 
                  ? (editMode ? 'Updating...' : 'Posting...') 
                  : (editMode ? 'Update Wish' : 'Post Wish')}
              </button>
            )}
          </div>

          {/* Cancel Button (always visible) */}
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-black disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          onLocationSelect={async (location) => {
            const locationData: UserLocation = {
              cityId: sanitizeLocationId(location.cityId),
              city: location.city,
              areaId: null,
              area: location.locality || location.city,
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              locality: location.locality,
              state: location.state,
              pincode: location.pincode,
            };
            await updateLocation(locationData);
            setShowLocationSelector(false);
            toast.success('Location updated!');
          }}
          onClose={() => setShowLocationSelector(false)}
          currentLocation={globalLocation && globalLocation.latitude ? {
            latitude: globalLocation.latitude,
            longitude: globalLocation.longitude,
            city: globalLocation.city,
          } : null}
          title="Set Your Location"
          description="Choose your location to post your wish"
        />
      )}

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <MarketplaceCategorySelector
          selectedCategoryId={productCategoryId || null}
          selectedSubcategoryId={productSubcategoryId || null}
          onSelect={(catId, subId) => {
            setProductCategoryId(catId);
            setProductSubcategoryId(subId);
          }}
          onClose={() => setShowCategorySelector(false)}
        />
      )}
    </div>
  );
}