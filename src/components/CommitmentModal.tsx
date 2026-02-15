import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, Check } from 'lucide-react';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  taskPrice?: number;
}

export function CommitmentModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  taskPrice,
}: CommitmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Task Commitment">
      <div className="space-y-4 p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-2">
                You're agreeing to:
              </p>
              <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
                <li>Complete the task: <strong>{taskTitle}</strong></li>
                {taskPrice && (
                  <li>
                    Agreed price: <strong>₹{taskPrice.toLocaleString('en-IN')}</strong>
                  </li>
                )}
                <li>Payment will be handled directly between you and the task creator</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
          <p className="font-medium mb-1">⚠️ Important</p>
          <p>
            LocalFelo does not handle payments. Make sure you've discussed all
            terms in chat before proceeding.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: '#CDFF00', color: '#000000' }}
          >
            <Check className="w-4 h-4" />
            Agree & Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
