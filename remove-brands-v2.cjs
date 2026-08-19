const fs = require('fs');
const path = require('path');

// Read the recipes file
const recipesPath = path.join(__dirname, 'src/data/lonumedhu-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

// Function to remove everything in parentheses from Dhivehi titles
function removeParenthesesDhivehi(title) {
  let simplified = title;
  
  // Remove everything in parentheses
  simplified = simplified.replace(/\s*\(.*?\)/g, '');
  
  // Remove extra spaces
  simplified = simplified.replace(/\s+/g, ' ').trim();
  
  return simplified;
}

// Function to remove everything in parentheses from English titles
function removeParenthesesEnglish(title) {
  let simplified = title;
  
  // Remove everything in parentheses
  simplified = simplified.replace(/\s*\(.*?\)/g, '');
  
  // Remove extra spaces
  simplified = simplified.replace(/\s+/g, ' ').trim();
  
  return simplified;
}

// Process each recipe
recipes.forEach((recipe, index) => {
  const originalDv = recipe.titleDv;
  const originalEn = recipe.titleEn;
  
  recipe.titleDv = removeParenthesesDhivehi(originalDv);
  recipe.titleEn = removeParenthesesEnglish(originalEn);
  
  if (originalDv !== recipe.titleDv || originalEn !== recipe.titleEn) {
    console.log(`${index + 1}. ${originalDv} → ${recipe.titleDv}`);
    console.log(`   ${originalEn} → ${recipe.titleEn}`);
  }
});

// Write back to file
fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2), 'utf8');

console.log(`\n✓ Updated ${recipes.length} recipe titles (removed all parenthetical brand info)`);
