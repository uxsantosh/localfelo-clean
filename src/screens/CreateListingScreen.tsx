import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { InputField } from '../components/InputField';
import { TextAreaField } from '../components/TextAreaField';
import { SelectField } from '../components/SelectField';
import { CategorySelector } from '../components/CategorySelector';
import { ImageUploader } from '../components/ImageUploader';
import { PhoneNumberModal } from '../components/PhoneNumberModal';
import { LocationField } from '../components/LocationField';
import { LocationSelector } from '../components/LocationSelector';
import { City, Category } from '../types';
import { toast } from 'sonner';
import { createListing, uploadListingImages } from '../services/listings';
import { getCurrentUser, updateUserProfileInDB } from '../services/auth';
import { getAllCategories } from '../services/categories';
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

interface CreateListingScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  cities: City[]; // Cities from Supabase
}

export function CreateListingScreen({ 
  onBack, 
  onSuccess,
  onNavigate,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
  unreadCount = 0,
  cities = [],
}: CreateListingScreenProps) {
  const currentUser = getCurrentUser();
  const { location: globalLocation, updateLocation } = useLocation(currentUser?.id || null);
  
  const [step, setStep] = useState(1);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [phone, setPhone] = useState('');
  const [hasWhatsapp, setHasWhatsapp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [userAddress, setUserAddress] = useState(''); // User's specific address input
  const [showLocationSelector, setShowLocationSelector] = useState(false); // Location selector modal

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats.map((cat: any) => ({
          id: Number(cat.id), // Changed from String to Number
          name: cat.name,
          slug: cat.slug,
          emoji: cat.emoji,
        })));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Check if user has phone number on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.phone) {
      // Strip +91 prefix if present (database stores +919063205739, but we need 9063205739)
      const cleanPhone = currentUser.phone.replace(/^\+91/, '');
      setPhone(cleanPhone);
      setHasWhatsapp(currentUser.whatsappSame);
      if (currentUser.whatsappSame && currentUser.whatsappNumber) {
        const cleanWhatsapp = currentUser.whatsappNumber.replace(/^\+91/, '');
        setWhatsappNumber(cleanWhatsapp);
      }
    } else if (currentUser && !currentUser.phone) {
      // User logged in but no phone - show modal
      setShowPhoneModal(true);
    }
  }, []);

  // No need to auto-populate - using global location directly

  // Handle phone number submission from modal
  const handlePhoneSubmit = async (phoneNum: string, whatsappSame: boolean) => {
    console.log('📱 handlePhoneSubmit called with:', { phoneNum, whatsappSame });
    try {
      // Update profile in database
      await updateUserProfileInDB({
        phone: phoneNum,
        whatsappSame: whatsappSame,
      });

      // Update local state
      setPhone(phoneNum);
      setHasWhatsapp(whatsappSame);
      
      toast.success('Phone number saved! You can now create listings.');
      setShowPhoneModal(false);
    } catch (error: any) {
      console.error('❌ Error in handlePhoneSubmit:', error);
      toast.error(error.message || 'Failed to save phone number');
      throw error;
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (images.length === 0) {
        newErrors.images = 'Please upload at least 1 image';
      }
    }

    if (currentStep === 2) {
      if (!title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!price || parseInt(price) <= 0) {
        newErrors.price = 'Valid price is required';
      }
    }

    if (currentStep === 3) {
      if (!categoryId) {
        newErrors.category = 'Please select a category';
      }
    }

    if (currentStep === 4) {
      if (!phone.trim() || phone.length !== 10) {
        newErrors.phone = 'Valid 10-digit phone number is required';
      }
      if (hasWhatsapp && whatsappNumber && whatsappNumber.length !== 10) {
        newErrors.whatsapp = 'Valid 10-digit WhatsApp number is required';
      }
    }

    if (currentStep === 5) {
      if (!globalLocation || !globalLocation.latitude || !globalLocation.longitude) {
        newErrors.location = 'Please set your location from the header first';
      }
      if (!userAddress.trim()) {
        newErrors.address = 'Please enter your full address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('⏳ Submission already in progress, ignoring click');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the category slug
      const category = categories.find((c) => c.id === Number(categoryId));
      if (!category) {
        toast.error('Invalid category');
        setIsSubmitting(false);
        return;
      }

      // Use global location coordinates directly
      if (!globalLocation || !globalLocation.latitude || !globalLocation.longitude) {
        toast.error('Location not set. Please set your location first.');
        setIsSubmitting(false);
        return;
      }

      const listingLatitude = globalLocation.latitude;
      const listingLongitude = globalLocation.longitude;
      console.log(`📍 Using global location coordinates:`, { listingLatitude, listingLongitude });

      // Create the listing
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price),
        categorySlug: category.slug,
        city: globalLocation.city,
        areaSlug: globalLocation.area || globalLocation.city, // Use area name, not areaId
        phone: phone.trim(),
        whatsappEnabled: hasWhatsapp,
        whatsappNumber: hasWhatsapp ? (whatsappNumber || phone).trim() : null,
        latitude: listingLatitude,
        longitude: listingLongitude,
        address: userAddress.trim() || null,
      };

      console.log('Creating listing with payload:', payload);
      const createdListing = await createListing(payload);
      
      // Upload images if any
      if (images.length > 0) {
        // Convert base64 images to File objects
        const files = await Promise.all(
          images.map(async (base64, index) => {
            const response = await fetch(base64);
            const blob = await response.blob();
            return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
          })
        );
        
        await uploadListingImages(files, createdListing.id);
      }

      toast.success('Listing posted successfully!');
      fireConfetti();
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create listing:', error);
      toast.error('Failed to create listing. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === Number(categoryId));

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Upload Photos</h2>
              <p className="text-muted text-sm mb-4">Add 1-4 photos of your item</p>
            </div>
            <ImageUploader images={images} onImagesChange={setImages} maxImages={4} />
            {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Item Details</h2>
              <p className="text-muted text-sm mb-4">Tell us about your item</p>
            </div>
            <div className="form-grid">
              <InputField
                label="Title"
                placeholder="e.g., iPhone 13 Pro Max 256GB"
                value={title}
                onChange={setTitle}
                required
                error={errors.title}
              />
              <TextAreaField
                label="Description"
                placeholder="Describe your item, condition, reason for selling..."
                value={description}
                onChange={setDescription}
                rows={5}
                required
                error={errors.description}
              />
              <InputField
                label="Price (₹)"
                type="number"
                placeholder="e.g., 50000"
                value={price}
                onChange={setPrice}
                required
                error={errors.price}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Select Category</h2>
              <p className="text-muted text-sm mb-4">Choose the best category for your item</p>
            </div>
            <CategorySelector
              categories={categories}
              selectedCategoryId={categoryId}
              onCategoryChange={setCategoryId}
              error={errors.category}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Contact Information</h2>
              <p className="text-muted text-sm mb-4">How should buyers contact you?</p>
            </div>
            <InputField
              label="Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={setPhone}
              required
              error={errors.phone}
            />
            <div className="flex items-center gap-3 p-3 bg-input rounded-lg">
              <input
                type="checkbox"
                id="hasWhatsapp"
                checked={hasWhatsapp}
                onChange={(e) => setHasWhatsapp(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="hasWhatsapp" className="flex-1 text-body cursor-pointer">
                This number is on WhatsApp
              </label>
            </div>
            {hasWhatsapp && (
              <InputField
                label="Different WhatsApp Number (Optional)"
                type="tel"
                placeholder="10-digit WhatsApp number"
                value={whatsappNumber}
                onChange={setWhatsappNumber}
                error={errors.whatsapp}
              />
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Location</h2>
              <p className="text-muted text-sm mb-4">Where is the item located?</p>
            </div>

            {/* Global Location Display (Read-Only, Clickable) */}
            {globalLocation && globalLocation.latitude && globalLocation.longitude ? (
              <div>
                <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
                  Your Location
                </label>
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
              </div>
            ) : (
              <div>
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
                {errors.location && (
                  <p className="text-[12px] text-red-600 mt-1.5" style={{ fontWeight: '600' }}>
                    {errors.location}
                  </p>
                )}
              </div>
            )}

            {/* Full Address Input */}
            {globalLocation && globalLocation.latitude && (
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
                />
                <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
                  Add specific details like building name, floor, nearby landmarks
                </p>
                {errors.address && (
                  <p className="text-[12px] text-red-600 mt-1.5" style={{ fontWeight: '600' }}>
                    {errors.address}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Review & Submit</h2>
              <p className="text-muted text-sm mb-4">Check your listing details</p>
            </div>

            {/* Images Preview */}
            <div className="card">
              <h4 className="text-heading mb-2">Photos ({images.length})</h4>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="card space-y-3">
              <div>
                <p className="text-xs text-muted m-0">Title</p>
                <p className="text-body m-0">{title}</p>
              </div>
              <div>
                <p className="text-xs text-muted m-0">Price</p>
                <p className="text-primary m-0">₹{parseInt(price).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted m-0">Category</p>
                <p className="text-body m-0">
                  {selectedCategory?.emoji} {selectedCategory?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted m-0">Description</p>
                <p className="text-body text-sm m-0">{description}</p>
              </div>
              <div>
                <p className="text-xs text-muted m-0">Phone</p>
                <p className="text-body m-0">{phone}</p>
              </div>
              {hasWhatsapp && (
                <div>
                  <p className="text-xs text-muted m-0">WhatsApp</p>
                  <p className="text-body m-0">{whatsappNumber || phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted m-0">Location</p>
                <p className="text-body m-0">
                  {globalLocation?.area}, {globalLocation?.city}
                </p>
                {userAddress && (
                  <>
                    <p className="text-xs text-muted mt-2 m-0">Full Address</p>
                    <p className="text-body text-sm m-0">{userAddress}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40 sm:pb-8">
      <Header 
        title={`Post Ad (${step}/6)`} 
        showBack 
        onBack={handleBack}
        currentScreen="create"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
      />

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="page-container py-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-input'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-6">{renderStepContent()}</div>

      {/* Action Buttons - Sticky above bottom nav on mobile */}
      <div className="fixed lg:static bottom-16 lg:bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
        <div className="max-w-lg mx-auto">
          {step < 6 ? (
            <button onClick={handleNext} className="btn-primary">
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Post Listing</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Phone Number Modal - Shows when user doesn't have phone */}
      <PhoneNumberModal
        isOpen={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          onBack(); // Go back to home if user cancels
        }}
        onSubmit={handlePhoneSubmit}
        userName={userDisplayName}
      />

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          onLocationSelect={async (location) => {
            const locationData: UserLocation = {
              cityId: null,
              city: location.city,
              areaId: location.locality || location.city,
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
          description="Choose your location to post items"
        />
      )}

    </div>
  );
}