import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User as UserIcon, LogOut, Package, Heart, Briefcase, Edit2, Trash2, XCircle, RotateCcw, Share2, Settings, Star, Camera } from 'lucide-react';
import { Header } from '../components/Header';
import { User, Listing } from '../types';
import { getMyListings, deleteListing } from '../services/listings';
import { getUserWishes, deleteWish } from '../services/wishes';
import { getUserTasks, deleteTask, cancelTask } from '../services/tasks';
import { EditProfileModal } from '../components/EditProfileModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { getUserRatings, UserRatings } from '../services/ratings';
import { UserAvatar } from '../components/UserAvatar';

interface ProfileScreenProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onListingClick: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  unreadCount?: number;
}

type TabType = 'listings' | 'wishes' | 'tasks';

export function ProfileScreen({
  user,
  onLogin,
  onLogout,
  onListingClick,
  onEditListing,
  onNavigate,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount = 0,
}: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [ratings, setRatings] = useState<UserRatings>({
    helper_rating_avg: 0,
    helper_rating_count: 0,
    task_owner_rating_avg: 0,
    task_owner_rating_count: 0,
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, activeTab]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // For token-based users, get the real UUID first
      let userId = user.id;
      
      // Check if user.id is a token string (not a UUID)
      if (user.id && user.id.startsWith('token_')) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('client_token', user.clientToken)
            .single();
          
          if (profileError || !profile) {
            console.error('❌ [ProfileScreen] Failed to get user UUID:', profileError);
            toast.error('Failed to load profile data');
            setLoading(false);
            return;
          }
          
          userId = profile.id;
        } catch (err) {
          console.error('❌ [ProfileScreen] Error fetching UUID:', err);
          toast.error('Failed to load profile data');
          setLoading(false);
          return;
        }
      }
      
      if (activeTab === 'listings') {
        const userListings = await getMyListings(user.clientToken);
        setListings(userListings);
      } else if (activeTab === 'wishes') {
        const userWishes = await getUserWishes(userId);
        setWishes(userWishes);
      } else if (activeTab === 'tasks') {
        const userTasks = await getUserTasks(userId);
        setTasks(userTasks);
      }

      // Fetch user ratings
      const userRatings = await getUserRatings(userId);
      setRatings(userRatings);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Listing Actions
  const handleEditListing = (listing: Listing) => {
    onEditListing(listing);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    
    try {
      await deleteListing(listingId, user.clientToken);
      toast.success('Listing deleted successfully');
      loadUserData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handleReactivateListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_active: true, status: 'active' })
        .eq('id', listingId);

      if (error) throw error;
      toast.success('Listing reactivated');
      loadUserData();
    } catch (error) {
      console.error('Error reactivating listing:', error);
      toast.error('Failed to reactivate listing');
    }
  };

  // Wish Actions
  const handleEditWish = (wish: any) => {
    onNavigate('create-wish', { editMode: true, wish });
  };

  const handleDeleteWish = async (wishId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this wish?')) return;
    
    try {
      await deleteWish(wishId);
      toast.success('Wish deleted successfully');
      loadUserData();
    } catch (error) {
      console.error('Error deleting wish:', error);
      toast.error('Failed to delete wish');
    }
  };

  const handleCancelWish = async (wishId: string) => {
    if (!window.confirm('Cancel this wish?')) return;
    
    try {
      const { error } = await supabase
        .from('wishes')
        .update({ status: 'cancelled' })
        .eq('id', wishId);

      if (error) throw error;
      toast.success('Wish cancelled');
      loadUserData();
    } catch (error) {
      console.error('Error cancelling wish:', error);
      toast.error('Failed to cancel wish');
    }
  };

  const handleRestoreWish = async (wishId: string) => {
    try {
      const { error } = await supabase
        .from('wishes')
        .update({ status: 'active' })
        .eq('id', wishId);

      if (error) throw error;
      toast.success('Wish restored');
      loadUserData();
    } catch (error) {
      console.error('Error restoring wish:', error);
      toast.error('Failed to restore wish');
    }
  };

  // Task Actions
  const handleEditTask = (task: any) => {
    onNavigate('create-task', { editMode: true, task });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;
    
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
      loadUserData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleCancelTask = async (taskId: string) => {
    if (!user) return;
    if (!window.confirm('Cancel this task? This will reset it to open status and notify the helper.')) return;
    
    try {
      // Get the user's actual UUID (not the token-based ID)
      let userId = user.id;
      if (user.id && user.id.startsWith('token_')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('client_token', user.clientToken)
          .single();
        
        if (profile) {
          userId = profile.id;
        }
      }
      
      const result = await cancelTask(taskId, userId);
      if (result.success) {
        toast.success('Task cancelled successfully');
        loadUserData();
      } else {
        toast.error(result.error || 'Failed to cancel task');
      }
    } catch (error) {
      console.error('Error cancelling task:', error);
      toast.error('Failed to cancel task');
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'open' })
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task restored to open');
      loadUserData();
    } catch (error) {
      console.error('Error restoring task:', error);
      toast.error('Failed to restore task');
    }
  };

  // Simplified: If no user, login modal will be triggered by App.tsx navigation guard
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">
      <Header
        title="Profile"
        currentScreen="profile"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
      />

      <div className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
        {/* Profile Header */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Profile Picture with Edit Icon */}
            <div className="relative flex-shrink-0">
              <UserAvatar 
                name={user.name}
                avatarUrl={user.avatar_url || user.profilePic}
                size="xl"
              />
              <button
                onClick={() => setShowEditProfile(true)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-md"
                title="Edit avatar"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold truncate text-gray-900">{user.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.phone || user.email}</p>
              
              {/* Ratings - Owner sees both */}
              <div className="flex gap-4 mt-2">
                {/* As Task Creator */}
                {ratings.task_owner_rating_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#CDFF00] text-[#CDFF00]" />
                    <span className="text-xs font-semibold text-gray-900">
                      {ratings.task_owner_rating_avg.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({ratings.task_owner_rating_count} as creator)
                    </span>
                  </div>
                )}
                {ratings.task_owner_rating_count === 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-gray-300" />
                    <span className="text-xs text-gray-400">No creator ratings</span>
                  </div>
                )}
                
                {/* As Helper */}
                {ratings.helper_rating_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#CDFF00] text-[#CDFF00]" />
                    <span className="text-xs font-semibold text-gray-900">
                      {ratings.helper_rating_avg.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({ratings.helper_rating_count} as helper)
                    </span>
                  </div>
                )}
                {ratings.helper_rating_count === 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-gray-300" />
                    <span className="text-xs text-gray-400">No helper ratings</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout & Share Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditProfile(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Profile"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  // Share profile functionality can be added later
                  toast.success('Profile link copied!');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share profile"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 p-1 mb-4 flex gap-1">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'listings'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Listings</span>
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'wishes'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishes</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Tasks</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="text-gray-600 mt-2 text-sm">Loading...</p>
            </div>
          ) : (
            <>
              {/* ========== LISTINGS TAB ========== */}
              {activeTab === 'listings' && (
                <>
                  {listings.length === 0 ? (
                    <EmptyState 
                      type="no-listings" 
                      message="You haven't posted any listings yet" 
                    />
                  ) : (
                    <div className="space-y-3">
                      {listings.map((listing) => {
                        const isCancelled = listing.status === 'cancelled';
                        
                        return (
                          <div
                            key={listing.id}
                            className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow ${
                              isCancelled ? 'opacity-60' : ''
                            }`}
                          >
                            {/* Main Content - Clickable */}
                            <div className="flex gap-3 cursor-pointer" onClick={() => onListingClick(listing)}>
                              {/* Image */}
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {listing.images && listing.images.length > 0 ? (
                                  <img
                                    src={listing.images[0]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    {listing.categoryEmoji || '📦'}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">
                                    {listing.title}
                                  </h3>
                                  {isCancelled && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full whitespace-nowrap">
                                      CANCELLED
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">
                                  {listing.description || 'No description'}
                                </p>
                                <p className="font-bold text-sm sm:text-base text-black mb-2">
                                  ₹{(listing.price || 0).toLocaleString('en-IN')}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                  📍 {[listing.areaName, listing.cityName].filter(Boolean).join(' ') || 'Location not set'}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                              {!isCancelled ? (
                                <>
                                  <button
                                    onClick={() => handleEditListing(listing)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-white" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteListing(listing.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleReactivateListing(listing.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reactivate</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteListing(listing.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Permanently</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ========== WISHES TAB ========== */}
              {activeTab === 'wishes' && (
                <>
                  {wishes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No wishes yet</p>
                      <button
                        onClick={() => onNavigate('create-wish')}
                        className="bg-black text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Create Your First Wish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishes.map((wish) => {
                        const isCancelled = wish.status === 'cancelled';
                        
                        return (
                          <div
                            key={wish.id}
                            className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow ${
                              isCancelled ? 'opacity-60' : ''
                            }`}
                          >
                            {/* Main Content - Clickable */}
                            <div 
                              className="cursor-pointer"
                              onClick={() => onNavigate('wish-detail', { wishId: wish.id })}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <Heart className="w-4 h-4 text-primary fill-primary shrink-0 mt-1" />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">
                                      {wish.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                      {wish.description || 'No description'}
                                    </p>
                                  </div>
                                </div>
                                {isCancelled && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full whitespace-nowrap">
                                    CANCELLED
                                  </span>
                                )}
                              </div>

                              {(wish.budgetMin || wish.budgetMax) && (
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                                  Budget: ₹{wish.budgetMin?.toLocaleString('en-IN') || '0'} - ₹{wish.budgetMax?.toLocaleString('en-IN') || '0'}
                                </p>
                              )}

                              <p className="text-[10px] sm:text-xs text-gray-500 mb-3">
                                📍 {wish.areaName}, {wish.cityName}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                              {!isCancelled ? (
                                <>
                                  <button
                                    onClick={() => handleEditWish(wish)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-white" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWish(wish.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRestoreWish(wish.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Restore</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWish(wish.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Permanently</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ========== TASKS TAB ========== */}
              {activeTab === 'tasks' && (
                <>
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No tasks yet</p>
                      <button
                        onClick={() => onNavigate('create-task')}
                        className="bg-black text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Create Your First Task
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => {
                        const isCancelled = task.status === 'closed';
                        const isOpen = task.status === 'open';
                        const isAccepted = task.status === 'accepted';
                        const isInProgress = task.status === 'in_progress';
                        const isCompleted = task.status === 'completed';
                        
                        return (
                          <div
                            key={task.id}
                            className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow ${
                              isCancelled ? 'opacity-60' : ''
                            }`}
                          >
                            {/* Main Content - Clickable */}
                            <div 
                              className="cursor-pointer"
                              onClick={() => onNavigate('task-detail', { taskId: task.id })}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <Briefcase className="w-4 h-4 text-primary shrink-0 mt-1" />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">
                                      {task.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                      {task.description || 'No description'}
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                  task.status === 'open' ? 'bg-[#CDFF00] text-black' :
                                  task.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                  task.status === 'in_progress' ? 'bg-[#CDFF00]/60 text-black' :
                                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {task.status === 'open' ? 'OPEN' :
                                   task.status === 'accepted' ? 'ACCEPTED' :
                                   task.status === 'in_progress' ? 'IN PROGRESS' :
                                   task.status === 'completed' ? 'COMPLETED' :
                                   task.status.toUpperCase()}
                                </span>
                              </div>

                              {task.price && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded mb-2" style={{ backgroundColor: '#CDFF00' }}>
                                  <span className="text-xs font-bold text-black">Earn ₹{task.price.toLocaleString('en-IN')}</span>
                                </div>
                              )}

                              <p className="text-[10px] sm:text-xs text-gray-500 mb-3">
                                📍 {task.areaName}, {task.cityName}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                              {/* Open tasks: Edit + Delete */}
                              {isOpen && (
                                <>
                                  <button
                                    onClick={() => handleEditTask(task)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-white" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                              
                              {/* Accepted/In Progress tasks: Cancel button only */}
                              {(isAccepted || isInProgress) && (
                                <button
                                  onClick={() => handleCancelTask(task.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Cancel Task</span>
                                </button>
                              )}
                              
                              {/* Completed tasks: View only message */}
                              {isCompleted && (
                                <div className="flex-1 text-center py-2 text-xs text-green-600 font-medium">
                                  ✓ Task completed
                                </div>
                              )}
                              
                              {/* Closed/Cancelled tasks: Restore + Delete */}
                              {isCancelled && (
                                <>
                                  <button
                                    onClick={() => handleRestoreTask(task.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Restore</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Permanently</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          currentName={user.name}
          currentAvatar={user.avatar_url || user.profilePic}
          currentGender={user.gender}
          user={user}
          onSuccess={() => {
            setShowEditProfile(false);
            toast.success('Profile updated successfully!');
            // Reload user data if needed
            loadUserData();
          }}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            setShowChangePassword(false);
            toast.success('Password changed successfully!');
          }}
        />
      )}
    </div>
  );
}