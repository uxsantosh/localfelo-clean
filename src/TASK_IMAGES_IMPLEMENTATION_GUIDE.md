# 🖼️ Task Images Implementation Guide

## Overview
Adding image upload functionality (max 3 images) to Tasks feature, with compressed storage and thumbnail display in all cards.

---

## ✅ STEP 1: Run SQL Migration

**File:** `/migrations/ADD_IMAGES_TO_TASKS.sql`

Go to Supabase Dashboard → SQL Editor → Run this migration:

```sql
-- Add images column (array of text URLs)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_images ON tasks USING GIN (images);

-- Add comment for documentation
COMMENT ON COLUMN tasks.images IS 'Array of image URLs (max 3 images). Images are compressed and stored in Supabase Storage.';

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'images'
  ) THEN
    RAISE NOTICE '✅ Column "images" successfully added to tasks table';
  ELSE
    RAISE EXCEPTION '❌ Failed to add "images" column to tasks table';
  END IF;
END $$;
```

---

## ✅ STEP 2: Create Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `task-images`
3. Set as **Public** bucket
4. Add RLS Policy:

```sql
-- Allow anyone to upload task images
CREATE POLICY "Anyone can upload task images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'task-images');

-- Allow anyone to read task images
CREATE POLICY "Anyone can view task images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-images');

-- Allow task owners to delete their images
CREATE POLICY "Users can delete own task images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'task-images');
```

---

## ✅ STEP 3: Update Tasks Service

**File:** `/services/tasks.ts`

Add these functions after the existing functions:

```typescript
/**
 * Upload task images to Supabase Storage
 * @param files - Array of File objects (max 3)
 * @param taskId - Task ID
 * @returns Array of public image URLs
 */
export async function uploadTaskImages(files: File[], taskId: string): Promise<string[]> {
  console.log('[TaskService] uploadTaskImages called with files:', files.length);
  
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${taskId}/${Date.now()}_${index}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    });
    
    const imageUrls = await Promise.all(uploadPromises);
    
    // Update task with image URLs
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ images: imageUrls })
      .eq('id', taskId);
    
    if (updateError) throw updateError;
    
    console.log('[TaskService] Images uploaded successfully:', imageUrls);
    return imageUrls;
  } catch (error) {
    console.error('[TaskService] Error uploading images:', error);
    throw error;
  }
}
```

---

## ✅ STEP 4: Update CreateJobScreen.tsx

**Add images to task creation:**

```typescript
// After creating the task, upload images if any
if (images.length > 0) {
  // Convert base64 images to File objects
  const files = await Promise.all(
    images.map(async (base64, index) => {
      const response = await fetch(base64);
      const blob = await response.blob();
      return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
    })
  );
  
  await uploadTaskImages(files, task.id);
}
```

Full `handleSubmit` function:

```typescript
const handleSubmit = async () => {
  if (!user?.id) {
    toast.error('Please log in to post a job');
    return;
  }

  if (!globalLocation?.cityId) {
    toast.error('Please set your location first');
    return;
  }

  setLoading(true);

  try {
    // Detect intent and effort if not from suggestion
    const intent = selectedSuggestion?.intent || detectIntent(jobText);
    const effortLevel = selectedSuggestion?.effortLevel || detectEffortLevel(jobText);

    // Get final payment
    const finalPayment = payment === 'custom' ? customPayment : payment;

    // Create task
    const task = await createTask({
      title: jobText,
      description: jobText,
      price: parseInt(finalPayment),
      isNegotiable: false,
      categoryId: 1,
      cityId: globalLocation.cityId,
      areaId: globalLocation.areaId || null,
      subAreaId: globalLocation.subAreaId || null,
      latitude: globalLocation.latitude,
      longitude: globalLocation.longitude,
      address: address || undefined,
      timeWindow: dateTimeSelectorToTimeWindow(dateTimeValue),
      intent,
      effortLevel,
    });

    // Upload images if any
    if (images.length > 0) {
      const files = await Promise.all(
        images.map(async (base64, index) => {
          const response = await fetch(base64);
          const blob = await response.blob();
          return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
        })
      );
      
      await uploadTaskImages(files, task.id);
    }

    // Track suggestion usage or custom job
    if (selectedSuggestion) {
      await incrementSuggestionPopularity(selectedSuggestion.id);
    } else {
      await trackCustomJob(jobText, intent, effortLevel);
    }

    fireConfetti();
    toast.success('Job posted! Helpers nearby will see it.');
    
    onSuccess();
  } catch (error: any) {
    console.error('[CreateJobScreen] Error creating job:', error);
    toast.error(error.message || 'Failed to post job');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ STEP 5: Update CreateSmartTaskScreen.tsx

Same as CreateJobScreen - add:
1. Import ImageUploader
2. Add images state
3. Add ImageUploader component in confirmation step
4. Add image upload logic in handleSubmit

---

## ✅ STEP 6: Update TaskCard.tsx (Compact Layout with Thumbnail)

**New Layout:** Image on left (60px square), content on right

```typescript
export function TaskCard({ task, onClick, onChatClick }: TaskCardProps) {
  const hasImage = task.images && task.images.length > 0;
  
  return (
    <div 
      className="bg-white border border-gray-200 p-3 cursor-pointer hover:border-black hover:shadow-sm transition-all flex gap-3"
      onClick={onClick}
      style={{ borderRadius: '8px', minHeight: '100px' }}
    >
      {/* Thumbnail - Left Side */}
      {hasImage && (
        <div 
          className="shrink-0 bg-gray-100 rounded overflow-hidden"
          style={{ width: '60px', height: '60px' }}
        >
          <img
            src={task.images[0]}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content - Right Side */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title + Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight flex-1">
            {task.title}
          </h3>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 ${getStatusClass(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>

        {/* Price */}
        {task.price !== undefined && task.price !== null && task.price > 0 ? (
          <div className="mb-1.5">
            <span className="text-xs font-bold" style={{ backgroundColor: '#CDFF00', color: '#000000', padding: '2px 6px', borderRadius: '4px' }}>
              ₹{task.price.toLocaleString('en-IN')}
            </span>
          </div>
        ) : (
          <div className="text-xs font-medium text-gray-600 mb-1.5">
            {task.isNegotiable ? 'Negotiable' : 'Price not specified'}
          </div>
        )}

        {/* Location + Distance */}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mt-auto">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {task.areaName && task.areaName !== 'Unknown' ? task.areaName : task.cityName || 'Location not set'}
            </span>
          </div>
          {task.distance !== undefined && task.distance !== null && (
            <span className="font-bold text-black shrink-0">
              📍 {task.distance.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ STEP 7: Update TaskDetailScreen.tsx (Add Image Carousel)

Import ImageCarousel:
```typescript
import { ImageCarousel } from '../components/ImageCarousel';
```

Add after the back button, before the content:

```typescript
{/* Image Carousel */}
{task.images && task.images.length > 0 && (
  <div className="mb-6">
    <ImageCarousel images={task.images} />
  </div>
)}
```

---

## ✅ STEP 8: Update Home Screen Task Cards

**File:** `/screens/NewHomeScreen.tsx`

In the tasks horizontal scroll section, update the task card to show thumbnail:

```typescript
{tasks.slice(0, 10).map((task) => {
  const hasImage = task.images && task.images.length > 0;
  
  return (
    <div
      key={task.id}
      onClick={() => handleNavigate('task-detail', { taskId: task.id })}
      className="shrink-0 bg-white border border-gray-200 p-3 cursor-pointer hover:border-black transition-all flex gap-2"
      style={{ width: '280px', borderRadius: '8px' }}
    >
      {/* Thumbnail */}
      {hasImage && (
        <div 
          className="shrink-0 bg-gray-100 rounded overflow-hidden"
          style={{ width: '50px', height: '50px' }}
        >
          <img
            src={task.images[0]}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
          {task.title}
        </h3>
        {task.price && (
          <div className="text-xs font-bold mb-1" style={{ backgroundColor: '#CDFF00', color: '#000', padding: '2px 4px', borderRadius: '3px', display: 'inline-block' }}>
            ₹{task.price.toLocaleString('en-IN')}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{task.areaName || task.cityName}</span>
        </div>
      </div>
    </div>
  );
})}
```

---

## ✅ STEP 9: Update ActiveTaskCard.tsx

Similar to TaskCard - add thumbnail on left, content on right if images exist.

---

## 📋 TESTING CHECKLIST

After implementation:

- [ ] SQL migration runs successfully
- [ ] Storage bucket `task-images` created with public access
- [ ] Can upload 1-3 images when creating task (both screens)
- [ ] Images are compressed (check file sizes)
- [ ] NSFW detection works (test with inappropriate image)
- [ ] Task cards show first image thumbnail
- [ ] Task detail shows image carousel
- [ ] Home screen task cards show thumbnails
- [ ] Images load quickly (check public URLs)
- [ ] No broken images on cards without photos

---

## 🎨 DESIGN SPECIFICATIONS

### Card Layouts:

**TaskCard (with image):**
- Total height: ~100px
- Image: 60x60px (left side)
- Gap: 12px
- Content: flex-1 (right side)
- Font sizes: 
  - Title: 14px (text-sm)
  - Price: 12px (text-xs)
  - Location: 12px (text-xs)

**Home Screen Card (with image):**
- Width: 280px
- Image: 50x50px (left side)
- Gap: 8px
- Content: flex-1 (right side)

**Task Detail:**
- Full-width ImageCarousel
- Swipeable on mobile
- Dots indicator

---

## 🚀 DEPLOYMENT NOTES

1. Run SQL migration FIRST before deploying code
2. Create storage bucket BEFORE testing
3. Verify RLS policies are active
4. Test image upload/download works
5. Monitor storage usage (each image ~200-500KB after compression)

---

## ✅ FILES TO UPDATE

1. ✅ `/migrations/ADD_IMAGES_TO_TASKS.sql` - Created
2. ✅ `/types/index.ts` - Updated (images?: string[])
3. ⏳ `/services/tasks.ts` - Add uploadTaskImages function
4. ✅ `/screens/CreateJobScreen.tsx` - Updated with ImageUploader
5. ⏳ `/screens/CreateSmartTaskScreen.tsx` - Add ImageUploader
6. ⏳ `/components/TaskCard.tsx` - Update layout
7. ⏳ `/components/ActiveTaskCard.tsx` - Update layout
8. ⏳ `/screens/TaskDetailScreen.tsx` - Add ImageCarousel
9. ⏳ `/screens/NewHomeScreen.tsx` - Update task cards
10. ⏳ Supabase Dashboard - Run migration + create bucket

---

**Status:** Ready to implement! Follow steps 1-9 in order.
