import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

// Load Quran data
const quranPath = path.join(__dirname, 'src/data/quran-full.json');
const quranData = JSON.parse(fs.readFileSync(quranPath, 'utf8'));

async function uploadQuranToFirebase() {
  console.log('Starting Quran data upload to Firebase...');
  
  try {
    const batch = db.batch();
    const quranCollection = db.collection('quran');
    
    quranData.forEach((surah) => {
      const docRef = quranCollection.doc(`surah-${surah.number}`);
      batch.set(docRef, {
        number: surah.number,
        nameArabic: surah.nameArabic,
        nameEnglish: surah.nameEnglish,
        pdfUrl: surah.pdfUrl,
        verses: surah.verses
      });
    });
    
    await batch.commit();
    console.log(`Successfully uploaded ${quranData.length} surahs to Firebase Firestore`);
  } catch (error) {
    console.error('Error uploading Quran data:', error);
    throw error;
  }
}

uploadQuranToFirebase()
  .then(() => {
    console.log('Upload completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Upload failed:', error);
    process.exit(1);
  });
