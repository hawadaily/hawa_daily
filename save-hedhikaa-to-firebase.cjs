const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');

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
const db = getFirestore(app);

async function saveRecipes() {
  const recipes = JSON.parse(fs.readFileSync('e:\\Rettey\\hawainn-khabaru\\src\\data\\hedhikaa-recipes.json', 'utf8'));
  
  for (const recipe of recipes) {
    try {
      await setDoc(doc(db, 'recipes', recipe.id), recipe);
      console.log(`Saved: ${recipe.titleDv} (${recipe.id})`);
    } catch (error) {
      console.error(`Error saving ${recipe.id}:`, error.message);
    }
  }
  
  console.log(`Saved ${recipes.length} recipes to Firebase`);
}

saveRecipes();
