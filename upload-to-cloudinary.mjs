import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary configuration - you need to set these
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error('Error: Missing Cloudinary configuration');
  console.error('Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET environment variables');
  console.error('Or add them to your .env file');
  process.exit(1);
}

const sourceDir = path.join(__dirname, 'src', 'data', 'Cloudinary_Compressed');

async function uploadToCloudinary(filePath, fileName) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('public_id', fileName.split('.')[0]); // Use filename without extension as public_id
    formData.append('folder', 'hawa_daily'); // Optional: organize in a folder

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message
      };
    }

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      originalSize: (fs.statSync(filePath).size / 1024).toFixed(2) + ' KB'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function uploadAllImages() {
  const files = fs.readdirSync(sourceDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );
  
  console.log(`Found ${imageFiles.length} compressed images to upload`);
  console.log(`Cloudinary Cloud: ${CLOUD_NAME}`);
  console.log(`Upload Preset: ${UPLOAD_PRESET}\n`);
  
  let successCount = 0;
  let failCount = 0;
  const uploadedUrls = [];

  for (const file of imageFiles) {
    const filePath = path.join(sourceDir, file);
    
    console.log(`Uploading: ${file}`);
    const result = await uploadToCloudinary(filePath, file);
    
    if (result.success) {
      console.log(`  ✓ Success: ${result.url}`);
      console.log(`  Public ID: ${result.publicId}`);
      console.log(`  Size: ${result.originalSize}`);
      uploadedUrls.push({
        fileName: file,
        url: result.url,
        publicId: result.publicId
      });
      successCount++;
    } else {
      console.log(`  ✗ Failed: ${result.error}`);
      failCount++;
    }
    console.log('');
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\nCompleted: ${successCount} succeeded, ${failCount} failed`);
  
  // Save uploaded URLs to a file for reference
  const urlsFile = path.join(__dirname, 'src', 'data', 'cloudinary-uploaded-urls.json');
  fs.writeFileSync(urlsFile, JSON.stringify(uploadedUrls, null, 2));
  console.log(`Uploaded URLs saved to: ${urlsFile}`);
}

uploadAllImages().catch(console.error);
