import React, { createContext, useContext, useEffect, useState } from 'react';

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  postedDate?: string;
  postedTime?: string;
  source?: string;
  fetchedAt?: string;
}

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use fallback jobs data from CSV
        const { fallbackJobs } = await import('../data/fallbackJobs');
        setJobs(fallbackJobs || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
        // Fallback to empty array
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchJobs();

    // Refresh jobs every 2 hours (instead of 2 minutes per component)
    const interval = setInterval(fetchJobs, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, loading, error }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
