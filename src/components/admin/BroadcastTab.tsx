import { useState } from 'react';
import { Bell } from 'lucide-react';
import { BroadcastNotificationForm } from '../BroadcastNotificationForm';
import { sendBroadcastNotification } from '../../services/notifications';
import { toast } from 'sonner@2.0.3';

export function BroadcastTab() {
  const handleSend = async (formData: {
    title: string;
    message: string;
    type: 'info' | 'promotion' | 'alert';
    link: string;
    recipients: 'all' | string[];
  }) => {
    const { title, message, type, link, recipients } = formData;

    const recipientCount = Array.isArray(recipients) ? recipients.length : 'all';
    const recipientText = Array.isArray(recipients) 
      ? `${recipients.length} selected user(s)` 
      : 'ALL users';

    if (!window.confirm(`Send notification to ${recipientText}?\n\nTitle: ${title}\nMessage: ${message}`)) {
      return;
    }

    try {
      const result = await sendBroadcastNotification({
        recipients,
        title: title.trim(),
        message: message.trim(),
        type,
        link: link.trim() || undefined,
      });

      console.log('📊 [BroadcastTab] Result from sendBroadcastNotification:', result);

      if (result.success) {
        console.log(`✅ [BroadcastTab] Broadcast sent successfully to ${result.count} users`);
        toast.success(`Notification sent to ${result.count} users!`);
        
        // 🔔 Send push notifications (non-blocking)
        if (result.count && result.count > 0) {
          try {
            const { notifyMultipleUsers } = await import('../../services/pushNotificationDispatcher');
            const { supabase } = await import('../../lib/supabaseClient');
            
            // Get target user IDs
            let targetUserIds: string[] = [];
            if (Array.isArray(recipients)) {
              targetUserIds = recipients;
            } else {
              const { data: allUsers } = await supabase.from('profiles').select('id');
              targetUserIds = allUsers?.map(u => u.id) || [];
            }
            
            // Send push notifications
            if (targetUserIds.length > 0) {
              notifyMultipleUsers({
                userIds: targetUserIds,
                title: title.trim(),
                body: message.trim(),
                data: {
                  type: 'system',
                  entity_id: 'broadcast',
                  action: 'broadcast',
                  message_type: type,
                },
              }).catch(err => console.warn('[BroadcastTab] Push notification failed:', err));
              
              console.log(`📲 [BroadcastTab] Push notifications queued for ${targetUserIds.length} users`);
            }
          } catch (pushError) {
            console.warn('⚠️ [BroadcastTab] Failed to send push notifications:', pushError);
            // Don't fail the broadcast if push fails
          }
        }
        
        // Clear form
        // setTitle('');
        // setMessage('');
        // setLink('');
        // setType('info');
        // setSelectedUserIds([]);
      } else {
        console.error('❌ [BroadcastTab] Broadcast failed:', result.error);
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      toast.error('Failed to send notification');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Broadcast Notification</h2>
            <p className="text-sm text-gray-600">Send notifications to users</p>
          </div>
        </div>

        <BroadcastNotificationForm onSend={handleSend} />
      </div>
    </div>
  );
}