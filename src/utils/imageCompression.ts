/**
 * Image Compression Utility
 * Compresses images to reduce file size before upload
 */

/**
 * Compress an image file to a specified quality
 * @param file - Image file to compress
 * @param quality - Compression quality (0.0 to 1.0, where 0.4 = 40%)
 * @param maxWidth - Optional maximum width (maintains aspect ratio)
 * @param maxHeight - Optional maximum height (maintains aspect ratio)
 * @returns Promise<File> - Compressed image file
 */
export async function compressImage(
  file: File,
  quality: number = 0.4,
  maxWidth?: number,
  maxHeight?: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions if maxWidth/maxHeight specified
        let width = img.width;
        let height = img.height;
        
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            
            // Create a new File from the blob
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: file.type || "image/jpeg",
                lastModified: Date.now(),
              }
            );
            
            resolve(compressedFile);
          },
          file.type || "image/jpeg",
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
}

