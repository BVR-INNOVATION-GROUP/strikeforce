/**
 * Project File Upload Utility
 * Handles uploading project attachment files to the backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Upload project attachment files to the backend
 * @param files - Array of File objects to upload
 * @returns Promise<string[]> - Array of file paths returned from the server
 * @throws Error if upload fails
 */
export async function uploadProjectFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    // Get auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Create FormData with all files
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Upload files to backend API
    const response = await fetch(`${BACKEND_URL}/api/v1/projects/upload`, {
      method: 'POST',
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
    return data.paths || data.files || [];
  } catch (error) {
    console.error('Error uploading project files:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to upload files. Please try again.');
  }
}

