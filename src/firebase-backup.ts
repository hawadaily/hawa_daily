import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBdWKqik66fis2Bs4rdjM8YZkdCOoqLuqM',
  authDomain: 'hawainn-khabaru.firebaseapp.com',
  projectId: 'hawainn-khabaru',
  storageBucket: 'hawainn-khabaru.firebasestorage.app',
  messagingSenderId: '623605252027',
  appId: '1:623605252027:web:41035193d2062fc6f14e9e',
  measurementId: 'G-ED3QC22TWG'
};

const app = initializeApp(firebaseConfig, 'backup');

// Initialize analytics only in production and when supported
let analytics = null;
if (typeof window !== 'undefined' && 'measurementId' in firebaseConfig) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Backup analytics initialization failed:', error);
  }
}

export const authBackup = getAuth(app);
export const dbBackup = getFirestore(app);
