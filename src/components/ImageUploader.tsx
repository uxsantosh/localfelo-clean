import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 4 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Create preview URLs for all files at once
    const fileReaders: Promise<string>[] = filesToAdd.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    // Wait for all files to be read, then update state once
    Promise.all(fileReaders).then((newImages) => {
      onImagesChange([...images, ...newImages]);
    });

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Existing Images */}
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square bg-input rounded-lg overflow-hidden">
            <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <button
            onClick={handleUploadClick}
            className="aspect-square bg-input border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-background transition-all active:scale-98"
          >
            <Upload className="w-6 h-6 text-muted" />
            <span className="text-xs text-muted">Upload Photo</span>
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
      />

      <p className="text-xs text-muted text-center m-0">
        {images.length} / {maxImages} photos uploaded
      </p>
    </div>
  );
}