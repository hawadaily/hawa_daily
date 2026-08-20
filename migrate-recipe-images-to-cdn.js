import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ImgBB API key (you'll need to provide this)
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';

async function uploadToImgBB(imagePath) {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(`ImgBB upload failed: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error);
    throw error;
  }
}

async function migrateRecipeImages() {
  const imagesDir = path.join(__dirname, 'public/images');
  const files = fs.readdirSync(imagesDir);
  
  const migrationResults = [];
  
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const imagePath = path.join(imagesDir, file);
      const fileName = file.replace(/\.(jpg|jpeg)$/i, '');
      
      console.log(`Uploading ${file} to ImgBB...`);
      
      try {
        const cdnUrl = await uploadToImgBB(imagePath);
        migrationResults.push({
          fileName: fileName,
          localPath: `/images/${file}`,
          cdnUrl: cdnUrl
        });
        console.log(`✓ ${file} -> ${cdnUrl}`);
      } catch (error) {
        console.error(`✗ Failed to upload ${file}:`, error.message);
        migrationResults.push({
          fileName: fileName,
          localPath: `/images/${file}`,
          cdnUrl: null,
          error: error.message
        });
      }
      
      // Rate limiting - wait 1 second between uploads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Save migration results
  const resultsPath = path.join(__dirname, 'recipe-image-migration.json');
  fs.writeFileSync(resultsPath, JSON.stringify(migrationResults, null, 2));
  console.log(`\nMigration results saved to ${resultsPath}`);
  
  const successCount = migrationResults.filter(r => r.cdnUrl).length;
  const failCount = migrationResults.filter(r => !r.cdnUrl).length;
  
  console.log(`\nSummary: ${successCount} successful, ${failCount} failed`);
}

migrateRecipeImages().catch(console.error);
