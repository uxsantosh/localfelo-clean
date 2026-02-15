import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Header } from '../components/Header';
import { MapView } from '../components/MapView';
import { Modal } from '../components/Modal';
import { CommitmentModal } from '../components/CommitmentModal';
import { ReportModal } from '../components/ReportModal';
import { TaskCompletionModal } from '../components/TaskCompletionModal';
import { MapPin, MessageCircle, Briefcase, Clock, IndianRupee, ExternalLink, Check, AlertCircle, ThumbsUp, MessageSquare, XCircle, Navigation, Trash2, Edit3, Phone, Flag } from 'lucide-react';
import { getTaskById, acceptTask, deleteTask, cancelTask, completeTask, startTask, confirmTaskCompletion, undoTaskCompletion } from '../services/tasks';
import { getCurrentUser } from '../services/auth';
import { getOrCreateConversation } from '../services/chat';
import { submitTaskWishReport } from '../services/reports';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { getTaskCategories } from '../services/categories';
import { formatUserName } from '../utils/formatUserName';
import { toast } from 'sonner';
import { getProfileById } from '../services/profile';

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
  const [showMap, setShowMap] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [taskOwnerProfileExists, setTaskOwnerProfileExists] = useState<boolean>(true);
  const [profileCheckLoading, setProfileCheckLoading] = useState<boolean>(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [taskData, categoriesData] = await Promise.all([
          getTaskById(
            taskId,
            userCoordinates?.latitude,
            userCoordinates?.longitude
          ),
          getTaskCategories()
        ]);
        setTask(taskData);
        setCategories(categoriesData);
        
        // Check if task owner profile exists
        if (taskData) {
          const ownerId = taskData.userId || taskData.owner_token;
          if (!ownerId) {
            // Task has no owner ID - this is fine for anonymous tasks
            setTaskOwnerProfileExists(false);
          } else {
            try {
              const profile = await getProfileById(ownerId);
              if (profile) {
                setTaskOwnerProfileExists(true);
              } else {
                // Profile not found - user may have been deleted or task is anonymous
                setTaskOwnerProfileExists(false);
              }
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

    loadData();
  }, [taskId, userCoordinates]);

  const handleOpenChat = async () => {
    if (!isLoggedIn) {
      if (onLoginRequired) onLoginRequired();
      return;
    }

    if (!task) return;

    try {
      const { conversation, error } = await getOrCreateConversation(
        task.id, // ✅ FIX: Use plain UUID (not prefixed)
        task.title,
        undefined,
        task.price || task.budgetMax || task.budgetMin,
        task.userId,
        task.userName, // ✅ FIX: Pass task creator's name
        task.userAvatar,  // ✅ FIX: Pass task creator's avatar
        'task' // ✅ NEW: Pass listing type
      );

      if (error || !conversation) {
        // Show user-friendly error message
        if (error && error.includes('cannot chat with yourself')) {
          toast.error('You cannot chat about your own task.');
        } else if (error && error.includes('profile could not be found')) {
          toast.error('This task is no longer available for chat. The user may have deleted their account.');
        } else {
          toast.error(error || 'Failed to open chat');
        }
        return;
      }

      console.log('✅ [TaskDetail] Conversation ready:', conversation.id);
      
      // Wait 100ms for React state update before navigating
      // ChatScreen will handle the conversation selection with its own retry logic
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ [TaskDetail] Navigating to chat with conversationId:', conversation.id);
      onNavigate('chat', { conversationId: conversation.id });
    } catch (err) {
      console.error('Failed to create conversation:', err);
      toast.error('Failed to open chat');
    }
  };

  const handleAccept = async () => {
    if (!isLoggedIn) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    if (!task) return;

    try {
      // Accept task (returns Task object, not result object)
      const updatedTask = await acceptTask(task.id, currentUser?.id || '');
      
      setTask(updatedTask);
      
      toast.success('Task accepted!');

      // Clear the banner dismissal so it shows again for new active task
      sessionStorage.removeItem('activeTaskBannerDismissed');

      // Navigate to chat after accepting
      handleOpenChat();
    } catch (error) {
      toast.error('Failed to accept task');
    }
  };

  const handleNegotiate = async () => {
    if (!isLoggedIn) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    await handleOpenChat();
    toast.info('Start negotiating in the chat!');
  };

  // Helper cancels (withdraws from task) - Task goes back to open
  const handleHelperCancel = async () => {
    if (!task) return;
    
    if (!confirm('Are you sure you want to cancel? The task will become available for others again.')) {
      return;
    }

    try {
      await cancelTask(task.id, currentUser?.id); // Pass current user ID

      // Reload task to show updated status
      const freshTask = await getTaskById(task.id);
      if (freshTask) {
        setTask(freshTask);
      }

      toast.success('You have cancelled this task. It is now available for others.');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel');
    }
  };

  // Creator cancels - Task goes back to open
  const handleCreatorCancel = async () => {
    if (!task) return;
    
    if (!confirm('Are you sure you want to cancel the accepted deal? The task will go back to open status.')) {
      return;
    }

    try {
      await cancelTask(task.id, currentUser?.id); // Pass current user ID

      // Reload task to show updated status
      const freshTask = await getTaskById(task.id);
      if (freshTask) {
        setTask(freshTask);
      }

      toast.success('Task cancelled. It is now open for others to accept.');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel');
    }
  };

  // Creator deletes task permanently
  const handleCreatorDelete = async () => {
    if (!task) return;
    
    if (!confirm('Are you sure you want to permanently delete this task? This cannot be undone.')) {
      return;
    }

    try {
      await deleteTask(task.id);

      toast.success('Task deleted successfully');
      onBack(); // Navigate back after deletion
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete task');
    }
  };

  // Mark task as complete (both creator and helper)
  const handleComplete = () => {
    if (!task || !currentUser?.id) return;
    setShowCompletionModal(true);
  };

  // Handle completion confirmation from modal
  const handleConfirmCompletion = async () => {
    if (!task || !currentUser?.id) return;
    
    const currentUserCompleted = isCreator ? task.creatorCompleted : task.helperCompleted;
    
    setCompletionLoading(true);
    try {
      if (currentUserCompleted) {
        // Undo completion
        const result = await undoTaskCompletion(task.id, currentUser.id, isCreator);
        if (result.success) {
          // Refresh task data
          const freshTask = await getTaskById(task.id);
          if (freshTask) {
            setTask(freshTask);
          }
          toast.success('Completion undone');
        } else {
          toast.error(result.error || 'Failed to undo completion');
        }
      } else {
        // Confirm completion
        const updatedTask = await confirmTaskCompletion(task.id, currentUser.id, isCreator);
        setTask(updatedTask);

        // Check if task is now fully completed (both parties confirmed)
        if (updatedTask.status === 'completed') {
          toast.success('🎉 Task completed! Both parties confirmed.');
        } else {
          toast.success('✅ Completion confirmed! Waiting for other party.');
        }
      }
      setShowCompletionModal(false);
    } catch (error) {
      console.error('Complete error:', error);
      toast.error('Failed to process completion');
    } finally {
      setCompletionLoading(false);
    }
  };

  // Undo task completion (both creator and helper)
  const handleUndoCompletion = async () => {
    if (!task || !currentUser?.id) return;
    
    if (!confirm('Undo task completion?')) {
      return;
    }

    try {
      const updatedTask = await undoTaskCompletion(task.id, currentUser.id, isCreator);
      
      setTask(updatedTask);

      // Check if task is now fully completed (both parties confirmed)
      if (updatedTask.status === 'completed') {
        toast.success('Task completed! Both parties confirmed.');
      } else {
        toast.success('Completion confirmed! Waiting for other party.');
      }
    } catch (error) {
      console.error('Complete error:', error);
      toast.error('Failed to confirm completion');
    }
  };

  // Handler to show commitment modal and start task
  const handleStartTask = () => {
    setShowCommitmentModal(true);
  };

  // Handler when user confirms in commitment modal
  const handleConfirmStart = async () => {
    if (!task) return;
    
    try {
      const updatedTask = await startTask(task.id);
      setTask(updatedTask);
      setShowCommitmentModal(false);
      toast.success('Task started! Navigate to location.');
    } catch (error) {
      console.error('Start task error:', error);
      toast.error('Failed to start task');
    }
  };

  // Handler for submitting report
  const handleSubmitReport = async (issueType: string, details: string) => {
    if (!task || !currentUser?.id) return;
    
    // Determine who to report (if helper, report creator; if creator, report helper)
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

  const handleNavigate = async () => {
    if (!task) return;
    
    console.log('Navigate clicked. Task location:', {
      latitude: task.latitude,
      longitude: task.longitude,
      exactLocation: task.exactLocation,
      cityName: task.cityName,
      areaName: task.areaName
    });
    
    // Try GPS coordinates first
    if (task.latitude && task.longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`;
      window.open(mapsUrl, '_blank');
      toast.success('Opening navigation to exact task location!');
    } else {
      // Fallback: Navigate to area using search query
      const searchQuery = encodeURIComponent(`${task.areaName}, ${task.cityName}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
      window.open(mapsUrl, '_blank');
      toast.info('GPS not available - Navigating to area location');
    }
    
    // Update task status to 'in_progress'
    try {
      const { updateTaskStatus } = await import('../services/tasks');
      const updatedTask = await updateTaskStatus(task.id, 'in_progress');
      
      setTask(updatedTask);
    } catch (error) {
      // Don't block navigation if status update fails
      console.error('Status update error:', error);
    }
  };

  const openInMaps = () => {
    if (!task?.latitude || !task?.longitude) {
      toast.error('Location not available');
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-3 py-1.5 bg-green-100 text-black rounded-full text-xs font-medium flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>Open</span>;
      case 'negotiating':
        return <span className="px-3 py-1.5 bg-blue-100 text-black rounded-full text-xs font-medium flex items-center gap-1"><MessageSquare className="w-3 h-3" />Negotiating</span>;
      case 'accepted':
        return <span className="px-3 py-1.5 bg-purple-100 text-black rounded-full text-xs font-medium flex items-center gap-1"><ThumbsUp className="w-3 h-3" />Accepted</span>;
      case 'in_progress':
        return <span className="px-3 py-1.5 bg-[#CDFF00] text-black rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3 animate-pulse" />In Progress</span>;
      case 'completed':
        return <span className="px-3 py-1.5 bg-green-100 text-black rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" />Completed</span>;
      case 'closed':
        return <span className="px-3 py-1.5 bg-gray-100 text-black rounded-full text-xs font-medium">Closed</span>;
      default:
        return <span className="px-3 py-1.5 bg-green-100 text-black rounded-full text-xs font-medium flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>Open</span>;
    }
  };

  const getTimeWindowText = (timeWindow?: string) => {
    if (!timeWindow) return 'Not specified';
    switch (timeWindow) {
      case 'asap': return 'ASAP';
      case 'today': return 'Today';
      case 'tomorrow': return 'Tomorrow';
      default: return timeWindow;
    }
  };

  const getTimeWindowColor = (timeWindow?: string) => {
    if (!timeWindow) return 'bg-gray-100 text-gray-700';
    switch (timeWindow) {
      case 'asap': return 'bg-red-100 text-red-700';
      case 'today': return 'bg-[#CDFF00] text-black';
      case 'tomorrow': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isCreator = currentUser?.id === task?.userId;
  const isAcceptor = currentUser?.id === task?.acceptedBy;
  const isInvolved = isCreator || isAcceptor;
  const isOpen = task?.status === 'open';
  const isNegotiating = task?.status === 'negotiating';
  const isAccepted = task?.status === 'accepted';
  const isInProgress = task?.status === 'in_progress';
  const isCompleted = task?.status === 'completed';

  // Debug logging
  console.log('🔍 TaskDetailScreen Debug:', {
    currentUserId: currentUser?.id,
    taskUserId: task?.userId,
    taskAcceptedBy: task?.acceptedBy,
    isCreator,
    isAcceptor,
    isOpen,
    taskStatus: task?.status,
    isLoggedIn,
    shouldShowButtons: isLoggedIn && !isCreator && isOpen && !isAcceptor
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Task Details" 
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
        <div className="page-container py-4">
          <SkeletonLoader count={1} />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Task Details" 
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
        <div className="page-container py-8 text-center">
          <p className="text-muted">Task not found</p>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.slug === task.categoryName?.toLowerCase()) || categories[6];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* ✅ FIX: Make header sticky */}
      <div className="sticky top-0 z-40">
        <Header 
          title="Task Details" 
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
      </div>

      <div className="page-container py-4 space-y-4">
        {/* Status & Category */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.emoji}</span>
            <span className="text-sm text-muted">{category.name}</span>
          </div>
          {/* Only show non-open status if user is involved, otherwise always show "open" */}
          {(isInvolved && isLoggedIn) ? getStatusBadge(task.status) : getStatusBadge('open')}
        </div>

        {/* Title */}
        <h1 className="text-heading text-2xl">{task.title}</h1>

        {/* Price & Time Window */}
        <div className="flex items-center gap-3 flex-wrap">
          {task.price !== undefined && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ backgroundColor: '#CDFF00' }}>
              <IndianRupee className="w-6 h-6 text-black" />
              <div className="flex flex-col">
                <span className="text-xs text-black font-medium">You'll Earn</span>
                <span className="text-xl font-extrabold text-black">₹{task.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${getTimeWindowColor(task.timeWindow)}`}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{getTimeWindowText(task.timeWindow)}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded border border-border p-4">
          <h3 className="text-sm font-semibold mb-2 text-muted">Task details</h3>
          <p className="text-body whitespace-pre-wrap">{task.description}</p>
        </div>

        {/* Map View Toggle */}
        {task.latitude && task.longitude && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowMap(false)}
              className={`px-4 py-2 rounded-[4px] transition-colors ${
                !showMap
                  ? 'bg-black text-white'
                  : 'bg-white border border-border text-foreground hover:border-primary'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setShowMap(true)}
              className={`px-4 py-2 rounded-[4px] transition-colors ${
                showMap
                  ? 'bg-black text-white'
                  : 'bg-white border border-border text-foreground hover:border-primary'
              }`}
            >
              Map View
            </button>
          </div>
        )}

        {/* Location - Details or Map */}
        {!showMap ? (
          <div className="bg-white rounded border border-border p-4">
            <h3 className="text-sm font-semibold mb-2 text-muted">Location</h3>
            <div className="flex items-start gap-2 text-body">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{task.areaName}</p>
                <p className="text-sm text-muted">{task.cityName}</p>
                {task.distance !== undefined && task.distance !== null && (
                  <p className="font-extrabold mt-2" style={{ backgroundColor: '#CDFF00', color: '#000000', fontSize: '14px', display: 'inline-block', padding: '4px 8px', borderRadius: '6px' }}>
                    ~{task.distance.toFixed(1)} km away
                  </p>
                )}
                
                {/* Full Address */}
                {task.address && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200" style={{ borderRadius: '8px' }}>
                    <p className="text-[12px] text-gray-500 mb-1" style={{ fontWeight: '600' }}>Full Address</p>
                    <p className="text-[14px] text-black whitespace-pre-wrap" style={{ fontWeight: '500' }}>
                      {task.address}
                    </p>
                  </div>
                )}
                
                {/* Google Maps Navigation Button - Always show if coordinates exist */}
                {task.latitude && task.longitude && (
                  <button
                    onClick={openInMaps}
                    className="mt-2 flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Google Maps
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '400px' }}>
            <MapView
              markers={[{
                id: task.id,
                latitude: task.latitude!,
                longitude: task.longitude!,
                title: task.title,
                price: task.price,
                type: 'task' as const,
                categoryEmoji: category?.emoji,
                status: task.status,
              }]}
              onMarkerClick={() => {}}
              centerLat={task.latitude}
              centerLng={task.longitude}
            />
          </div>
        )}

        {/* Deal Summary */}
        {isAccepted && isInvolved && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Deal Accepted</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Final price:</span>
                <span className="font-semibold text-primary">₹{(task.price || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Status:</span>
                <span className="font-medium text-green-700">{task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Accepted'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ACCEPTED STATE: Commitment Banner (Helper only) */}
        {isAccepted && isAcceptor && !isCreator && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">
                  Task accepted. Please confirm before starting.
                </p>
                <p className="text-sm text-blue-800">
                  Make sure you've discussed all terms in chat before proceeding.
                </p>
                <p className="text-xs text-blue-700 mt-2 italic">
                  LocalFelo connects users. Payments and work are handled directly between users.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* OPEN STATE: Platform Disclaimer (For non-creators viewing open task) */}
        {isOpen && !isCreator && isLoggedIn && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-700">
              💡 <strong>LocalFelo is a connector platform.</strong> Payments and work are handled directly between users. Discuss all terms before accepting.
            </p>
          </div>
        )}

        {/* IN_PROGRESS STATE: Helper Protection Notice (Helper only) */}
        {isInProgress && isAcceptor && !isCreator && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-900">
              ⚠️ <strong>Payment is handled directly between users.</strong> Confirm payment before leaving the location.
            </p>
          </div>
        )}

        {/* COMPLETION CONFIRMATION STATUS - Show for both parties */}
        {isInProgress && isInvolved && (task.helperCompleted || task.creatorCompleted) && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                {isCreator ? (
                  // Creator view
                  task.creatorCompleted ? (
                    <div>
                      <p className="font-semibold text-green-900 mb-1">
                        ✓ Confirmed by you
                      </p>
                      <p className="text-sm text-green-800">
                        {task.helperCompleted ? 'Task completed! Both parties confirmed.' : 'Waiting for helper confirmation...'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-green-900 mb-1">
                        ✓ Helper has confirmed completion
                      </p>
                      <p className="text-sm text-green-800">
                        Please confirm to complete the task
                      </p>
                    </div>
                  )
                ) : (
                  // Helper view
                  task.helperCompleted ? (
                    <div>
                      <p className="font-semibold text-green-900 mb-1">
                        ✓ Confirmed by you
                      </p>
                      <p className="text-sm text-green-800">
                        {task.creatorCompleted ? 'Task completed! Both parties confirmed.' : 'Waiting for creator confirmation...'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-green-900 mb-1">
                        ✓ Creator has confirmed completion
                      </p>
                      <p className="text-sm text-green-800">
                        Please confirm to complete the task
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Button - Show for involved users only */}
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
        <div className="bg-white rounded border border-border p-4">
          <h3 className="text-sm font-semibold mb-2 text-muted">Posted by</h3>
          <div className="flex items-center gap-3">
            {task.userAvatar ? (
              <img src={task.userAvatar} alt={formatUserName(task.userName)} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">{formatUserName(task.userName).charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-heading">{formatUserName(task.userName)}</p>
              <p className="text-sm text-muted">Posted by a local user near you</p>
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
      </div>

      {/* ========== BUTTONS FOR HELPERS (non-creators) ========== */}
      
      {/* Helper: Open task - Show Negotiate + Accept OR Login prompt */}
      {!isCreator && isOpen && taskOwnerProfileExists && !profileCheckLoading && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-3 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleNegotiate}
                  className="flex-1 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-white border-2 border-black text-black rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Negotiate</span>
                  <span className="xs:hidden">Chat</span>
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-black text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                >
                  <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  Accept
                </button>
              </>
            ) : (
              <button
                onClick={() => onLoginRequired?.()}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3.5 bg-black text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Login to Accept
              </button>
            )}
          </div>
        </div>
      )}

      {/* Helper/Acceptor: ACCEPTED - Show Confirm & Start + Chat + Cancel */}
      {isAcceptor && !isCreator && isAccepted && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-3 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto">
            {/* Mobile: Single row with 3 buttons */}
            <div className="flex sm:hidden gap-2">
              <button
                onClick={handleStartTask}
                className="flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                style={{ backgroundColor: '#CDFF00', color: '#000000' }}
              >
                <Check className="w-4 h-4" />
                <span className="hidden xs:inline">Confirm & Start</span>
                <span className="xs:inline sm:hidden">Start</span>
              </button>
              
              <button
                onClick={handleOpenChat}
                className="px-3 py-2.5 bg-white border-2 border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleHelperCancel}
                className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop: Single row */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleStartTask}
                className="flex-1 px-6 py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#CDFF00', color: '#000000' }}
              >
                <Check className="w-5 h-5" />
                Confirm & Start
              </button>
              
              <button
                onClick={handleOpenChat}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat
              </button>
              
              <button
                onClick={handleHelperCancel}
                className="px-4 py-3.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper/Acceptor: IN_PROGRESS - Show Chat + Navigate + Complete + Cancel */}
      {isAcceptor && !isCreator && isInProgress && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-3 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto">
            {/* Mobile: 2 rows */}
            <div className="flex sm:hidden flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleOpenChat}
                  className="flex-1 px-3 py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  Chat
                </button>
                <button
                  onClick={handleNavigate}
                  className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-4 h-4 text-white" />
                  Navigate
                </button>
              </div>
              <div className="flex gap-2">
                {isInProgress && (
                  <button
                    onClick={handleComplete}
                    className="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4 text-white" />
                    Complete
                  </button>
                )}
                <button
                  onClick={handleHelperCancel}
                  className="flex-1 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>

            {/* Desktop: Single row */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleOpenChat}
                className="flex-1 px-6 py-3.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                Chat
              </button>
              
              <button
                onClick={handleNavigate}
                className="px-6 py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5 text-white" />
                Navigate
              </button>

              {isInProgress && (
                <button
                  onClick={handleComplete}
                  className="px-6 py-3.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 text-white" />
                  Complete
                </button>
              )}

              <button
                onClick={handleHelperCancel}
                className="px-4 py-3.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== BUTTONS FOR CREATOR ========== */}
      
      {/* Creator: Open task - Show Edit + Delete */}
      {isCreator && isOpen && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-3 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('create-task', { editMode: true, taskId: task.id, task: task })}
              className="flex-1 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-primary text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
              Edit
            </button>
            <button
              onClick={handleCreatorDelete}
              className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-red-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Creator: Accepted task - Show Chat + Cancel */}
      {isCreator && isAccepted && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-3 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleOpenChat}
              className="flex-1 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-black text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              Chat
            </button>
            
            <button
              onClick={handleCreatorCancel}
              className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-gray-100 text-gray-700 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Creator: In Progress task - Show Chat + Navigate + Complete (NO cancel/delete) */}
      {isCreator && isInProgress && (
        <div className="fixed bottom-16 md:bottom-12 left-0 right-0 bg-white border-t border-border p-3 sm:p-6 z-40 safe-bottom">
          <div className="max-w-4xl mx-auto">
            {/* Mobile: 2 rows */}
            <div className="flex sm:hidden flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleOpenChat}
                  className="flex-1 px-3 py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  Chat
                </button>
                <button
                  onClick={handleNavigate}
                  className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-4 h-4 text-white" />
                  Navigate
                </button>
              </div>
              <button
                onClick={handleComplete}
                className="w-full px-3 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4 text-white" />
                Complete
              </button>
            </div>

            {/* Desktop: Single row */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleOpenChat}
                className="flex-1 px-6 py-3.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                Chat
              </button>
              
              <button
                onClick={handleNavigate}
                className="px-6 py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5 text-white" />
                Navigate
              </button>

              <button
                onClick={handleComplete}
                className="px-6 py-3.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 text-white" />
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commitment Modal */}
      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onConfirm={handleConfirmStart}
        taskTitle={task.title}
        taskPrice={task.price}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        itemType="task"
        itemId={task.id}
        reportedUserId={isCreator ? (task.acceptedBy || '') : task.userId}
        reportedUserName={isCreator ? (task.helperName || 'Helper') : task.userName}
        onSubmit={handleSubmitReport}
      />

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleConfirmCompletion}
        taskTitle={task.title}
        isCreator={isCreator}
        otherPartyName={isCreator ? (task.helperName || 'Helper') : task.userName}
        otherPartyCompleted={isCreator ? (task.helperCompleted || false) : (task.creatorCompleted || false)}
        currentUserCompleted={isCreator ? (task.creatorCompleted || false) : (task.helperCompleted || false)}
        loading={completionLoading}
      />
    </div>
  );
}