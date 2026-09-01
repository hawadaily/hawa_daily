import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ImgBB API key
const IMGBB_API_KEY = 'b04d60ef0b393280b5b1a1460a609bda';

const sourceDir = path.join(__dirname, 'src', 'data', 'Cloudinary_Compressed');

async function fileToBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return file.toString('base64');
}

async function uploadToImgBB(filePath, fileName) {
  try {
    const base64 = await fileToBase64(filePath);
    
    const formData = new FormData();
    formData.append('image', base64);
    formData.append('name', fileName); // Use original filename

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();

    if (data.success === false) {
      return {
        success: false,
        error: data.error?.message || 'Failed to upload to ImgBB'
      };
    }

    return {
      success: true,
      url: data.data.url,
      deleteUrl: data.data.delete_url,
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
  console.log(`Using ImgBB API\n`);
  
  let successCount = 0;
  let failCount = 0;
  const uploadedUrls = [];

  for (const file of imageFiles) {
    const filePath = path.join(sourceDir, file);
    
    console.log(`Uploading: ${file}`);
    const result = await uploadToImgBB(filePath, file);
    
    if (result.success) {
      console.log(`  ✓ Success: ${result.url}`);
      console.log(`  Size: ${result.originalSize}`);
      uploadedUrls.push({
        fileName: file,
        url: result.url,
        deleteUrl: result.deleteUrl
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
  const urlsFile = path.join(__dirname, 'src', 'data', 'imgbb-uploaded-urls.json');
  fs.writeFileSync(urlsFile, JSON.stringify(uploadedUrls, null, 2));
  console.log(`Uploaded URLs saved to: ${urlsFile}`);
}

uploadAllImages().catch(console.error);
