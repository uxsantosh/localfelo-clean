// =====================================================
// Admin Tasks Management Tab
// =====================================================

import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Users, Clock, CheckCircle, XCircle, RefreshCw, Briefcase } from 'lucide-react';
import { Task, TaskNegotiation } from '../../types';
import { getAllTasksAdmin, closeTaskAdmin, getTaskNegotiations } from '../../services/tasks';
import { toast } from 'sonner';
import { formatDistanceToNow } from '../../utils/dateFormatter';

export function TasksManagementTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [negotiations, setNegotiations] = useState<TaskNegotiation[]>([]);
  const [loadingNegotiations, setLoadingNegotiations] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      loadNegotiations(selectedTask.id);
    }
  }, [selectedTask]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getAllTasksAdmin();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadNegotiations = async (taskId: string) => {
    setLoadingNegotiations(true);
    try {
      const data = await getTaskNegotiations(taskId);
      setNegotiations(data);
    } catch (error) {
      console.error('Failed to load negotiations:', error);
    } finally {
      setLoadingNegotiations(false);
    }
  };

  const handleCloseTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to close this task? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await closeTaskAdmin(taskId);
      if (result.success) {
        toast.success('Task closed successfully');
        loadTasks();
        setSelectedTask(null);
      } else {
        toast.error(result.error || 'Failed to close task');
      }
    } catch (error) {
      console.error('Failed to close task:', error);
      toast.error('Something went wrong');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group tasks by status
  const tasksByStatus = {
    open: filteredTasks.filter(t => t.status === 'open').length,
    accepted: filteredTasks.filter(t => t.status === 'accepted').length,
    in_progress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    closed: filteredTasks.filter(t => t.status === 'closed').length,
  };

  const statusLabels: Record<string, string> = {
    open: 'Open',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    closed: 'Closed',
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-[4px] p-3">
          <p className="text-sm text-green-600">Open Tasks</p>
          <p className="text-2xl font-medium text-green-600">{tasksByStatus.open}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-[4px] p-3">
          <p className="text-sm text-blue-600">Accepted</p>
          <p className="text-2xl font-medium text-blue-600">{tasksByStatus.accepted}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-[4px] p-3">
          <p className="text-sm text-purple-600">In Progress</p>
          <p className="text-2xl font-medium text-purple-600">{tasksByStatus.in_progress}</p>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-[4px] p-3">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-medium text-gray-600">{tasksByStatus.completed}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-[4px] p-3">
          <p className="text-sm text-red-600">Closed</p>
          <p className="text-2xl font-medium text-red-600">{tasksByStatus.closed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-[4px] text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-[4px] text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={loadTasks}
          className="btn-primary px-4 py-2 rounded-[4px] flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted">
        {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
      </p>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-8 text-sm text-muted">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No tasks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-card border border-border rounded-[4px] p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{task.categoryEmoji}</span>
                    <h3 className="font-medium">{task.title}</h3>
                  </div>
                  <p className="text-sm text-muted mb-2">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-[4px]">
                      ₹{task.price?.toLocaleString() || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 rounded-[4px] ${
                      task.status === 'open' ? 'bg-green-500/10 text-green-600' :
                      task.status === 'accepted' ? 'bg-blue-500/10 text-blue-600' :
                      task.status === 'in_progress' ? 'bg-purple-500/10 text-purple-600' :
                      task.status === 'completed' ? 'bg-gray-500/10 text-gray-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {statusLabels[task.status]}
                    </span>
                    {task.isNegotiable && (
                      <span className="px-2 py-1 bg-[#CDFF00]/20 text-black rounded-[4px] font-medium">
                        Negotiable
                      </span>
                    )}
                    {task.timeWindow && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-[4px]">
                        {task.timeWindow}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-muted mb-3">
                <div className="flex items-center gap-4">
                  <span>{task.userName}</span>
                  <span>•</span>
                  <span>{task.areaName}, {task.cityName}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                </div>
                {task.userRatingCount && task.userRatingCount > 0 && (
                  <span>⭐ {task.userRating?.toFixed(1)} ({task.userRatingCount})</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-[4px] hover:bg-primary/10 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  {selectedTask?.id === task.id ? 'Hide Details' : 'View Details'}
                </button>
                {task.status !== 'closed' && (
                  <button
                    onClick={() => handleCloseTask(task.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/5 text-red-600 rounded-[4px] hover:bg-red-500/10 transition-colors text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Close Task
                  </button>
                )}
              </div>

              {/* Negotiations Details */}
              {selectedTask?.id === task.id && (
                <div className="mt-3 pt-3 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Negotiation History</h4>
                  {loadingNegotiations ? (
                    <p className="text-sm text-muted">Loading negotiations...</p>
                  ) : negotiations.length === 0 ? (
                    <p className="text-sm text-muted">No negotiations yet</p>
                  ) : (
                    <div className="space-y-2">
                      {negotiations.map(neg => (
                        <div key={neg.id} className="p-3 bg-background border border-border rounded-[4px]">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{neg.helperName || 'Unknown User'}</p>
                            {neg.offeredPrice && (
                              <p className="text-sm font-medium text-primary">₹{neg.offeredPrice.toLocaleString()}</p>
                            )}
                          </div>
                          {neg.message && (
                            <p className="text-xs text-muted mb-1">{neg.message}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted">
                            {neg.round && <span>Round {neg.round}</span>}
                            {neg.round && <span>•</span>}
                            <span>{formatDistanceToNow(neg.createdAt)}</span>
                            <span>•</span>
                            <span className={
                              neg.status === 'accepted' ? 'text-primary' :
                              neg.status === 'rejected' ? 'text-destructive' :
                              neg.status === 'countered' ? 'text-amber-600' :
                              'text-muted'
                            }>
                              {neg.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}