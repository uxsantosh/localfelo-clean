import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertCircle, MessageCircle, DollarSign, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'task' | 'wish';
  itemId: string;
  reportedUserId: string;
  reportedUserName: string;
  onSubmit: (issueType: string, details: string) => Promise<void>;
}

export function ReportModal({
  isOpen,
  onClose,
  itemType,
  itemId,
  reportedUserId,
  reportedUserName,
  onSubmit,
}: ReportModalProps) {
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    {
      id: 'payment',
      label: 'Payment issue',
      icon: DollarSign,
      description: 'Payment not received or dispute',
    },
    {
      id: 'harassment',
      label: 'Harassment / Threat',
      icon: AlertCircle,
      description: 'Inappropriate behavior or threats',
    },
    {
      id: 'no_response',
      label: 'User not responding',
      icon: UserX,
      description: 'No response after acceptance',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedIssue) {
      toast.error('Please select an issue type');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(selectedIssue, details);
      toast.success('Report submitted successfully. Our team will review it.');
      setSelectedIssue('');
      setDetails('');
      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Issue">
      <div className="space-y-4 p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
          <p className="font-medium mb-1">Reporting {reportedUserName}</p>
          <p className="text-xs">
            False reports may result in action against your account.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">
            What's the issue?
          </label>
          <div className="space-y-2">
            {issueTypes.map((issue) => {
              const Icon = issue.icon;
              return (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedIssue === issue.id
                      ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`w-5 h-5 mt-0.5 ${
                        selectedIssue === issue.id
                          ? 'text-black'
                          : 'text-gray-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`font-medium text-sm ${
                          selectedIssue === issue.id
                            ? 'text-black'
                            : 'text-gray-900'
                        }`}
                      >
                        {issue.label}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">
            Additional details (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Provide any additional information..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CDFF00]/20 focus:border-[#CDFF00] min-h-[80px]"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedIssue}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </Modal>
  );
}