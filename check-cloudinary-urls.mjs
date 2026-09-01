import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBdWKqik66fis2Bs4rdjM8YZkdCOoqLuqM',
  authDomain: 'hawainn-khabaru.firebaseapp.com',
  projectId: 'hawainn-khabaru',
  storageBucket: 'hawainn-khabaru.firebasestorage.app',
  messagingSenderId: '623605252027',
  appId: '1:623605252027:web:41035193d2062fc6f14e9e',
  measurementId: 'G-ED3QC22TWG'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCloudinaryUrls() {
  console.log('Fetching articles to check Cloudinary URL format...\n');
  
  try {
    const articlesSnapshot = await getDocs(collection(db, 'articles'));
    const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('Sample Cloudinary URLs from articles:\n');
    
    let count = 0;
    for (const article of articles) {
      const imageUrl = article.image;
      
      if (imageUrl && imageUrl.includes('cloudinary.com')) {
        console.log(`Article ID: ${article.id}`);
        console.log(`URL: ${imageUrl}`);
        console.log('');
        count++;
        
        if (count >= 10) break;
      }
    }
    
    console.log(`\nTotal articles with Cloudinary URLs: ${articles.filter(a => a.image && a.image.includes('cloudinary.com')).length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCloudinaryUrls();
