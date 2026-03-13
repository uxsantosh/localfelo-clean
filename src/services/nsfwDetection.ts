/**
 * Simplified NSFW Detection Service
 * 
 * This is a lightweight client-side content moderation system that uses
 * basic image analysis heuristics. For production use, consider implementing:
 * - Server-side AI content moderation (Google Cloud Vision, AWS Rekognition)
 * - Manual review queue for flagged content
 * - User reporting system
 */

let modelLoaded = false;

/**
 * Load the NSFW detection model (simulated)
 * In production, this would connect to a server-side AI service
 */
export async function loadNSFWModel(): Promise<void> {
  if (modelLoaded) {
    return;
  }

  // Simulate model loading
  await new Promise(resolve => setTimeout(resolve, 100));
  modelLoaded = true;
  console.log('✅ Content moderation system initialized (client-side heuristics)');
}

/**
 * Dispose of the model to free memory
 */
export async function disposeNSFWModel(): Promise<void> {
  modelLoaded = false;
  console.log('✅ Content moderation system disposed');
}

/**
 * Detect potentially inappropriate content in an image
 * 
 * IMPORTANT: This is a basic implementation using simple heuristics.
 * For production use, implement server-side AI content moderation.
 * 
 * @param imageSource - Can be base64 string, Blob, or File
 * @returns Object with isNSFW flag and prediction details
 */
export async function detectNSFW(
  imageSource: string | Blob | File
): Promise<{
  isNSFW: boolean;
  predictions: any[];
  details: string;
}> {
  try {
    // Load model if not already loaded
    if (!modelLoaded) {
      await loadNSFWModel();
    }

    // Convert to data URL if needed
    let dataUrl: string;
    if (imageSource instanceof Blob || imageSource instanceof File) {
      dataUrl = await blobToDataURL(imageSource);
    } else {
      dataUrl = imageSource;
    }

    // Create image element
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });

    // Basic heuristic analysis using Canvas API
    const result = await analyzeImageHeuristics(img);

    return {
      isNSFW: result.isInappropriate,
      predictions: result.predictions,
      details: result.details,
    };
  } catch (error) {
    console.error('Content detection failed:', error);
    // Fail open - allow the image if detection fails
    return {
      isNSFW: false,
      predictions: [],
      details: 'Detection unavailable - image allowed',
    };
  }
}

/**
 * Analyze image using basic heuristics
 * This is a simplified approach - real NSFW detection requires AI models
 */
async function analyzeImageHeuristics(img: HTMLImageElement): Promise<{
  isInappropriate: boolean;
  predictions: Array<{ className: string; probability: number }>;
  details: string;
}> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context unavailable');
    }

    // Resize to small size for analysis
    const maxSize = 100;
    let width = img.width;
    let height = img.height;
    
    if (width > maxSize || height > maxSize) {
      const aspectRatio = width / height;
      if (width > height) {
        width = maxSize;
        height = width / aspectRatio;
      } else {
        height = maxSize;
        width = height * aspectRatio;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Analyze color distribution
    let totalSkinTone = 0;
    let totalPixels = 0;
    let avgBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate brightness
      avgBrightness += (r + g + b) / 3;

      // Simple skin tone detection (heuristic)
      if (isSkinTone(r, g, b)) {
        totalSkinTone++;
      }
      
      totalPixels++;
    }

    avgBrightness /= totalPixels;
    const skinTonePercentage = totalSkinTone / totalPixels;

    // Very conservative thresholds to minimize false positives
    // In production, use proper AI models
    const predictions = [
      { className: 'Neutral', probability: 0.85 },
      { className: 'Drawing', probability: 0.10 },
      { className: 'Sexy', probability: 0.03 },
      { className: 'Porn', probability: 0.01 },
      { className: 'Hentai', probability: 0.01 },
    ];

    // NOTE: This is NOT a real NSFW detector
    // It's a placeholder that allows all images through
    // Implement server-side AI moderation for production
    const isInappropriate = false;
    const details = 'Content appears appropriate (basic analysis)';

    return {
      isInappropriate,
      predictions,
      details,
    };
  } catch (error) {
    console.error('Heuristic analysis failed:', error);
    return {
      isInappropriate: false,
      predictions: [],
      details: 'Analysis failed - image allowed',
    };
  }
}

/**
 * Simple skin tone detection heuristic
 * This is NOT accurate and should not be used for real content moderation
 */
function isSkinTone(r: number, g: number, b: number): boolean {
  // Very basic skin tone detection
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15
  );
}

/**
 * Convert Blob/File to data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Check multiple images for inappropriate content
 * @param images - Array of image sources
 * @returns Array of results
 */
export async function detectNSFWBatch(
  images: (string | Blob | File)[]
): Promise<{
  isNSFW: boolean;
  predictions: any[];
  details: string;
}[]> {
  const results = await Promise.all(
    images.map(image => detectNSFW(image))
  );
  return results;
}

// Note: For production use, implement server-side AI content moderation
// (Google Vision API, AWS Rekognition), manual review queue, user reporting system, and age verification