
/**
 * @fileOverview Enhanced Cloudinary utility with client-side compression and validation.
 */

const CLOUD_NAME = 'dgnao6qwq';
const UPLOAD_PRESET = 'MMA-store';

export interface CloudinaryMetadata {
  public_id: string;
  secure_url: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

/**
 * Validates file before upload.
 */
export function validateImage(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WEBP).');
  }
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت.');
  }
}

/**
 * Compresses and resizes an image before uploading using Canvas API.
 * Saves bandwidth and storage costs.
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
          0.75 // Quality factor
        );
      };
    };
  });
}

/**
 * Uploads an image to Cloudinary.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  validateImage(file);
  const optimizedBlob = await optimizeImage(file);

  const formData = new FormData();
  formData.append('file', optimizedBlob);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) throw new Error('فشل الرفع إلى السحابة.');
  const data = await response.json();
  return data.secure_url;
}

/**
 * Generates an optimized Cloudinary URL for UI display.
 */
export function getOptimizedUrl(url: string, options: { width?: number; height?: number; crop?: string; thumbnail?: boolean } = {}) {
  if (!url || !url.includes('cloudinary')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  let transformations = 'f_auto,q_auto';
  
  if (options.thumbnail) {
    transformations += ',w_400,h_400,c_thumb,g_auto';
  } else {
    if (options.width) transformations += `,w_${options.width}`;
    if (options.height) transformations += `,h_${options.height}`;
    if (options.crop) transformations += `,c_${options.crop}`;
  }

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}
