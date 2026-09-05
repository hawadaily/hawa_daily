import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdWKqik66fis2Bs4rdjM8YZkdCOoqLuqM",
  authDomain: "hawainn-khabaru.firebaseapp.com",
  projectId: "hawainn-khabaru",
  storageBucket: "hawainn-khabaru.firebasestorage.app",
  messagingSenderId: "623605252027",
  appId: "1:623605252027:web:41035193d2062fc6f14e9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Slug generation function
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Add slugs to existing stories
async function addSlugsToStories() {
  console.log('Adding slugs to stories...');
  
  const storiesSnapshot = await getDocs(collection(db, 'stories'));
  let updated = 0;
  let skipped = 0;
  
  for (const storyDoc of storiesSnapshot.docs) {
    const story = storyDoc.data();
    
    if (story.slug) {
      skipped++;
      continue;
    }
    
    const slug = generateSlug(story.title);
    await updateDoc(doc(db, 'stories', storyDoc.id), { slug });
    console.log(`Updated story "${story.title}" with slug: ${slug}`);
    updated++;
  }
  
  console.log(`Stories: ${updated} updated, ${skipped} skipped (already had slug)`);
}

// Add slugs to existing golden-time articles
async function addSlugsToGoldenTime() {
  console.log('Adding slugs to golden-time articles...');
  
  const goldenTimeSnapshot = await getDocs(collection(db, 'golden-time'));
  let updated = 0;
  let skipped = 0;
  
  for (const articleDoc of goldenTimeSnapshot.docs) {
    const article = articleDoc.data();
    
    if (article.slug) {
      skipped++;
      continue;
    }
    
    const slug = generateSlug(article.title);
    await updateDoc(doc(db, 'golden-time', articleDoc.id), { slug });
    console.log(`Updated golden-time article "${article.title}" with slug: ${slug}`);
    updated++;
  }
  
  console.log(`Golden Time: ${updated} updated, ${skipped} skipped (already had slug)`);
}

// Run migration
async function runMigration() {
  try {
    await addSlugsToStories();
    await addSlugsToGoldenTime();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
