# Implementation Guide - 3 Critical Fixes

## ✅ ISSUE 1: Professionals Not Showing for Non-Logged-In Users

### Problem
RLS policies blocking public access to professionals

### Solution
Run this SQL in Supabase SQL Editor:

```sql
-- Fix public access to professionals
DROP POLICY IF EXISTS "public_view_active_professionals" ON professionals;

CREATE POLICY "public_view_active_professionals"
  ON professionals FOR SELECT
  USING (is_active = true AND (is_blocked = false OR is_blocked IS NULL));
```

---

## ✅ ISSUE 2: Header Buttons Not Reduced/Consistent

### Files Already Updated:
- `/components/Header.tsx` - Lines 156-181

### Changes Made:
- Reduced padding: `px-2 py-1.5` (was `px-2 sm:px-3 py-1.5`)
- Reduced icon size: `w-3.5 h-3.5` (was `w-4 h-4`)
- Reduced text size: `text-xs` (was `text-sm`)
- All three buttons now consistent size

### Verification:
Check these lines in `/components/Header.tsx`:
- Line 160: Sell Item button
- Line 167: Post a Wish button  
- Line 175: Post a Task button

All should have:
```tsx
className="flex items-center gap-1.5 px-2 py-1.5 ... text-xs font-medium ..."
<IconName className="w-3.5 h-3.5" />
```

---

## ✅ ISSUE 3: Professional Verification System

### Step 1: Run SQL Setup
File: `/PROFESSIONALS_VERIFICATION_SETUP.sql`

This creates:
- Verification columns in `professionals` table
- `professional_verification_documents` table
- RLS policies
- Storage bucket instructions

### Step 2: Create Storage Bucket
1. Go to Supabase Dashboard > Storage
2. Create bucket: `professional-verification-docs`
3. Settings:
   - Public: **NO** (Private)
   - File size limit: **5MB**
   - Allowed MIME types: `image/jpeg, image/png, image/jpg, application/pdf`

4. Run these storage policies in SQL Editor:

```sql
-- SELECT policy
DROP POLICY IF EXISTS "verification_docs_bucket_select" ON storage.objects;
CREATE POLICY "verification_docs_bucket_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'professional-verification-docs');

-- INSERT policy
DROP POLICY IF EXISTS "verification_docs_bucket_insert" ON storage.objects;
CREATE POLICY "verification_docs_bucket_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'professional-verification-docs');

-- UPDATE policy
DROP POLICY IF EXISTS "verification_docs_bucket_update" ON storage.objects;
CREATE POLICY "verification_docs_bucket_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'professional-verification-docs');

-- DELETE policy
DROP POLICY IF EXISTS "verification_docs_bucket_delete" ON storage.objects;
CREATE POLICY "verification_docs_bucket_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'professional-verification-docs');
```

### Step 3: Frontend Files Created
1. **VerificationModal Component**: `/components/VerificationModal.tsx`  
   - Upload Aadhar & Photo
   - Preview images
   - Submit to database

2. **ProfessionalDetailScreen Updated**: `/screens/ProfessionalDetailScreen.tsx`
   - Added verification button for own profile
   - Shows verification status badge
   - Displays verification messages
   - Shows reupload warnings

### Step 4: Admin Panel Integration (TODO)

You need to update the Admin screen to add:

1. **Pending Verifications Tab**
2. **View Documents**
3. **Download Documents**
4. **Approve/Reject Actions**
5. **Request Reupload**
6. **Block/Unblock Account**

---

## Database Schema Changes

### Professionals Table (New Columns)
```sql
verification_status VARCHAR(20) DEFAULT 'unverified'
  -- Values: 'unverified', 'pending', 'verified', 'rejected', 'reupload_requested'
  
verification_message TEXT
  -- Admin message shown to professional

verification_requested_at TIMESTAMPTZ
  -- When verification was requested

verification_completed_at TIMESTAMPTZ
  -- When verified/rejected

is_blocked BOOLEAN DEFAULT false
  -- Account blocked by admin
```

### Professional Verification Documents Table
```sql
CREATE TABLE professional_verification_documents (
  id UUID PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id),
  user_id UUID,
  aadhar_card_url TEXT,
  photo_url TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## Verification Workflow

### Professional Side:
1. Go to their profile detail page
2. Click "Get Verified" button (if unverified or rejected)
3. Upload Aadhar card image
4. Upload photo
5. Submit
6. Status changes to "pending"
7. See message: "We will review within 24 hours"

### Admin Side (You need to implement):
1. See pending count in admin panel
2. View list of pending verifications
3. For each verification:
   - View uploaded Aadhar
   - View uploaded photo
   - Download documents
   - Actions:
     - **Approve** → status='verified', add verified badge
     - **Reject** → status='rejected', add rejection reason
     - **Request Reupload** → status='reupload_requested', add message
     - **Block Account** → is_blocked=true, hide from listings

### Professional Sees:
- ✅ **Verified**: Green badge "Verified Professional"
- ⏳ **Pending**: Yellow badge "Verification Pending"
- ❌ **Rejected**: Red message with reason
- 🔄 **Reupload Requested**: Red alert with admin message and reupload button
- 🚫 **Blocked**: Cannot see their profile (hidden from listings)

---

## Next Steps

1. ✅ Run `PROFESSIONALS_VERIFICATION_SETUP.sql`
2. ✅ Create storage bucket
3. ✅ Run storage policies
4. ⏳ Update Admin screen (TODO - needs implementation)
5. ⏳ Add verification badge to ProfessionalCard component
6. ⏳ Add verification status filters in admin
7. ⏳ Test full workflow

---

## Files Modified/Created

### Created:
- `/PROFESSIONALS_VERIFICATION_SETUP.sql` - Database setup
- `/components/VerificationModal.tsx` - Upload modal
- `/IMPLEMENTATION_GUIDE_3_FIXES.md` - This guide

### Modified:
- `/components/Header.tsx` - Reduced button sizes
- `/screens/ProfessionalDetailScreen.tsx` - Added verification UI
- `/components/ProfessionalCard.tsx` - Modern 2026 design (from previous request)
- `/screens/ProfessionalsListingRoleScreen.tsx` - Enhanced map view (from previous request)

---

## Testing Checklist

### Issue 1 - Public Access:
- [ ] Open app in incognito (not logged in)
- [ ] Navigate to Professionals
- [ ] Verify you can see professionals list
- [ ] Click on a professional
- [ ] Verify you can see details

### Issue 2 - Header Buttons:
- [ ] Login to app
- [ ] Navigate to Marketplace/Wishes/Tasks
- [ ] Check header shows 3 buttons
- [ ] Verify all buttons same height/width
- [ ] Verify compact size (not taking too much space)

### Issue 3 - Verification:
- [ ] Create professional profile
- [ ] Go to profile detail
- [ ] Click "Get Verified"
- [ ] Upload Aadhar and photo
- [ ] Submit
- [ ] Check database for new record
- [ ] Check status changed to "pending"
- [ ] (Admin) View pending verification
- [ ] (Admin) Approve/reject
- [ ] (Professional) See updated status

---

## Important Notes

1. **Storage Bucket**: Must be created manually in Supabase Dashboard
2. **RLS Policies**: Use permissive policies (true) because you use x-client-token authentication
3. **Admin Panel**: Needs custom implementation for verification management
4. **Verification Badge**: Should be added to ProfessionalCard component to show in listings
5. **Blocked Accounts**: Won't show in public listings (filtered by RLS policy)

---

## Support

If you encounter any issues:
1. Check Supabase SQL Editor for errors
2. Verify storage bucket created correctly
3. Check browser console for errors
4. Verify all files updated correctly
5. Test RLS policies with different user states (logged in/out)
