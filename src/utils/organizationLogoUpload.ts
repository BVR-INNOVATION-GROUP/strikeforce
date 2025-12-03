/**
 * Organization Logo Upload Utility
 * Handles uploading organization logo files to the backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Upload organization logo to the backend
 * @param file - File object to upload
 * @returns Promise<string> - Logo path returned from the server
 * @throws Error if upload fails
 */
export async function uploadOrganizationLogo(file: File): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed");
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit");
  }

  try {
    // Get auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Create FormData with logo file
    const formData = new FormData();
    formData.append("logo", file);

    // Upload file to backend API
    const response = await fetch(`${BACKEND_URL}/api/v1/org/upload-logo`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.msg || `Upload failed: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // Backend returns {msg, data} format
    const data = result.data || result;
    return data.logo || data.path || "";
  } catch (error) {
    console.error("Error uploading organization logo:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload logo. Please try again.");
  }
}





