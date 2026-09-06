import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD4FruTSHhZsnxFcuRcxM9piBlqYRdJ3CQ",
  authDomain: "hawadaily-real-story.firebaseapp.com",
  projectId: "hawadaily-real-story",
  storageBucket: "hawadaily-real-story.firebasestorage.app",
  messagingSenderId: "485369903805",
  appId: "1:485369903805:web:91354f17221659613f15d4",
  measurementId: "G-V6LGC26DK9"
};

// Initialize Firebase
const app = !getApps().find(app => app.name === 'real-story') ? initializeApp(firebaseConfig, 'real-story') : getApp('real-story');
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
