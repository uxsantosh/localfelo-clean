// =====================================================
// Create Wish Screen - SIMPLIFIED & CHAT-FIRST
// Short, conversational, progressive disclosure
// =====================================================

import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { LocationSelector } from '../components/LocationSelector';
import { DateTimeSelector, dateTimeSelectorToTimeWindow, timeWindowToDateTimeSelector } from '../components/DateTimeSelector';
import { CategorySelector } from '../components/CategorySelector';
import { createWish, editWish } from '../services/wishes';
import { createWishChatThread } from '../services/chat';
import { getCurrentUser } from '../services/auth';
import { City, Wish } from '../types';
import { getWishCategories, Category } from '../services/categories';
import { useLocation, UserLocation } from '../hooks/useLocation';
import { fireConfetti } from '../utils/confetti';

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
  const user = getCurrentUser();
  const { location: globalLocation, updateLocation } = useLocation(user?.id || null);
  
  const [loading, setLoading] = useState(false);
  const [wishText, setWishText] = useState(wish?.description || '');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
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

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getWishCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Initialize location from wish data when in edit mode
  useEffect(() => {
    if (editMode && wish && wish.latitude && wish.longitude) {
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
      toast.success('✨ Category suggested!');
    }
    if (suggestedBudget && !budget) {
      setBudget(suggestedBudget);
      toast.success('✨ Budget suggested!');
    }
  };

  const handleLocationSave = async (newLocation: UserLocation) => {
    await updateLocation(newLocation);
    setShowLocationSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!wishText.trim()) {
      toast.error('Please tell us what you are looking for');
      return;
    }

    if (!globalLocation || !globalLocation.latitude || !globalLocation.longitude) {
      toast.error('Please set your location first');
      return;
    }

    if (!userAddress.trim()) {
      toast.error('Please enter your full address');
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

      if (editMode && wishId) {
        const result = await editWish(wishId, {
          title,
          description,
          categoryId: selectedCategory ? (typeof selectedCategory === 'number' ? selectedCategory : parseInt(selectedCategory as string)) : undefined,
          budgetMin: budget ? parseFloat(budget) : undefined,
          budgetMax: budget ? parseFloat(budget) : undefined,
          urgency: 'flexible',
          latitude: wishLatitude,
          longitude: wishLongitude,
          address: userAddress.trim(),
          phone: '',
          whatsapp: '',
          hasWhatsapp: false,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to update wish');
        }

        toast.success('✅ Wish updated successfully!');
        onNavigate('wish-detail', { wishId });
      } else {
        const result = await createWish({
          title,
          description,
          categoryId: selectedCategory ? (typeof selectedCategory === 'number' ? selectedCategory : parseInt(selectedCategory as string)) : (categories[0]?.id || 1),
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

        toast.success('🎉 Wish posted! Chat is ready for responses.');
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

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">
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

      <div className="page-container max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Input */}
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-sm mb-2 text-muted">
              <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
              What are you looking for?
            </label>
            <textarea
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder="looking for a laptop under 10k"
              className="w-full p-3 border border-border rounded-[6px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={5}
              disabled={loading}
            />
            
            {wishText.length > 20 && !selectedCategory && (
              <button
                type="button"
                onClick={applyAISuggestions}
                className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Get AI suggestions
              </button>
            )}
          </div>

          {/* When do you need it */}
          <DateTimeSelector
            value={dateTimeValue}
            onChange={setDateTimeValue}
            disabled={loading}
          />

          {/* Budget */}
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-sm mb-2 text-muted">Budget (Optional)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="10000"
              className="w-full p-3 border border-border rounded-[6px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2 m-0">
              💡 Leave blank for flexible budget
            </p>
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-sm mb-3 text-muted">Category (Optional)</label>
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategory}
              onCategoryChange={(id) => setSelectedCategory(id)}
            />
          </div>

          {/* Location */}
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-sm mb-2 text-muted">
              <MapPin className="w-4 h-4 inline mr-1 text-primary" />
              Location <span className="text-red-500">*</span>
            </label>
            
            {/* Global Location Display (Read-Only, Clickable) */}
            {globalLocation && globalLocation.latitude && globalLocation.longitude ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(true)}
                  className="w-full p-4 bg-white border-2 border-gray-200 hover:border-[#CDFF00] transition-colors text-left flex items-start justify-between gap-3"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-[#CDFF00] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[15px] text-black" style={{ fontWeight: '700' }}>
                        {globalLocation.area}, {globalLocation.city}
                      </p>
                    </div>
                    {globalLocation.address && (
                      <p className="text-[13px] text-gray-600 truncate" style={{ fontWeight: '500' }}>
                        {globalLocation.address}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
                  Tap to change your location
                </p>

                {/* Full Address Input */}
                <div>
                  <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="Building name, floor, street details...&#10;&#10;E.g., Shop #12, 2nd Floor, 8th Cross, 29th Main Road&#10;Above Cafe Coffee Day"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#CDFF00] transition-colors resize-none"
                    style={{ 
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500',
                      minHeight: '120px'
                    }}
                    rows={5}
                    disabled={loading}
                  />
                  <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
                    Add specific details like building name, floor, nearby landmarks
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border-2 border-red-200" style={{ borderRadius: '8px' }}>
                <p className="text-[14px] text-red-600 mb-3" style={{ fontWeight: '700' }}>
                  ⚠️ Location Not Set
                </p>
                <p className="text-[13px] text-red-600 mb-3" style={{ fontWeight: '500' }}>
                  Please set your location from the header first.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(true)}
                  className="w-full py-2.5 px-4 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors"
                  style={{ 
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}
                >
                  Set Location Now
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !wishText.trim()}
            className="btn-primary w-full py-3 disabled:opacity-50"
            style={{ color: '#000000' }}
          >
            {loading 
              ? (editMode ? 'Updating...' : 'Posting...') 
              : (editMode ? 'Update Wish' : 'Post Wish & Start Chat')}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="btn-outline w-full py-3"
          >
            Cancel
          </button>
        </form>
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          onLocationSelect={async (location) => {
            const locationData: UserLocation = {
              cityId: sanitizeLocationId(location.cityId),
              city: location.city,
              areaId: sanitizeLocationId(location.locality || location.city),
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
            toast.success('Location updated! 📍');
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
    </div>
  );
}