/**
 * Profile Picture Upload Utility
 * Handles uploading user profile pictures to Cloudinary
 * Returns Cloudinary URL that should be saved to the backend
 */

import { uploadOptimizedImage } from "./cloudinaryUpload";

/**
 * Upload profile picture to Cloudinary
 * @param file - Image file to upload
 * @param userId - Optional user ID for folder organization
 * @returns Promise<string> - Cloudinary URL of the uploaded profile picture
 * @throws Error if upload fails
 */
export async function uploadProfilePicture(
  file: File,
  userId?: string | number
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
    const folder = userId
      ? `strikeforce/profiles/${userId}`
      : "strikeforce/profiles";

    // Upload to Cloudinary with optimization
    // Profile pictures: 400x400 square, quality: auto:good
    // Using square crop for consistent profile picture display
    const url = await uploadOptimizedImage(
      file,
      folder,
      400,
      400,
      "auto:good"
    );

    return url;
  } catch (error) {
    console.error("Error uploading profile picture to Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload profile picture. Please try again.");
  }
}










