import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, Check, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { InputField } from '../components/InputField';
import { TextAreaField } from '../components/TextAreaField';
import { SelectField } from '../components/SelectField';
import { ImageUploader } from '../components/ImageUploader';
import { LocationField } from '../components/LocationField';
import { LocationSelector } from '../components/LocationSelector';
import { MarketplaceCategorySelector } from '../components/MarketplaceCategorySelector';
import { City, Listing } from '../types';
import { toast } from 'sonner';
import { createListing, uploadListingImages, updateListing, deleteListingImages } from '../services/listings';
import { getCurrentUser } from '../services/auth';
import { PRODUCT_CATEGORIES } from '../services/productCategories';
import { useLocation, UserLocation } from '../hooks/useLocation';
import { fireConfetti } from '../utils/confetti';
import { validateTaskContent } from '../services/contentModeration';

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
  listing?: Listing | null; // Optional: If provided, we're in edit mode
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
  listing = null, // Edit mode if listing is provided
}: CreateListingScreenProps) {
  const currentUser = getCurrentUser();
  const { location: globalLocation, updateLocation } = useLocation(currentUser?.id || null);
  
  const isEditMode = !!listing; // Check if we're editing
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedImages, setDeletedImages] = useState<string[]>([]); // Track deleted images in edit mode

  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [phone, setPhone] = useState('');
  const [hasWhatsapp, setHasWhatsapp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [userAddress, setUserAddress] = useState(''); // User's specific address input
  const [showLocationSelector, setShowLocationSelector] = useState(false); // Location selector modal
  const [showCategorySelector, setShowCategorySelector] = useState(false); // Category selector modal

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contentErrors, setContentErrors] = useState<string[]>([]);
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);

  // Real-time content validation handlers
  const handleTitleChange = (value: string) => {
    setTitle(value);
    
    if (value.trim().length > 5) {
      const validation = validateTaskContent(value, '');
      if (!validation.isValid) {
        setContentErrors(validation.errors);
        setContentWarnings(validation.warnings);
      } else {
        setContentErrors([]);
        setContentWarnings(validation.warnings);
      }
    } else {
      setContentErrors([]);
      setContentWarnings([]);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    
    if (value.trim().length > 10) {
      const validation = validateTaskContent(value, '');
      if (!validation.isValid) {
        setContentErrors(validation.errors);
        setContentWarnings(validation.warnings);
      } else {
        setContentErrors([]);
        setContentWarnings(validation.warnings);
      }
    } else {
      setContentErrors([]);
      setContentWarnings([]);
    }
  };

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
    }
  }, []);

  // Populate form with listing data in edit mode
  useEffect(() => {
    if (isEditMode && listing) {
      console.log('📝 Populating form with listing data:', listing);
      setImages(listing.images || []);
      setTitle(listing.title || '');
      setDescription(listing.description || '');
      setPrice(listing.price?.toString() || '');
      
      // Find category by slug (id is the slug in PRODUCT_CATEGORIES)
      if (listing.categorySlug && PRODUCT_CATEGORIES.length > 0) {
        const category = PRODUCT_CATEGORIES.find(cat => cat.id === listing.categorySlug);
        if (category) {
          setCategoryId(category.id);
        }
      }
      
      setPhone(listing.phone || '');
      setHasWhatsapp(!!listing.whatsappNumber && listing.whatsappNumber !== listing.phone);
      setWhatsappNumber(listing.whatsappNumber || '');
      setUserAddress(listing.userAddress || listing.address || '');
      
      // Update location if listing has coordinates
      if (listing.latitude && listing.longitude) {
        updateLocation({
          cityId: null,
          city: listing.cityName || listing.city || '',
          areaId: null,
          area: listing.areaName || listing.area || '',
          latitude: listing.latitude,
          longitude: listing.longitude,
          address: listing.address || '',
          locality: listing.locality || '',
          state: listing.state || '',
          pincode: listing.pincode || '',
        });
      }
    }
  }, [listing?.id]);

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
      // Full address is now optional - we use global location from header
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
      const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
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

      // Prepare payload
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price),
        categorySlug: category.id, // The ID is already the slug in PRODUCT_CATEGORIES
        subcategoryId: subcategoryId || null, // ✅ FIX 1: Store subcategory for precise matching
        city: globalLocation.city,
        areaSlug: globalLocation.area || globalLocation.city,
        phone: phone.trim(),
        whatsappEnabled: hasWhatsapp,
        whatsappNumber: hasWhatsapp ? (whatsappNumber || phone).trim() : null,
        latitude: listingLatitude,
        longitude: listingLongitude,
        address: userAddress.trim() || null,
      };

      let listingId: string;
      
      if (isEditMode && listing) {
        // UPDATE existing listing
        console.log('📝 Updating listing with payload:', payload);
        await updateListing(listing.id, payload);
        listingId = listing.id;
        
        // Handle image changes
        // Separate new images (base64) from existing images (URLs)
        const newImages = images.filter(img => img.startsWith('data:'));
        const existingImageUrls = images.filter(img => !img.startsWith('data:'));
        
        // Find which old images were removed
        const originalImages = listing.images || [];
        const removedImages = originalImages.filter(img => !existingImageUrls.includes(img));
        
        // Delete removed images
        if (removedImages.length > 0) {
          console.log('🗑️ Deleting removed images:', removedImages);
          await deleteListingImages(listing.id, removedImages);
        }
        
        // Upload new images
        if (newImages.length > 0) {
          console.log('📤 Uploading new images:', newImages.length);
          const files = await Promise.all(
            newImages.map(async (base64, index) => {
              const response = await fetch(base64);
              const blob = await response.blob();
              return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
            })
          );
          await uploadListingImages(files, listing.id);
        }
        
        toast.success('Listing updated successfully!');
      } else {
        // CREATE new listing
        console.log('✨ Creating listing with payload:', payload);
        const createdListing = await createListing(payload);
        listingId = createdListing.id;
        
        // Upload images if any
        if (images.length > 0) {
          const files = await Promise.all(
            images.map(async (base64, index) => {
              const response = await fetch(base64);
              const blob = await response.blob();
              return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
            })
          );
          await uploadListingImages(files, listingId);
        }

        toast.success('Listing posted successfully!');
        fireConfetti();
      }
      
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} listing:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} listing. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const selectedCategory = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Upload Photos</h2>
              <p className="text-muted text-sm mb-4">Add 1-6 photos of your item</p>
            </div>
            <ImageUploader images={images} onImagesChange={setImages} maxImages={6} />
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
                onChange={handleTitleChange}
                required
                error={errors.title}
              />
              <TextAreaField
                label="Description"
                placeholder="Describe your item, condition, reason for selling..."
                value={description}
                onChange={handleDescriptionChange}
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
            {contentErrors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-red-500 font-bold">Content Errors:</p>
                <ul className="list-disc list-inside">
                  {contentErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-500">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {contentWarnings.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-yellow-500 font-bold">Content Warnings:</p>
                <ul className="list-disc list-inside">
                  {contentWarnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-500">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Select Category</h2>
              <p className="text-muted text-sm mb-4">Choose the best category for your item</p>
            </div>
            
            {/* Category Selection Button */}
            <div>
              <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
                Category {errors.category && <span className="text-red-600">*</span>}
              </label>
              <button
                type="button"
                onClick={() => setShowCategorySelector(true)}
                className={`w-full p-4 bg-white border-2 transition-colors text-left flex items-center justify-between gap-3 rounded-xl ${
                  errors.category 
                    ? 'border-red-300 hover:border-red-400' 
                    : categoryId 
                    ? 'border-[#CDFF00] hover:border-[#B8E600]' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {selectedCategory ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedCategory.emoji}</span>
                    <div>
                      <p className="font-bold text-black">{selectedCategory.name}</p>
                      {subcategoryId && (
                        <p className="text-xs text-gray-600">
                          {selectedCategory.subcategories.find(sub => sub.id === subcategoryId)?.name}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Tap to select category</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {errors.category && (
                <p className="text-xs text-red-600 mt-1.5">{errors.category}</p>
              )}
            </div>
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
                  Full Address (Optional)
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
              <div className="grid grid-cols-6 gap-2">
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
                <p className="text-black font-bold m-0">₹{parseInt(price).toLocaleString('en-IN')}</p>
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header 
        title={isEditMode ? `Edit Ad (${step}/6)` : `Post Ad (${step}/6)`}
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-[#CDFF00]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-32">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Action Buttons - Fixed bottom with backdrop */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-gray-200 p-4 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto flex gap-3">
          {/* Back Button - Show on all steps except step 1 */}
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)} 
              className="flex-1 py-3.5 px-6 bg-white border-2 border-gray-300 text-black font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Back
            </button>
          )}
          
          {/* Continue/Submit Button */}
          {step < 6 ? (
            <button 
              onClick={handleNext} 
              className="flex-1 py-3.5 px-6 bg-[#CDFF00] text-black font-bold rounded-xl hover:bg-[#b8e600] transition-all shadow-md"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? 'Updating...' : 'Posting...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{isEditMode ? 'Update Listing' : 'Post Listing'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          onLocationSelect={async (location) => {
            const locationData: UserLocation = {
              cityId: null,
              city: location.city,
              areaId: null, // ✅ FIX: Always NULL for Google Maps locations (not from database dropdown)
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
          description="Choose your location to post items"
        />
      )}

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <MarketplaceCategorySelector
          selectedCategoryId={categoryId}
          selectedSubcategoryId={subcategoryId}
          onSelect={(catId, subId) => {
            setCategoryId(catId);
            setSubcategoryId(subId);
          }}
          onClose={() => setShowCategorySelector(false)}
        />
      )}

    </div>
  );
}