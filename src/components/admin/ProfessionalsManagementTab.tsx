import { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  getAllProfessionals,
  updateProfessionalStatus,
  deleteProfessional,
  uploadCategoryImage,
  Professional,
} from '../../services/professionals';
import { LOCKED_PROFESSIONAL_ROLES } from '../../services/professionalRoles';

export function ProfessionalsManagementTab() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryForImage, setSelectedCategoryForImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const data = await getAllProfessionals();
      setProfessionals(data);
    } catch (error) {
      console.error('Error loading professionals:', error);
      toast.error('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (professionalId: string, currentStatus: boolean) => {
    const result = await updateProfessionalStatus(professionalId, !currentStatus);
    if (result.success) {
      toast.success(`Professional ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadProfessionals();
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const handleDelete = async (professionalId: string) => {
    if (!confirm('Are you sure you want to delete this professional?')) return;

    const result = await deleteProfessional(professionalId);
    if (result.success) {
      toast.success('Professional deleted successfully');
      loadProfessionals();
    } else {
      toast.error(result.error || 'Failed to delete professional');
    }
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCategoryForImage) return;

    setUploadingImage(true);
    try {
      // Import upload functions
      const { compressImageToBase64 } = await import('../../services/imageCompression');
      const { uploadImage } = await import('../../services/avatarUpload');
      const { uploadCategoryImage } = await import('../../services/professionals');
      
      // Compress image
      const compressedBase64 = await compressImageToBase64(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        maxSizeMB: 0.3
      });
      
      // Upload to storage (use a dummy user ID for category images)
      const uploadResult = await uploadImage(compressedBase64, 'category-images');
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }
      
      // Save to database
      const result = await uploadCategoryImage(selectedCategoryForImage, uploadResult.url);
      
      if (result.success) {
        toast.success('Category image uploaded successfully!');
        setSelectedCategoryForImage('');
      } else {
        throw new Error(result.error || 'Failed to save category image');
      }
    } catch (error: any) {
      console.error('Category image upload error:', error);
      toast.error(error.message || 'Failed to upload category image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Total Professionals</div>
          <div className="text-2xl font-bold text-black mt-1">
            {professionals.length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {professionals.filter((p) => p.is_active).length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Inactive</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">
            {professionals.filter((p) => !p.is_active).length}
          </div>
        </div>
      </div>

      {/* Category Image Upload */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h3 className="text-base font-bold text-black mb-3">
          Upload Role Card Images
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Upload images for professional role cards (e.g., Electrician, Plumber, etc.)
        </p>
        <div className="flex gap-3">
          <select
            value={selectedCategoryForImage}
            onChange={(e) => setSelectedCategoryForImage(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Select professional role</option>
            {LOCKED_PROFESSIONAL_ROLES.map((group) => (
              <optgroup key={group.name} label={group.name}>
                {group.roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <label className="px-4 py-2 bg-black text-[#CDFF00] rounded-md text-sm font-medium hover:bg-gray-900 transition-colors cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleCategoryImageUpload}
              className="hidden"
              disabled={!selectedCategoryForImage || uploadingImage}
            />
          </label>
        </div>
        {uploadingImage && (
          <div className="mt-3 text-sm text-gray-600">Uploading image...</div>
        )}
      </div>

      {/* Professionals List */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-black">All Professionals</h3>
          <button
            onClick={loadProfessionals}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Services
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {professionals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No professionals registered yet
                  </td>
                </tr>
              ) : (
                professionals.map((professional) => (
                  <tr key={professional.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {professional.profile_image_url && (
                          <img
                            src={professional.profile_image_url}
                            alt={professional.name}
                            className="w-8 h-8 rounded-md object-cover"
                          />
                        )}
                        <span className="font-medium text-black">
                          {professional.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {professional.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {professional.category_name || professional.category_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {professional.city_name || professional.city}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {professional.services?.length || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          professional.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {professional.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleActive(professional.id, professional.is_active)
                          }
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={
                            professional.is_active ? 'Deactivate' : 'Activate'
                          }
                        >
                          {professional.is_active ? (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(professional.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}