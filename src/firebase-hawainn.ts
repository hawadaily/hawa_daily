import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBdWKqik66fis2Bs4rdjM8YZkdCOoqLuqM',
  authDomain: 'hawainn-khabaru.firebaseapp.com',
  projectId: 'hawainn-khabaru',
  storageBucket: 'hawainn-khabaru.firebasestorage.app',
  messagingSenderId: '623605252027',
  appId: '1:623605252027:web:41035193d2062fc6f14e9e',
  measurementId: 'G-ED3QC22TWG'
};

const app = initializeApp(firebaseConfig, 'hawainn-khabaru');
export const dbHawainn = getFirestore(app);
