import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  isCreator: boolean;
  otherPartyName: string;
  otherPartyCompleted: boolean;
  currentUserCompleted: boolean;
  loading?: boolean;
}

export function TaskCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isCreator,
  otherPartyName,
  otherPartyCompleted,
  currentUserCompleted,
  loading = false,
}: TaskCompletionModalProps) {
  if (!isOpen) return null;

  // If user already marked complete, show undo option
  if (currentUserCompleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white w-full max-w-md shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Task Completion Status</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[#CDFF00]/10 border border-[#CDFF00]">
              <CheckCircle className="w-5 h-5 text-[#CDFF00] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">You marked this task as complete</p>
                <p className="text-sm text-gray-600 mt-1">
                  Task: {taskTitle}
                </p>
              </div>
            </div>

            {otherPartyCompleted ? (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-green-800">
                    {otherPartyName} also confirmed completion
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Task is now marked as complete!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-amber-800">
                    Waiting for {otherPartyName}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    {otherPartyName} needs to confirm completion to complete this task.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-4 border-t border-gray-200">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gray-100 text-black hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Undoing...' : 'Undo My Completion'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show confirmation dialog
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Mark Task as Complete?</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Task:</p>
            <p className="font-medium">{taskTitle}</p>
          </div>

          {otherPartyCompleted ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-green-800">
                  {otherPartyName} already marked this complete
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Confirm to complete this task
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-blue-800">
                  Both parties must confirm
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {otherPartyName} will be notified to confirm completion
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            You can undo your confirmation before {otherPartyName} confirms.
          </p>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-gray-100 text-black hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Confirming...' : 'Yes, Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
