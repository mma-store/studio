/**
 * @fileOverview Cloudinary upload utility with client-side image optimization and transformation helpers.
 */

const CLOUD_NAME = 'dgnao6qwq';
const UPLOAD_PRESET = 'MMA-store';

/**
 * Retries a function multiple times before failing.
 */
async function retryFetch<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryFetch(fn, retries - 1, delay * 2);
  }
}

/**
 * Compresses and resizes an image before uploading using Canvas API.
 * This saves bandwidth and speeds up the upload process.
 */
async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob || file),
          'image/jpeg',
          0.8 // Quality factor (0.0 to 1.0)
        );
      };
    };
  });
}

/**
 * Uploads a file to Cloudinary with retry logic.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const isImage = file.type.startsWith('image/');
  const fileToUpload = isImage ? await optimizeImage(file) : file;

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', UPLOAD_PRESET);

  const uploadAction = async () => {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Failed to upload to Cloudinary');
    const data = await response.json();
    return data.secure_url;
  };

  return retryFetch(uploadAction);
}

/**
 * Generates an optimized Cloudinary URL with transformations.
 * f_auto: best format (WebP/AVIF)
 * q_auto: best compression
 * w, h, c: resizing and cropping
 */
export function getOptimizedUrl(url: string, options: { width?: number; height?: number; crop?: string; thumbnail?: boolean } = {}) {
  if (!url || !url.includes('cloudinary')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  let transformations = 'f_auto,q_auto';
  
  if (options.thumbnail) {
    transformations += ',w_300,h_300,c_thumb,g_auto';
  } else {
    if (options.width) transformations += `,w_${options.width}`;
    if (options.height) transformations += `,h_${options.height}`;
    if (options.crop) transformations += `,c_${options.crop}`;
  }

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}
