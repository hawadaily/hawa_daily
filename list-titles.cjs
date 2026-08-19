const fs = require('fs');
const path = require('path');

const recipesPath = path.join(__dirname, 'src/data/lonumedhu-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

recipes.forEach((recipe, index) => {
  console.log(`${index + 1}. ${recipe.titleDv}`);
  console.log(`   ${recipe.titleEn}`);
  console.log('');
});
