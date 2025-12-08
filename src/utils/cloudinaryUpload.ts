/**
 * Cloudinary Upload Utility
 * Handles client-side file uploads to Cloudinary
 * Returns Cloudinary URLs that can be saved to the backend
 */

interface CloudinaryUploadOptions {
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  transformation?: any;
  publicId?: string;
}

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset?: string;
  apiKey?: string;
}

/**
 * Get Cloudinary configuration from environment variables
 */
function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Please configure Cloudinary in your environment variables."
    );
  }

  // Upload preset is required for unsigned uploads
  if (!uploadPreset) {
    console.warn(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set. You may need to configure an unsigned upload preset in Cloudinary."
    );
  }

  return {
    cloudName,
    uploadPreset: uploadPreset || undefined,
    apiKey: apiKey || undefined,
  };
}

/**
 * Upload a single file to Cloudinary
 * @param file - File to upload
 * @param options - Upload options (folder, resourceType, etc.)
 * @returns Promise<string> - Cloudinary URL of the uploaded file
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  const config = getCloudinaryConfig();
  const {
    folder = "strikeforce",
    resourceType = "auto",
    transformation,
    publicId,
  } = options;

  // Create FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("cloud_name", config.cloudName);
  
  // Upload preset is required for unsigned uploads
  // If not provided, the upload will fail - user must configure it
  if (config.uploadPreset) {
    formData.append("upload_preset", config.uploadPreset);
  } else {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is required for client-side uploads. Please configure it in your environment variables."
    );
  }

  // Add folder if specified
  if (folder) {
    formData.append("folder", folder);
  }

  // Add resource type
  formData.append("resource_type", resourceType);

  // Note: 'eager' parameter is not allowed with unsigned uploads
  // Transformations will be applied to the URL after upload

  // Add public_id if specified
  if (publicId) {
    formData.append("public_id", publicId);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error?.message ||
        errorData.error ||
        `Upload failed: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result) {
      throw new Error("Invalid response from Cloudinary");
    }
    
    const baseUrl = result.secure_url || result.url;
    
    if (!baseUrl) {
      throw new Error("No URL returned from Cloudinary upload");
    }
    
    // Apply transformations to the URL if specified
    // Since we can't use 'eager' with unsigned uploads, we apply transformations in the URL
    if (transformation && baseUrl && typeof baseUrl === "string") {
      const transformationParts: string[] = [];
      
      if (transformation.width != null && transformation.width !== undefined) {
        transformationParts.push(`w_${transformation.width}`);
      }
      if (transformation.height != null && transformation.height !== undefined) {
        transformationParts.push(`h_${transformation.height}`);
      }
      if (transformation.crop && typeof transformation.crop === "string") {
        transformationParts.push(`c_${transformation.crop}`);
      }
      if (transformation.quality != null && transformation.quality !== undefined) {
        const qualityValue = typeof transformation.quality === "string" 
          ? transformation.quality 
          : String(transformation.quality);
        transformationParts.push(`q_${qualityValue}`);
      }
      if (transformation.fetch_format && typeof transformation.fetch_format === "string") {
        transformationParts.push(`f_${transformation.fetch_format}`);
      }
      
      if (transformationParts.length > 0) {
        // Insert transformation string into Cloudinary URL
        // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
        const transformationString = transformationParts.join(",");
        const urlParts = baseUrl.split("/upload/");
        if (urlParts.length === 2 && urlParts[1]) {
          return `${urlParts[0]}/upload/${transformationString}/${urlParts[1]}`;
        }
      }
    }
    
    return baseUrl;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload file to Cloudinary");
  }
}

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of files to upload
 * @param options - Upload options
 * @returns Promise<string[]> - Array of Cloudinary URLs
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: CloudinaryUploadOptions = {}
): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  // Upload all files in parallel
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file, options)
  );

  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error uploading multiple files to Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload files to Cloudinary");
  }
}

/**
 * Upload an image with optimization settings
 * @param file - Image file to upload
 * @param folder - Cloudinary folder path
 * @param maxWidth - Maximum width for the image
 * @param maxHeight - Maximum height for the image
 * @param quality - Image quality (auto, auto:best, auto:good, auto:eco, auto:low, or 1-100)
 * @returns Promise<string> - Cloudinary URL
 */
export async function uploadOptimizedImage(
  file: File,
  folder: string = "strikeforce",
  maxWidth?: number,
  maxHeight?: number,
  quality: string | number = "auto:good"
): Promise<string> {
  const transformation: any = {
    quality: quality,
    fetch_format: "auto",
  };

  if (maxWidth != null || maxHeight != null) {
    if (maxWidth != null) {
      transformation.width = maxWidth;
    }
    if (maxHeight != null) {
      transformation.height = maxHeight;
    }
    transformation.crop = "limit";
  }

  return uploadToCloudinary(file, {
    folder,
    resourceType: "image",
    transformation,
  });
}

/**
 * Delete a file from Cloudinary (requires signed upload or admin API)
 * Note: This requires backend implementation for security
 * @param publicId - Cloudinary public ID of the file
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // This should be implemented on the backend for security
  // Client-side deletion requires admin API keys which should not be exposed
  console.warn(
    "deleteFromCloudinary should be called from the backend for security"
  );
  throw new Error(
    "File deletion must be handled by the backend for security reasons"
  );
}

