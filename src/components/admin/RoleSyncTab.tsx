// =====================================================
// ADMIN: ROLE SYNC TAB
// =====================================================
// Tool to sync locked professional roles to Supabase roles table

import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { RefreshCw, CheckCircle, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { LOCKED_PROFESSIONAL_ROLES, ALL_VALID_ROLE_NAMES, getRoleDisplayOrder } from '../../services/professionalRoles';
import { supabase } from '../../lib/supabaseClient';

interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  deactivated: number;
  errors: string[];
}

export function RoleSyncTab() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [existingRoles, setExistingRoles] = useState<any[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Load existing roles from database
  const loadExistingRoles = async () => {
    setLoadingExisting(true);
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Failed to load existing roles: ' + error.message);
        return;
      }

      setExistingRoles(data || []);
      toast.success(`Loaded ${data?.length || 0} existing roles`);
    } catch (error: any) {
      toast.error('Error loading roles: ' + error.message);
    } finally {
      setLoadingExisting(false);
    }
  };

  // Sync locked roles to database
  const syncRolesToDatabase = async () => {
    setSyncing(true);
    setSyncResult(null);

    const result: SyncResult = {
      success: true,
      created: 0,
      updated: 0,
      deactivated: 0,
      errors: []
    };

    try {
      // Step 1: Load existing roles
      const { data: existingData, error: loadError } = await supabase
        .from('roles')
        .select('*');

      if (loadError) {
        result.success = false;
        result.errors.push('Failed to load existing roles: ' + loadError.message);
        setSyncResult(result);
        return;
      }

      const existingRolesMap = new Map(
        (existingData || []).map(role => [role.name, role])
      );

      // Step 2: Process each locked role
      for (const group of LOCKED_PROFESSIONAL_ROLES) {
        for (const roleName of group.roles) {
          const displayOrder = getRoleDisplayOrder(roleName);
          const existing = existingRolesMap.get(roleName);

          try {
            if (existing) {
              // Update existing role
              const { error: updateError } = await supabase
                .from('roles')
                .update({
                  display_order: displayOrder,
                  is_active: true,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);

              if (updateError) {
                result.errors.push(`Failed to update ${roleName}: ${updateError.message}`);
              } else {
                result.updated++;
              }
            } else {
              // Create new role
              const { error: insertError } = await supabase
                .from('roles')
                .insert({
                  name: roleName,
                  display_order: displayOrder,
                  is_active: true,
                  image_url: null
                });

              if (insertError) {
                result.errors.push(`Failed to create ${roleName}: ${insertError.message}`);
              } else {
                result.created++;
              }
            }
          } catch (error: any) {
            result.errors.push(`Error processing ${roleName}: ${error.message}`);
          }
        }
      }

      // Step 3: Deactivate roles not in locked list
      const rolesToDeactivate = (existingData || []).filter(
        role => !ALL_VALID_ROLE_NAMES.includes(role.name) && role.is_active
      );

      for (const role of rolesToDeactivate) {
        try {
          const { error: deactivateError } = await supabase
            .from('roles')
            .update({
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', role.id);

          if (deactivateError) {
            result.errors.push(`Failed to deactivate ${role.name}: ${deactivateError.message}`);
          } else {
            result.deactivated++;
          }
        } catch (error: any) {
          result.errors.push(`Error deactivating ${role.name}: ${error.message}`);
        }
      }

      // Set final result
      if (result.errors.length > 0) {
        result.success = false;
        toast.error(`Sync completed with ${result.errors.length} errors`);
      } else {
        toast.success('All roles synced successfully!');
      }

      setSyncResult(result);
      await loadExistingRoles(); // Reload to show updated data

    } catch (error: any) {
      result.success = false;
      result.errors.push('Sync failed: ' + error.message);
      setSyncResult(result);
      toast.error('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-black mb-2">Role Sync Manager</h2>
            <p className="text-sm text-gray-600">
              Sync locked professional roles from code to database
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadExistingRoles}
              disabled={loadingExisting || syncing}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-black font-semibold hover:border-[#CDFF00] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loadingExisting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Load Current
            </button>
            <button
              onClick={syncRolesToDatabase}
              disabled={syncing || loadingExisting}
              className="px-4 py-2 bg-[#CDFF00] rounded-lg text-black font-semibold hover:bg-[#B8E600] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Sync to Database
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div key="total-locked" className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-black">{ALL_VALID_ROLE_NAMES.length}</div>
            <div className="text-xs text-gray-600">Total Locked Roles</div>
          </div>
          <div key="role-groups" className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-black">{LOCKED_PROFESSIONAL_ROLES.length}</div>
            <div className="text-xs text-gray-600">Role Groups</div>
          </div>
          <div key="existing-db" className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-black">{existingRoles.length}</div>
            <div className="text-xs text-gray-600">Existing in DB</div>
          </div>
          <div key="active-db" className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-black">
              {existingRoles.filter(r => r.is_active).length}
            </div>
            <div className="text-xs text-gray-600">Active in DB</div>
          </div>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`bg-white rounded-lg shadow p-6 border-2 ${
          syncResult.success ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            {syncResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-black mb-2">
                {syncResult.success ? 'Sync Completed Successfully' : 'Sync Completed with Errors'}
              </h3>
              <div className="space-y-2 text-sm">
                {syncResult.created > 0 && (
                  <div className="text-green-600">
                    ✅ Created {syncResult.created} new role{syncResult.created !== 1 ? 's' : ''}
                  </div>
                )}
                {syncResult.updated > 0 && (
                  <div className="text-blue-600">
                    🔄 Updated {syncResult.updated} existing role{syncResult.updated !== 1 ? 's' : ''}
                  </div>
                )}
                {syncResult.deactivated > 0 && (
                  <div className="text-orange-600">
                    ⚠️ Deactivated {syncResult.deactivated} unlocked role{syncResult.deactivated !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Errors */}
              {syncResult.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-700 mb-2">Errors:</h4>
                  <ul className="space-y-1">
                    {syncResult.errors.map((error, index) => (
                      <li key={index} className="text-xs text-red-600">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Locked Roles Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-black mb-4">Locked Roles (Source of Truth)</h3>
        <div className="space-y-6">
          {LOCKED_PROFESSIONAL_ROLES.map((group, groupIndex) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{group.emoji}</span>
                <h4 className="font-semibold text-black">{group.name}</h4>
                <span className="text-xs text-gray-500">({group.roles.length} roles)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {group.roles.map((roleName, roleIndex) => {
                  const displayOrder = getRoleDisplayOrder(roleName);
                  const existingRole = existingRoles.find(r => r.name === roleName);
                  
                  return (
                    <div
                      key={roleName}
                      className={`px-3 py-2 rounded-lg border-2 text-sm ${
                        existingRole
                          ? existingRole.is_active
                            ? 'bg-green-50 border-green-200'
                            : 'bg-orange-50 border-orange-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="font-medium text-black">{roleName}</div>
                      <div className="text-xs text-gray-500">
                        {existingRole
                          ? existingRole.is_active
                            ? `✅ Active (${displayOrder})`
                            : '⚠️ Inactive'
                          : `🆕 New (${displayOrder})`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Roles in Database */}
      {existingRoles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-black mb-4">Current Database Roles</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {existingRoles.map((role) => {
              const isLocked = ALL_VALID_ROLE_NAMES.includes(role.name);
              
              return (
                <div
                  key={role.id}
                  className={`px-3 py-2 rounded-lg border-2 text-sm ${
                    !isLocked
                      ? 'bg-red-50 border-red-200'
                      : role.is_active
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="font-medium text-black">{role.name}</div>
                  <div className="text-xs text-gray-500">
                    {!isLocked ? '🗑️ Will be deactivated' : 
                     role.is_active ? `Active (${role.display_order})` : 
                     '⚠️ Inactive'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-black mb-2">ℹ️ How it works</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li key="step-1"><strong>1. Load Current:</strong> View existing roles in database</li>
          <li key="step-2"><strong>2. Sync to Database:</strong> This will:
            <ul className="ml-6 mt-1 space-y-1 list-disc">
              <li key="sync-1">Create new roles from locked list (if not exist)</li>
              <li key="sync-2">Update display_order for existing roles</li>
              <li key="sync-3">Mark all locked roles as active</li>
              <li key="sync-4">Deactivate any roles NOT in locked list</li>
            </ul>
          </li>
          <li key="step-3"><strong>3. Color Coding:</strong>
            <ul className="ml-6 mt-1 space-y-1 list-disc">
              <li key="color-1" className="text-green-600">✅ Green = Already exists and active</li>
              <li key="color-2" className="text-blue-600">🆕 Blue = Will be created</li>
              <li key="color-3" className="text-orange-600">⚠️ Orange = Exists but inactive</li>
              <li key="color-4" className="text-red-600">🗑️ Red = Will be deactivated (not in locked list)</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}