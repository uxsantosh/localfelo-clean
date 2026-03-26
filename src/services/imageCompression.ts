export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compress an image file using Canvas API
 * @param file - The image file to compress
 * @param options - Compression options (maxWidth, maxHeight, quality)
 * @returns Compressed file as Blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 1,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels if size is too large
        let currentQuality = quality;
        const attemptCompression = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Check if size is acceptable or if we've tried enough
              const sizeMB = blob.size / (1024 * 1024);
              if (sizeMB <= maxSizeMB || q <= 0.5) {
                resolve(blob);
              } else {
                // Try again with lower quality
                attemptCompression(q - 0.1);
              }
            },
            'image/jpeg',
            q
          );
        };

        attemptCompression(currentQuality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a File or Blob to base64 string
 * @param blob - The file or blob to convert
 * @returns Base64 encoded string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compress image and return as base64
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Base64 encoded compressed image
 */
export async function compressImageToBase64(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const compressedBlob = await compressImage(file, options);
  return blobToBase64(compressedBlob);
}
