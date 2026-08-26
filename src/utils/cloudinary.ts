export async function uploadImage(file: File, folder: string = 'banners'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function uploadVideo(file: File, folder: string = 'videos'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');
    formData.append('folder', folder);
    formData.append('resource_type', 'video');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
}

export async function uploadToGitHub(file: File, filename: string): Promise<string> {
  try {
    const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER || 'visionadee-cmyk';
    const repoName = import.meta.env.VITE_GITHUB_REPO_NAME || 'hawainn-khabaru';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    
    if (!token) {
      throw new Error('GitHub token not configured');
    }

    const content = await fileToBase64(file);
    const path = `public/videos/${filename}`;
    
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload video: ${filename}`,
          content: content,
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Return the raw GitHub URL
    return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/master/${path}`;
  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    throw error;
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${import.meta.env.VITE_CLOUDINARY_API_SECRET}`;
    
    // Simple signature generation (for production, use proper crypto library)
    const signature = await generateSignature(signatureString);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          signature: signature,
          api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
          timestamp: timestamp,
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

async function generateSignature(stringToSign: string): Promise<string> {
  // Simple SHA-256 implementation for browser
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function uploadToImgur(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'file');

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${import.meta.env.VITE_IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.data.error || 'Failed to upload to Imgur');
    }

    return data.data.link;
  } catch (error) {
    console.error('Error uploading to Imgur:', error);
    throw error;
  }
}

export async function uploadVideoToImgur(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('type', 'file');

    const response = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${import.meta.env.VITE_IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.data.error || 'Failed to upload video to Imgur');
    }

    return data.data.link;
  } catch (error) {
    console.error('Error uploading video to Imgur:', error);
    throw error;
  }
}

export async function uploadToImgBB(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Use GET request with base64 data (ImgBB supports this)
    const apiUrl = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}&image=${encodeURIComponent(base64)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    const data = await response.json();
    
    console.log('ImgBB response:', data);
    
    if (!response.ok || data.success === false) {
      const errorMessage = data.error?.message || data.error || 'Failed to upload to ImgBB';
      throw new Error(errorMessage);
    }

    if (!data.data || !data.data.url) {
      throw new Error('Invalid response from ImgBB: missing URL');
    }

    return data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
}
