import React, { useState } from 'react';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { toast } from 'sonner';
import { Send, Users, AlertCircle } from 'lucide-react';
import { sendBroadcastNotification } from '../services/notifications';

interface BroadcastNotificationFormProps {
  onSuccess?: () => void;
}

export function BroadcastNotificationForm({ onSuccess }: BroadcastNotificationFormProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'promotion' | 'alert'>('info');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setSending(true);

    try {
      const result = await sendBroadcastNotification({
        recipients: 'all',
        title: title.trim(),
        message: message.trim(),
        type,
        link: link.trim() || undefined,
      });

      if (result.success) {
        toast.success(`📢 Notification sent to ${result.count} users!`);
        
        // Clear form
        setTitle('');
        setMessage('');
        setLink('');
        setType('info');
        
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Broadcast error:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-4 bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#CDFF00] rounded-full flex items-center justify-center">
          <Send className="w-5 h-5 text-black" />
        </div>
        <div>
          <h3 className="font-semibold text-black">Broadcast Notification</h3>
          <p className="text-sm text-gray-600">Send a notification to all users</p>
        </div>
      </div>

      <InputField
        label="Title"
        type="text"
        value={title}
        onChange={setTitle}
        placeholder="e.g., New Feature Alert!"
        required
        disabled={sending}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          required
          disabled={sending}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CDFF00] focus:border-transparent resize-none text-black"
        />
      </div>

      <SelectField
        label="Type"
        value={type}
        onChange={(value) => setType(value as any)}
        disabled={sending}
      >
        <option value="info">ℹ️ Info</option>
        <option value="promotion">🎉 Promotion</option>
        <option value="alert">⚠️ Alert</option>
      </SelectField>

      <InputField
        label="Link (optional)"
        type="text"
        value={link}
        onChange={setLink}
        placeholder="e.g., /marketplace or https://..."
        disabled={sending}
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-900 font-medium">
            This will send a notification to ALL users
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Make sure your message is clear and valuable
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {sending ? 'Sending...' : 'Send to All Users'}
      </button>
    </form>
  );
}