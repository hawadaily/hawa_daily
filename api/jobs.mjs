import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

// In-memory cache for jobs data
let jobsCache = {
  data: null,
  timestamp: 0,
  ttl: 3600000, // 1 hour in milliseconds
};

const handleCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

export function loadFallbackJobs() {
  const fallbackJobs = [
    {
      id: 'senior-customer-service-officer-airport',
      title: 'Senior Customer Service Officer (Airport) / Customer Service Officer (Airport)',
      company: 'Unknown',
      url: 'https://jobsicle.mv/',
      postedTime: '2026-08-01T00:00:00.000Z',
      postedDate: '2026-08-01T00:00:00.000Z',
      source: 'jobsicle.mv',
      fetchedAt: new Date().toISOString(),
    },
    {
      id: 'executive-revenue-accounting',
      title: 'Executive Revenue Accounting',
      company: 'Ooredoo Maldives',
      url: 'https://jobsicle.mv/',
      postedTime: '2026-08-01T00:00:00.000Z',
      postedDate: '2026-08-01T00:00:00.000Z',
      source: 'jobsicle.mv',
      fetchedAt: new Date().toISOString(),
    },
    {
      id: 'customer-services-representative',
      title: 'Customer Services Representative',
      company: 'MAAHIYA PVT LTD',
      url: 'https://jobsicle.mv/',
      postedTime: '2026-08-01T00:00:00.000Z',
      postedDate: '2026-08-01T00:00:00.000Z',
      source: 'jobsicle.mv',
      fetchedAt: new Date().toISOString(),
    },
  ];

  try {
    const fallbackPath = path.resolve(process.cwd(), 'jobsicle_scraped_jobs.csv');
    if (fs.existsSync(fallbackPath)) {
      const csv = fs.readFileSync(fallbackPath, 'utf8');
      const rows = csv.trim().split(/\r?\n/).slice(1);
      const extraJobs = rows
        .filter(Boolean)
        .map((row) => {
          const [title, url] = row.split(',');
          if (!title || !url) return null;
          return {
            id: `${title}-${url}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            title: title.trim(),
            company: 'Unknown',
            url,
            postedTime: '2026-08-01T00:00:00.000Z',
            postedDate: '2026-08-01T00:00:00.000Z',
            source: 'jobsicle.mv',
            fetchedAt: new Date().toISOString(),
          };
        })
        .filter(Boolean);

      if (extraJobs.length) {
        return [...fallbackJobs, ...extraJobs];
      }
    }
  } catch (error) {
    console.warn('Fallback jobs file unavailable:', error);
  }

  return fallbackJobs;
}

async function fetchJobMaldives() {
  try {
    const jinaResponse = await fetch('https://r.jina.ai/http://www.job-maldives.com/');

    if (!jinaResponse.ok) {
      throw new Error(`Jina.ai request failed with status ${jinaResponse.status}`);
    }

    const markdown = await jinaResponse.text();
    const jobs = [];

    const jobRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/\d{4}\/\d{2}\/[^)]+)\)/gi;
    let match;

    while ((match = jobRegex.exec(markdown)) !== null) {
      const title = match[1].trim();
      const url = match[2];

      const companyMatch = title.match(/at\s+(.+?)\s*(?:Job|Vacancy|Jul|Jan|Feb|Mar|Apr|May|Jun|Aug|Sep|Oct|Nov|Dec|$)/i);
      const company = companyMatch ? companyMatch[1].trim() : 'Unknown';

      const dateMatch = title.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})/i);
      let postedDate = '';
      if (dateMatch) {
        const monthNames = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
        const month = monthNames[dateMatch[1]] || '01';
        const day = dateMatch[2].padStart(2, '0');
        const year = dateMatch[3];
        const dateString = `${year}-${month}-${day}`;
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj.getTime())) {
          postedDate = dateObj.toISOString();
        }
      }

      if (!postedDate) {
        const urlDateMatch = url.match(/\/(\d{4})\/(\d{2})\//);
        if (urlDateMatch) {
          const year = urlDateMatch[1];
          const month = urlDateMatch[2];
          const dateString = `${year}-${month}-01`;
          const dateObj = new Date(dateString);
          if (!isNaN(dateObj.getTime())) {
            postedDate = dateObj.toISOString();
          }
        }
      }

      const cleanTitle = title.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i, '').trim();

      jobs.push({
        id: url.split('/').pop()?.replace('.html', '') || Math.random().toString(36).slice(2, 11),
        title: cleanTitle,
        company,
        url: url.startsWith('http') ? url : `https://www.job-maldives.com${url}`,
        postedTime: postedDate,
        postedDate: postedDate,
        source: 'job-maldives.com',
        fetchedAt: new Date().toISOString(),
      });
    }

    return jobs;
  } catch (error) {
    console.error('Error fetching from job-maldives.com:', error);
    return [];
  }
}

async function fetchJobCenter() {
  try {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return [];
    }

    const pythonPath = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'scrape_jobcenter.py');

    const { stdout } = await execFileAsync(pythonPath, [scriptPath, '--pages', '3', '--limit', '20']);
    const result = JSON.parse(stdout.trim());

    if (!result.success || !Array.isArray(result.jobs)) {
      return [];
    }

    return result.jobs.map((job) => ({
      id: job.url?.split('/').pop() || Math.random().toString(36).slice(2, 11),
      title: job.title,
      company: job.company || 'Unknown',
      url: job.url || 'https://jobcenter.mv/',
      postedTime: job.postedDate || '',
      postedDate: job.postedDate || '',
      source: 'jobcenter.mv',
      fetchedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching from jobcenter.mv:', error);
    return [];
  }
}

async function fetchJobsicle() {
  try {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return loadFallbackJobs();
    }

    const pythonPath = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'scrape_jobsicle.py');

    const { stdout } = await execFileAsync(pythonPath, [scriptPath]);
    const result = JSON.parse(stdout.trim());

    if (!result.success || !Array.isArray(result.jobs)) {
      return loadFallbackJobs();
    }

    return result.jobs.map((job) => ({
      id: `${job.title}-${job.company || 'unknown'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || Math.random().toString(36).slice(2, 11),
      title: job.title,
      company: job.company || 'Unknown',
      url: job.url || 'https://jobsicle.mv/',
      postedTime: job.postedDate || '',
      postedDate: job.postedDate || '',
      source: 'jobsicle.mv',
      fetchedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching from jobsicle.mv:', error);
    return loadFallbackJobs();
  }
}

export function mergeJobs(jobMaldivesJobs = [], jobCenterJobs = [], jobsicleJobs = []) {
  const fallbackJobs = loadFallbackJobs();
  const allJobs = [...jobMaldivesJobs, ...jobCenterJobs, ...jobsicleJobs];
  const hasJobsicleContent = jobsicleJobs.some((job) => /Customer Service|Customer Services|Senior Customer Service|jobsicle/i.test(job.title || ''));

  const jobsToMerge = hasJobsicleContent ? allJobs : [...allJobs, ...fallbackJobs];
  const mergedJobs = Array.from(
    new Map(
      jobsToMerge.map((job) => [job.id || job.url || `${job.source}:${job.title}:${job.company}`, job])
    ).values()
  );

  mergedJobs.sort((a, b) => {
    const dateA = a.postedDate || a.postedTime || a.fetchedAt || '';
    const dateB = b.postedDate || b.postedTime || b.fetchedAt || '';
    const aTime = dateA ? new Date(dateA).getTime() : 0;
    const bTime = dateB ? new Date(dateB).getTime() : 0;

    if (aTime === bTime) {
      return (b.title || '').localeCompare(a.title || '');
    }

    return bTime - aTime;
  });

  return mergedJobs;
}

export default async function handler(req, res) {
  handleCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check cache first
    const now = Date.now();
    if (jobsCache.data && (now - jobsCache.timestamp) < jobsCache.ttl) {
      console.log('Using cached jobs data');
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json({
        success: true,
        jobs: jobsCache.data,
        count: jobsCache.data.length,
        cached: true,
      });
    }

    // In production (Vercel), use fallback data only
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      const fallbackJobs = loadFallbackJobs();
      jobsCache.data = fallbackJobs;
      jobsCache.timestamp = now;
      
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json({
        success: true,
        jobs: fallbackJobs,
        count: fallbackJobs.length,
      });
    }

    // Development: fetch from external sources
    const [jobMaldivesJobs, jobCenterJobs, jobsicleJobs] = await Promise.all([
      fetchJobMaldives(),
      fetchJobCenter(),
      fetchJobsicle(),
    ]);

    const mergedJobs = mergeJobs(jobMaldivesJobs, jobCenterJobs, jobsicleJobs);
    
    // Cache the result
    jobsCache.data = mergedJobs;
    jobsCache.timestamp = now;

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json({
      success: true,
      jobs: mergedJobs,
      count: mergedJobs.length,
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    // Fallback to cached data on error
    if (jobsCache.data) {
      return res.status(200).json({
        success: true,
        jobs: jobsCache.data,
        count: jobsCache.data.length,
        fallback: true,
      });
    }
    const fallbackJobs = loadFallbackJobs();
    const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
    return res.status(500).json({
      success: false,
      error: message,
      jobs: fallbackJobs,
    });
  }
}
