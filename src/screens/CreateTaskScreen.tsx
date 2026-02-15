// =====================================================
// Create Task Screen - SIMPLIFIED & CHAT-FIRST
// Compact flow: Task → Price → Time → Submit
// =====================================================

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { LocationSelector } from '../components/LocationSelector';
import { DateTimeSelector, dateTimeSelectorToTimeWindow, timeWindowToDateTimeSelector } from '../components/DateTimeSelector';
import { CategorySelector } from '../components/CategorySelector';
import { createTask, editTask } from '../services/tasks';
import { createTaskChatThread } from '../services/chat';
import { getCurrentUser } from '../services/auth';
import { City, Task } from '../types';
import { getTaskCategories, Category } from '../services/categories';
import { useLocation, UserLocation } from '../hooks/useLocation';
import { fireConfetti } from '../utils/confetti';

// Helper function to sanitize location IDs (convert invalid IDs to null)
const sanitizeLocationId = (id: string | null | undefined): string | null => {
  // If empty or undefined, return null
  if (!id || id === 'auto-detected' || id === 'undefined' || id === 'null') {
    return null;
  }
  
  // Check if it's a valid UUID format (8-4-4-4-12 characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    // Not a valid UUID, return null instead of invalid string
    return null;
  }
  
  return id;
};

interface CreateTaskScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  unreadCount: number;
  cities: City[];
  editMode?: boolean;
  taskId?: string;
  task?: Task;
}

export function CreateTaskScreen({
  onBack,
  onSuccess,
  onNavigate,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount,
  cities,
  editMode,
  taskId,
  task,
}: CreateTaskScreenProps) {
  const user = getCurrentUser();
  const { location: globalLocation, updateLocation } = useLocation(user?.id || null);
  
  const [loading, setLoading] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [budget, setBudget] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [dateTimeValue, setDateTimeValue] = useState<{
    option: 'anytime' | 'today' | 'custom';
    customDate?: string;
    time?: string;
    timeOption?: 'anytime' | 'specific';
  }>({ option: 'anytime' });
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [userAddress, setUserAddress] = useState(''); // User's specific address input
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Initialize form with task data when in edit mode
  useEffect(() => {
    if (editMode && task) {
      setTaskText(task.description || '');
      setBudget(task.price?.toString() || '');
      setIsNegotiable(task.isNegotiable || false);
      setUserAddress(task.address || '');
      setDateTimeValue(timeWindowToDateTimeSelector(task.timeWindow));
      setSelectedCategory(task.categoryId?.toString() || '');
      
      // Initialize location from task data if available
      if (task.latitude && task.longitude && (!globalLocation?.latitude || !globalLocation?.longitude)) {
        const locationData: UserLocation = {
          cityId: null,
          city: task.city || '',
          areaId: task.area || task.city,
          area: task.area || task.city,
          latitude: task.latitude,
          longitude: task.longitude,
          address: task.address || '',
          locality: task.area,
          state: '',
          pincode: '',
        };
        updateLocation(locationData);
        console.log('📍 [CreateTaskScreen] Initialized location from task data:', locationData);
      }
    }
  }, [editMode, task]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getTaskCategories();
      setCategories(cats);
      // Set default category if none selected
      if (!selectedCategory && cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
    };

    fetchCategories();
  }, []);

  // AI Price Suggestion
  const getSuggestedPrice = () => {
    const text = taskText.toLowerCase();
    if (text.includes('plumber') || text.includes('electrician')) return '500';
    if (text.includes('carpenter') || text.includes('painting')) return '1000';
    if (text.includes('cleaning') || text.includes('maid')) return '300';
    if (text.includes('tutor') || text.includes('teaching')) return '400';
    if (text.includes('repair')) return '600';
    if (text.includes('delivery')) return '200';
    return '';
  };

  const applySuggestedPrice = () => {
    const suggested = getSuggestedPrice();
    if (suggested) {
      setBudget(suggested);
      toast.success('✨ Price suggested based on service type!');
    } else {
      toast.info('No price suggestion available for this service');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!taskText.trim()) {
      toast.error('Please describe your task');
      return;
    }

    if (!globalLocation || !globalLocation.latitude || !globalLocation.longitude) {
      toast.error('Please set your location first');
      return;
    }

    if (!userAddress.trim()) {
      toast.error('Please enter your full address');
      return;
    }

    if (!user) {
      toast.error('Please login to post a task');
      return;
    }

    setLoading(true);

    try {
      const lines = taskText.trim().split('\n');
      const title = lines[0].slice(0, 50);
      const description = lines.length > 1 ? lines.slice(1).join('\n').trim() : taskText.trim();

      const taskLatitude = globalLocation.latitude;
      const taskLongitude = globalLocation.longitude;

      if (editMode && taskId) {
        const result = await editTask(taskId, {
          title,
          description,
          price: parseFloat(budget),
          isNegotiable,
          timeWindow: dateTimeSelectorToTimeWindow(dateTimeValue),
          latitude: taskLatitude,
          longitude: taskLongitude,
          address: userAddress.trim(),
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to update task');
        }

        toast.success('✅ Task updated successfully!');
        onSuccess();
      } else {
        const result = await createTask({
          title,
          description,
          categoryId: parseInt(selectedCategory, 10) || 309,
          cityId: sanitizeLocationId(globalLocation.cityId),
          areaId: sanitizeLocationId(globalLocation.areaId),
          cityName: globalLocation.city,
          areaName: globalLocation.area || globalLocation.city,
          price: parseFloat(budget),
          isNegotiable,
          timeWindow: dateTimeSelectorToTimeWindow(dateTimeValue),
          latitude: taskLatitude,
          longitude: taskLongitude,
          address: userAddress.trim(),
          phone: '',
          whatsapp: '',
          hasWhatsapp: false,
        }, user.id);

        if (!result.success || !result.taskId) {
          throw new Error(result.error || 'Failed to create task');
        }

        const chatResult = await createTaskChatThread(
          result.taskId,
          title,
          user.id,
          user.name || 'User'
        );

        if (chatResult.error) {
          console.warn('Failed to create chat thread:', chatResult.error);
        }

        toast.success('🎉 Task posted! Chat is ready for offers.');
        fireConfetti();
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">
      <Header 
        title={editMode ? "Edit Task" : "Post a Task"}
        currentScreen="create"
        showBack={true}
        onBack={onBack}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        showGlobalLocation={true}
        globalLocationArea={globalLocation?.area}
        globalLocationCity={globalLocation?.city}
        onLocationClick={() => setShowLocationSelector(true)}
      />

      {showLocationSelector && (
        <LocationSelector
          onLocationSelect={async (location) => {
            const locationData: UserLocation = {
              cityId: null,
              city: location.city,
              areaId: location.locality || location.city,
              area: location.locality || location.city,
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              locality: location.locality,
              state: location.state,
              pincode: location.pincode,
            };
            await updateLocation(locationData);
            setShowLocationSelector(false);
            toast.success('Location updated! 📍');
          }}
          onClose={() => setShowLocationSelector(false)}
          currentLocation={globalLocation && globalLocation.latitude ? {
            latitude: globalLocation.latitude,
            longitude: globalLocation.longitude,
            city: globalLocation.city,
          } : null}
        />
      )}

      <div className="page-container max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Description */}
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-sm mb-2 text-muted">
              <Briefcase className="w-4 h-4 inline mr-1 text-primary" />
              What service do you need?
            </label>
            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="E.g., Need a plumber to fix leaking tap in kitchen..."
              className="w-full p-3 border border-border rounded-[6px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={5}
              disabled={loading}
            />
          </div>

          {/* When do you need it */}
          <DateTimeSelector
            value={dateTimeValue}
            onChange={setDateTimeValue}
            disabled={loading}
          />

          {/* Budget */}
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-muted">Budget (₹)</label>
              {taskText.length > 10 && !budget && (
                <button
                  type="button"
                  onClick={applySuggestedPrice}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  ✨ Suggest budget
                </button>
              )}
            </div>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 border border-border rounded-[6px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              min="0"
              step="10"
              disabled={loading}
            />
            
            {/* Negotiable Toggle */}
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
              <span className="text-sm text-muted">Budget is negotiable</span>
            </label>
          </div>

          {/* Location */}
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-sm mb-2 text-muted">
              <MapPin className="w-4 h-4 inline mr-1 text-primary" />
              Location <span className="text-red-500">*</span>
            </label>
            
            {/* Global Location Display (Read-Only, Clickable) */}
            {globalLocation && globalLocation.latitude && globalLocation.longitude ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(true)}
                  className="w-full p-4 bg-white border-2 border-gray-200 hover:border-[#CDFF00] transition-colors text-left flex items-start justify-between gap-3"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-[#CDFF00] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[15px] text-black" style={{ fontWeight: '700' }}>
                        {globalLocation.area}, {globalLocation.city}
                      </p>
                    </div>
                    {globalLocation.address && (
                      <p className="text-[13px] text-gray-600 truncate" style={{ fontWeight: '500' }}>
                        {globalLocation.address}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
                  Tap to change your location
                </p>

                {/* Full Address Input */}
                <div>
                  <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="Building name, floor, street details...&#10;&#10;E.g., Flat #101, Green Apartment, Main Road&#10;Near City Hospital"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#CDFF00] transition-colors resize-none"
                    style={{ 
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '500',
                      minHeight: '120px'
                    }}
                    rows={5}
                    disabled={loading}
                  />
                  <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
                    Add specific details to help service providers find you
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border-2 border-red-200" style={{ borderRadius: '8px' }}>
                <p className="text-[14px] text-red-600 mb-3" style={{ fontWeight: '700' }}>
                  ⚠️ Location Not Set
                </p>
                <p className="text-[13px] text-red-600 mb-3" style={{ fontWeight: '500' }}>
                  Please set your location from the header first.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(true)}
                  className="w-full py-2.5 px-4 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors"
                  style={{ 
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}
                >
                  Set Location Now
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-200 p-4">
            <label className="block text-sm mb-3 text-muted">Category <span className="text-red-500">*</span></label>
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !taskText.trim() || !budget}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading 
              ? (editMode ? 'Updating...' : 'Posting...') 
              : (editMode ? 'Update Task' : 'Post Task & Start Chat')}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="btn-outline w-full py-3"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}