import React, { useState, useEffect } from 'react';
import { Check, X, MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { InputField } from '../components/InputField';
import { TextAreaField } from '../components/TextAreaField';
import { CategorySelector } from '../components/CategorySelector';
import { ImageUploader } from '../components/ImageUploader';
import { LocationSelector } from '../components/LocationSelector';
import { Category } from '../types';
import { toast } from 'sonner';
import { updateListing, uploadListingImages, deleteListingImages } from '../services/listings';
import { Listing } from '../types';
import { getAllCategories } from '../services/categories';
import { useLocation, UserLocation } from '../hooks/useLocation';
import { getCurrentUser } from '../services/auth';

interface EditListingScreenProps {
  listing: Listing;
  onBack: () => void;
  onSuccess: () => void;
  onNavigate?: (screen: string) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function EditListingScreen({ 
  listing,
  onBack, 
  onSuccess,
  onNavigate,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
}: EditListingScreenProps) {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const user = getCurrentUser();
  const { location: globalLocation, updateLocation } = useLocation(user?.id || null);

  // Form state - Initialize with listing data
  const [existingImages, setExistingImages] = useState<string[]>(listing.images || []);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(listing.price.toString());
  const [categoryId, setCategoryId] = useState(listing.categoryId);
  const [phone, setPhone] = useState(listing.phone || '');
  const [hasWhatsapp, setHasWhatsapp] = useState(listing.hasWhatsapp || false);
  const [whatsappNumber, setWhatsappNumber] = useState(listing.whatsapp || '');
  const [userAddress, setUserAddress] = useState(listing.address || ''); // Full address from listing
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Combined images for display
  const allImages = [...existingImages, ...newImagePreviews];

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats.map((cat: any) => ({
          id: Number(cat.id),
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

  // Initialize location from listing if not already set
  useEffect(() => {
    if (listing.latitude && listing.longitude && (!globalLocation?.latitude || !globalLocation?.longitude)) {
      const locationData: UserLocation = {
        cityId: null,
        city: listing.cityName || '',
        areaId: listing.areaName || listing.cityName,
        area: listing.areaName || listing.cityName,
        latitude: listing.latitude,
        longitude: listing.longitude,
        address: listing.address || '',
        locality: listing.areaName,
        state: '',
        pincode: '',
      };
      updateLocation(locationData);
    }
  }, [listing]);

  // Handle image upload from ImageUploader component
  const handleImagesChange = (images: string[]) => {
    // Images now contains both existing and new images
    // Separate them based on whether they're URLs or base64
    const existing = images.filter(img => img.startsWith('http'));
    const newPreviews = images.filter(img => !img.startsWith('http'));
    setExistingImages(existing);
    setNewImagePreviews(newPreviews);
  };

  // Handle removing existing images
  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter(img => img !== imageUrl));
  };

  // Validate step 1 (images, title, description, price, category)
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (allImages.length === 0) {
      newErrors.images = 'Please add at least one image';
    }
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2 (phone, location)
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!phone.trim() || phone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (hasWhatsapp && (!whatsappNumber.trim() || whatsappNumber.length !== 10)) {
      newErrors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number';
    }
    if (!globalLocation?.latitude || !globalLocation?.longitude) {
      newErrors.location = 'Please set your location';
    }
    if (!userAddress.trim()) {
      newErrors.address = 'Please enter your full address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateStep2()) return;

    try {
      toast.loading('Updating listing...');

      // Calculate which images were removed (were in listing.images but not in existingImages)
      const removedImageUrls = listing.images.filter(img => !existingImages.includes(img));

      // Delete removed images if any
      if (removedImageUrls.length > 0) {
        await deleteListingImages(listing.id, removedImageUrls);
      }

      // Upload new images if any
      if (newImagePreviews.length > 0) {
        // Convert base64 images to File objects
        const files = await Promise.all(
          newImagePreviews.map(async (base64, index) => {
            const response = await fetch(base64);
            const blob = await response.blob();
            return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
          })
        );
        
        await uploadListingImages(files, listing.id);
      }

      // Get category slug from categories array
      const selectedCategory = categories.find(cat => cat.id === Number(categoryId));
      const categorySlug = selectedCategory?.slug || listing.categorySlug;

      // Update listing using the new updateListing service
      await updateListing(listing.id, {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        categorySlug: categorySlug,
        city: globalLocation?.city || listing.cityName,
        areaSlug: globalLocation?.areaId || listing.areaSlug,
        phone: phone.trim(),
        whatsappEnabled: hasWhatsapp,
        whatsappNumber: hasWhatsapp ? whatsappNumber.trim() : null,
      });

      toast.dismiss();
      toast.success('Listing updated successfully!');
      onSuccess();
    } catch (error: any) {
      toast.dismiss();
      console.error('Error updating listing:', error);
      toast.error(error.message || 'Failed to update listing');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-40 sm:pb-8">
      <Header 
        title="Edit Listing" 
        showBack 
        onBack={onBack}
        currentScreen="create"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-6">
        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                step === 1
                  ? 'bg-[#CDFF00] text-black'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className={`text-sm hidden sm:inline ${step === 1 ? 'text-black font-semibold' : 'text-gray-600'}`}>
              Item Details
            </span>
          </div>

          <div className="w-12 h-px bg-gray-300"></div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                step === 2
                  ? 'bg-[#CDFF00] text-black'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span className={`text-sm hidden sm:inline ${step === 2 ? 'text-black font-semibold' : 'text-gray-600'}`}>
              Contact & Location
            </span>
          </div>
        </div>

        {/* Step 1: Item Details */}
        {step === 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Update Item Details</h2>
                <p className="text-sm text-gray-600">Make changes to your listing information</p>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Current Images</label>
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((imageUrl) => (
                      <div key={imageUrl} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt="Listing"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveExistingImage(imageUrl)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Images */}
              <ImageUploader
                images={allImages}
                onImagesChange={handleImagesChange}
                maxImages={10}
              />
              {errors.images && <p className="text-xs text-red-600 mt-1">{errors.images}</p>}

              <InputField
                label="Title"
                value={title}
                onChange={setTitle}
                placeholder="e.g., iPhone 12 Pro Max"
                required
                error={errors.title}
              />

              <TextAreaField
                label="Description"
                value={description}
                onChange={setDescription}
                placeholder="Describe your item in detail..."
                rows={5}
                required
                error={errors.description}
              />

              <InputField
                label="Price (₹)"
                type="number"
                value={price}
                onChange={setPrice}
                placeholder="0"
                required
                error={errors.price}
              />

              <CategorySelector
                label="Category"
                value={categoryId}
                onChange={setCategoryId}
                categories={categories}
                required
                error={errors.categoryId}
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact & Location */}
        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Contact & Location</h2>
                <p className="text-sm text-gray-600">Update contact and location details</p>
              </div>

              <InputField
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(val) => setPhone(val.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                required
                error={errors.phone}
              />

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWhatsapp}
                    onChange={(e) => setHasWhatsapp(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 accent-[#CDFF00]"
                  />
                  <span className="text-sm text-black">I have WhatsApp on a different number</span>
                </label>

                {hasWhatsapp && (
                  <InputField
                    label="WhatsApp Number"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(val) => setWhatsappNumber(val.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    required
                    error={errors.whatsappNumber}
                  />
                )}
              </div>

              {/* Location Display */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Your Location <span className="text-red-500">*</span>
                </label>
                {globalLocation && globalLocation.latitude && globalLocation.longitude ? (
                  <button
                    type="button"
                    onClick={() => setShowLocationSelector(true)}
                    className="w-full p-4 bg-white border-2 border-gray-200 hover:border-[#CDFF00] transition-colors text-left flex items-start justify-between gap-3 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-5 h-5 text-[#CDFF00] flex-shrink-0" />
                        <p className="text-sm font-semibold text-black">
                          {globalLocation.area} {globalLocation.city}
                        </p>
                      </div>
                      {globalLocation.address && (
                        <p className="text-xs text-gray-600 truncate">
                          {globalLocation.address}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-600 mb-2">⚠️ Location Not Set</p>
                    <p className="text-xs text-red-600 mb-3">Please set your location to continue</p>
                    <button
                      type="button"
                      onClick={() => setShowLocationSelector(true)}
                      className="w-full py-2.5 px-4 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors rounded-md text-sm font-semibold"
                    >
                      Set Location Now
                    </button>
                  </div>
                )}
                {errors.location && (
                  <p className="text-xs text-red-600 mt-1">{errors.location}</p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  Tap to change your location
                </p>
              </div>

              {/* Full Address Input */}
              {globalLocation && globalLocation.latitude && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="Building name, floor, street details...&#10;&#10;E.g., Shop #12, 2nd Floor, 8th Cross, 29th Main Road&#10;Above Cafe Coffee Day"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#CDFF00] transition-colors resize-none rounded-lg text-sm"
                    style={{ minHeight: '120px' }}
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Add specific details like building name, floor, nearby landmarks
                  </p>
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1.5">{errors.address}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Sticky above bottom nav on mobile */}
      <div className="fixed lg:static bottom-16 lg:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          {step === 1 ? (
            <>
              <button 
                type="button" 
                onClick={onBack} 
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleNext} 
                className="flex-1 py-3 px-4 bg-[#CDFF00] text-black font-semibold rounded-lg hover:bg-[#b8e600] transition-colors"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="flex-1 py-3 px-4 bg-[#CDFF00] text-black font-semibold rounded-lg hover:bg-[#b8e600] transition-colors"
              >
                Update Listing
              </button>
            </>
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
            address: globalLocation.address,
          } : null}
        />
      )}
    </div>
  );
}