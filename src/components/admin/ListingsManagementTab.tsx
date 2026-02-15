import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, Search, X, Filter, Eye, EyeOff, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  price: number;
  category_slug: string;
  city: string;
  area_slug: string;
  owner_name: string;
  owner_phone: string;
  is_active: boolean;
  created_at: string;
  images: string[];
}

export function ListingsManagementTab() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus === 'active') {
        query = query.eq('is_active', true);
      } else if (filterStatus === 'hidden') {
        query = query.eq('is_active', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Failed to load listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setListings(prev => prev.map(l => 
        l.id === id ? { ...l, is_active: !currentStatus } : l
      ));
      
      toast.success(`Listing ${!currentStatus ? 'activated' : 'hidden'}`);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update listing');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      setListings(prev => prev.filter(l => l.id !== id));
      toast.success('Listing deleted');
    } catch (error: any) {
      console.error('Failed to delete listing:', error);
      const errorMsg = error?.message || 'Failed to delete listing';
      toast.error(errorMsg);
      
      // Show RLS error hint
      if (errorMsg.includes('policy') || errorMsg.includes('permission')) {
        console.error('🔒 RLS Policy Issue: Run /migrations/FIX_ADMIN_DELETE_PERMISSIONS.sql');
      }
    }
  };

  const handleBulkAction = async (action: 'activate' | 'hide' | 'delete') => {
    if (selectedListings.length === 0) {
      toast.error('Please select listings first');
      return;
    }

    if (action === 'delete' && !window.confirm(`Delete ${selectedListings.length} listings?`)) {
      return;
    }

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('listings')
          .delete()
          .in('id', selectedListings);

        if (error) throw error;
        setListings(prev => prev.filter(l => !selectedListings.includes(l.id)));
      } else {
        const is_active = action === 'activate';
        const { error } = await supabase
          .from('listings')
          .update({ is_active })
          .in('id', selectedListings);

        if (error) throw error;
        setListings(prev => prev.map(l => 
          selectedListings.includes(l.id) ? { ...l, is_active } : l
        ));
      }

      setSelectedListings([]);
      toast.success(`${selectedListings.length} listings updated`);
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      const errorMsg = error?.message || 'Bulk action failed';
      toast.error(errorMsg);
      
      // Show RLS error hint
      if (errorMsg.includes('policy') || errorMsg.includes('permission')) {
        console.error('🔒 RLS Policy Issue: Run /migrations/FIX_ADMIN_DELETE_PERMISSIONS.sql');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(l => l.id));
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Listings Management
        </h2>
        <div className="text-sm text-muted">
          Total: {listings.length} | Active: {listings.filter(l => l.is_active).length} | Hidden: {listings.filter(l => !l.is_active).length}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by title or owner name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              loadListings();
            }}
            className="px-4 py-2 border border-border rounded focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <div className="bg-primary/10 border border-primary rounded p-3 flex items-center gap-3">
          <span className="font-medium">{selectedListings.length} selected</span>
          <button
            onClick={() => handleBulkAction('activate')}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            Activate
          </button>
          <button
            onClick={() => handleBulkAction('hide')}
            className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
          >
            Hide
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedListings([])}
            className="px-3 py-1.5 border border-border rounded text-sm hover:bg-input transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded border border-border">
          <Package className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No listings found</p>
        </div>
      ) : (
        <div className="bg-white rounded border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-input border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Owner</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-input/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedListings.includes(listing.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedListings(prev => [...prev, listing.id]);
                          } else {
                            setSelectedListings(prev => prev.filter(id => id !== listing.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-input rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium max-w-xs truncate">{listing.title}</div>
                      <div className="text-xs text-muted">{listing.category_slug}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">₹{listing.price}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{listing.owner_name}</div>
                      <div className="text-xs text-muted">{listing.owner_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{listing.city}</div>
                      <div className="text-xs text-muted">{listing.area_slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        listing.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(listing.id, listing.is_active)}
                          className="p-1.5 hover:bg-input rounded transition-colors"
                          title={listing.is_active ? 'Hide' : 'Activate'}
                        >
                          {listing.is_active ? (
                            <EyeOff className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
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
  );
}