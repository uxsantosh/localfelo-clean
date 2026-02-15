// =====================================================
// Reports Management Tab - Admin Panel
// View and manage all reports across listings, tasks, wishes
// Updated: Using TypeScript reports service
// =====================================================

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, CheckCircle, Trash2, Download, Filter as FilterIcon, Calendar, ExternalLink, Search, ChevronDown, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatDistanceToNow } from '../../utils/dateFormatter';
import { updateReportStatusAdmin } from '../../services/reports';
import { toast } from 'sonner';

interface Report {
  id: string;
  listingId?: string;
  taskId?: string;
  wishId?: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
  // Joined data
  listing?: {
    title: string;
    isHidden: boolean;
  };
  reporter?: {
    name: string;
    email: string;
  };
}

export function ReportsManagementTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, statusFilter, reports]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          listing_id,
          reason,
          reported_by,
          created_at,
          status,
          listings (title, is_hidden),
          profiles (name, email)
        `);

      if (error) throw error;

      const reportsData: Report[] = (data || []).map((report: any) => ({
        id: report.id,
        listingId: report.listing_id,
        reason: report.reason,
        reportedBy: report.reported_by,
        createdAt: report.created_at,
        status: report.status || 'pending',
        listing: report.listings,
        reporter: report.profiles,
      }));

      setReports(reportsData);
      setFilteredReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.reason.toLowerCase().includes(term) ||
          r.listing?.title.toLowerCase().includes(term) ||
          r.reporter?.email.toLowerCase().includes(term)
      );
    }

    setFilteredReports(filtered);
  };

  const handleMarkReviewed = async (reportId: string) => {
    try {
      const { error } = await updateReportStatusAdmin(reportId, 'reviewed');

      if (error) throw error;

      toast.success('Report marked as reviewed');
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleMarkResolved = async (reportId: string) => {
    try {
      const { error } = await updateReportStatusAdmin(reportId, 'resolved');

      if (error) throw error;

      toast.success('Report marked as resolved');
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report deleted');
      setReports(reports.filter(r => r.id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleExportCSV = () => {
    exportReportsToCSV(filteredReports);
    toast.success('Reports exported to CSV');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="m-0 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Reports Management
          </h2>
          <p className="text-sm text-muted m-0">
            {filteredReports.length} total report(s)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-border rounded-[4px] hover:bg-input flex items-center gap-2"
            disabled={filteredReports.length === 0}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={loadReports}
            disabled={loading}
            className="px-4 py-2 bg-primary text-black rounded-[4px] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-[4px] bg-input"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-[4px] text-sm ${ statusFilter === 'all' ? 'bg-black text-white' : 'bg-input hover:bg-border'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-2 rounded-[4px] text-sm ${
              statusFilter === 'pending' ? 'bg-orange-600 text-white' : 'bg-input hover:bg-border'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-2 rounded-[4px] text-sm ${
              statusFilter === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-input hover:bg-border'
            }`}
          >
            Reviewed ({reviewedCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-2 rounded-[4px] text-sm ${
              statusFilter === 'resolved' ? 'bg-green-600 text-white' : 'bg-input hover:bg-border'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 card">
          <AlertTriangle className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No reports found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-input">
                <th className="text-left p-3 text-sm font-medium border-b border-border">Status</th>
                <th className="text-left p-3 text-sm font-medium border-b border-border">Listing</th>
                <th className="text-left p-3 text-sm font-medium border-b border-border">Reason</th>
                <th className="text-left p-3 text-sm font-medium border-b border-border">Reporter</th>
                <th className="text-left p-3 text-sm font-medium border-b border-border">Date</th>
                <th className="text-left p-3 text-sm font-medium border-b border-border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-input/50">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm">{report.listing?.title || 'N/A'}</span>
                      {report.listing?.isHidden && (
                        <span className="text-xs text-orange-600">Hidden</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm m-0 line-clamp-2 max-w-xs">{report.reason}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm">{report.reporter?.name || 'Anonymous'}</span>
                      <span className="text-xs text-muted">{report.reporter?.email || ''}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted">
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleMarkReviewed(report.id)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600"
                          title="Mark as reviewed"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {report.status !== 'resolved' && (
                        <button
                          onClick={() => handleMarkResolved(report.id)}
                          className="p-1 hover:bg-green-100 rounded text-green-600"
                          title="Mark as resolved"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}