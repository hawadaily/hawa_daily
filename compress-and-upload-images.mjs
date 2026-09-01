import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, 'src', 'data', 'Cloudinary_Archive_2026-08-29_12_04_126_Originals');
const outputDir = path.join(__dirname, 'src', 'data', 'Cloudinary_Compressed');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Cloudinary free tier limits: max 10MB per file, recommended < 2MB for web
const MAX_SIZE = 2 * 1024 * 1024; // 2MB target
const MAX_WIDTH = 1920; // Max width for web
const MAX_HEIGHT = 1080; // Max height for web

async function compressImage(inputPath, outputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // Calculate new dimensions maintaining aspect ratio
    let width = metadata.width;
    let height = metadata.height;
    
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    // Compress with quality settings
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    return {
      success: true,
      originalSize: (originalSize / 1024 / 1024).toFixed(2) + ' MB',
      compressedSize: (compressedSize / 1024 / 1024).toFixed(2) + ' MB',
      reduction: reduction + '%'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function processAllImages() {
  const files = fs.readdirSync(sourceDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );
  
  console.log(`Found ${imageFiles.length} images to compress`);
  console.log(`Source: ${sourceDir}`);
  console.log(`Output: ${outputDir}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file);
    
    console.log(`Processing: ${file}`);
    const result = await compressImage(inputPath, outputPath);
    
    if (result.success) {
      console.log(`  ✓ ${result.originalSize} → ${result.compressedSize} (${result.reduction} reduction)`);
      successCount++;
    } else {
      console.log(`  ✗ Failed: ${result.error}`);
      failCount++;
    }
  }
  
  console.log(`\nCompleted: ${successCount} succeeded, ${failCount} failed`);
  console.log(`Compressed images saved to: ${outputDir}`);
}

processAllImages().catch(console.error);
