import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { dbBackup } from './firebase-backup';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBdWKqik66fis2Bs4rdjM8YZkdCOoqLuqM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hawainn-khabaru.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hawainn-khabaru',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hawainn-khabaru.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '623605252027',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:623605252027:web:41035193d2062fc6f14e9e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ED3QC22TWG',
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
