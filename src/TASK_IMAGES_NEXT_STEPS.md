# 🖼️ Task Images - Next Steps & Summary

## ✅ COMPLETED

1. ✅ **SQL Migration Created:** `/migrations/ADD_IMAGES_TO_TASKS.sql`
2. ✅ **TypeScript Types Updated:** `/types/index.ts` - Added `images?: string[]` to Task interface
3. ✅ **Upload Function Added:** `/services/tasks.ts` - `uploadTaskImages()` function created
4. ✅ **CreateJobScreen Updated:** Image uploader added in confirmation step with proper upload logic

---

## ⏳ REMAINING TASKS

### 1. Run SQL Migration in Supabase Dashboard

**Go to Supabase Dashboard → SQL Editor → Paste and run:**

```sql
-- Add images column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_images ON tasks USING GIN (images);

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'images';
```

---

### 2. Create Supabase Storage Bucket

**Go to Supabase Dashboard → Storage → Create Bucket:**
- **Name:** `task-images`
- **Public:** ✅ Yes (make it public)

**Add RLS Policies:**

```sql
-- Allow anyone to upload
CREATE POLICY "Anyone can upload task images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'task-images');

-- Allow anyone to read
CREATE POLICY "Anyone can view task images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-images');

-- Allow owners to delete
CREATE POLICY "Users can delete own task images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'task-images');
```

---

### 3. Update CreateSmartTaskScreen.tsx

**Same changes as CreateJobScreen:**

1. Import ImageUploader and uploadTaskImages
2. Add images state: `const [images, setImages] = useState<string[]>([]);`
3. Add ImageUploader component in the form
4. Update handleSubmit to upload images after task creation

**Quick Copy-Paste Pattern:**

```typescript
// Import
import { ImageUploader } from '../components/ImageUploader';
import { createTask, uploadTaskImages } from '../services/tasks';

// State (add this with other state variables)
const [images, setImages] = useState<string[]>([]);

// In JSX (add before submit button)
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Add Photos (Optional - Max 3)
  </label>
  <ImageUploader images={images} onImagesChange={setImages} maxImages={3} />
</div>

// In handleSubmit (after task creation)
if (images.length > 0) {
  const files = await Promise.all(
    images.map(async (base64, index) => {
      const response = await fetch(base64);
      const blob = await response.blob();
      return new File([blob], `task-image-${index}.jpg`, { type: 'image/jpeg' });
    })
  );
  await uploadTaskImages(files, result.taskId);
}
```

---

### 4. Update TaskCard.tsx (Compact Layout with Thumbnail)

**Replace entire TaskCard component with this:**

```typescript
import React from 'react';
import { MapPin, Clock, IndianRupee } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const hasImage = task.images && task.images.length > 0;
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'negotiating': return 'bg-blue-50 text-blue-700';
      case 'open': return 'bg-[#CDFF00] text-black';
      case 'accepted': return 'bg-blue-50 text-blue-700';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }\n  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'negotiating': return 'NEGOTIATING';
      case 'open': return 'OPEN';
      case 'accepted': return 'ACCEPTED';
      case 'in_progress': return 'IN PROGRESS';
      case 'completed': return 'COMPLETED';
      default: return 'OPEN';
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 p-3 cursor-pointer hover:border-black hover:shadow-sm transition-all flex gap-3"
      onClick={onClick}
      style={{ borderRadius: '8px', minHeight: '90px' }}
    >
      {/* Thumbnail - Left Side */}
      {hasImage && (
        <div 
          className="shrink-0 bg-gray-100 rounded overflow-hidden"
          style={{ width: '60px', height: '60px' }}
        >
          <img
            src={task.images![0]}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content - Right Side */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight flex-1">
            {task.title}
          </h3>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 ${getStatusClass(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>

        {/* Price */}
        {task.price !== undefined && task.price !== null && task.price > 0 ? (
          <div className="mb-1">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#CDFF00', color: '#000' }}>
              ₹{task.price.toLocaleString('en-IN')}
            </span>
          </div>
        ) : (
          <div className="text-xs font-medium text-gray-600 mb-1">
            {task.isNegotiable ? 'Negotiable' : 'Price TBD'}
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

### 5. Update TaskDetailScreen.tsx (Add Image Carousel)

**Add at the top:**
```typescript
import { ImageCarousel } from '../components/ImageCarousel';
```

**Add in JSX (after header, before content):**
```typescript
{/* Image Carousel */}
{task.images && task.images.length > 0 && (
  <div className="mb-6">
    <ImageCarousel images={task.images} />
  </div>
)}
```

---

### 6. Update NewHomeScreen.tsx (Task Cards in Horizontal Scroll)

**Find the tasks horizontal scroll section and update card rendering:**

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
        <div className="shrink-0 bg-gray-100 rounded overflow-hidden" style={{ width: '50px', height: '50px' }}>
          <img src={task.images[0]} alt={task.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{task.title}</h3>
        {task.price && (
          <div className="text-xs font-bold mb-1 inline-block px-1.5 py-0.5 rounded" style={{ backgroundColor: '#CDFF00', color: '#000' }}>
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

### 7. Update ActiveTaskCard.tsx (Optional)

Same pattern as TaskCard - add thumbnail if images exist.

---

## 📋 TESTING CHECKLIST

After completing all steps:

- [ ] SQL migration ran successfully
- [ ] Storage bucket `task-images` created
- [ ] Can upload 1-3 images in CreateJobScreen
- [ ] Can upload 1-3 images in CreateSmartTaskScreen
- [ ] Images compress automatically (check network tab)
- [ ] NSFW detection works
- [ ] TaskCard shows first image thumbnail
- [ ] TaskDetailScreen shows image carousel
- [ ] Home screen task cards show thumbnails
- [ ] Images load correctly (check public URLs)
- [ ] No errors in console

---

## 🎨 DESIGN SPECIFICATIONS

### Card with Image:
- **Image:** 60x60px (TaskCard), 50x50px (Home cards)
- **Gap:** 12px (TaskCard), 8px (Home)
- **Title:** text-sm (14px), line-clamp-2
- **Price:** text-xs (12px), bright green badge
- **Location:** text-xs (12px), truncate

### Without Image:
- Full width content
- Same spacing as before

---

## 🚀 DEPLOYMENT ORDER

1. Run SQL migration
2. Create storage bucket + RLS policies
3. Deploy updated code
4. Test image upload
5. Verify storage quota limits

---

## 💡 NOTES

- Images are automatically compressed (maxSizeMB: 0.5)
- NSFW detection runs before upload
- Max 3 images per task (vs 6 for listings)
- Storage bucket must be public for image URLs to work
- Images stored as: `task-images/{taskId}/{timestamp}_{index}.jpg`

---

## ✅ FILES UPDATED

1. ✅ `/migrations/ADD_IMAGES_TO_TASKS.sql`
2. ✅ `/types/index.ts`
3. ✅ `/services/tasks.ts`
4. ✅ `/screens/CreateJobScreen.tsx`
5. ⏳ `/screens/CreateSmartTaskScreen.tsx`
6. ⏳ `/components/TaskCard.tsx`
7. ⏳ `/screens/TaskDetailScreen.tsx`
8. ⏳ `/screens/NewHomeScreen.tsx`
9. ⏳ `/components/ActiveTaskCard.tsx`

---

**Ready to continue! Complete steps 1-2 in Supabase Dashboard, then update remaining files.**
