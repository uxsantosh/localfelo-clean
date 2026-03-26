import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download, Eye, RefreshCw, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';
import { getCurrentUser } from '../../services/auth';

interface VerificationDocument {
  id: string;
  professional_id: string;
  user_id: string;
  aadhar_card_url: string;
  photo_url: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reupload_requested';
  admin_notes?: string;
  // Joined data
  professional?: {
    id: string;
    name: string;
    title: string;
    whatsapp: string;
    city: string;
    verification_status?: string;
    is_blocked?: boolean;
  };
}

export function VerificationManagementTab() {
  const [verifications, setVerifications] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedVerification, setSelectedVerification] = useState<VerificationDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [actionModal, setActionModal] = useState<{
    verificationId: string;
    professionalId: string;
    action: 'approve' | 'reject' | 'reupload' | 'block' | 'unblock';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadVerifications();
  }, [filter]);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('professional_verification_documents')
        .select(`
          *,
          professional:professionals(
            id,
            name,
            title,
            whatsapp,
            city,
            verification_status,
            is_blocked
          )
        `)
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to handle the joined professional object
      const transformedData = (data || []).map(item => ({
        ...item,
        professional: Array.isArray(item.professional) ? item.professional[0] : item.professional
      }));

      setVerifications(transformedData as VerificationDocument[]);
    } catch (error) {
      console.error('Error loading verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: string, professionalId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Update verification document
      const { error: docError } = await supabase
        .from('professional_verification_documents')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', verificationId);

      if (docError) throw docError;

      // Update professional verification status
      const { error: profError } = await supabase
        .from('professionals')
        .update({
          verification_status: 'verified',
          verification_completed_at: new Date().toISOString(),
          verification_message: null,
        })
        .eq('id', professionalId);

      if (profError) throw profError;

      toast.success('Verification approved! Professional is now verified.');
      loadVerifications();
      setActionModal(null);
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error('Failed to approve verification');
    }
  };

  const handleReject = async (verificationId: string, professionalId: string, message: string) => {
    if (!message.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Update verification document
      const { error: docError } = await supabase
        .from('professional_verification_documents')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: message,
        })
        .eq('id', verificationId);

      if (docError) throw docError;

      // Update professional verification status
      const { error: profError } = await supabase
        .from('professionals')
        .update({
          verification_status: 'rejected',
          verification_completed_at: new Date().toISOString(),
          verification_message: message,
        })
        .eq('id', professionalId);

      if (profError) throw profError;

      toast.success('Verification rejected with reason.');
      loadVerifications();
      setActionModal(null);
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject verification');
    }
  };

  const handleRequestReupload = async (verificationId: string, professionalId: string, message: string) => {
    if (!message.trim()) {
      toast.error('Please provide instructions for reupload');
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Update verification document
      const { error: docError } = await supabase
        .from('professional_verification_documents')
        .update({
          status: 'reupload_requested',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: message,
        })
        .eq('id', verificationId);

      if (docError) throw docError;

      // Update professional verification status
      const { error: profError } = await supabase
        .from('professionals')
        .update({
          verification_status: 'reupload_requested',
          verification_message: message,
        })
        .eq('id', professionalId);

      if (profError) throw profError;

      toast.success('Reupload requested with instructions.');
      loadVerifications();
      setActionModal(null);
    } catch (error: any) {
      console.error('Reupload request error:', error);
      toast.error('Failed to request reupload');
    }
  };

  const handleBlockAccount = async (professionalId: string, isBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ is_blocked: isBlocked })
        .eq('id', professionalId);

      if (error) throw error;

      toast.success(`Account ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
      loadVerifications();
      setActionModal(null);
    } catch (error: any) {
      console.error('Block/unblock error:', error);
      toast.error(`Failed to ${isBlocked ? 'block' : 'unblock'} account`);
    }
  };

  const downloadDocument = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPendingCount = () => verifications.filter(v => v.status === 'pending').length;

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold text-black mt-1">
            {verifications.length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-700">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {getPendingCount()}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700">Approved</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {verifications.filter(v => v.status === 'approved').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700">Rejected</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {verifications.filter(v => v.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-[#CDFF00] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={loadVerifications}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Verifications List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Professional
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No verification requests found
                  </td>
                </tr>
              ) : (
                verifications.map((verification) => (
                  <tr key={verification.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div className="font-medium text-black">
                          {verification.professional?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {verification.professional?.title || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {verification.professional?.whatsapp || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {verification.professional?.city || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(verification.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium inline-block ${
                            verification.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : verification.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : verification.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {verification.status === 'pending' && '⏳ Pending'}
                          {verification.status === 'approved' && '✅ Approved'}
                          {verification.status === 'rejected' && '❌ Rejected'}
                          {verification.status === 'reupload_requested' && '🔄 Reupload'}
                        </span>
                        {verification.professional?.is_blocked && (
                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 inline-block">
                            🚫 Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* View Documents */}
                        <button
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowDocumentModal(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="View Documents"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>

                        {verification.status === 'pending' && (
                          <>
                            {/* Approve */}
                            <button
                              onClick={() => setActionModal({
                                verificationId: verification.id,
                                professionalId: verification.professional_id,
                                action: 'approve',
                                message: '',
                              })}
                              className="p-1.5 hover:bg-green-50 rounded transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>

                            {/* Reject */}
                            <button
                              onClick={() => setActionModal({
                                verificationId: verification.id,
                                professionalId: verification.professional_id,
                                action: 'reject',
                                message: '',
                              })}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </button>

                            {/* Request Reupload */}
                            <button
                              onClick={() => setActionModal({
                                verificationId: verification.id,
                                professionalId: verification.professional_id,
                                action: 'reupload',
                                message: '',
                              })}
                              className="p-1.5 hover:bg-orange-50 rounded transition-colors"
                              title="Request Reupload"
                            >
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            </button>
                          </>
                        )}

                        {/* Block/Unblock */}
                        <button
                          onClick={() => setActionModal({
                            verificationId: verification.id,
                            professionalId: verification.professional_id,
                            action: verification.professional?.is_blocked ? 'unblock' : 'block',
                            message: '',
                          })}
                          className={`p-1.5 rounded transition-colors ${
                            verification.professional?.is_blocked
                              ? 'hover:bg-green-50'
                              : 'hover:bg-red-50'
                          }`}
                          title={verification.professional?.is_blocked ? 'Unblock' : 'Block'}
                        >
                          {verification.professional?.is_blocked ? (
                            <Unlock className="w-4 h-4 text-green-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">Verification Documents</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedVerification.professional?.name}
                </p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Aadhar Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-black">Aadhar Card</h3>
                  <button
                    onClick={() => downloadDocument(selectedVerification.aadhar_card_url, 'aadhar-card.jpg')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <img
                  src={selectedVerification.aadhar_card_url}
                  alt="Aadhar Card"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>

              {/* Photo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-black">Photo</h3>
                  <button
                    onClick={() => downloadDocument(selectedVerification.photo_url, 'photo.jpg')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <img
                  src={selectedVerification.photo_url}
                  alt="Photo"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>

              {/* Admin Notes */}
              {selectedVerification.admin_notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-black mb-2">Admin Notes</h3>
                  <p className="text-sm text-gray-700">{selectedVerification.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              {actionModal.action === 'approve' && 'Approve Verification'}
              {actionModal.action === 'reject' && 'Reject Verification'}
              {actionModal.action === 'reupload' && 'Request Reupload'}
              {actionModal.action === 'block' && 'Block Account'}
              {actionModal.action === 'unblock' && 'Unblock Account'}
            </h2>

            {actionModal.action === 'approve' ? (
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to approve this verification? The professional will receive a verified badge.
              </p>
            ) : actionModal.action === 'block' || actionModal.action === 'unblock' ? (
              <p className="text-sm text-gray-600 mb-6">
                {actionModal.action === 'block'
                  ? 'Blocking this account will hide the professional from all listings. Continue?'
                  : 'Unblocking this account will restore visibility in all listings. Continue?'}
              </p>
            ) : (
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-semibold text-black">
                  {actionModal.action === 'reject' ? 'Rejection Reason' : 'Instructions for Reupload'}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionModal.message}
                  onChange={(e) => setActionModal({ ...actionModal, message: e.target.value })}
                  placeholder={actionModal.action === 'reject' 
                    ? 'Enter reason for rejection...'
                    : 'Enter instructions for what needs to be reuploaded...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
                  rows={4}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (actionModal.action === 'approve') {
                    handleApprove(actionModal.verificationId, actionModal.professionalId);
                  } else if (actionModal.action === 'reject') {
                    handleReject(actionModal.verificationId, actionModal.professionalId, actionModal.message);
                  } else if (actionModal.action === 'reupload') {
                    handleRequestReupload(actionModal.verificationId, actionModal.professionalId, actionModal.message);
                  } else if (actionModal.action === 'block') {
                    handleBlockAccount(actionModal.professionalId, true);
                  } else if (actionModal.action === 'unblock') {
                    handleBlockAccount(actionModal.professionalId, false);
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  actionModal.action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : actionModal.action === 'reject'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : actionModal.action === 'block'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : actionModal.action === 'unblock'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-[#CDFF00] text-black hover:bg-[#B8E600]'
                }`}
              >
                {actionModal.action === 'approve' && 'Approve'}
                {actionModal.action === 'reject' && 'Reject'}
                {actionModal.action === 'reupload' && 'Request Reupload'}
                {actionModal.action === 'block' && 'Block Account'}
                {actionModal.action === 'unblock' && 'Unblock Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
