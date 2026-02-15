import { useState, useEffect } from 'react';
import { MessageSquare, Search, X, User, Calendar, AlertCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { EmptyState } from '../EmptyState';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_price: number;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  listingtype: 'listing' | 'wish' | 'task';
  created_at: string;
  last_message_at: string;
  buyer_email?: string;
  seller_email?: string;
}

export function ChatHistoryTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'listings' | 'wishes' | 'tasks'>('all');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchTerm, typeFilter]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      console.log('📋 Loading chat history...');
      
      // Fetch all conversations with proper error handling
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convError) {
        console.error('Error fetching conversations:', convError);
        throw convError;
      }

      console.log(`📊 Found ${conversationsData?.length || 0} conversations`);

      // Enrich conversations with user emails
      const enriched = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          console.log(`🔍 Processing conversation ${conv.id}:`, {
            listingType: conv.listingtype,
            listingId: conv.listing_id,
            buyerId: conv.buyer_id,
            sellerId: conv.seller_id
          });

          // Fetch buyer email
          let buyerEmail = '';
          if (conv.buyer_id) {
            const { data: buyerProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', conv.buyer_id)
              .maybeSingle();
            buyerEmail = buyerProfile?.email || '';
          }

          // Fetch seller email
          let sellerEmail = '';
          if (conv.seller_id) {
            const { data: sellerProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', conv.seller_id)
              .maybeSingle();
            sellerEmail = sellerProfile?.email || '';
          }

          return {
            ...conv,
            buyer_email: buyerEmail,
            seller_email: sellerEmail,
            listingtype: conv.listingtype || 'listing'
          } as Conversation;
        })
      );

      console.log('✅ Enriched conversations:', enriched.length);
      setConversations(enriched);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let result = [...conversations];

    // Type filter
    if (typeFilter === 'listings') {
      result = result.filter(c => c.listingtype === 'listing');
    } else if (typeFilter === 'wishes') {
      result = result.filter(c => c.listingtype === 'wish');
    } else if (typeFilter === 'tasks') {
      result = result.filter(c => c.listingtype === 'task');
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.buyer_name?.toLowerCase().includes(term) ||
        c.buyer_email?.toLowerCase().includes(term) ||
        c.seller_name?.toLowerCase().includes(term) ||
        c.seller_email?.toLowerCase().includes(term) ||
        c.listing_title?.toLowerCase().includes(term)
      );
    }

    setFilteredConversations(result);
  };

  const loadMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      console.log('💬 Loading messages for conversation:', conversationId);
      
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log(`📨 Found ${messagesData?.length || 0} messages`);

      // Enrich messages with sender info
      const enriched = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', msg.sender_id)
            .maybeSingle();

          return {
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            content: msg.content || msg.message || '', // Handle both column names
            created_at: msg.created_at,
            sender_name: sender?.name || 'Unknown User',
            sender_email: sender?.email || ''
          } as Message;
        })
      );

      setMessages(enriched);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const getConversationType = (conv: Conversation): { type: string; title: string } => {
    const typeLabel = conv.listingtype === 'listing' ? 'Listing' : 
                      conv.listingtype === 'wish' ? 'Wish' : 
                      conv.listingtype === 'task' ? 'Task' : 'Unknown';
    
    return { 
      type: typeLabel, 
      title: conv.listing_title || 'Unknown' 
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-300px)]">
      {/* Conversations List */}
      <div className="border border-gray-200 overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-black m-0">Chat History ({filteredConversations.length})</h3>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search by user or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex gap-1">
            {['all', 'listings', 'wishes', 'tasks'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type as any)}
                className={`px-3 py-1.5 text-xs transition-colors capitalize ${
                  typeFilter === type
                    ? 'bg-black text-white font-medium'
                    : 'bg-white border border-gray-200 text-body hover:border-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4">
              <EmptyState 
                icon={MessageCircle}
                title="No Conversations Found"
                description="No chat conversations match your search criteria"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conv) => {
                const { type, title } = getConversationType(conv);
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-[#CDFF00]/10 border-l-4 border-[#CDFF00]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-black">
                            {type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-body m-0 truncate">{title}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-xs font-bold text-black">
                          ₹{(conv.listing_price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted mb-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{conv.buyer_name || conv.buyer_email || 'Unknown'}</span>
                      <span>↔</span>
                      <span className="truncate">{conv.seller_name || conv.seller_email || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(conv.last_message_at || conv.created_at)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className="border border-gray-200 overflow-hidden flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-black m-0">Messages ({messages.length})</h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-1.5 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-body space-y-1">
                <p className="m-0">
                  <strong>Between:</strong> {selectedConversation.buyer_name || selectedConversation.buyer_email || 'Unknown'} ↔{' '}
                  {selectedConversation.seller_name || selectedConversation.seller_email || 'Unknown'}
                </p>
                <p className="m-0">
                  <strong>About:</strong> {getConversationType(selectedConversation).title}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted">No messages in this conversation</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-white p-3 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-[#CDFF00]" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-black m-0">
                            {msg.sender_name}
                          </p>
                          {msg.sender_email && (
                            <p className="text-xs text-muted m-0">{msg.sender_email}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-body m-0 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted m-0">Select a conversation to view messages</p>
              <p className="text-xs text-muted mt-1">Chat history is stored for legal and security purposes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}