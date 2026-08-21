const https = require('https');
const fs = require('fs');

const recipeUrls = [
  'https://www.nadiyaskitchen.com/chicken/chicken-rolls/',
  'https://www.nadiyaskitchen.com/breads/pastry-tray/',
  'https://www.nadiyaskitchen.com/cakes/pineapple-juice-cake/',
  'https://www.nadiyaskitchen.com/maldivian-short-eats/bis-keemiya-egg-pastry/',
  'https://www.nadiyaskitchen.com/uncategorized/egg-hopper-with-chicken-dry-curry/',
  'https://www.nadiyaskitchen.com/cakes/oats-kadhuru-cake/',
  'https://www.nadiyaskitchen.com/tuna/fish-roti/',
  'https://www.nadiyaskitchen.com/puddings/butterscotch-pudding/',
  'https://www.nadiyaskitchen.com/rice/theyomirus-bai-with-roasbis/',
  'https://www.nadiyaskitchen.com/tuna/oates-gulha/'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRecipe(html, url) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const titleDv = titleMatch ? titleMatch[1].trim() : '';
  
  const titleEnMatch = html.match(/<title>([^<]+) –/);
  const titleEn = titleEnMatch ? titleEnMatch[1].trim() : titleDv;
  
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const imageMatch2 = html.match(/<meta property="og:image:url" content="([^"]+)"/);
  const imageMatch3 = html.match(/<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"/);
  const imageMatch4 = html.match(/<img[^>]+src="([^"]+\/wp-content\/uploads\/[^"]+)"/);
  const imageMatch5 = html.match(/<img[^>]+src="([^"]+)"[^>]*class="[^"]*attachment-full[^"]*"/);
  
  let image = '';
  if (imageMatch && !imageMatch[1].includes('logo')) {
    image = imageMatch[1];
  } else if (imageMatch2 && !imageMatch2[1].includes('logo')) {
    image = imageMatch2[1];
  } else if (imageMatch3) {
    image = imageMatch3[1];
  } else if (imageMatch4) {
    image = imageMatch4[1];
  } else if (imageMatch5) {
    image = imageMatch5[1];
  }
  
  console.log(`Recipe: ${titleDv}, Image URL: ${image}`);
  
  // Extract serves, prep time, baking time - strip HTML tags
  const servesMatch = html.match(/Serves: ([^\/]+)/);
  const servings = servesMatch ? servesMatch[1].replace(/<[^>]+>/g, '').trim() : '4 މީހުންނަށް ކެވޭވަރަށެވެ';
  
  const prepTimeMatch = html.match(/Prep time: ([^\/]+)/);
  const prepTime = prepTimeMatch ? prepTimeMatch[1].replace(/<[^>]+>/g, '').trim() : '15 މިނިޓް';
  
  const bakingTimeMatch = html.match(/Baking time: ([^\n]+)/);
  const cookTime = bakingTimeMatch ? bakingTimeMatch[1].replace(/<[^>]+>/g, '').trim() : '30 މިނިޓް';
  
  // Extract ingredients section - try multiple patterns
  const ingredientsSection = html.match(/Ingredients([\s\S]*?)Instructions/);
  const ingredientsDv = [];
  if (ingredientsSection) {
    const text = ingredientsSection[1].replace(/<[^>]+>/g, '\n');
    const lines = text.split('\n');
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine && 
          !cleanLine.includes('Ingredients') && 
          !cleanLine.includes('Instructions') &&
          !cleanLine.startsWith('For') && 
          !cleanLine.startsWith('To') && 
          !cleanLine.startsWith('Serves') &&
          cleanLine.length > 2) {
        // Remove leading numbers/dashes
        const match = cleanLine.match(/^\d+[-\s]*(.+)/);
        if (match) {
          ingredientsDv.push(match[1].trim());
        } else if (!cleanLine.match(/^\d+$/)) {
          ingredientsDv.push(cleanLine);
        }
      }
    });
  }
  
  // Extract instructions section - try multiple patterns
  const instructionsSection = html.match(/Instructions([\s\S]*?)(?=Leave a Reply|$)/);
  const instructionsDv = [];
  if (instructionsSection) {
    const text = instructionsSection[1].replace(/<[^>]+>/g, '\n');
    const lines = text.split('\n');
    let currentInstruction = '';
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      const numberedMatch = cleanLine.match(/^\d+[-\s]+(.+)/);
      
      if (numberedMatch) {
        if (currentInstruction) {
          instructionsDv.push(currentInstruction.trim());
        }
        currentInstruction = numberedMatch[1].trim();
      } else if (cleanLine && !cleanLine.includes('Leave a Reply') && cleanLine.length > 2) {
        currentInstruction += ' ' + cleanLine;
      }
    });
    
    if (currentInstruction) {
      instructionsDv.push(currentInstruction.trim());
    }
  }
  
  // If still no instructions, try to extract all text after Instructions
  if (instructionsDv.length === 0 && instructionsSection) {
    const text = instructionsSection[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 10) {
      instructionsDv.push(text);
    }
  }
  
  let category = 'ކުޅިކާ ތަކެތި';
  if (url.includes('cake') || url.includes('pudding')) {
    category = 'ފޮނިކާ ތަކެތި';
  } else if (url.includes('bread') || url.includes('roti') || url.includes('bai')) {
    category = 'ހެދުނުގެ ނާސްތާ';
  } else if (url.includes('tuna') || url.includes('fish') || url.includes('chicken')) {
    category = 'ކުޅިކާ ތަކެތި';
  }
  
  const id = url.split('/').filter(Boolean).pop().replace(/\/$/, '');
  const recipeId = `NadiyasKitchen-${id}`;
  
  return {
    id: recipeId,
    titleDv,
    titleEn,
    image,
    category,
    prepTime: prepTime,
    cookTime: cookTime,
    servings: servings,
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
    'e:\\Rettey\\hawainn-khabaru\\src\\data\\nadiyaskitchen-recipes.json',
    JSON.stringify(recipes, null, 2)
  );
  
  console.log(`Saved ${recipes.length} recipes to nadiyaskitchen-recipes.json`);
}

main();
