import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../services/auth';

interface VerificationModalProps {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerificationModal({
  professionalId,
  professionalName,
  onClose,
  onSuccess,
}: VerificationModalProps) {
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Aadhar card image must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setAadharFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadharPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aadharFile || !photoFile) {
      toast.error('Please upload both Aadhar card and photo');
      return;
    }

    setUploading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('Please login to submit verification');
        return;
      }

      // Upload Aadhar card
      const aadharFileName = `${professionalId}_aadhar_${Date.now()}.${aadharFile.name.split('.').pop()}`;
      const { data: aadharData, error: aadharError } = await supabase.storage
        .from('professional-verification-docs')
        .upload(aadharFileName, aadharFile);

      if (aadharError) {
        console.error('Aadhar upload error:', aadharError);
        toast.error('Failed to upload Aadhar card');
        return;
      }

      // Upload photo
      const photoFileName = `${professionalId}_photo_${Date.now()}.${photoFile.name.split('.').pop()}`;
      const { data: photoData, error: photoError } = await supabase.storage
        .from('professional-verification-docs')
        .upload(photoFileName, photoFile);

      if (photoError) {
        console.error('Photo upload error:', photoError);
        toast.error('Failed to upload photo');
        return;
      }

      // Get public URLs
      const { data: aadharUrl } = supabase.storage
        .from('professional-verification-docs')
        .getPublicUrl(aadharData.path);

      const { data: photoUrl } = supabase.storage
        .from('professional-verification-docs')
        .getPublicUrl(photoData.path);

      // Save to database
      const { error: dbError } = await supabase
        .from('professional_verification_documents')
        .insert({
          professional_id: professionalId,
          user_id: user.id,
          aadhar_card_url: aadharUrl.publicUrl,
          photo_url: photoUrl.publicUrl,
          status: 'pending',
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Failed to save verification documents');
        return;
      }

      // Update professional verification status
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          verification_status: 'pending',
          verification_requested_at: new Date().toISOString(),
        })
        .eq('id', professionalId);

      if (updateError) {
        console.error('Update error:', updateError);
      }

      toast.success('Verification documents submitted successfully! We will review and update the status within 24 hours.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Verification submission error:', error);
      toast.error('Failed to submit verification');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-black">Get Verified</h2>
            <p className="text-sm text-gray-600 mt-1">
              Verify your identity for {professionalName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-blue-900 mb-1">Verification Process</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Upload a clear photo of your Aadhar card</li>
                <li>• Upload a recent photo of yourself</li>
                <li>• Our team will review within 24 hours</li>
                <li>• You'll get a verified badge once approved</li>
              </ul>
            </div>
          </div>

          {/* Aadhar Card Upload */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Aadhar Card <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#CDFF00] transition-colors">
              {aadharPreview ? (
                <div className="space-y-3">
                  <img
                    src={aadharPreview}
                    alt="Aadhar preview"
                    className="max-h-48 mx-auto rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAadharFile(null);
                      setAadharPreview(null);
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload Aadhar card
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAadharChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Your Photo <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#CDFF00] transition-colors">
              {photoPreview ? (
                <div className="space-y-3">
                  <img
                    src={photoPreview}
                    alt="Photo preview"
                    className="max-h-48 mx-auto rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload your photo
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!aadharFile || !photoFile || uploading}
              className="flex-1 px-6 py-3 bg-[#CDFF00] text-black rounded-xl font-semibold hover:bg-[#B8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit for Verification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
