import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { dbBackup } from './firebase-backup';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBJJm90lDcgjxmgXsWpGE0lIVNSK6VFGa0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hawa-daily-v2.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hawa-daily-v2',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hawa-daily-v2.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '142164818850',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:142164818850:web:f45b05791880d66cf690fb',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-1TSRYXFSGX',
};

const app = initializeApp(firebaseConfig);

// Initialize analytics only in production and when supported
let analytics = null;
if (typeof window !== 'undefined' && 'measurementId' in firebaseConfig) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Fallback database that switches to backup on quota errors
export const dbWithFallback = {
  primary: db,
  backup: dbBackup,
  useBackup: false,
  
  async writeOperation<T>(operation: (dbInstance: any) => Promise<T>): Promise<T> {
    const dbInstance = this.useBackup ? this.backup : this.primary;
    
    try {
      return await operation(dbInstance);
    } catch (error: any) {
      // Check if it's a quota exceeded error and we haven't already switched
      if (!this.useBackup && (error.code === 'resource-exhausted' || error.message?.includes('quota'))) {
        console.warn('Primary Firebase quota exceeded, switching to backup');
        this.useBackup = true;
        // Retry with backup database
        return await operation(this.backup);
      }
      throw error;
    }
  },
  
  reset() {
    this.useBackup = false;
  }
};

export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.secure_url;
}
