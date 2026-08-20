import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const VERCEL_API_TOKEN = import.meta.env.VITE_VERCEL_API_TOKEN || import.meta.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = import.meta.env.VITE_VERCEL_PROJECT_ID || import.meta.env.VERCEL_PROJECT_ID;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface AnalyticsData {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  topPages: Array<{ path: string; visitors: number }>;
  referrers: Array<{ referrer: string; visitors: number }>;
  countries: Array<{ country: string; visitors: number; percentage: number }>;
  devices: Array<{ device: string; visitors: number; percentage: number }>;
  operatingSystems: Array<{ os: string; visitors: number; percentage: number }>;
  lastUpdated: number;
}

export async function getVercelAnalytics(): Promise<AnalyticsData | null> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    console.error('Vercel API credentials not configured');
    return null;
  }

  // Check cache first
  try {
    const cacheDoc = await getDoc(doc(db, 'analytics-cache', 'vercel'));
    if (cacheDoc.exists()) {
      const cached = cacheDoc.data() as AnalyticsData;
      const now = Date.now();
      if (now - cached.lastUpdated < CACHE_DURATION) {
        console.log('Using cached analytics data');
        return cached;
      }
    }
  } catch (error) {
    console.error('Error checking cache:', error);
  }

  // Fetch fresh data from Vercel API
  try {
    const response = await fetch(
      `https://api.vercel.com/v1/analytics/${VERCEL_PROJECT_ID}/dashboard`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform data to our format
    const analyticsData: AnalyticsData = {
      visitors: data.visitors || 0,
      pageViews: data.pageViews || 0,
      bounceRate: data.bounceRate || 0,
      topPages: data.topPages || [],
      referrers: data.referrers || [],
      countries: data.countries || [],
      devices: data.devices || [],
      operatingSystems: data.operatingSystems || [],
      lastUpdated: Date.now(),
    };

    // Save to cache
    try {
      await setDoc(doc(db, 'analytics-cache', 'vercel'), analyticsData);
      console.log('Analytics data cached successfully');
    } catch (cacheError) {
      console.error('Error caching analytics data:', cacheError);
    }

    return analyticsData;
  } catch (error) {
    console.error('Error fetching Vercel Analytics:', error);
    
    // Return cached data if available (even if expired)
    try {
      const cacheDoc = await getDoc(doc(db, 'analytics-cache', 'vercel'));
      if (cacheDoc.exists()) {
        return cacheDoc.data() as AnalyticsData;
      }
    } catch (e) {
      console.error('Error fetching fallback cache:', e);
    }

    return null;
  }
}
