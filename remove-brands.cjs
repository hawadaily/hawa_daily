const fs = require('fs');
const path = require('path');

// Read the recipes file
const recipesPath = path.join(__dirname, 'src/data/lonumedhu-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

// Brand names to remove (with variations)
const brands = [
  'Saji',
  'Milgro',
  'Chaokoh',
  'Ambassador',
  'Real Thai',
  'Lactal',
  'Bruggeman',
  'Hafifa',
  'Sunar Pure',
  'Domo',
  'Manchery Munchy',
  'Munchee Sun',
  'Loajehi',
  'Zeeba Premium'
];

// Function to remove brand names from Dhivehi titles
function removeBrandsDhivehi(title) {
  let simplified = title;
  
  // Remove brand names in parentheses
  simplified = simplified.replace(/\s*\(ސާޖި[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(މިލްގްރޯ\)/g, '');
  simplified = simplified.replace(/\s*\(ރިއަލް ތައި ކޮކޮނަޓް[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(އެމްބެސެޑަރ[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(ލެކްޓަލް[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(ބްރުގްމޭން[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(ހަފީފާ[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(ސޫނާރ[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(ޑޯމޯ[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(މަންޗީ[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(ޒީބާ[^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(ލޯޖެހި[^)]*\)/g, '');
  
  // Remove extra spaces
  simplified = simplified.replace(/\s+/g, ' ').trim();
  
  return simplified;
}

// Function to remove brand names from English titles
function removeBrandsEnglish(title) {
  let simplified = title;
  
  // Remove brand names in parentheses
  brands.forEach(brand => {
    const regex = new RegExp(`\\s*\\(${brand.replace(/ /g, '[^ ]*')}[^)]*\\)`, 'gi');
    simplified = simplified.replace(regex, '');
  });
  
  // Also remove common patterns
  simplified = simplified.replace(/\s*\(with [^)]*\)/g, '');
  simplified = simplified.replace(/\s*\(Sunflower Oil\)/gi, '');
  simplified = simplified.replace(/\s*\(Baking Powder\)/gi, '');
  simplified = simplified.replace(/\s*\(Basmati Rice\)/gi, '');
  simplified = simplified.replace(/\s*\(Stock\)/gi, '');
  simplified = simplified.replace(/\s*\(Havaadhu\)/gi, '');
  
  // Remove extra spaces
  simplified = simplified.replace(/\s+/g, ' ').trim();
  
  return simplified;
}

// Process each recipe
recipes.forEach((recipe, index) => {
  const originalDv = recipe.titleDv;
  const originalEn = recipe.titleEn;
  
  recipe.titleDv = removeBrandsDhivehi(originalDv);
  recipe.titleEn = removeBrandsEnglish(originalEn);
  
  if (originalDv !== recipe.titleDv || originalEn !== recipe.titleEn) {
    console.log(`${index + 1}. ${originalDv} → ${recipe.titleDv}`);
    console.log(`   ${originalEn} → ${recipe.titleEn}`);
  }
});

// Write back to file
fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2), 'utf8');

console.log(`\n✓ Updated ${recipes.length} recipe titles (removed brand names)`);
