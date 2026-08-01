import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCompanyLogo } from '../data/companyLogos';

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  postedDate?: string;
}

export default function JobsPromoSlide() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api/jobs';
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();
        
        if (data.success && data.jobs.length > 0) {
          setJobs(data.jobs.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching jobs for promo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    
    const interval = setInterval(fetchJobs, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance slides (show 2 jobs at a time, so increment by 2)
  useEffect(() => {
    if (isPaused || jobs.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 2) % jobs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [jobs.length, isPaused]);

  if (loading || jobs.length === 0) return null;

  const currentJobs = [
    jobs[currentIndex],
    jobs[currentIndex + 1] || jobs[0]
  ];

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
    <Link to="/jobs" className="block">
      <motion.div 
        className="relative w-full h-32 md:h-40 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        dir="ltr"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center px-4 md:px-8 text-left"
          >
            <div className="flex items-center gap-6 w-full">
              {currentJobs.map((job, idx) => {
                const companyLogo = getCompanyLogo(job.company);
                return (
                  <div key={`${job.id}-${idx}`} className="flex items-center gap-3 flex-1">
                    {companyLogo && (
                      <div className="flex-shrink-0">
                        <img 
                          src={companyLogo} 
                          alt={job.company}
                          className="w-12 h-12 md:w-14 md:h-14 object-contain bg-white rounded-lg p-1.5 shadow-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 text-white">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded-full">
                          New Job
                        </span>
                        <span className="text-[9px] md:text-[10px] text-emerald-100">
                          {getRelativeTime(job.postedDate)}
                        </span>
                      </div>
                      <h3 className="text-xs md:text-base font-bold mb-0.5 line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-emerald-100">
                        {job.company}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: Math.ceil(jobs.length / 2) }).map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(index * 2);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                Math.floor(currentIndex / 2) === index ? 'bg-white w-4' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow navigation */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setCurrentIndex((prev) => (prev - 2 + jobs.length) % jobs.length);
          }}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setCurrentIndex((prev) => (prev + 2) % jobs.length);
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
          aria-label="Next slide"
        >
          →
        </button>
      </motion.div>
    </Link>
  );
}
