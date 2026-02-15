import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Package, Users, Heart, Briefcase, Flag, Bell, Settings, 
  Search, Filter, ChevronDown, X, Edit, Trash2, Eye, EyeOff, 
  AlertTriangle, MessageSquare, Mail, Phone 
} from 'lucide-react';
import { getCitiesWithAreas } from '../services/locations';
import { City } from '../types';
import { SiteSettingsTab } from '../components/admin/SiteSettingsTab';
import { WishesManagementTab } from '../components/admin/WishesManagementTab';
import { TasksManagementTab } from '../components/admin/TasksManagementTab';
import { ReportsManagementTab } from '../components/admin/ReportsManagementTab';
import { BroadcastTab } from '../components/admin/BroadcastTab';
import { ChatHistoryTab } from '../components/admin/ChatHistoryTab';
import { AllChatsTab } from '../components/admin/AllChatsTab';
import { FooterPagesTab } from '../components/admin/FooterPagesTab';
import { Header } from '../components/Header';
import { EmptyState } from '../components/EmptyState';
import { toast } from 'sonner';

/**
 * ADMIN ACCESS CONTROL
 * ===================
 * Admin access is restricted to: uxsantosh@gmail.com
 * This email must have is_admin = true in the profiles table.
 * 
 * To grant admin access:
 * 1. User must sign up with uxsantosh@gmail.com
 * 2. Run SQL: UPDATE profiles SET is_admin = true WHERE email = 'uxsantosh@gmail.com';
 * 
 * Admin capabilities:
 * - Manage all listings, wishes, tasks
 * - Manage users (activate/deactivate, grant/revoke admin)
 * - View and resolve reports
 * - Broadcast notifications to all users
 * - Configure site settings
 * 
 * IMPORTANT: When new features are added to LocalFelo, they MUST be added
 * to this admin interface automatically without separate instructions.
 */

interface AdminScreenProps {
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  city_id: string;
  area_id: string;
  phone?: string;
  has_whatsapp: boolean;
  is_hidden: boolean;
  owner_token: string;
  created_at: string;
  // Joined data
  profiles?: {
    name: string;
    email: string;
  };
  categories?: {
    name: string;
    emoji: string;
  };
  areas?: {
    name: string;
  };
  listing_images?: Array<{
    image_url: string;
  }>;
  reports?: Array<{
    id: string;
    reason: string;
    created_at: string;
  }>;
}

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  city_id?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  // Computed
  listingsCount?: number;
  reportsCount?: number;
}

export function AdminScreen({
  onNavigate,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
}: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'wishes' | 'tasks' | 'reports' | 'site-settings' | 'broadcast' | 'chat-history' | 'all-chats' | 'footer-pages'>('listings');
  
  // Listings state
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Cities state for wishes tab
  const [cities, setCities] = useState<City[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden' | 'reported'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive' | 'admin'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Comment modal state
  const [commentModal, setCommentModal] = useState<{
    listingId: string;
    comment: string;
    action: 'hide' | 'delete';
  } | null>(null);

  // Edit modal state
  const [editModal, setEditModal] = useState<{
    listing: Listing;
    title: string;
    description: string;
    price: number;
  } | null>(null);

  // Load all listings
  useEffect(() => {
    if (activeTab === 'listings') {
      loadListings();
    }
  }, [activeTab]);

  // Load all users
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  // Load cities for wishes tab
  useEffect(() => {
    async function loadCities() {
      try {
        const citiesData = await getCitiesWithAreas();
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to load cities:', error);
      }
    }
    loadCities();
  }, []);

  // Filter listings
  useEffect(() => {
    let result = [...listings];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(term) ||
        listing.description.toLowerCase().includes(term) ||
        listing.profiles?.email.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter === 'hidden') {
      result = result.filter(l => l.is_hidden);
    } else if (statusFilter === 'active') {
      result = result.filter(l => !l.is_hidden);
    } else if (statusFilter === 'reported') {
      result = result.filter(l => l.reports && l.reports.length > 0);
    }
    
    setFilteredListings(result);
  }, [listings, searchTerm, statusFilter]);

  // Filter users
  useEffect(() => {
    let result = [...users];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.name?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
      );
    }
    
    // Status filter
    if (userStatusFilter === 'active') {
      result = result.filter(u => u.is_active);
    } else if (userStatusFilter === 'inactive') {
      result = result.filter(u => !u.is_active);
    } else if (userStatusFilter === 'admin') {
      result = result.filter(u => u.is_admin);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, userStatusFilter]);

  const loadListings = async () => {
    setListingsLoading(true);
    try {
      // Fetch listings with related data using separate queries for better compatibility
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Enrich each listing with related data
      const enrichedListings = await Promise.all(
        (listingsData || []).map(async (listing) => {
          // Fetch owner profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', listing.owner_token)
            .single();

          // Fetch category
          const { data: category } = await supabase
            .from('categories')
            .select('name, emoji')
            .eq('id', listing.category_id)
            .single();

          // Fetch area
          const { data: area } = await supabase
            .from('areas')
            .select('name')
            .eq('id', listing.area_id)
            .single();

          // Fetch images
          const { data: images } = await supabase
            .from('listing_images')
            .select('image_url')
            .eq('listing_id', listing.id);

          // Fetch reports
          const { data: reports } = await supabase
            .from('reports')
            .select('id, reason, created_at')
            .eq('listing_id', listing.id)
            .order('created_at', { ascending: false });

          return {
            ...listing,
            is_hidden: listing.is_hidden !== undefined ? listing.is_hidden : false, // Default to false if column doesn't exist
            profiles: profile,
            categories: category,
            areas: area,
            listing_images: images || [],
            reports: reports || [],
          };
        })
      );

      setListings(enrichedListings);
      console.log('✅ Loaded', enrichedListings.length, 'listings');
    } catch (error) {
      console.error('❌ Failed to load listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Load counts for each user and ensure is_active exists
      const usersWithCounts = await Promise.all(
        (usersData || []).map(async (user) => {
          // Count listings
          const { count: listingsCount } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('owner_token', user.id);

          // Count reports made by user
          const { count: reportsCount } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('reported_by', user.id);

          return {
            ...user,
            is_active: user.is_active !== undefined ? user.is_active : true, // Default to true if column doesn't exist
            listingsCount: listingsCount || 0,
            reportsCount: reportsCount || 0,
          };
        })
      );

      setUsers(usersWithCounts);
      console.log('✅ Loaded', usersWithCounts.length, 'users');
    } catch (error) {
      console.error('❌ Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleListingVisibility = async (listingId: string, currentlyHidden: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_hidden: !currentlyHidden })
        .eq('id', listingId);

      if (error) {
        // Check if column doesn't exist
        if (error.message?.includes('column') || error.message?.includes('does not exist')) {
          toast.error('Please add is_hidden column to listings table first. Check console for SQL.');
          console.error('❌ is_hidden column missing. Run this SQL in Supabase:');
          console.error('ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;');
          return;
        }
        throw error;
      }

      setListings(listings.map(l => 
        l.id === listingId ? { ...l, is_hidden: !currentlyHidden } : l
      ));
      toast.success(currentlyHidden ? 'Listing unhidden' : 'Listing hidden');
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('Failed to update listing');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      setListings(listings.filter(l => l.id !== listingId));
      toast.success('Listing deleted permanently');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handleAddAdminComment = async (listingId: string, comment: string, action: 'hide' | 'delete') => {
    try {
      // Add comment to reports table
      const { error: commentError } = await supabase
        .from('reports')
        .insert({
          listing_id: listingId,
          reason: `[ADMIN ACTION: ${action.toUpperCase()}] ${comment}`,
          reported_by: 'admin',
        });

      if (commentError) throw commentError;

      // Perform action
      if (action === 'hide') {
        await handleToggleListingVisibility(listingId, false);
      } else if (action === 'delete') {
        await handleDeleteListing(listingId);
      }

      setCommentModal(null);
      toast.success(`Listing ${action}d with comment`);
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentlyActive })
        .eq('id', userId);

      if (error) {
        // Check if column doesn't exist
        if (error.message?.includes('column') || error.message?.includes('does not exist')) {
          toast.error('Please add is_active column to profiles table first. Check console for SQL.');
          console.error('❌ is_active column missing. Run this SQL in Supabase:');
          console.error('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;');
          return;
        }
        throw error;
      }

      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentlyActive } : u
      ));
      toast.success(currentlyActive ? 'User deactivated' : 'User activated');
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Failed to update user');
    }
  };

  const handleToggleAdminStatus = async (userId: string, currentlyAdmin: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlyAdmin ? 'remove' : 'grant'} admin access?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentlyAdmin })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: !currentlyAdmin } : u
      ));
      toast.success(currentlyAdmin ? 'Admin access revoked' : 'Admin access granted');
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      toast.error('Failed to update user');
    }
  };

  const handleEditListing = async () => {
    if (!editModal) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: editModal.title,
          description: editModal.description,
          price: editModal.price,
        })
        .eq('id', editModal.listing.id);

      if (error) throw error;

      setListings(listings.map(l => 
        l.id === editModal.listing.id 
          ? { ...l, title: editModal.title, description: editModal.description, price: editModal.price }
          : l
      ));
      toast.success('Listing updated successfully');
      setEditModal(null);
    } catch (error) {
      console.error('Failed to update listing:', error);
      toast.error('Failed to update listing');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header
        title="Admin Dashboard"
        currentScreen="admin"
        onNavigate={(screen) => onNavigate && onNavigate(screen as any)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />

      <div className="page-container py-6">
        {/* Admin Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
            <div className="px-3 py-1.5 bg-[#CDFF00] text-black rounded text-xs font-bold uppercase tracking-wide">
              Super Admin
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Manage all aspects of LocalFelo platform
          </p>
        </div>

        {/* Tab Navigation - Clean, Minimal */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max bg-white p-1" style={{ borderRadius: '8px' }}>
            <button
              onClick={() => { setActiveTab('listings'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'listings'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Package className="w-4 h-4" />
              <span>Listings</span>
            </button>
            <button
              onClick={() => { setActiveTab('wishes'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'wishes'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Heart className="w-4 h-4" />
              <span>Wishes</span>
            </button>
            <button
              onClick={() => { setActiveTab('tasks'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Briefcase className="w-4 h-4" />
              <span>Tasks</span>
            </button>
            <button
              onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              onClick={() => { setActiveTab('reports'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Flag className="w-4 h-4" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => { setActiveTab('broadcast'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'broadcast'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Bell className="w-4 h-4" />
              <span>Broadcast</span>
            </button>
            <button
              onClick={() => { setActiveTab('site-settings'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'site-settings'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => { setActiveTab('chat-history'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'chat-history'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat History</span>
            </button>
            <button
              onClick={() => { setActiveTab('all-chats'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'all-chats'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>All Chats</span>
            </button>
            <button
              onClick={() => { setActiveTab('footer-pages'); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'footer-pages'
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Footer Pages</span>
            </button>
          </div>
        </div>

        {/* Search and Filters - Only show for listings and users tabs */}
        {activeTab !== 'site-settings' && activeTab !== 'wishes' && activeTab !== 'tasks' && activeTab !== 'reports' && activeTab !== 'broadcast' && activeTab !== 'chat-history' && activeTab !== 'all-chats' && activeTab !== 'footer-pages' && (
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder={activeTab === 'listings' ? 'Search listings...' : activeTab === 'users' ? 'Search users...' : 'Search...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-black text-white border-black'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="p-4 bg-card rounded-lg border border-border">
              {activeTab === 'listings' ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    All ({listings.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    Active ({listings.filter(l => !l.is_hidden).length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('hidden')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      statusFilter === 'hidden'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    Hidden ({listings.filter(l => l.is_hidden).length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('reported')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      statusFilter === 'reported'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    Reported ({listings.filter(l => l.reports && l.reports.length > 0).length})
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setUserStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      userStatusFilter === 'all'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    All ({users.length})
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      userStatusFilter === 'active'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    Active ({users.filter(u => u.is_active).length})
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('inactive')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      userStatusFilter === 'inactive'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    Inactive ({users.filter(u => !u.is_active).length})
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('admin')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      userStatusFilter === 'admin'
                        ? 'bg-black text-white font-medium'
                        : 'bg-input hover:bg-input/80'
                    }`}
                  >
                    Admins ({users.filter(u => u.is_admin).length})
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {/* Content */}
        {activeTab === 'listings' ? (
          <div>
            {listingsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted mt-4">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <EmptyState 
                type="no-listings" 
                message={searchTerm ? 'No listings found' : 'No listings yet'} 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredListings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className={`card p-3 ${listing.is_hidden ? 'opacity-60' : ''}`}
                  >
                    {/* Image/Icon */}
                    <div className="flex gap-2 mb-2">
                      {listing.listing_images && listing.listing_images.length > 0 ? (
                        <img
                          src={listing.listing_images[0].image_url}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded-lg shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-input rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-2xl">{listing.categories?.emoji || '📦'}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm m-0 mb-1 line-clamp-2">{listing.title}</h3>
                        <p className="text-primary text-xs m-0">
                          ₹{listing.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-1 mb-2 text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <span className="truncate">{listing.categories?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span className="truncate">{listing.areas?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{listing.profiles?.email || 'Unknown'}</span>
                      </div>
                      {listing.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{listing.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Reports */}
                    {listing.reports && listing.reports.length > 0 && (
                      <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                        <div className="flex items-center gap-1 text-orange-700 mb-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{listing.reports.length} Report(s)</span>
                        </div>
                        <p className="text-orange-600 m-0 line-clamp-2">
                          {listing.reports[0].reason}
                        </p>
                      </div>
                    )}

                    {/* Status Badge */}
                    {listing.is_hidden && (
                      <div className="mb-2 px-2 py-1 bg-rose-50 border border-rose-200 rounded text-center">
                        <span className="text-xs text-rose-700">Hidden</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleToggleListingVisibility(listing.id, listing.is_hidden)}
                        className={`text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                          listing.is_hidden
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        }`}
                      >
                        {listing.is_hidden ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Show</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hide</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setCommentModal({ listingId: listing.id, comment: '', action: 'hide' })}
                        className="text-xs py-1.5 rounded flex items-center justify-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Note</span>
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="text-xs py-1.5 rounded flex items-center justify-center gap-1 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => setEditModal({
                          listing,
                          title: listing.title,
                          description: listing.description,
                          price: listing.price,
                        })}
                        className="text-xs py-1.5 rounded flex items-center justify-center gap-1 bg-input hover:bg-input/80 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div>
            {usersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted mt-4">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState 
                type="no-listings" 
                message={searchTerm ? 'No users found' : 'No users yet'} 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className={`card p-4 ${!user.is_active ? 'opacity-60' : ''}`}
                  >
                    {/* User Info */}
                    <div className="mb-3">
                      <h3 className="text-sm m-0 mb-1 font-semibold truncate">{user.name || 'Unnamed User'}</h3>
                      <p className="text-xs text-muted m-0 truncate">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-muted m-0 mt-1">{user.phone}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-input p-2 rounded">
                        <div className="text-muted">Listings</div>
                        <div className="font-semibold">{user.listingsCount || 0}</div>
                      </div>
                      <div className="bg-input p-2 rounded">
                        <div className="text-muted">Reports</div>
                        <div className="font-semibold">{user.reportsCount || 0}</div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-1 mb-3">
                      {user.is_admin && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full font-bold">
                          ADMIN
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        user.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        className={`text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                          user.is_active
                            ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <span>{user.is_active ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => handleToggleAdminStatus(user.id, user.is_admin)}
                        className={`text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                          user.is_admin
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <span>{user.is_admin ? 'Remove Admin' : 'Make Admin'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'site-settings' ? (
          <SiteSettingsTab />
        ) : activeTab === 'wishes' ? (
          <WishesManagementTab cities={cities} />
        ) : activeTab === 'tasks' ? (
          <TasksManagementTab />
        ) : activeTab === 'reports' ? (
          <ReportsManagementTab />
        ) : activeTab === 'broadcast' ? (
          <BroadcastTab />
        ) : activeTab === 'chat-history' ? (
          <ChatHistoryTab />
        ) : activeTab === 'all-chats' ? (
          <AllChatsTab />
        ) : activeTab === 'footer-pages' ? (
          <FooterPagesTab />
        ) : null}
      </div>

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg m-0 mb-4">Add Admin Note</h3>
            <textarea
              value={commentModal.comment}
              onChange={(e) => setCommentModal(commentModal ? { ...commentModal, comment: e.target.value } : null)}
              placeholder="Enter reason (e.g., Suspicious pricing, Fake listing, etc.)"
              className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => commentModal && handleAddAdminComment(commentModal.listingId, commentModal.comment, 'hide')}
                className="btn-primary flex-1 py-2"
                disabled={!commentModal.comment.trim()}
              >
                Hide with Note
              </button>
              <button
                onClick={() => commentModal && handleAddAdminComment(commentModal.listingId, commentModal.comment, 'delete')}
                className="btn-outline flex-1 py-2 border-red-500 text-red-500 hover:bg-red-50"
                disabled={!commentModal.comment.trim()}
              >
                Delete with Note
              </button>
            </div>
            <button
              onClick={() => setCommentModal(null)}
              className="w-full mt-2 py-2 text-muted hover:text-body"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg m-0 mb-4">Edit Listing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5 text-muted">Title</label>
                <input
                  type="text"
                  value={editModal.title}
                  onChange={(e) => setEditModal(editModal ? { ...editModal, title: e.target.value } : null)}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Listing title"
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 text-muted">Description</label>
                <textarea
                  value={editModal.description}
                  onChange={(e) => setEditModal(editModal ? { ...editModal, description: e.target.value } : null)}
                  placeholder="Listing description"
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm mb-1.5 text-muted">Price (₹)</label>
                <input
                  type="number"
                  value={editModal.price}
                  onChange={(e) => setEditModal(editModal ? { ...editModal, price: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditListing}
                className="btn-primary flex-1 py-2"
                disabled={!editModal.title.trim() || !editModal.description.trim()}
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditModal(null)}
                className="btn-outline flex-1 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}