// =====================================================
// Admin - Users Management Tab
// Manage user reliability scores and badges
// =====================================================

import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Search, X, Filter, Mail, User, MapPin, Package, MessageCircle, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { 
  updateReliabilityScore, 
  toggleVerifiedBadge, 
  toggleTrustedBadge,
  getUserActivityLogs
} from '../../services/profile';

interface EnhancedUser extends User {
  listingsCount?: number;
  tasksCount?: number;
  wishesCount?: number;
}

export function UsersManagementTab() {
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          listings:listings(count),
          tasks:tasks(count),
          wishes:wishes(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData: EnhancedUser[] = (data || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        whatsappSame: user.whatsapp_same,
        whatsappNumber: user.whatsapp_number,
        authUserId: user.auth_user_id,
        clientToken: user.client_token,
        profilePic: user.profile_pic,
        reliabilityScore: user.reliability_score || 100,
        isVerified: user.is_verified || false,
        isTrusted: user.is_trusted || false,
        totalTasksCompleted: user.total_tasks_completed || 0,
        totalWishesGranted: user.total_wishes_granted || 0,
        badgeNotes: user.badge_notes,
        listingsCount: user.listings?.[0]?.count || 0,
        tasksCount: user.tasks?.[0]?.count || 0,
        wishesCount: user.wishes?.[0]?.count || 0,
      }));

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
    );
    setFilteredUsers(filtered);
  };

  const loadUserActivity = async (userId: string) => {
    setLoadingLogs(true);
    try {
      const logs = await getUserActivityLogs(userId, 20);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleUserClick = (user: EnhancedUser) => {
    setSelectedUser(user);
    loadUserActivity(user.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="m-0">Users Management</h2>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-primary text-black rounded-[4px] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search users by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-[4px] bg-input"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {loading ? (
            <p className="text-muted text-center py-8">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted text-center py-8">No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={`w-full text-left p-3 border rounded-[4px] transition-all hover:border-primary ${
                  selectedUser?.id === user.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="m-0 text-sm">{user.name}</h4>
                      {user.isVerified && (
                        <CheckCircle className="w-3 h-3 text-blue-600" />
                      )}
                      {user.isTrusted && (
                        <Award className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted m-0">{user.email}</p>
                    <p className="text-xs text-muted m-0">{user.phone}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {user.reliabilityScore || 100}
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-muted">
                  <span>{user.listingsCount || 0} listings</span>
                  <span>{user.tasksCount || 0} tasks</span>
                  <span>{user.wishesCount || 0} wishes</span>
                </div>
              </button>
            ))
          )}
        </div>

        {selectedUser ? (
          <div className="card space-y-4 max-h-[600px] overflow-y-auto">
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary text-black rounded-full flex items-center justify-center font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="m-0">{selectedUser.name}</h3>
                    {selectedUser.isVerified && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                    {selectedUser.isTrusted && (
                      <Award className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted m-0">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-input rounded-[4px] text-center">
                  <p className="text-xs text-muted m-0">Listings</p>
                  <p className="m-0">{selectedUser.listingsCount}</p>
                </div>
                <div className="p-2 bg-input rounded-[4px] text-center">
                  <p className="text-xs text-muted m-0">Tasks</p>
                  <p className="m-0">{selectedUser.tasksCount}</p>
                </div>
                <div className="p-2 bg-input rounded-[4px] text-center">
                  <p className="text-xs text-muted m-0">Wishes</p>
                  <p className="m-0">{selectedUser.wishesCount}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="m-0 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Reliability Score
              </h4>
              <div className="p-3 bg-input rounded-[4px]">
                <span className="font-medium">
                  {selectedUser.reliabilityScore || 100}/100
                </span>
              </div>
            </div>

            <div>
              <h4 className="m-0 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Badges
              </h4>
              <div className="space-y-2">
                <div className={`p-3 rounded-[4px] flex items-center gap-2 ${
                  selectedUser.isVerified ? 'bg-blue-50 border border-blue-200' : 'bg-input'
                }`}>
                  <CheckCircle className={`w-4 h-4 ${selectedUser.isVerified ? 'text-blue-600' : 'text-muted'}`} />
                  <span className="text-sm">Verified Badge</span>
                </div>
                <div className={`p-3 rounded-[4px] flex items-center gap-2 ${
                  selectedUser.isTrusted ? 'bg-primary/10 border border-primary/30' : 'bg-input'
                }`}>
                  <Award className={`w-4 h-4 ${selectedUser.isTrusted ? 'text-primary' : 'text-muted'}`} />
                  <span className="text-sm">Trusted Badge</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="m-0 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </h4>
              {loadingLogs ? (
                <p className="text-sm text-muted">Loading...</p>
              ) : activityLogs.length === 0 ? (
                <p className="text-sm text-muted">No activity yet</p>
              ) : (
                <div className="space-y-2">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-2 bg-input rounded-[4px] text-sm">
                      <p className="m-0">{log.activityDescription}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card flex items-center justify-center h-[600px]">
            <p className="text-muted">Select a user to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}