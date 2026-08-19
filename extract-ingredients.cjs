const fs = require('fs');
const path = require('path');

// Read all recipe JSON files
const lonumedhuRecipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/lonumedhu-recipes.json'), 'utf8'));
const hedhikaaRecipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/hedhikaa-recipes.json'), 'utf8'));
const nadiyaskitchenRecipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/nadiyaskitchen-recipes.json'), 'utf8'));

// Combine all recipes
const allRecipes = [...lonumedhuRecipes, ...hedhikaaRecipes, ...nadiyaskitchenRecipes];

// Extract all unique ingredients
const ingredientsDv = new Set();
const ingredientsEn = new Set();

allRecipes.forEach(recipe => {
  if (recipe.ingredients && recipe.ingredients.dv) {
    recipe.ingredients.dv.forEach(ing => {
      // Extract key ingredient words (remove quantities and measurements)
      const cleanIng = ing
        .replace(/\d+[\s\u00A0]*(ގްރާމް|މޭޒުމަތީ|ސައިސަމުސާ|ޖޯޑު|ލީޓަރ|ކަޕް|އިންޗި|ރިޓް|ކާފޫރު)/g, '')
        .replace(/\d+[\s\u00A0]*(g|kg|ml|l|cup|tablespoon|teaspoon|clove|slice|piece|liter|inch)/gi, '')
        .replace(/[()]/g, '')
        .trim();
      if (cleanIng && cleanIng.length > 0) {
        ingredientsDv.add(cleanIng);
      }
    });
  }
  
  if (recipe.ingredients && recipe.ingredients.en) {
    recipe.ingredients.en.forEach(ing => {
      // Extract key ingredient words (remove quantities and measurements)
      const cleanIng = ing
        .replace(/\d+[\s\u00A0]*(g|kg|ml|l|cup|tablespoon|teaspoon|clove|slice|piece|liter|inch)/gi, '')
        .replace(/[()]/g, '')
        .trim();
      if (cleanIng && cleanIng.length > 0) {
        ingredientsEn.add(cleanIng);
      }
    });
  }
});

// Count ingredient occurrences
const ingredientCountsDv = {};
const ingredientCountsEn = {};

allRecipes.forEach(recipe => {
  if (recipe.ingredients && recipe.ingredients.dv) {
    recipe.ingredients.dv.forEach(ing => {
      const cleanIng = ing
        .replace(/\d+[\s\u00A0]*(ގްރާމް|މޭޒުމަތީ|ސައިސަމުސާ|ޖޯޑު|ލީޓަރ|ކަޕް|އިންޗި|ރިޓް|ކާފޫރު)/g, '')
        .replace(/[()]/g, '')
        .trim();
      if (cleanIng && cleanIng.length > 0) {
        ingredientCountsDv[cleanIng] = (ingredientCountsDv[cleanIng] || 0) + 1;
      }
    });
  }
  
  if (recipe.ingredients && recipe.ingredients.en) {
    recipe.ingredients.en.forEach(ing => {
      const cleanIng = ing
        .replace(/\d+[\s\u00A0]*(g|kg|ml|l|cup|tablespoon|teaspoon|clove|slice|piece|liter|inch)/gi, '')
        .replace(/[()]/g, '')
        .trim();
      if (cleanIng && cleanIng.length > 0) {
        ingredientCountsEn[cleanIng] = (ingredientCountsEn[cleanIng] || 0) + 1;
      }
    });
  }
});

// Sort by occurrence count
const sortedDv = Object.entries(ingredientCountsDv)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20); // Top 20

const sortedEn = Object.entries(ingredientCountsEn)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20); // Top 20

console.log('Top 20 Dhivehi Ingredients:');
console.log(sortedDv.map(([ing, count]) => `${ing}: ${count}`).join('\n'));

console.log('\nTop 20 English Ingredients:');
console.log(sortedEn.map(([ing, count]) => `${ing}: ${count}`).join('\n'));

// Save to file
const ingredientData = {
  dv: sortedDv.map(([ing]) => ing),
  en: sortedEn.map(([ing]) => ing)
};

fs.writeFileSync(
  path.join(__dirname, 'src/data/common-ingredients.json'),
  JSON.stringify(ingredientData, null, 2),
  'utf8'
);

console.log('\nSaved to src/data/common-ingredients.json');
