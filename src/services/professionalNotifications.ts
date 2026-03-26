// =====================================================
// Professional Notifications Service - LocalFelo
// Notifies professionals when tasks/wishes match their categories
// =====================================================

import { supabase } from '../lib/supabaseClient';

// =====================================================
// Types
// =====================================================
interface Task {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  city: string;
  area?: string;
  user_id: string;
  created_at: string;
}

interface Wish {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  city: string;
  area?: string;
  user_id: string;
  created_at: string;
}

interface Professional {
  id: string;
  user_id: string;
  name: string;
  whatsapp: string;
  category_id: string;
  subcategory_id?: string;
  city: string;
  area?: string;
  subarea?: string;
  is_active: boolean;
}

interface User {
  id: string;
  name: string;
  phone?: string;
}

// =====================================================
// Find Matching Professionals for Task/Wish
// Precise Multi-Level Matching Algorithm:
// 1. Priority 1: Exact subcategory match (both task and professional have matching subcategory_id)
// 2. Priority 2: Professional registered with matching subcategory_id = task's main category_id
// 3. Priority 3: Same category_id (only if professional has NO specific subcategory)
// =====================================================
async function findMatchingProfessionals(
  categoryId: string,
  subcategoryId: string | undefined,
  city: string,
  area?: string
): Promise<Professional[]> {
  try {
    console.log(`🔍 [Professional Notifications] Finding professionals for:`);
    console.log(`   Category: ${categoryId}`);
    console.log(`   Subcategory: ${subcategoryId || 'none'}`);
    console.log(`   City: ${city}`);
    console.log(`   Area: ${area || 'all areas'}`);
    
    let professionals: Professional[] = [];
    const foundProfessionalIds = new Set<string>();
    
    // Priority 1: Exact subcategory match (if task has subcategory)
    if (subcategoryId) {
      const { data: subcategoryMatches, error: subError } = await supabase
        .from('professionals')
        .select('*')
        .eq('subcategory_id', subcategoryId)
        .eq('city', city)
        .eq('is_active', true);
      
      if (!subError && subcategoryMatches && subcategoryMatches.length > 0) {
        professionals.push(...subcategoryMatches);
        subcategoryMatches.forEach(p => foundProfessionalIds.add(p.id));
        console.log(`   ✅ Priority 1: Found ${subcategoryMatches.length} professionals with exact subcategory match`);
      }
    }
    
    // Priority 2: Professional's subcategory_id matches task's main category_id
    // This handles cases where professionals register with specific subcategories
    const { data: altSubMatches, error: altSubError } = await supabase
      .from('professionals')
      .select('*')
      .eq('subcategory_id', categoryId)
      .eq('city', city)
      .eq('is_active', true);
    
    if (!altSubError && altSubMatches && altSubMatches.length > 0) {
      const newMatches = altSubMatches.filter(p => !foundProfessionalIds.has(p.id));
      if (newMatches.length > 0) {
        professionals.push(...newMatches);
        newMatches.forEach(p => foundProfessionalIds.add(p.id));
        console.log(`   ✅ Priority 2: Found ${newMatches.length} professionals with subcategory matching main category`);
      }
    }
    
    // Priority 3: Same category_id (ONLY if professional has NO subcategory)
    // This prevents over-notification to professionals who specialized in specific subcategories
    const { data: categoryMatches, error: catError } = await supabase
      .from('professionals')
      .select('*')
      .eq('category_id', categoryId)
      .is('subcategory_id', null) // CRITICAL: Only match if NO subcategory specified
      .eq('city', city)
      .eq('is_active', true);
    
    if (!catError && categoryMatches && categoryMatches.length > 0) {
      const newMatches = categoryMatches.filter(p => !foundProfessionalIds.has(p.id));
      if (newMatches.length > 0) {
        professionals.push(...newMatches);
        newMatches.forEach(p => foundProfessionalIds.add(p.id));
        console.log(`   ✅ Priority 3: Found ${newMatches.length} professionals with category-only match (no subcategory specified)`);
      }
    }

    console.log(`   🎯 Total matching professionals: ${professionals.length}`);
    
    // Sort by area match (same area first, then others)
    if (area && professionals.length > 0) {
      professionals.sort((a, b) => {
        const aMatch = a.area === area || a.subarea === area;
        const bMatch = b.area === area || b.subarea === area;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    return professionals;
  } catch (error) {
    console.error('❌ [Professional Notifications] Error finding matching professionals:', error);
    return [];
  }
}

// =====================================================
// Get User Details
// =====================================================
async function getUserDetails(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, phone')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

// =====================================================
// Create In-App Notification
// =====================================================
async function createInAppNotification(
  professionalUserId: string,
  title: string,
  message: string,
  type: 'task' | 'wish',
  referenceId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: professionalUserId,
        title,
        message,
        type: `professional_${type}_match`,
        reference_id: referenceId,
        reference_type: type,
        is_read: false,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    return false;
  }
}

// =====================================================
// Generate WhatsApp Link (without sending - user clicks)
// Note: WhatsApp doesn't support automated messages or deep links in templates
// This generates a prefilled message link that professionals can click
// =====================================================
function generateWhatsAppNotificationLink(
  professionalWhatsApp: string,
  requesterName: string,
  type: 'task' | 'wish',
  title: string,
  description: string | undefined,
  itemId: string
): string {
  const typeLabel = type === 'task' ? 'Task' : 'Wish';
  const appUrl = window.location.origin;
  
  // Note: WhatsApp deep links work on mobile but have limitations
  // The link format is: https://localfelo.com/tasks/{id} or /wishes/{id}
  const deepLink = `${appUrl}/${type}s/${itemId}`;
  
  const message = `🔔 New ${typeLabel} Match on LocalFelo!\n\n` +
    `📋 ${typeLabel}: ${title}\n` +
    (description ? `📝 Details: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\n` : '') +
    `👤 Posted by: ${requesterName}\n\n` +
    `🔗 View full details: ${deepLink}\n\n` +
    `💡 Login to your LocalFelo account to view complete ${type} details and contact the requester.`;

  return `https://wa.me/${professionalWhatsApp}?text=${encodeURIComponent(message)}`;
}

// =====================================================
// Send Professional Match Notification (Task)
// =====================================================
export async function notifyProfessionalsForTask(
  taskId: string,
  taskTitle: string,
  taskDescription: string | undefined,
  categoryId: string,
  subcategoryId: string | undefined,
  city: string,
  area: string | undefined,
  requesterUserId: string
): Promise<{ success: boolean; notifiedCount: number; error?: string }> {
  try {
    // Find matching professionals
    const professionals = await findMatchingProfessionals(categoryId, subcategoryId, city, area);

    if (professionals.length === 0) {
      return { success: true, notifiedCount: 0 };
    }

    // Get requester details
    const requester = await getUserDetails(requesterUserId);
    const requesterName = requester?.name || 'A LocalFelo user';

    let notifiedCount = 0;

    // Notify each professional
    for (const professional of professionals) {
      // Create in-app notification
      const notificationTitle = `New Task Match: ${taskTitle}`;
      const notificationMessage = `${requesterName} posted a task in your category. Tap to view details and contact them.`;

      const success = await createInAppNotification(
        professional.user_id,
        notificationTitle,
        notificationMessage,
        'task',
        taskId
      );

      if (success) {
        notifiedCount++;

        // Generate WhatsApp link (stored for reference, could be shown in UI)
        const whatsappLink = generateWhatsAppNotificationLink(
          professional.whatsapp,
          requesterName,
          'task',
          taskTitle,
          taskDescription,
          taskId
        );

        // Log for debugging/future use
        console.log(`WhatsApp notification link for ${professional.name}:`, whatsappLink);
        
        // Optional: Store WhatsApp link in notification metadata for future use
        // Could be used to show "Send WhatsApp Reminder" button in professional's notifications panel
      }
    }

    return { success: true, notifiedCount };
  } catch (error: any) {
    console.error('Error notifying professionals for task:', error);
    return { success: false, notifiedCount: 0, error: error.message };
  }
}

// =====================================================
// Send Professional Match Notification (Wish)
// =====================================================
export async function notifyProfessionalsForWish(
  wishId: string,
  wishTitle: string,
  wishDescription: string | undefined,
  categoryId: string,
  subcategoryId: string | undefined,
  city: string,
  area: string | undefined,
  requesterUserId: string
): Promise<{ success: boolean; notifiedCount: number; error?: string }> {
  try {
    // Find matching professionals
    const professionals = await findMatchingProfessionals(categoryId, subcategoryId, city, area);

    if (professionals.length === 0) {
      return { success: true, notifiedCount: 0 };
    }

    // Get requester details
    const requester = await getUserDetails(requesterUserId);
    const requesterName = requester?.name || 'A LocalFelo user';

    let notifiedCount = 0;

    // Notify each professional
    for (const professional of professionals) {
      // Create in-app notification
      const notificationTitle = `New Wish Match: ${wishTitle}`;
      const notificationMessage = `${requesterName} posted a wish in your category. Tap to view details and contact them.`;

      const success = await createInAppNotification(
        professional.user_id,
        notificationTitle,
        notificationMessage,
        'wish',
        wishId
      );

      if (success) {
        notifiedCount++;

        // Generate WhatsApp link (stored for reference, could be shown in UI)
        const whatsappLink = generateWhatsAppNotificationLink(
          professional.whatsapp,
          requesterName,
          'wish',
          wishTitle,
          wishDescription,
          wishId
        );

        // Log for debugging/future use
        console.log(`WhatsApp notification link for ${professional.name}:`, whatsappLink);
      }
    }

    return { success: true, notifiedCount };
  } catch (error: any) {
    console.error('Error notifying professionals for wish:', error);
    return { success: false, notifiedCount: 0, error: error.message };
  }
}

// =====================================================
// Get Professional's Task/Wish Notifications
// =====================================================
export async function getProfessionalMatchNotifications(
  professionalUserId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', professionalUserId)
      .in('type', ['professional_task_match', 'professional_wish_match'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching professional notifications:', error);
    return [];
  }
}