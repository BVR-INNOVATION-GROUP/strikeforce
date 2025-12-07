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

  // Add transformation if specified
  if (transformation) {
    formData.append("transformation", JSON.stringify(transformation));
  }

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
    return result.secure_url || result.url;
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

  if (maxWidth || maxHeight) {
    transformation.width = maxWidth;
    transformation.height = maxHeight;
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

