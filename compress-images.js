import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compressImage(inputPath, outputPath, quality = 80) {
  try {
    await sharp(inputPath)
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);
    console.log(`Compressed: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error compressing ${inputPath}:`, error);
  }
}

async function main() {
  // Compress HAWA LOGO.jpg
  const logoPath = path.join(__dirname, 'public/HAWA LOGO.jpg');
  const logoCompressed = path.join(__dirname, 'public/HAWA LOGO-compressed.jpg');
  
  if (fs.existsSync(logoPath)) {
    await compressImage(logoPath, logoCompressed, 70);
    
    // Replace original with compressed
    fs.unlinkSync(logoPath);
    fs.renameSync(logoCompressed, logoPath);
    console.log('Replaced original HAWA LOGO.jpg with compressed version');
  }
  
  // Compress all recipe images
  const imagesDir = path.join(__dirname, 'public/images');
  const files = fs.readdirSync(imagesDir);
  
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const inputPath = path.join(imagesDir, file);
      const compressedPath = path.join(imagesDir, `${file.replace(/\.(jpg|jpeg)$/i, '')}-compressed.jpg`);
      
      await compressImage(inputPath, compressedPath, 75);
      
      // Replace original with compressed
      fs.unlinkSync(inputPath);
      fs.renameSync(compressedPath, inputPath);
    }
  }
  
  console.log('All images compressed successfully');
}

main().catch(console.error);
