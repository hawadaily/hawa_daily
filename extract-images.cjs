const fs = require('fs');

function extractImages(jsonFile, outputFile) {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const images = [];
  
  data.forEach(recipe => {
    const imageName = recipe.image.split('/').pop();
    images.push({
      recipeId: recipe.id,
      imageName: imageName,
      sourceUrl: recipe.image.startsWith('http') ? recipe.image : '',
      localPath: recipe.image
    });
  });
  
  fs.writeFileSync(outputFile, JSON.stringify(images, null, 2));
  console.log(`Extracted ${images.length} images to ${outputFile}`);
}

extractImages('e:\\Rettey\\hawainn-khabaru\\src\\data\\lonumedhu-recipes.json', 'e:\\Rettey\\hawainn-khabaru\\src\\data\\lonumedhu-images.json');
extractImages('e:\\Rettey\\hawainn-khabaru\\src\\data\\hedhikaa-recipes.json', 'e:\\Rettey\\hawainn-khabaru\\src\\data\\hedhikaa-images.json');
