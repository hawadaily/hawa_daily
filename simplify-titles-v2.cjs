const fs = require('fs');
const path = require('path');

// Read the recipes file
const recipesPath = path.join(__dirname, 'src/data/lonumedhu-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

// Function to simplify Dhivehi titles - more conservative
function simplifyDhivehiTitle(title) {
  // Only remove very specific redundant phrases
  let simplified = title
    .replace(/ޗީޒީ ލޯޑެޑް/g, 'ޗީޒީ') // "Cheesy Loaded" → "Cheesy"
    .replace(/ޗީޒް ލޯޑި/g, 'ޗީޒް')
    .replace(/ޗަންކީ ޗޮކް/g, 'ޗަންކީ') // "Chunky Choc" → "Chunky"
    .replace(/ފެންކީ ކްރިސްޕީ/g, 'ކްރިސްޕީ') // "Funky Crispy" → "Crispy"
    .replace(/ސްވީޓް ޕޮޓޭޓޯ ފްރައިޒް/g, 'ސްވީޓް ޕޮޓޭޓޯ') // "Sweet Potato Fries" → "Sweet Potato"
    .replace(/ޗީޒް ކްރެކަރ ކެސަރޯލް/g, 'ކްރެކަރ ކެސަރޯލް') // "Cheese Cracker" → "Cracker"
    .replace(/ޗީޒީ ޓޫނާ/g, 'ޓޫނާ') // "Cheesy Tuna" → "Tuna"
    .replace(/ޗީޒީ ގާލިކް/g, 'ގާލިކް') // "Cheesy Garlic" → "Garlic"
    .replace(/ޗިކަން ސުޕްރީމް/g, 'ޗިކަން') // "Chicken Supreme" → "Chicken"
    .replace(/ޗިކަން ސަބްމެރީން/g, 'ޗިކަން') // "Chicken Submarine" → "Chicken"
    .replace(/ޗިކަން ޕާސްޓާ/g, 'ޗިކަން ޕާސްޓާ') // Keep this
    .replace(/ޗިކަން ރެޕް/g, 'ޗިކަން ރެޕް') // Keep this
    .replace(/ޗިކަން ވިތް/g, 'ޗިކަން') // "Chicken with" → "Chicken"
    .replace(/ޗިކަން ބާގަރ/g, 'ޗިކަން ބާގަރ') // Keep this
    .replace(/ޗިކަން ޕޮޕް/g, 'ޗިކަން ޕޮޕް') // Keep this
    .replace(/ޗިކަން ޕަޑް/g, 'ޗިކަން ޕަޑް') // Keep this
    .replace(/ބޭކްޑް ހަނީ މަސްޓަޑް/g, 'ހަނީ މަސްޓަޑް ޗިކަން') // "Baked Honey Mustard Chicken" → "Honey Mustard Chicken"
    .replace(/ބޭކްޑް ހަލަޕީނިޔޯ/g, 'ހަލަޕީނިޔޯ') // "Baked Jalapeno" → "Jalapeno"
    .replace(/ބޭކްޑް މެކް އެންޑް ޗީޒް/g, 'މެކް އެންޑް ޗީޒް') // "Baked Mac and Cheese" → "Mac and Cheese"
    .replace(/ބަޓަރނަޓް އެންޑް ޗިކަން/g, 'ބަޓަރނަޓް ޗިކަން ޕާސްޓާ') // "Butternut and Chicken Pasta" → "Butternut Chicken Pasta"
    .replace(/ތައި ޗިކަން ވިތް/g, 'ތައި ޗިކަން') // "Thai Chicken with" → "Thai Chicken"
    .replace(/އީޒީ ޗިކަން/g, 'ޗިކަން') // "Easy Chicken" → "Chicken"
    .replace(/އީޒީ ތަންދޫރީ/g, 'ތަންދޫރީ') // "Easy Tandoori" → "Tandoori"
    .replace(/ޕެރީ ޕެރީ ޗިކަން/g, 'ޕެރީ ޕެރީ ޗިކަން') // Keep this
    .replace(/ޕެރީ ޕެރީ/g, 'ޕެރީ ޕެރީ') // Keep this
    .replace(/ސްޕައިސީ ފްރައިޑް ޗިކަން/g, 'ފްރައިޑް ޗިކަން') // "Spicy Fried Chicken" → "Fried Chicken"
    .replace(/ސްޕައިސީ ޗިލީ/g, 'ސްޕައިސީ ޗިލީ') // Keep this
    .replace(/ކްރީމީ ބްލޫ ޗީޒް/g, 'ކްރީމީ ބްލޫ ޗީޒް') // Keep this
    .replace(/ތަރުކާރީ ރިހަ/g, 'ތަރުކާރީ ރިހަ') // Keep this
    .replace(/ޓިރަމިސޫ ފްރެންޗް ޓޯސްޓް/g, 'ޓިރަމިސޫ ޓޯސްޓް') // "Tiramisu French Toast" → "Tiramisu Toast"
    .replace(/މެރީ މީ ޗިކަން/g, 'މެރީ މީ ޗިކަން') // Keep this
    .replace(/މާޗާ ޓިރަމިސޫ/g, 'މާޗާ ޓިރަމިސޫ') // Keep this
    .replace(/އައިމީ ބީފް/g, 'އައިމީ ބީފް') // Keep this
    .replace(/ތައި ރެޑް ކަރީ ފްރައިޑް/g, 'ތައި ރެޑް ފްރައިޑް ރައިސް') // "Thai Red Curry Fried Rice" → "Thai Red Fried Rice"
    .replace(/ޝާން ސްޕައިސީ ޑްރައި/g, 'ޝާން ސްޕައިސީ ޑްރައި') // Keep this
    .replace(/ބްލެކްކަރެންޓް މިލްކްޝޭކް/g, 'ބްލެކްކަރެންޓް މިލްކްޝޭކް') // Keep this
    .replace(/ކަސްޓަޑް ބިސްކަޓް ޕުޑިންގް/g, 'ކަސްޓަޑް ބިސްކަޓް ޕުޑިންގް') // Keep this
    .replace(/ބަޓަރސްކޮޗް އައިސްކްރީމް ކޭކު/g, 'ބަޓަރސްކޮޗް އައިސްކްރީމް ކޭކު') // Keep this
    .replace(/އޯވަނައިޓް އ�ޓްސް/g, 'އޯވަނައިޓް އ�ޓްސް') // Keep this
    .replace(/ކެޝޫ ކެރެޓް ރައިސް/g, 'ކެޝޫ ކެރެޓް ރައިސް') // Keep this
    .replace(/އެލޯ ވީރާ ސްޓްރޯބެރީ ލެމަނޭޑް/g, 'އެލޯ ވީރާ ލެމަނޭޑް') // "Aloe Vera Strawberry Lemonade" → "Aloe Vera Lemonade"
    .replace(/ހުނި ބަތް/g, 'ހުނި ބަތް') // Keep this
    .replace(/ހަނާކުރި ބޯވަ/g, 'ހަނާކުރި ބޯވަ') // Keep this
    .replace(/ހަނާކުރި މަސްދަޅު/g, 'ހަނާކުރި މަސްދަޅު') // Keep this
    .replace(/ތެޔޮ މިރުސް ބަތް/g, 'ތެޔޮ މިރުސް ބަތް') // Keep this
    .replace(/ގެރިކިރު ބަނަސް/g, 'ގެރިކިރު ބަނަސް') // Keep this
    .replace(/މުރު މުރު/g, 'މުރު މުރު') // Keep this
    .replace(/ސަބްމެރީން ބަނަސް/g, 'ސަބްމެރީން ބަނަސް') // Keep this
    .replace(/ސްލޮޕީ ޖޯ/g, 'ސްލޮޕީ ޖޯ') // Keep this
    .replace(/ޕަކޯރާ/g, 'ޕަކޯރާ') // Keep this
    .replace(/ކޮކޮނަޓް ވޯޓަރ މޮހީޓޯ/g, 'ކޮކޮނަޓް މޮހީޓޯ') // "Coconut Water Mojito" → "Coconut Mojito"
    .replace(/މާރީ ބިސްކިޓް ޑިލައިޓް/g, 'މާރީ ބިސްކިޓް ޑިލައިޓް') // Keep this
    .replace(/ސްމޯރސް ބަރސް/g, 'ސްމޯރސް ބަރސް') // Keep this
    .replace(/މޭޝްޑް ޕޮޓޭޓޯސް/g, 'މޭޝްޑް ޕޮޓޭޓޯސް') // Keep this
    .replace(/ސަމްބަލް އަސްލީ ނޫޑްލްސް/g, 'ސަމްބަލް އަސްލީ ނޫޑްލްސް') // Keep this
    .replace(/ތަންދޫރީ ޕިއްޒާ/g, 'ތަންދޫރީ ޕިއްޒާ') // Keep this
    .replace(/ބޭގަލްސް/g, 'ބޭގަލްސް') // Keep this
    .replace(/ނާޗޯސް ކެސަރޯލް/g, 'ނާޗޯސް ކެސަރޯލް') // Keep this
    .replace(/ރައިސް ޕޭޕަރ ޑަމްޕްލިންގްސް/g, 'ރައިސް ޑަމްޕްލިންގްސް') // "Rice Paper Dumplings" → "Dumplings"
    .replace(/ސްޕައިސީ ފްރައިޑް ޗިކަން ޕޮޕްކޯން/g, 'ފްރައިޑް ޗިކަން') // "Spicy Fried Chicken Popcorn" → "Fried Chicken"
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  // If result is too short or empty, keep original
  if (simplified.length < 3) {
    return title;
  }
  
  return simplified;
}

// Function to simplify English titles - more conservative
function simplifyEnglishTitle(title) {
  let simplified = title
    .replace(/Cheesy Loaded/g, 'Cheesy')
    .replace(/Chunky Choc/g, 'Chunky')
    .replace(/Funky Crispy/g, 'Crispy')
    .replace(/Sweet Potato Fries/g, 'Sweet Potato')
    .replace(/Cheese Cracker/g, 'Cracker')
    .replace(/Cheesy Tuna/g, 'Tuna')
    .replace(/Cheesy Garlic/g, 'Garlic')
    .replace(/Chicken Supreme/g, 'Chicken')
    .replace(/Chicken Submarine/g, 'Chicken')
    .replace(/Chicken with/g, 'Chicken')
    .replace(/Baked Honey Mustard Chicken/g, 'Honey Mustard Chicken')
    .replace(/Baked Jalapeno/g, 'Jalapeno')
    .replace(/Baked Mac and Cheese/g, 'Mac and Cheese')
    .replace(/Butternut and Chicken Pasta/g, 'Butternut Chicken Pasta')
    .replace(/Thai Chicken with/g, 'Thai Chicken')
    .replace(/Easy Chicken/g, 'Chicken')
    .replace(/Easy Tandoori/g, 'Tandoori')
    .replace(/Spicy Fried Chicken/g, 'Fried Chicken')
    .replace(/Thai Red Curry Fried Rice/g, 'Thai Red Fried Rice')
    .replace(/Tiramisu French Toast/g, 'Tiramisu Toast')
    .replace(/Aloe Vera Strawberry Lemonade/g, 'Aloe Vera Lemonade')
    .replace(/Coconut Water Mojito/g, 'Coconut Mojito')
    .replace(/Rice Paper Dumplings/g, 'Dumplings')
    .replace(/Spicy Fried Chicken Popcorn/g, 'Fried Chicken')
    .replace(/Baked Mac and Cheese with/g, 'Mac and Cheese with')
    .replace(/Peri Peri Chicken/g, 'Peri Peri Chicken')
    .replace(/Creamy Blue Cheese Pasta/g, 'Creamy Blue Pasta')
    .replace(/Chicken Pad Thai/g, 'Pad Thai')
    .replace(/Cashew Carrot Rice/g, 'Cashew Rice')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  // If result is too short or empty, keep original
  if (simplified.length < 3) {
    return title;
  }
  
  return simplified;
}

// Process each recipe
recipes.forEach((recipe, index) => {
  const originalDv = recipe.titleDv;
  const originalEn = recipe.titleEn;
  
  recipe.titleDv = simplifyDhivehiTitle(originalDv);
  recipe.titleEn = simplifyEnglishTitle(originalEn);
  
  console.log(`${index + 1}. ${originalDv} → ${recipe.titleDv}`);
  console.log(`   ${originalEn} → ${recipe.titleEn}`);
});

// Write back to file
fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2), 'utf8');

console.log(`\n✓ Updated ${recipes.length} recipe titles`);
