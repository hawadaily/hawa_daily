import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCompanyLogo } from '../data/companyLogos';

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  postedTime: string;
  source: string;
  fetchedAt: string;
  postedDate?: string;
}

interface JobSliderProps {
  jobs: Job[];
  onViewDetails?: (job: Job) => void;
}

export default function JobSlider({ jobs, onViewDetails }: JobSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);

  // Update displayed jobs when jobs prop changes (real-time update)
  useEffect(() => {
    if (jobs.length > 0) {
      setDisplayedJobs(jobs.slice(0, 5));
      setCurrentIndex(0); // Reset to first slide when jobs update
    }
  }, [jobs]);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || displayedJobs.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayedJobs.length);
    }, 3000); // Faster auto-slide (3 seconds)

    return () => clearInterval(interval);
  }, [displayedJobs.length, isPaused]);

  if (displayedJobs.length === 0) return null;

  const currentJob = displayedJobs[currentIndex];
  const companyLogo = getCompanyLogo(currentJob.company);

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Recently';
    
    const now = new Date();
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Recently';
    
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="relative w-full h-28 md:h-36 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] rounded-xl overflow-hidden shadow-lg text-left"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir="ltr"
    >
      {/* SVG Illustration Background */}
      <div className="absolute right-0 top-0 w-40 h-40 opacity-10">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="currentColor" className="text-white"/>
          <path d="M100 20 L120 80 L180 80 L130 120 L150 180 L100 140 L50 180 L70 120 L20 80 L80 80 Z" fill="currentColor" className="text-white"/>
        </svg>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center px-4 md:px-8 cursor-pointer"
          onClick={() => onViewDetails?.(currentJob)}
        >
          <div className="flex items-center gap-4 w-full">
            {companyLogo && (
              <div className="flex-shrink-0">
                <img 
                  src={companyLogo} 
                  alt={currentJob.company}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain bg-white rounded-lg p-2 shadow-lg"
                />
              </div>
            )}
            <div className="flex-1 text-white">
              <p className="text-[10px] md:text-xs font-medium text-sky-100 mb-1">
                Featured Opportunity
              </p>
              <h3 className="text-sm md:text-lg font-bold mb-1 line-clamp-1">
                {currentJob.title}
              </h3>
              <p className="text-xs md:text-sm text-sky-50 mb-2">
                {currentJob.company}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  {getRelativeTime(currentJob.postedDate)}
                </span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewDetails?.(currentJob);
                  }}
                  className="text-[10px] md:text-xs bg-white text-sky-600 px-3 py-1 rounded-lg font-semibold hover:bg-sky-50 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {displayedJobs.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={(event) => {
          event.stopPropagation();
          setCurrentIndex((prev) => (prev - 1 + displayedJobs.length) % displayedJobs.length);
        }}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          setCurrentIndex((prev) => (prev + 1) % displayedJobs.length);
        }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  );
}
