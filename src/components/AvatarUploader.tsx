import { useState, useRef, useEffect } from 'react';
import { Camera, User, AlertCircle } from 'lucide-react';
import { compressImageToBase64 } from '../services/imageCompression';
import { detectNSFW, loadNSFWModel } from '../services/nsfwDetection';

interface AvatarUploaderProps {
  currentAvatar?: string;
  onAvatarChange: (base64: string) => void;
  disabled?: boolean;
}

export function AvatarUploader({ currentAvatar, onAvatarChange, disabled }: AvatarUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load NSFW model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        await loadNSFWModel();
        setModelLoading(false);
      } catch (err) {
        console.error('Failed to load NSFW model:', err);
        setModelLoading(false);
      }
    };
    loadModel();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Compress image to base64
      const base64 = await compressImageToBase64(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        maxSizeMB: 1
      });
      
      // Check for NSFW content
      try {
        const result = await detectNSFW(base64);
        if (result.isNSFW) {
          setError('Inappropriate content detected. Please upload a suitable profile photo.');
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        console.error('NSFW check failed:', err);
        // Continue anyway if detection fails
      }

      onAvatarChange(base64);
      setIsProcessing(false);
    } catch (err) {
      console.error('Failed to process image:', err);
      setError('Failed to process image. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className="absolute bottom-0 right-0 p-2.5 bg-[#CDFF00] rounded-full shadow-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-black" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isProcessing}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg max-w-xs">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center max-w-xs">
        Upload a clear photo of yourself.
      </p>
    </div>
  );
}