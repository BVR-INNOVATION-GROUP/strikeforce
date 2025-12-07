/**
 * Organization Logo Upload Utility
 * Handles uploading organization logo files to Cloudinary
 * Returns Cloudinary URL that should be saved to the backend
 */

import { uploadOptimizedImage } from "./cloudinaryUpload";

/**
 * Upload organization logo to Cloudinary
 * @param file - File object to upload
 * @param organizationId - Optional organization ID for folder organization
 * @returns Promise<string> - Cloudinary URL of the uploaded logo
 * @throws Error if upload fails
 */
export async function uploadOrganizationLogo(
  file: File,
  organizationId?: string | number
): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
    );
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit");
  }

  try {
    // Determine folder path
    const folder = organizationId
      ? `strikeforce/organizations/${organizationId}/logos`
      : "strikeforce/organizations/logos";

    // Upload to Cloudinary with optimization
    // Max dimensions: 800x800, quality: auto:good for balance between size and quality
    const url = await uploadOptimizedImage(file, folder, 800, 800, "auto:good");

    return url;
  } catch (error) {
    console.error("Error uploading organization logo to Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload logo. Please try again.");
  }
}





