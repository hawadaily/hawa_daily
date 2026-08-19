const fs = require('fs');
const path = require('path');

// Read the recipes file
const recipesPath = path.join(__dirname, 'src/data/lonumedhu-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

// Function to simplify Dhivehi titles
function simplifyDhivehiTitle(title) {
  // Remove common redundant words and phrases
  let simplified = title
    .replace(/ޗީޒީ|ޗީޒް|ޗީޒ/g, '') // Remove "cheese" variations
    .replace(/ލޯޑެޑް|ލޯޑިޑް|ލޯޑި/g, '') // Remove "loaded" variations
    .replace(/ސްވީޓް|ސްވީޓ/g, '') // Remove "sweet" variations
    .replace(/ފްރައިޒް|ފްރައިޒ/g, '') // Remove "fries" variations
    .replace(/ޗަންކީ|ޗަންކް/g, '') // Remove "chunky" variations
    .replace(/މިލްކްޝޭކް|މިލްކްޝޭކ/g, '') // Remove "milkshake" variations
    .replace(/ކްރެކަރ|ކްރެކް/g, '') // Remove "cracker" variations
    .replace(/ކެސަރޯލް|ކެސަރޯލ/g, '') // Remove "casserole" variations
    .replace(/ފެންކީ|ފެންކް/g, '') // Remove "funky" variations
    .replace(/ކްރިސްޕީ|ކްރިސްޕީ/g, '') // Remove "crispy" variations
    .replace(/ޗިކެން|ޗިކް/g, '') // Remove "chicken" variations
    .replace(/ނަގެޓް|ނަގެޓ/g, '') // Remove "nugget" variations
    .replace(/ވެޖެޓަބަލް|ވެޖެޓަބަލ/g, '') // Remove "vegetable" variations
    .replace(/ކޯން|ކޯނ/g, '') // Remove "corn" variations
    .replace(/ސްޕަގެޓީ|ސްޕަގެޓ/g, '') // Remove "spaghetti" variations
    .replace(/ބޮލޮނޭޒް|ބޮލޮނޭޒ/g, '') // Remove "bolognese" variations
    .replace(/ސޯސް|ސޯސ/g, '') // Remove "sauce" variations
    .replace(/ޕާސްޓާ|ޕާސްޓ/g, '') // Remove "pasta" variations
    .replace(/ރިހަ|ކައްކާ/g, '') // Remove "curry/cooking" variations
    .replace(/މިކްސްޑް|މިކްސް/g, '') // Remove "mixed" variations
    .replace(/ސްލައިޑް|ސްލައިޑ/g, '') // Remove "slid" variations
    .replace(/ސެންޑްވިޗް|ސެންޑްވިޗ/g, '') // Remove "sandwich" variations
    .replace(/ޓޯސްޓް|ޓޯސްޓ/g, '') // Remove "toast" variations
    .replace(/އެގް|އެގ/g, '') // Remove "egg" variations
    .replace(/ރޯލް|ރޯލ/g, '') // Remove "roll" variations
    .replace(/ބަރގަރ|ބަރގަ/g, '') // Remove "burger" variations
    .replace(/ޕިޒްޒާ|ޕިޒްޒ/g, '') // Remove "pizza" variations
    .replace(/ސަލަޑް|ސަލަޑ/g, '') // Remove "salad" variations
    .replace(/ސޫޕް|ސޫޕ/g, '') // Remove "soup" variations
    .replace(/އަލުވިގަނޑު|އަލުވިގަނ/g, '') // Remove "topping" variations
    .replace(/ކުޅިކާ|ކުޅިކ/g, '') // Remove "side dish" variations
    .replace(/ކުދި|ކުދ/g, '') // Remove "small" variations
    .replace(/ބޮޑު|ބޮޑ/g, '') // Remove "big" variations
    .replace(/ހޫނު|ހޫނ/g, '') // Remove "hot" variations
    .replace(/މަޑު|މަޑ/g, '') // Remove "soft" variations
    .replace(/ގަދަ|ގަދ/g, '') // Remove "strong" variations
    .replace(/އަރުވާ|އަރުވ/g, '') // Remove "add" variations
    .replace(/އެއްކުރާ|އެއްކުރ/g, '') // Remove "mix" variations
    .replace(/ބޭނުން|ބޭނުނ/g, '') // Remove "use" variations
    .replace(/ހެދުމަށް|ހެދުމަ/g, '') // Remove "for making" variations
    .replace(/ކެއުންތަށް|ކެއުންތަ/g, '') // Remove "for eating" variations
    .replace(/މީހުން|މީހުނ/g, '') // Remove "people" variations
    .replace(/ކެވޭ|ކެވ/g, '') // Remove "eat" variations
    .replace(/ވަރަށް|ވަރަ/g, '') // Remove "amount" variations
    .replace(/މިނެޓް|މިނެޓ/g, '') // Remove "minute" variations
    .replace(/ސައިސަމުސާ|ސައިސަމުސ/g, '') // Remove "teaspoon" variations
    .replace(/މޭޒުމަތީ|މޭޒުމަތ/g, '') // Remove "tablespoon" variations
    .replace(/ޖޯޑު|ޖޯޑ/g, '') // Remove "cup" variations
    .replace(/ގްރާމް|ގްރާމ/g, '') // Remove "gram" variations
    .replace(/އިންޗި|އިންޗ/g, '') // Remove "inch" variations
    .replace(/ފޮތި|ފޮތ/g, '') // Remove "slice" variations
    .replace(/ތައްޔާރު|ތައްޔާރ/g, '') // Remove "prepare" variations
    .replace(/ކުޑަ|ކުޑ/g, '') // Remove "small" variations
    .replace(/ތެއްޔަ|ތެއްޔ/g, '') // Remove "pan" variations
    .replace(/ގިނީ|ގިނ/g, '') // Remove "heat" variations
    .replace(/ހޫނުކޮށް|ހޫނުކޮ/g, '') // Remove "heat up" variations
    .replace(/ދިޔާ|ދިޔ/g, '') // Remove "clear" variations
    .replace(/ކައްކާ|ކައްކ/g, '') // Remove "cook" variations
    .replace(/އެއކޮށް|އެއކޮ/g, '') // Remove "mix" variations
    .replace(/އޮމާން|އޮމާނ/g, '') // Remove "smooth" variations
    .replace(/ވިސްކް|ވިސްކ/g, '') // Remove "whisk" variations
    .replace(/އުނދުން|އުނދުނ/g, '') // Remove "remove" variations
    .replace(/ނިވާ|ނިވ/g, '') // Remove "down" variations
    .replace(/ބަހާ|ބަހ/g, '') // Remove "divide" variations
    .replace(/ބޯތަށް|ބޯތަ/g, '') // Remove "bowl" variations
    .replace(/ހުރި|ހުރ/g, '') // Remove "was" variations
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  // If result is too short, keep original
  if (simplified.length < 3) {
    return title;
  }
  
  return simplified;
}

// Function to simplify English titles
function simplifyEnglishTitle(title) {
  let simplified = title
    .replace(/Cheesy|Cheese/g, '')
    .replace(/Loaded/g, '')
    .replace(/Sweet/g, '')
    .replace(/Potato/g, '')
    .replace(/Fries/g, '')
    .replace(/Chunky/g, '')
    .replace(/Choc/g, '')
    .replace(/Milkshake/g, '')
    .replace(/Cracker/g, '')
    .replace(/Casserole/g, '')
    .replace(/Funky/g, '')
    .replace(/Crispy/g, '')
    .replace(/Chicken/g, '')
    .replace(/Nugget/g, '')
    .replace(/Vegetable/g, '')
    .replace(/Corn/g, '')
    .replace(/Spaghetti/g, '')
    .replace(/Bolognese/g, '')
    .replace(/Sauce/g, '')
    .replace(/Pasta/g, '')
    .replace(/Curry/g, '')
    .replace(/Mixed/g, '')
    .replace(/Slid/g, '')
    .replace(/Sandwich/g, '')
    .replace(/Toast/g, '')
    .replace(/Egg/g, '')
    .replace(/Roll/g, '')
    .replace(/Burger/g, '')
    .replace(/Pizza/g, '')
    .replace(/Salad/g, '')
    .replace(/Soup/g, '')
    .replace(/Topping/g, '')
    .replace(/Side dish/g, '')
    .replace(/Small/g, '')
    .replace(/Big/g, '')
    .replace(/Hot/g, '')
    .replace(/Soft/g, '')
    .replace(/Strong/g, '')
    .replace(/Add/g, '')
    .replace(/Mix/g, '')
    .replace(/Use/g, '')
    .replace(/For making/g, '')
    .replace(/For eating/g, '')
    .replace(/People/g, '')
    .replace(/Eat/g, '')
    .replace(/Amount/g, '')
    .replace(/Minute/g, '')
    .replace(/Teaspoon/g, '')
    .replace(/Tablespoon/g, '')
    .replace(/Cup/g, '')
    .replace(/Gram/g, '')
    .replace(/Inch/g, '')
    .replace(/Slice/g, '')
    .replace(/Prepare/g, '')
    .replace(/Pan/g, '')
    .replace(/Heat/g, '')
    .replace(/Clear/g, '')
    .replace(/Cook/g, '')
    .replace(/Smooth/g, '')
    .replace(/Whisk/g, '')
    .replace(/Remove/g, '')
    .replace(/Down/g, '')
    .replace(/Divide/g, '')
    .replace(/Bowl/g, '')
    .replace(/Was/g, '')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  // If result is too short, keep original
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
