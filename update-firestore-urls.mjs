import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
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

// Load ImgBB URL mapping
const imgbbUrlsFile = path.join(__dirname, 'src', 'data', 'imgbb-uploaded-urls.json');
const imgbbUrls = JSON.parse(fs.readFileSync(imgbbUrlsFile, 'utf8'));

// Create a mapping from filename to ImgBB URL
const filenameToUrl = {};
imgbbUrls.forEach(item => {
  filenameToUrl[item.fileName] = item.url;
});

// Extract filename from Cloudinary URL
function extractFilenameFromCloudinaryUrl(url) {
  if (!url) return null;
  
  // Cloudinary URLs typically have format: https://res.cloudinary.com/.../v1234567890/filename.ext
  // or: https://res.cloudinary.com/.../image/upload/filename.ext
  try {
    const urlParts = url.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    
    // Remove any transformation parameters (e.g., filename_abc123.jpg)
    const filename = filenameWithExt.split('.')[0];
    
    // Handle special characters and spaces
    return filename;
  } catch (error) {
    console.error('Error extracting filename:', error);
    return null;
  }
}

// Check if URL is a Cloudinary URL
function isCloudinaryUrl(url) {
  return url && url.includes('cloudinary.com');
}

async function updateArticles() {
  console.log('Fetching articles from Firestore...');
  
  try {
    const articlesSnapshot = await getDocs(collection(db, 'articles'));
    const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${articles.length} articles`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const article of articles) {
      const imageUrl = article.image;
      
      if (!imageUrl || !isCloudinaryUrl(imageUrl)) {
        skippedCount++;
        continue;
      }
      
      const filename = extractFilenameFromCloudinaryUrl(imageUrl);
      
      if (!filename) {
        console.log(`Could not extract filename from: ${imageUrl}`);
        skippedCount++;
        continue;
      }
      
      // Try to find matching ImgBB URL
      let newUrl = filenameToUrl[filename];
      
      // If not found directly, try with common variations
      if (!newUrl) {
        const variations = [
          `${filename}.jpg`,
          `${filename}.png`,
          `${filename}.jpeg`,
          `${filename}.webp`
        ];
        
        for (const variation of variations) {
          if (filenameToUrl[variation]) {
            newUrl = filenameToUrl[variation];
            break;
          }
        }
      }
      
      if (!newUrl) {
        console.log(`No ImgBB URL found for: ${filename}`);
        skippedCount++;
        continue;
      }
      
      // Update the article
      try {
        await updateDoc(doc(db, 'articles', article.id), {
          image: newUrl
        });
        console.log(`✓ Updated article ${article.id}: ${filename}`);
        updatedCount++;
      } catch (error) {
        console.error(`✗ Failed to update article ${article.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Error updating articles:', error);
  }
}

updateArticles();
