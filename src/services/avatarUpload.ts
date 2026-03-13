import { supabase } from '../lib/supabaseClient';

/**
 * Upload avatar to Supabase Storage
 * Throws error if upload fails (caller handles fallback)
 */
export async function uploadAvatar(userId: string, base64Image: string): Promise<string> {
  console.log('🔵 [AVATAR UPLOAD] Starting upload for user:', userId);
  
  // Convert base64 to blob
  const response = await fetch(base64Image);
  const blob = await response.blob();
  console.log('🔵 [AVATAR UPLOAD] Blob created:', {
    size: blob.size,
    type: blob.type
  });
  
  // Create file name
  const fileExt = blob.type.split('/')[1] || 'jpg';
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  console.log('🔵 [AVATAR UPLOAD] File path:', filePath);

  // Upload to Supabase Storage
  console.log('🔵 [AVATAR UPLOAD] Attempting upload to bucket: user-uploads');
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (error) {
    console.error('🔴 [AVATAR UPLOAD] Upload FAILED:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error
    });
    throw error;
  }

  console.log('✅ [AVATAR UPLOAD] Upload SUCCESS:', data);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(filePath);

  console.log('✅ [AVATAR UPLOAD] Public URL:', urlData.publicUrl);
  return urlData.publicUrl;
}

/**
 * Update user's avatar URL in profile
 */
export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user avatar:', error);
    throw error;
  }
}

/**
 * Update user's gender
 */
export async function updateUserGender(userId: string, gender: 'male' | 'female' | 'other' | null): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ gender })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user gender:', error);
    throw error;
  }
}

/**
 * Delete old avatar from storage (cleanup)
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/user-uploads/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('user-uploads')
      .remove([filePath]);

    if (error) console.error('Failed to delete old avatar:', error);
  } catch (error) {
    console.error('Failed to delete avatar:', error);
  }
}