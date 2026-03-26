// =====================================================
// EDIT PROFESSIONAL ROLE SCREEN - 2026 MODERN UI
// =====================================================
// Edit professional profile with role-based system

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, MapPin, Plus, X, CheckCircle2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InputField } from '../components/InputField';
import { TextAreaField } from '../components/TextAreaField';
import { LocationSelector } from '../components/LocationSelector';
import { ImageUploader } from '../components/ImageUploader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../services/authHelpers';
import { getAllRoles, getRoleById } from '../services/roles';
import { SERVICE_CATEGORIES, type ServiceCategory, type ServiceSubcategory } from '../services/serviceCategories';
import type { Professional } from '../services/professionals';
import type { Role } from '../services/roles';

// =====================================================
// ROLE → RECOMMENDED SERVICES MAPPING
// =====================================================
const ROLE_SERVICE_MAPPING: Record<string, string[]> = {
  'Electrician': ['repair:ac-repair', 'repair:fan-repair', 'repair:wiring-repair', 'repair:switch-repair', 'repair:inverter-repair', 'installation:ac-installation', 'installation:fan-installation', 'installation:light-installation'],
  'Plumber': ['repair:tap-repair', 'repair:pipe-leakage', 'repair:drain-blockage'],
  'Driver': ['driver-rides:driver-hours', 'driver-rides:airport-pickup', 'driver-rides:airport-drop', 'driver-rides:outstation'],
  'Delivery Partner': ['delivery-pickup:parcel-delivery', 'delivery-pickup:grocery-pickup', 'delivery-pickup:medicine-pickup', 'delivery-pickup:food-pickup'],
  'Cleaner': ['cleaning:house-cleaning', 'cleaning:deep-cleaning', 'cleaning:kitchen-cleaning', 'cleaning:bathroom-cleaning'],
  'Cook / Chef': ['cooking:daily-cooking', 'cooking:party-chef', 'cooking:meal-prep'],
  'Teacher / Tutor': ['teaching-learning:tutoring', 'teaching-learning:coding', 'teaching-learning:spoken-english'],
  'Photographer': ['photography-videography:event-photo', 'photography-videography:wedding-photo', 'photography-videography:product-photo'],
  'CA / Accountant': ['accounting-tax:gst', 'accounting-tax:income-tax', 'accounting-tax:bookkeeping'],
  'Lawyer': ['professional-help:legal'],
  'Doctor / Healthcare': ['medical-help:consultation'],
  'Nurse / Caretaker': ['medical-help:patient-care', 'medical-help:elderly-care'],
  'Technician (IT)': ['repair:laptop-repair', 'repair:mobile-repair', 'tech-help:software', 'tech-help:wifi'],
  'Beautician': ['beauty-wellness:haircut', 'beauty-wellness:makeup', 'beauty-wellness:facial'],
  'Mechanic': ['repair:car-repair', 'repair:bike-repair'],
  'Event Planner': ['event-help:party', 'event-help:decoration'],
  'Pet Caretaker': ['pet-care:grooming', 'pet-care:walking'],
  'Consultant': ['professional-help:business', 'professional-help:career'],
  'Freelancer': ['mentorship:ui-ux', 'mentorship:digital-marketing', 'professional-help:freelance'],
  'Moving & Packing Helper': ['moving-packing:house-shifting', 'moving-packing:packing', 'moving-packing:loading'],
  'Laundry Service': ['laundry:washing', 'laundry:ironing'],
  'Home Service Professional': ['home-services:painting', 'home-services:electrical', 'installation:furniture-assembly'],
  'Government & ID Services': ['document-help:aadhaar', 'document-help:pan', 'document-help:passport'],
  'Partner / Companion': ['partner-needed:gym', 'partner-needed:running', 'partner-needed:study'],
};

interface Service {
  service_name: string;
  price?: number;
}

interface CustomService {
  name: string;
  category_id: string;
  price?: number;
}

interface EditProfessionalRoleScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  professionalSlug?: string;
  // Global location props
  globalCity?: string;
  globalArea?: string;
  globalSubArea?: string;
  globalLat?: number;
  globalLng?: number;
}

export function EditProfessionalRoleScreen({
  onBack,
  onSuccess,
  professionalSlug,
  globalCity,
  globalArea,
  globalSubArea,
  globalLat,
  globalLng,
}: EditProfessionalRoleScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  
  // Role selection
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([{ service_name: '', price: undefined }]);
  
  // NEW: Service/Subcategory selection state
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]); // Format: "category_id:subcategory_id"
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  
  // Prepare all services grouped by category
  const allServicesGrouped = useMemo(() => {
    return SERVICE_CATEGORIES.map(category => ({
      id: category.id,
      name: category.name,
      emoji: category.emoji,
      subcategories: category.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        fullId: `${category.id}:${sub.id}`,
      })),
    }));
  }, []);

  // Get recommended services for selected role
  const recommendedServices = useMemo(() => {
    if (!selectedRole) return [];
    return ROLE_SERVICE_MAPPING[selectedRole.name] || [];
  }, [selectedRole]);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!serviceSearchQuery) return allServicesGrouped;
    
    const query = serviceSearchQuery.toLowerCase();
    return allServicesGrouped
      .map(category => ({
        ...category,
        subcategories: category.subcategories.filter(sub =>
          sub.name.toLowerCase().includes(query) ||
          category.name.toLowerCase().includes(query)
        ),
      }))
      .filter(category => category.subcategories.length > 0);
  }, [serviceSearchQuery, allServicesGrouped]);

  // Toggle subcategory selection
  const toggleSubcategory = (fullId: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(fullId)
        ? prev.filter(id => id !== fullId)
        : [...prev, fullId]
    );
  };

  // Get service name from fullId
  const getServiceName = (fullId: string) => {
    const [catId, subId] = fullId.split(':');
    const category = allServicesGrouped.find(c => c.id === catId);
    const subcategory = category?.subcategories.find(s => s.id === subId);
    return subcategory?.name || fullId;
  };

  // Remove selected service
  const removeSelectedService = (fullId: string) => {
    setSelectedSubcategories(prev => prev.filter(id => id !== fullId));
  };

  // Remove custom service
  const removeCustomService = (index: number) => {
    setCustomServices(prev => prev.filter((_, i) => i !== index));
  };

  // Smart category detection for custom services
  const detectCategory = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('repair') || name.includes('fix')) return 'repair';
    if (name.includes('clean')) return 'cleaning';
    if (name.includes('install')) return 'installation';
    if (name.includes('cook') || name.includes('food')) return 'cooking';
    if (name.includes('teach') || name.includes('tutor')) return 'teaching-learning';
    if (name.includes('photo')) return 'photography-videography';
    if (name.includes('drive')) return 'driver-rides';
    if (name.includes('deliver')) return 'delivery-pickup';
    return 'professional-help'; // Default fallback
  };

  // Add custom service
  const handleAddCustomService = () => {
    if (customServiceName.trim()) {
      setCustomServices([
        ...customServices,
        {
          name: customServiceName,
          category_id: detectCategory(customServiceName),
          price: customServicePrice ? Number(customServicePrice) : undefined
        }
      ]);
      setCustomServiceName('');
      setCustomServicePrice('');
      setShowCustomServiceInput(false);
      toast.success('Custom service added!');
    } else {
      toast.error('Please enter a service name');
    }
  };
  
  // Location
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [subArea, setSubArea] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [address, setAddress] = useState('');
  
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Load professional and roles on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading professional data...');
      console.log('📌 professionalSlug:', professionalSlug);
      
      const currentUser = await getCurrentUser();
      console.log('👤 Current user:', currentUser?.id);
      
      if (!currentUser) {
        toast.error('Please login to continue');
        onBack();
        return;
      }

      // Load roles
      const rolesResult = await getAllRoles();
      if (rolesResult.success && rolesResult.roles) {
        setRoles(rolesResult.roles);
        console.log('✅ Loaded roles:', rolesResult.roles.length);
      }

      // Get professional by slug if provided, otherwise get first professional for user
      let professionalData = null;
      
      if (professionalSlug) {
        console.log('🔍 Loading professional by slug:', professionalSlug);
        // Load by slug
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('slug', professionalSlug)
          .eq('user_id', currentUser.id) // Ensure user owns this professional
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('❌ Error loading professional by slug:', error);
          toast.error('Failed to load professional profile');
          onBack();
          return;
        }
        
        if (!data) {
          console.error('❌ No professional found with slug:', professionalSlug);
          toast.error('Professional profile not found');
          onBack();
          return;
        }
        
        professionalData = data;
        console.log('✅ Loaded professional by slug:', professionalData.id);
      } else {
        console.log('🔍 Loading professional by user_id');
        // Load by user_id (first professional)
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('❌ Error loading professional:', error);
          toast.error('Failed to load professional profile');
          onBack();
          return;
        }
        
        if (!data || data.length === 0) {
          console.error('❌ No professional found for user');
          toast.error('No professional profile found');
          onBack();
          return;
        }
        
        professionalData = data[0];
        console.log('✅ Loaded professional by user_id:', professionalData.id);
      }

      if (professionalData) {
        setProfessional(professionalData as any);
        
        // Set form fields
        setName(professionalData.name || '');
        setTitle(professionalData.title || '');
        setDescription(professionalData.description || '');
        setWhatsapp(professionalData.whatsapp || '');
        setCity(professionalData.city || globalCity || '');
        setArea(professionalData.area || globalArea || '');
        setSubArea(professionalData.subarea || globalSubArea || '');
        setLatitude(professionalData.latitude || globalLat);
        setLongitude(professionalData.longitude || globalLng);
        setAddress(professionalData.address || '');
        
        // Set profile image
        if (professionalData.profile_image_url) {
          setProfileImages([professionalData.profile_image_url]);
        }
        
        // Set role
        if (professionalData.role_id) {
          setSelectedRoleId(professionalData.role_id);
          await loadRoleDetails(professionalData.role_id);
        }
        
        // Load services
        const { data: servicesData } = await supabase
          .from('professional_services')
          .select('*')
          .eq('professional_id', professionalData.id);
        
        if (servicesData && servicesData.length > 0) {
          setServices(
            servicesData.map((s: any) => ({
              service_name: s.service_name,
              price: s.price,
            }))
          );
          
          // Convert loaded services to new format (subcategories + custom)
          const loadedSubcategories: string[] = [];
          const loadedCustomServices: CustomService[] = [];
          
          servicesData.forEach((s: any) => {
            // Try to match service name to existing subcategories
            let matched = false;
            for (const category of allServicesGrouped) {
              const matchedSub = category.subcategories.find(
                sub => sub.name.toLowerCase() === s.service_name.toLowerCase()
              );
              if (matchedSub) {
                loadedSubcategories.push(matchedSub.fullId);
                matched = true;
                break;
              }
            }
            
            // If not matched, treat as custom service
            if (!matched) {
              loadedCustomServices.push({
                name: s.service_name,
                category_id: detectCategory(s.service_name),
                price: s.price
              });
            }
          });
          
          setSelectedSubcategories(loadedSubcategories);
          setCustomServices(loadedCustomServices);
          console.log('✅ Loaded services:', servicesData.length);
          console.log('  - Standard services:', loadedSubcategories.length);
          console.log('  - Custom services:', loadedCustomServices.length);
        }
        
        // Load gallery images
        const { data: imagesData } = await supabase
          .from('professional_images')
          .select('image_url')
          .eq('professional_id', professionalData.id)
          .order('created_at', { ascending: true });
        
        if (imagesData && imagesData.length > 0) {
          setGalleryImages(imagesData.map((img: any) => img.image_url));
          console.log('✅ Loaded gallery images:', imagesData.length);
        }
        
        console.log('✅ Professional data loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load professional profile');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const loadRoleDetails = async (roleId: string) => {
    const result = await getRoleById(roleId);
    if (result.success && result.role) {
      setSelectedRole(result.role);
      console.log('✅ Loaded role details:', result.role.name);
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    loadRoleDetails(roleId);
  };

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
    console.log('📍 Location selected:', locationData);
    setCity(locationData.city || '');
    setArea(locationData.locality || ''); // locality from LocationSelector = area in our system
    setSubArea(''); // LocationSelector doesn't provide subArea
    setLatitude(locationData.latitude);
    setLongitude(locationData.longitude);
    setAddress(locationData.address || '');
    setShowLocationSelector(false); // Close the modal after selection
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Please enter your name or business name');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter your professional title');
      return;
    }
    if (!whatsapp.trim()) {
      toast.error('Please enter your WhatsApp number');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(whatsapp)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!city) {
      toast.error('Please select your location');
      return;
    }
    if (!selectedRoleId || !selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if (!professional) {
      toast.error('Professional data not loaded');
      return;
    }

    setSaving(true);

    try {
      // Get role subcategories
      const primarySubcategory = selectedRole.subcategories[0];
      const subcategoryIds = selectedRole.subcategories.map(sub => sub.subcategory_id);

      // Update professional basic info
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          name,
          title,
          description,
          whatsapp,
          city,
          area,
          subarea: subArea,
          latitude,
          longitude,
          address,
          profile_image_url: profileImages[0] || null,
          role_id: selectedRoleId,
          category_id: primarySubcategory.category_id,
          subcategory_id: primarySubcategory.subcategory_id,
          subcategory_ids: subcategoryIds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', professional.id);

      if (updateError) {
        throw updateError;
      }

      // Prepare services from both selected subcategories and custom services
      const servicesFromSubcategories = selectedSubcategories.map(fullId => ({
        service_name: getServiceName(fullId),
        price: undefined
      }));
      
      const servicesFromCustom = customServices.map(cs => ({
        service_name: cs.name,
        price: cs.price
      }));
      
      const allServices = [...servicesFromSubcategories, ...servicesFromCustom];

      // Update services
      // Delete existing services
      await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professional.id);

      // Insert new services
      if (allServices.length > 0) {
        const serviceInserts = allServices.map(s => ({
          professional_id: professional.id,
          service_name: s.service_name,
          price: s.price || null,
        }));

        await supabase
          .from('professional_services')
          .insert(serviceInserts);
      }

      // Update gallery images
      // Delete existing images
      await supabase
        .from('professional_images')
        .delete()
        .eq('professional_id', professional.id);

      // Insert new images
      if (galleryImages.length > 0) {
        const imageInserts = galleryImages.map((url, index) => ({
          professional_id: professional.id,
          image_url: url,
          display_order: index,
        }));

        await supabase
          .from('professional_images')
          .insert(imageInserts);
      }

      toast.success('Professional profile updated successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating professional:', error);
      toast.error(error.message || 'Failed to update professional profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-black flex-1">Edit Professional Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg font-semibold hover:bg-[#B8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Professional Role *
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
            required
          >
            <option value="">Select your role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <InputField
          label="Your Name / Business Name"
          value={name}
          onChange={setName}
          placeholder="Enter your name"
          required
        />

        {/* Title */}
        <InputField
          label="Professional Title"
          value={title}
          onChange={setTitle}
          placeholder="e.g., Certified Electrician"
          required
        />

        {/* WhatsApp */}
        <InputField
          label="WhatsApp Number"
          type="tel"
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="10-digit mobile number"
          maxLength={10}
          required
        />

        {/* Description */}
        <TextAreaField
          label="About You (Optional)"
          value={description}
          onChange={setDescription}
          placeholder="Tell customers about your experience and expertise..."
          rows={4}
        />

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Location *
          </label>
          <button
            type="button"
            onClick={() => setShowLocationSelector(true)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left text-sm hover:border-[#CDFF00] transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className={city ? 'text-black' : 'text-gray-500'}>
                {city ? `${area ? area + ', ' : ''}${city}` : 'Select Location'}
              </span>
            </div>
            {city && (
              <span className="text-xs text-gray-500">Edit</span>
            )}
          </button>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Profile Photo (Optional)
          </label>
          <ImageUploader
            images={profileImages}
            onImagesChange={setProfileImages}
            maxImages={1}
            aspectRatio="1:1"
          />
        </div>

        {/* Services - ENHANCED UI (Same as Registration) */}
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-black mb-3">
            Services You Offer *
          </label>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={serviceSearchQuery}
              onChange={(e) => setServiceSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
            />
          </div>

          {/* Selected Services Chips */}
          {(selectedSubcategories.length + customServices.length) > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedSubcategories.map((fullId) => (
                  <div
                    key={fullId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#CDFF00] rounded-full text-sm font-medium text-black"
                  >
                    <span>{getServiceName(fullId)}</span>
                    <button
                      onClick={() => removeSelectedService(fullId)}
                      className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {customServices.map((cs, index) => (
                  <div
                    key={`custom-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#CDFF00] rounded-full text-sm font-medium text-black"
                  >
                    <span>{cs.name}</span>
                    <button
                      onClick={() => removeCustomService(index)}
                      className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Services Section */}
          {!serviceSearchQuery && !showAllServices && recommendedServices.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-black mb-2 text-sm">Recommended for you</h3>
              <div className="space-y-2">
                {allServicesGrouped
                  .flatMap(cat => cat.subcategories)
                  .filter(sub => recommendedServices.includes(sub.fullId))
                  .map((subcategory) => {
                    const isSelected = selectedSubcategories.includes(subcategory.fullId);
                    
                    return (
                      <button
                        key={subcategory.fullId}
                        onClick={() => toggleSubcategory(subcategory.fullId)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#CDFF00] border-[#CDFF00] shadow-sm'
                            : 'bg-white border-gray-200 hover:border-[#CDFF00]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-black border-black' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#CDFF00]" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-black text-sm">{subcategory.name}</div>
                          <div className="text-xs text-gray-500">Recommended</div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* View All Services Button */}
          {!serviceSearchQuery && !showAllServices && (
            <div className="mb-4">
              <button
                onClick={() => setShowAllServices(true)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black font-medium hover:border-[#CDFF00] transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span>View all services</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* All Services List (when expanded or searching) */}
          {(showAllServices || serviceSearchQuery) && (
            <>
              {showAllServices && !serviceSearchQuery && (
                <div className="mb-2">
                  <button
                    onClick={() => setShowAllServices(false)}
                    className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span>Back to recommended</span>
                  </button>
                </div>
              )}
              
              <div className="mb-4 space-y-4 max-h-96 overflow-y-auto">
                {(serviceSearchQuery ? filteredServices : allServicesGrouped).map((category) => {
                  if (category.subcategories.length === 0) return null;
                  
                  return (
                    <div key={category.id}>
                      <h4 className="font-semibold text-black mb-2 flex items-center gap-2 text-sm">
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                      </h4>
                      <div className="space-y-2">
                        {category.subcategories.map((subcategory) => {
                          const isSelected = selectedSubcategories.includes(subcategory.fullId);
                          
                          return (
                            <button
                              key={subcategory.fullId}
                              onClick={() => toggleSubcategory(subcategory.fullId)}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-[#CDFF00] border-[#CDFF00] shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-[#CDFF00]'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-black border-black' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#CDFF00]" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-black text-sm">{subcategory.name}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {(serviceSearchQuery ? filteredServices : allServicesGrouped).every(cat => cat.subcategories.length === 0) && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No services found
                  </div>
                )}
              </div>
            </>
          )}

          {/* Add Custom Service Section */}
          <div>
            {showCustomServiceInput ? (
              <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-black text-sm">Add your service</h4>
                  <button
                    onClick={() => {
                      setShowCustomServiceInput(false);
                      setCustomServiceName('');
                      setCustomServicePrice('');
                    }}
                    className="text-gray-500 hover:text-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <input
                  type="text"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="Service name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
                />
                
                <input
                  type="number"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  placeholder="Price (₹) - Optional"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
                />
                
                <button
                  onClick={handleAddCustomService}
                  className="w-full px-4 py-2.5 bg-[#CDFF00] text-black rounded-lg font-semibold hover:bg-[#B8E600] transition-colors text-sm"
                >
                  Add Service
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomServiceInput(true)}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-[#CDFF00] hover:text-black transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Add your service</span>
              </button>
            )}
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Work Photos (Optional)
          </label>
          <ImageUploader
            images={galleryImages}
            onImagesChange={setGalleryImages}
            maxImages={5}
          />
        </div>
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          onClose={() => setShowLocationSelector(false)}
          onLocationSelect={handleLocationChange}
          currentLocation={latitude && longitude ? {
            latitude,
            longitude,
            city: city || ''
          } : null}
        />
      )}
    </div>
  );
}