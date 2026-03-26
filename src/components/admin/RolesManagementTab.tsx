// =====================================================
// ROLES MANAGEMENT TAB (ADMIN)
// =====================================================
// Admin interface for managing professional roles

import { useState, useEffect } from 'react';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getAllRoles, updateRoleImage, createRole } from '../../services/roles';
import { uploadImage } from '../../services/avatarUpload';
import type { Role } from '../../services/roles';

export function RolesManagementTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingRoleId, setUploadingRoleId] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const result = await getAllRoles();
      if (result.success && result.roles) {
        setRoles(result.roles);
      } else {
        toast.error('Failed to load roles');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (roleId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingRoleId(roleId);

    try {
      // Upload image
      const uploadResult = await uploadImage(file);
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }

      // Update role with image URL
      const updateResult = await updateRoleImage(roleId, uploadResult.url, '');
      if (updateResult.success) {
        toast.success('Role image updated successfully');
        loadRoles(); // Reload to show new image
      } else {
        toast.error(updateResult.error || 'Failed to update role image');
      }
    } catch (error: any) {
      console.error('Error uploading role image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingRoleId(null);
      // Reset file input
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-black mb-2">Manage Professional Roles</h2>
        <p className="text-sm text-gray-600">
          Upload images for each professional role. These images will be shown on the Professionals home screen.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Total Roles</div>
          <div className="text-2xl font-bold text-black mt-1">{roles.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600">With Images</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {roles.filter(r => r.image_url).length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Without Images</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">
            {roles.filter(r => !r.image_url).length}
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-black">All Roles</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#CDFF00] transition-colors"
            >
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative">
                {role.image_url ? (
                  <img
                    src={role.image_url}
                    alt={role.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Upload overlay */}
                <label
                  htmlFor={`role-image-${role.id}`}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingRoleId === role.id ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <div className="text-center text-white">
                      <Upload className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-xs">Upload Image</span>
                    </div>
                  )}
                </label>
                <input
                  id={`role-image-${role.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(role.id, e)}
                  className="hidden"
                  disabled={uploadingRoleId === role.id}
                />
              </div>

              {/* Name */}
              <div className="p-3 border-t border-gray-200">
                <h4 className="font-semibold text-black text-sm text-center line-clamp-2">
                  {role.name}
                </h4>
                {role.image_url && (
                  <div className="text-xs text-green-600 text-center mt-1">
                    ✓ Has image
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-semibold text-black mb-2 text-sm">💡 Tips for Role Images</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Use square images (1:1 aspect ratio) for best results</li>
          <li>• Recommended size: 400x400 pixels or larger</li>
          <li>• Use simple, recognizable icons or illustrations</li>
          <li>• Keep file size under 5MB</li>
          <li>• PNG format with transparent background works best</li>
        </ul>
      </div>
    </div>
  );
}
