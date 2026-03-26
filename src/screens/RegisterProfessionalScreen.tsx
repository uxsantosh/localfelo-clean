import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InputField } from '../components/InputField';
import { TextAreaField } from '../components/TextAreaField';
import { SelectField } from '../components/SelectField';
import { LocationSelector } from '../components/LocationSelector';
import { ImageUploader } from '../components/ImageUploader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { createProfessional } from '../services/professionals';
import { SERVICE_CATEGORIES, getSubcategoriesByCategoryId } from '../services/serviceCategories';
import { getCurrentUser, getClientToken } from '../services/authHelpers'; // ✅ Use sync version
import { uploadImage } from '../services/avatarUpload';

interface Service {
  service_name: string;
  price?: number;
}

interface RegisterProfessionalScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  currentCity?: string;
  currentArea?: string;
  currentSubArea?: string;
  currentLat?: number;
  currentLng?: number;
}

export function RegisterProfessionalScreen({
  onBack,
  onSuccess,
  currentCity,
  currentArea,
  currentSubArea,
  currentLat,
  currentLng,
}: RegisterProfessionalScreenProps) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]); // ✅ Changed to array for multi-select
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([{ service_name: '', price: undefined }]);
  
  const [city, setCity] = useState(currentCity || '');
  const [area, setArea] = useState(currentArea || '');
  const [subArea, setSubArea] = useState(currentSubArea || '');
  const [latitude, setLatitude] = useState(currentLat);
  const [longitude, setLongitude] = useState(currentLng);
  const [address, setAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Get subcategories for selected category
  const subcategories = categoryId ? getSubcategoriesByCategoryId(categoryId) : [];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategoryIds([]); // ✅ Reset to empty array
  }, [categoryId]);

  const handleAddService = () => {
    setServices([...services, { service_name: '', price: undefined }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: keyof Service, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleLocationChange = (locationData: any) => {
    setCity(locationData.city || '');
    setArea(locationData.area || '');
    setSubArea(locationData.subArea || '');
    setLatitude(locationData.latitude);
    setLongitude(locationData.longitude);
    setAddress(locationData.address || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Please enter your name or business name');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter your professional title');
      return;
    }

    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!whatsapp.trim()) {
      toast.error('Please enter your WhatsApp number');
      return;
    }

    if (!/^\d{10}$/.test(whatsapp)) {
      toast.error('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    if (!city) {
      toast.error('Please select your location');
      return;
    }

    // At least one service
    const validServices = services.filter(s => s.service_name.trim());
    if (validServices.length === 0) {
      toast.error('Please add at least one service');
      return;
    }

    setSubmitting(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        toast.error('Please login to register as a professional');
        setSubmitting(false);
        return;
      }

      console.log('🔍 Current user:', user);
      console.log('🔍 User ID:', user.id);
      
      if (!user.id) {
        toast.error('User ID is missing. Please logout and login again.');
        console.error('❌ User object exists but ID is missing:', user);
        setSubmitting(false);
        return;
      }

      // Upload profile image if provided (base64 to URL)
      let uploadedProfileUrl: string | undefined = undefined;
      if (profileImages.length > 0) {
        const result = await uploadImage(profileImages[0], user.id);
        if (result.success && result.url) {
          uploadedProfileUrl = result.url;
        }
      }

      // Upload gallery images (base64 to URLs)
      const uploadedGalleryUrls: string[] = [];
      for (const base64Image of galleryImages) {
        const result = await uploadImage(base64Image, user.id);
        if (result.success && result.url) {
          uploadedGalleryUrls.push(result.url);
        }
      }

      // Create professional
      const result = await createProfessional(user.id, {
        name: name.trim(),
        title: title.trim(),
        category_id: categoryId,
        subcategory_id: subcategoryIds.length > 0 ? subcategoryIds : undefined,
        description: description.trim() || undefined,
        whatsapp: whatsapp.trim(),
        profile_image_url: uploadedProfileUrl,
        city,
        area: area || undefined,
        subarea: subArea || undefined,
        latitude,
        longitude,
        address: address || undefined,
        services: validServices,
        images: uploadedGalleryUrls,
      });

      if (result.success) {
        toast.success('Professional profile created successfully!');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to create professional profile');
        // Log detailed error for debugging
        console.error('❌ Failed to create professional:', result.error);
      }
    } catch (error: any) {
      console.error('Error submitting professional:', error);
      
      // Show specific error messages based on error code
      if (error.code === '42501') {
        toast.error('Authentication error. Please run the RLS fix SQL in Supabase.');
        console.error('❌ RLS Policy Error: Run /PROFESSIONALS_RLS_FIX.sql in Supabase');
      } else if (error.code === '42P01') {
        toast.error('Database tables missing. Please run the migration SQL.');
        console.error('❌ Missing Tables: Run /PROFESSIONALS_MODULE_SUPABASE_MIGRATION.sql in Supabase');
      } else {
        toast.error(error.message || 'Failed to create professional profile');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              disabled={submitting}
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-black">Register as Professional</h1>
              <p className="text-xs text-gray-600">Create your professional profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-black">Basic Information</h2>

            <InputField
              label="Name / Business Name"
              value={name}
              onChange={setName}
              placeholder="e.g., John Doe or ABC Services"
              required
            />

            <InputField
              label="Professional Title"
              value={title}
              onChange={setTitle}
              placeholder="e.g., Certified Accountant, Plumber, Doctor"
              required
            />

            <SelectField
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              required
            >
              <option value="">Select category</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </SelectField>

            {/* ✅ Subcategories with checkboxes for multi-select */}
            {categoryId && subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-black">
                  Subcategories (Optional - Select Multiple)
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {subcategories.map((subcat) => (
                    <label
                      key={subcat.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={subcategoryIds.includes(subcat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSubcategoryIds([...subcategoryIds, subcat.id]);
                          } else {
                            setSubcategoryIds(subcategoryIds.filter(id => id !== subcat.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-[#CDFF00] focus:ring-[#CDFF00]"
                      />
                      <span className="text-sm text-black">{subcat.name}</span>
                    </label>
                  ))}
                </div>
                {subcategoryIds.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    {subcategoryIds.length} subcategor{subcategoryIds.length === 1 ? 'y' : 'ies'} selected
                  </p>
                )}
              </div>
            )}

            <TextAreaField
              label="Description (Optional)"
              value={description}
              onChange={setDescription}
              placeholder="Brief description about your services..."
              rows={3}
            />

            <InputField
              label="WhatsApp Number"
              value={whatsapp}
              onChange={(value) => setWhatsapp(value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              maxLength={10}
              required
            />
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-black">Services</h2>
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-1.5 bg-black text-[#CDFF00] rounded-md text-sm font-medium hover:bg-gray-900 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={service.service_name}
                      onChange={(e) =>
                        handleServiceChange(index, 'service_name', e.target.value)
                      }
                      placeholder="Service name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      value={service.price || ''}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          'price',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Profile Image */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-black">Profile Image (Optional)</h2>
            <p className="text-xs text-gray-600">You can add or update your profile image later</p>
            <ImageUploader
              images={profileImages}
              onImagesChange={setProfileImages}
              maxImages={1}
            />
          </div>

          {/* Gallery Images */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-black">
              Gallery Images (Optional - Max 5)
            </h2>
            <ImageUploader
              images={galleryImages}
              onImagesChange={setGalleryImages}
              maxImages={5}
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-black">Location</h2>
            
            {city && latitude && longitude ? (
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
                    <span className="text-sm font-bold text-black">{city}</span>
                  </div>
                  {address && (
                    <p className="text-xs text-gray-600 ml-7 line-clamp-2">{address}</p>
                  )}
                </div>
                <span className="text-xs text-[#CDFF00] font-bold whitespace-nowrap">Change</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLocationSelector(true)}
                className="w-full p-4 bg-red-50 border-2 border-red-200 hover:border-red-300 transition-colors rounded-lg"
              >
                <p className="text-sm font-bold text-red-600 mb-1">⚠️ Location Not Set</p>
                <p className="text-xs text-red-600 mb-2">Please set your service location</p>
                <span className="inline-block px-3 py-1.5 bg-[#CDFF00] text-black rounded-md text-xs font-bold">
                  Set Location Now
                </span>
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-4 bg-black text-[#CDFF00] rounded-md font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner />
                  <span>Creating Profile...</span>
                </>
              ) : (
                'Create Professional Profile'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          onLocationSelect={(location) => {
            setCity(location.city);
            setArea(location.locality || location.city);
            setSubArea('');
            setLatitude(location.latitude);
            setLongitude(location.longitude);
            setAddress(location.address);
            setShowLocationSelector(false);
          }}
          onClose={() => setShowLocationSelector(false)}
          currentLocation={
            latitude && longitude && city
              ? { latitude, longitude, city }
              : null
          }
        />
      )}
    </div>
  );
}