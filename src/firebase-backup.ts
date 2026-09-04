import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBJJm90lDcgjxmgXsWpGE0lIVNSK6VFGa0',
  authDomain: 'hawa-daily-v2.firebaseapp.com',
  projectId: 'hawa-daily-v2',
  storageBucket: 'hawa-daily-v2.firebasestorage.app',
  messagingSenderId: '142164818850',
  appId: '1:142164818850:web:f45b05791880d66cf690fb',
  measurementId: 'G-1TSRYXFSGX'
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
