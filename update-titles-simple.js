// Copy this entire script and paste it in the browser console
// Make sure you're logged in to your app first

(async function updateRecipeTitles() {
  const { collection, doc, getDocs, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
  
  const firebaseConfig = {
    apiKey: 'AIzaSyBdWKqik66fis2Bs4rdjM8YZkdCOoqLuqM',
    authDomain: 'hawanews.firebaseapp.com',
    projectId: 'hawanews',
    storageBucket: 'hawanews.firebasestorage.app',
    messagingSenderId: '623605252027',
    appId: '1:623605252027:web:41035193d2062fc6f14e9e',
    measurementId: 'G-ED3QC22TWG'
  };
  
  const app = initializeApp(firebaseConfig);
  const db = collection(app, 'recipes');
  
  // First, fetch all recipes from Firestore
  console.log('Fetching recipes from Firestore...');
  const snapshot = await getDocs(db);
  const firestoreRecipes = {};
  snapshot.docs.forEach(doc => {
    firestoreRecipes[doc.id] = doc.data();
  });
  
  console.log(`Found ${snapshot.docs.length} recipes in Firestore`);
  
  // Now load the updated titles from the JSON file
  console.log('Loading updated titles from JSON...');
  const response = await fetch('/src/data/lonumedhu-recipes.json');
  const updatedRecipes = await response.json();
  
  console.log(`Loaded ${updatedRecipes.length} recipes from JSON`);
  
  let updated = 0;
  let errors = 0;
  let skipped = 0;
  
  console.log('Starting to update recipe titles...');
  
  for (const recipe of updatedRecipes) {
    if (!firestoreRecipes[recipe.id]) {
      console.log(`⊘ Skipping ${recipe.id} - not found in Firestore`);
      skipped++;
      continue;
    }
    
    const existing = firestoreRecipes[recipe.id];
    
    // Check if title actually changed
    if (existing.titleDv === recipe.titleDv && existing.titleEn === recipe.titleEn) {
      console.log(`⊘ Skipping ${recipe.id} - titles already match`);
      skipped++;
      continue;
    }
    
    try {
      const recipeRef = doc(db, recipe.id);
      await updateDoc(recipeRef, {
        titleDv: recipe.titleDv,
        titleEn: recipe.titleEn
      });
      console.log(`✓ Updated ${recipe.id}: ${recipe.titleEn}`);
      updated++;
    } catch (error) {
      console.error(`✗ Error updating ${recipe.id}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${updatedRecipes.length}`);
})();
