const https = require('https');
const fs = require('fs');

const recipeUrls = [
  'https://hedhikaa.com/kulhi-boakibaa/',
  'https://hedhikaa.com/havaadhulee-bis/',
  'https://hedhikaa.com/keemiyaa/',
  'https://hedhikaa.com/suji/',
  'https://hedhikaa.com/saagu-bondibai/',
  'https://hedhikaa.com/zileybi/',
  'https://hedhikaa.com/kulhi-mas/',
  'https://hedhikaa.com/caramel-pudding/',
  'https://hedhikaa.com/chili-paste/',
  'https://hedhikaa.com/saagu-kandhi/',
  'https://hedhikaa.com/bis-riha/',
  'https://hedhikaa.com/riha-folhi/',
  'https://hedhikaa.com/bajiyaa/',
  'https://hedhikaa.com/bis-keemiyaa/',
  'https://hedhikaa.com/fried-rice-tharukaaree/',
  'https://hedhikaa.com/anbu-lassi/',
  'https://hedhikaa.com/mas-bai/',
  'https://hedhikaa.com/banbukeyo-riha/',
  'https://hedhikaa.com/aluvi-riha/',
  'https://hedhikaa.com/paan-pudding/',
  'https://hedhikaa.com/gabulhi-boakibaa/',
  'https://hedhikaa.com/lonumirus/',
  'https://hedhikaa.com/theluli-banbukeyo/',
  'https://hedhikaa.com/rihaakuru-folhi/'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRecipe(html, url) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const titleDv = titleMatch ? titleMatch[1].trim() : '';
  
  const titleEnMatch = html.match(/<title>([^<]+) -/);
  const titleEn = titleEnMatch ? titleEnMatch[1].trim() : titleDv;
  
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const image = imageMatch ? imageMatch[1] : '/images/placeholder.jpg';
  
  // Extract cook time - try multiple patterns
  let cookTime = '30 މިނިޓް';
  const timeMatch1 = html.match(/ވަގުތު: ([^<\n]+)/);
  if (timeMatch1) {
    cookTime = timeMatch1[1].trim().replace(/<[^>]+>/g, '').trim();
  } else {
    const timeMatch2 = html.match(/wprm-recipe-total_time[^>]*>([^<]+)/);
    if (timeMatch2) {
      cookTime = timeMatch2[1].trim();
    }
  }
  
  // Extract ingredients from wprm structure
  const ingredientsDv = [];
  const ingredientItems = html.match(/<li[^>]*class="[^"]*wprm-recipe-ingredient[^"]*"[^>]*>([\s\S]*?)<\/li>/g);
  if (ingredientItems) {
    ingredientItems.forEach(item => {
      const textMatch = item.match(/<span[^>]*class="[^"]*wprm-recipe-ingredient-name[^"]*"[^>]*>([^<]+)<\/span>/);
      if (textMatch) {
        ingredientsDv.push(textMatch[1].trim());
      }
    });
  }
  
  // If no ingredients found, try alternative pattern
  if (ingredientsDv.length === 0) {
    const altIngredients = html.match(/- ▢ ([^<\n]+)/g);
    if (altIngredients) {
      altIngredients.forEach(line => {
        const match = line.match(/- ▢ (.+)/);
        if (match) ingredientsDv.push(match[1].trim());
      });
    }
  }
  
  // Extract instructions from wprm structure
  const instructionsDv = [];
  const instructionItems = html.match(/<li[^>]*class="[^"]*wprm-recipe-instruction[^"]*"[^>]*>([\s\S]*?)<\/li>/g);
  if (instructionItems) {
    instructionItems.forEach(item => {
      // Try multiple patterns for instruction text
      let text = '';
      const textMatch1 = item.match(/<span[^>]*class="[^"]*wprm-recipe-instruction-text[^"]*"[^>]*>([\s\S]*?)<\/span>/);
      if (textMatch1) {
        text = textMatch1[1].replace(/<[^>]+>/g, '').trim();
      } else {
        const textMatch2 = item.match(/<div[^>]*class="[^"]*wprm-recipe-instruction-text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
        if (textMatch2) {
          text = textMatch2[1].replace(/<[^>]+>/g, '').trim();
        } else {
          // Try to get any text content
          text = item.replace(/<[^>]+>/g, '').trim();
        }
      }
      if (text && text.length > 5) {
        instructionsDv.push(text);
      }
    });
  }
  
  // If no instructions found, try markdown pattern
  if (instructionsDv.length === 0) {
    const instructionsSection = html.match(/### ހަދާނެގޮތް([\s\S]*?)(?=###|ނޯޓް|©|$)/);
    if (instructionsSection) {
      const lines = instructionsSection[1].split('\n');
      lines.forEach(line => {
        const match = line.match(/- (.+)/);
        if (match && !match[1].includes('▢')) {
          instructionsDv.push(match[1].trim());
        }
      });
    }
  }
  
  let category = 'ކުޅިކާ ތަކެތި';
  if (url.includes('bis') || url.includes('bondibai') || url.includes('zileybi') || url.includes('pudding') || url.includes('suji') || url.includes('paan')) {
    category = 'ފޮނިކާ ތަކެތި';
  } else if (url.includes('lassi') || url.includes('bai')) {
    category = 'ބޭނުކުރާ ތަކެތި';
  } else if (url.includes('mas') || url.includes('kulhi')) {
    category = 'ހެދުނުގެ ނާސްތާ';
  } else if (url.includes('paste') || url.includes('folhi')) {
    category = 'ކުދި ކެއުންތަށް';
  }
  
  const id = url.split('/').filter(Boolean).pop().replace(/\/$/, '');
  const recipeId = `Hedhikaa-${id}`;
  
  return {
    id: recipeId,
    titleDv,
    titleEn,
    image,
    category,
    prepTime: '15 މިނިޓް',
    cookTime: cookTime,
    servings: '4 މީހުންނަށް ކެވޭވަރަށެވެ',
    ingredients: {
      dv: ingredientsDv,
      en: ingredientsDv.map(ing => ing)
    },
    instructions: {
      dv: instructionsDv.join('\n'),
      en: instructionsDv.join('\n')
    }
  };
}

async function main() {
  const recipes = [];
  
  for (const url of recipeUrls) {
    try {
      console.log(`Fetching: ${url}`);
      const html = await fetchUrl(url);
      const recipe = parseRecipe(html, url);
      recipes.push(recipe);
      console.log(`Parsed: ${recipe.titleDv}`);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }
  
  fs.writeFileSync(
    'e:\\Rettey\\hawainn-khabaru\\src\\data\\hedhikaa-recipes.json',
    JSON.stringify(recipes, null, 2)
  );
  
  console.log(`Saved ${recipes.length} recipes to hedhikaa-recipes.json`);
}

main();
