# Avatar Upload Flow Diagram

## Current Flow (With RLS Blocking)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER UPLOADS AVATAR                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  AvatarUploader.tsx                                             │
│  ✅ Validates image (type, size)                                │
│  ✅ Compresses image (max 1MB)                                  │
│  ✅ NSFW detection (blocks inappropriate content)               │
│  ✅ Converts to base64                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  EditProfileModal.tsx (handleSubmit)                            │
│  Receives: avatarBase64 (compressed image data)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  TRY: Upload to Supabase Storage                                │
│  await uploadAvatar(user.id, avatarBase64)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  avatarUpload.ts → uploadAvatar()                               │
│  1. Convert base64 to blob                                      │
│  2. Create filename: user-{id}-{timestamp}.jpg                  │
│  3. Upload to storage.from('user-uploads')                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ╔════╩════╗
                    ║  RLS    ║  ← PROBLEM HERE!
                    ║ CHECK   ║
                    ╚════╤════╝
                         │
              ┌──────────┴──────────┐
              │                     │
        ❌ BLOCKED              ✅ ALLOWED
    (Current State)         (After Fix)
              │                     │
              ▼                     ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│  Upload Fails           │  │  Upload Succeeds         │
│  Error: 403 Forbidden   │  │  Returns: Storage URL    │
│                         │  │  https://xxx.supabase... │
└────────┬────────────────┘  └────────┬─────────────────┘
         │                            │
         ▼                            │
┌─────────────────────────┐           │
│  CATCH Block Executes   │           │
│  avatarUrl = base64     │           │
│  (Silent Fallback)      │           │
└────────┬────────────────┘           │
         │                            │
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Update profiles table                                          │
│  UPDATE profiles SET                                            │
│    avatar_url = avatarUrl  ← Either base64 OR storage URL       │
│  WHERE id = user.id                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✅ SUCCESS - Profile Updated!                                  │
│  toast.success('Profile updated successfully!')                 │
│                                                                 │
│  Result in database:                                            │
│  ❌ Before Fix: avatar_url = "data:image/jpeg;base64,..."       │
│  ✅ After Fix:  avatar_url = "https://...storage.../avatar.jpg" │
└─────────────────────────────────────────────────────────────────┘
```

## The RLS Check (Detail)

```
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Storage RLS Check                                     │
│  ON storage.objects FOR INSERT                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ╔════╩════╗
                    ║  Policy ║
                    ║  Exists?║
                    ╚════╤════╝
                         │
              ┌──────────┴──────────┐
              │                     │
         ❌ NO                  ✅ YES
    (Current State)         (After Fix)
              │                     │
              ▼                     ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│  Default Behavior       │  │  Check Policy Rules      │
│  DENY ALL               │  │  - Is user authenticated?│
│  ↓                      │  │  - Bucket = user-uploads?│
│  403 Forbidden          │  │  ↓                       │
│  Upload Blocked         │  │  All checks pass?        │
└─────────────────────────┘  └────────┬─────────────────┘
                                      │
                           ┌──────────┴──────────┐
                           │                     │
                      ✅ YES                ❌ NO
                           │                     │
                           ▼                     ▼
              ┌────────────────────┐  ┌──────────────────┐
              │  Allow Upload      │  │  Deny Upload     │
              │  Return URL        │  │  403 Forbidden   │
              └────────────────────┘  └──────────────────┘
```

## The Fix Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Run FIX_AVATAR_STORAGE_COMPLETE.sql                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Create bucket 'user-uploads' (if missing)                   │
│     - Public: true                                              │
│     - Max size: 5MB                                             │
│     - Types: jpg, png, webp, gif                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Drop old/conflicting policies (if any)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Create 4 new RLS policies:                                  │
│                                                                 │
│  📖 Public avatar access (SELECT)                               │
│     → Anyone can view avatars                                   │
│                                                                 │
│  📤 Authenticated avatar upload (INSERT)                        │
│     → Logged-in users can upload                                │
│                                                                 │
│  ✏️  Authenticated avatar update (UPDATE)                       │
│     → Logged-in users can replace avatars                       │
│                                                                 │
│  🗑️  Authenticated avatar delete (DELETE)                       │
│     → Logged-in users can delete avatars                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Verify profiles table UPDATE policy exists                  │
│     CREATE POLICY "Users can update own profile"                │
│     ON profiles FOR UPDATE USING (id = auth.uid())              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✅ FIX COMPLETE!                                                │
│  New uploads will use storage URLs instead of base64            │
└─────────────────────────────────────────────────────────────────┘
```

## Comparison: Before vs After

### BEFORE FIX (Base64 Fallback)

```
User Profile Record:
┌──────────────────────────────────────────────────────────────┐
│ id: 123e4567-e89b-12d3-a456-426614174000                     │
│ name: "John Doe"                                             │
│ avatar_url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...    │
│             ...EAAAAASUVORK5CYII=" (20-100KB base64 string!) │
│ gender: "male"                                               │
│ updated_at: 2024-03-12 10:30:00                              │
└──────────────────────────────────────────────────────────────┘

Storage Bucket:
┌──────────────────────────────────────────────────────────────┐
│ user-uploads/avatars/                                        │
│   (empty - no files uploaded)                                │
└──────────────────────────────────────────────────────────────┘

Problems:
❌ Large database records (base64 is ~30% bigger than binary)
❌ Slower queries (more data to transfer)
❌ Can't leverage CDN caching
❌ No file management (can't see/delete old avatars easily)
```

### AFTER FIX (Storage URLs)

```
User Profile Record:
┌──────────────────────────────────────────────────────────────┐
│ id: 123e4567-e89b-12d3-a456-426614174000                     │
│ name: "John Doe"                                             │
│ avatar_url: "https://abcdef.supabase.co/storage/v1/object/  │
│             public/user-uploads/avatars/123-1710243000.jpg"  │
│             (Clean URL, ~100 bytes)                          │
│ gender: "male"                                               │
│ updated_at: 2024-03-12 10:30:00                              │
└──────────────────────────────────────────────────────────────┘

Storage Bucket:
┌──────────────────────────────────────────────────────────────┐
│ user-uploads/avatars/                                        │
│   ├─ 123-1710243000.jpg (actual image file, 15KB)           │
│   ├─ 456-1710244000.png                                      │
│   └─ 789-1710245000.webp                                     │
└──────────────────────────────────────────────────────────────┘

Benefits:
✅ Smaller database (just URL, not full image)
✅ Faster queries
✅ CDN-backed delivery (faster loading)
✅ Easy file management via Storage dashboard
✅ Can set custom cache headers
✅ Standard best practice
```

## Code Execution Timeline

```
Time    Event                           Code Location
────────────────────────────────────────────────────────────────
0ms     User clicks camera icon         AvatarUploader.tsx:128
        
10ms    File input opens                Browser native

2000ms  User selects image              Browser native

2010ms  handleFileSelect() called       AvatarUploader.tsx:31
        
2020ms  Image validation starts         AvatarUploader.tsx:36-45
        ✅ Check file type
        ✅ Check file size
        
2030ms  Image compression starts        AvatarUploader.tsx:52-59
        Using: browser-image-compression
        Max: 1MB, 400x400px
        
3500ms  Compression complete            
        Size reduced: 4MB → 800KB
        
3510ms  NSFW detection (if enabled)     AvatarUploader.tsx:62-92
        Using: nsfwjs
        Checks for inappropriate content
        
4000ms  NSFW check complete             
        Result: Safe ✅
        
4010ms  Convert to base64               AvatarUploader.tsx:95-101
        FileReader.readAsDataURL()
        
4200ms  base64 conversion complete      
        Calls: onAvatarChange(base64)
        Updates: avatarBase64 state
        
4210ms  User clicks "Save Changes"      EditProfileModal.tsx:152
        
4220ms  handleSubmit() called           EditProfileModal.tsx:35
        
4230ms  Try storage upload              EditProfileModal.tsx:54
        await uploadAvatar(...)
        
4250ms  uploadAvatar() executing        avatarUpload.ts:7
        ↓ Convert base64 to blob        Line 9
        ↓ Create filename               Line 13
        ↓ Call storage.upload()         Line 18
        
4300ms  ╔═══════════════════════════╗
        ║   RLS CHECK HAPPENS       ║   ← THE CRITICAL MOMENT
        ║                           ║
        ║  Before Fix: DENY (403)   ║
        ║  After Fix:  ALLOW (200)  ║
        ╚═══════════════════════════╝
        
        BEFORE FIX:                     AFTER FIX:
        ↓                               ↓
4400ms  Error thrown                    Success!
        Caught in EditProfileModal      Returns storage URL
        Falls back to base64            
        
4410ms  Update profiles table           Update profiles table
        avatar_url = base64 (fallback)  avatar_url = storage URL
        
4500ms  Database UPDATE succeeds        Database UPDATE succeeds
        
4510ms  localStorage updated            localStorage updated
        
4520ms  Event dispatched                Event dispatched
        "userProfileUpdated"            "userProfileUpdated"
        
4530ms  Toast notification              Toast notification
        "Profile updated successfully!" "Profile updated successfully!"
        
4540ms  Modal closes                    Modal closes
        UI refreshes with new avatar    UI refreshes with new avatar
        
        RESULT:                         RESULT:
        Shows base64 avatar ❌          Shows storage URL avatar ✅
```

## Why Silent Fallback is Good Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Traditional Error Handling (BAD)                               │
├─────────────────────────────────────────────────────────────────┤
│  Storage fails → Show error → User confused → Support tickets   │
│                                                                 │
│  User sees:                                                     │
│  ❌ "Failed to upload avatar: Storage permission denied"        │
│  ❌ "Error 403: Row Level Security policy violation"            │
│  ❌ "Something went wrong. Please try again."                   │
│                                                                 │
│  Problems:                                                      │
│  • User doesn't understand technical errors                     │
│  • Can't do anything to fix it                                  │
│  • Loses trust in the app                                       │
│  • Abandons profile setup                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Silent Fallback (GOOD) ✅                                       │
├─────────────────────────────────────────────────────────────────┤
│  Storage fails → Fall back to base64 → User never knows         │
│                                                                 │
│  User sees:                                                     │
│  ✅ "Profile updated successfully!"                             │
│  ✅ Avatar displays correctly                                   │
│  ✅ Everything works as expected                                │
│                                                                 │
│  Benefits:                                                      │
│  ✅ User has smooth experience                                  │
│  ✅ No confusing error messages                                 │
│  ✅ Profile setup completes                                     │
│  ✅ Admin can fix RLS later                                     │
│  ✅ Old avatars auto-convert on next update                     │
└─────────────────────────────────────────────────────────────────┘
```

## Summary

**The Problem:** RLS policies missing → Storage upload fails (403) → Falls back to base64

**The Symptom:** Profile shows "updated" but using base64 instead of storage URL

**The Fix:** Run `FIX_AVATAR_STORAGE_COMPLETE.sql` to create proper RLS policies

**The Result:** New avatars save to storage, old ones convert when users update profile

**Time to Fix:** 2 minutes

**User Impact:** None (they never see errors, it just works better behind the scenes)
