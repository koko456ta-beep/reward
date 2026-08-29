export interface CompressionResult {
  file: File | Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

/**
 * Compresses an image file on the client-side using HTML5 Canvas.
 * Ensures text in certificates remains sharp and legible while saving bandwidth and Drive storage.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1280,
  maxHeight: number = 1280,
  quality: number = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // If file is PDF, return as is
    if (file.type === 'application/pdf') {
      const originalSize = file.size;
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          file,
          dataUrl: e.target?.result as string || '',
          originalSize,
          compressedSize: originalSize,
          reductionPercentage: 0,
          width: 0,
          height: 0
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        // Draw with high quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Standardize output to high-compression JPEG
        const outputMime = 'image/jpeg';
        let outputQuality = quality;
        let dataUrl = canvas.toDataURL(outputMime, outputQuality);

        // If still large (>300KB), reduce quality slightly to guarantee fits inside Firestore limit and localStorage
        if (dataUrl.length > 400000) {
          outputQuality = 0.65;
          dataUrl = canvas.toDataURL(outputMime, outputQuality);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression blob creation failed'));
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: outputMime,
              lastModified: Date.now()
            });

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const reduction = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize,
              compressedSize,
              reductionPercentage: reduction,
              width,
              height
            });
          },
          outputMime,
          outputQuality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Format bytes to readable string (e.g. 1.25 MB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
