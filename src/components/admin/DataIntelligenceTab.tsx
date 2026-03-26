import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Users, TrendingUp, Package, Heart, Briefcase, MessageSquare, 
  DollarSign, Activity, MapPin, Award, Calendar, BarChart3,
  RefreshCw, Download
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner@2.0.3';

// Color scheme matching LocalFelo brand
const COLORS = {
  primary: 'var(--primary)', // Use CSS variable instead of hardcoded
  secondary: '#000000',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

const CHART_COLORS = ['#CDFF00', '#000000', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

interface PlatformKPIs {
  total_users: number;
  active_users_24h: number;
  active_users_7d: number;
  total_tasks: number;
  completed_tasks: number;
  total_wishes: number;
  fulfilled_wishes: number;
  total_listings: number;
  active_listings: number;
  total_messages: number;
  avg_task_budget: number;
}

interface DailyStats {
  activity_date: string;
  tasks_posted?: number;
  wishes_posted?: number;
  listings_posted?: number;
  new_users?: number;
  tasks_completed?: number;
  wishes_fulfilled?: number;
  avg_budget?: number;
}

interface CategoryStats {
  category_name: string;
  category_emoji: string;
  total_tasks?: number;
  completed_tasks?: number;
  total_wishes?: number;
  fulfilled_wishes?: number;
  total_listings?: number;
  active_listings?: number;
  avg_budget?: number;
  avg_price?: number;
  total_views?: number;
  description?: string;
  tasks_last_7d?: number;
  tasks_last_30d?: number;
  helpers_available?: number;
  priority?: number;
}

interface LocationStats {
  city_name: string;
  area_name: string;
  latitude: number;
  longitude: number;
  activity_score: number;
  task_density: number;
  wish_density: number;
  listing_density: number;
}

interface HelperStats {
  helper_name: string;
  tasks_completed: number;
  completion_rate: number;
  avg_task_value: number;
  city_name: string;
}

interface UserActivityRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tasks_posted: number;
  tasks_completed: number;
  listings_posted: number;
  last_active: string;
}

export function DataIntelligenceTab() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // KPI States
  const [kpis, setKpis] = useState<PlatformKPIs | null>(null);
  
  // Chart States
  const [dailyUserStats, setDailyUserStats] = useState<DailyStats[]>([]);
  const [dailyTaskStats, setDailyTaskStats] = useState<DailyStats[]>([]);
  const [dailyWishStats, setDailyWishStats] = useState<DailyStats[]>([]);
  const [dailyMarketplaceStats, setDailyMarketplaceStats] = useState<DailyStats[]>([]);
  
  // Category States
  const [taskCategoryStats, setTaskCategoryStats] = useState<CategoryStats[]>([]);
  const [taskRefCategoryStats, setTaskRefCategoryStats] = useState<CategoryStats[]>([]);
  const [wishCategoryStats, setWishCategoryStats] = useState<CategoryStats[]>([]);
  const [marketplaceCategoryStats, setMarketplaceCategoryStats] = useState<CategoryStats[]>([]);
  
  // Location & Helper States
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [helperStats, setHelperStats] = useState<HelperStats[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityRow[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKPIs(),
        loadDailyStats(),
        loadCategoryStats(),
        loadLocationStats(),
        loadHelperStats(),
        loadUserActivity(),
      ]);
      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshViews = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.rpc('refresh_all_analytics_views');
      if (error) throw error;
      toast.success('Analytics refreshed successfully');
      await loadAllData();
    } catch (error) {
      console.error('Failed to refresh views:', error);
      toast.error('Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  };

  const loadKPIs = async () => {
    const { data, error } = await supabase.rpc('get_platform_kpis');
    if (error) throw error;
    if (data && data.length > 0) {
      setKpis(data[0]);
    }
  };

  const loadDailyStats = async () => {
    // Load daily user stats
    const { data: userStats } = await supabase
      .from('mv_daily_user_stats')
      .select('*')
      .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('activity_date', { ascending: true });
    if (userStats) setDailyUserStats(userStats);

    // Load daily task stats
    const { data: taskStats } = await supabase
      .from('mv_daily_task_stats')
      .select('*')
      .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('activity_date', { ascending: true });
    if (taskStats) setDailyTaskStats(taskStats);

    // Load daily wish stats
    const { data: wishStats } = await supabase
      .from('mv_daily_wish_stats')
      .select('*')
      .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('activity_date', { ascending: true });
    if (wishStats) setDailyWishStats(wishStats);

    // Load daily marketplace stats
    const { data: marketStats } = await supabase
      .from('mv_daily_marketplace_stats')
      .select('*')
      .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('activity_date', { ascending: true });
    if (marketStats) setDailyMarketplaceStats(marketStats);
  };

  const loadCategoryStats = async () => {
    // Load service categories (46 categories - REAL TASKS DATA)
    const { data: serviceCats } = await supabase
      .from('mv_service_category_stats')
      .select('*')
      .order('total_tasks', { ascending: false });
    if (serviceCats) {
      setTaskCategoryStats(serviceCats);
      setTaskRefCategoryStats(serviceCats); // Use same data for both
    }

    // Load wish categories
    const { data: wishCats } = await supabase
      .from('mv_wish_category_stats')
      .select('*')
      .order('total_wishes', { ascending: false });
    if (wishCats) setWishCategoryStats(wishCats);

    // Load marketplace categories
    const { data: marketCats } = await supabase
      .from('mv_marketplace_category_stats')
      .select('*')
      .order('total_listings', { ascending: false });
    if (marketCats) setMarketplaceCategoryStats(marketCats);
  };

  const loadLocationStats = async () => {
    const { data } = await supabase.rpc('get_location_heatmap_data');
    if (data) setLocationStats(data.slice(0, 20)); // Top 20 locations
  };

  const loadHelperStats = async () => {
    const { data } = await supabase.rpc('get_top_helpers', { limit_count: 20 });
    if (data) setHelperStats(data);
  };

  const loadUserActivity = async () => {
    const { data, error } = await supabase.rpc('get_user_activity_table');
    if (data) setUserActivity(data);
  };

  const exportData = (dataType: string) => {
    toast.info(`Exporting ${dataType}...`);
    // TODO: Implement CSV export
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-7 h-7" />
            Data Intelligence Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Real-time platform insights from existing data</p>
        </div>
        <button
          onClick={refreshViews}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* ===== SECTION 1: TOP KPI CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={kpis?.total_users || 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <KPICard
          title="Active (24h)"
          value={kpis?.active_users_24h || 0}
          icon={<Activity className="w-6 h-6" />}
          color="bg-green-500"
        />
        <KPICard
          title="Tasks Posted"
          value={kpis?.total_tasks || 0}
          icon={<Briefcase className="w-6 h-6" />}
          color="bg-purple-500"
          subtitle={`${kpis?.completed_tasks || 0} completed`}
        />
        <KPICard
          title="Wishes Posted"
          value={kpis?.total_wishes || 0}
          icon={<Heart className="w-6 h-6" />}
          color="bg-pink-500"
          subtitle={`${kpis?.fulfilled_wishes || 0} fulfilled`}
        />
        <KPICard
          title="Marketplace Listings"
          value={kpis?.total_listings || 0}
          icon={<Package className="w-6 h-6" />}
          color="bg-orange-500"
          subtitle={`${kpis?.active_listings || 0} active`}
        />
        <KPICard
          title="Messages Sent"
          value={kpis?.total_messages || 0}
          icon={<MessageSquare className="w-6 h-6" />}
          color="bg-cyan-500"
        />
        <KPICard
          title="Avg Task Budget"
          value={`₹${Math.round(kpis?.avg_task_budget || 0)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-yellow-500"
        />
        <KPICard
          title="Active (7d)"
          value={kpis?.active_users_7d || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-indigo-500"
        />
      </div>

      {/* ===== SECTION 2: USER ACTIVITY ANALYTICS ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          User Activity Analytics
        </h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyUserStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activity_date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="new_users" stroke={COLORS.primary} name="New Users" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== SECTION 3: TASK ANALYTICS ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Task Analytics
          </h3>
          <button onClick={() => exportData('tasks')} className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        
        {/* Task Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="w-full h-80">
            <h4 className="text-sm font-semibold mb-2">Tasks Posted per Day (Last 30 Days)</h4>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTaskStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity_date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks_posted" fill={COLORS.primary} name="Posted" />
                  <Bar dataKey="tasks_completed" fill={COLORS.success} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="w-full h-80">
            <h4 className="text-sm font-semibold mb-2">Top Task Categories</h4>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskCategoryStats.slice(0, 6)}
                    dataKey="total_tasks"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category_emoji} ${entry.category_name}`}
                  >
                    {taskCategoryStats.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Category Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Tasks Posted</th>
                <th className="px-4 py-2 text-right">Completed</th>
                <th className="px-4 py-2 text-right">Avg Budget</th>
              </tr>
            </thead>
            <tbody>
              {taskCategoryStats.slice(0, 10).map((cat, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{cat.category_emoji} {cat.category_name}</td>
                  <td className="px-4 py-2 text-right">{cat.total_tasks}</td>
                  <td className="px-4 py-2 text-right">{cat.completed_tasks}</td>
                  <td className="px-4 py-2 text-right">₹{Math.round(cat.avg_budget || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SECTION 3B: 12 TASK CATEGORIES (Reference) ===== */}
      {taskRefCategoryStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Service Categories Analytics (46 Categories)
              </h3>
              <p className="text-sm text-gray-600 mt-1">Complete performance breakdown of all LocalFelo service categories & helper matching</p>
            </div>
            <button onClick={() => exportData('task-categories')} className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Task Reference Category Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Total Tasks</th>
                  <th className="px-4 py-2 text-right">Completed</th>
                  <th className="px-4 py-2 text-right">Last 7d</th>
                  <th className="px-4 py-2 text-right">Last 30d</th>
                  <th className="px-4 py-2 text-right">Helpers</th>
                  <th className="px-4 py-2 text-right">Avg Budget</th>
                </tr>
              </thead>
              <tbody>
                {taskRefCategoryStats.map((cat: any, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.category_emoji}</span>
                        <span className="font-medium">{cat.category_name}</span>
                        {cat.priority === 1 && (
                          <span className="text-xs bg-[#CDFF00] text-black px-2 py-0.5 rounded-full font-semibold">
                            Priority
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600 text-xs max-w-xs truncate">{cat.description}</td>
                    <td className="px-4 py-2 text-right font-semibold">{cat.total_tasks || 0}</td>
                    <td className="px-4 py-2 text-right text-green-600">{cat.completed_tasks || 0}</td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-blue-600">{cat.tasks_last_7d || 0}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-purple-600">{cat.tasks_last_30d || 0}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-orange-600 font-semibold">{cat.helpers_available || 0}</span>
                    </td>
                    <td className="px-4 py-2 text-right">₹{Math.round(cat.avg_budget || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Total Tasks (All Categories)</div>
              <div className="text-2xl font-bold">{taskRefCategoryStats.reduce((acc: number, cat: any) => acc + (cat.total_tasks || 0), 0)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">{taskRefCategoryStats.reduce((acc: number, cat: any) => acc + (cat.completed_tasks || 0), 0)}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Last 7 Days</div>
              <div className="text-2xl font-bold text-blue-600">{taskRefCategoryStats.reduce((acc: number, cat: any) => acc + (cat.tasks_last_7d || 0), 0)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Last 30 Days</div>
              <div className="text-2xl font-bold text-purple-600">{taskRefCategoryStats.reduce((acc: number, cat: any) => acc + (cat.tasks_last_30d || 0), 0)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SECTION 4: WISH ANALYTICS ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Wish Analytics
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="w-full h-80">
            <h4 className="text-sm font-semibold mb-2">Wishes Posted per Day (Last 30 Days)</h4>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyWishStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity_date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="wishes_posted" stroke={COLORS.info} name="Posted" strokeWidth={2} />
                  <Line type="monotone" dataKey="wishes_fulfilled" stroke={COLORS.success} name="Fulfilled" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full h-80">
            <h4 className="text-sm font-semibold mb-2">Top Wish Categories</h4>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wishCategoryStats.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_wishes" fill={COLORS.info} name="Wishes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Wish Category Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Wishes Posted</th>
                <th className="px-4 py-2 text-right">Fulfilled</th>
              </tr>
            </thead>
            <tbody>
              {wishCategoryStats.slice(0, 10).map((cat, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{cat.category_emoji} {cat.category_name}</td>
                  <td className="px-4 py-2 text-right">{cat.total_wishes}</td>
                  <td className="px-4 py-2 text-right">{cat.fulfilled_wishes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SECTION 5: MARKETPLACE ANALYTICS ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Marketplace Analytics
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="w-full h-80">
            <h4 className="text-sm font-semibold mb-2">Listings Posted per Day (Last 30 Days)</h4>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyMarketplaceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity_date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="listings_posted" fill={COLORS.warning} name="Posted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full h-80">
            <h4 className="text-sm font-semibold mb-2">Average Listing Price Trend</h4>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyMarketplaceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity_date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${Math.round(Number(value))}`} />
                  <Line type="monotone" dataKey="avg_price" stroke={COLORS.warning} name="Avg Price" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Marketplace Category Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Listings</th>
                <th className="px-4 py-2 text-right">Avg Price</th>
                <th className="px-4 py-2 text-right">Active Listings</th>
              </tr>
            </thead>
            <tbody>
              {marketplaceCategoryStats.slice(0, 10).map((cat, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{cat.category_emoji} {cat.category_name}</td>
                  <td className="px-4 py-2 text-right">{cat.total_listings}</td>
                  <td className="px-4 py-2 text-right">₹{Math.round(cat.avg_price || 0)}</td>
                  <td className="px-4 py-2 text-right">{cat.active_listings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SECTION 6: LOCATION DEMAND ANALYTICS ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Demand Analytics
        </h3>
        <p className="text-sm text-gray-600 mb-4">Top 20 locations by activity</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-right">Tasks</th>
                <th className="px-4 py-2 text-right">Wishes</th>
                <th className="px-4 py-2 text-right">Listings</th>
                <th className="px-4 py-2 text-right">Activity Score</th>
              </tr>
            </thead>
            <tbody>
              {locationStats.map((loc, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">
                    {loc.area_name}, {loc.city_name}
                  </td>
                  <td className="px-4 py-2 text-right">{loc.task_density}</td>
                  <td className="px-4 py-2 text-right">{loc.wish_density}</td>
                  <td className="px-4 py-2 text-right">{loc.listing_density}</td>
                  <td className="px-4 py-2 text-right font-semibold">{Math.round(loc.activity_score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SECTION 7: HELPER PERFORMANCE ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Helper Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Helper</th>
                <th className="px-4 py-2 text-left">City</th>
                <th className="px-4 py-2 text-right">Tasks Completed</th>
                <th className="px-4 py-2 text-right">Completion Rate</th>
                <th className="px-4 py-2 text-right">Avg Task Value</th>
              </tr>
            </thead>
            <tbody>
              {helperStats.map((helper, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{helper.helper_name}</td>
                  <td className="px-4 py-2">{helper.city_name || 'N/A'}</td>
                  <td className="px-4 py-2 text-right">{helper.tasks_completed}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`${helper.completion_rate >= 80 ? 'text-green-600' : helper.completion_rate >= 50 ? 'text-yellow-600' : 'text-red-600'} font-semibold`}>
                      {helper.completion_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">₹{Math.round(helper.avg_task_value || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function KPICard({ title, value, icon, color, subtitle }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} text-white p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}