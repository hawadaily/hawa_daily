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
  description?: string; // Optional description
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
    'from-[#caf0f8] to-[#90e0ef]',
    'from-[#caf0f8] to-[#00b4d8]',
    'from-[#90e0ef] to-[#00b4d8]',
    'from-[#caf0f8] to-[#0077b6]',
    'from-[#90e0ef] to-[#0077b6]',
  ];
  const colorIndex = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  // Select a storyset illustration based on job id
  const illustrations = [
    '/storyset/Job hunt-amico.svg',
    '/storyset/Job offers-amico.svg',
    '/storyset/Job offers-bro.svg',
    '/storyset/Job offers-pana.svg',
    '/storyset/Job offers-rafiki.svg',
    '/storyset/At work-bro.svg',
    '/storyset/At work-rafiki.svg',
    '/storyset/Online resume-cuate.svg',
    '/storyset/Online resume-pana.svg',
    '/storyset/Portfolio-cuate.svg',
    '/storyset/Profile data-cuate.svg',
    '/storyset/Profiling-amico.svg',
    '/storyset/Resume-amico.svg',
    '/storyset/Resume folder-cuate.svg',
    '/storyset/Certification-bro.svg',
    '/storyset/Certification-cuate.svg',
    '/storyset/Recommendation letter-cuate.svg',
  ];
  const illustrationIndex = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % illustrations.length;
  const illustration = illustrations[illustrationIndex];

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-2xl border border-[#90e0ef] bg-gradient-to-br ${bgColor} backdrop-blur-sm shadow-lg cursor-pointer`}
      onClick={onClick}
      dir="ltr"
    >
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8]/5 to-[#0077b6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Storyset Illustration Background */}
      <div className="absolute right-0 top-0 w-48 h-48 opacity-40 group-hover:opacity-50 transition-opacity">
        <img 
          src={illustration} 
          alt="Job illustration"
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="relative p-10">
        <div className="space-y-8">
          {/* Header with logo and time */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {companyLogo && (
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b4d8]/20 to-[#0077b6]/20 rounded-xl blur-sm" />
                  <img 
                    src={companyLogo} 
                    alt={job.company}
                    className="relative w-14 h-14 object-contain flex-shrink-0 rounded-xl bg-white p-2 border border-[#90e0ef] shadow-sm"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-lg font-bold text-[#0077b6] transition group-hover:text-[#00b4d8] line-clamp-2 leading-tight text-left">
                  {job.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#0077b6] font-medium text-left">{job.company}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {relativeTime}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#0077b6] line-clamp-2 text-left">
            {job.description || 'No description available'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#90e0ef]">
            <div className="flex items-center gap-2 text-xs text-[#00b4d8]">
              <span className="font-medium">{job.source}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0077b6]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>View details</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
