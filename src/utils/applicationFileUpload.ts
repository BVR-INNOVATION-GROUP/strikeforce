/**
 * Application File Upload Utility
 * Handles uploading application attachment files (CVs, portfolios, etc.) to Cloudinary
 * Returns Cloudinary URLs that should be saved to the backend
 */

import { uploadMultipleToCloudinary } from "./cloudinaryUpload";

/**
 * Upload application attachment files to Cloudinary
 * @param files - Array of File objects to upload
 * @returns Promise<string[]> - Array of Cloudinary URLs
 * @throws Error if upload fails
 */
export async function uploadApplicationFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    // Upload files to Cloudinary
    const urls = await uploadMultipleToCloudinary(files, {
      folder: "strikeforce/applications",
      resourceType: "auto", // Auto-detect file type
    });

    return urls;
  } catch (error) {
    console.error("Error uploading application files to Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload files. Please try again.");
  }
}




