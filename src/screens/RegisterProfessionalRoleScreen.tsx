// =====================================================
// REGISTER PROFESSIONAL ROLE SCREEN
// =====================================================
// Role-based professional registration flow
// Step 1: Select Role → Step 2: Select Services (MANDATORY) → Step 3: Profile Details

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, X, CheckCircle2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InputField } from '../components/InputField';
import { TextAreaField } from '../components/TextAreaField';
import { LocationSelector } from '../components/LocationSelector';
import { ImageUploader } from '../components/ImageUploader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { createProfessional } from '../services/professionals';
import { getAllRoles, getRoleById } from '../services/roles';
import { getCurrentUser, getClientToken } from '../services/authHelpers';
import { uploadImage } from '../services/avatarUpload';
import { SERVICE_CATEGORIES, type ServiceCategory, type ServiceSubcategory } from '../services/serviceCategories';
import type { Role } from '../services/roles';
import { LOCKED_PROFESSIONAL_ROLES, getSubcategoriesForRole } from '../services/professionalRoles';

// Remove deprecated mapping
// Use getSubcategoriesForRole instead for specific subcategory recommendations

interface Service {
  service_name: string;
  price?: number;
}

interface CustomService {
  name: string;
  category_id: string;
  price?: number;
}

interface RegisterProfessionalRoleScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  // Global location props
  globalCity?: string;
  globalArea?: string;
  globalSubArea?: string;
  globalLat?: number;
  globalLng?: number;
}

export function RegisterProfessionalRoleScreen({
  onBack,
  onSuccess,
  globalCity,
  globalArea,
  globalSubArea,
  globalLat,
  globalLng,
}: RegisterProfessionalRoleScreenProps) {
  // Step 1: Role selection, Step 2: Service selection, Step 3: Profile details, Step 4: Services & Images
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // NEW: Service/Subcategory selection (Step 2)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]); // Format: "category_id:subcategory_id"
  const [customServices, setCustomServices] = useState<CustomService[]>([]); // NEW: Custom services
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  
  // Step 3: Profile details
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([{ service_name: '', price: undefined }]);
  
  // Location - Initialize with global location
  const [city, setCity] = useState(globalCity || '');
  const [area, setArea] = useState(globalArea || '');
  const [subArea, setSubArea] = useState(globalSubArea || '');
  const [latitude, setLatitude] = useState(globalLat);
  const [longitude, setLongitude] = useState(globalLng);
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load roles on mount
  useEffect(() => {
    loadRoles();
    window.scrollTo(0, 0);
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    const result = await getAllRoles();
    if (result.success && result.roles) {
      setRoles(result.roles);
    }
    setLoading(false);
  };

  // Load role details when selected
  useEffect(() => {
    if (selectedRoleId) {
      loadRoleDetails();
    }
  }, [selectedRoleId]);

  const loadRoleDetails = async () => {
    const result = await getRoleById(selectedRoleId);
    if (result.success && result.role) {
      setSelectedRole(result.role);
      setTitle(result.role.name); // Auto-fill title with role name
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
    setStep(2); // Go to service selection
  };

  // Get recommended services for selected role
  const recommendedSubcategories = useMemo(() => {
    if (!selectedRole) return [];
    
    // Get subcategory IDs mapped to this role
    const subcategoryIds = getSubcategoriesForRole(selectedRole.name);
    
    return subcategoryIds;
  }, [selectedRole]);

  // Get all services with category grouping
  const allServicesGrouped = useMemo(() => {
    return SERVICE_CATEGORIES.map(category => ({
      ...category,
      subcategories: category.subcategories.map(sub => ({
        ...sub,
        fullId: `${category.id}:${sub.id}`,
        categoryName: category.name,
      }))
    }));
  }, []);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!serviceSearchQuery) return allServicesGrouped;
    
    const query = serviceSearchQuery.toLowerCase();
    return allServicesGrouped.map(category => ({
      ...category,
      subcategories: category.subcategories.filter(sub =>
        sub.name.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query)
      )
    })).filter(cat => cat.subcategories.length > 0);
  }, [serviceSearchQuery, allServicesGrouped]);

  const toggleSubcategory = (fullId: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(fullId)
        ? prev.filter(id => id !== fullId)
        : [...prev, fullId]
    );
  };

  const handleServiceSelectionNext = () => {
    if (selectedSubcategories.length === 0 && customServices.length === 0) {
      toast.error('Please select at least one service you offer');
      return;
    }
    setStep(3); // Go to profile details
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

  const handleProfileDetailsNext = () => {
    // Validation for step 3
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

    setStep(4); // Go to services & images
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error('Invalid role selected');
      return;
    }

    if (selectedSubcategories.length === 0 && customServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setSubmitting(true);

    try {
      // Parse selected subcategories to get category_id and subcategory_id
      const parsedSubcategories = selectedSubcategories.map(fullId => {
        const [category_id, subcategory_id] = fullId.split(':');
        return { category_id, subcategory_id };
      });

      // Use the first selected subcategory as primary for compatibility
      const primarySubcategory = parsedSubcategories[0];

      // Filter out empty services
      const validServices = services.filter(s => s.service_name.trim());

      const professionalData = {
        name,
        title,
        category_id: primarySubcategory.category_id,
        subcategory_id: primarySubcategory.subcategory_id, // Primary subcategory for compatibility
        subcategory_ids: parsedSubcategories.map(s => s.subcategory_id), // All selected subcategories
        role_id: selectedRoleId, // Store role ID for quick lookups
        description,
        whatsapp,
        profile_image_url: profileImages[0],
        city,
        area,
        subarea: subArea,
        latitude,
        longitude,
        address,
        services: [...validServices, ...customServices.map(cs => ({ service_name: cs.name, price: cs.price }))],
        images: galleryImages,
      };

      const result = await createProfessional(user.id, professionalData);

      if (result.success) {
        toast.success('Professional profile created successfully!');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to create professional profile');
      }
    } catch (error: any) {
      console.error('Error creating professional:', error);
      toast.error(error.message || 'Failed to create professional profile');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group roles by their groups from LOCKED_PROFESSIONAL_ROLES
  const groupedRoles = useMemo(() => {
    const grouped: { group: typeof LOCKED_PROFESSIONAL_ROLES[0]; roles: Role[] }[] = [];

    LOCKED_PROFESSIONAL_ROLES.forEach(roleGroup => {
      const matchingRoles = (searchQuery ? filteredRoles : roles).filter(role =>
        roleGroup.roles.includes(role.name)
      );

      if (matchingRoles.length > 0) {
        grouped.push({
          group: roleGroup,
          roles: matchingRoles.sort((a, b) => {
            const aIndex = roleGroup.roles.indexOf(a.name);
            const bIndex = roleGroup.roles.indexOf(b.name);
            return aIndex - bIndex;
          })
        });
      }
    });

    return grouped;
  }, [roles, filteredRoles, searchQuery]);

  // Step 1: Role Selection
  if (step === 1) {
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
            <div>
              <h1 className="font-bold text-black">Register as Professional</h1>
              <p className="text-xs text-gray-600">Step 1: What do you do?</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your profession..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
          />
        </div>

        {/* Roles Grid */}
        <div className="px-4 pb-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : groupedRoles.length > 0 ? (
            groupedRoles.map(group => (
              <div key={group.group.name} className="mb-4">
                <h2 className="font-semibold text-black mb-3">{group.group.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#CDFF00] hover:shadow-md transition-all text-center"
                    >
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-[#CDFF00]/20 to-[#B8E600]/20 mb-2 flex items-center justify-center">
                        {role.image_url ? (
                          <img
                            src={role.image_url}
                            alt={role.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-3xl">👤</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-black text-sm line-clamp-2">{role.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No matching professions found
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Service Selection (NEW - MANDATORY)
  if (step === 2) {
    const totalSelected = selectedSubcategories.length + customServices.length;
    
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

    return (
      <div className="min-h-screen bg-white pb-32">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-black">Select services you offer</h1>
              <p className="text-xs text-gray-600">
                {totalSelected === 0 ? (
                  <span className="text-red-600">Select at least 1 service</span>
                ) : (
                  <span>{totalSelected} selected</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={serviceSearchQuery}
              onChange={(e) => setServiceSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Selected Services Chips */}
        {totalSelected > 0 && (
          <div className="px-4 pb-4">
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
        {!serviceSearchQuery && !showAllServices && recommendedSubcategories.length > 0 && (
          <div className="px-4 pb-4">
            <h2 className="font-semibold text-black mb-3">Recommended for you</h2>
            <div className="space-y-2">
              {allServicesGrouped
                .flatMap(cat => cat.subcategories)
                .filter(sub => recommendedSubcategories.includes(sub.fullId))
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
                        <div className="font-medium text-black">{subcategory.name}</div>
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
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowAllServices(true)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black font-medium hover:border-[#CDFF00] transition-colors flex items-center justify-center gap-2"
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
              <div className="px-4 pb-2">
                <button
                  onClick={() => setShowAllServices(false)}
                  className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Back to recommended</span>
                </button>
              </div>
            )}
            
            <div className="px-4 pb-4 space-y-4">
              {(serviceSearchQuery ? filteredServices : allServicesGrouped).map((category) => {
                if (category.subcategories.length === 0) return null;
                
                return (
                  <div key={category.id}>
                    <h3 className="font-semibold text-black mb-2 flex items-center gap-2">
                      <span>{category.emoji}</span>
                      <span>{category.name}</span>
                    </h3>
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
                              <div className="font-medium text-black">{subcategory.name}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {(serviceSearchQuery ? filteredServices : allServicesGrouped).every(cat => cat.subcategories.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  No services found
                </div>
              )}
            </div>
          </>
        )}

        {/* Add Custom Service Section */}
        <div className="px-4 pb-4">
          {showCustomServiceInput ? (
            <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-black">Add your service</h3>
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
                onClick={() => {
                  if (customServiceName.trim()) {
                    // Auto-detect category based on keywords
                    const detectCategory = () => {
                      const name = customServiceName.toLowerCase();
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
                    
                    setCustomServices([
                      ...customServices, 
                      { 
                        name: customServiceName, 
                        category_id: detectCategory(),
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
                }}
                className="w-full px-4 py-2.5 bg-[#CDFF00] text-black rounded-lg font-semibold hover:bg-[#B8E600] transition-colors"
              >
                Add Service
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomServiceInput(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-[#CDFF00] hover:text-black transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add your service</span>
            </button>
          )}
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <button
            onClick={handleServiceSelectionNext}
            disabled={totalSelected === 0}
            className="w-full px-6 py-3 bg-[#CDFF00] text-black rounded-lg font-semibold hover:bg-[#B8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {totalSelected === 0 ? (
              'Select at least 1 service'
            ) : (
              `Continue with ${totalSelected} service${totalSelected !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Profile Details
  if (step === 3) {
    return (
      <div className="min-h-screen bg-white pb-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="font-bold text-black">Register as {selectedRole?.name}</h1>
              <p className="text-xs text-gray-600">Step 3: Your Details</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleProfileDetailsNext(); }} className="px-4 py-6 space-y-6">
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
              <span className={city ? 'text-black' : 'text-gray-500'}>
                {city ? `${area ? area + ', ' : ''}${city}` : 'Select Location'}
              </span>
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

          <button
            type="submit"
            className="w-full px-6 py-3 bg-black text-[#CDFF00] rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Next: Add Work Photos
          </button>
        </form>

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

  // Step 4: Services & Images
  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep(3)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-black">Register as {selectedRole?.name}</h1>
            <p className="text-xs text-gray-600">Step 4: Work Photos (Optional)</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Work Photos (Optional)
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Add photos of your work to help customers see your quality
          </p>
          <ImageUploader
            images={galleryImages}
            onImagesChange={setGalleryImages}
            maxImages={5}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-[#CDFF00] text-black rounded-lg font-semibold hover:bg-[#B8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Creating Profile...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Create Professional Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}