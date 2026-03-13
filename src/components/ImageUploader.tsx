import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { compressImageToBase64 } from '../services/imageCompression';
import { detectNSFW, loadNSFWModel } from '../services/nsfwDetection';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 6 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load NSFW detection model silently in background
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        await loadNSFWModel();
        setModelLoading(false);
      } catch (err) {
        console.error('Failed to load NSFW model:', err);
        setModelLoading(false);
        // Continue without model - compression will still work
      }
    };
    loadModel();
  }, []);

  const compressImage = async (file: File): Promise<string> => {
    try {
      const compressedBase64 = await compressImageToBase64(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        maxSizeMB: 0.5
      });
      
      return compressedBase64;
    } catch (err) {
      console.error('Compression error:', err);
      throw new Error('Failed to process image');
    }
  };

  const checkImageContent = async (imageDataUrl: string): Promise<boolean> => {
    try {
      const result = await detectNSFW(imageDataUrl);
      return !result.isNSFW; // Return true if safe, false if NSFW
    } catch (err) {
      console.error('Content moderation error:', err);
      return true; // Allow on error
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots === 0) {
      setError(`Maximum ${maxImages} photos allowed`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    setProcessing(true);
    setError('');
    const processedImages: string[] = [];

    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];

      try {
        const compressedImage = await compressImage(file);
        const isSafe = await checkImageContent(compressedImage);

        if (!isSafe) {
          setError('⚠️ Inappropriate content detected. Please upload appropriate images only.');
          setProcessing(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        processedImages.push(compressedImage);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Failed to process image. Please try again.');
        setProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    onImagesChange([...images, ...processedImages]);
    setProcessing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError('');
  };

  const handleUploadClick = () => {
    setError('');
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Processing Indicator - Simple */}
      {processing && (
        <div className="bg-[#CDFF00] border-2 border-black p-3 rounded-lg flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-black" />
          <p className="text-sm font-bold text-black">Uploading photos...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500 p-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Existing Images */}
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square bg-input rounded-lg overflow-hidden">
            <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
              aria-label="Remove image"
              disabled={processing}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <button
            onClick={handleUploadClick}
            disabled={processing || modelLoading}
            className="aspect-square bg-input border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-background transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <Loader2 className="w-6 h-6 text-muted animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-muted" />
            )}
            <span className="text-xs text-muted">
              {processing ? 'Uploading...' : 'Upload Photo'}
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={processing}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted m-0">
          {images.length} / {maxImages} photos
        </p>
      </div>
    </div>
  );
}