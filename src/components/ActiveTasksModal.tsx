import { useState, useEffect } from 'react';
import { X, Briefcase, IndianRupee, MapPin, User, ChevronRight } from 'lucide-react';
import { getUserActiveTasks } from '../services/tasks';
import { formatDistanceToNow } from 'date-fns';

interface ActiveTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onTaskClick: (taskId: string) => void;
}

interface ActiveTask {
  id: string;
  title: string;
  price: number;
  status: string;
  userId: string;
  acceptedBy: string | null;
  createdAt: string;
  cityName?: string;
  areaName?: string;
}

export function ActiveTasksModal({ isOpen, onClose, userId, onTaskClick }: ActiveTasksModalProps) {
  const [tasks, setTasks] = useState<ActiveTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadActiveTasks();
    }
  }, [isOpen, userId]);

  const loadActiveTasks = async () => {
    try {
      setLoading(true);
      const data = await getUserActiveTasks(userId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load active tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    onTaskClick(taskId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-[#CDFF00] rounded-full p-2">
              <Briefcase className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Active Tasks</h2>
              <p className="text-xs text-gray-500">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-center">No active tasks</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => {
                const isCreator = task.userId === userId;
                const role = isCreator ? 'Creator' : 'Helper';
                const roleColor = isCreator ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';

                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Task Icon */}
                      <div className="bg-gray-100 rounded-lg p-2.5 mt-1 flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-gray-600" />
                      </div>

                      {/* Task Details */}
                      <div className="flex-1 min-w-0">
                        {/* Title and Role Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-black line-clamp-2 group-hover:text-gray-700 transition-colors">
                            {task.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${roleColor}`}>
                            {role}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1 font-bold text-black">
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>₹{task.price}</span>
                          </div>
                          {(task.cityName || task.areaName) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{task.areaName || task.cityName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {/* Time */}
                        <p className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-center text-gray-500">
            Tap on any task to view details and chat
          </p>
        </div>
      </div>
    </div>
  );
}
