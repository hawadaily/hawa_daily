import { motion } from 'framer-motion';
import { getCompanyLogo } from '../data/companyLogos';

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  postedTime: string;
  source: string;
  fetchedAt: string;
  postedDate?: string; // Added for actual posted date
}

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

const getRelativeTime = (dateString: string) => {
  if (!dateString) return 'Recently';
  
  const now = new Date();
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Recently';
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'Just posted';
  if (diffMins < 1) return 'Just posted';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
};

export default function JobCard({ job, onClick }: JobCardProps) {
  const companyLogo = getCompanyLogo(job.company);
  const relativeTime = getRelativeTime(job.postedDate || job.fetchedAt);
  
  // Generate a consistent color based on job id
  const colors = [
    'from-slate-900 to-slate-800',
    'from-sky-900 to-sky-800',
    'from-blue-900 to-blue-800',
    'from-indigo-900 to-indigo-800',
    'from-violet-900 to-violet-800',
  ];
  const colorIndex = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br ${bgColor} backdrop-blur-sm shadow-xl cursor-pointer`}
      onClick={onClick}
      dir="ltr"
    >
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        <div className="space-y-4">
          {/* Header with logo and time */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {companyLogo && (
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-xl blur-sm" />
                  <img 
                    src={companyLogo} 
                    alt={job.company}
                    className="relative w-14 h-14 object-contain flex-shrink-0 rounded-xl bg-white p-2 border border-slate-200"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-lg font-bold text-slate-100 transition group-hover:text-sky-400 line-clamp-2 leading-tight text-left">
                  {job.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400 font-medium text-left">{job.company}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-600/20 to-blue-600/20 border border-sky-500/30 text-xs font-semibold uppercase tracking-wider text-sky-400">
                {relativeTime}
              </span>
            </div>
          </div>
          
          {/* Footer with CTA */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-700/50 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 group-hover:text-sky-300 transition text-left">
              <span className="text-left">View Details</span>
              <motion.span 
                className="transform group-hover:translate-x-1 transition-transform"
                animate={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                →
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
