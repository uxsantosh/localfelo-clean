import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Plus, Users } from 'lucide-react';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from 'sonner@2.0.3';
import { getUserProfessionals, deleteProfessional } from '../services/professionals';
import { Professional } from '../services/professionals';

interface ManageProfessionalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (slug: string) => void;
  onCreateNew: () => void;
  userId: string;
}

export function ManageProfessionalsModal({
  isOpen,
  onClose,
  onEdit,
  onCreateNew,
  userId,
}: ManageProfessionalsModalProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfessionals();
    }
  }, [isOpen, userId]);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const result = await getUserProfessionals(userId);
      if (result.success && result.professionals) {
        setProfessionals(result.professionals);
      }
    } catch (error) {
      console.error('Failed to load professionals:', error);
      toast.error('Failed to load professional profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(id);
    try {
      const result = await deleteProfessional(id);
      if (result.success) {
        toast.success('Professional profile deleted successfully');
        // Remove from local state
        setProfessionals(professionals.filter(p => p.id !== id));
      } else {
        toast.error(result.error || 'Failed to delete professional profile');
      }
    } catch (error) {
      console.error('Failed to delete professional:', error);
      toast.error('Failed to delete professional profile');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (slug: string) => {
    onEdit(slug);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 -mx-6 -mt-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-black">Manage Professional Profiles</h2>
              <p className="text-sm text-gray-600 mt-1">
                {professionals.length} {professionals.length === 1 ? 'profile' : 'profiles'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No professional profiles yet</p>
            <button
              onClick={() => {
                onCreateNew();
                onClose();
              }}
              className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors font-semibold"
            >
              Create Your First Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {professionals.map((professional) => (
              <div
                key={professional.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
              >
                <div className="flex gap-4">
                  {/* Profile Image */}
                  {professional.profile_image_url ? (
                    <img
                      src={professional.profile_image_url}
                      alt={professional.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#CDFF00] to-[#B8E600] flex items-center justify-center flex-shrink-0">
                      <Users className="w-8 h-8 text-black" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black truncate">{professional.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{professional.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {professional.category_emoji} {professional.category_name || professional.category_id}
                      </span>
                      {professional.subcategory_name && (
                        <span className="text-xs px-2 py-1 bg-[#CDFF00]/20 text-black rounded">
                          {professional.subcategory_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {professional.city}{professional.area && `, ${professional.area}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${professional.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {professional.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {professional.services && professional.services.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {professional.services.length} {professional.services.length === 1 ? 'service' : 'services'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(professional.slug)}
                      className="p-2 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors"
                      title="Edit profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(professional.id, professional.name)}
                      disabled={deleting === professional.id}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      title="Delete profile"
                    >
                      {deleting === professional.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Button */}
            <button
              onClick={() => {
                onCreateNew();
                onClose();
              }}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#CDFF00] hover:bg-[#CDFF00]/10 transition-all text-gray-600 hover:text-black font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Another Professional Profile
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}