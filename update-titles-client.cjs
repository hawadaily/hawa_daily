const fs = require('fs');
const path = require('path');

// Load the recipes JSON
const recipesPath = path.join(__dirname, 'src/data/lonumedhu-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

// Generate a JavaScript file that can be run in the browser console
const updateScript = `
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
  
  const recipes = ${JSON.stringify(recipes)};
  
  let updated = 0;
  let errors = 0;
  
  console.log('Starting to update recipe titles...');
  
  for (const recipe of recipes) {
    try {
      const recipeRef = doc(db, recipe.id);
      await updateDoc(recipeRef, {
        titleDv: recipe.titleDv,
        titleEn: recipe.titleEn
      });
      console.log(\`✓ Updated \${recipe.id}: \${recipe.titleEn}\`);
      updated++;
    } catch (error) {
      console.error(\`✗ Error updating \${recipe.id}:\`, error.message);
      errors++;
    }
  }
  
  console.log(\`\\n=== Summary ===\`);
  console.log(\`Updated: \${updated}\`);
  console.log(\`Errors: \${errors}\`);
  console.log(\`Total: \${recipes.length}\`);
})();
`;

// Save the script to a file
fs.writeFileSync(path.join(__dirname, 'update-titles-browser.js'), updateScript);

console.log('Created update-titles-browser.js');
console.log('To use this script:');
console.log('1. Open your app in the browser');
console.log('2. Open the browser console');
console.log('3. Paste the contents of update-titles-browser.js');
console.log('4. The script will update all recipe titles in Firebase Firestore');
