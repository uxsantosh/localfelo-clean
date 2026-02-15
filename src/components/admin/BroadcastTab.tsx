import React, { useState, useEffect } from 'react';
import { Bell, Users, User, Send, Loader, CheckCircle, X, Search, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { sendBroadcastNotification } from '../../services/notifications';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

export function BroadcastTab() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'promotion' | 'alert'>('info');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);
  
  // Recipient selection
  const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Load users when switching to 'selected' mode
  useEffect(() => {
    if (recipientMode === 'selected') {
      loadUsers();
    }
  }, [recipientMode]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    if (recipientMode === 'selected' && selectedUserIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    const recipientCount = recipientMode === 'all' ? users.length : selectedUserIds.length;
    const recipientText = recipientMode === 'all' 
      ? 'ALL users' 
      : `${selectedUserIds.length} selected user(s)`;

    if (!window.confirm(`Send notification to ${recipientText}?\n\nTitle: ${title}\nMessage: ${message}`)) {
      return;
    }

    setSending(true);
    try {
      const result = await sendBroadcastNotification({
        recipients: recipientMode === 'all' ? 'all' : selectedUserIds,
        title: title.trim(),
        message: message.trim(),
        type,
        link: link.trim() || undefined,
      });

      console.log('📊 [BroadcastTab] Result from sendBroadcastNotification:', result);

      if (result.success) {
        console.log(`✅ [BroadcastTab] Broadcast sent successfully to ${result.count} users`);
        toast.success(`Notification sent to ${result.count} users!`);
        // Clear form
        setTitle('');
        setMessage('');
        setLink('');
        setType('info');
        setSelectedUserIds([]);
      } else {
        console.error('❌ [BroadcastTab] Broadcast failed:', result.error);
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
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

        <div className="space-y-4">
          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setRecipientMode('all')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                  recipientMode === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>All Users</span>
              </button>
              <button
                onClick={() => setRecipientMode('selected')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                  recipientMode === 'selected'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Selected Users</span>
              </button>
            </div>

            {/* User Selection */}
            {recipientMode === 'selected' && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="mb-3">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {loadingUsers ? (
                  <div className="text-center py-4 text-sm text-gray-500">Loading users...</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">
                        {selectedUserIds.length} of {users.length} selected
                      </span>
                      {selectedUserIds.length > 0 && (
                        <button
                          onClick={() => setSelectedUserIds([])}
                          className="text-xs text-primary hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredUsers.length === 0 ? (
                        <div className="text-center py-4 text-sm text-gray-500">
                          {userSearch ? 'No users found' : 'No users available'}
                        </div>
                      ) : (
                        filteredUsers.map(user => (
                          <label
                            key={user.id}
                            className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900 truncate">
                                {user.name || 'Unnamed User'}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {user.email}
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('info')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  type === 'info'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                ℹ️ Info
              </button>
              <button
                onClick={() => setType('promotion')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  type === 'promotion'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                🎉 Promo
              </button>
              <button
                onClick={() => setType('alert')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  type === 'alert'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                ⚠️ Alert
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New Feature Launched!"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
          </div>

          {/* Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link (Optional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Add a link for users to visit</p>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">PREVIEW</p>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    type === 'info' ? 'bg-blue-100' : type === 'promotion' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {type === 'info' ? '💡' : type === 'promotion' ? '🎉' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {title || 'Your title here'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {message || 'Your message here'}
                    </p>
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-2 inline-block"
                      >
                        {link}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-800">
              {recipientMode === 'all' ? (
                <>This notification will be sent to <strong>ALL users</strong>. Please double-check before sending.</>
              ) : (
                <>This notification will be sent to <strong>{selectedUserIds.length} selected user(s)</strong>.</>
              )}
            </p>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim() || (recipientMode === 'selected' && selectedUserIds.length === 0)}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {recipientMode === 'all' 
                    ? 'Send to All Users' 
                    : `Send to ${selectedUserIds.length} User(s)`
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}