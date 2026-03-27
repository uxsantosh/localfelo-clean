import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ImageCarousel } from '../components/ImageCarousel';
import { ReportModal } from '../components/ReportModal';
import { TaskCompletionModal } from '../components/TaskCompletionModal';
import { RatingModal } from '../components/RatingModal';
import { ChatChoiceModal } from '../components/ChatChoiceModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { ContactChoiceModal } from '../components/ContactChoiceModal';
import { LocalFeloLoader } from '../components/LocalFeloLoader';
import { 
  MapPin, 
  IndianRupee, 
  Clock, 
  ExternalLink, 
  CheckCircle, 
  Flag, 
  User,
  MessageCircle,
  Edit3,
  Trash2,
  Check,
  ThumbsUp,
  Navigation,
  XCircle
} from 'lucide-react';
import { getTaskCategories } from '../services/categories';
import { 
  getTaskById, 
  acceptTask, 
  cancelTask, 
  deleteTask, 
  confirmTaskCompletion,
  updateTaskStatus,
} from '../services/tasks';
import { getOrCreateConversation } from '../services/chat';
import { getCurrentUserSync } from '../services/auth';
import { submitTaskWishReport } from '../services/reports';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner@2.0.3';
import { getProfileById } from '../services/profile';
import { Task } from '../types';
import { submitRating, hasUserRated } from '../services/ratings';

interface TaskDetailScreenProps {
  taskId: string;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
  isAdmin?: boolean;
  userDisplayName?: string;
  showGlobalLocation?: boolean;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onLocationClick?: () => void;
  onMenuClick?: () => void;
  unreadCount?: number;
  notificationCount?: number;
  onNotificationClick?: () => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
}

export function TaskDetailScreen({ taskId, onNavigate, onBack, isLoggedIn, onLoginRequired, isAdmin, userDisplayName, showGlobalLocation, globalLocationArea, globalLocationCity, onLocationClick, onMenuClick, unreadCount, notificationCount, onNotificationClick, userCoordinates }: TaskDetailScreenProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showChatChoiceModal, setShowChatChoiceModal] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [taskOwnerProfileExists, setTaskOwnerProfileExists] = useState<boolean>(true);
  const [profileCheckLoading, setProfileCheckLoading] = useState<boolean>(true);
  const currentUser = getCurrentUserSync();
  const [currentUserUUID, setCurrentUserUUID] = useState<string | null>(null);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showContactChoiceModal, setShowContactChoiceModal] = useState(false);

  // ==================== RESOLVE USER UUID ====================
  useEffect(() => {
    const resolveUserUUID = async () => {
      if (!currentUser?.id) {
        setCurrentUserUUID(null);
        return;
      }

      // If user ID is token-based, get the real UUID
      if (currentUser.id.startsWith('token_')) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('client_token', currentUser.clientToken)
            .single();
          
          if (profile) {
            console.log('🔑 [TaskDetail] Resolved token user to UUID:', profile.id);
            setCurrentUserUUID(profile.id);
          } else {
            console.warn('⚠️ [TaskDetail] Could not resolve token user to UUID');
            setCurrentUserUUID(null);
          }
        } catch (error) {
          console.error('❌ [TaskDetail] Error resolving user UUID:', error);
          setCurrentUserUUID(null);
        }
      } else {
        // Already a UUID
        console.log('🔑 [TaskDetail] User already has UUID:', currentUser.id);
        setCurrentUserUUID(currentUser.id);
      }
    };

    resolveUserUUID();
  }, [currentUser?.id, currentUser?.clientToken]);

  // ==================== LOAD TASK DATA ====================
  const loadTaskData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [TaskDetail] Loading task data...');
      
      const [taskData, categoriesData] = await Promise.all([
        getTaskById(
          taskId,
          userCoordinates?.latitude,
          userCoordinates?.longitude
        ),
        getTaskCategories()
      ]);
      
      console.log('✅ [TaskDetail] Task loaded:', {
        id: taskData.id,
        status: taskData.status,
        userId: taskData.userId,
        acceptedBy: taskData.acceptedBy,
        helperId: taskData.helperId,
        images: taskData.images, // ✅ ADD: Log images to verify they're loaded
        imageCount: taskData.images?.length || 0,
        // ❌ REMOVED: Fields don't exist in database
        // helperCompleted: taskData.helperCompleted,
        // creatorCompleted: taskData.creatorCompleted,
        currentUserId: currentUser?.id
      });
      
      setTask(taskData);
      setCategories(categoriesData);
      
      // Check if task owner profile exists
      if (taskData) {
        const ownerId = taskData.userId;
        if (!ownerId) {
          setTaskOwnerProfileExists(false);
        } else {
          try {
            const profile = await getProfileById(ownerId);
            setTaskOwnerProfileExists(!!profile);
          } catch (error) {
            console.error('❌ Error checking task owner profile:', error);
            setTaskOwnerProfileExists(false);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load task:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
      setProfileCheckLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadTaskData();
    }
  }, [taskId]);

  // ==================== ACTION HANDLERS ====================
  
  // HELPER: Negotiate (open chat before accepting)
  const handleNegotiate = async () => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    if (!task) return;

    try {
      const { conversation } = await getOrCreateConversation(
        task.id,
        task.title,
        undefined, // No image for tasks
        task.price, // Task budget
        task.userId, // Creator's ID
        task.userName, // Creator's name
        task.userAvatar, // Creator's avatar
        'task'
      );

      if (conversation) {
        onNavigate('chat', { conversationId: conversation.id });
      }
    } catch (error) {
      console.error('Negotiate error:', error);
      toast.error('Failed to start conversation');
    }
  };

  // HELPER: Accept task
  const handleAccept = async () => {
    if (!isLoggedIn || !currentUser?.id) {
      onLoginRequired?.();
      return;
    }
    if (!task) return;

    try {
      const updatedTask = await acceptTask(task.id, currentUser.id);
      setTask(updatedTask);
      toast.success('Task accepted! Start chatting with the creator.');
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('Failed to accept task');
    }
  };

  // BOTH: Open chat (creator with helper, helper with creator)
  const handleOpenChat = async () => {
    if (!task || !currentUser?.id) return;

    try {
      const otherUserId = currentUser.id === task.userId ? task.acceptedBy : task.userId;
      
      if (!otherUserId) {
        toast.error('Unable to open chat');
        return;
      }

      // Determine other user's name and avatar
      const isCreator = currentUser.id === task.userId;
      const otherUserName = isCreator ? task.helperName : task.userName;
      const otherUserAvatar = isCreator ? task.helperAvatar : task.userAvatar;

      const { conversation } = await getOrCreateConversation(
        task.id,
        task.title,
        undefined, // No image for tasks
        task.price, // Task budget
        otherUserId, // Other user's ID
        otherUserName || 'User', // Other user's name
        otherUserAvatar, // Other user's avatar
        'task'
      );

      if (conversation) {
        onNavigate('chat', { conversationId: conversation.id });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to open chat');
    }
  };

  // NEW: Show chat choice modal (for helpers)
  const handleChatClick = () => {
    if (!task || !currentUser?.id) return;
    
    // Helper is accepted and contacting creator
    const isCreator = currentUser.id === task.userId;
    
    // Only show modal for helpers contacting creators
    if (!isCreator) {
      setShowChatChoiceModal(true);
    } else {
      // Creator chatting with helper - directly open chat
      handleOpenChat();
    }
  };

  // NEW: Open WhatsApp with prefilled message
  const handleWhatsApp = () => {
    if (!task || !currentUser) return;
    
    setShowChatChoiceModal(false);
    
    // Get creator's registered number from their profile (which is their WhatsApp number)
    const creatorPhone = task.userPhone;
    
    if (!creatorPhone) {
      toast.error('Task creator phone number not available');
      return;
    }
    
    // Remove any non-digit characters from phone number
    const cleanPhone = creatorPhone.replace(/\D/g, '');
    
    // Format: +91 for India
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    // Pre-filled message
    const helperName = currentUser.name || userDisplayName || 'a helper';
    const message = encodeURIComponent(
      `Hi, I am ${helperName} and I'm interested in your task: "${task.title}"`
    );
    
    // WhatsApp deep link (works on mobile and web)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  // NEW: Continue with in-app chat
  const handleInAppChat = () => {
    setShowChatChoiceModal(false);
    handleOpenChat();
  };

  // HELPER: Cancel task (return to open)
  const handleHelperCancel = async () => {
    if (!task) return;

    try {
      const result = await cancelTask(task.id, currentUser?.id);
      if (result.success) {
        const freshTask = await getTaskById(task.id);
        if (freshTask) {
          setTask(freshTask);
        }
        toast.success('You have cancelled this task.');
      } else {
        toast.error(result.error || 'Failed to cancel');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel');
    }
  };

  // CREATOR: Delete task (only when open)
  const handleCreatorDelete = async () => {
    if (!task) return;

    try {
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
      onBack();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete task');
    }
  };

  // NEW: WhatsApp handler for open tasks (helpers before accepting)
  const handleContactWhatsApp = () => {
    if (!task || !currentUser) return;
    
    setShowContactChoiceModal(false);
    
    const creatorPhone = task.userPhone;
    
    if (!creatorPhone) {
      toast.error('Task creator phone number not available');
      return;
    }
    
    const cleanPhone = creatorPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    const helperName = currentUser.name || userDisplayName || 'a helper';
    const message = encodeURIComponent(
      `Hi, I am ${helperName} and I'm interested in your task: \"${task.title}\"`
    );
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  // NEW: In-app chat handler for open tasks (helpers before accepting)
  const handleContactInAppChat = () => {
    setShowContactChoiceModal(false);
    handleNegotiate(); // Use existing negotiate function
  };

  // BOTH: Complete task (dual confirmation)
  const handleComplete = () => {
    if (!task) return;
    setShowCompletionModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!task || !currentUser?.id) return;

    try {
      setCompletionLoading(true);
      
      const isCreator = currentUserUUID === task.userId;
      const updatedTask = await confirmTaskCompletion(task.id, currentUser.id, isCreator);
      
      setTask(updatedTask);
      setShowCompletionModal(false);
      
      if (updatedTask.status === 'completed') {
        toast.success('Task completed!');
        
        // Check if user needs to rate the other party
        const otherUserId = isCreator ? updatedTask.acceptedBy : updatedTask.userId;
        const ratingType = isCreator ? 'helper' : 'task_owner';
        
        if (otherUserId && currentUserUUID) {
          const alreadyRated = await hasUserRated(
            updatedTask.id,
            otherUserId,
            currentUserUUID,
            ratingType
          );
          
          if (!alreadyRated) {
            // Show rating modal
            setRatingModalOpen(true);
          }
        }
      } else {
        toast.success('Completion confirmed. Waiting for other party.');
      }
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Failed to confirm completion');
    } finally {
      setCompletionLoading(false);
    }
  };

  // HELPER: Navigate to task location
  const handleNavigate = async () => {
    if (!task) return;
    
    if (task.latitude && task.longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`;
      window.open(mapsUrl, '_blank');
      toast.success('Opening navigation!');
    } else {
      const searchQuery = encodeURIComponent(`${task.areaName}, ${task.cityName}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
      window.open(mapsUrl, '_blank');
      toast.info('Navigating to area location');
    }
    
    // Update to in_progress if accepted
    if (task.status === 'accepted') {
      try {
        const updatedTask = await updateTaskStatus(task.id, 'in_progress');
        setTask(updatedTask);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  // Open in Google Maps (for everyone to see location)
  const openInMaps = () => {
    if (!task) return;
    if (task.latitude && task.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}`;
      window.open(url, '_blank');
    } else {
      const query = encodeURIComponent(`${task.address || ''} ${task.areaName} ${task.cityName}`.trim());
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank');
    }
  };

  // Report issue
  const handleReport = async (issueType: string, details: string) => {
    if (!task || !currentUser?.id) return;
    
    const isCreator = currentUserUUID === task.userId;
    const reportedUserId = isCreator ? task.acceptedBy : task.userId;
    const reportedUserName = isCreator ? (task.helperName || 'Helper') : task.userName;
    
    if (!reportedUserId) return;
    
    await submitTaskWishReport({
      itemType: 'task',
      itemId: task.id,
      reporterId: currentUser.id,
      reportedUserId: reportedUserId,
      issueType,
      details,
    });
  };

  // Rate task
  const handleRateTask = async (rating: number, comment: string) => {
    if (!task || !currentUserUUID) return;
    
    const isCreator = currentUserUUID === task.userId;
    const ratedUserId = isCreator ? task.acceptedBy : task.userId;
    const ratingType: 'helper' | 'task_owner' = isCreator ? 'helper' : 'task_owner';
    
    if (!ratedUserId) {
      toast.error('Unable to submit rating');
      return;
    }

    try {
      await submitRating(
        task.id,
        ratedUserId,
        currentUserUUID,
        ratingType,
        rating,
        comment
      );
      
      toast.success('Rating submitted successfully!');
      setRatingModalOpen(false);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Open' },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Accepted' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Closed' },
    };

    const badge = badges[status] || badges.open;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getTimeWindowText = (timeWindow: string) => {
    const labels: Record<string, string> = {
      asap: 'ASAP',
      today: 'Today',
      tomorrow: 'Tomorrow',
      this_week: 'This Week',
      flexible: 'Flexible',
    };
    return labels[timeWindow] || timeWindow;
  };

  const getTimeWindowColor = (timeWindow: string) => {
    const colors: Record<string, string> = {
      asap: 'bg-red-100 text-red-700',
      today: 'bg-orange-100 text-orange-700',
      tomorrow: 'bg-blue-100 text-blue-700',
      this_week: 'bg-green-100 text-green-700',
      flexible: 'bg-gray-100 text-gray-700',
    };
    return colors[timeWindow] || 'bg-gray-100 text-gray-700';
  };

  // ==================== LOADING STATE ====================
  if (loading || !task) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Task Details"
          currentScreen="tasks"
          showBack 
          onBack={onBack} 
          onNavigate={onNavigate}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          userDisplayName={userDisplayName}
          showGlobalLocation={showGlobalLocation}
          globalLocationArea={globalLocationArea}
          globalLocationCity={globalLocationCity}
          onLocationClick={onLocationClick}
          onMenuClick={onMenuClick}
          unreadCount={unreadCount}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
        />
        <div className="page-container py-8">
          <LocalFeloLoader size="lg" text="Loading task..." />
        </div>
      </div>
    );
  }

  // ==================== ROLE DETERMINATION ====================
  // USE THE RESOLVED UUID FOR COMPARISONS!
  const isCreator = currentUserUUID === task.userId;
  const isHelper = currentUserUUID === task.acceptedBy;
  const isInvolved = isCreator || isHelper;

  // Status checks
  const isOpen = task.status === 'open';
  const isAccepted = task.status === 'accepted';
  const isInProgress = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';
  const isClosed = task.status === 'closed';

  // ==================== DETERMINE BUTTON SET ====================
  let buttonSet: 'creator-open' | 'creator-accepted' | 'helper-open' | 'helper-accepted' | 'completed' | 'unavailable' | 'login-required' | null = null;

  if (isCompleted || isClosed) {
    buttonSet = 'completed'; // Read-only
  } else if (!isLoggedIn) {
    // Show login button for open tasks
    if (task?.status === 'open') {
      buttonSet = 'login-required'; // Login to Accept
    } else {
      buttonSet = null; // No buttons for closed/accepted tasks
    }
  } else if (isCreator) {
    // CREATOR FLOW
    if (isOpen) {
      buttonSet = 'creator-open'; // Edit + Delete
    } else if (isAccepted || isInProgress) {
      buttonSet = 'creator-accepted'; // Chat + Complete
    }
  } else if (isHelper) {
    // HELPER FLOW (user who accepted the task)
    if (isAccepted || isInProgress) {
      buttonSet = 'helper-accepted'; // Chat + Navigate + Complete + Cancel
    }
  } else {
    // OTHER USERS (not creator, not helper)
    if (isOpen) {
      buttonSet = 'helper-open'; // Negotiate + Accept
    } else if (isAccepted || isInProgress) {
      buttonSet = 'unavailable'; // Task taken by someone else
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Task Details"
        currentScreen="tasks"
        showBack 
        onBack={onBack} 
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        showGlobalLocation={showGlobalLocation}
        globalLocationArea={globalLocationArea}
        globalLocationCity={globalLocationCity}
        onLocationClick={onLocationClick}
        onMenuClick={onMenuClick}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
      />

      {/* Main Content - Add extra padding at bottom for fixed buttons */}
      <div className="page-container px-3 sm:px-4 md:px-6 lg:px-8 pb-32 sm:pb-24">
        <div className="space-y-4 py-4">
          {/* Image Carousel - NEW */}
          <ImageCarousel
            images={task.images || []}
            categoryEmoji={task.categoryEmoji || '📋'}
            title={task.title}
          />

          {/* Title & Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-heading flex-1">{task.title}</h1>
              {getStatusBadge(task.status)}
            </div>

            {/* Price & Time Window */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-[#CDFF00] rounded-lg">
                <IndianRupee className="w-5 h-5 text-black" />
                <span className="font-bold text-lg text-black">{task.price?.toLocaleString('en-IN') || '0'}</span>
              </div>
              {task.timeWindow && (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${getTimeWindowColor(task.timeWindow)}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{getTimeWindowText(task.timeWindow)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted">Location</h3>
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                {task.address ? (
                  <>
                    <p className="font-medium text-heading whitespace-pre-wrap">{task.address}</p>
                    {(task.areaName || task.cityName) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {[task.areaName, task.cityName].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-medium text-heading">
                    {[task.areaName, task.cityName].filter(Boolean).join(', ') || 'Location not specified'}
                  </p>
                )}
              </div>
            </div>
            {task.latitude && task.longitude && (
              <button
                onClick={openInMaps}
                className="w-full px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </button>
            )}
          </div>

          {/* Acceptance Alert (for creator when task is accepted) */}
          {isAccepted && isCreator && task.helperName && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-1">
                    {task.helperName} accepted your task!
                  </p>
                  <p className="text-sm text-green-800">
                    Chat with them to confirm details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unavailable Alert (for other users when task is taken) */}
          {buttonSet === 'unavailable' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 mb-1">
                    This task has been accepted
                  </p>
                  <p className="text-sm text-yellow-800">
                    Someone is already working on this task.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ❌ REMOVED: Completion Status UI - Used non-existent database fields
               The dual completion system (helper_completed/creator_completed) is not 
               implemented in the database. Completion is now immediate when either party
               clicks "Complete". */}

          {/* Report Button (only for involved parties) */}
          {isInvolved && isLoggedIn && (isAccepted || isInProgress) && (
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Report Issue
            </button>
          )}

          {/* Posted By */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-2 text-muted">Posted by</h3>
            <div className="flex items-center gap-3">
              {task.userAvatar ? (
                <img src={task.userAvatar} alt={task.userName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">{task.userName?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-heading">{task.userName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(task.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Helper Info (if assigned) */}
          {(isAccepted || isInProgress) && task.helperName && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-2 text-muted">Accepted by</h3>
              <div className="flex items-center gap-3">
                {task.helperAvatar ? (
                  <img src={task.helperAvatar} alt={task.helperName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-heading">{task.helperName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== FIXED BOTTOM ACTION BUTTONS ==================== */}
      {/* Using z-50 to ensure it's above bottom nav (z-40) */}
      
      {/* 1. CREATOR - OPEN: Edit + Delete */}
      {buttonSet === 'creator-open' && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => onNavigate('create-task', { editMode: true, taskId: task.id, task: task })}
              className="flex-1 px-6 py-4 bg-primary text-black rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <Edit3 className="w-5 h-5 text-black" />
              Edit
            </button>
            <button
              onClick={handleCreatorDelete}
              className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* 2. CREATOR - ACCEPTED/IN_PROGRESS: Chat + Complete */}
      {buttonSet === 'creator-accepted' && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={handleOpenChat}
              className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with Helper
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <Check className="w-5 h-5" />
              Complete
            </button>
          </div>
        </div>
      )}

      {/* 3. HELPER - OPEN: Chat + Accept */}
      {buttonSet === 'helper-open' && taskOwnerProfileExists && !profileCheckLoading && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => setShowContactChoiceModal(true)}
              className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-black rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
            <button
              onClick={() => setShowAcceptConfirm(true)}
              className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <ThumbsUp className="w-5 h-5" />
              Accept
            </button>
          </div>
        </div>
      )}

      {/* 4. HELPER - ACCEPTED: Chat + Navigate + Complete + Cancel */}
      {buttonSet === 'helper-accepted' && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50">
          <div className="max-w-4xl mx-auto">
            {/* Mobile: 2 rows */}
            <div className="flex sm:hidden flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleChatClick}
                  className="flex-1 px-4 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </button>
                <button
                  onClick={handleNavigate}
                  className="flex-1 px-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Navigate
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleComplete}
                  className="flex-1 px-4 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Complete
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>

            {/* Desktop: Single row */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleChatClick}
                className="flex-1 px-5 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat
              </button>
              <button
                onClick={handleNavigate}
                className="px-5 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Navigate
              </button>
              <button
                onClick={handleComplete}
                className="px-5 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Complete
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. LOGIN REQUIRED: Login to Accept (for non-logged-in users viewing open tasks) */}
      {buttonSet === 'login-required' && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={onLoginRequired}
              className="w-full px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors text-base"
            >
              Login to Accept
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
          itemType="task"
          itemTitle={task.title}
        />
      )}

      {showCompletionModal && (
        <TaskCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onConfirm={handleConfirmComplete}
          loading={completionLoading}
          isCreator={isCreator}
          taskTitle={task.title}
        />
      )}

      {ratingModalOpen && task && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          onSubmit={handleRateTask}
          targetUserName={isCreator ? (task.helperName || 'Helper') : task.userName}
          ratingType={isCreator ? 'helper' : 'task_owner'}
          taskTitle={task.title}
        />
      )}

      {showChatChoiceModal && (
        <ChatChoiceModal
          isOpen={showChatChoiceModal}
          onClose={() => setShowChatChoiceModal(false)}
          onWhatsApp={handleWhatsApp}
          onInAppChat={handleInAppChat}
          taskCreatorName={task.userName}
          helperName={currentUser?.name || userDisplayName || 'Helper'}
        />
      )}

      {/* Contact Choice Modal (for helpers before accepting) */}
      {showContactChoiceModal && (
        <ContactChoiceModal
          isOpen={showContactChoiceModal}
          onClose={() => setShowContactChoiceModal(false)}
          onWhatsApp={handleContactWhatsApp}
          onInAppChat={handleContactInAppChat}
          contactPersonName={task.userName}
          itemType="task"
        />
      )}

      {/* Confirmation Modals */}
      {showAcceptConfirm && (
        <ConfirmModal
          isOpen={showAcceptConfirm}
          onClose={() => setShowAcceptConfirm(false)}
          onConfirm={handleAccept}
          title="Accept Task"
          message="Accept this task? The person who posted it will be notified and you'll be able to chat with them."
          confirmText="Accept Task"
          cancelText="Cancel"
          confirmButtonClass="bg-black text-white hover:bg-gray-800"
          icon="info"
        />
      )}

      {showCancelConfirm && (
        <ConfirmModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleHelperCancel}
          title="Cancel Task"
          message="Are you sure you want to cancel? The task will become available for others again."
          confirmText="Yes, Cancel Task"
          cancelText="No, Keep It"
          confirmButtonClass="bg-red-500 text-white hover:bg-red-600"
          icon="warning"
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleCreatorDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete Task"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 text-white hover:bg-red-600"
          icon="danger"
        />
      )}
    </div>
  );
}