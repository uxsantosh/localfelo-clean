import React from 'react';
import { Eye } from 'lucide-react';

interface HelperModeBadgeProps {
  onViewTasks: () => void;
  isMobile?: boolean;
}

export function HelperModeBadge({ onViewTasks, isMobile = false }: HelperModeBadgeProps) {
  return (
    <div className="bg-[#CDFF00] border-b border-[#b8e600] sticky top-0 left-0 right-0 z-[60] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
              </span>
              <span className="text-black font-bold text-sm">Helper mode active</span>
            </div>
          </div>

          {/* View Tasks Button */}
          <button
            onClick={onViewTasks}
            className="bg-black text-white px-3 py-1.5 rounded-md font-semibold text-xs hover:bg-gray-800 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View nearby tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
}