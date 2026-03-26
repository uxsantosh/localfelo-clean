// =====================================================
// Quick Job Buttons - Popular jobs for fast posting
// =====================================================

import { useState, useEffect } from 'react';
import { getPopularSuggestions, JobSuggestion } from '../services/jobSuggestions';
import { Sparkles } from 'lucide-react';

interface QuickJobButtonsProps {
  onSelectJob: (job: JobSuggestion) => void;
  maxButtons?: number;
}

export function QuickJobButtons({ onSelectJob, maxButtons = 8 }: QuickJobButtonsProps) {
  const [popularJobs, setPopularJobs] = useState<JobSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularJobs();
  }, []);

  const loadPopularJobs = async () => {
    setLoading(true);
    const jobs = await getPopularSuggestions(maxButtons);
    setPopularJobs(jobs);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (popularJobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Sparkles className="w-4 h-4 text-[#CDFF00]" />
        <span>Popular jobs</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {popularJobs.map((job, index) => (
          <button
            key={job.id || index}
            type="button"
            onClick={() => onSelectJob(job)}
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-900 hover:border-[#CDFF00] hover:bg-[#CDFF00]/5 transition-all active:scale-95"
          >
            {job.title}
          </button>
        ))}
      </div>
    </div>
  );
}
