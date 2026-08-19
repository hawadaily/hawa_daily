const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account-key.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

// Read the updated recipes file
const recipesPath = path.join(__dirname, 'src/data/lonumedhu-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

async function updateRecipeTitles() {
  console.log('Starting to update recipe titles in Firebase Firestore...');
  
  let updated = 0;
  let errors = 0;
  
  for (const recipe of recipes) {
    try {
      const recipeRef = db.collection('recipes').doc(recipe.id);
      await recipeRef.update({
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
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${recipes.length}`);
}

updateRecipeTitles().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
