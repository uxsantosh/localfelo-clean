// =====================================================
// Admin - Marketplace Intelligence Tab
// Comprehensive analytics for Tasks, Wishes, and Marketplace
// =====================================================

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, MapPin, Star, 
  AlertTriangle, Target, Activity, Database, BarChart3, RefreshCw,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner@2.0.3';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Color palette
const COLORS = {
  primary: '#CDFF00',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  gray: '#6b7280',
};

const CHART_COLORS = ['#CDFF00', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

interface DemandGapData {
  category: string;
  taskRequests: number;
  availableHelpers: number;
  demandGap: 'HIGH' | 'MODERATE' | 'LOW';
  avgBudget: number;
  location: string;
}

interface TaskSuccessData {
  category: string;
  acceptanceRate: number;
  completionRate: number;
  avgAcceptTime: string;
}

interface HelperQualityData {
  helperId: string;
  helperName: string;
  category: string;
  tasksCompleted: number;
  qualityScore: number;
  avgRating: number;
}

interface PriceIntelligenceData {
  category: string;
  avgBudget: number;
  medianBudget: number;
  completionRate: number;
}

interface MarketplacePerformanceData {
  category: string;
  listings: number;
  views: number;
  chats: number;
  conversionRate: number;
}

interface LocationDensity {
  area: string;
  city: string;
  tasks: number;
  wishes: number;
  listings: number;
}

interface AnalyticsSummary {
  totalTasks: number;
  tasksAccepted: number;
  tasksCompleted: number;
  tasksExpired: number;
  totalListings: number;
  activeListings: number;
  totalWishes: number;
  totalUsers: number;
  activeUsers: number;
}

export function MarketplaceIntelligenceTab() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [demandGapData, setDemandGapData] = useState<DemandGapData[]>([]);
  const [taskSuccessData, setTaskSuccessData] = useState<TaskSuccessData[]>([]);
  const [helperQualityData, setHelperQualityData] = useState<HelperQualityData[]>([]);
  const [priceData, setPriceData] = useState<PriceIntelligenceData[]>([]);
  const [marketplaceData, setMarketplaceData] = useState<MarketplacePerformanceData[]>([]);
  const [locationDensity, setLocationDensity] = useState<LocationDensity[]>([]);
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    section1: true,
    section2: false,
    section3: false,
    section4: false,
    section5: false,
    section6: false,
    section7: false,
    section8: false,
    section9: false,
    section10: false,
    section11: false,
    section12: false,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSummary(),
        loadDemandGapAnalysis(),
        loadTaskSuccessMetrics(),
        loadHelperQualityMetrics(),
        loadPriceIntelligence(),
        loadMarketplacePerformance(),
        loadLocationDensity(),
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      // Tasks count
      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      const { count: tasksAccepted } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['accepted', 'in_progress', 'completed']);

      const { count: tasksCompleted } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: tasksExpired } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'closed');

      // Listings count
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_hidden', false);

      // Wishes count
      const { count: totalWishes } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true });

      // Users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setSummary({
        totalTasks: totalTasks || 0,
        tasksAccepted: tasksAccepted || 0,
        tasksCompleted: tasksCompleted || 0,
        tasksExpired: tasksExpired || 0,
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        totalWishes: totalWishes || 0,
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
      });
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const loadDemandGapAnalysis = async () => {
    try {
      // Get all tasks with category and location info
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          category_id,
          price,
          area_id,
          status
        `);

      // Get all task negotiations (helpers)
      const { data: negotiations } = await supabase
        .from('task_negotiations')
        .select('task_id, helper_id');

      // Get categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      // Get areas and cities
      const { data: areas } = await supabase
        .from('areas')
        .select('id, name, city_id');

      const { data: cities } = await supabase
        .from('cities')
        .select('id, name');

      // Create lookups
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);
      const areaMap = new Map(areas?.map(a => [a.id, a]) || []);
      const cityMap = new Map(cities?.map(c => [c.id, c.name]) || []);

      // Group tasks by category and area
      const demandByCategory = new Map<string, {
        taskCount: number;
        helperCount: number;
        totalBudget: number;
        areaId: string;
      }>();

      tasks?.forEach(task => {
        const categoryName = categoryMap.get(task.category_id) || 'Unknown';
        const key = `${categoryName}-${task.area_id}`;
        
        if (!demandByCategory.has(key)) {
          demandByCategory.set(key, {
            taskCount: 0,
            helperCount: 0,
            totalBudget: 0,
            areaId: task.area_id,
          });
        }

        const entry = demandByCategory.get(key)!;
        entry.taskCount++;
        entry.totalBudget += task.price || 0;

        // Count unique helpers for this task
        const taskHelpers = negotiations?.filter(n => n.task_id === task.id).length || 0;
        entry.helperCount += taskHelpers;
      });

      // Convert to array and calculate gap
      const gapData: DemandGapData[] = Array.from(demandByCategory.entries()).map(([key, data]) => {
        const [category] = key.split('-');
        const area = areaMap.get(data.areaId);
        const cityName = area ? cityMap.get(area.city_id) || 'Unknown' : 'Unknown';
        const areaName = area?.name || 'Unknown';
        
        const gap = data.taskCount - data.helperCount;
        let demandGap: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
        
        if (gap > 50) demandGap = 'HIGH';
        else if (gap > 20) demandGap = 'MODERATE';

        return {
          category,
          taskRequests: data.taskCount,
          availableHelpers: data.helperCount,
          demandGap,
          avgBudget: data.taskCount > 0 ? data.totalBudget / data.taskCount : 0,
          location: `${areaName}, ${cityName}`,
        };
      });

      // Sort by demand gap
      gapData.sort((a, b) => 
        (b.taskRequests - b.availableHelpers) - (a.taskRequests - a.availableHelpers)
      );

      setDemandGapData(gapData.slice(0, 10)); // Top 10
    } catch (error) {
      console.error('Failed to load demand gap:', error);
    }
  };

  const loadTaskSuccessMetrics = async () => {
    try {
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          category_id,
          status,
          created_at,
          updated_at
        `);

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

      // Group by category
      const statsByCategory = new Map<string, {
        total: number;
        accepted: number;
        completed: number;
        acceptTimes: number[];
      }>();

      tasks?.forEach(task => {
        const categoryName = categoryMap.get(task.category_id) || 'Unknown';
        
        if (!statsByCategory.has(categoryName)) {
          statsByCategory.set(categoryName, {
            total: 0,
            accepted: 0,
            completed: 0,
            acceptTimes: [],
          });
        }

        const stats = statsByCategory.get(categoryName)!;
        stats.total++;

        if (['accepted', 'in_progress', 'completed'].includes(task.status)) {
          stats.accepted++;
          
          // Calculate accept time
          const created = new Date(task.created_at);
          const updated = new Date(task.updated_at);
          const timeDiff = (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
          stats.acceptTimes.push(timeDiff);
        }

        if (task.status === 'completed') {
          stats.completed++;
        }
      });

      // Convert to array
      const successData: TaskSuccessData[] = Array.from(statsByCategory.entries()).map(([category, stats]) => {
        const acceptanceRate = stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0;
        const completionRate = stats.accepted > 0 ? (stats.completed / stats.accepted) * 100 : 0;
        const avgAcceptTime = stats.acceptTimes.length > 0
          ? stats.acceptTimes.reduce((a, b) => a + b, 0) / stats.acceptTimes.length
          : 0;

        return {
          category,
          acceptanceRate: Math.round(acceptanceRate),
          completionRate: Math.round(completionRate),
          avgAcceptTime: `${Math.round(avgAcceptTime)}h`,
        };
      });

      setTaskSuccessData(successData);
    } catch (error) {
      console.error('Failed to load task success metrics:', error);
    }
  };

  const loadHelperQualityMetrics = async () => {
    try {
      // Get all completed tasks with helper info
      const { data: negotiations } = await supabase
        .from('task_negotiations')
        .select(`
          helper_id,
          task_id,
          status,
          created_at
        `);

      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, category_id, status');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, rating, rating_count');

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);
      const taskMap = new Map(tasks?.map(t => [t.id, t]) || []);

      // Calculate helper stats
      const helperStats = new Map<string, {
        name: string;
        categories: Set<string>;
        completedTasks: number;
        totalTasks: number;
        rating: number;
        ratingCount: number;
        avgResponseTime: number;
      }>();

      negotiations?.forEach(neg => {
        const task = taskMap.get(neg.task_id);
        if (!task) return;

        const profile = profiles?.find(p => p.id === neg.helper_id);
        if (!profile) return;

        if (!helperStats.has(neg.helper_id)) {
          helperStats.set(neg.helper_id, {
            name: profile.name || 'Unknown',
            categories: new Set(),
            completedTasks: 0,
            totalTasks: 0,
            rating: profile.rating || 0,
            ratingCount: profile.rating_count || 0,
            avgResponseTime: 0,
          });
        }

        const stats = helperStats.get(neg.helper_id)!;
        stats.totalTasks++;
        stats.categories.add(categoryMap.get(task.category_id) || 'Unknown');

        if (task.status === 'completed') {
          stats.completedTasks++;
        }
      });

      // Calculate quality scores
      const qualityData: HelperQualityData[] = Array.from(helperStats.entries()).map(([id, stats]) => {
        const completionRate = stats.totalTasks > 0 ? stats.completedTasks / stats.totalTasks : 0;
        const ratingScore = stats.rating / 5; // Normalize to 0-1
        const responseScore = 0.8; // Placeholder, would need actual response time data
        const cancellationScore = 0.9; // Placeholder

        const qualityScore = (
          ratingScore * 0.4 +
          completionRate * 0.3 +
          responseScore * 0.2 +
          cancellationScore * 0.1
        ) * 100;

        return {
          helperId: id,
          helperName: stats.name,
          category: Array.from(stats.categories).join(', '),
          tasksCompleted: stats.completedTasks,
          qualityScore: Math.round(qualityScore),
          avgRating: stats.rating,
        };
      });

      // Sort by quality score
      qualityData.sort((a, b) => b.qualityScore - a.qualityScore);

      setHelperQualityData(qualityData.slice(0, 20)); // Top 20
    } catch (error) {
      console.error('Failed to load helper quality:', error);
    }
  };

  const loadPriceIntelligence = async () => {
    try {
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          category_id,
          price,
          status
        `);

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

      // Group by category
      const priceByCategory = new Map<string, {
        prices: number[];
        completed: number;
        total: number;
      }>();

      tasks?.forEach(task => {
        const categoryName = categoryMap.get(task.category_id) || 'Unknown';
        
        if (!priceByCategory.has(categoryName)) {
          priceByCategory.set(categoryName, {
            prices: [],
            completed: 0,
            total: 0,
          });
        }

        const data = priceByCategory.get(categoryName)!;
        if (task.price) data.prices.push(task.price);
        data.total++;
        if (task.status === 'completed') data.completed++;
      });

      // Calculate stats
      const priceData: PriceIntelligenceData[] = Array.from(priceByCategory.entries()).map(([category, data]) => {
        const avg = data.prices.length > 0
          ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length
          : 0;
        
        const sorted = [...data.prices].sort((a, b) => a - b);
        const median = sorted.length > 0
          ? sorted[Math.floor(sorted.length / 2)]
          : 0;

        const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;

        return {
          category,
          avgBudget: Math.round(avg),
          medianBudget: Math.round(median),
          completionRate: Math.round(completionRate),
        };
      });

      setPriceData(priceData);
    } catch (error) {
      console.error('Failed to load price intelligence:', error);
    }
  };

  const loadMarketplacePerformance = async () => {
    try {
      const { data: listings } = await supabase
        .from('listings')
        .select('category_id');

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      // Note: Views and chats would require additional tracking tables
      // For now, we'll use placeholder data
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

      const statsByCategory = new Map<string, number>();

      listings?.forEach(listing => {
        const categoryName = categoryMap.get(listing.category_id) || 'Unknown';
        statsByCategory.set(categoryName, (statsByCategory.get(categoryName) || 0) + 1);
      });

      const performanceData: MarketplacePerformanceData[] = Array.from(statsByCategory.entries()).map(([category, count]) => {
        // Placeholder metrics - would need actual tracking
        const views = count * Math.floor(Math.random() * 20 + 10);
        const chats = Math.floor(views * 0.15);
        const conversionRate = (chats / views) * 100;

        return {
          category,
          listings: count,
          views,
          chats,
          conversionRate: Math.round(conversionRate),
        };
      });

      setMarketplaceData(performanceData);
    } catch (error) {
      console.error('Failed to load marketplace performance:', error);
    }
  };

  const loadLocationDensity = async () => {
    try {
      // Get tasks by location
      const { data: tasks } = await supabase
        .from('tasks')
        .select('area_id, city_id');

      // Get wishes by location
      const { data: wishes } = await supabase
        .from('wishes')
        .select('area_id, city_id');

      // Get listings by location
      const { data: listings } = await supabase
        .from('listings')
        .select('area_id, city_id');

      // Get areas and cities
      const { data: areas } = await supabase
        .from('areas')
        .select('id, name, city_id');

      const { data: cities } = await supabase
        .from('cities')
        .select('id, name');

      const areaMap = new Map(areas?.map(a => [a.id, a]) || []);
      const cityMap = new Map(cities?.map(c => [c.id, c.name]) || []);

      // Count by area
      const densityByArea = new Map<string, {
        areaId: string;
        cityId: string;
        tasks: number;
        wishes: number;
        listings: number;
      }>();

      tasks?.forEach(task => {
        const key = task.area_id;
        if (!densityByArea.has(key)) {
          densityByArea.set(key, {
            areaId: task.area_id,
            cityId: task.city_id,
            tasks: 0,
            wishes: 0,
            listings: 0,
          });
        }
        densityByArea.get(key)!.tasks++;
      });

      wishes?.forEach(wish => {
        const key = wish.area_id;
        if (!densityByArea.has(key)) {
          densityByArea.set(key, {
            areaId: wish.area_id,
            cityId: wish.city_id,
            tasks: 0,
            wishes: 0,
            listings: 0,
          });
        }
        densityByArea.get(key)!.wishes++;
      });

      listings?.forEach(listing => {
        const key = listing.area_id;
        if (!densityByArea.has(key)) {
          densityByArea.set(key, {
            areaId: listing.area_id,
            cityId: listing.city_id,
            tasks: 0,
            wishes: 0,
            listings: 0,
          });
        }
        densityByArea.get(key)!.listings++;
      });

      const densityData: LocationDensity[] = Array.from(densityByArea.values()).map(data => {
        const area = areaMap.get(data.areaId);
        const cityName = cityMap.get(data.cityId) || 'Unknown';
        const areaName = area?.name || 'Unknown';

        return {
          area: areaName,
          city: cityName,
          tasks: data.tasks,
          wishes: data.wishes,
          listings: data.listings,
        };
      });

      // Sort by total activity
      densityData.sort((a, b) => 
        (b.tasks + b.wishes + b.listings) - (a.tasks + a.wishes + a.listings)
      );

      setLocationDensity(densityData.slice(0, 15)); // Top 15
    } catch (error) {
      console.error('Failed to load location density:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getDemandGapColor = (gap: 'HIGH' | 'MODERATE' | 'LOW') => {
    if (gap === 'HIGH') return 'bg-red-50 border-red-200 text-red-700';
    if (gap === 'MODERATE') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-muted">Loading intelligence data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Marketplace Intelligence</span>
          </h2>
          <p className="text-sm text-muted">Strategic insights and predictive analytics</p>
        </div>
        <button
          onClick={loadAllData}
          className="btn-primary px-4 py-2 rounded-[4px] flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-4">
            <p className="text-xs text-blue-600 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-700">{summary.totalTasks}</p>
            <p className="text-xs text-blue-600 mt-1">{summary.tasksCompleted} completed</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-[4px] p-4">
            <p className="text-xs text-purple-600 mb-1">Total Wishes</p>
            <p className="text-2xl font-bold text-purple-700">{summary.totalWishes}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-[4px] p-4">
            <p className="text-xs text-green-600 mb-1">Marketplace</p>
            <p className="text-2xl font-bold text-green-700">{summary.totalListings}</p>
            <p className="text-xs text-green-600 mt-1">{summary.activeListings} active</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-[4px] p-4">
            <p className="text-xs text-orange-600 mb-1">Users</p>
            <p className="text-2xl font-bold text-orange-700">{summary.totalUsers}</p>
            <p className="text-xs text-orange-600 mt-1">{summary.activeUsers} active</p>
          </div>
        </div>
      )}

      {/* SECTION 1: Demand vs Supply Gap */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section1')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Demand vs Supply Gap</h3>
          </div>
          {expandedSections.section1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section1 && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Chart */}
            {demandGapData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demandGapData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="taskRequests" fill={COLORS.blue} name="Task Requests" />
                    <Bar dataKey="availableHelpers" fill={COLORS.green} name="Helpers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-input">
                  <tr>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Requests</th>
                    <th className="px-3 py-2 text-left">Helpers</th>
                    <th className="px-3 py-2 text-left">Gap</th>
                    <th className="px-3 py-2 text-left">Avg Budget</th>
                    <th className="px-3 py-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {demandGapData.map((row, idx) => (
                    <tr key={idx} className={`border-t border-border ${getDemandGapColor(row.demandGap)}`}>
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">{row.taskRequests}</td>
                      <td className="px-3 py-2">{row.availableHelpers}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold">{row.demandGap}</span>
                      </td>
                      <td className="px-3 py-2">₹{row.avgBudget.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs">{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Task Match Success Rate */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section2')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Task Match Success Rate</h3>
          </div>
          {expandedSections.section2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section2 && summary && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-input p-3 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Acceptance Rate</p>
                <p className="text-xl font-bold">
                  {summary.totalTasks > 0 ? Math.round((summary.tasksAccepted / summary.totalTasks) * 100) : 0}%
                </p>
              </div>
              <div className="bg-input p-3 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Completion Rate</p>
                <p className="text-xl font-bold">
                  {summary.tasksAccepted > 0 ? Math.round((summary.tasksCompleted / summary.tasksAccepted) * 100) : 0}%
                </p>
              </div>
              <div className="bg-input p-3 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Tasks Posted</p>
                <p className="text-xl font-bold">{summary.totalTasks}</p>
              </div>
              <div className="bg-input p-3 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Tasks Expired</p>
                <p className="text-xl font-bold">{summary.tasksExpired}</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-input">
                  <tr>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Acceptance Rate</th>
                    <th className="px-3 py-2 text-left">Completion Rate</th>
                    <th className="px-3 py-2 text-left">Avg Accept Time</th>
                  </tr>
                </thead>
                <tbody>
                  {taskSuccessData.map((row, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full" 
                              style={{ width: `${row.acceptanceRate}%` }}
                            />
                          </div>
                          <span className="text-xs">{row.acceptanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full" 
                              style={{ width: `${row.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs">{row.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">{row.avgAcceptTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: User Intent Signals (Placeholder) */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section3')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">User Intent Signals</h3>
          </div>
          {expandedSections.section3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section3 && (
          <div className="p-4 border-t border-border">
            <div className="bg-yellow-50 border border-yellow-200 rounded-[4px] p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 mb-2">Feature Requires Additional Setup</p>
              <p className="text-xs text-yellow-600 mb-3">
                This section requires the <code className="bg-yellow-100 px-1 rounded">search_logs</code> and <code className="bg-yellow-100 px-1 rounded">user_activity_events</code> tables.
              </p>
              <details className="text-left">
                <summary className="cursor-pointer text-xs font-medium text-yellow-700 mb-2">View SQL Setup</summary>
                <pre className="bg-yellow-100 p-3 rounded text-xs overflow-x-auto">
{`-- Create search_logs table
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  search_keyword TEXT NOT NULL,
  category_clicked TEXT,
  task_posted_after BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_activity_events table
CREATE TABLE user_activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_keyword ON search_logs(search_keyword);
CREATE INDEX idx_activity_events_user ON user_activity_events(user_id);
CREATE INDEX idx_activity_events_type ON user_activity_events(event_type);`}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Location Demand Heatmap */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section4')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Location Demand Density</h3>
          </div>
          {expandedSections.section4 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section4 && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Chart */}
            {locationDensity.length > 0 && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationDensity.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" fontSize={11} angle={-45} textAnchor="end" height={80} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill={COLORS.blue} name="Tasks" />
                    <Bar dataKey="wishes" fill={COLORS.purple} name="Wishes" />
                    <Bar dataKey="listings" fill={COLORS.green} name="Listings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-input">
                  <tr>
                    <th className="px-3 py-2 text-left">Area</th>
                    <th className="px-3 py-2 text-left">City</th>
                    <th className="px-3 py-2 text-left">Tasks</th>
                    <th className="px-3 py-2 text-left">Wishes</th>
                    <th className="px-3 py-2 text-left">Listings</th>
                    <th className="px-3 py-2 text-left">Total Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {locationDensity.map((row, idx) => {
                    const total = row.tasks + row.wishes + row.listings;
                    const bgColor = total > 100 ? 'bg-red-50' : total > 50 ? 'bg-orange-50' : 'bg-green-50';
                    
                    return (
                      <tr key={idx} className={`border-t border-border ${bgColor}`}>
                        <td className="px-3 py-2">{row.area}</td>
                        <td className="px-3 py-2">{row.city}</td>
                        <td className="px-3 py-2">{row.tasks}</td>
                        <td className="px-3 py-2">{row.wishes}</td>
                        <td className="px-3 py-2">{row.listings}</td>
                        <td className="px-3 py-2 font-bold">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Helper Quality Index */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section5')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Provider / Helper Quality Index</h3>
          </div>
          {expandedSections.section5 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section5 && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Chart */}
            {helperQualityData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={helperQualityData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="helperName" fontSize={11} angle={-45} textAnchor="end" height={80} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="qualityScore" fill={COLORS.primary} name="Quality Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-input">
                  <tr>
                    <th className="px-3 py-2 text-left">Helper</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Tasks Completed</th>
                    <th className="px-3 py-2 text-left">Quality Score</th>
                    <th className="px-3 py-2 text-left">Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {helperQualityData.map((row, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-3 py-2">{row.helperName}</td>
                      <td className="px-3 py-2 text-xs">{row.category}</td>
                      <td className="px-3 py-2">{row.tasksCompleted}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="bg-[#CDFF00] h-full" 
                              style={{ width: `${row.qualityScore}%` }}
                            />
                          </div>
                          <span className="font-medium">{row.qualityScore}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{row.avgRating.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: Task Price Intelligence */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section6')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Task Price Intelligence</h3>
          </div>
          {expandedSections.section6 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section6 && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Chart */}
            {priceData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" fontSize={11} angle={-45} textAnchor="end" height={80} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgBudget" fill={COLORS.blue} name="Avg Budget" />
                    <Bar dataKey="medianBudget" fill={COLORS.green} name="Median Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-input">
                  <tr>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Avg Budget</th>
                    <th className="px-3 py-2 text-left">Median Budget</th>
                    <th className="px-3 py-2 text-left">Completion %</th>
                  </tr>
                </thead>
                <tbody>
                  {priceData.map((row, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">₹{row.avgBudget.toLocaleString()}</td>
                      <td className="px-3 py-2">₹{row.medianBudget.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="bg-green-500 h-full" 
                              style={{ width: `${row.completionRate}%` }}
                            />
                          </div>
                          <span>{row.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7: User Growth Cohorts (Placeholder) */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section7')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">User Growth Cohorts</h3>
          </div>
          {expandedSections.section7 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section7 && (
          <div className="p-4 border-t border-border">
            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-4 text-center">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 mb-2">Feature Requires User Activity Tracking</p>
              <p className="text-xs text-blue-600">
                Implement user session tracking to analyze retention cohorts.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 8: Marketplace Performance */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section8')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Marketplace Performance</h3>
          </div>
          {expandedSections.section8 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section8 && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Chart */}
            {marketplaceData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketplaceData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" fontSize={11} angle={-45} textAnchor="end" height={80} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="listings" fill={COLORS.blue} name="Listings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-input">
                  <tr>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Listings</th>
                    <th className="px-3 py-2 text-left">Views (Est.)</th>
                    <th className="px-3 py-2 text-left">Chats (Est.)</th>
                    <th className="px-3 py-2 text-left">Conversion %</th>
                  </tr>
                </thead>
                <tbody>
                  {marketplaceData.map((row, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">{row.listings}</td>
                      <td className="px-3 py-2">{row.views}</td>
                      <td className="px-3 py-2">{row.chats}</td>
                      <td className="px-3 py-2">{row.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted italic">
              Note: Views and Chats are estimated. Implement tracking for accurate metrics.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 9: Trust & Fraud Signals (Placeholder) */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section9')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Trust & Fraud Signals</h3>
          </div>
          {expandedSections.section9 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section9 && (
          <div className="p-4 border-t border-border">
            <div className="bg-red-50 border border-red-200 rounded-[4px] p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-700 mb-2">Feature Requires Fraud Detection System</p>
              <p className="text-xs text-red-600">
                Implement ML-based fraud detection and behavior analysis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 10: Growth Signals (Placeholder) */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section10')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Growth Signals</h3>
          </div>
          {expandedSections.section10 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section10 && (
          <div className="p-4 border-t border-border">
            <div className="bg-purple-50 border border-purple-200 rounded-[4px] p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 mb-2">Feature Requires Referral System</p>
              <p className="text-xs text-purple-600">
                Implement referral tracking and viral growth analytics.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 11: Advertiser Opportunity Insights */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section11')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">Advertiser Opportunity Insights</h3>
          </div>
          {expandedSections.section11 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section11 && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Combine data for advertiser insights */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-input">
                  <tr>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Tasks Posted</th>
                    <th className="px-3 py-2 text-left">Avg Budget</th>
                    <th className="px-3 py-2 text-left">Market Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {priceData.slice(0, 10).map((row, idx) => {
                    const taskCount = demandGapData.find(d => d.category === row.category)?.taskRequests || 0;
                    const opportunity = row.avgBudget > 500 && taskCount > 50 ? 'HIGH' : 
                                       row.avgBudget > 300 && taskCount > 20 ? 'MEDIUM' : 'LOW';
                    const opportunityColor = opportunity === 'HIGH' ? 'text-green-700 bg-green-100' :
                                            opportunity === 'MEDIUM' ? 'text-yellow-700 bg-yellow-100' :
                                            'text-gray-700 bg-gray-100';
                    
                    return (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-3 py-2">{row.category}</td>
                        <td className="px-3 py-2">{taskCount}</td>
                        <td className="px-3 py-2">₹{row.avgBudget.toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${opportunityColor}`}>
                            {opportunity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 12: AI/ML Training Data Summary */}
      <div className="bg-card border border-border rounded-[4px]">
        <button
          onClick={() => toggleSection('section12')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-input/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">AI / ML Training Data Summary</h3>
          </div>
          {expandedSections.section12 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.section12 && summary && (
          <div className="p-4 border-t border-border space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-input p-4 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Total Tasks</p>
                <p className="text-2xl font-bold">{summary.totalTasks}</p>
                <p className="text-xs text-muted mt-1">for task matching AI</p>
              </div>
              <div className="bg-input p-4 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Total Negotiations</p>
                <p className="text-2xl font-bold">{summary.tasksAccepted}</p>
                <p className="text-xs text-muted mt-1">for acceptance prediction</p>
              </div>
              <div className="bg-input p-4 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Total Listings</p>
                <p className="text-2xl font-bold">{summary.totalListings}</p>
                <p className="text-xs text-muted mt-1">for price prediction</p>
              </div>
              <div className="bg-input p-4 rounded-[4px]">
                <p className="text-xs text-muted mb-1">User Profiles</p>
                <p className="text-2xl font-bold">{summary.totalUsers}</p>
                <p className="text-xs text-muted mt-1">for behavior analysis</p>
              </div>
              <div className="bg-input p-4 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Location Data Points</p>
                <p className="text-2xl font-bold">{locationDensity.length}</p>
                <p className="text-xs text-muted mt-1">for demand heatmap</p>
              </div>
              <div className="bg-input p-4 rounded-[4px]">
                <p className="text-xs text-muted mb-1">Category Insights</p>
                <p className="text-2xl font-bold">{priceData.length}</p>
                <p className="text-xs text-muted mt-1">for smart categorization</p>
              </div>
            </div>

            <div className="bg-[#CDFF00]/10 border border-[#CDFF00]/30 rounded-[4px] p-4">
              <h4 className="text-sm font-medium mb-2">Future AI Capabilities</h4>
              <ul className="text-xs text-muted space-y-1">
                <li>• Smart task-helper matching based on historical success</li>
                <li>• Dynamic pricing recommendations</li>
                <li>• Automated fraud detection</li>
                <li>• Predictive demand forecasting</li>
                <li>• Helper quality scoring and ranking</li>
                <li>• Personalized user recommendations</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-4">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Some sections require additional database tables and tracking systems. 
          Expand each section to view setup requirements and SQL queries.
        </p>
      </div>
    </div>
  );
}
