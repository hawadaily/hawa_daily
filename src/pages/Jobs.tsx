import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import JobSlider from '../components/JobSlider';
import ResortsGrid from '../components/ResortsGrid';
import { getCompanyLogo } from '../data/companyLogos';
import companyLogos from '../data/companyLogos';
import { fallbackJobs } from '../data/fallbackJobs';

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

const getRelativeTime = (dateString: string) => {
  if (!dateString) return 'Recently';
  
  const now = new Date();
  const date = new Date(dateString);
  
  // If date is invalid, try to use fetchedAt as fallback
  if (isNaN(date.getTime())) {
    return 'Recently';
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'Just posted';
  if (diffMins < 1) return 'Just posted';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resortFilter, setResortFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [jobCount, setJobCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Filter jobs based on resort and position
  const filteredJobs = jobs.filter(job => {
    const matchesResort = !resortFilter || job.company.toLowerCase().includes(resortFilter.toLowerCase());
    const matchesPosition = !positionFilter || job.title.toLowerCase().includes(positionFilter.toLowerCase());
    return matchesResort && matchesPosition;
  });

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      let jobsData: Job[] = [...fallbackJobs] as Job[];
      let jobsCount = fallbackJobs.length;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api/jobs';
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          jobsData = data.jobs;
          jobsCount = data.count || data.jobs.length;
        }
      } catch (err) {
        console.warn('Jobs API unavailable, using built-in fallback', err);
      }

      if (jobsData.length > 0) {
        setJobs(jobsData);
        setJobCount(jobsCount || jobsData.length);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      } else {
        setError('No jobs available right now');
      }

      setLoading(false);
    };

    fetchJobs();

    const interval = setInterval(() => {
      fetchJobs();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      let jobsData: Job[] = [...fallbackJobs] as Job[];
      let jobsCount = fallbackJobs.length;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api/jobs';
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          jobsData = data.jobs;
          jobsCount = data.count || data.jobs.length;
        }
      } catch (err) {
        console.warn('Jobs API unavailable, using built-in fallback', err);
      }

      if (jobsData.length > 0) {
        setJobs(jobsData);
        setJobCount(jobsCount || jobsData.length);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      } else {
        setError('No jobs available right now');
      }

      setLoading(false);
    };

    fetchJobs();
  };

  return (
    <motion.section
      className="pt-24 text-left bg-white min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir="ltr"
    >
      {/* Sticky Header */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b-2 border-[#0077b6] pb-4 mb-6 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#0077b6] font-bold">Jobs</p>
            <h2 className="mt-1 text-3xl font-extrabold text-[#0077b6]">Maldives Jobs</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[#0077b6] bg-[#0077b6] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#005f73] disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Featured Job Slider */}
        {!loading && jobs.length > 0 && (
          <JobSlider jobs={jobs.slice(0, 5)} onViewDetails={(job) => setSelectedJob(job)} />
        )}
      </div>

      {/* Main Content - Full Width */}
      <div className="space-y-6">
          {/* Sticky Search and Filter Bar */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 z-30 border-b border-sky-100 rounded-xl mb-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search resort..."
                  value={resortFilter}
                  onChange={(e) => setResortFilter(e.target.value)}
                  className="w-full rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search position..."
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="w-full rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              {(resortFilter || positionFilter) && (
                <button
                  onClick={() => {
                    setResortFilter('');
                    setPositionFilter('');
                  }}
                  className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-700 transition hover:bg-sky-100"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-sky-200 bg-white/50 p-12 text-center">
              <p className="text-slate-500">
                {(resortFilter || positionFilter) ? 'No jobs match your filters' : 'No jobs available'}
              </p>
            </div>
          )}
      </div>

      {/* Resorts Grid - Outside scrollable area */}
      <ResortsGrid />

      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full bg-gradient-to-br from-white to-sky-50 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modern Job Detail Modal */}
              <div className="p-8 relative overflow-hidden">
                {/* SVG Illustration Background */}
                <div className="absolute right-0 top-0 w-48 h-48 opacity-5">
                  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" fill="currentColor" className="text-sky-600"/>
                    <path d="M100 20 L120 80 L180 80 L130 120 L150 180 L100 140 L50 180 L70 120 L20 80 L80 80 Z" fill="currentColor" className="text-blue-600"/>
                  </svg>
                </div>
                
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 to-blue-400"></div>
                
                {/* Header with Logo */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-block bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Job Opportunity
                    </div>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="text-slate-400 hover:text-slate-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    {getCompanyLogo(selectedJob.company) && (
                      <img 
                        src={getCompanyLogo(selectedJob.company)} 
                        alt={selectedJob.company}
                        className="w-16 h-16 object-contain bg-white rounded-xl p-2 shadow-sm border border-sky-100"
                      />
                    )}
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-1">{selectedJob.company}</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-sky-400 to-blue-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Job Title */}
                <div className="bg-white rounded-xl p-6 mb-6 border border-sky-100 shadow-sm">
                  <h3 className="text-xl font-bold text-sky-600">{selectedJob.title}</h3>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Company</p>
                    <p className="font-semibold text-slate-700">{selectedJob.company}</p>
                  </div>
                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Posted</p>
                    <p className="font-semibold text-slate-700">{getRelativeTime(selectedJob.postedDate || selectedJob.fetchedAt)}</p>
                  </div>
                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-100 md:col-span-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contact Email</p>
                    <p className="font-semibold text-slate-700">careers@{selectedJob.company.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>

                {/* In-app detail notice */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-6 py-3 text-sm text-slate-600">
                    <span>Details are shown here on Hawa Daily</span>
                  </div>
                </div>

                {/* Powered by Footer */}
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-sky-100">
                  <img 
                    src="/HAWA LOGO.jpg" 
                    alt="HAWA Daily"
                    className="h-8 w-auto object-contain"
                  />
                  <span className="text-sm text-slate-500">Powered by</span>
                  <span className="text-sm font-semibold text-sky-600">Hawa Daily (ހަވާ ހުވާ)</span>
                </div>
              </div>

              {/* Share buttons */}
              <div className="bg-white p-4 flex justify-between items-center border-t border-sky-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = `Job Opportunity at ${selectedJob.company}: ${selectedJob.title}. Details are available on Hawa Daily.`;
                      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                      window.open(url, '_blank');
                    }}
                    className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      const text = `Job Opportunity at ${selectedJob.company}: ${selectedJob.title}. Details are available on Hawa Daily.`;
                      const url = `viber://forward?text=${encodeURIComponent(text)}`;
                      window.location.href = url;
                    }}
                    className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-600 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.398.002C9.473.028 7.574.344 5.78 1.012 2.006 2.448 0 5.758 0 9.375c0 1.926.578 3.746 1.574 5.26l-.6 3.365 3.46-.578c1.454.79 3.083 1.231 4.806 1.231.028 0 .055 0 .083-.001 6.336-.045 11.47-5.213 11.47-11.577 0-3.092-1.197-5.994-3.367-8.165C15.698 1.197 13.595.002 11.398.002zm6.06 15.608c-.295.828-1.447 1.516-2.005 1.607-.513.084-1.16.12-3.31-.713-.976-.358-2.006-1.06-2.78-1.865-.78-.81-1.38-1.8-1.54-2.85-.16-1.05.42-1.5.71-1.8.29-.3.63-.37.84-.37.21 0 .42 0 .6.01.19.01.45.09.69.54.24.45.84 2.06.91 2.21.07.15.12.33.02.52-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.31.32-.13.63.18.31.8 1.32 1.72 2.13.92.81 1.91 1.26 2.22 1.41.31.15.49.13.67-.08.18-.21.77-.77.96-1.31.19-.54.19-1 .13-1.1-.06-.1-.21-.15-.42-.21z"/>
                    </svg>
                    Viber
                  </button>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
