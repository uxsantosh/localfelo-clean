import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Plus, MapPin } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { Professional, ProfessionalService } from '../services/professionals';
import { getCurrentUser } from '../services/auth';

interface EditProfessionalScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  professionalId?: string;
}

export function EditProfessionalScreen({
  onBack,
  onSuccess,
  professionalId,
}: EditProfessionalScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [services, setServices] = useState<{ service_name: string; price?: number }[]>([
    { service_name: '', price: undefined },
  ]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryImage, setNewGalleryImage] = useState('');

  // Load professional data
  useEffect(() => {
    loadProfessional();
  }, []);

  const loadProfessional = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast.error('Please login to continue');
        onBack();
        return;
      }

      // Get professional by user_id
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          professional_services(*),
          professional_images(*)
        `)
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading professional:', error);
        toast.error('Failed to load professional profile');
        onBack();
        return;
      }

      if (data) {
        setProfessional(data as any);
        setName(data.name || '');
        setTitle(data.title || '');
        setDescription(data.description || '');
        setWhatsapp(data.whatsapp || '');
        setAddress(data.address || '');
        setProfileImageUrl(data.profile_image_url || '');
        
        // Load services
        if (data.professional_services && data.professional_services.length > 0) {
          setServices(
            data.professional_services.map((s: any) => ({
              service_name: s.service_name,
              price: s.price,
            }))
          );
        }
        
        // Load images
        if (data.professional_images && data.professional_images.length > 0) {
          setGalleryImages(data.professional_images.map((img: any) => img.image_url));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load professional profile');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    setServices([...services, { service_name: '', price: undefined }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: 'service_name' | 'price', value: string | number) => {
    const updated = [...services];
    if (field === 'price') {
      updated[index].price = value ? Number(value) : undefined;
    } else {
      updated[index].service_name = value as string;
    }
    setServices(updated);
  };

  const addGalleryImage = () => {
    if (newGalleryImage.trim()) {
      setGalleryImages([...galleryImages, newGalleryImage.trim()]);
      setNewGalleryImage('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!professional) return;

    // Validation
    if (!name.trim()) {
      toast.error('Please enter business name');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter your title/designation');
      return;
    }
    if (!whatsapp.trim()) {
      toast.error('Please enter WhatsApp number');
      return;
    }

    // Validate services
    const validServices = services.filter(s => s.service_name.trim());
    if (validServices.length === 0) {
      toast.error('Please add at least one service');
      return;
    }

    setSaving(true);
    try {
      // Update professional profile
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          name: name.trim(),
          title: title.trim(),
          description: description.trim(),
          whatsapp: whatsapp.trim(),
          address: address.trim(),
          profile_image_url: profileImageUrl.trim() || null,
        })
        .eq('id', professional.id);

      if (updateError) throw updateError;

      // Update services - delete old ones and insert new ones
      await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professional.id);

      if (validServices.length > 0) {
        const { error: servicesError } = await supabase
          .from('professional_services')
          .insert(
            validServices.map(s => ({
              professional_id: professional.id,
              service_name: s.service_name.trim(),
              price: s.price,
            }))
          );

        if (servicesError) throw servicesError;
      }

      // Update gallery images - delete old ones and insert new ones
      await supabase
        .from('professional_images')
        .delete()
        .eq('professional_id', professional.id);

      if (galleryImages.length > 0) {
        const { error: imagesError } = await supabase
          .from('professional_images')
          .insert(
            galleryImages.map(url => ({
              professional_id: professional.id,
              image_url: url.trim(),
            }))
          );

        if (imagesError) throw imagesError;
      }

      toast.success('Professional profile updated successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating professional:', error);
      toast.error(error.message || 'Failed to update profile');
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

  if (!professional) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Professional Profile Found</h2>
          <p className="text-gray-600 mb-4">You haven't registered as a professional yet.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            disabled={saving}
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-lg font-bold text-black flex-1">Edit Professional Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg font-semibold hover:bg-[#B8E600] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-bold text-black mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business/Professional Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                placeholder="e.g., Sharma Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Title/Designation *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                placeholder="e.g., Electrician, Plumber, Tutor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Your Business
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                placeholder="Describe your experience, expertise, and what makes you unique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                placeholder="919876543210"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 91 for India)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Business Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                placeholder="Shop No. 5, Main Market, Andheri West"
              />
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-bold text-black mb-4">Profile Image</h2>
          <div className="space-y-3">
            <input
              type="url"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {profileImageUrl && (
              <img
                src={profileImageUrl}
                alt="Profile preview"
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-black">Services Offered *</h2>
            <button
              onClick={addService}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#CDFF00] text-black rounded-lg text-sm font-medium hover:bg-[#B8E600] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>
          
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={service.service_name}
                  onChange={(e) => updateService(index, 'service_name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                  placeholder="Service name"
                />
                <input
                  type="number"
                  value={service.price || ''}
                  onChange={(e) => updateService(index, 'price', e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                  placeholder="Price (₹)"
                />
                {services.length > 1 && (
                  <button
                    onClick={() => removeService(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Images */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-bold text-black mb-4">Gallery Images</h2>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={newGalleryImage}
                onChange={(e) => setNewGalleryImage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGalleryImage();
                  }
                }}
              />
              <button
                onClick={addGalleryImage}
                className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg font-medium hover:bg-[#B8E600] transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
