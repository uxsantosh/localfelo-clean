import React, { useState, useEffect } from 'react';
import { MessageSquare, Download, ExternalLink, Search } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  listing_id: string | null;
  wish_id: string | null;
  task_id: string | null;
  created_at: string;
  sender_name: string;
  receiver_name: string;
  listing_title: string | null;
  wish_title: string | null;
  task_title: string | null;
}

export function AllChatsTab() {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'marketplace' | 'wish' | 'task'>('all');

  useEffect(() => {
    loadAllChats();
  }, []);

  const loadAllChats = async () => {
    setLoading(true);
    try {
      // Fetch all messages first (no joins - they cause foreign key errors)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, message, listing_id, wish_id, task_id, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (messagesError) throw messagesError;

      // Get all unique sender and receiver IDs
      const allUserIds = new Set<string>();
      (messagesData || []).forEach(msg => {
        if (msg.sender_id) allUserIds.add(msg.sender_id);
        if (msg.receiver_id) allUserIds.add(msg.receiver_id);
      });

      // Fetch all profiles that match any of these IDs (id, client_token, owner_token, or auth_user_id)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, client_token, owner_token, auth_user_id, display_name, name')
        .or(`id.in.(${Array.from(allUserIds).join(',')}),client_token.in.(${Array.from(allUserIds).join(',')}),owner_token.in.(${Array.from(allUserIds).join(',')}),auth_user_id.in.(${Array.from(allUserIds).join(',')})`);

      // Create lookup map
      const profileMap = new Map<string, string>();
      (profilesData || []).forEach(profile => {
        const displayName = profile.display_name || profile.name || 'Unknown User';
        if (profile.id) profileMap.set(profile.id, displayName);
        if (profile.client_token) profileMap.set(profile.client_token, displayName);
        if (profile.owner_token) profileMap.set(profile.owner_token, displayName);
        if (profile.auth_user_id) profileMap.set(profile.auth_user_id, displayName);
      });

      // Get unique listing, wish, and task IDs
      const listingIds = [...new Set((messagesData || []).map(m => m.listing_id).filter(Boolean))];
      const wishIds = [...new Set((messagesData || []).map(m => m.wish_id).filter(Boolean))];
      const taskIds = [...new Set((messagesData || []).map(m => m.task_id).filter(Boolean))];

      // Fetch titles
      const [listingsData, wishesData, tasksData] = await Promise.all([
        listingIds.length > 0 ? supabase.from('listings').select('id, title').in('id', listingIds) : Promise.resolve({ data: [] }),
        wishIds.length > 0 ? supabase.from('wishes').select('id, title').in('id', wishIds) : Promise.resolve({ data: [] }),
        taskIds.length > 0 ? supabase.from('tasks').select('id, title').in('id', taskIds) : Promise.resolve({ data: [] })
      ]);

      // Create title maps
      const listingTitleMap = new Map((listingsData.data || []).map(l => [l.id, l.title]));
      const wishTitleMap = new Map((wishesData.data || []).map(w => [w.id, w.title]));
      const taskTitleMap = new Map((tasksData.data || []).map(t => [t.id, t.title]));

      // Format the chat messages
      const formattedChats = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        message: msg.message || msg.content || '',
        listing_id: msg.listing_id,
        wish_id: msg.wish_id,
        task_id: msg.task_id,
        created_at: msg.created_at,
        sender_name: profileMap.get(msg.sender_id) || 'Unknown',
        receiver_name: profileMap.get(msg.receiver_id) || 'Unknown',
        listing_title: msg.listing_id ? (listingTitleMap.get(msg.listing_id) || null) : null,
        wish_title: msg.wish_id ? (wishTitleMap.get(msg.wish_id) || null) : null,
        task_title: msg.task_id ? (taskTitleMap.get(msg.task_id) || null) : null,
      }));

      setChats(formattedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chat history');
    }
    setLoading(false);
  };

  const exportChats = () => {
    const csvContent = [
      ['Date', 'Time', 'Sender', 'Receiver', 'Message', 'Type', 'Item Title'].join(','),
      ...filteredChats.map(chat => [
        new Date(chat.created_at).toLocaleDateString(),
        new Date(chat.created_at).toLocaleTimeString(),
        chat.sender_name,
        chat.receiver_name,
        `"${chat.message.replace(/"/g, '""')}"`,
        chat.listing_id ? 'Marketplace' : chat.wish_id ? 'Wish' : chat.task_id ? 'Task' : 'General',
        chat.listing_title || chat.wish_title || chat.task_title || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `localfelo-chat-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat history exported!');
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = 
      chat.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.receiver_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'marketplace' && chat.listing_id) ||
      (filterType === 'wish' && chat.wish_id) ||
      (filterType === 'task' && chat.task_id);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-muted">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading m-0">All Chat History</h2>
          <p className="text-sm text-muted m-0 mt-1">
            Complete chat history for legal and compliance purposes
          </p>
        </div>
        <button
          onClick={exportChats}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export to CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages, users..."
              className="input-field w-full pl-10"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="select-field"
          >
            <option value="all">All Types</option>
            <option value="marketplace">Marketplace</option>
            <option value="wish">Wishes</option>
            <option value="task">Tasks</option>
          </select>
        </div>

        <div className="text-sm text-muted">
          Showing {filteredChats.length} of {chats.length} messages
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-heading uppercase">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-heading uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-heading uppercase">To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-heading uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-heading uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-heading uppercase">Item</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No messages found
                  </td>
                </tr>
              ) : (
                filteredChats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-body whitespace-nowrap">
                      <div>{new Date(chat.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted">{new Date(chat.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-heading font-medium">
                      {chat.sender_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-heading font-medium">
                      {chat.receiver_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-body max-w-md">
                      <div className="line-clamp-2">{chat.message}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        chat.listing_id ? 'bg-blue-100 text-blue-800' :
                        chat.wish_id ? 'bg-purple-100 text-purple-800' :
                        chat.task_id ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {chat.listing_id ? 'Marketplace' : chat.wish_id ? 'Wish' : chat.task_id ? 'Task' : 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-body">
                      {chat.listing_title || chat.wish_title || chat.task_title || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}