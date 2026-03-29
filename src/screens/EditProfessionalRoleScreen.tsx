// =====================================================
// EDIT PROFESSIONAL ROLE SCREEN - 2026 MODERN UI (FIXED)
// =====================================================

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
import { SERVICE_CATEGORIES } from '../services/serviceCategories';
import type { Professional } from '../services/professionals';
import type { Role } from '../services/roles';

// ================= SAFE HELPERS =================
const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

export function EditProfessionalRoleScreen(props: any) {
  const { onBack, onSuccess, professionalSlug, globalCity, globalArea, globalSubArea, globalLat, globalLng } = props;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // 🔥 FIX 1: always array
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<any[]>([]);

  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [subArea, setSubArea] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [address, setAddress] = useState('');

  const [showLocationSelector, setShowLocationSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast.error('Please login to continue');
        onBack();
        return;
      }

      const rolesResult = await getAllRoles();
      if (rolesResult.success) setRoles(rolesResult.roles || []);

      const { data } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1);

      if (!data || data.length === 0) {
        toast.error('No professional profile found');
        onBack();
        return;
      }

      const prof = data[0];
      setProfessional(prof);

      setName(prof.name || '');
      setTitle(prof.title || '');
      setDescription(prof.description || '');
      setWhatsapp(prof.whatsapp || '');

      setCity(prof.city || globalCity || '');
      setArea(prof.area || globalArea || '');
      setSubArea(prof.subarea || globalSubArea || '');

      setLatitude(prof.latitude || globalLat);
      setLongitude(prof.longitude || globalLng);

      setAddress(prof.address || '');

      setProfileImages(prof.profile_image_url ? [prof.profile_image_url] : []);

      if (prof.role_id) {
        setSelectedRoleId(prof.role_id);
        const roleRes = await getRoleById(prof.role_id);
        if (roleRes.success) setSelectedRole(roleRes.role);
      }

      // 🔥 FIX 2: safe load
      setSelectedSubcategories(safeArray(prof.subcategory_ids));

    } catch (e) {
      console.error(e);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!professional) return;

    if (!name.trim()) return toast.error('Please enter name');
    if (!title.trim()) return toast.error('Please enter title');
    if (!whatsapp.trim()) return toast.error('Please enter WhatsApp');
    if (!city) return toast.error('Please select location');
    if (!selectedRoleId) return toast.error('Please select role');

    setSaving(true);

    try {
      // 🔥 FIX 3: safe subcategories
      const safeSubs = safeArray(selectedSubcategories);
      const primarySub = safeSubs?.[0] || null;

      const { error } = await supabase
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
          profile_image_url: profileImages?.[0] || null, // 🔥 SAFE
          role_id: selectedRoleId,
          subcategory_ids: safeSubs,
          subcategory_id: primarySub,
          updated_at: new Date().toISOString(),
        })
        .eq('id', professional.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      onSuccess();

    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Update failed');
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

      {/* HEADER (UNCHANGED) */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-black flex-1">Edit Professional Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg font-semibold hover:bg-[#B8E600]"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <InputField label="Name" value={name} onChange={setName} />
        <InputField label="Title" value={title} onChange={setTitle} />
        <InputField label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
        <TextAreaField label="Description" value={description} onChange={setDescription} />

        <ImageUploader images={profileImages} onImagesChange={setProfileImages} maxImages={1} />
        <ImageUploader images={galleryImages} onImagesChange={setGalleryImages} maxImages={5} />
      </div>

      {showLocationSelector && (
        <LocationSelector
          onClose={() => setShowLocationSelector(false)}
          onLocationSelect={(loc: any) => {
            setCity(loc.city);
            setArea(loc.locality);
            setLatitude(loc.latitude);
            setLongitude(loc.longitude);
            setShowLocationSelector(false);
          }}
        />
      )}
    </div>
  );
}