/**
 * Project File Upload Utility
 * Handles uploading project attachment files to Cloudinary
 * Returns Cloudinary URLs that should be saved to the backend
 *
 * Uses Cloudinary like profile pictures, but WITHOUT compression/optimization
 * to preserve original file quality for attachments
 */

import { uploadToCloudinary } from "./cloudinaryUpload";

/**
 * Upload project attachment files to Cloudinary
 * @param files - Array of File objects to upload
 * @param projectId - Optional project ID for folder organization
 * @returns Promise<string[]> - Array of Cloudinary URLs
 * @throws Error if upload fails
 */
export async function uploadProjectFiles(
  files: File[],
  projectId?: string | number
): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  // Validate files
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  for (const file of files) {
    if (file.size > maxSizeBytes) {
      throw new Error(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
    }
  }

  try {
    // Determine folder path (similar to profile pictures pattern)
    // Profile pictures: strikeforce/profiles/{userId}
    // Project files: strikeforce/projects/{projectId}
    const folder = projectId
      ? `strikeforce/projects/${projectId}`
      : "strikeforce/projects";

    // Upload files to Cloudinary WITHOUT compression/optimization
    // Using uploadToCloudinary directly (not uploadOptimizedImage) to preserve original quality
    // This follows the same pattern as profilePictureUpload but without compression
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, {
        folder,
        resourceType: "auto", // Auto-detect file type (image, video, raw)
        // No transformation/compression - preserve original file quality
        // Unlike profile pictures which use uploadOptimizedImage with compression
      })
    );

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error uploading project files to Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload files. Please try again.");
  }
}
